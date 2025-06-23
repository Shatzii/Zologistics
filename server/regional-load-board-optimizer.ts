export interface RegionalLoadBoard {
  id: string;
  name: string;
  region: 'north_america' | 'central_america' | 'europe' | 'asia_pacific';
  countries: string[];
  baseUrl: string;
  apiEndpoint: string;
  authentication: {
    type: 'api_key' | 'oauth' | 'basic_auth' | 'bearer_token';
    credentials?: any;
  };
  loadCategories: string[];
  languageSupport: string[];
  currency: string;
  regulatoryCompliance: string[];
  marketShare: number; // percentage of regional freight
  averageLoadsPerDay: number;
  averageRatePerMile: number;
  specializations: string[];
  operatingHours: {
    timezone: string;
    businessHours: string;
    peakTimes: string[];
  };
  dataFormat: 'json' | 'xml' | 'csv';
  updateFrequency: number; // minutes
  costStructure: {
    subscriptionFee: number;
    perLoadFee: number;
    transactionFee: number;
  };
}

export interface RegionalLoadBoardConfig {
  region: string;
  activeBoards: string[];
  priority: number[];
  filterCriteria: {
    equipmentTypes: string[];
    routePreferences: string[];
    minRate: number;
    maxDistance: number;
    loadTypes: string[];
  };
  schedulingParams: {
    scanInterval: number;
    priorityRefresh: number;
    peakHourMultiplier: number;
  };
  complianceSettings: {
    requiredDocuments: string[];
    certifications: string[];
    insuranceMinimums: number;
  };
}

export interface LoadBoardOptimization {
  boardId: string;
  region: string;
  optimizationScore: number;
  factors: {
    marketShare: number;
    avgRate: number;
    loadVolume: number;
    compliance: number;
    language: number;
    timezone: number;
  };
  recommendations: string[];
  estimatedLoadsPerDay: number;
  projectedRevenue: number;
}

export class RegionalLoadBoardOptimizer {
  private loadBoards: Map<string, RegionalLoadBoard> = new Map();
  private regionalConfigs: Map<string, RegionalLoadBoardConfig> = new Map();
  private activeOptimizations: Map<string, LoadBoardOptimization[]> = new Map();
  private scanningIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeGlobalLoadBoards();
    this.initializeRegionalConfigs();
    this.startRegionalOptimization();
  }

  private initializeGlobalLoadBoards() {
    // North American Load Boards
    const northAmericaBoards: RegionalLoadBoard[] = [
      {
        id: 'dat-loadboard',
        name: 'DAT Load Board',
        region: 'north_america',
        countries: ['US', 'CA', 'MX'],
        baseUrl: 'https://dat.com',
        apiEndpoint: '/api/v2/loads',
        authentication: { type: 'api_key' },
        loadCategories: ['dry_van', 'reefer', 'flatbed', 'ltl', 'heavy_haul'],
        languageSupport: ['en', 'es', 'fr'],
        currency: 'USD',
        regulatoryCompliance: ['FMCSA', 'DOT', 'CFIA'],
        marketShare: 85,
        averageLoadsPerDay: 15000,
        averageRatePerMile: 2.45,
        specializations: ['cross_border', 'high_value', 'time_sensitive'],
        operatingHours: {
          timezone: 'America/Chicago',
          businessHours: '6:00-22:00',
          peakTimes: ['8:00-10:00', '14:00-16:00']
        },
        dataFormat: 'json',
        updateFrequency: 5,
        costStructure: {
          subscriptionFee: 149,
          perLoadFee: 0,
          transactionFee: 0.02
        }
      },
      {
        id: 'truckstop-loadboard',
        name: 'Truckstop.com Load Board',
        region: 'north_america',
        countries: ['US', 'CA'],
        baseUrl: 'https://truckstop.com',
        apiEndpoint: '/api/loads',
        authentication: { type: 'oauth' },
        loadCategories: ['dry_van', 'reefer', 'flatbed', 'tanker'],
        languageSupport: ['en'],
        currency: 'USD',
        regulatoryCompliance: ['FMCSA', 'DOT'],
        marketShare: 65,
        averageLoadsPerDay: 8500,
        averageRatePerMile: 2.38,
        specializations: ['fuel_optimization', 'route_planning'],
        operatingHours: {
          timezone: 'America/Chicago',
          businessHours: '24/7',
          peakTimes: ['7:00-9:00', '13:00-15:00']
        },
        dataFormat: 'json',
        updateFrequency: 3,
        costStructure: {
          subscriptionFee: 89,
          perLoadFee: 0,
          transactionFee: 0.015
        }
      }
    ];

    // Central American Load Boards
    const centralAmericaBoards: RegionalLoadBoard[] = [
      {
        id: 'sieca-freight',
        name: 'SIECA Regional Freight Exchange',
        region: 'central_america',
        countries: ['GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA'],
        baseUrl: 'https://freight.sieca.int',
        apiEndpoint: '/api/v1/loads',
        authentication: { type: 'bearer_token' },
        loadCategories: ['agricultural', 'manufactured', 'raw_materials', 'consumer_goods'],
        languageSupport: ['es', 'en'],
        currency: 'USD',
        regulatoryCompliance: ['SIECA', 'CAFTA-DR'],
        marketShare: 75,
        averageLoadsPerDay: 450,
        averageRatePerMile: 1.85,
        specializations: ['cross_border', 'agricultural', 'manufacturing'],
        operatingHours: {
          timezone: 'America/Guatemala',
          businessHours: '7:00-18:00',
          peakTimes: ['9:00-11:00', '14:00-16:00']
        },
        dataFormat: 'json',
        updateFrequency: 15,
        costStructure: {
          subscriptionFee: 45,
          perLoadFee: 2.50,
          transactionFee: 0.01
        }
      },
      {
        id: 'centroamerica-cargo',
        name: 'CentroAmérica Cargo Network',
        region: 'central_america',
        countries: ['MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA'],
        baseUrl: 'https://cargo.centroamerica.com',
        apiEndpoint: '/api/loads',
        authentication: { type: 'api_key' },
        loadCategories: ['import_export', 'local_distribution', 'cross_border'],
        languageSupport: ['es', 'en'],
        currency: 'USD',
        regulatoryCompliance: ['CAFTA-DR', 'Local_Customs'],
        marketShare: 55,
        averageLoadsPerDay: 320,
        averageRatePerMile: 1.75,
        specializations: ['customs_clearance', 'documentation', 'multi_modal'],
        operatingHours: {
          timezone: 'America/Guatemala',
          businessHours: '6:00-20:00',
          peakTimes: ['8:00-10:00', '15:00-17:00']
        },
        dataFormat: 'xml',
        updateFrequency: 20,
        costStructure: {
          subscriptionFee: 35,
          perLoadFee: 3.00,
          transactionFee: 0.015
        }
      }
    ];

    // European Load Boards
    const europeBoards: RegionalLoadBoard[] = [
      {
        id: 'timocom-freight',
        name: 'TimoCom Freight Exchange',
        region: 'europe',
        countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'CZ', 'AT', 'CH'],
        baseUrl: 'https://timocom.com',
        apiEndpoint: '/api/v3/freight',
        authentication: { type: 'oauth' },
        loadCategories: ['general_cargo', 'partial_loads', 'full_loads', 'special_transport'],
        languageSupport: ['de', 'en', 'fr', 'it', 'es', 'pl', 'cs'],
        currency: 'EUR',
        regulatoryCompliance: ['EU_Transport_Regulation', 'ADR', 'AETR'],
        marketShare: 80,
        averageLoadsPerDay: 12000,
        averageRatePerMile: 1.95,
        specializations: ['intra_eu', 'dangerous_goods', 'temperature_controlled'],
        operatingHours: {
          timezone: 'Europe/Berlin',
          businessHours: '6:00-22:00',
          peakTimes: ['8:00-10:00', '14:00-16:00']
        },
        dataFormat: 'json',
        updateFrequency: 2,
        costStructure: {
          subscriptionFee: 129,
          perLoadFee: 0,
          transactionFee: 0.018
        }
      },
      {
        id: 'wtransnet-europe',
        name: 'Wtransnet European Network',
        region: 'europe',
        countries: ['ES', 'PT', 'FR', 'IT', 'DE', 'UK', 'PL'],
        baseUrl: 'https://wtransnet.com',
        apiEndpoint: '/api/loads',
        authentication: { type: 'api_key' },
        loadCategories: ['general_cargo', 'industrial', 'food_beverage', 'automotive'],
        languageSupport: ['es', 'pt', 'fr', 'en', 'de', 'it'],
        currency: 'EUR',
        regulatoryCompliance: ['EU_Transport_Regulation', 'HACCP', 'GDP'],
        marketShare: 60,
        averageLoadsPerDay: 7500,
        averageRatePerMile: 1.88,
        specializations: ['iberian_peninsula', 'food_grade', 'automotive'],
        operatingHours: {
          timezone: 'Europe/Madrid',
          businessHours: '7:00-21:00',
          peakTimes: ['9:00-11:00', '15:00-17:00']
        },
        dataFormat: 'json',
        updateFrequency: 5,
        costStructure: {
          subscriptionFee: 95,
          perLoadFee: 0,
          transactionFee: 0.02
        }
      }
    ];

    // Store all load boards
    [...northAmericaBoards, ...centralAmericaBoards, ...europeBoards].forEach(board => {
      this.loadBoards.set(board.id, board);
    });

    console.log(`🌐 Initialized ${this.loadBoards.size} regional load boards across global markets`);
  }

  private initializeRegionalConfigs() {
    const configs: RegionalLoadBoardConfig[] = [
      {
        region: 'north_america',
        activeBoards: ['dat-loadboard', 'truckstop-loadboard'],
        priority: [1, 2],
        filterCriteria: {
          equipmentTypes: ['dry_van', 'reefer', 'flatbed'],
          routePreferences: ['interstate', 'cross_border'],
          minRate: 2.00,
          maxDistance: 2500,
          loadTypes: ['full_truckload', 'ltl']
        },
        schedulingParams: {
          scanInterval: 5,
          priorityRefresh: 2,
          peakHourMultiplier: 1.5
        },
        complianceSettings: {
          requiredDocuments: ['FMCSA_Authority', 'DOT_Number', 'Insurance_Certificate'],
          certifications: ['HAZMAT', 'TWIC'],
          insuranceMinimums: 1000000
        }
      },
      {
        region: 'central_america',
        activeBoards: ['sieca-freight', 'centroamerica-cargo'],
        priority: [1, 2],
        filterCriteria: {
          equipmentTypes: ['dry_van', 'refrigerated', 'container'],
          routePreferences: ['cross_border', 'port_access'],
          minRate: 1.50,
          maxDistance: 1500,
          loadTypes: ['import_export', 'local_distribution']
        },
        schedulingParams: {
          scanInterval: 15,
          priorityRefresh: 10,
          peakHourMultiplier: 1.3
        },
        complianceSettings: {
          requiredDocuments: ['SIECA_Permit', 'Customs_Bond', 'Insurance_Certificate'],
          certifications: ['International_Driver_License', 'Customs_Clearance'],
          insuranceMinimums: 500000
        }
      },
      {
        region: 'europe',
        activeBoards: ['timocom-freight', 'wtransnet-europe'],
        priority: [1, 2],
        filterCriteria: {
          equipmentTypes: ['tautliner', 'refrigerated', 'container', 'flatbed'],
          routePreferences: ['intra_eu', 'cross_border'],
          minRate: 1.70,
          maxDistance: 2000,
          loadTypes: ['general_cargo', 'partial_loads', 'special_transport']
        },
        schedulingParams: {
          scanInterval: 3,
          priorityRefresh: 1,
          peakHourMultiplier: 1.4
        },
        complianceSettings: {
          requiredDocuments: ['EU_License', 'Operator_License', 'Insurance_Green_Card'],
          certifications: ['ADR', 'CPC', 'Digital_Tachograph'],
          insuranceMinimums: 750000
        }
      }
    ];

    configs.forEach(config => {
      this.regionalConfigs.set(config.region, config);
    });

    console.log(`⚙️ Configured load board optimization for ${configs.length} regions`);
  }

  public optimizeForRegion(region: string): LoadBoardOptimization[] {
    const config = this.regionalConfigs.get(region);
    if (!config) {
      console.log(`❌ No configuration found for region: ${region}`);
      return [];
    }

    const optimizations: LoadBoardOptimization[] = [];

    config.activeBoards.forEach((boardId, index) => {
      const board = this.loadBoards.get(boardId);
      if (!board) return;

      const optimization = this.calculateOptimizationScore(board, config, region);
      optimizations.push(optimization);
    });

    // Sort by optimization score
    optimizations.sort((a, b) => b.optimizationScore - a.optimizationScore);

    this.activeOptimizations.set(region, optimizations);
    console.log(`🎯 Optimized ${optimizations.length} load boards for ${region}`);

    return optimizations;
  }

  private calculateOptimizationScore(
    board: RegionalLoadBoard, 
    config: RegionalLoadBoardConfig, 
    region: string
  ): LoadBoardOptimization {
    const factors = {
      marketShare: board.marketShare / 100,
      avgRate: Math.min(board.averageRatePerMile / config.filterCriteria.minRate, 2),
      loadVolume: Math.min(board.averageLoadsPerDay / 1000, 1),
      compliance: this.calculateComplianceScore(board, config),
      language: this.calculateLanguageScore(board, region),
      timezone: this.calculateTimezoneScore(board, region)
    };

    const weights = {
      marketShare: 0.25,
      avgRate: 0.20,
      loadVolume: 0.20,
      compliance: 0.15,
      language: 0.10,
      timezone: 0.10
    };

    const optimizationScore = Object.entries(factors).reduce((score, [key, value]) => {
      return score + (value * weights[key as keyof typeof weights]);
    }, 0) * 100;

    const recommendations = this.generateRecommendations(board, config, factors);
    const estimatedLoadsPerDay = Math.round(board.averageLoadsPerDay * factors.marketShare * factors.compliance);
    const projectedRevenue = estimatedLoadsPerDay * board.averageRatePerMile * 500; // Assume 500 miles avg

    return {
      boardId: board.id,
      region,
      optimizationScore: Math.round(optimizationScore),
      factors,
      recommendations,
      estimatedLoadsPerDay,
      projectedRevenue
    };
  }

  private calculateComplianceScore(board: RegionalLoadBoard, config: RegionalLoadBoardConfig): number {
    const requiredCompliance = config.complianceSettings.requiredDocuments;
    const boardCompliance = board.regulatoryCompliance;
    
    const matchCount = requiredCompliance.filter(req => 
      boardCompliance.some(comp => comp.toLowerCase().includes(req.toLowerCase()))
    ).length;

    return matchCount / requiredCompliance.length;
  }

  private calculateLanguageScore(board: RegionalLoadBoard, region: string): number {
    const regionLanguages = {
      'north_america': ['en', 'es', 'fr'],
      'central_america': ['es', 'en'],
      'europe': ['en', 'de', 'fr', 'it', 'es']
    };

    const expectedLanguages = regionLanguages[region as keyof typeof regionLanguages] || ['en'];
    const supportedCount = expectedLanguages.filter(lang => 
      board.languageSupport.includes(lang)
    ).length;

    return supportedCount / expectedLanguages.length;
  }

  private calculateTimezoneScore(board: RegionalLoadBoard, region: string): number {
    // Simplified timezone scoring - in practice would be more sophisticated
    const timezoneAlignment = {
      'north_america': ['America/Chicago', 'America/New_York', 'America/Los_Angeles'],
      'central_america': ['America/Guatemala', 'America/Mexico_City'],
      'europe': ['Europe/Berlin', 'Europe/Madrid', 'Europe/London']
    };

    const expectedTimezones = timezoneAlignment[region as keyof typeof timezoneAlignment] || [];
    return expectedTimezones.some(tz => board.operatingHours.timezone.includes(tz.split('/')[1])) ? 1 : 0.7;
  }

  private generateRecommendations(
    board: RegionalLoadBoard, 
    config: RegionalLoadBoardConfig, 
    factors: any
  ): string[] {
    const recommendations: string[] = [];

    if (factors.avgRate < 1.2) {
      recommendations.push('Consider negotiating better rates or focusing on premium loads');
    }

    if (factors.compliance < 0.8) {
      recommendations.push('Ensure all required compliance documents are current');
    }

    if (factors.language < 0.7) {
      recommendations.push('Consider multilingual support for better regional coverage');
    }

    if (board.updateFrequency > 10) {
      recommendations.push('Increase scanning frequency during peak hours');
    }

    if (factors.loadVolume < 0.5) {
      recommendations.push('Consider additional load boards for better coverage');
    }

    return recommendations;
  }

  public switchToRegion(newRegion: string): {
    success: boolean;
    optimizations: LoadBoardOptimization[];
    message: string;
  } {
    console.log(`🔄 Switching to region: ${newRegion}`);

    // Stop existing scanning intervals
    this.scanningIntervals.forEach((interval, region) => {
      clearInterval(interval);
    });
    this.scanningIntervals.clear();

    // Optimize for new region
    const optimizations = this.optimizeForRegion(newRegion);

    if (optimizations.length === 0) {
      return {
        success: false,
        optimizations: [],
        message: `No optimized load boards found for region: ${newRegion}`
      };
    }

    // Start new scanning intervals for the region
    this.startRegionalScanning(newRegion);

    const totalEstimatedLoads = optimizations.reduce((sum, opt) => sum + opt.estimatedLoadsPerDay, 0);
    const totalProjectedRevenue = optimizations.reduce((sum, opt) => sum + opt.projectedRevenue, 0);

    return {
      success: true,
      optimizations,
      message: `Successfully optimized for ${newRegion}. Estimated ${totalEstimatedLoads} loads/day, $${totalProjectedRevenue.toLocaleString()} projected revenue.`
    };
  }

  private startRegionalScanning(region: string): void {
    const config = this.regionalConfigs.get(region);
    if (!config) return;

    // Start scanning interval for this region
    const interval = setInterval(() => {
      this.performRegionalScan(region);
    }, config.schedulingParams.scanInterval * 60 * 1000);

    this.scanningIntervals.set(region, interval);
    console.log(`⏰ Started load board scanning for ${region} every ${config.schedulingParams.scanInterval} minutes`);
  }

  private performRegionalScan(region: string): void {
    const optimizations = this.activeOptimizations.get(region);
    if (!optimizations) return;

    console.log(`🔍 Performing regional load scan for ${region}`);
    
    optimizations.forEach(optimization => {
      const board = this.loadBoards.get(optimization.boardId);
      if (board) {
        console.log(`📊 Scanning ${board.name}: ${optimization.estimatedLoadsPerDay} estimated loads`);
      }
    });
  }

  private startRegionalOptimization(): void {
    // Initialize with North America by default
    this.switchToRegion('north_america');
  }

  public getAllRegionalOptimizations(): Map<string, LoadBoardOptimization[]> {
    return this.activeOptimizations;
  }

  public getLoadBoardsForRegion(region: string): RegionalLoadBoard[] {
    return Array.from(this.loadBoards.values()).filter(board => board.region === region);
  }

  public getOptimizationMetrics(): {
    totalRegions: number;
    totalLoadBoards: number;
    totalEstimatedLoads: number;
    totalProjectedRevenue: number;
    topPerformingBoards: LoadBoardOptimization[];
  } {
    const allOptimizations = Array.from(this.activeOptimizations.values()).flat();
    
    return {
      totalRegions: this.activeOptimizations.size,
      totalLoadBoards: this.loadBoards.size,
      totalEstimatedLoads: allOptimizations.reduce((sum, opt) => sum + opt.estimatedLoadsPerDay, 0),
      totalProjectedRevenue: allOptimizations.reduce((sum, opt) => sum + opt.projectedRevenue, 0),
      topPerformingBoards: allOptimizations
        .sort((a, b) => b.optimizationScore - a.optimizationScore)
        .slice(0, 5)
    };
  }
}

export const regionalLoadBoardOptimizer = new RegionalLoadBoardOptimizer();