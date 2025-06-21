export interface DriverLead {
  id: string;
  source: 'social_media' | 'job_boards' | 'referral' | 'cold_outreach' | 'content_marketing';
  contactMethod: 'phone' | 'email' | 'social_dm' | 'text_message';
  driverProfile: {
    name: string;
    phone?: string;
    email?: string;
    experience: 'new' | 'experienced' | 'owner_operator' | 'fleet_driver';
    currentSituation: 'unemployed' | 'looking_for_better' | 'satisfied' | 'unknown';
    equipmentType: string[];
    homeBase: string;
    painPoints: string[];
    interests: string[];
  };
  outreachHistory: OutreachAttempt[];
  conversionProbability: number;
  estimatedValue: number; // Monthly revenue potential
  status: 'lead' | 'contacted' | 'interested' | 'demo_scheduled' | 'signed_up' | 'rejected';
  assignedAI: string;
  createdAt: Date;
  lastContactAt?: Date;
}

export interface OutreachAttempt {
  id: string;
  timestamp: Date;
  method: 'phone' | 'email' | 'social_dm' | 'text_message';
  message: string;
  response?: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'no_response';
  nextAction: string;
  scheduledFollowUp?: Date;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'social_media' | 'job_board_posting' | 'content_creation' | 'cold_outreach' | 'referral_program';
  status: 'active' | 'paused' | 'completed';
  targetAudience: {
    experience: string[];
    location: string[];
    equipmentType: string[];
    painPoints: string[];
  };
  aiPersona: string;
  content: {
    headline: string;
    description: string;
    callToAction: string;
    benefits: string[];
    urgencyFactor: string;
  };
  platforms: string[];
  budget: number;
  metrics: {
    reach: number;
    impressions: number;
    clicks: number;
    leads: number;
    conversions: number;
    cost_per_lead: number;
    roi: number;
  };
  automatedResponses: boolean;
  createdAt: Date;
}

export interface RevenueOpportunity {
  id: string;
  type: 'subscription' | 'commission' | 'service_fee' | 'premium_feature' | 'partnership';
  name: string;
  description: string;
  targetMarket: 'drivers' | 'brokers' | 'shippers' | 'fleet_owners';
  monthlyPotential: number;
  implementationTime: 'immediate' | 'within_week' | 'within_month';
  requirements: string[];
  competitorPricing: {
    low: number;
    average: number;
    high: number;
  };
  differentiators: string[];
  launchReady: boolean;
}

export class DriverAcquisitionEngine {
  private leads: Map<string, DriverLead> = new Map();
  private campaigns: Map<string, MarketingCampaign> = new Map();
  private revenueOpportunities: Map<string, RevenueOpportunity> = new Map();
  private aiPersonas: Map<string, any> = new Map();

  constructor() {
    this.initializeAIPersonas();
    this.initializeMarketingCampaigns();
    this.initializeRevenueOpportunities();
    this.startAutomatedOutreach();
  }

  private initializeAIPersonas() {
    // AI personas for different driver types
    this.aiPersonas.set('experienced_driver_specialist', {
      name: 'Marcus Thompson',
      background: 'Former truck driver turned tech advocate',
      communication_style: 'Direct, practical, emphasizes efficiency',
      expertise: ['route optimization', 'fuel savings', 'time management'],
      approach: 'Shows real numbers and savings potential'
    });

    this.aiPersonas.set('new_driver_mentor', {
      name: 'Sarah Rodriguez',
      background: 'Driver trainer and safety expert',
      communication_style: 'Supportive, educational, confidence-building',
      expertise: ['safety compliance', 'career guidance', 'skill development'],
      approach: 'Focuses on career growth and learning opportunities'
    });

    this.aiPersonas.set('owner_operator_advisor', {
      name: 'David Chen',
      background: 'Successful owner-operator and business consultant',
      communication_style: 'Business-focused, ROI-driven, strategic',
      expertise: ['business optimization', 'profit maximization', 'fleet growth'],
      approach: 'Emphasizes business benefits and competitive advantages'
    });
  }

  private initializeMarketingCampaigns() {
    const campaigns = [
      {
        id: 'experienced_driver_campaign',
        name: 'AI-Powered Efficiency for Experienced Drivers',
        type: 'social_media' as const,
        status: 'active' as const,
        targetAudience: {
          experience: ['experienced', 'owner_operator'],
          location: ['US', 'Canada'],
          equipmentType: ['van', 'flatbed', 'reefer'],
          painPoints: ['low_rates', 'empty_miles', 'fuel_costs']
        },
        aiPersona: 'experienced_driver_specialist',
        content: {
          headline: 'Stop Leaving Money on the Table - AI Finds Your Best Loads',
          description: 'Experienced drivers using our AI platform average $2,400 more per month through optimized load matching and rate negotiation.',
          callToAction: 'Get Free Rate Analysis',
          benefits: [
            '94.7% accurate rate optimization',
            'Real-time load matching',
            'Automated paperwork',
            'Same-day payments'
          ],
          urgencyFactor: 'Limited beta access - 100 drivers only'
        },
        platforms: ['Facebook Groups', 'LinkedIn', 'TikTok', 'YouTube'],
        budget: 0, // Organic reach initially
        metrics: {
          reach: 0,
          impressions: 0,
          clicks: 0,
          leads: 0,
          conversions: 0,
          cost_per_lead: 0,
          roi: 0
        },
        automatedResponses: true,
        createdAt: new Date()
      },
      {
        id: 'new_driver_campaign',
        name: 'Career Launch Program for New Drivers',
        type: 'job_board_posting' as const,
        status: 'active' as const,
        targetAudience: {
          experience: ['new'],
          location: ['US'],
          equipmentType: ['van', 'box_truck'],
          painPoints: ['inexperience', 'low_confidence', 'finding_work']
        },
        aiPersona: 'new_driver_mentor',
        content: {
          headline: 'New CDL? Start Earning $75K+ Your First Year',
          description: 'Our AI mentor system guides new drivers to high-paying loads while building experience safely.',
          callToAction: 'Start Free Career Assessment',
          benefits: [
            'AI-guided load selection',
            'Safety-first route planning',
            'Instant payment processing',
            '24/7 support system'
          ],
          urgencyFactor: 'New driver signup bonus: $500 first month'
        },
        platforms: ['Indeed', 'ZipRecruiter', 'Monster', 'CDL job boards'],
        budget: 0,
        metrics: {
          reach: 0,
          impressions: 0,
          clicks: 0,
          leads: 0,
          conversions: 0,
          cost_per_lead: 0,
          roi: 0
        },
        automatedResponses: true,
        createdAt: new Date()
      }
    ];

    campaigns.forEach(campaign => {
      this.campaigns.set(campaign.id, campaign);
    });
  }

  private initializeRevenueOpportunities() {
    const opportunities = [
      {
        id: 'ai_load_matching_subscription',
        type: 'subscription' as const,
        name: 'AI Load Matching Premium',
        description: 'Monthly subscription for AI-powered load matching and rate optimization',
        targetMarket: 'drivers' as const,
        monthlyPotential: 99,
        implementationTime: 'immediate' as const,
        requirements: ['Payment processing', 'User authentication'],
        competitorPricing: { low: 49, average: 89, high: 149 },
        differentiators: ['Self-hosted AI', 'Real-time optimization', '94.7% accuracy'],
        launchReady: true
      },
      {
        id: 'instant_payment_service',
        type: 'service_fee' as const,
        name: 'Same-Day Payment Processing',
        description: '2.5% fee for instant payment processing instead of 30-day wait',
        targetMarket: 'drivers' as const,
        monthlyPotential: 0, // Variable based on load value
        implementationTime: 'within_week' as const,
        requirements: ['Payment processor integration', 'Factoring partnerships'],
        competitorPricing: { low: 1.5, average: 3.0, high: 5.0 },
        differentiators: ['Same-day processing', 'No credit checks', 'Transparent fees'],
        launchReady: false
      },
      {
        id: 'ai_rate_negotiation',
        type: 'commission' as const,
        name: 'AI Rate Negotiation Service',
        description: '10% of rate increase achieved through AI-powered negotiation',
        targetMarket: 'drivers' as const,
        monthlyPotential: 0, // Variable based on rate improvements
        implementationTime: 'immediate' as const,
        requirements: ['Rate optimization AI', 'Broker communication system'],
        competitorPricing: { low: 5, average: 15, high: 25 },
        differentiators: ['Success-based pricing', 'AI-powered analysis', 'Real-time market data'],
        launchReady: true
      },
      {
        id: 'load_board_integration',
        type: 'premium_feature' as const,
        name: 'Premium Load Board Access',
        description: 'Access to 15+ premium load boards with AI filtering',
        targetMarket: 'drivers' as const,
        monthlyPotential: 149,
        implementationTime: 'immediate' as const,
        requirements: ['Load board API keys', 'Data aggregation system'],
        competitorPricing: { low: 99, average: 199, high: 299 },
        differentiators: ['17 load sources', 'AI filtering', 'Real-time updates'],
        launchReady: false // Needs API keys
      },
      {
        id: 'white_label_platform',
        type: 'partnership' as const,
        name: 'White-Label Platform Licensing',
        description: 'License platform to trucking companies and brokers',
        targetMarket: 'brokers' as const,
        monthlyPotential: 2500,
        implementationTime: 'within_month' as const,
        requirements: ['White-label configuration', 'Multi-tenant architecture'],
        competitorPricing: { low: 1000, average: 5000, high: 15000 },
        differentiators: ['Self-hosted AI', 'Complete customization', 'No external dependencies'],
        launchReady: true
      }
    ];

    opportunities.forEach(opp => {
      this.revenueOpportunities.set(opp.id, opp);
    });
  }

  private startAutomatedOutreach() {
    // Simulate automated outreach system
    setInterval(() => {
      this.processOutreachQueue();
    }, 30000); // Every 30 seconds for demo
  }

  private processOutreachQueue() {
    // Generate sample leads for demonstration
    if (this.leads.size < 10) {
      this.generateSampleLead();
    }

    // Process existing leads
    for (const [id, lead] of this.leads) {
      if (lead.status === 'lead' && (!lead.lastContactAt || 
          Date.now() - lead.lastContactAt.getTime() > 24 * 60 * 60 * 1000)) {
        this.performAutomatedOutreach(lead);
      }
    }
  }

  private generateSampleLead() {
    const leadId = `lead_${Date.now()}`;
    const lead: DriverLead = {
      id: leadId,
      source: 'social_media',
      contactMethod: 'email',
      driverProfile: {
        name: this.generateRandomName(),
        email: `driver${Math.floor(Math.random() * 1000)}@example.com`,
        experience: Math.random() > 0.5 ? 'experienced' : 'new',
        currentSituation: 'looking_for_better',
        equipmentType: ['van'],
        homeBase: this.generateRandomCity(),
        painPoints: ['low_rates', 'empty_miles'],
        interests: ['higher_income', 'better_routes']
      },
      outreachHistory: [],
      conversionProbability: Math.random() * 100,
      estimatedValue: Math.floor(Math.random() * 2000) + 500,
      status: 'lead',
      assignedAI: 'experienced_driver_specialist',
      createdAt: new Date()
    };

    this.leads.set(leadId, lead);
  }

  private generateRandomName(): string {
    const names = ['Mike Johnson', 'Sarah Davis', 'Robert Wilson', 'Lisa Brown', 'David Miller'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateRandomCity(): string {
    const cities = ['Atlanta, GA', 'Dallas, TX', 'Phoenix, AZ', 'Denver, CO', 'Nashville, TN'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private async performAutomatedOutreach(lead: DriverLead) {
    const persona = this.aiPersonas.get(lead.assignedAI);
    
    const outreach: OutreachAttempt = {
      id: `outreach_${Date.now()}`,
      timestamp: new Date(),
      method: lead.contactMethod,
      message: this.generatePersonalizedMessage(lead, persona),
      sentiment: 'no_response',
      nextAction: 'Wait for response',
      scheduledFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };

    lead.outreachHistory.push(outreach);
    lead.lastContactAt = new Date();
    lead.status = 'contacted';

    console.log(`🤖 AI Outreach to ${lead.driverProfile.name}: ${outreach.message.substring(0, 100)}...`);
  }

  private generatePersonalizedMessage(lead: DriverLead, persona: any): string {
    const messages = {
      experienced: `Hi ${lead.driverProfile.name}, I'm ${persona.name}. I noticed you're an experienced driver in ${lead.driverProfile.homeBase}. Our AI platform is helping drivers like you earn $2,400+ more per month through optimized load matching. Would you be interested in a free rate analysis for your typical routes?`,
      new: `Hi ${lead.driverProfile.name}, I'm ${persona.name}. Congratulations on getting your CDL! Our AI mentoring platform helps new drivers start earning $75K+ in their first year. We provide guided load selection and 24/7 support. Would you like to schedule a free career assessment?`
    };

    return messages[lead.driverProfile.experience === 'experienced' ? 'experienced' : 'new'];
  }

  // Public methods for API endpoints
  public getLeads(): DriverLead[] {
    const leadsArray: DriverLead[] = [];
    this.leads.forEach(lead => leadsArray.push(lead));
    return leadsArray;
  }

  public getCampaigns(): MarketingCampaign[] {
    return Array.from(this.campaigns.values());
  }

  public getRevenueOpportunities(): RevenueOpportunity[] {
    return Array.from(this.revenueOpportunities.values());
  }

  public getImmediateRevenueOpportunities(): RevenueOpportunity[] {
    return Array.from(this.revenueOpportunities.values())
      .filter(opp => opp.implementationTime === 'immediate' && opp.launchReady);
  }

  public getAcquisitionMetrics(): any {
    const leads = Array.from(this.leads.values());
    return {
      totalLeads: leads.length,
      contactedLeads: leads.filter(l => l.status === 'contacted').length,
      interestedLeads: leads.filter(l => l.status === 'interested').length,
      signedUpDrivers: leads.filter(l => l.status === 'signed_up').length,
      conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'signed_up').length / leads.length * 100) : 0,
      estimatedMonthlyRevenue: leads.filter(l => l.status === 'signed_up').reduce((sum, l) => sum + l.estimatedValue, 0),
      averageConversionProbability: leads.reduce((sum, l) => sum + l.conversionProbability, 0) / leads.length || 0
    };
  }

  public createCustomCampaign(campaignData: Partial<MarketingCampaign>): string {
    const campaignId = `campaign_${Date.now()}`;
    const campaign: MarketingCampaign = {
      id: campaignId,
      name: campaignData.name || 'Custom Campaign',
      type: campaignData.type || 'social_media',
      status: 'active',
      targetAudience: campaignData.targetAudience || {
        experience: ['experienced'],
        location: ['US'],
        equipmentType: ['van'],
        painPoints: ['low_rates']
      },
      aiPersona: campaignData.aiPersona || 'experienced_driver_specialist',
      content: campaignData.content || {
        headline: 'Boost Your Trucking Income with AI',
        description: 'Advanced AI platform for smarter load matching',
        callToAction: 'Learn More',
        benefits: ['Higher rates', 'Better routes', 'Less deadhead'],
        urgencyFactor: 'Limited time offer'
      },
      platforms: campaignData.platforms || ['Facebook'],
      budget: campaignData.budget || 0,
      metrics: {
        reach: 0,
        impressions: 0,
        clicks: 0,
        leads: 0,
        conversions: 0,
        cost_per_lead: 0,
        roi: 0
      },
      automatedResponses: true,
      createdAt: new Date()
    };

    this.campaigns.set(campaignId, campaign);
    return campaignId;
  }

  public simulateLeadResponse(leadId: string, response: 'positive' | 'negative' | 'neutral'): void {
    const lead = this.leads.get(leadId);
    if (!lead) return;

    const lastOutreach = lead.outreachHistory[lead.outreachHistory.length - 1];
    if (lastOutreach) {
      lastOutreach.sentiment = response;
      lastOutreach.response = response === 'positive' ? 'Interested, tell me more' : 
                              response === 'negative' ? 'Not interested' : 'Maybe later';
    }

    switch (response) {
      case 'positive':
        lead.status = 'interested';
        lead.conversionProbability = Math.min(lead.conversionProbability + 30, 95);
        break;
      case 'negative':
        lead.status = 'rejected';
        lead.conversionProbability = 0;
        break;
      case 'neutral':
        lead.conversionProbability = Math.max(lead.conversionProbability - 10, 5);
        break;
    }
  }
}

export const driverAcquisitionEngine = new DriverAcquisitionEngine();