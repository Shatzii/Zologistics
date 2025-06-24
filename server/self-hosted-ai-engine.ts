/**
 * Self-Hosted AI Engine for Autonomous Logistics Operations
 * No external API dependencies - fully self-contained intelligence
 */

export interface ProspectAnalysis {
  companyProfile: {
    businessType: 'shipper' | 'carrier' | 'broker' | 'logistics' | 'warehouse' | 'manufacturer';
    companySize: 'small' | 'medium' | 'large' | 'enterprise';
    estimatedRevenue: number;
    painPoints: string[];
    opportunityScore: number;
  };
  contactStrategy: {
    bestApproach: 'email' | 'phone' | 'linkedin' | 'direct_mail';
    messagingAngle: string;
    valueProposition: string;
    expectedResponseRate: number;
  };
  dealPotential: {
    estimatedValue: number;
    closeProbability: number;
    timeToClose: number; // days
    autoSignEligible: boolean;
  };
}

export interface MessageTemplate {
  subject: string;
  body: string;
  followUp: string[];
  personalizedElements: string[];
}

export interface DealEvaluation {
  riskLevel: 'low' | 'medium' | 'high';
  autoApprovalEligible: boolean;
  valueScore: number;
  complianceFlags: string[];
  recommendedAction: 'auto_sign' | 'escalate' | 'reject';
}

export class SelfHostedAIEngine {
  private industryKnowledge: Map<string, any> = new Map();
  private messagingPatterns: Map<string, MessageTemplate[]> = new Map();
  private dealRules: Map<string, any> = new Map();

  constructor() {
    this.initializeIndustryKnowledge();
    this.initializeMessagingPatterns();
    this.initializeDealRules();
  }

  private initializeIndustryKnowledge() {
    // Comprehensive freight industry knowledge base
    this.industryKnowledge.set('shipper_profiles', {
      manufacturing: {
        painPoints: ['JIT delivery reliability', 'cost optimization', 'supply chain visibility'],
        avgShippingSpend: 180000,
        preferredServices: ['dedicated transport', 'expedited delivery', 'temperature control'],
        decisionMakers: ['logistics manager', 'supply chain director', 'operations manager']
      },
      retail: {
        painPoints: ['seasonal capacity', 'last mile delivery', 'inventory management'],
        avgShippingSpend: 320000,
        preferredServices: ['LTL consolidation', 'cross-docking', 'distribution'],
        decisionMakers: ['distribution manager', 'logistics coordinator', 'warehouse manager']
      },
      chemical: {
        painPoints: ['hazmat compliance', 'specialized equipment', 'safety protocols'],
        avgShippingSpend: 450000,
        preferredServices: ['hazmat transport', 'tank transport', 'specialized handling'],
        decisionMakers: ['safety manager', 'transportation director', 'compliance officer']
      },
      automotive: {
        painPoints: ['JIT delivery', 'damage prevention', 'parts sequencing'],
        avgShippingSpend: 680000,
        preferredServices: ['automotive transport', 'sequenced delivery', 'dedicated lanes'],
        decisionMakers: ['logistics manager', 'plant manager', 'supplier coordination']
      }
    });

    this.industryKnowledge.set('carrier_profiles', {
      small_fleet: {
        painPoints: ['load consistency', 'fuel costs', 'driver retention'],
        avgRevenue: 850000,
        needsServices: ['load matching', 'fuel optimization', 'driver support'],
        decisionMakers: ['owner-operator', 'fleet manager', 'dispatch manager']
      },
      medium_fleet: {
        painPoints: ['capacity optimization', 'route efficiency', 'customer acquisition'],
        avgRevenue: 3200000,
        needsServices: ['route optimization', 'customer portal', 'performance analytics'],
        decisionMakers: ['operations director', 'business development', 'fleet manager']
      },
      large_fleet: {
        painPoints: ['technology integration', 'driver shortage', 'regulatory compliance'],
        avgRevenue: 12500000,
        needsServices: ['ELD integration', 'compliance automation', 'driver recruitment'],
        decisionMakers: ['COO', 'technology director', 'VP operations']
      }
    });

    this.industryKnowledge.set('broker_profiles', {
      small_brokerage: {
        painPoints: ['carrier network', 'margin optimization', 'customer retention'],
        avgRevenue: 2100000,
        needsServices: ['carrier vetting', 'rate optimization', 'customer acquisition'],
        decisionMakers: ['owner', 'operations manager', 'sales director']
      },
      large_brokerage: {
        painPoints: ['automation', 'scalability', 'competitive advantage'],
        avgRevenue: 18500000,
        needsServices: ['AI optimization', 'automated matching', 'advanced analytics'],
        decisionMakers: ['CTO', 'VP operations', 'head of technology']
      }
    });
  }

  private initializeMessagingPatterns() {
    // Advanced messaging templates based on business psychology
    this.messagingPatterns.set('shipper_manufacturing', [
      {
        subject: '{companyName} - Ensure JIT delivery reliability + 25% cost savings',
        body: `Hi {contactName},

I've been analyzing manufacturing logistics in {state} and noticed {companyName} could benefit from our AI-powered supply chain optimization.

Manufacturing companies like yours are facing 3 critical challenges:
• JIT delivery reliability (our clients see 99.8% on-time performance)
• Rising transportation costs (we reduce costs by 25% on average)
• Supply chain visibility gaps (real-time tracking + predictive analytics)

Based on your production volume, our platform could save {companyName} approximately ${'{estimatedSavings}'}/month through intelligent route optimization and carrier matching.

Quick question: What's your biggest logistics challenge right now - delivery reliability or cost optimization?

I'd love to show you exactly how we're helping manufacturers like {similarCompany} streamline their operations.

Would you be open to a 15-minute conversation this week?

Best regards,
Marcus Thompson
Senior Logistics Consultant
TruckFlow AI`,
        followUp: [
          'Following up on supply chain optimization opportunity',
          'Manufacturing logistics efficiency - still interested?',
          'Final follow-up: JIT delivery optimization for {companyName}'
        ],
        personalizedElements: ['companyName', 'contactName', 'state', 'estimatedSavings', 'similarCompany']
      }
    ]);

    this.messagingPatterns.set('carrier_small_fleet', [
      {
        subject: '{companyName} - Increase revenue per mile by 23% (verified results)',
        body: `Hi {contactName},

I noticed {companyName} operates in the {state} market. Our AI platform is generating 23% higher revenue per mile for small fleets like yours.

Here's what we're doing for carriers your size:
• Smart load matching (reduce empty miles by 35%)
• Real-time rate optimization (maximize every load)
• Automated paperwork (save 8 hours/week per driver)
• Fuel efficiency tracking (10-15% fuel savings)

Based on your {truckCount}-truck operation, I estimate we could add ${'{monthlyIncrease}'}/month to your revenue.

Quick question: Are you looking to grow your fleet or maximize profits with your current trucks?

I've helped carriers like {similarCarrier} increase their annual revenue by ${'{annualIncrease}'} using our platform.

Would you be open to a brief conversation about increasing your revenue per mile?

Best regards,
Marcus Thompson
Carrier Success Manager
TruckFlow AI`,
        followUp: [
          'Revenue optimization opportunity - still interested?',
          'Helping carriers like {companyName} increase profits',
          'Final follow-up: Revenue per mile optimization'
        ],
        personalizedElements: ['companyName', 'contactName', 'state', 'truckCount', 'monthlyIncrease', 'similarCarrier', 'annualIncrease']
      }
    ]);

    this.messagingPatterns.set('broker_opportunity', [
      {
        subject: '{companyName} - Scale your brokerage without proportional overhead increase',
        body: `Hi {contactName},

I've been researching successful brokerages in {state} and {companyName} caught my attention. Our AI platform is helping brokers increase margins by 18% while scaling operations.

Here's what we're enabling for brokerages:
• Automated load-carrier matching (reduce manual work by 60%)
• Dynamic pricing optimization (maximize margin on every load)
• Carrier network expansion (access to 50K+ verified carriers)
• Customer self-service portal (reduce support calls by 40%)

Based on your current volume, our platform could add approximately ${'{additionalMargin}'}/month in additional margin while handling 3x more loads with the same staff.

Quick question: What's limiting your growth right now - finding capacity or managing operational overhead?

I'd love to show you how brokerages like {similarBroker} scaled from ${'{currentVolume}'} to ${'{scaledVolume}'} monthly loads using our platform.

Would you be interested in a 15-minute conversation about scaling your operations?

Best regards,
Marcus Thompson
Brokerage Growth Specialist
TruckFlow AI`,
        followUp: [
          'Brokerage scaling opportunity - follow up',
          'Margin optimization for {companyName}',
          'Final follow-up: Scaling without overhead increase'
        ],
        personalizedElements: ['companyName', 'contactName', 'state', 'additionalMargin', 'similarBroker', 'currentVolume', 'scaledVolume']
      }
    ]);
  }

  private initializeDealRules() {
    this.dealRules.set('auto_approval_criteria', {
      maxValue: 50000,
      minHotScore: 80,
      requiredCompliance: ['valid_mc_number', 'insurance_verified', 'credit_check_passed'],
      restrictedBusinessTypes: [], // All business types allowed for auto-approval
      riskFactors: {
        new_business: 0.8, // 80% multiplier for new businesses
        poor_credit: 0.3,  // 30% multiplier for poor credit
        compliance_issues: 0.1 // 10% multiplier for compliance problems
      }
    });

    this.dealRules.set('escalation_triggers', {
      highValue: 150000,
      mediumValue: 50000,
      complianceFlags: ['suspended_authority', 'insurance_lapse', 'safety_violations'],
      riskIndicators: ['recent_bankruptcy', 'litigation_pending', 'dot_violations']
    });
  }

  public analyzeProspect(companyData: any): ProspectAnalysis {
    const businessType = this.determineBusinessType(companyData);
    const companySize = this.estimateCompanySize(companyData);
    const industryProfile = this.getIndustryProfile(businessType, companySize);
    
    const painPoints = this.identifyPainPoints(companyData, industryProfile);
    const opportunityScore = this.calculateOpportunityScore(companyData, industryProfile);
    const estimatedRevenue = this.estimateRevenue(companyData, industryProfile);
    
    const contactStrategy = this.determineContactStrategy(companyData, industryProfile);
    const dealPotential = this.evaluateDealPotential(companyData, industryProfile);

    return {
      companyProfile: {
        businessType,
        companySize,
        estimatedRevenue,
        painPoints,
        opportunityScore
      },
      contactStrategy,
      dealPotential
    };
  }

  public generatePersonalizedMessage(prospectData: any, analysis: ProspectAnalysis): MessageTemplate {
    const businessType = analysis.companyProfile.businessType;
    const companySize = analysis.companyProfile.companySize;
    
    const templateKey = `${businessType}_${companySize}`;
    const templates = this.messagingPatterns.get(templateKey) || 
                     this.messagingPatterns.get(businessType) || 
                     this.getDefaultTemplate(businessType);
    
    if (!templates || templates.length === 0) {
      return this.generateFallbackMessage(prospectData, analysis);
    }

    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.personalizeTemplate(template, prospectData, analysis);
  }

  public evaluateDeal(prospectData: any, dealValue: number): DealEvaluation {
    const rules = this.dealRules.get('auto_approval_criteria');
    const escalationTriggers = this.dealRules.get('escalation_triggers');
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let valueScore = this.calculateValueScore(dealValue, prospectData);
    let complianceFlags: string[] = [];
    
    // Evaluate risk factors
    if (dealValue > escalationTriggers.highValue) {
      riskLevel = 'high';
    } else if (dealValue > escalationTriggers.mediumValue) {
      riskLevel = 'medium';
    }
    
    // Check compliance
    complianceFlags = this.checkCompliance(prospectData);
    if (complianceFlags.length > 0) {
      riskLevel = 'high';
    }
    
    // Determine auto-approval eligibility
    const autoApprovalEligible = dealValue <= rules.maxValue && 
                                riskLevel === 'low' && 
                                complianceFlags.length === 0;
    
    const recommendedAction = this.determineRecommendedAction(riskLevel, dealValue, complianceFlags);
    
    return {
      riskLevel,
      autoApprovalEligible,
      valueScore,
      complianceFlags,
      recommendedAction
    };
  }

  private determineBusinessType(companyData: any): 'shipper' | 'carrier' | 'broker' | 'logistics' | 'warehouse' | 'manufacturer' {
    const name = companyData.companyName?.toLowerCase() || '';
    const description = companyData.description?.toLowerCase() || '';
    
    if (name.includes('transport') || name.includes('trucking') || name.includes('carrier') || companyData.mcNumber) {
      return 'carrier';
    }
    if (name.includes('broker') || name.includes('logistics') || description.includes('freight broker')) {
      return 'broker';
    }
    if (name.includes('warehouse') || name.includes('distribution') || name.includes('fulfillment')) {
      return 'warehouse';
    }
    if (name.includes('manufacturing') || name.includes('factory') || name.includes('industrial')) {
      return 'manufacturer';
    }
    if (name.includes('shipping') || description.includes('ship') || description.includes('freight')) {
      return 'shipper';
    }
    
    return 'logistics'; // Default fallback
  }

  private estimateCompanySize(companyData: any): 'small' | 'medium' | 'large' | 'enterprise' {
    const revenue = companyData.estimatedRevenue || 0;
    const employees = companyData.employeeCount || 0;
    const trucks = companyData.truckCount || 0;
    
    if (revenue > 50000000 || employees > 500 || trucks > 100) {
      return 'enterprise';
    }
    if (revenue > 10000000 || employees > 100 || trucks > 25) {
      return 'large';
    }
    if (revenue > 2000000 || employees > 25 || trucks > 5) {
      return 'medium';
    }
    return 'small';
  }

  private getIndustryProfile(businessType: string, companySize: string): any {
    const profiles = this.industryKnowledge.get(`${businessType}_profiles`);
    return profiles?.[companySize] || profiles?.small_fleet || {};
  }

  private identifyPainPoints(companyData: any, industryProfile: any): string[] {
    return industryProfile.painPoints || [
      'operational efficiency',
      'cost optimization',
      'technology integration'
    ];
  }

  private calculateOpportunityScore(companyData: any, industryProfile: any): number {
    let score = 50; // Base score
    
    // Industry fit
    if (industryProfile.avgRevenue) {
      score += 20;
    }
    
    // Company indicators
    if (companyData.growthStage === 'growing') score += 15;
    if (companyData.technologyAdoption === 'early_adopter') score += 10;
    if (companyData.budget === 'available') score += 15;
    
    // Market factors
    if (companyData.location && ['TX', 'CA', 'FL', 'GA', 'IL'].includes(companyData.location)) {
      score += 10; // High-traffic freight states
    }
    
    return Math.min(100, Math.max(0, score));
  }

  private estimateRevenue(companyData: any, industryProfile: any): number {
    if (companyData.estimatedRevenue) {
      return companyData.estimatedRevenue;
    }
    
    return industryProfile.avgRevenue || 1000000;
  }

  private determineContactStrategy(companyData: any, industryProfile: any): any {
    const decisionMakers = industryProfile.decisionMakers || ['manager'];
    const bestApproach = this.selectBestApproach(companyData);
    const messagingAngle = this.selectMessagingAngle(companyData, industryProfile);
    const valueProposition = this.generateValueProposition(companyData, industryProfile);
    
    return {
      bestApproach,
      messagingAngle,
      valueProposition,
      expectedResponseRate: this.calculateResponseRate(companyData, industryProfile)
    };
  }

  private selectBestApproach(companyData: any): 'email' | 'phone' | 'linkedin' | 'direct_mail' {
    // AI logic for selecting best contact method
    if (companyData.preferredContact) {
      return companyData.preferredContact;
    }
    
    // Default to email for B2B logistics
    return 'email';
  }

  private selectMessagingAngle(companyData: any, industryProfile: any): string {
    const painPoints = industryProfile.painPoints || [];
    
    if (painPoints.includes('cost optimization')) {
      return 'cost_reduction';
    }
    if (painPoints.includes('operational efficiency')) {
      return 'efficiency_improvement';
    }
    if (painPoints.includes('technology integration')) {
      return 'digital_transformation';
    }
    
    return 'general_improvement';
  }

  private generateValueProposition(companyData: any, industryProfile: any): string {
    const businessType = companyData.businessType || 'logistics';
    const painPoints = industryProfile.painPoints || [];
    
    const valueProps = {
      cost_reduction: `Reduce operational costs by 25% through AI-powered optimization`,
      efficiency_improvement: `Improve operational efficiency by 40% with automated processes`,
      digital_transformation: `Transform your logistics operations with cutting-edge AI technology`,
      general_improvement: `Optimize your logistics operations for maximum profitability`
    };
    
    const messagingAngle = this.selectMessagingAngle(companyData, industryProfile);
    return valueProps[messagingAngle as keyof typeof valueProps] || valueProps.general_improvement;
  }

  private calculateResponseRate(companyData: any, industryProfile: any): number {
    let baseRate = 0.15; // 15% base response rate
    
    // Industry factors
    if (industryProfile.avgRevenue > 5000000) baseRate += 0.05;
    
    // Company factors
    if (companyData.growthStage === 'growing') baseRate += 0.08;
    if (companyData.painLevel === 'high') baseRate += 0.12;
    
    return Math.min(0.45, baseRate); // Cap at 45%
  }

  private evaluateDealPotential(companyData: any, industryProfile: any): any {
    const estimatedValue = this.calculateDealValue(companyData, industryProfile);
    const closeProbability = this.calculateCloseProbability(companyData, industryProfile);
    const timeToClose = this.estimateTimeToClose(companyData, industryProfile);
    const autoSignEligible = this.checkAutoSignEligibility(estimatedValue, companyData);
    
    return {
      estimatedValue,
      closeProbability,
      timeToClose,
      autoSignEligible
    };
  }

  private calculateDealValue(companyData: any, industryProfile: any): number {
    const baseValue = industryProfile.avgRevenue ? industryProfile.avgRevenue * 0.15 : 50000;
    
    // Adjust based on company factors
    let multiplier = 1.0;
    if (companyData.urgency === 'high') multiplier += 0.3;
    if (companyData.budget === 'large') multiplier += 0.5;
    if (companyData.decisionAuthority === 'high') multiplier += 0.2;
    
    return Math.floor(baseValue * multiplier);
  }

  private calculateCloseProbability(companyData: any, industryProfile: any): number {
    let probability = 0.3; // 30% base
    
    if (companyData.painLevel === 'high') probability += 0.25;
    if (companyData.budget === 'available') probability += 0.20;
    if (companyData.decisionAuthority === 'high') probability += 0.15;
    if (companyData.timeline === 'immediate') probability += 0.10;
    
    return Math.min(0.85, probability);
  }

  private estimateTimeToClose(companyData: any, industryProfile: any): number {
    let baseDays = 45; // 45 days default
    
    if (companyData.urgency === 'high') baseDays -= 15;
    if (companyData.decisionProcess === 'simple') baseDays -= 10;
    if (companyData.companySize === 'small') baseDays -= 15;
    if (companyData.companySize === 'enterprise') baseDays += 30;
    
    return Math.max(7, baseDays);
  }

  private checkAutoSignEligibility(dealValue: number, companyData: any): boolean {
    const rules = this.dealRules.get('auto_approval_criteria');
    
    if (dealValue > rules.maxValue) return false;
    if (companyData.riskLevel === 'high') return false;
    if (companyData.complianceIssues?.length > 0) return false;
    
    return true;
  }

  private personalizeTemplate(template: MessageTemplate, prospectData: any, analysis: ProspectAnalysis): MessageTemplate {
    let personalizedSubject = template.subject;
    let personalizedBody = template.body;
    
    // Replace personalization tokens
    template.personalizedElements.forEach(element => {
      const value = this.getPersonalizationValue(element, prospectData, analysis);
      const token = `{${element}}`;
      
      personalizedSubject = personalizedSubject.replace(new RegExp(token, 'g'), value);
      personalizedBody = personalizedBody.replace(new RegExp(token, 'g'), value);
    });
    
    return {
      ...template,
      subject: personalizedSubject,
      body: personalizedBody
    };
  }

  private getPersonalizationValue(element: string, prospectData: any, analysis: ProspectAnalysis): string {
    switch (element) {
      case 'companyName':
        return prospectData.companyName || 'Your Company';
      case 'contactName':
        return prospectData.contactPerson || 'there';
      case 'state':
        return prospectData.address?.state || 'your area';
      case 'estimatedSavings':
        return Math.floor(analysis.dealPotential.estimatedValue / 12).toLocaleString();
      case 'monthlyIncrease':
        return Math.floor(analysis.dealPotential.estimatedValue / 12).toLocaleString();
      case 'annualIncrease':
        return analysis.dealPotential.estimatedValue.toLocaleString();
      case 'truckCount':
        return prospectData.truckCount?.toString() || '5-10';
      case 'similarCompany':
        return this.getSimilarCompanyName(analysis.companyProfile.businessType);
      case 'similarCarrier':
        return this.getSimilarCarrierName();
      case 'similarBroker':
        return this.getSimilarBrokerName();
      case 'additionalMargin':
        return Math.floor(analysis.dealPotential.estimatedValue / 12).toLocaleString();
      case 'currentVolume':
        return this.estimateCurrentVolume(analysis.companyProfile.companySize);
      case 'scaledVolume':
        return this.estimateScaledVolume(analysis.companyProfile.companySize);
      default:
        return element;
    }
  }

  private getSimilarCompanyName(businessType: string): string {
    const examples = {
      shipper: 'Global Manufacturing Corp',
      carrier: 'Elite Transport Solutions',
      broker: 'Premier Logistics Group',
      manufacturer: 'Advanced Industries Inc',
      warehouse: 'Distribution Partners LLC',
      logistics: 'Supply Chain Solutions'
    };
    
    return examples[businessType as keyof typeof examples] || 'Similar Company';
  }

  private getSimilarCarrierName(): string {
    const carriers = [
      'Regional Transport Co',
      'Highway Express LLC',
      'Mountain Logistics Inc',
      'Interstate Carriers Group'
    ];
    
    return carriers[Math.floor(Math.random() * carriers.length)];
  }

  private getSimilarBrokerName(): string {
    const brokers = [
      'Freight Solutions Partners',
      'Logistics Optimization Group',
      'Transportation Brokers Inc',
      'Supply Chain Brokers LLC'
    ];
    
    return brokers[Math.floor(Math.random() * brokers.length)];
  }

  private estimateCurrentVolume(companySize: string): string {
    const volumes = {
      small: '$500K',
      medium: '$2.5M',
      large: '$8M',
      enterprise: '$25M'
    };
    
    return volumes[companySize as keyof typeof volumes] || '$1M';
  }

  private estimateScaledVolume(companySize: string): string {
    const volumes = {
      small: '$1.5M',
      medium: '$7.5M',
      large: '$24M',
      enterprise: '$75M'
    };
    
    return volumes[companySize as keyof typeof volumes] || '$3M';
  }

  private getDefaultTemplate(businessType: string): MessageTemplate[] {
    return [{
      subject: '{companyName} - Logistics optimization opportunity',
      body: `Hi {contactName},

I came across {companyName} and was impressed by your operations in {state}. Our AI-powered logistics platform is transforming how companies optimize their freight operations.

We're currently helping logistics companies:
• Reduce costs by 20-35%
• Improve efficiency through automation
• Access real-time market intelligence
• Streamline operations with AI

Based on your business profile, I believe we could add significant value to {companyName}.

Would you be open to a brief conversation about your logistics optimization goals?

Best regards,
Marcus Thompson
TruckFlow AI`,
      followUp: [
        'Following up on logistics optimization opportunity',
        'Optimization solutions for {companyName}',
        'Final follow-up: Logistics efficiency improvement'
      ],
      personalizedElements: ['companyName', 'contactName', 'state']
    }];
  }

  private generateFallbackMessage(prospectData: any, analysis: ProspectAnalysis): MessageTemplate {
    return {
      subject: `${prospectData.companyName} - Logistics optimization opportunity`,
      body: `Hi ${prospectData.contactPerson || 'there'},

I came across ${prospectData.companyName} and was impressed by your operations. Our AI-powered logistics platform is helping companies like yours optimize their freight operations.

Based on your business profile, I believe we could help ${prospectData.companyName} reduce costs and improve efficiency.

Would you be interested in a brief conversation?

Best regards,
Marcus Thompson
TruckFlow AI`,
      followUp: ['Following up on our logistics optimization discussion'],
      personalizedElements: []
    };
  }

  private calculateValueScore(dealValue: number, prospectData: any): number {
    let score = Math.min(100, dealValue / 1000); // Base score from deal value
    
    if (prospectData.creditRating === 'excellent') score += 20;
    if (prospectData.paymentHistory === 'prompt') score += 15;
    if (prospectData.businessStability === 'stable') score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private checkCompliance(prospectData: any): string[] {
    const flags: string[] = [];
    
    if (prospectData.mcNumber && !this.validateMCNumber(prospectData.mcNumber)) {
      flags.push('invalid_mc_number');
    }
    
    if (prospectData.insuranceStatus !== 'active') {
      flags.push('insurance_inactive');
    }
    
    if (prospectData.safetyRating === 'unsatisfactory') {
      flags.push('poor_safety_rating');
    }
    
    if (prospectData.creditScore && prospectData.creditScore < 600) {
      flags.push('poor_credit');
    }
    
    return flags;
  }

  private validateMCNumber(mcNumber: string): boolean {
    // Basic MC number validation
    return /^MC-\d{6,7}$/.test(mcNumber);
  }

  private determineRecommendedAction(riskLevel: string, dealValue: number, complianceFlags: string[]): 'auto_sign' | 'escalate' | 'reject' {
    if (complianceFlags.some(flag => ['suspended_authority', 'insurance_lapse'].includes(flag))) {
      return 'reject';
    }
    
    if (riskLevel === 'high' || dealValue > 150000) {
      return 'escalate';
    }
    
    if (riskLevel === 'low' && dealValue <= 50000 && complianceFlags.length === 0) {
      return 'auto_sign';
    }
    
    return 'escalate';
  }
}

export const selfHostedAI = new SelfHostedAIEngine();