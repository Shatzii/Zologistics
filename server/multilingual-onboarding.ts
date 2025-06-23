export interface RegionalMarket {
  id: string;
  name: string;
  language: 'en' | 'es' | 'pt' | 'de';
  currency: string;
  timezone: string;
  regulations: string[];
  marketSize: number; // USD millions
  ghostLoadOpportunity: number; // USD millions
  competitorCount: number;
  entryBarriers: 'low' | 'medium' | 'high';
  priorityScore: number; // 1-100
}

export interface OnboardingFlow {
  sessionId: string;
  region: string;
  language: string;
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  driverProfile: DriverProfile;
  progress: number; // 0-100
  estimatedCompletion: number; // minutes
  regionSpecificRequirements: string[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'form' | 'document_upload' | 'verification' | 'training' | 'compliance';
  required: boolean;
  completed: boolean;
  fields?: FormField[];
  documents?: DocumentRequirement[];
  estimatedTime: number; // minutes
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
  validation?: string;
  placeholder?: string;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number; // MB
  verificationRequired: boolean;
}

export interface DriverProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  experience: {
    cdlClass: string;
    yearsExperience: number;
    specializations: string[];
    preferredRoutes: string[];
    equipment: string[];
  };
  preferences: {
    loadTypes: string[];
    maxDistance: number;
    homeTimeRequirements: string;
    paymentPreference: string;
    language: string;
  };
}

export interface ComplianceRequirement {
  id: string;
  region: string;
  category: 'safety' | 'environmental' | 'tax' | 'labor' | 'transport';
  title: string;
  description: string;
  deadline: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  cost: number;
  documents: string[];
}

export class MultilingualOnboardingEngine {
  private regionalMarkets: Map<string, RegionalMarket> = new Map();
  private onboardingSessions: Map<string, OnboardingFlow> = new Map();
  private complianceRequirements: Map<string, ComplianceRequirement[]> = new Map();

  constructor() {
    this.initializeRegionalMarkets();
    this.initializeOnboardingFlows();
    this.initializeComplianceRequirements();
  }

  private initializeRegionalMarkets() {
    const markets: RegionalMarket[] = [
      {
        id: 'north_america',
        name: 'North America',
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York',
        regulations: ['DOT', 'FMCSA', 'ELD Mandate'],
        marketSize: 875000, // $875B
        ghostLoadOpportunity: 1200, // $1.2B
        competitorCount: 15000,
        entryBarriers: 'high',
        priorityScore: 95
      },
      {
        id: 'central_america',
        name: 'Central America',
        language: 'es',
        currency: 'USD',
        timezone: 'America/Guatemala',
        regulations: ['SIECA', 'Regional Transport Agreement'],
        marketSize: 45000, // $45B
        ghostLoadOpportunity: 180, // $180M
        competitorCount: 800,
        entryBarriers: 'medium',
        priorityScore: 85
      },
      {
        id: 'european_union',
        name: 'European Union',
        language: 'de',
        currency: 'EUR',
        timezone: 'Europe/Berlin',
        regulations: ['EU Transport Regulation', 'Digital Tachograph', 'Mobility Package'],
        marketSize: 420000, // $420B
        ghostLoadOpportunity: 420, // $420M
        competitorCount: 12000,
        entryBarriers: 'high',
        priorityScore: 90
      },
      {
        id: 'brazil',
        name: 'Brazil',
        language: 'pt',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        regulations: ['ANTT', 'CNH Digital', 'MDFe'],
        marketSize: 85000, // $85B
        ghostLoadOpportunity: 95, // $95M
        competitorCount: 2500,
        entryBarriers: 'medium',
        priorityScore: 75
      }
    ];

    markets.forEach(market => {
      this.regionalMarkets.set(market.id, market);
    });
  }

  private initializeOnboardingFlows() {
    // Initialize region-specific onboarding flows
    this.regionalMarkets.forEach((market, regionId) => {
      const baseSteps: OnboardingStep[] = [
        {
          id: 'personal_info',
          title: 'Personal Information',
          description: 'Basic personal and contact information',
          type: 'form',
          required: true,
          completed: false,
          estimatedTime: 5,
          fields: [
            { name: 'firstName', label: 'First Name', type: 'text', required: true },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'phone', required: true }
          ]
        },
        {
          id: 'experience',
          title: 'Experience & Qualifications',
          description: 'Your driving experience and certifications',
          type: 'form',
          required: true,
          completed: false,
          estimatedTime: 10,
          fields: [
            { name: 'cdlClass', label: 'CDL Class', type: 'select', required: true, options: ['A', 'B', 'C'] },
            { name: 'yearsExperience', label: 'Years of Experience', type: 'text', required: true }
          ]
        },
        {
          id: 'documentation',
          title: 'Document Verification',
          description: 'Upload required documents for verification',
          type: 'document_upload',
          required: true,
          completed: false,
          estimatedTime: 15,
          documents: [
            {
              id: 'drivers_license',
              name: 'Driver\'s License',
              description: 'Valid driver\'s license or CDL',
              required: true,
              acceptedFormats: ['jpg', 'png', 'pdf'],
              maxSize: 5,
              verificationRequired: true
            }
          ]
        }
      ];

      // Add region-specific steps
      if (regionId === 'central_america') {
        baseSteps.push({
          id: 'sieca_compliance',
          title: 'SIECA Compliance',
          description: 'Central America transport compliance requirements',
          type: 'compliance',
          required: true,
          completed: false,
          estimatedTime: 20
        });
      }

      if (regionId === 'european_union') {
        baseSteps.push({
          id: 'eu_compliance',
          title: 'EU Transport Compliance',
          description: 'European Union transport regulations and digital tachograph setup',
          type: 'compliance',
          required: true,
          completed: false,
          estimatedTime: 30
        });
      }
    });
  }

  private initializeComplianceRequirements() {
    // Central America compliance requirements
    const centralAmericaCompliance: ComplianceRequirement[] = [
      {
        id: 'sieca_permit',
        region: 'central_america',
        category: 'transport',
        title: 'SIECA Transport Permit',
        description: 'Regional transport permit for Central America operations',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'pending',
        priority: 'high',
        cost: 500,
        documents: ['passport', 'vehicle_registration', 'insurance_certificate']
      },
      {
        id: 'guatemala_transit',
        region: 'central_america',
        category: 'transport',
        title: 'Guatemala Transit Authorization',
        description: 'Special authorization for Guatemala transit operations',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        status: 'pending',
        priority: 'medium',
        cost: 200,
        documents: ['route_plan', 'cargo_manifest']
      }
    ];

    // European Union compliance requirements
    const euCompliance: ComplianceRequirement[] = [
      {
        id: 'eu_transport_license',
        region: 'european_union',
        category: 'transport',
        title: 'EU Transport License',
        description: 'European Union transport operator license',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: 'pending',
        priority: 'critical',
        cost: 2500,
        documents: ['company_registration', 'financial_proof', 'insurance_certificate']
      },
      {
        id: 'digital_tachograph',
        region: 'european_union',
        category: 'safety',
        title: 'Digital Tachograph Setup',
        description: 'Install and configure digital tachograph system',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: 'pending',
        priority: 'high',
        cost: 800,
        documents: ['vehicle_registration', 'driver_card']
      }
    ];

    this.complianceRequirements.set('central_america', centralAmericaCompliance);
    this.complianceRequirements.set('european_union', euCompliance);
  }

  public getSupportedRegions(): RegionalMarket[] {
    return Array.from(this.regionalMarkets.values());
  }

  public getRegionalMarket(regionId: string): RegionalMarket | undefined {
    return this.regionalMarkets.get(regionId);
  }

  public async startOnboarding(regionId: string, language: string, driverProfile: Partial<DriverProfile>): Promise<OnboardingFlow> {
    const sessionId = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const region = this.regionalMarkets.get(regionId);
    
    if (!region) {
      throw new Error(`Unsupported region: ${regionId}`);
    }

    const steps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to TruckFlow AI',
        description: `Welcome to the ${region.name} market`,
        type: 'form',
        required: true,
        completed: false,
        estimatedTime: 2
      },
      {
        id: 'personal_info',
        title: 'Personal Information',
        description: 'Basic personal and contact information',
        type: 'form',
        required: true,
        completed: false,
        estimatedTime: 5
      },
      {
        id: 'experience',
        title: 'Experience & Qualifications',
        description: 'Your driving experience and certifications',
        type: 'form',
        required: true,
        completed: false,
        estimatedTime: 10
      },
      {
        id: 'preferences',
        title: 'Load Preferences',
        description: 'Configure your load and route preferences',
        type: 'form',
        required: true,
        completed: false,
        estimatedTime: 8
      },
      {
        id: 'documentation',
        title: 'Document Verification',
        description: 'Upload required documents for verification',
        type: 'document_upload',
        required: true,
        completed: false,
        estimatedTime: 15
      }
    ];

    // Add region-specific compliance steps
    if (regionId === 'central_america') {
      steps.push({
        id: 'sieca_compliance',
        title: 'SIECA Compliance',
        description: 'Central America transport compliance requirements',
        type: 'compliance',
        required: true,
        completed: false,
        estimatedTime: 20
      });
    }

    if (regionId === 'european_union') {
      steps.push({
        id: 'eu_compliance',
        title: 'EU Transport Compliance',
        description: 'European Union transport regulations',
        type: 'compliance',
        required: true,
        completed: false,
        estimatedTime: 30
      });
    }

    const onboardingFlow: OnboardingFlow = {
      sessionId,
      region: regionId,
      language,
      currentStep: 0,
      totalSteps: steps.length,
      steps,
      driverProfile: driverProfile as DriverProfile,
      progress: 0,
      estimatedCompletion: steps.reduce((total, step) => total + step.estimatedTime, 0),
      regionSpecificRequirements: this.getRegionSpecificRequirements(regionId)
    };

    this.onboardingSessions.set(sessionId, onboardingFlow);
    return onboardingFlow;
  }

  public async getOnboardingProgress(sessionId: string): Promise<OnboardingFlow | null> {
    return this.onboardingSessions.get(sessionId) || null;
  }

  public async updateOnboardingStep(sessionId: string, stepId: string, data: any): Promise<OnboardingFlow> {
    const flow = this.onboardingSessions.get(sessionId);
    if (!flow) {
      throw new Error('Onboarding session not found');
    }

    const stepIndex = flow.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) {
      throw new Error('Onboarding step not found');
    }

    // Mark step as completed
    flow.steps[stepIndex].completed = true;
    
    // Update progress
    const completedSteps = flow.steps.filter(step => step.completed).length;
    flow.progress = Math.round((completedSteps / flow.totalSteps) * 100);
    
    // Move to next step if current step is completed
    if (stepIndex === flow.currentStep) {
      flow.currentStep = Math.min(stepIndex + 1, flow.totalSteps - 1);
    }

    this.onboardingSessions.set(sessionId, flow);
    return flow;
  }

  private getRegionSpecificRequirements(regionId: string): string[] {
    const requirements: { [key: string]: string[] } = {
      'north_america': [
        'Valid CDL with required endorsements',
        'DOT medical certificate',
        'Clean driving record (3 years)',
        'Background check clearance'
      ],
      'central_america': [
        'Valid international driving permit',
        'SIECA transport authorization',
        'Passport with minimum 6 months validity',
        'Regional insurance coverage',
        'Spanish language proficiency (basic)'
      ],
      'european_union': [
        'EU transport operator license',
        'Digital tachograph compliance',
        'ADR certification (if handling dangerous goods)',
        'Working time directive compliance',
        'Local language proficiency (basic)'
      ],
      'brazil': [
        'CNH (Brazilian driver\'s license)',
        'ANTT registration',
        'MDFe system integration',
        'Portuguese language proficiency',
        'Local tax registration'
      ]
    };

    return requirements[regionId] || [];
  }

  public getRegionalGhostLoadOpportunities(): { [regionId: string]: number } {
    const opportunities: { [regionId: string]: number } = {};
    
    this.regionalMarkets.forEach((market, regionId) => {
      opportunities[regionId] = market.ghostLoadOpportunity;
    });

    return opportunities;
  }

  public calculateRegionalROI(regionId: string, investmentAmount: number): {
    monthlyRevenue: number;
    annualRevenue: number;
    roi: number;
    breakEvenMonths: number;
  } {
    const market = this.regionalMarkets.get(regionId);
    if (!market) {
      throw new Error(`Region not found: ${regionId}`);
    }

    // Conservative estimates based on market size and competition
    const monthlyMarketCapture = market.ghostLoadOpportunity / 12 * 0.05; // 5% market capture
    const monthlyRevenue = monthlyMarketCapture * 0.15; // 15% commission
    const annualRevenue = monthlyRevenue * 12;
    const roi = ((annualRevenue - investmentAmount) / investmentAmount) * 100;
    const breakEvenMonths = investmentAmount / monthlyRevenue;

    return {
      monthlyRevenue,
      annualRevenue,
      roi,
      breakEvenMonths
    };
  }

  public getComplianceRequirements(regionId: string): ComplianceRequirement[] {
    return this.complianceRequirements.get(regionId) || [];
  }

  public getMarketExpansionStrategy(): {
    totalMarketOpportunity: number;
    prioritizedRegions: RegionalMarket[];
    estimatedTimeToMarket: { [regionId: string]: number };
    investmentRequirements: { [regionId: string]: number };
  } {
    const regions = Array.from(this.regionalMarkets.values());
    const totalOpportunity = regions.reduce((total, region) => total + region.ghostLoadOpportunity, 0);
    
    const prioritizedRegions = regions.sort((a, b) => b.priorityScore - a.priorityScore);
    
    const timeToMarket: { [regionId: string]: number } = {
      'north_america': 1, // Already operational
      'central_america': 3, // 3 months
      'european_union': 6, // 6 months (higher regulatory complexity)
      'brazil': 4 // 4 months
    };

    const investmentRequirements: { [regionId: string]: number } = {
      'north_america': 0, // Already invested
      'central_america': 250000, // $250K
      'european_union': 500000, // $500K (higher compliance costs)
      'brazil': 180000 // $180K
    };

    return {
      totalMarketOpportunity: totalOpportunity,
      prioritizedRegions,
      estimatedTimeToMarket: timeToMarket,
      investmentRequirements
    };
  }
}

export const multilingualOnboarding = new MultilingualOnboardingEngine();