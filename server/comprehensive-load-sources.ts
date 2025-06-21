import { AuthenticLoad, LoadSource } from './authentic-load-integration';

export interface ComprehensiveLoadSource extends LoadSource {
  priority: 'critical' | 'high' | 'medium' | 'low';
  integrationComplexity: 'simple' | 'moderate' | 'complex';
  loadVolume: number; // daily load count
  specialization: string[];
  costStructure: {
    subscriptionRequired: boolean;
    monthlyFee?: number;
    perLoadFee?: number;
    enterpriseOnly: boolean;
  };
  technicalRequirements: {
    webhooksSupported: boolean;
    realTimeUpdates: boolean;
    bulkDownload: boolean;
    apiVersion: string;
  };
}

export class ComprehensiveLoadSourcesManager {
  private comprehensiveSources: Map<string, ComprehensiveLoadSource> = new Map();

  constructor() {
    this.initializeComprehensiveSources();
  }

  private initializeComprehensiveSources() {
    // Tier 1: Critical Load Boards (Must Have)
    const datLoadboard: ComprehensiveLoadSource = {
      id: 'dat_loadboard',
      name: 'DAT LoadBoard',
      type: 'api',
      isActive: !!process.env.DAT_API_KEY,
      priority: 'critical',
      integrationComplexity: 'moderate',
      loadVolume: 500000,
      specialization: ['General Freight', 'All Equipment Types', 'North America'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'DAT_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 10000
      },
      dataQuality: 95,
      coverage: {
        regions: ['US', 'Canada', 'Mexico'],
        equipmentTypes: ['Van', 'Flatbed', 'Reefer', 'Tanker', 'Stepdeck', 'Lowboy'],
        loadTypes: ['Full', 'LTL', 'Partial', 'Specialized']
      },
      costStructure: {
        subscriptionRequired: true,
        monthlyFee: 149,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: true,
        apiVersion: 'v2.0'
      }
    };

    const truckstopCom: ComprehensiveLoadSource = {
      id: 'truckstop_api',
      name: 'Truckstop.com API',
      type: 'api',
      isActive: !!process.env.TRUCKSTOP_API_KEY,
      priority: 'critical',
      integrationComplexity: 'moderate',
      loadVolume: 300000,
      specialization: ['High Volume', 'Verified Brokers', 'US-Canada'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'TRUCKSTOP_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 50,
        requestsPerDay: 8000
      },
      dataQuality: 92,
      coverage: {
        regions: ['US', 'Canada'],
        equipmentTypes: ['Van', 'Flatbed', 'Reefer', 'Tanker'],
        loadTypes: ['Full', 'LTL', 'Partial']
      },
      costStructure: {
        subscriptionRequired: true,
        monthlyFee: 129,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: false,
        apiVersion: 'v1.8'
      }
    };

    const chRobinson: ComprehensiveLoadSource = {
      id: 'ch_robinson',
      name: 'CH Robinson LoadLink',
      type: 'api',
      isActive: !!process.env.CHROBINSON_API_KEY,
      priority: 'critical',
      integrationComplexity: 'complex',
      loadVolume: 200000,
      specialization: ['International', 'Large Shippers', 'Global Logistics'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'CHROBINSON_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 20000
      },
      dataQuality: 97,
      coverage: {
        regions: ['US', 'Canada', 'Mexico', 'Europe'],
        equipmentTypes: ['Van', 'Reefer', 'Flatbed', 'Stepdeck', 'Lowboy', 'Tanker'],
        loadTypes: ['Full', 'LTL', 'Partial', 'International']
      },
      costStructure: {
        subscriptionRequired: true,
        enterpriseOnly: true
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: true,
        apiVersion: 'v3.1'
      }
    };

    // Tier 2: High Priority Tech Platforms
    const convoyLoadboard: ComprehensiveLoadSource = {
      id: 'convoy_loadboard',
      name: 'Convoy LoadBoard',
      type: 'api',
      isActive: !!process.env.CONVOY_API_KEY,
      priority: 'high',
      integrationComplexity: 'moderate',
      loadVolume: 75000,
      specialization: ['Tech-Enabled', 'Real-Time Pricing', 'West Coast'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'CONVOY_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 45,
        requestsPerDay: 12000
      },
      dataQuality: 96,
      coverage: {
        regions: ['US'],
        equipmentTypes: ['Van', 'Reefer', 'Flatbed', 'Stepdeck'],
        loadTypes: ['Full', 'LTL', 'Expedited']
      },
      costStructure: {
        subscriptionRequired: false,
        perLoadFee: 2.50,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: false,
        apiVersion: 'v2.3'
      }
    };

    const uberFreight: ComprehensiveLoadSource = {
      id: 'uber_freight',
      name: 'Uber Freight',
      type: 'api',
      isActive: !!process.env.UBER_FREIGHT_TOKEN,
      priority: 'high',
      integrationComplexity: 'complex',
      loadVolume: 100000,
      specialization: ['Digital Marketplace', 'Real-Time Matching', 'Mexico'],
      authentication: {
        required: true,
        type: 'oauth',
        credentialEnvVar: 'UBER_FREIGHT_TOKEN'
      },
      rateLimit: {
        requestsPerMinute: 40,
        requestsPerDay: 15000
      },
      dataQuality: 94,
      coverage: {
        regions: ['US', 'Mexico'],
        equipmentTypes: ['Van', 'Reefer', 'Flatbed'],
        loadTypes: ['Full', 'LTL']
      },
      costStructure: {
        subscriptionRequired: false,
        perLoadFee: 3.00,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: false,
        apiVersion: 'v4.0'
      }
    };

    // Tier 3: Specialized High-Value Markets
    const centralDispatch: ComprehensiveLoadSource = {
      id: 'central_dispatch',
      name: 'Central Dispatch',
      type: 'api',
      isActive: !!process.env.CENTRAL_DISPATCH_KEY,
      priority: 'high',
      integrationComplexity: 'simple',
      loadVolume: 25000,
      specialization: ['Auto Transport', 'Vehicle Auctions', 'Car Carriers'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'CENTRAL_DISPATCH_KEY'
      },
      rateLimit: {
        requestsPerMinute: 20,
        requestsPerDay: 3000
      },
      dataQuality: 93,
      coverage: {
        regions: ['US', 'Canada'],
        equipmentTypes: ['Car Carrier', 'Auto Transport'],
        loadTypes: ['Auto Transport', 'Vehicle Auction']
      },
      costStructure: {
        subscriptionRequired: true,
        monthlyFee: 89,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: false,
        realTimeUpdates: false,
        bulkDownload: true,
        apiVersion: 'v1.5'
      }
    };

    const directFreight: ComprehensiveLoadSource = {
      id: 'direct_freight',
      name: 'DirectFreight',
      type: 'api',
      isActive: !!process.env.DIRECTFREIGHT_API_KEY,
      priority: 'medium',
      integrationComplexity: 'simple',
      loadVolume: 50000,
      specialization: ['Industrial', 'Manufacturing', 'B2B'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'DIRECTFREIGHT_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 25,
        requestsPerDay: 6000
      },
      dataQuality: 90,
      coverage: {
        regions: ['US', 'Canada'],
        equipmentTypes: ['Van', 'Reefer', 'Flatbed', 'Stepdeck'],
        loadTypes: ['Industrial', 'Manufacturing', 'Full']
      },
      costStructure: {
        subscriptionRequired: true,
        monthlyFee: 69,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: false,
        realTimeUpdates: false,
        bulkDownload: false,
        apiVersion: 'v1.2'
      }
    };

    // Tier 4: International and Global
    const transporeon: ComprehensiveLoadSource = {
      id: 'transporeon',
      name: 'Transporeon',
      type: 'api',
      isActive: !!process.env.TRANSPOREON_KEY,
      priority: 'medium',
      integrationComplexity: 'complex',
      loadVolume: 100000,
      specialization: ['European Market', 'Cross-dock', 'Supply Chain'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'TRANSPOREON_KEY'
      },
      rateLimit: {
        requestsPerMinute: 35,
        requestsPerDay: 10000
      },
      dataQuality: 94,
      coverage: {
        regions: ['Europe', 'UK'],
        equipmentTypes: ['Van', 'Reefer', 'Flatbed', 'Tanker'],
        loadTypes: ['Full', 'LTL', 'Cross-dock']
      },
      costStructure: {
        subscriptionRequired: true,
        enterpriseOnly: true
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: true,
        apiVersion: 'v2.8'
      }
    };

    const freightos: ComprehensiveLoadSource = {
      id: 'freightos',
      name: 'Freightos',
      type: 'api',
      isActive: !!process.env.FREIGHTOS_API_TOKEN,
      priority: 'medium',
      integrationComplexity: 'complex',
      loadVolume: 60000,
      specialization: ['Global Shipping', 'Multi-modal', 'Ocean/Air'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'FREIGHTOS_API_TOKEN'
      },
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerDay: 8000
      },
      dataQuality: 92,
      coverage: {
        regions: ['Global'],
        equipmentTypes: ['Van', 'Reefer', 'Flatbed', 'Container'],
        loadTypes: ['International', 'Ocean', 'Air']
      },
      costStructure: {
        subscriptionRequired: true,
        monthlyFee: 199,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: false,
        bulkDownload: true,
        apiVersion: 'v3.2'
      }
    };

    // Tier 5: Regional and Niche Markets
    const loadBoardCa: ComprehensiveLoadSource = {
      id: 'loadboard_ca',
      name: 'LoadBoard.ca',
      type: 'api',
      isActive: !!process.env.LOADBOARD_CA_KEY,
      priority: 'medium',
      integrationComplexity: 'simple',
      loadVolume: 35000,
      specialization: ['Canadian Market', 'Cross-border', 'Regional'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'LOADBOARD_CA_KEY'
      },
      rateLimit: {
        requestsPerMinute: 20,
        requestsPerDay: 4000
      },
      dataQuality: 87,
      coverage: {
        regions: ['Canada'],
        equipmentTypes: ['Van', 'Reefer', 'Flatbed'],
        loadTypes: ['Full', 'LTL']
      },
      costStructure: {
        subscriptionRequired: true,
        monthlyFee: 79,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: false,
        realTimeUpdates: false,
        bulkDownload: false,
        apiVersion: 'v1.3'
      }
    };

    const borderBee: ComprehensiveLoadSource = {
      id: 'border_bee',
      name: 'BorderBee',
      type: 'api',
      isActive: !!process.env.BORDERBEE_API_KEY,
      priority: 'medium',
      integrationComplexity: 'moderate',
      loadVolume: 15000,
      specialization: ['US-Mexico Border', 'Cross-border Compliance', 'USMCA'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'BORDERBEE_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 15,
        requestsPerDay: 2000
      },
      dataQuality: 95,
      coverage: {
        regions: ['US-Mexico Border'],
        equipmentTypes: ['Van', 'Reefer', 'Flatbed'],
        loadTypes: ['Cross-border', 'Full']
      },
      costStructure: {
        subscriptionRequired: true,
        monthlyFee: 149,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: false,
        apiVersion: 'v2.1'
      }
    };

    // Tier 6: Market Intelligence and Analytics
    const freightWaves: ComprehensiveLoadSource = {
      id: 'freight_waves',
      name: 'FreightWaves SONAR',
      type: 'api',
      isActive: !!process.env.FREIGHTWAVES_SONAR_KEY,
      priority: 'high',
      integrationComplexity: 'complex',
      loadVolume: 0, // Data service, not loads
      specialization: ['Market Intelligence', 'Pricing Data', 'Analytics'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'FREIGHTWAVES_SONAR_KEY'
      },
      rateLimit: {
        requestsPerMinute: 100,
        requestsPerDay: 25000
      },
      dataQuality: 98,
      coverage: {
        regions: ['Global'],
        equipmentTypes: ['All'],
        loadTypes: ['Market Intelligence', 'Pricing Data']
      },
      costStructure: {
        subscriptionRequired: true,
        monthlyFee: 599,
        enterpriseOnly: true
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: true,
        apiVersion: 'v4.2'
      }
    };

    const project44: ComprehensiveLoadSource = {
      id: 'project44',
      name: 'Project44',
      type: 'api',
      isActive: !!process.env.PROJECT44_API_KEY,
      priority: 'medium',
      integrationComplexity: 'complex',
      loadVolume: 0, // Visibility service
      specialization: ['Supply Chain Visibility', 'Tracking', 'ETA Predictions'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'PROJECT44_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 80,
        requestsPerDay: 20000
      },
      dataQuality: 96,
      coverage: {
        regions: ['Global'],
        equipmentTypes: ['All'],
        loadTypes: ['Supply Chain Visibility', 'Tracking']
      },
      costStructure: {
        subscriptionRequired: true,
        enterpriseOnly: true
      },
      technicalRequirements: {
        webhooksSupported: true,
        realTimeUpdates: true,
        bulkDownload: false,
        apiVersion: 'v5.1'
      }
    };

    // Tier 7: Last-Mile and Small Vehicle Platforms
    const goShare: ComprehensiveLoadSource = {
      id: 'goshare',
      name: 'GoShare',
      type: 'api',
      isActive: !!process.env.GOSHARE_API_KEY,
      priority: 'low',
      integrationComplexity: 'simple',
      loadVolume: 20000,
      specialization: ['Last Mile', 'Local Delivery', 'Small Vehicles'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'GOSHARE_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerDay: 5000
      },
      dataQuality: 89,
      coverage: {
        regions: ['US'],
        equipmentTypes: ['Pickup Truck', 'Van', 'Box Truck'],
        loadTypes: ['Last Mile', 'Local Delivery']
      },
      costStructure: {
        subscriptionRequired: false,
        perLoadFee: 1.50,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: false,
        realTimeUpdates: false,
        bulkDownload: false,
        apiVersion: 'v1.4'
      }
    };

    const roadie: ComprehensiveLoadSource = {
      id: 'roadie',
      name: 'Roadie',
      type: 'api',
      isActive: !!process.env.ROADIE_API_KEY,
      priority: 'low',
      integrationComplexity: 'simple',
      loadVolume: 18000,
      specialization: ['Same Day', 'Local Delivery', 'Crowdsourced'],
      authentication: {
        required: true,
        type: 'api_key',
        credentialEnvVar: 'ROADIE_API_KEY'
      },
      rateLimit: {
        requestsPerMinute: 25,
        requestsPerDay: 4000
      },
      dataQuality: 85,
      coverage: {
        regions: ['US'],
        equipmentTypes: ['Pickup Truck', 'Van', 'Car'],
        loadTypes: ['Same Day', 'Local Delivery']
      },
      costStructure: {
        subscriptionRequired: false,
        perLoadFee: 2.00,
        enterpriseOnly: false
      },
      technicalRequirements: {
        webhooksSupported: false,
        realTimeUpdates: false,
        bulkDownload: false,
        apiVersion: 'v2.0'
      }
    };

    // Register all comprehensive sources
    const allSources = [
      datLoadboard, truckstopCom, chRobinson, convoyLoadboard, uberFreight,
      centralDispatch, directFreight, transporeon, freightos, loadBoardCa,
      borderBee, freightWaves, project44, goShare, roadie
    ];

    allSources.forEach(source => {
      this.comprehensiveSources.set(source.id, source);
    });
  }

  public getSourcesByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): ComprehensiveLoadSource[] {
    return Array.from(this.comprehensiveSources.values())
      .filter(source => source.priority === priority)
      .sort((a, b) => b.loadVolume - a.loadVolume);
  }

  public getSourcesByComplexity(complexity: 'simple' | 'moderate' | 'complex'): ComprehensiveLoadSource[] {
    return Array.from(this.comprehensiveSources.values())
      .filter(source => source.integrationComplexity === complexity);
  }

  public getSourcesBySpecialization(specialization: string): ComprehensiveLoadSource[] {
    return Array.from(this.comprehensiveSources.values())
      .filter(source => source.specialization.some(spec => 
        spec.toLowerCase().includes(specialization.toLowerCase())
      ));
  }

  public getImplementationRoadmap(): {
    phase: string;
    sources: ComprehensiveLoadSource[];
    timeline: string;
    expectedLoadIncrease: number;
  }[] {
    return [
      {
        phase: "Phase 1: Foundation",
        sources: this.getSourcesByPriority('critical'),
        timeline: "Immediate (0-30 days)",
        expectedLoadIncrease: 1000000
      },
      {
        phase: "Phase 2: Tech Enhancement",
        sources: this.getSourcesByPriority('high').filter(s => s.priority === 'high'),
        timeline: "Short term (30-60 days)",
        expectedLoadIncrease: 200000
      },
      {
        phase: "Phase 3: Specialization",
        sources: this.getSourcesByPriority('medium'),
        timeline: "Medium term (60-120 days)",
        expectedLoadIncrease: 300000
      },
      {
        phase: "Phase 4: Optimization",
        sources: this.getSourcesByPriority('low'),
        timeline: "Long term (120+ days)",
        expectedLoadIncrease: 40000
      }
    ];
  }

  public getCostAnalysis(): {
    totalMonthlyCost: number;
    costPerLoad: number;
    roiProjection: number;
  } {
    const activeSources = Array.from(this.comprehensiveSources.values())
      .filter(source => source.isActive);
    
    const totalMonthlyCost = activeSources.reduce((total, source) => {
      return total + (source.costStructure.monthlyFee || 0);
    }, 0);

    const totalDailyLoads = activeSources.reduce((total, source) => {
      return total + source.loadVolume;
    }, 0);

    const costPerLoad = totalMonthlyCost / (totalDailyLoads * 30);
    const roiProjection = (totalDailyLoads * 30 * 50) / totalMonthlyCost; // Assuming $50 profit per load

    return {
      totalMonthlyCost,
      costPerLoad,
      roiProjection
    };
  }

  public getAllSources(): ComprehensiveLoadSource[] {
    return Array.from(this.comprehensiveSources.values());
  }

  public getActiveSourcesCount(): number {
    return Array.from(this.comprehensiveSources.values())
      .filter(source => source.isActive).length;
  }

  public getTotalLoadVolume(): number {
    return Array.from(this.comprehensiveSources.values())
      .filter(source => source.isActive)
      .reduce((total, source) => total + source.loadVolume, 0);
  }
}

export const comprehensiveLoadSourcesManager = new ComprehensiveLoadSourcesManager();