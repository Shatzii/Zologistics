/**
 * Aggressive Customer Acquisition Engine - Surgical Precision Lead Generation
 * Continuously hunts for prospects across all channels with alert system
 * AI auto-signing capability with owner approval workflow
 */

export interface ProspectSource {
  id: string;
  name: string;
  type: 'loadboard' | 'directory' | 'linkedin' | 'trucking_database' | 'government' | 'social_media';
  url: string;
  accessMethod: 'api' | 'scraping' | 'manual';
  updateFrequency: number; // minutes
  lastScanned: Date;
  prospectsFound: number;
  conversionRate: number;
  isActive: boolean;
}

export interface HotProspect {
  id: string;
  companyName: string;
  contactPerson: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  mcNumber?: string;
  dotNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  businessType: 'shipper' | 'carrier' | 'broker' | 'logistics' | 'warehouse' | 'manufacturer';
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  estimatedRevenue: number;
  potentialValue: number;
  urgencyScore: number; // 1-100
  hotScore: number; // 1-100
  source: string;
  discoveredAt: Date;
  contactAttempts: ContactAttempt[];
  status: 'new' | 'contacted' | 'interested' | 'negotiating' | 'agreement_ready' | 'signed' | 'rejected';
  assignedSalesAgent: string;
  nextAction: string;
  nextActionDate: Date;
  autoApprovalEligible: boolean;
}

export interface ContactAttempt {
  id: string;
  method: 'email' | 'phone' | 'linkedin' | 'text' | 'direct_mail';
  timestamp: Date;
  message: string;
  response?: string;
  responseTime?: number; // minutes
  outcome: 'no_response' | 'interested' | 'not_interested' | 'callback_requested' | 'agreement_interest';
  followUpScheduled?: Date;
}

export interface OwnerAlert {
  id: string;
  type: 'agreement_ready' | 'high_value_prospect' | 'urgent_decision' | 'auto_sign_request';
  prospectId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionRequired: string;
  potentialValue: number;
  timeframe: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'auto_executed';
  autoSignEligible: boolean;
  agreementDetails?: {
    type: 'carrier' | 'shipper' | 'broker';
    terms: string;
    commission: number;
    value: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface AutoSignRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    maxValue: number;
    minHotScore: number;
    businessTypes: string[];
    requiresVerification: boolean;
    maxCommission: number;
    minCompanySize: string;
  };
  approvalWorkflow: {
    autoApprove: boolean;
    requiresOwnerApproval: boolean;
    alertBeforeExecution: boolean;
    executionDelay: number; // minutes
  };
  executedCount: number;
  successRate: number;
  totalValue: number;
}

export interface SalesKPI {
  daily: {
    prospectsGenerated: number;
    contactsMade: number;
    responsesReceived: number;
    agreementsRequested: number;
    agreementsSigned: number;
    revenue: number;
  };
  weekly: {
    conversionRate: number;
    averageResponseTime: number;
    hotProspects: number;
    pipelineValue: number;
  };
  monthly: {
    newCustomers: number;
    totalRevenue: number;
    averageDealSize: number;
    customerLifetimeValue: number;
  };
}

export class AggressiveCustomerAcquisition {
  private prospectSources: Map<string, ProspectSource> = new Map();
  private hotProspects: Map<string, HotProspect> = new Map();
  private ownerAlerts: Map<string, OwnerAlert> = new Map();
  private autoSignRules: Map<string, AutoSignRule> = new Map();
  private salesKPIs!: SalesKPI;
  private isHunting: boolean = false;
  private ownerNotificationCallback?: (alert: OwnerAlert) => void;

  constructor() {
    this.initializeProspectSources();
    this.initializeAutoSignRules();
    this.initializeSalesKPIs();
    this.startAggressiveHunting();
    this.startOwnerAlertSystem();
  }

  private initializeProspectSources() {
    const sources: ProspectSource[] = [
      {
        id: 'dat-loadboard',
        name: 'DAT Load Board',
        type: 'loadboard',
        url: 'https://power.dat.com',
        accessMethod: 'api',
        updateFrequency: 15, // Every 15 minutes
        lastScanned: new Date(),
        prospectsFound: 0,
        conversionRate: 0,
        isActive: true
      },
      {
        id: 'truckstop-loadboard',
        name: 'Truckstop.com',
        type: 'loadboard',
        url: 'https://truckstop.com',
        accessMethod: 'api',
        updateFrequency: 20,
        lastScanned: new Date(),
        prospectsFound: 0,
        conversionRate: 0,
        isActive: true
      },
      {
        id: 'fmcsa-database',
        name: 'FMCSA Company Database',
        type: 'government',
        url: 'https://safer.fmcsa.dot.gov',
        accessMethod: 'scraping',
        updateFrequency: 60, // Hourly
        lastScanned: new Date(),
        prospectsFound: 0,
        conversionRate: 0,
        isActive: true
      },
      {
        id: 'linkedin-sales',
        name: 'LinkedIn Sales Navigator',
        type: 'linkedin',
        url: 'https://linkedin.com/sales',
        accessMethod: 'api',
        updateFrequency: 30,
        lastScanned: new Date(),
        prospectsFound: 0,
        conversionRate: 0,
        isActive: true
      },
      {
        id: 'transport-directory',
        name: 'Transport Directory',
        type: 'directory',
        url: 'https://transportdirectory.com',
        accessMethod: 'scraping',
        updateFrequency: 120, // Every 2 hours
        lastScanned: new Date(),
        prospectsFound: 0,
        conversionRate: 0,
        isActive: true
      },
      {
        id: 'trucking-companies-db',
        name: 'National Trucking Database',
        type: 'trucking_database',
        url: 'https://truckingcompanies.com',
        accessMethod: 'api',
        updateFrequency: 45,
        lastScanned: new Date(),
        prospectsFound: 0,
        conversionRate: 0,
        isActive: true
      }
    ];

    sources.forEach(source => this.prospectSources.set(source.id, source));
    console.log('🎯 Aggressive prospect hunting sources initialized');
    console.log(`   📊 ${sources.length} data sources active`);
    console.log('   🔍 Scanning loadboards, LinkedIn, FMCSA, directories');
  }

  private initializeAutoSignRules() {
    const rules: AutoSignRule[] = [
      {
        id: 'low-risk-auto',
        name: 'Low Risk Auto-Sign',
        enabled: true,
        conditions: {
          maxValue: 50000,
          minHotScore: 85,
          businessTypes: ['carrier', 'shipper'],
          requiresVerification: true,
          maxCommission: 15,
          minCompanySize: 'medium'
        },
        approvalWorkflow: {
          autoApprove: true,
          requiresOwnerApproval: false,
          alertBeforeExecution: true,
          executionDelay: 30 // 30 minutes warning
        },
        executedCount: 0,
        successRate: 0,
        totalValue: 0
      },
      {
        id: 'medium-value-alert',
        name: 'Medium Value Alert',
        enabled: true,
        conditions: {
          maxValue: 150000,
          minHotScore: 75,
          businessTypes: ['carrier', 'shipper', 'broker'],
          requiresVerification: true,
          maxCommission: 20,
          minCompanySize: 'small'
        },
        approvalWorkflow: {
          autoApprove: false,
          requiresOwnerApproval: true,
          alertBeforeExecution: true,
          executionDelay: 60
        },
        executedCount: 0,
        successRate: 0,
        totalValue: 0
      },
      {
        id: 'high-value-manual',
        name: 'High Value Manual',
        enabled: true,
        conditions: {
          maxValue: 500000,
          minHotScore: 70,
          businessTypes: ['carrier', 'shipper', 'broker', 'logistics'],
          requiresVerification: true,
          maxCommission: 25,
          minCompanySize: 'small'
        },
        approvalWorkflow: {
          autoApprove: false,
          requiresOwnerApproval: true,
          alertBeforeExecution: true,
          executionDelay: 120
        },
        executedCount: 0,
        successRate: 0,
        totalValue: 0
      }
    ];

    rules.forEach(rule => this.autoSignRules.set(rule.id, rule));
    console.log('🤖 Auto-sign rules configured');
    console.log('   ✅ Low risk deals: Auto-sign under $50K');
    console.log('   ⚠️ Medium deals: Alert for approval');
    console.log('   🚨 High value deals: Manual review required');
  }

  private initializeSalesKPIs() {
    this.salesKPIs = {
      daily: {
        prospectsGenerated: 0,
        contactsMade: 0,
        responsesReceived: 0,
        agreementsRequested: 0,
        agreementsSigned: 0,
        revenue: 0
      },
      weekly: {
        conversionRate: 0,
        averageResponseTime: 0,
        hotProspects: 0,
        pipelineValue: 0
      },
      monthly: {
        newCustomers: 0,
        totalRevenue: 0,
        averageDealSize: 0,
        customerLifetimeValue: 0
      }
    };
  }

  private startAggressiveHunting() {
    this.isHunting = true;
    console.log('🔥 AGGRESSIVE CUSTOMER HUNTING STARTED');
    console.log('   ⚡ Scanning all sources every 5 minutes');
    console.log('   📧 Immediate contact automation active');
    console.log('   🎯 High-value prospect alerts enabled');

    // Scan all sources every 5 minutes
    setInterval(() => this.scanAllSources(), 5 * 60 * 1000);

    // Process hot prospects every 2 minutes
    setInterval(() => this.processHotProspects(), 2 * 60 * 1000);

    // Generate new prospects continuously
    setInterval(() => this.scanAllSources(), 1 * 60 * 1000);

    // Check for auto-sign opportunities every 30 seconds
    setInterval(() => this.checkAutoSignOpportunities(), 30 * 1000);

    // Update KPIs every hour
    setInterval(() => this.updateKPIs(), 60 * 60 * 1000);

    // Initial scan
    this.scanAllSources();
  }

  private startOwnerAlertSystem() {
    console.log('🚨 Owner alert system activated');
    console.log('   📱 Real-time notifications enabled');
    console.log('   ⏰ Auto-sign countdown alerts active');
    console.log('   💰 High-value deal alerts configured');

    // Check for urgent alerts every 30 seconds
    setInterval(() => this.processOwnerAlerts(), 30 * 1000);
  }

  private scanAllSources() {
    console.log('🔍 Scanning all prospect sources...');
    
    for (const [id, source] of this.prospectSources) {
      if (source.isActive) {
        this.scanProspectSource(source);
      }
    }
  }

  private scanProspectSource(source: ProspectSource) {
    // Simulate prospect discovery from various sources
    const newProspects = this.simulateProspectDiscovery(source);
    
    source.lastScanned = new Date();
    source.prospectsFound += newProspects.length;

    newProspects.forEach(prospect => {
      this.hotProspects.set(prospect.id, prospect);
      this.salesKPIs.daily.prospectsGenerated++;
      
      // Immediate contact for hot prospects
      if (prospect.hotScore > 80) {
        this.initiateImmediateContact(prospect);
      }
    });

    if (newProspects.length > 0) {
      console.log(`🎯 Found ${newProspects.length} new prospects from ${source.name}`);
    }
  }

  private simulateProspectDiscovery(source: ProspectSource): HotProspect[] {
    const prospects: HotProspect[] = [];
    const prospectCount = Math.floor(Math.random() * 5) + 1; // 1-5 prospects per scan

    for (let i = 0; i < prospectCount; i++) {
      const prospect = this.generateHotProspect(source);
      prospects.push(prospect);
    }

    return prospects;
  }

  private generateHotProspect(source: ProspectSource): HotProspect {
    const companies = [
      'Express Logistics Corp', 'Premium Transport LLC', 'Global Freight Solutions',
      'Swift Cargo Systems', 'Elite Distribution Inc', 'Reliable Transport Co',
      'Advanced Logistics Group', 'Nationwide Freight LLC', 'Superior Transport Inc',
      'Dynamic Logistics Solutions'
    ];
    
    const contacts = [
      'John Smith', 'Sarah Johnson', 'Michael Davis', 'Emily Wilson',
      'David Brown', 'Jennifer Garcia', 'Robert Miller', 'Lisa Anderson'
    ];

    const titles = [
      'Logistics Manager', 'Transportation Director', 'Operations Manager',
      'Fleet Manager', 'Supply Chain Director', 'Shipping Coordinator'
    ];

    const businessTypes = ['shipper', 'carrier', 'broker', 'logistics', 'warehouse', 'manufacturer'];
    const companySizes = ['small', 'medium', 'large', 'enterprise'];

    const companyName = companies[Math.floor(Math.random() * companies.length)];
    const contactPerson = contacts[Math.floor(Math.random() * contacts.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)] as any;
    const companySize = companySizes[Math.floor(Math.random() * companySizes.length)] as any;

    const baseValue = companySize === 'enterprise' ? 200000 : 
                     companySize === 'large' ? 100000 :
                     companySize === 'medium' ? 50000 : 25000;

    const potentialValue = baseValue + Math.random() * baseValue;
    const urgencyScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const hotScore = Math.floor(Math.random() * 30) + 70; // 70-100

    return {
      id: `prospect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyName,
      contactPerson,
      title,
      email: `${contactPerson.toLowerCase().replace(' ', '.')}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      mcNumber: businessType === 'carrier' ? `MC-${Math.floor(Math.random() * 900000) + 100000}` : undefined,
      dotNumber: businessType === 'carrier' ? `DOT-${Math.floor(Math.random() * 9000000) + 1000000}` : undefined,
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} Industrial Blvd`,
        city: ['Atlanta', 'Dallas', 'Chicago', 'Phoenix', 'Los Angeles'][Math.floor(Math.random() * 5)],
        state: ['GA', 'TX', 'IL', 'AZ', 'CA'][Math.floor(Math.random() * 5)],
        zip: `${Math.floor(Math.random() * 90000) + 10000}`
      },
      businessType,
      companySize,
      estimatedRevenue: potentialValue * 3,
      potentialValue,
      urgencyScore,
      hotScore,
      source: source.id,
      discoveredAt: new Date(),
      contactAttempts: [],
      status: 'new',
      assignedSalesAgent: 'AI Agent Marcus',
      nextAction: 'Send introduction email',
      nextActionDate: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      autoApprovalEligible: potentialValue < 50000 && hotScore > 80
    };
  }

  private initiateImmediateContact(prospect: HotProspect) {
    const contactAttempt: ContactAttempt = {
      id: `contact-${Date.now()}`,
      method: 'email',
      timestamp: new Date(),
      message: this.generatePersonalizedMessage(prospect),
      outcome: 'no_response',
      followUpScheduled: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };

    prospect.contactAttempts.push(contactAttempt);
    prospect.status = 'contacted';
    this.salesKPIs.daily.contactsMade++;

    console.log(`📧 Immediate contact sent to ${prospect.companyName} - ${prospect.contactPerson}`);

    // Simulate response after random delay
    const responseDelay = Math.random() * 4 * 60 * 60 * 1000; // 0-4 hours
    setTimeout(() => {
      this.simulateProspectResponse(prospect, contactAttempt);
    }, Math.min(responseDelay, 30000)); // Cap at 30 seconds for demo
  }

  private generatePersonalizedMessage(prospect: HotProspect): string {
    const messages = {
      carrier: `Hi ${prospect.contactPerson},

I noticed ${prospect.companyName} operates in the ${prospect.address.state} market. Our AI platform is generating 25% higher rates for carriers like yours through intelligent load matching.

Quick question: Are you looking to increase your revenue per mile while reducing empty miles?

We're currently offering priority access to qualified carriers. Based on your ${prospect.companySize} operation, I estimate we could add $${Math.floor(prospect.potentialValue / 12).toLocaleString()}/month to your revenue.

Would you be open to a 15-minute conversation this week?

Best regards,
Marcus Thompson
TruckFlow AI`,

      shipper: `Hi ${prospect.contactPerson},

I've been analyzing shipping patterns in ${prospect.address.city} and noticed ${prospect.companyName} could benefit from our autonomous logistics optimization platform.

We're helping companies like yours reduce shipping costs by 20-35% while improving delivery times.

Quick question: What's your biggest logistics challenge right now?

Based on your operation size, our platform could save you approximately $${Math.floor(prospect.potentialValue / 12).toLocaleString()}/month through intelligent route optimization and carrier matching.

Would you be interested in seeing how this works for your specific shipping needs?

Best regards,
Marcus Thompson
TruckFlow AI`,

      broker: `Hi ${prospect.contactPerson},

I noticed ${prospect.companyName} in the ${prospect.address.state} brokerage market. Our AI platform is helping brokers increase margins by 15-25% through intelligent rate optimization and automated operations.

Quick question: Are you looking to scale your brokerage without proportionally increasing overhead?

Based on your operation, our platform could add approximately $${Math.floor(prospect.potentialValue / 12).toLocaleString()}/month through automated load matching and dynamic pricing.

Would you be open to a brief conversation about scaling your brokerage operations?

Best regards,
Marcus Thompson
TruckFlow AI`,

      default: `Hi ${prospect.contactPerson},

I came across ${prospect.companyName} and was impressed by your ${prospect.address.state} operations. Our AI-powered logistics platform is transforming how companies optimize their freight operations.

We're currently helping logistics companies:
• Reduce costs by 20-35%
• Improve efficiency through automation
• Access real-time market intelligence
• Streamline operations with AI

Based on your business profile, I believe we could add significant value to ${prospect.companyName}.

Would you be open to a brief conversation about your logistics optimization goals?

Best regards,
Marcus Thompson
TruckFlow AI`
    };

    return messages[prospect.businessType as keyof typeof messages] || messages.default;
  }

  private simulateProspectResponse(prospect: HotProspect, contactAttempt: ContactAttempt) {
    const responseRate = 0.25; // 25% response rate
    
    if (Math.random() < responseRate) {
      const responses = [
        "Yes, I'm interested in learning more about reducing our logistics costs.",
        "We're always looking for ways to optimize our operations. Can you schedule a call?",
        "This sounds promising. What kind of savings are we talking about?",
        "I'd like to see a demo of your platform. When can we meet?",
        "We're reviewing our logistics providers. Can you send more information?"
      ];

      contactAttempt.response = responses[Math.floor(Math.random() * responses.length)];
      contactAttempt.responseTime = Math.floor(Math.random() * 240) + 30; // 30-270 minutes
      contactAttempt.outcome = 'interested';
      
      prospect.status = 'interested';
      prospect.hotScore = Math.min(100, prospect.hotScore + 15);
      this.salesKPIs.daily.responsesReceived++;

      console.log(`✅ Positive response from ${prospect.companyName}!`);
      
      // Check if ready for agreement
      if (prospect.hotScore > 85) {
        this.prepareAgreement(prospect);
      }
    }
  }

  private prepareAgreement(prospect: HotProspect) {
    prospect.status = 'agreement_ready';
    prospect.nextAction = 'Generate and send agreement';
    
    const alert: OwnerAlert = {
      id: `alert-${Date.now()}`,
      type: 'agreement_ready',
      prospectId: prospect.id,
      priority: prospect.potentialValue > 100000 ? 'urgent' : 'high',
      title: `Agreement Ready: ${prospect.companyName}`,
      message: `${prospect.companyName} (${prospect.contactPerson}) is ready to sign. Hot score: ${prospect.hotScore}. Potential value: $${prospect.potentialValue.toLocaleString()}`,
      actionRequired: 'Review terms and approve agreement generation',
      potentialValue: prospect.potentialValue,
      timeframe: 'Next 24 hours',
      createdAt: new Date(),
      status: 'pending',
      autoSignEligible: prospect.autoApprovalEligible,
      agreementDetails: {
        type: prospect.businessType === 'carrier' ? 'carrier' : 'shipper',
        terms: 'Standard terms with competitive rates',
        commission: prospect.businessType === 'carrier' ? 12 : 15,
        value: prospect.potentialValue,
        riskLevel: prospect.potentialValue > 100000 ? 'medium' : 'low'
      }
    };

    this.ownerAlerts.set(alert.id, alert);
    this.salesKPIs.daily.agreementsRequested++;

    console.log(`🚨 OWNER ALERT: Agreement ready for ${prospect.companyName} - $${prospect.potentialValue.toLocaleString()}`);
    
    if (this.ownerNotificationCallback) {
      this.ownerNotificationCallback(alert);
    }
  }

  private processHotProspects() {
    const activeProspects = Array.from(this.hotProspects.values())
      .filter(p => ['new', 'contacted', 'interested'].includes(p.status));

    for (const prospect of activeProspects) {
      if (prospect.nextActionDate <= new Date()) {
        this.executeNextAction(prospect);
      }
    }
  }

  private executeNextAction(prospect: HotProspect) {
    switch (prospect.nextAction) {
      case 'Send introduction email':
        this.initiateImmediateContact(prospect);
        break;
      case 'Follow up call':
        this.scheduleFollowUpCall(prospect);
        break;
      case 'Send pricing information':
        this.sendPricingInfo(prospect);
        break;
      case 'Generate and send agreement':
        if (prospect.autoApprovalEligible) {
          this.checkAutoSignEligibility(prospect);
        } else {
          this.escalateToOwner(prospect);
        }
        break;
    }
  }

  private scheduleFollowUpCall(prospect: HotProspect) {
    const contactAttempt: ContactAttempt = {
      id: `call-${Date.now()}`,
      method: 'phone',
      timestamp: new Date(),
      message: `Follow-up call regarding logistics optimization opportunities`,
      outcome: Math.random() > 0.4 ? 'interested' : 'callback_requested'
    };

    prospect.contactAttempts.push(contactAttempt);
    console.log(`📞 Follow-up call scheduled with ${prospect.companyName}`);
  }

  private sendPricingInfo(prospect: HotProspect) {
    console.log(`💰 Pricing information sent to ${prospect.companyName}`);
    prospect.status = 'negotiating';
    prospect.nextAction = 'Generate and send agreement';
    prospect.nextActionDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }

  private checkAutoSignOpportunities() {
    const eligibleProspects = Array.from(this.hotProspects.values())
      .filter(p => p.status === 'agreement_ready' && p.autoApprovalEligible);

    for (const prospect of eligibleProspects) {
      const eligibleRule = this.findMatchingAutoSignRule(prospect);
      if (eligibleRule) {
        this.executeAutoSign(prospect, eligibleRule);
      }
    }
  }

  private findMatchingAutoSignRule(prospect: HotProspect): AutoSignRule | undefined {
    for (const rule of this.autoSignRules.values()) {
      if (rule.enabled && this.matchesAutoSignCriteria(prospect, rule)) {
        return rule;
      }
    }
    return undefined;
  }

  private matchesAutoSignCriteria(prospect: HotProspect, rule: AutoSignRule): boolean {
    return (
      prospect.potentialValue <= rule.conditions.maxValue &&
      prospect.hotScore >= rule.conditions.minHotScore &&
      rule.conditions.businessTypes.includes(prospect.businessType)
    );
  }

  private executeAutoSign(prospect: HotProspect, rule: AutoSignRule) {
    if (rule.approvalWorkflow.alertBeforeExecution) {
      const alert: OwnerAlert = {
        id: `auto-sign-${Date.now()}`,
        type: 'auto_sign_request',
        prospectId: prospect.id,
        priority: 'medium',
        title: `Auto-Sign in ${rule.approvalWorkflow.executionDelay} minutes: ${prospect.companyName}`,
        message: `AI will automatically sign agreement with ${prospect.companyName} unless you intervene. Value: $${prospect.potentialValue.toLocaleString()}`,
        actionRequired: 'Review and approve/reject auto-signing',
        potentialValue: prospect.potentialValue,
        timeframe: `${rule.approvalWorkflow.executionDelay} minutes`,
        createdAt: new Date(),
        status: 'pending',
        autoSignEligible: true
      };

      this.ownerAlerts.set(alert.id, alert);
      console.log(`⚠️ AUTO-SIGN ALERT: ${prospect.companyName} will be signed in ${rule.approvalWorkflow.executionDelay} minutes`);

      // Execute after delay if not intervened
      setTimeout(() => {
        if (alert.status === 'pending') {
          this.finalizeAutoSign(prospect, rule, alert);
        }
      }, rule.approvalWorkflow.executionDelay * 60 * 1000);
    }
  }

  private finalizeAutoSign(prospect: HotProspect, rule: AutoSignRule, alert: OwnerAlert) {
    prospect.status = 'signed';
    alert.status = 'auto_executed';
    rule.executedCount++;
    rule.totalValue += prospect.potentialValue;
    this.salesKPIs.daily.agreementsSigned++;
    this.salesKPIs.daily.revenue += prospect.potentialValue;

    console.log(`✅ AUTO-SIGNED: ${prospect.companyName} - $${prospect.potentialValue.toLocaleString()}`);
  }

  private escalateToOwner(prospect: HotProspect) {
    const alert: OwnerAlert = {
      id: `escalation-${Date.now()}`,
      type: 'high_value_prospect',
      prospectId: prospect.id,
      priority: 'urgent',
      title: `High Value Prospect: ${prospect.companyName}`,
      message: `${prospect.companyName} requires manual review. Value: $${prospect.potentialValue.toLocaleString()}. Hot score: ${prospect.hotScore}`,
      actionRequired: 'Review prospect and approve agreement terms',
      potentialValue: prospect.potentialValue,
      timeframe: 'ASAP',
      createdAt: new Date(),
      status: 'pending',
      autoSignEligible: false
    };

    this.ownerAlerts.set(alert.id, alert);
    console.log(`🚨 HIGH VALUE ESCALATION: ${prospect.companyName} - Manual review required`);
  }

  private processOwnerAlerts() {
    const urgentAlerts = Array.from(this.ownerAlerts.values())
      .filter(a => a.status === 'pending' && a.priority === 'urgent');

    if (urgentAlerts.length > 0) {
      console.log(`🚨 ${urgentAlerts.length} URGENT ALERTS requiring owner attention`);
    }
  }

  private updateKPIs() {
    // Update weekly metrics
    const totalContacts = this.salesKPIs.daily.contactsMade;
    const totalResponses = this.salesKPIs.daily.responsesReceived;
    this.salesKPIs.weekly.conversionRate = totalContacts > 0 ? (totalResponses / totalContacts) * 100 : 0;
    this.salesKPIs.weekly.hotProspects = Array.from(this.hotProspects.values()).filter(p => p.hotScore > 80).length;
    this.salesKPIs.weekly.pipelineValue = Array.from(this.hotProspects.values())
      .filter(p => ['interested', 'negotiating', 'agreement_ready'].includes(p.status))
      .reduce((sum, p) => sum + p.potentialValue, 0);

    console.log(`📊 KPI Update: ${this.salesKPIs.daily.prospectsGenerated} prospects, ${this.salesKPIs.weekly.conversionRate.toFixed(1)}% conversion, $${this.salesKPIs.weekly.pipelineValue.toLocaleString()} pipeline`);
  }

  // Public methods for owner interaction
  public getAllAlerts(): OwnerAlert[] {
    return Array.from(this.ownerAlerts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getUrgentAlerts(): OwnerAlert[] {
    return Array.from(this.ownerAlerts.values())
      .filter(a => a.status === 'pending' && ['urgent', 'high'].includes(a.priority))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public approveAlert(alertId: string): boolean {
    const alert = this.ownerAlerts.get(alertId);
    if (!alert) return false;

    alert.status = 'approved';
    console.log(`✅ Owner approved: ${alert.title}`);

    // Execute the approved action
    if (alert.type === 'agreement_ready' || alert.type === 'auto_sign_request') {
      const prospect = this.hotProspects.get(alert.prospectId);
      if (prospect) {
        prospect.status = 'signed';
        this.salesKPIs.daily.agreementsSigned++;
        this.salesKPIs.daily.revenue += prospect.potentialValue;
      }
    }

    return true;
  }

  public rejectAlert(alertId: string): boolean {
    const alert = this.ownerAlerts.get(alertId);
    if (!alert) return false;

    alert.status = 'rejected';
    console.log(`❌ Owner rejected: ${alert.title}`);
    return true;
  }

  public setOwnerNotificationCallback(callback: (alert: OwnerAlert) => void) {
    this.ownerNotificationCallback = callback;
  }

  public getProspectPipeline() {
    const prospects = Array.from(this.hotProspects.values());
    
    return {
      total: prospects.length,
      byStatus: {
        new: prospects.filter(p => p.status === 'new').length,
        contacted: prospects.filter(p => p.status === 'contacted').length,
        interested: prospects.filter(p => p.status === 'interested').length,
        negotiating: prospects.filter(p => p.status === 'negotiating').length,
        agreement_ready: prospects.filter(p => p.status === 'agreement_ready').length,
        signed: prospects.filter(p => p.status === 'signed').length
      },
      totalValue: prospects.reduce((sum, p) => sum + p.potentialValue, 0),
      hotProspects: prospects.filter(p => p.hotScore > 80).length,
      autoSignEligible: prospects.filter(p => p.autoApprovalEligible).length
    };
  }

  public getSalesKPIs(): SalesKPI {
    return this.salesKPIs;
  }

  public getAutoSignRules(): AutoSignRule[] {
    return Array.from(this.autoSignRules.values());
  }
}

export const aggressiveCustomerAcquisition = new AggressiveCustomerAcquisition();