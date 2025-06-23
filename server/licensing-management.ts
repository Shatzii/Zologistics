export interface LicenseApplication {
  id: string;
  companyId: number;
  applicationType: 'broker_authority' | 'motor_carrier' | 'freight_forwarder' | 'property_broker';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'active';
  submittedDate?: Date;
  approvalDate?: Date;
  expirationDate?: Date;
  licenseNumber?: string;
  applicationData: {
    // Company Information
    legalBusinessName: string;
    doingBusinessAs?: string;
    businessStructure: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
    einNumber: string;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    mailingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    
    // Contact Information
    primaryContact: {
      name: string;
      title: string;
      phone: string;
      email: string;
    };
    
    // Financial Information
    bondingCompany?: string;
    bondAmount: number;
    insuranceCarrier?: string;
    insuranceAmount: number;
    
    // Operating Information
    operatingStates: string[];
    equipmentTypes: string[];
    estimatedAnnualRevenue: number;
    
    // Key Personnel
    officers: Array<{
      name: string;
      title: string;
      ownershipPercentage: number;
      backgroundCheck: boolean;
    }>;
    
    // Required Documents
    documents: {
      articlesOfIncorporation?: string; // file path
      operatingAgreement?: string;
      financialStatements?: string;
      insuranceCertificate?: string;
      bondCertificate?: string;
      backgroundChecks?: string[];
    };
  };
  requirements: LicenseRequirement[];
  fees: {
    applicationFee: number;
    filingFee: number;
    bondCost: number;
    insuranceCost: number;
    total: number;
  };
  timeline: {
    estimatedProcessingTime: string;
    milestones: Array<{
      step: string;
      description: string;
      estimatedDays: number;
      completed: boolean;
      completedDate?: Date;
    }>;
  };
}

export interface LicenseRequirement {
  id: string;
  category: 'financial' | 'legal' | 'operational' | 'safety';
  requirement: string;
  description: string;
  mandatory: boolean;
  completed: boolean;
  documentRequired: boolean;
  estimatedCost?: number;
  estimatedTime?: string;
  helpText: string;
  dependencies?: string[];
}

export interface LicenseStatus {
  licenseType: string;
  status: 'not_started' | 'in_progress' | 'active' | 'expired' | 'suspended';
  licenseNumber?: string;
  issueDate?: Date;
  expirationDate?: Date;
  renewalRequired?: boolean;
  complianceItems: Array<{
    item: string;
    status: 'compliant' | 'warning' | 'non_compliant';
    dueDate?: Date;
    description: string;
  }>;
}

export class LicensingManagement {
  private applications: Map<string, LicenseApplication> = new Map();
  private licenseStatuses: Map<number, LicenseStatus[]> = new Map();
  private requirements: Map<string, LicenseRequirement[]> = new Map();

  constructor() {
    this.initializeLicensingSystem();
  }

  private initializeLicensingSystem() {
    this.setupLicenseRequirements();
    this.initializeSampleApplications();
    
    // Check for renewal requirements monthly
    setInterval(() => {
      this.checkRenewalRequirements();
    }, 30 * 24 * 60 * 60 * 1000);

    console.log('📋 Licensing management system initialized');
  }

  private setupLicenseRequirements() {
    // Broker Authority Requirements
    const brokerRequirements: LicenseRequirement[] = [
      {
        id: 'broker-bond',
        category: 'financial',
        requirement: '$75,000 Surety Bond',
        description: 'BMC-84 surety bond or BMC-85 trust fund required for broker authority',
        mandatory: true,
        completed: false,
        documentRequired: true,
        estimatedCost: 1500,
        estimatedTime: '1-2 business days',
        helpText: 'Contact a surety bond company. Rates typically 1-3% of bond amount based on credit.',
        dependencies: []
      },
      {
        id: 'broker-insurance',
        category: 'financial',
        requirement: 'Errors & Omissions Insurance',
        description: 'Professional liability insurance covering broker operations',
        mandatory: true,
        completed: false,
        documentRequired: true,
        estimatedCost: 2400,
        estimatedTime: '1 business day',
        helpText: 'Annual policy typically $2,000-3,000 for $1M coverage.',
        dependencies: []
      },
      {
        id: 'broker-experience',
        category: 'operational',
        requirement: 'Transportation Experience',
        description: 'Demonstrate relevant experience in transportation or logistics',
        mandatory: true,
        completed: false,
        documentRequired: true,
        estimatedCost: 0,
        estimatedTime: 'Document preparation',
        helpText: 'Provide resumes, references, or business history showing transportation knowledge.',
        dependencies: []
      },
      {
        id: 'broker-background',
        category: 'legal',
        requirement: 'Background Checks',
        description: 'Criminal background checks for all officers and 10%+ owners',
        mandatory: true,
        completed: false,
        documentRequired: true,
        estimatedCost: 100,
        estimatedTime: '3-5 business days',
        helpText: 'FBI fingerprint background checks required for key personnel.',
        dependencies: []
      },
      {
        id: 'broker-financial',
        category: 'financial',
        requirement: 'Financial Statements',
        description: 'Audited or reviewed financial statements showing financial stability',
        mandatory: true,
        completed: false,
        documentRequired: true,
        estimatedCost: 2000,
        estimatedTime: '2-4 weeks',
        helpText: 'CPA-prepared statements for the last 3 years or startup projections.',
        dependencies: []
      }
    ];

    this.requirements.set('broker_authority', brokerRequirements);

    // Motor Carrier Requirements
    const carrierRequirements: LicenseRequirement[] = [
      {
        id: 'carrier-insurance',
        category: 'financial',
        requirement: 'Commercial Auto Insurance',
        description: 'Minimum $750,000 liability insurance for interstate commerce',
        mandatory: true,
        completed: false,
        documentRequired: true,
        estimatedCost: 8000,
        estimatedTime: '1-2 business days',
        helpText: 'Annual commercial truck insurance. Rates vary by equipment and driving record.',
        dependencies: []
      },
      {
        id: 'carrier-safety',
        category: 'safety',
        requirement: 'Safety Management System',
        description: 'Implement DOT safety management and driver qualification systems',
        mandatory: true,
        completed: false,
        documentRequired: true,
        estimatedCost: 500,
        estimatedTime: '1-2 weeks',
        helpText: 'Safety policies, driver qualification files, and vehicle maintenance records.',
        dependencies: []
      }
    ];

    this.requirements.set('motor_carrier', carrierRequirements);
  }

  private initializeSampleApplications() {
    const sampleApplication: LicenseApplication = {
      id: 'APP-001',
      companyId: 1,
      applicationType: 'broker_authority',
      status: 'draft',
      applicationData: {
        legalBusinessName: '',
        businessStructure: 'llc',
        einNumber: '',
        businessAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        primaryContact: {
          name: '',
          title: '',
          phone: '',
          email: ''
        },
        bondAmount: 75000,
        insuranceAmount: 1000000,
        operatingStates: [],
        equipmentTypes: [],
        estimatedAnnualRevenue: 0,
        officers: [],
        documents: {}
      },
      requirements: this.requirements.get('broker_authority') || [],
      fees: {
        applicationFee: 300,
        filingFee: 0,
        bondCost: 1500,
        insuranceCost: 2400,
        total: 4200
      },
      timeline: {
        estimatedProcessingTime: '3-4 weeks',
        milestones: [
          {
            step: 'Application Submission',
            description: 'Submit complete application with all required documents',
            estimatedDays: 0,
            completed: false
          },
          {
            step: 'Initial Review',
            description: 'FMCSA conducts initial application review',
            estimatedDays: 7,
            completed: false
          },
          {
            step: 'Background Investigation',
            description: 'Background checks and financial review',
            estimatedDays: 14,
            completed: false
          },
          {
            step: 'Final Approval',
            description: 'Authority granted and MC number issued',
            estimatedDays: 21,
            completed: false
          }
        ]
      }
    };

    this.applications.set(sampleApplication.id, sampleApplication);
  }

  public createLicenseApplication(companyId: number, licenseType: LicenseApplication['applicationType']): LicenseApplication {
    const applicationId = `APP-${Date.now()}`;
    const requirements = this.requirements.get(licenseType) || [];
    
    const application: LicenseApplication = {
      id: applicationId,
      companyId,
      applicationType: licenseType,
      status: 'draft',
      applicationData: {
        legalBusinessName: '',
        businessStructure: 'llc',
        einNumber: '',
        businessAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        primaryContact: {
          name: '',
          title: '',
          phone: '',
          email: ''
        },
        bondAmount: licenseType === 'broker_authority' ? 75000 : 0,
        insuranceAmount: licenseType === 'broker_authority' ? 1000000 : 750000,
        operatingStates: [],
        equipmentTypes: [],
        estimatedAnnualRevenue: 0,
        officers: [],
        documents: {}
      },
      requirements: [...requirements],
      fees: this.calculateApplicationFees(licenseType),
      timeline: this.generateTimeline(licenseType)
    };

    this.applications.set(applicationId, application);
    return application;
  }

  private calculateApplicationFees(licenseType: string): LicenseApplication['fees'] {
    switch (licenseType) {
      case 'broker_authority':
        return {
          applicationFee: 300,
          filingFee: 0,
          bondCost: 1500,
          insuranceCost: 2400,
          total: 4200
        };
      case 'motor_carrier':
        return {
          applicationFee: 300,
          filingFee: 0,
          bondCost: 0,
          insuranceCost: 8000,
          total: 8300
        };
      default:
        return {
          applicationFee: 300,
          filingFee: 0,
          bondCost: 0,
          insuranceCost: 0,
          total: 300
        };
    }
  }

  private generateTimeline(licenseType: string): LicenseApplication['timeline'] {
    const baseTimeline = {
      estimatedProcessingTime: '3-4 weeks',
      milestones: [
        {
          step: 'Application Preparation',
          description: 'Gather required documents and complete application',
          estimatedDays: 0,
          completed: false
        },
        {
          step: 'Submission & Initial Review',
          description: 'Submit application and await initial FMCSA review',
          estimatedDays: 7,
          completed: false
        },
        {
          step: 'Background & Financial Review',
          description: 'Background checks and financial verification',
          estimatedDays: 14,
          completed: false
        },
        {
          step: 'Final Approval & Authority Grant',
          description: 'Receive operating authority and license number',
          estimatedDays: 21,
          completed: false
        }
      ]
    };

    return baseTimeline;
  }

  public updateApplication(applicationId: string, updates: Partial<LicenseApplication['applicationData']>): LicenseApplication | null {
    const application = this.applications.get(applicationId);
    if (!application) return null;

    application.applicationData = { ...application.applicationData, ...updates };
    
    // Auto-save progress
    this.checkApplicationCompleteness(application);
    
    return application;
  }

  private checkApplicationCompleteness(application: LicenseApplication): void {
    const data = application.applicationData;
    let completedRequirements = 0;
    
    // Check each requirement completion
    application.requirements.forEach(req => {
      switch (req.id) {
        case 'broker-bond':
          req.completed = !!data.bondingCompany && data.bondAmount >= 75000;
          break;
        case 'broker-insurance':
          req.completed = !!data.insuranceCarrier && data.insuranceAmount >= 1000000;
          break;
        case 'broker-background':
          req.completed = data.officers.every(officer => officer.backgroundCheck);
          break;
        case 'broker-financial':
          req.completed = !!data.documents.financialStatements;
          break;
        default:
          // Check if basic info is completed for other requirements
          req.completed = !!(data.legalBusinessName && data.einNumber && data.primaryContact.name);
      }
      
      if (req.completed) completedRequirements++;
    });

    // Update application status based on completeness
    const completionPercentage = completedRequirements / application.requirements.length;
    if (completionPercentage === 1 && application.status === 'draft') {
      application.status = 'submitted';
      application.submittedDate = new Date();
    }
  }

  public submitApplication(applicationId: string): { success: boolean; message: string } {
    const application = this.applications.get(applicationId);
    if (!application) {
      return { success: false, message: 'Application not found' };
    }

    const incompleteRequirements = application.requirements.filter(req => req.mandatory && !req.completed);
    if (incompleteRequirements.length > 0) {
      return {
        success: false,
        message: `Please complete the following requirements: ${incompleteRequirements.map(r => r.requirement).join(', ')}`
      };
    }

    application.status = 'submitted';
    application.submittedDate = new Date();
    
    // Start processing timeline
    this.startApplicationProcessing(application);

    return { success: true, message: 'Application submitted successfully' };
  }

  private startApplicationProcessing(application: LicenseApplication): void {
    // Simulate processing milestones
    let currentDay = 0;
    
    application.timeline.milestones.forEach((milestone, index) => {
      setTimeout(() => {
        milestone.completed = true;
        milestone.completedDate = new Date();
        
        if (index === application.timeline.milestones.length - 1) {
          // Final approval
          application.status = 'approved';
          application.approvalDate = new Date();
          application.licenseNumber = `MC-${Math.floor(Math.random() * 900000) + 100000}`;
          application.expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        }
      }, currentDay * 24 * 60 * 60 * 1000); // Convert days to milliseconds
      
      currentDay += milestone.estimatedDays;
    });
  }

  public getLicenseApplication(applicationId: string): LicenseApplication | undefined {
    return this.applications.get(applicationId);
  }

  public getCompanyApplications(companyId: number): LicenseApplication[] {
    return Array.from(this.applications.values())
      .filter(app => app.companyId === companyId);
  }

  public getLicenseRequirements(licenseType: string): LicenseRequirement[] {
    return this.requirements.get(licenseType) || [];
  }

  public uploadDocument(applicationId: string, documentType: string, filePath: string): boolean {
    const application = this.applications.get(applicationId);
    if (!application) return false;

    application.applicationData.documents = {
      ...application.applicationData.documents,
      [documentType]: filePath
    };

    // Recheck completeness after document upload
    this.checkApplicationCompleteness(application);
    
    return true;
  }

  public getApplicationProgress(applicationId: string): { percentage: number; completedSteps: number; totalSteps: number } {
    const application = this.applications.get(applicationId);
    if (!application) return { percentage: 0, completedSteps: 0, totalSteps: 0 };

    const completedRequirements = application.requirements.filter(req => req.completed).length;
    const totalRequirements = application.requirements.length;
    const percentage = Math.round((completedRequirements / totalRequirements) * 100);

    return {
      percentage,
      completedSteps: completedRequirements,
      totalSteps: totalRequirements
    };
  }

  private checkRenewalRequirements(): void {
    for (const [companyId, statuses] of this.licenseStatuses) {
      statuses.forEach(status => {
        if (status.expirationDate) {
          const daysUntilExpiration = Math.ceil(
            (status.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          );
          
          if (daysUntilExpiration <= 60 && !status.renewalRequired) {
            status.renewalRequired = true;
            console.log(`📅 Renewal required for ${status.licenseType} - expires in ${daysUntilExpiration} days`);
          }
        }
      });
    }
  }

  public getLicenseStatus(companyId: number): LicenseStatus[] {
    return this.licenseStatuses.get(companyId) || [];
  }

  public getEstimatedCosts(licenseType: string): { breakdown: any; total: number } {
    const requirements = this.requirements.get(licenseType) || [];
    const breakdown = requirements.reduce((acc, req) => {
      if (req.estimatedCost) {
        acc[req.requirement] = req.estimatedCost;
      }
      return acc;
    }, {} as any);

    const total = Object.values(breakdown).reduce((sum: number, cost: any) => sum + cost, 0);
    
    const fees = this.calculateApplicationFees(licenseType);
    breakdown['Application Fee'] = fees.applicationFee;
    
    return {
      breakdown,
      total: total + fees.applicationFee
    };
  }

  public getProcessingTimeline(licenseType: string): string[] {
    const timeline = this.generateTimeline(licenseType);
    return timeline.milestones.map(milestone => 
      `${milestone.step} (Day ${milestone.estimatedDays}): ${milestone.description}`
    );
  }

  public getStatus(): any {
    const applications = Array.from(this.applications.values());
    
    return {
      totalApplications: applications.length,
      draftApplications: applications.filter(app => app.status === 'draft').length,
      submittedApplications: applications.filter(app => app.status === 'submitted').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      availableLicenseTypes: Array.from(this.requirements.keys())
    };
  }
}

export const licensingManagement = new LicensingManagement();