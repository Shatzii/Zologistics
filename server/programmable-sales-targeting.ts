/**
 * Programmable Sales Targeting System
 * Customizable AI agent for targeting specific prospect types
 * Fully configurable lead criteria, messaging, and automation rules
 */

export interface TargetingProfile {
  id: string;
  name: string;
  description: string;
  active: boolean;
  
  // Target Criteria
  criteria: {
    companyType: 'shipper' | 'carrier' | 'broker' | 'manufacturer' | 'retailer' | 'warehouse';
    industries: string[];
    companySize: {
      employeeCount: { min: number; max: number };
      annualRevenue: { min: number; max: number };
    };
    geographic: {
      countries: string[];
      states: string[];
      cities: string[];
      regions: string[];
    };
    operational: {
      shipmentVolume: { min: number; max: number };
      equipmentTypes: string[];
      routes: string[];
      currentChallenges: string[];
    };
    technographic: {
      currentSoftware: string[];
      technologyAdoption: 'early' | 'mainstream' | 'laggard';
      digitalMaturity: 'basic' | 'intermediate' | 'advanced';
    };
  };
  
  // Messaging Strategy
  messaging: {
    primaryValue: string;
    painPoints: string[];
    solutions: string[];
    roi: {
      costSavings: number; // percentage
      timeReduction: number; // percentage
      efficiencyGain: number; // percentage
    };
    urgency: 'low' | 'medium' | 'high';
    tone: 'professional' | 'casual' | 'technical' | 'executive';
  };
  
  // Automation Rules
  automation: {
    emailFrequency: number; // days between emails
    maxFollowUps: number;
    responseThreshold: number; // days to wait for response
    escalationRules: EscalationRule[];
    priorityScoring: PriorityWeight[];
  };
  
  // Performance Tracking
  performance: {
    leadsGenerated: number;
    emailsSent: number;
    responseRate: number;
    conversionRate: number;
    avgDealSize: number;
    totalRevenue: number;
  };
  
  createdAt: Date;
  lastModified: Date;
}

export interface EscalationRule {
  condition: 'no_response' | 'high_value' | 'competitor_threat' | 'time_sensitive';
  action: 'increase_frequency' | 'change_message' | 'add_incentive' | 'manual_intervention';
  threshold: number;
  parameters: Record<string, any>;
}

export interface PriorityWeight {
  factor: 'revenue' | 'volume' | 'industry' | 'geography' | 'technology' | 'response_history';
  weight: number; // 1-10
  conditions: Record<string, any>;
}

export interface CustomEmailTemplate {
  id: string;
  profileId: string;
  name: string;
  type: 'initial' | 'follow_up' | 'demo_request' | 'contract_proposal';
  
  subject: string;
  htmlContent: string;
  textContent: string;
  
  // Dynamic Content Rules
  personalization: PersonalizationRule[];
  conditionalContent: ConditionalContent[];
  
  // A/B Testing
  variants: EmailVariant[];
  activeVariant: string;
  
  performance: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    converted: number;
  };
}

export interface PersonalizationRule {
  field: string;
  source: 'company_data' | 'industry_data' | 'calculated' | 'lookup';
  fallback: string;
  transformation?: 'uppercase' | 'lowercase' | 'title_case' | 'currency' | 'percentage';
}

export interface ConditionalContent {
  condition: string; // JavaScript expression
  content: string;
  fallback?: string;
}

export interface EmailVariant {
  id: string;
  name: string;
  subject: string;
  content: string;
  traffic: number; // percentage of traffic
  performance: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

export interface ProspectSearch {
  id: string;
  profileId: string;
  source: 'linkedin' | 'zoominfo' | 'apollo' | 'clearbit' | 'manual' | 'referral';
  query: string;
  filters: Record<string, any>;
  resultsFound: number;
  leadsGenerated: number;
  executedAt: Date;
}

export class ProgrammableSalesTargeting {
  private profiles: Map<string, TargetingProfile> = new Map();
  private templates: Map<string, CustomEmailTemplate> = new Map();
  private searches: Map<string, ProspectSearch> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.initializeDefaultProfiles();
    this.initializeDefaultTemplates();
    this.startTargetingEngine();
    
    console.log('🎯 Programmable Sales Targeting System initialized');
    console.log('⚙️ Customizable prospect targeting and messaging');
    console.log('🤖 Automated lead generation and outreach');
  }

  private initializeDefaultProfiles() {
    // High-Value Shipper Profile
    const highValueShipper: TargetingProfile = {
      id: 'high-value-shipper',
      name: 'High-Value Enterprise Shippers',
      description: 'Large manufacturers and retailers with significant shipping volumes',
      active: true,
      
      criteria: {
        companyType: 'shipper',
        industries: ['Manufacturing', 'Retail', 'Automotive', 'Electronics', 'Pharmaceutical'],
        companySize: {
          employeeCount: { min: 1000, max: 100000 },
          annualRevenue: { min: 100000000, max: 10000000000 }
        },
        geographic: {
          countries: ['USA', 'Canada', 'Mexico'],
          states: ['TX', 'CA', 'IL', 'NY', 'FL', 'GA', 'OH'],
          cities: [],
          regions: ['North America']
        },
        operational: {
          shipmentVolume: { min: 1000, max: 100000 },
          equipmentTypes: ['van', 'reefer', 'flatbed'],
          routes: ['National', 'Regional', 'Cross-border'],
          currentChallenges: ['High shipping costs', 'Lack of visibility', 'Delivery delays']
        },
        technographic: {
          currentSoftware: ['SAP', 'Oracle', 'Manhattan', 'JDA'],
          technologyAdoption: 'mainstream',
          digitalMaturity: 'intermediate'
        }
      },
      
      messaging: {
        primaryValue: 'Reduce shipping costs by 35% with AI-powered optimization',
        painPoints: [
          'Overpaying for freight due to poor rate optimization',
          'Limited visibility into shipment status',
          'Manual processes causing delays and errors',
          'Difficulty managing multiple carrier relationships'
        ],
        solutions: [
          'Real-time rate comparison across 500+ carriers',
          'AI route optimization reducing costs by 35%',
          'Live GPS tracking with 30-second updates',
          'Automated paperwork and compliance management'
        ],
        roi: {
          costSavings: 35,
          timeReduction: 60,
          efficiencyGain: 45
        },
        urgency: 'high',
        tone: 'executive'
      },
      
      automation: {
        emailFrequency: 3,
        maxFollowUps: 4,
        responseThreshold: 7,
        escalationRules: [
          {
            condition: 'high_value',
            action: 'manual_intervention',
            threshold: 2000000,
            parameters: { assignTo: 'senior_sales' }
          }
        ],
        priorityScoring: [
          { factor: 'revenue', weight: 10, conditions: { min: 1000000 } },
          { factor: 'volume', weight: 8, conditions: { min: 5000 } },
          { factor: 'industry', weight: 6, conditions: { include: ['Manufacturing', 'Retail'] } }
        ]
      },
      
      performance: {
        leadsGenerated: 0,
        emailsSent: 0,
        responseRate: 0,
        conversionRate: 0,
        avgDealSize: 0,
        totalRevenue: 0
      },
      
      createdAt: new Date(),
      lastModified: new Date()
    };

    // Regional Carrier Profile
    const regionalCarrier: TargetingProfile = {
      id: 'regional-carrier',
      name: 'Regional Trucking Carriers',
      description: 'Medium-sized carriers looking for consistent load volume',
      active: true,
      
      criteria: {
        companyType: 'carrier',
        industries: ['Transportation', 'Logistics'],
        companySize: {
          employeeCount: { min: 10, max: 500 },
          annualRevenue: { min: 2000000, max: 50000000 }
        },
        geographic: {
          countries: ['USA'],
          states: ['TX', 'CA', 'FL', 'GA', 'IL', 'OH', 'PA', 'NC'],
          cities: [],
          regions: ['Southwest', 'Southeast', 'Midwest']
        },
        operational: {
          shipmentVolume: { min: 50, max: 1000 },
          equipmentTypes: ['van', 'reefer', 'flatbed'],
          routes: ['Regional', 'Dedicated', 'OTR'],
          currentChallenges: ['Finding consistent loads', 'Low rates', 'Payment delays']
        },
        technographic: {
          currentSoftware: ['McLeod', 'TMW', 'PeopleNet'],
          technologyAdoption: 'mainstream',
          digitalMaturity: 'basic'
        }
      },
      
      messaging: {
        primaryValue: 'Guaranteed load volume with premium rates and quick pay',
        painPoints: [
          'Inconsistent load availability',
          'Below-market rates and long payment cycles',
          'High deadhead miles reducing profitability',
          'Limited access to high-paying loads'
        ],
        solutions: [
          'Guaranteed minimum loads per week',
          '15-20% above market rates',
          '24-48 hour payment processing',
          'AI route optimization reducing deadhead'
        ],
        roi: {
          costSavings: 20,
          timeReduction: 40,
          efficiencyGain: 30
        },
        urgency: 'medium',
        tone: 'professional'
      },
      
      automation: {
        emailFrequency: 2,
        maxFollowUps: 3,
        responseThreshold: 5,
        escalationRules: [
          {
            condition: 'no_response',
            action: 'increase_frequency',
            threshold: 3,
            parameters: { newFrequency: 1 }
          }
        ],
        priorityScoring: [
          { factor: 'volume', weight: 9, conditions: { min: 100 } },
          { factor: 'geography', weight: 7, conditions: { preferred: ['TX', 'CA', 'FL'] } }
        ]
      },
      
      performance: {
        leadsGenerated: 0,
        emailsSent: 0,
        responseRate: 0,
        conversionRate: 0,
        avgDealSize: 0,
        totalRevenue: 0
      },
      
      createdAt: new Date(),
      lastModified: new Date()
    };

    this.profiles.set(highValueShipper.id, highValueShipper);
    this.profiles.set(regionalCarrier.id, regionalCarrier);
  }

  private initializeDefaultTemplates() {
    // High-Value Shipper Template
    const shipperTemplate: CustomEmailTemplate = {
      id: 'shipper-executive-outreach',
      profileId: 'high-value-shipper',
      name: 'Executive Shipper Outreach',
      type: 'initial',
      
      subject: 'Cut {{company}} shipping costs by {{savings}}% - {{contactName}}',
      
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">{{greeting}} {{contactName}},</h2>
          
          <p>{{company}} ships approximately {{volume}} loads monthly. Based on our analysis, we can reduce your logistics costs by <strong>{{savings}}%</strong> while improving delivery performance.</p>
          
          {{#if competitor}}
          <p><strong>Why switch from {{competitor}}?</strong></p>
          <ul>
            <li>{{advantage1}}</li>
            <li>{{advantage2}}</li>
            <li>{{advantage3}}</li>
          </ul>
          {{/if}}
          
          <p><strong>Projected savings for {{company}}:</strong></p>
          <ul>
            <li>💰 <strong>${{monthlySavings}}/month</strong> in reduced shipping costs</li>
            <li>⚡ <strong>{{timeImprovement}}% faster</strong> delivery times</li>
            <li>📊 <strong>Real-time visibility</strong> on all shipments</li>
          </ul>
          
          {{#if urgency === 'high'}}
          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>Time-Sensitive:</strong> {{urgencyMessage}}</p>
          </div>
          {{/if}}
          
          <p>{{cta}}</p>
          
          <p>Best regards,<br>{{senderName}}<br>{{senderTitle}}</p>
        </div>
      `,
      
      textContent: `{{greeting}} {{contactName}},

{{company}} ships approximately {{volume}} loads monthly. Based on our analysis, we can reduce your logistics costs by {{savings}}% while improving delivery performance.

Projected savings for {{company}}:
- ${{monthlySavings}}/month in reduced shipping costs
- {{timeImprovement}}% faster delivery times  
- Real-time visibility on all shipments

{{cta}}

Best regards,
{{senderName}}
{{senderTitle}}`,
      
      personalization: [
        { field: 'greeting', source: 'calculated', fallback: 'Hello' },
        { field: 'volume', source: 'company_data', fallback: '1,000+' },
        { field: 'savings', source: 'calculated', fallback: '35' },
        { field: 'monthlySavings', source: 'calculated', fallback: '50,000', transformation: 'currency' }
      ],
      
      conditionalContent: [
        {
          condition: 'company.industry === "Manufacturing"',
          content: 'Our manufacturing clients typically see 40% cost reductions due to supply chain complexity.',
          fallback: 'Our enterprise clients consistently achieve 35%+ cost reductions.'
        }
      ],
      
      variants: [
        {
          id: 'variant-a',
          name: 'Cost Focus',
          subject: 'Cut {{company}} shipping costs by {{savings}}%',
          content: 'Cost-focused version',
          traffic: 50,
          performance: { sent: 0, opened: 0, clicked: 0, converted: 0 }
        },
        {
          id: 'variant-b',
          name: 'Efficiency Focus',
          subject: 'Improve {{company}} delivery speed by {{timeImprovement}}%',
          content: 'Efficiency-focused version',
          traffic: 50,
          performance: { sent: 0, opened: 0, clicked: 0, converted: 0 }
        }
      ],
      
      activeVariant: 'variant-a',
      
      performance: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        converted: 0
      }
    };

    this.templates.set(shipperTemplate.id, shipperTemplate);
  }

  private startTargetingEngine() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🎯 Starting programmable targeting engine...');

    // Profile-based prospecting every 4 hours
    setInterval(() => {
      this.executeTargetingProfiles();
    }, 4 * 60 * 60 * 1000);

    // Template performance optimization every 24 hours
    setInterval(() => {
      this.optimizeTemplatePerformance();
    }, 24 * 60 * 60 * 1000);

    // Lead scoring updates every hour
    setInterval(() => {
      this.updateLeadScoring();
    }, 60 * 60 * 1000);

    // Start initial execution
    setTimeout(() => this.executeTargetingProfiles(), 5000);
  }

  private executeTargetingProfiles() {
    console.log('🎯 Executing targeting profiles...');
    
    for (const profile of this.profiles.values()) {
      if (profile.active) {
        this.executeProfile(profile);
      }
    }
  }

  private executeProfile(profile: TargetingProfile) {
    console.log(`🎯 Executing profile: ${profile.name}`);
    
    // Generate prospects based on criteria
    const prospects = this.generateProspects(profile);
    
    // Score and prioritize
    const scoredProspects = this.scoreProspects(prospects, profile);
    
    // Send targeted emails
    this.sendTargetedEmails(scoredProspects, profile);
    
    // Update performance metrics
    this.updateProfilePerformance(profile, prospects.length);
  }

  private generateProspects(profile: TargetingProfile): any[] {
    const prospects = [];
    
    // Simulate prospect generation based on criteria
    const targetCount = 20;
    
    for (let i = 0; i < targetCount; i++) {
      const prospect = {
        id: `prospect-${Date.now()}-${i}`,
        companyName: this.generateCompanyName(profile.criteria.industries),
        contactName: this.generateContactName(),
        email: this.generateEmail(),
        industry: profile.criteria.industries[Math.floor(Math.random() * profile.criteria.industries.length)],
        revenue: this.generateRevenue(profile.criteria.companySize.annualRevenue),
        volume: this.generateVolume(profile.criteria.operational.shipmentVolume),
        location: this.generateLocation(profile.criteria.geographic),
        matchScore: Math.random() * 100
      };
      
      prospects.push(prospect);
    }
    
    console.log(`✅ Generated ${prospects.length} prospects for ${profile.name}`);
    return prospects;
  }

  private scoreProspects(prospects: any[], profile: TargetingProfile): any[] {
    return prospects.map(prospect => {
      let score = 0;
      
      // Apply priority scoring weights
      for (const weight of profile.automation.priorityScoring) {
        switch (weight.factor) {
          case 'revenue':
            if (prospect.revenue >= weight.conditions.min) {
              score += weight.weight * 10;
            }
            break;
          case 'volume':
            if (prospect.volume >= weight.conditions.min) {
              score += weight.weight * 8;
            }
            break;
          case 'industry':
            if (weight.conditions.include?.includes(prospect.industry)) {
              score += weight.weight * 6;
            }
            break;
        }
      }
      
      return { ...prospect, priorityScore: score };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }

  private sendTargetedEmails(prospects: any[], profile: TargetingProfile) {
    const template = Array.from(this.templates.values()).find(t => t.profileId === profile.id);
    if (!template) return;
    
    // Send to top prospects only
    const topProspects = prospects.slice(0, 10);
    
    for (const prospect of topProspects) {
      this.sendPersonalizedEmail(prospect, profile, template);
    }
  }

  private sendPersonalizedEmail(prospect: any, profile: TargetingProfile, template: CustomEmailTemplate) {
    // Apply personalization rules
    const personalizedContent = this.applyPersonalization(template, prospect, profile);
    
    console.log(`📧 Sending targeted email to ${prospect.companyName} (Score: ${prospect.priorityScore})`);
    console.log(`Subject: ${personalizedContent.subject}`);
    
    // Update template performance
    template.performance.sent++;
    profile.performance.emailsSent++;
    
    // Simulate response (higher response rate for targeted emails)
    if (Math.random() < 0.15) { // 15% response rate for targeted emails
      console.log(`✅ Response from ${prospect.companyName}`);
      template.performance.replied++;
    }
  }

  private applyPersonalization(template: CustomEmailTemplate, prospect: any, profile: TargetingProfile): any {
    let subject = template.subject;
    let content = template.htmlContent;
    
    // Apply personalization rules
    for (const rule of template.personalization) {
      const value = this.getPersonalizationValue(rule, prospect, profile);
      const placeholder = `{{${rule.field}}}`;
      
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }
    
    // Apply standard variables
    const variables = {
      contactName: prospect.contactName,
      company: prospect.companyName,
      volume: prospect.volume.toLocaleString(),
      savings: profile.messaging.roi.costSavings,
      monthlySavings: Math.floor(prospect.revenue * profile.messaging.roi.costSavings / 100 / 12).toLocaleString(),
      timeImprovement: profile.messaging.roi.timeReduction,
      senderName: 'Marcus Thompson',
      senderTitle: 'AI Logistics Platform',
      cta: 'Are you available for a 15-minute call this week to discuss the details?'
    };
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return { subject, content };
  }

  private getPersonalizationValue(rule: PersonalizationRule, prospect: any, profile: TargetingProfile): string {
    switch (rule.source) {
      case 'company_data':
        return prospect[rule.field] || rule.fallback;
      case 'calculated':
        return this.calculatePersonalizationValue(rule.field, prospect, profile) || rule.fallback;
      default:
        return rule.fallback;
    }
  }

  private calculatePersonalizationValue(field: string, prospect: any, profile: TargetingProfile): string {
    switch (field) {
      case 'greeting':
        return prospect.revenue > 100000000 ? 'Good morning' : 'Hello';
      case 'savings':
        return profile.messaging.roi.costSavings.toString();
      case 'monthlySavings':
        return Math.floor(prospect.revenue * profile.messaging.roi.costSavings / 100 / 12).toLocaleString();
      default:
        return '';
    }
  }

  private optimizeTemplatePerformance() {
    console.log('📊 Optimizing template performance...');
    
    for (const template of this.templates.values()) {
      // A/B test variant performance
      if (template.variants.length > 1) {
        const bestVariant = template.variants.reduce((best, current) => {
          const bestRate = best.performance.converted / Math.max(best.performance.sent, 1);
          const currentRate = current.performance.converted / Math.max(current.performance.sent, 1);
          return currentRate > bestRate ? current : best;
        });
        
        if (bestVariant.id !== template.activeVariant) {
          console.log(`🔄 Switching template ${template.name} to variant ${bestVariant.name}`);
          template.activeVariant = bestVariant.id;
        }
      }
    }
  }

  private updateLeadScoring() {
    // Implementation for dynamic lead scoring updates
    console.log('🎯 Updating lead scoring algorithms...');
  }

  private updateProfilePerformance(profile: TargetingProfile, leadsGenerated: number) {
    profile.performance.leadsGenerated += leadsGenerated;
    profile.lastModified = new Date();
  }

  private generateCompanyName(industries: string[]): string {
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const prefixes = ['Global', 'Premier', 'Advanced', 'Elite', 'Summit'];
    const suffixes = ['Corporation', 'Industries', 'Solutions', 'Group', 'Systems'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${industry} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  private generateContactName(): string {
    const names = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Jennifer Davis', 'David Wilson'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateEmail(): string {
    return `contact${Math.floor(Math.random() * 1000)}@company.com`;
  }

  private generateRevenue(range: { min: number; max: number }): number {
    return Math.floor(Math.random() * (range.max - range.min) + range.min);
  }

  private generateVolume(range: { min: number; max: number }): number {
    return Math.floor(Math.random() * (range.max - range.min) + range.min);
  }

  private generateLocation(geographic: any): any {
    const states = geographic.states;
    const state = states[Math.floor(Math.random() * states.length)];
    return { state, country: 'USA' };
  }

  // Public API Methods
  
  createTargetingProfile(profileData: Partial<TargetingProfile>): TargetingProfile {
    const profile: TargetingProfile = {
      id: `profile-${Date.now()}`,
      name: profileData.name || 'New Profile',
      description: profileData.description || '',
      active: profileData.active ?? true,
      criteria: profileData.criteria || {} as any,
      messaging: profileData.messaging || {} as any,
      automation: profileData.automation || {} as any,
      performance: {
        leadsGenerated: 0,
        emailsSent: 0,
        responseRate: 0,
        conversionRate: 0,
        avgDealSize: 0,
        totalRevenue: 0
      },
      createdAt: new Date(),
      lastModified: new Date()
    };
    
    this.profiles.set(profile.id, profile);
    console.log(`✅ Created targeting profile: ${profile.name}`);
    return profile;
  }

  updateTargetingProfile(profileId: string, updates: Partial<TargetingProfile>): boolean {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;
    
    Object.assign(profile, updates);
    profile.lastModified = new Date();
    
    console.log(`✅ Updated targeting profile: ${profile.name}`);
    return true;
  }

  createEmailTemplate(templateData: Partial<CustomEmailTemplate>): CustomEmailTemplate {
    const template: CustomEmailTemplate = {
      id: `template-${Date.now()}`,
      profileId: templateData.profileId || '',
      name: templateData.name || 'New Template',
      type: templateData.type || 'initial',
      subject: templateData.subject || '',
      htmlContent: templateData.htmlContent || '',
      textContent: templateData.textContent || '',
      personalization: templateData.personalization || [],
      conditionalContent: templateData.conditionalContent || [],
      variants: templateData.variants || [],
      activeVariant: templateData.activeVariant || '',
      performance: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        converted: 0
      }
    };
    
    this.templates.set(template.id, template);
    console.log(`✅ Created email template: ${template.name}`);
    return template;
  }

  getAllProfiles(): TargetingProfile[] {
    return Array.from(this.profiles.values());
  }

  getProfile(profileId: string): TargetingProfile | undefined {
    return this.profiles.get(profileId);
  }

  getAllTemplates(): CustomEmailTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByProfile(profileId: string): CustomEmailTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.profileId === profileId);
  }

  activateProfile(profileId: string): boolean {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;
    
    profile.active = true;
    profile.lastModified = new Date();
    console.log(`🔄 Activated targeting profile: ${profile.name}`);
    return true;
  }

  deactivateProfile(profileId: string): boolean {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;
    
    profile.active = false;
    profile.lastModified = new Date();
    console.log(`⏸️ Deactivated targeting profile: ${profile.name}`);
    return true;
  }

  getTargetingMetrics(): any {
    const profiles = Array.from(this.profiles.values());
    
    return {
      totalProfiles: profiles.length,
      activeProfiles: profiles.filter(p => p.active).length,
      totalLeadsGenerated: profiles.reduce((sum, p) => sum + p.performance.leadsGenerated, 0),
      totalEmailsSent: profiles.reduce((sum, p) => sum + p.performance.emailsSent, 0),
      avgResponseRate: profiles.reduce((sum, p) => sum + p.performance.responseRate, 0) / profiles.length,
      totalRevenue: profiles.reduce((sum, p) => sum + p.performance.totalRevenue, 0)
    };
  }
}

export const programmableSalesTargeting = new ProgrammableSalesTargeting();