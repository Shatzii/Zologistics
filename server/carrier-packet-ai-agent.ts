export interface CarrierProfile {
  id: string;
  companyName: string;
  dotNumber: string;
  mcNumber: string;
  contactInfo: {
    primaryContact: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  operationalData: {
    fleetSize: number;
    equipmentTypes: string[];
    operatingRegions: string[];
    safetyRating: 'Satisfactory' | 'Conditional' | 'Unsatisfactory' | 'Not Rated';
    insuranceAmount: number;
    yearsInBusiness: number;
  };
  financialData: {
    creditScore: number;
    avgPaymentTerms: string;
    factoring: boolean;
    annualRevenue: number;
  };
  performanceMetrics: {
    onTimeDeliveryRate: number;
    claimRate: number;
    csaScore: number;
    customerRatings: number;
  };
  packetStatus: {
    acquired: boolean;
    lastUpdated: Date;
    completeness: number; // 0-100%
    missingDocuments: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  targetRoutes: string[];
  rateHistory: {
    lane: string;
    avgRate: number;
    frequency: number;
    lastHauled: Date;
  }[];
}

export interface CarrierPacketRequest {
  carrierId: string;
  documentTypes: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requestMethod: 'email' | 'phone' | 'portal' | 'automated';
  followUpSchedule: {
    initialContact: Date;
    followUp1: Date;
    followUp2: Date;
    escalation: Date;
  };
  customMessage: string;
  incentives: string[];
}

export interface DocumentPacket {
  id: string;
  carrierId: string;
  documentType: 'w9' | 'insurance_certificate' | 'authority' | 'safety_rating' | 'driver_licenses' | 'equipment_specs' | 'references';
  status: 'requested' | 'received' | 'verified' | 'expired' | 'rejected';
  receivedDate?: Date;
  expirationDate?: Date;
  verificationNotes: string;
  fileUrl?: string;
  autoVerified: boolean;
}

export interface AIOutreachCampaign {
  id: string;
  name: string;
  targetCriteria: {
    fleetSizeRange: [number, number];
    safetyRating: string[];
    operatingStates: string[];
    equipmentTypes: string[];
    revenueRange: [number, number];
  };
  messageTemplates: {
    initial: string;
    followUp1: string;
    followUp2: string;
    incentive: string;
  };
  responseTracking: {
    sent: number;
    opened: number;
    responded: number;
    packetsReceived: number;
    conversionRate: number;
  };
  automationRules: {
    autoSendTime: string;
    followUpInterval: number; // hours
    maxFollowUps: number;
    escalationTriggers: string[];
  };
}

export class CarrierPacketAIAgent {
  private carrierProfiles: Map<string, CarrierProfile> = new Map();
  private packetRequests: Map<string, CarrierPacketRequest> = new Map();
  private documentPackets: Map<string, DocumentPacket[]> = new Map();
  private outreachCampaigns: Map<string, AIOutreachCampaign> = new Map();
  private acquisitionQueue: string[] = [];

  constructor() {
    this.initializeCarrierDatabase();
    this.initializeOutreachCampaigns();
    this.startAutomaticAcquisition();
  }

  private initializeCarrierDatabase() {
    // Initialize carrier profiles from FMCSA and other sources
    const sampleCarriers: CarrierProfile[] = [
      {
        id: 'carrier_001',
        companyName: 'Highway Express Logistics',
        dotNumber: '3456789',
        mcNumber: 'MC-987654',
        contactInfo: {
          primaryContact: 'John Davis',
          email: 'operations@highwayexpress.com',
          phone: '(555) 234-5678',
          address: {
            street: '1247 Interstate Blvd',
            city: 'Dallas',
            state: 'TX',
            zipCode: '75201'
          }
        },
        operationalData: {
          fleetSize: 45,
          equipmentTypes: ['Dry Van', 'Refrigerated'],
          operatingRegions: ['Southwest', 'Southeast'],
          safetyRating: 'Satisfactory',
          insuranceAmount: 1000000,
          yearsInBusiness: 12
        },
        financialData: {
          creditScore: 750,
          avgPaymentTerms: '30 days',
          factoring: false,
          annualRevenue: 12500000
        },
        performanceMetrics: {
          onTimeDeliveryRate: 94.5,
          claimRate: 0.8,
          csaScore: 65,
          customerRatings: 4.3
        },
        packetStatus: {
          acquired: false,
          lastUpdated: new Date(),
          completeness: 0,
          missingDocuments: ['W9', 'Insurance Certificate', 'Authority'],
          verificationStatus: 'pending'
        },
        targetRoutes: ['TX-CA', 'TX-FL', 'TX-GA'],
        rateHistory: [
          {
            lane: 'Dallas, TX - Los Angeles, CA',
            avgRate: 2.45,
            frequency: 12,
            lastHauled: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 'carrier_002',
        companyName: 'Mountain Ridge Transport',
        dotNumber: '2345678',
        mcNumber: 'MC-876543',
        contactInfo: {
          primaryContact: 'Sarah Martinez',
          email: 'dispatch@mountainridge.com',
          phone: '(555) 345-6789',
          address: {
            street: '890 Mountain View Drive',
            city: 'Denver',
            state: 'CO',
            zipCode: '80202'
          }
        },
        operationalData: {
          fleetSize: 28,
          equipmentTypes: ['Flatbed', 'Step Deck'],
          operatingRegions: ['Mountain West', 'Plains'],
          safetyRating: 'Satisfactory',
          insuranceAmount: 1000000,
          yearsInBusiness: 8
        },
        financialData: {
          creditScore: 720,
          avgPaymentTerms: '45 days',
          factoring: true,
          annualRevenue: 8200000
        },
        performanceMetrics: {
          onTimeDeliveryRate: 91.2,
          claimRate: 1.2,
          csaScore: 72,
          customerRatings: 4.1
        },
        packetStatus: {
          acquired: false,
          lastUpdated: new Date(),
          completeness: 25,
          missingDocuments: ['Insurance Certificate', 'Driver Licenses'],
          verificationStatus: 'pending'
        },
        targetRoutes: ['CO-TX', 'CO-CA', 'CO-WA'],
        rateHistory: [
          {
            lane: 'Denver, CO - Houston, TX',
            avgRate: 2.32,
            frequency: 8,
            lastHauled: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 'carrier_003',
        companyName: 'Atlantic Coast Carriers',
        dotNumber: '4567890',
        mcNumber: 'MC-765432',
        contactInfo: {
          primaryContact: 'Michael Thompson',
          email: 'mike.thompson@atlanticcoast.com',
          phone: '(555) 456-7890',
          address: {
            street: '2156 Coastal Highway',
            city: 'Jacksonville',
            state: 'FL',
            zipCode: '32202'
          }
        },
        operationalData: {
          fleetSize: 67,
          equipmentTypes: ['Dry Van', 'Refrigerated', 'Flatbed'],
          operatingRegions: ['Southeast', 'Northeast'],
          safetyRating: 'Satisfactory',
          insuranceAmount: 1000000,
          yearsInBusiness: 15
        },
        financialData: {
          creditScore: 780,
          avgPaymentTerms: '30 days',
          factoring: false,
          annualRevenue: 18750000
        },
        performanceMetrics: {
          onTimeDeliveryRate: 96.8,
          claimRate: 0.6,
          csaScore: 58,
          customerRatings: 4.6
        },
        packetStatus: {
          acquired: false,
          lastUpdated: new Date(),
          completeness: 0,
          missingDocuments: ['W9', 'Insurance Certificate', 'Authority', 'Safety Rating'],
          verificationStatus: 'pending'
        },
        targetRoutes: ['FL-NY', 'FL-GA', 'FL-NC'],
        rateHistory: [
          {
            lane: 'Jacksonville, FL - New York, NY',
            avgRate: 2.68,
            frequency: 15,
            lastHauled: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];

    sampleCarriers.forEach(carrier => {
      this.carrierProfiles.set(carrier.id, carrier);
    });
  }

  private initializeOutreachCampaigns() {
    const campaigns: AIOutreachCampaign[] = [
      {
        id: 'campaign_001',
        name: 'High-Performance Carrier Acquisition',
        targetCriteria: {
          fleetSizeRange: [20, 100],
          safetyRating: ['Satisfactory'],
          operatingStates: ['TX', 'CA', 'FL', 'GA', 'IL'],
          equipmentTypes: ['Dry Van', 'Refrigerated'],
          revenueRange: [5000000, 50000000]
        },
        messageTemplates: {
          initial: `Hi {contact_name},

I hope this message finds you well. I'm reaching out from TruckFlow AI regarding potential partnership opportunities for {company_name}.

We've reviewed your company's excellent safety record and operational performance, and we believe there could be mutual benefits in working together on freight opportunities in your operating regions.

Our platform offers:
• Guaranteed quick pay (same-day payment options)
• Premium rate opportunities on your preferred lanes
• AI-powered load matching for maximum efficiency
• Dedicated support team

To get started, we'd need your carrier packet including:
- W9 form
- Current insurance certificate
- Operating authority
- Safety rating documentation

Would you be interested in learning more about our partnership program? I can schedule a brief call at your convenience to discuss the benefits and next steps.

Best regards,
AI Carrier Relations Team
TruckFlow AI Platform`,

          followUp1: `Hi {contact_name},

Following up on my previous message about partnership opportunities with {company_name}.

I wanted to highlight a few additional benefits of joining our carrier network:

• Access to exclusive freight opportunities in {operating_regions}
• Fuel card programs with competitive discounts
• Load planning assistance to minimize deadhead miles
• Performance bonuses for consistent service

Many carriers similar to yours have seen 15-20% revenue increases within the first quarter of partnership.

If you could send over your carrier packet at your earliest convenience, we can fast-track your approval process and get you access to premium loads immediately.

Please let me know if you have any questions or if there's a better time to discuss this opportunity.

Best regards,
AI Carrier Relations Team`,

          followUp2: `Hi {contact_name},

I hope you're having a great week. I wanted to reach out one more time regarding the partnership opportunity with TruckFlow AI.

I understand you're busy managing daily operations, so I'll keep this brief:

We have immediate freight available on your primary lanes:
{target_routes}

Current market rates: ${2.40}-${2.80} per mile
Quick pay available: Same day payment
No setup fees or hidden costs

To secure these opportunities, we just need your standard carrier packet. The entire approval process takes less than 24 hours once we receive your documents.

Would it be helpful if I called you directly to discuss this? I'm available at your convenience.

Thank you for your time and consideration.

Best regards,
AI Carrier Relations Team
Phone: (555) 123-LOAD`,

          incentive: `Hi {contact_name},

Special opportunity for {company_name}!

We're offering a limited-time partnership bonus for qualified carriers:

🎯 $500 signing bonus upon packet completion
🎯 Guaranteed 5 loads in your first month
🎯 Premium rates 10% above market average
🎯 Fast-track approval in 12 hours

This offer expires in 72 hours and is only available to select carriers with your excellent safety record.

To claim this bonus, simply submit your carrier packet today:
- W9 form
- Insurance certificate
- Operating authority
- Safety documentation

Reply to this message or call (555) 123-LOAD to get started immediately.

Don't miss out on this exclusive opportunity!

Best regards,
AI Carrier Relations Team`
        },
        responseTracking: {
          sent: 0,
          opened: 0,
          responded: 0,
          packetsReceived: 0,
          conversionRate: 0
        },
        automationRules: {
          autoSendTime: '09:00',
          followUpInterval: 72, // 3 days
          maxFollowUps: 3,
          escalationTriggers: ['high_value_carrier', 'perfect_safety_record', 'large_fleet']
        }
      }
    ];

    campaigns.forEach(campaign => {
      this.outreachCampaigns.set(campaign.id, campaign);
    });
  }

  private startAutomaticAcquisition() {
    // Run acquisition process every 4 hours
    setInterval(() => {
      this.processAcquisitionQueue();
      this.identifyNewTargets();
      this.executeOutreachCampaigns();
    }, 4 * 60 * 60 * 1000);

    // Initial run
    setTimeout(() => {
      this.processAcquisitionQueue();
      this.identifyNewTargets();
      this.executeOutreachCampaigns();
    }, 5000);
  }

  private async identifyNewTargets() {
    console.log('🔍 AI AGENT: Scanning for new carrier acquisition targets...');
    
    // Simulate FMCSA database scanning
    const newCarriers = this.scanFMCSADatabase();
    const loadBoardCarriers = this.scanLoadBoardProfiles();
    const referralCarriers = this.scanReferralNetwork();

    console.log(`   Found ${newCarriers.length} FMCSA prospects`);
    console.log(`   Found ${loadBoardCarriers.length} load board prospects`);
    console.log(`   Found ${referralCarriers.length} referral prospects`);

    // Add high-priority targets to acquisition queue
    [...newCarriers, ...loadBoardCarriers, ...referralCarriers]
      .filter(carrier => this.evaluateCarrierPriority(carrier) > 7)
      .forEach(carrier => {
        if (!this.acquisitionQueue.includes(carrier.id)) {
          this.acquisitionQueue.push(carrier.id);
          this.carrierProfiles.set(carrier.id, carrier);
        }
      });

    console.log(`   Added ${this.acquisitionQueue.length} carriers to acquisition queue`);
  }

  private scanFMCSADatabase(): CarrierProfile[] {
    // Simulate scanning FMCSA SAFER database
    const prospects: CarrierProfile[] = [];
    
    for (let i = 0; i < 5; i++) {
      const carrierId = `fmcsa_${Date.now()}_${i}`;
      prospects.push({
        id: carrierId,
        companyName: `${this.generateCompanyName()} Transport`,
        dotNumber: this.generateDOTNumber(),
        mcNumber: this.generateMCNumber(),
        contactInfo: this.generateContactInfo(),
        operationalData: this.generateOperationalData(),
        financialData: this.generateFinancialData(),
        performanceMetrics: this.generatePerformanceMetrics(),
        packetStatus: {
          acquired: false,
          lastUpdated: new Date(),
          completeness: 0,
          missingDocuments: ['W9', 'Insurance Certificate', 'Authority'],
          verificationStatus: 'pending'
        },
        targetRoutes: this.generateTargetRoutes(),
        rateHistory: []
      });
    }
    
    return prospects;
  }

  private scanLoadBoardProfiles(): CarrierProfile[] {
    // Simulate scanning load board activity for active carriers
    return [];
  }

  private scanReferralNetwork(): CarrierProfile[] {
    // Simulate referral network scanning
    return [];
  }

  private evaluateCarrierPriority(carrier: CarrierProfile): number {
    let score = 5; // Base score

    // Safety rating bonus
    if (carrier.operationalData.safetyRating === 'Satisfactory') score += 2;
    
    // Fleet size scoring
    if (carrier.operationalData.fleetSize >= 50) score += 2;
    else if (carrier.operationalData.fleetSize >= 20) score += 1;
    
    // Performance metrics
    if (carrier.performanceMetrics.onTimeDeliveryRate > 95) score += 1;
    if (carrier.performanceMetrics.claimRate < 1) score += 1;
    
    // Financial strength
    if (carrier.financialData.creditScore > 750) score += 1;
    if (!carrier.financialData.factoring) score += 0.5;
    
    return score;
  }

  private async processAcquisitionQueue() {
    if (this.acquisitionQueue.length === 0) return;

    console.log(`📋 AI AGENT: Processing ${this.acquisitionQueue.length} carriers in acquisition queue`);

    const carriersToProcess = this.acquisitionQueue.splice(0, 10); // Process up to 10 at a time

    for (const carrierId of carriersToProcess) {
      const carrier = this.carrierProfiles.get(carrierId);
      if (!carrier) continue;

      await this.initiateCarrierContact(carrier);
    }
  }

  private async executeOutreachCampaigns() {
    console.log('📧 AI AGENT: Executing automated outreach campaigns...');

    for (const [campaignId, campaign] of this.outreachCampaigns) {
      const targetCarriers = this.getTargetCarriersForCampaign(campaign);
      
      for (const carrier of targetCarriers) {
        if (!carrier.packetStatus.acquired) {
          await this.sendCampaignMessage(carrier, campaign);
        }
      }
      
      // Update campaign statistics
      campaign.responseTracking.sent += targetCarriers.length;
      console.log(`   Campaign "${campaign.name}": Sent ${targetCarriers.length} messages`);
    }
  }

  private getTargetCarriersForCampaign(campaign: AIOutreachCampaign): CarrierProfile[] {
    return Array.from(this.carrierProfiles.values()).filter(carrier => {
      const criteria = campaign.targetCriteria;
      
      return (
        carrier.operationalData.fleetSize >= criteria.fleetSizeRange[0] &&
        carrier.operationalData.fleetSize <= criteria.fleetSizeRange[1] &&
        criteria.safetyRating.includes(carrier.operationalData.safetyRating) &&
        carrier.operationalData.operatingRegions.some(region => 
          criteria.operatingStates.some(state => region.includes(state))
        ) &&
        carrier.operationalData.equipmentTypes.some(type => 
          criteria.equipmentTypes.includes(type)
        ) &&
        carrier.financialData.annualRevenue >= criteria.revenueRange[0] &&
        carrier.financialData.annualRevenue <= criteria.revenueRange[1]
      );
    }).slice(0, 5); // Limit to 5 per campaign per run
  }

  private async initiateCarrierContact(carrier: CarrierProfile) {
    const request: CarrierPacketRequest = {
      carrierId: carrier.id,
      documentTypes: ['w9', 'insurance_certificate', 'authority', 'safety_rating'],
      urgency: this.calculateUrgency(carrier),
      requestMethod: this.selectOptimalContactMethod(carrier),
      followUpSchedule: this.generateFollowUpSchedule(),
      customMessage: this.generatePersonalizedMessage(carrier),
      incentives: this.selectIncentives(carrier)
    };

    this.packetRequests.set(carrier.id, request);

    console.log(`📞 AI AGENT: Initiated contact with ${carrier.companyName}`);
    console.log(`   Method: ${request.requestMethod} | Urgency: ${request.urgency}`);
    console.log(`   Documents needed: ${request.documentTypes.join(', ')}`);

    // Simulate sending the request
    await this.sendPacketRequest(carrier, request);
  }

  private calculateUrgency(carrier: CarrierProfile): 'low' | 'medium' | 'high' | 'critical' {
    const priority = this.evaluateCarrierPriority(carrier);
    
    if (priority >= 9) return 'critical';
    if (priority >= 7) return 'high';
    if (priority >= 5) return 'medium';
    return 'low';
  }

  private selectOptimalContactMethod(carrier: CarrierProfile): 'email' | 'phone' | 'portal' | 'automated' {
    // AI logic to select best contact method based on carrier profile
    if (carrier.operationalData.fleetSize > 50) return 'phone';
    if (carrier.financialData.creditScore > 750) return 'email';
    return 'automated';
  }

  private generateFollowUpSchedule() {
    const now = new Date();
    return {
      initialContact: now,
      followUp1: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
      followUp2: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      escalation: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days
    };
  }

  private generatePersonalizedMessage(carrier: CarrierProfile): string {
    return `Dear ${carrier.contactInfo.primaryContact},

We've identified ${carrier.companyName} as a potential partner for premium freight opportunities in ${carrier.operationalData.operatingRegions.join(' and ')}.

Your ${carrier.operationalData.safetyRating.toLowerCase()} safety rating and ${carrier.operationalData.fleetSize}-truck fleet make you an ideal candidate for our high-value load network.

We're offering:
• Immediate access to loads on your target lanes: ${carrier.targetRoutes.slice(0, 2).join(', ')}
• Quick pay options with same-day processing
• Rates 10-15% above market average

To get started, we'll need your carrier packet. The approval process takes less than 24 hours.

Best regards,
TruckFlow AI Carrier Relations`;
  }

  private selectIncentives(carrier: CarrierProfile): string[] {
    const incentives = [];
    
    if (carrier.operationalData.fleetSize > 50) {
      incentives.push('Volume bonus program');
    }
    
    if (carrier.performanceMetrics.onTimeDeliveryRate > 95) {
      incentives.push('Performance-based rate premiums');
    }
    
    if (carrier.operationalData.safetyRating === 'Satisfactory') {
      incentives.push('Safety bonus program');
    }
    
    return incentives;
  }

  private async sendPacketRequest(carrier: CarrierProfile, request: CarrierPacketRequest) {
    // Simulate sending the packet request
    console.log(`📨 PACKET REQUEST: Sent to ${carrier.companyName} via ${request.requestMethod}`);
    
    // Simulate response probability
    const responseChance = this.calculateResponseProbability(carrier);
    if (Math.random() < responseChance) {
      setTimeout(() => {
        this.simulatePacketResponse(carrier, request);
      }, Math.random() * 24 * 60 * 60 * 1000); // Response within 24 hours
    }
  }

  private async sendCampaignMessage(carrier: CarrierProfile, campaign: AIOutreachCampaign) {
    const template = campaign.messageTemplates.initial;
    const personalizedMessage = this.personalizeTemplate(template, carrier);
    
    console.log(`📧 CAMPAIGN MESSAGE: Sent to ${carrier.companyName}`);
    console.log(`   Campaign: ${campaign.name}`);
    
    // Simulate email delivery
    setTimeout(() => {
      if (Math.random() < 0.15) { // 15% response rate
        this.simulatePacketResponse(carrier, {
          carrierId: carrier.id,
          documentTypes: ['w9', 'insurance_certificate', 'authority'],
          urgency: 'medium',
          requestMethod: 'email',
          followUpSchedule: this.generateFollowUpSchedule(),
          customMessage: personalizedMessage,
          incentives: []
        });
      }
    }, Math.random() * 48 * 60 * 60 * 1000); // Response within 48 hours
  }

  private personalizeTemplate(template: string, carrier: CarrierProfile): string {
    return template
      .replace(/{contact_name}/g, carrier.contactInfo.primaryContact)
      .replace(/{company_name}/g, carrier.companyName)
      .replace(/{operating_regions}/g, carrier.operationalData.operatingRegions.join(', '))
      .replace(/{target_routes}/g, carrier.targetRoutes.join(', '));
  }

  private calculateResponseProbability(carrier: CarrierProfile): number {
    let baseProbability = 0.12; // 12% base response rate
    
    // Adjust based on carrier characteristics
    if (carrier.operationalData.safetyRating === 'Satisfactory') baseProbability += 0.05;
    if (carrier.operationalData.fleetSize < 30) baseProbability += 0.08; // Smaller carriers more responsive
    if (carrier.financialData.factoring) baseProbability += 0.06; // Cash flow needs
    if (carrier.performanceMetrics.onTimeDeliveryRate > 90) baseProbability += 0.04;
    
    return Math.min(baseProbability, 0.35); // Cap at 35%
  }

  private simulatePacketResponse(carrier: CarrierProfile, request: CarrierPacketRequest) {
    console.log(`✅ PACKET RECEIVED: ${carrier.companyName} submitted carrier packet`);
    
    // Update carrier status
    carrier.packetStatus.acquired = true;
    carrier.packetStatus.completeness = Math.random() * 40 + 60; // 60-100% complete
    carrier.packetStatus.lastUpdated = new Date();
    carrier.packetStatus.verificationStatus = 'pending';
    
    // Reduce missing documents
    const documentsProvided = Math.floor(Math.random() * 3) + 1;
    carrier.packetStatus.missingDocuments = carrier.packetStatus.missingDocuments.slice(documentsProvided);
    
    // Create document packets
    const documents: DocumentPacket[] = [];
    request.documentTypes.forEach(docType => {
      documents.push({
        id: `doc_${Date.now()}_${docType}`,
        carrierId: carrier.id,
        documentType: docType as any,
        status: Math.random() > 0.1 ? 'received' : 'rejected',
        receivedDate: new Date(),
        verificationNotes: 'Automated processing',
        autoVerified: true
      });
    });
    
    this.documentPackets.set(carrier.id, documents);
    
    console.log(`   Documents received: ${documents.length}`);
    console.log(`   Packet completeness: ${carrier.packetStatus.completeness.toFixed(1)}%`);
  }

  // Helper methods for generating realistic data
  private generateCompanyName(): string {
    const prefixes = ['Highway', 'Interstate', 'Mountain', 'Valley', 'Coastal', 'Central', 'Express', 'Swift', 'Premier', 'Elite'];
    const suffixes = ['Logistics', 'Transport', 'Freight', 'Carriers', 'Trucking', 'Express', 'Lines', 'Shipping'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  private generateDOTNumber(): string {
    return (Math.floor(Math.random() * 9000000) + 1000000).toString();
  }

  private generateMCNumber(): string {
    return `MC-${Math.floor(Math.random() * 900000) + 100000}`;
  }

  private generateContactInfo(): CarrierProfile['contactInfo'] {
    const names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Wilson', 'Dave Brown'];
    const cities = ['Dallas', 'Atlanta', 'Phoenix', 'Denver', 'Miami'];
    const states = ['TX', 'GA', 'AZ', 'CO', 'FL'];
    
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomState = states[Math.floor(Math.random() * states.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    return {
      primaryContact: randomName,
      email: `${randomName.split(' ')[0].toLowerCase()}@${this.generateCompanyName().toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Industrial', 'Commerce', 'Highway', 'Logistics'][Math.floor(Math.random() * 5)]} ${['St', 'Ave', 'Blvd', 'Dr', 'Way'][Math.floor(Math.random() * 5)]}`,
        city: randomCity,
        state: randomState,
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
      }
    };
  }

  private generateOperationalData(): CarrierProfile['operationalData'] {
    return {
      fleetSize: Math.floor(Math.random() * 80) + 10,
      equipmentTypes: ['Dry Van', 'Refrigerated', 'Flatbed'].slice(0, Math.floor(Math.random() * 3) + 1),
      operatingRegions: ['Southeast', 'Southwest', 'Northeast', 'Northwest', 'Midwest'].slice(0, Math.floor(Math.random() * 3) + 1),
      safetyRating: 'Satisfactory',
      insuranceAmount: 1000000,
      yearsInBusiness: Math.floor(Math.random() * 20) + 2
    };
  }

  private generateFinancialData(): CarrierProfile['financialData'] {
    return {
      creditScore: Math.floor(Math.random() * 200) + 600,
      avgPaymentTerms: ['30 days', '45 days', '60 days'][Math.floor(Math.random() * 3)],
      factoring: Math.random() > 0.6,
      annualRevenue: Math.floor(Math.random() * 20000000) + 2000000
    };
  }

  private generatePerformanceMetrics(): CarrierProfile['performanceMetrics'] {
    return {
      onTimeDeliveryRate: Math.random() * 20 + 80,
      claimRate: Math.random() * 2,
      csaScore: Math.floor(Math.random() * 40) + 50,
      customerRatings: Math.random() * 2 + 3
    };
  }

  private generateTargetRoutes(): string[] {
    const routes = [
      'TX-CA', 'CA-TX', 'FL-NY', 'NY-FL', 'IL-CA', 'CA-IL',
      'GA-TX', 'TX-GA', 'AZ-WA', 'WA-AZ', 'CO-FL', 'FL-CO'
    ];
    return routes.slice(0, Math.floor(Math.random() * 4) + 2);
  }

  // Public API methods
  public getAllCarriers(): CarrierProfile[] {
    return Array.from(this.carrierProfiles.values());
  }

  public getCarriersByStatus(status: string): CarrierProfile[] {
    return Array.from(this.carrierProfiles.values()).filter(carrier => 
      carrier.packetStatus.verificationStatus === status
    );
  }

  public getAcquisitionStats(): any {
    const total = this.carrierProfiles.size;
    const acquired = Array.from(this.carrierProfiles.values()).filter(c => c.packetStatus.acquired).length;
    const verified = Array.from(this.carrierProfiles.values()).filter(c => c.packetStatus.verificationStatus === 'verified').length;
    
    return {
      totalCarriers: total,
      packetsAcquired: acquired,
      carriersVerified: verified,
      acquisitionRate: total > 0 ? (acquired / total * 100).toFixed(1) : 0,
      verificationRate: acquired > 0 ? (verified / acquired * 100).toFixed(1) : 0,
      queueSize: this.acquisitionQueue.length,
      activeCampaigns: this.outreachCampaigns.size
    };
  }

  public getCarrierProfile(carrierId: string): CarrierProfile | undefined {
    return this.carrierProfiles.get(carrierId);
  }

  public getDocumentPackets(carrierId: string): DocumentPacket[] {
    return this.documentPackets.get(carrierId) || [];
  }

  public getCampaignMetrics(): any[] {
    return Array.from(this.outreachCampaigns.values()).map(campaign => ({
      name: campaign.name,
      sent: campaign.responseTracking.sent,
      responded: campaign.responseTracking.responded,
      packetsReceived: campaign.responseTracking.packetsReceived,
      conversionRate: campaign.responseTracking.conversionRate
    }));
  }

  public manuallyAddCarrier(carrierData: Partial<CarrierProfile>): string {
    const carrierId = `manual_${Date.now()}`;
    const carrier: CarrierProfile = {
      id: carrierId,
      companyName: carrierData.companyName || 'Unknown Carrier',
      dotNumber: carrierData.dotNumber || 'Unknown',
      mcNumber: carrierData.mcNumber || 'Unknown',
      contactInfo: carrierData.contactInfo || this.generateContactInfo(),
      operationalData: carrierData.operationalData || this.generateOperationalData(),
      financialData: carrierData.financialData || this.generateFinancialData(),
      performanceMetrics: carrierData.performanceMetrics || this.generatePerformanceMetrics(),
      packetStatus: {
        acquired: false,
        lastUpdated: new Date(),
        completeness: 0,
        missingDocuments: ['W9', 'Insurance Certificate', 'Authority'],
        verificationStatus: 'pending'
      },
      targetRoutes: carrierData.targetRoutes || this.generateTargetRoutes(),
      rateHistory: carrierData.rateHistory || []
    };

    this.carrierProfiles.set(carrierId, carrier);
    this.acquisitionQueue.push(carrierId);
    
    console.log(`➕ MANUAL ADD: Added ${carrier.companyName} to acquisition queue`);
    return carrierId;
  }

  public approveCarrier(carrierId: string): boolean {
    const carrier = this.carrierProfiles.get(carrierId);
    if (!carrier) return false;

    carrier.packetStatus.verificationStatus = 'verified';
    carrier.packetStatus.completeness = 100;
    carrier.packetStatus.missingDocuments = [];
    
    console.log(`✅ APPROVED: ${carrier.companyName} has been approved and activated`);
    return true;
  }
}

export const carrierPacketAIAgent = new CarrierPacketAIAgent();