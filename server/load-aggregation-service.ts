export interface LoadAggregationConfig {
  subscriptions: {
    datLoadboard: {
      active: boolean;
      monthlyFee: number;
      apiKey?: string;
      maxRequestsPerDay: number;
    };
    truckstop: {
      active: boolean;
      monthlyFee: number;
      apiKey?: string;
      maxRequestsPerDay: number;
    };
    chRobinson: {
      active: boolean;
      monthlyFee: number;
      apiKey?: string;
      maxRequestsPerDay: number;
    };
    convoy: {
      active: boolean;
      monthlyFee: number;
      apiKey?: string;
      maxRequestsPerDay: number;
    };
  };
  aggregationSettings: {
    pollingIntervalMinutes: number;
    dataRetentionHours: number;
    duplicateDetection: boolean;
    priceEnhancement: boolean;
    aiFiltering: boolean;
  };
  distributionModel: {
    driverSubscriptionFee: number; // What you charge drivers
    freeLoadsPerDay: number; // For free tier
    premiumLoadsUnlimited: boolean;
    priorityAccess: boolean;
  };
}

export interface AggregatedLoad {
  id: string;
  originalId: string;
  source: string;
  aggregatedAt: Date;
  priority: 'premium' | 'standard' | 'filtered';
  
  // Standard load data
  origin: {
    city: string;
    state: string;
    zip?: string;
    coordinates?: { lat: number; lng: number };
  };
  destination: {
    city: string;
    state: string;
    zip?: string;
    coordinates?: { lat: number; lng: number };
  };
  equipment: string;
  weight: number;
  commodity: string;
  rate: number;
  ratePerMile: number;
  mileage: number;
  pickupDate: Date;
  deliveryDate?: Date;
  
  // Enhanced data from your AI
  aiEnhancements: {
    rateOptimization: {
      suggestedRate: number;
      marketComparison: string;
      negotiationTips: string[];
    };
    routeOptimization: {
      fuelCost: number;
      estimatedTime: number;
      weatherAlerts: string[];
      traffcWarnings: string[];
    };
    profitabilityScore: number; // 1-100
    riskAssessment: {
      brokerRating: number;
      paymentHistory: string;
      loadComplexity: string;
    };
  };
  
  // Broker information
  broker: {
    name: string;
    contact: string;
    mcNumber?: string;
    rating?: number;
    paymentTerms: string;
  };
}

export interface DriverSubscription {
  driverId: number;
  plan: 'free' | 'premium' | 'enterprise';
  monthlyFee: number;
  startDate: Date;
  status: 'active' | 'suspended' | 'cancelled';
  usage: {
    loadsViewedToday: number;
    loadsViewedMonth: number;
    premiumFeaturesUsed: string[];
  };
  preferences: {
    equipmentTypes: string[];
    preferredRegions: string[];
    minRate: number;
    maxMiles: number;
    homeBase: { lat: number; lng: number };
  };
}

export interface LoadDistributionMetrics {
  totalLoadsAggregated: number;
  uniqueLoadsAfterDeduplication: number;
  loadsDistributedToDrivers: number;
  averageEnhancementTime: number; // ms
  subscriptionRevenue: number;
  costSavingsForDrivers: number;
  profitMargin: number;
}

export class LoadAggregationService {
  private config: LoadAggregationConfig;
  private aggregatedLoads: Map<string, AggregatedLoad> = new Map();
  private driverSubscriptions: Map<number, DriverSubscription> = new Map();
  private lastPollingTime: Date = new Date();
  private dailyStats: LoadDistributionMetrics;

  constructor() {
    this.config = this.initializeConfig();
    this.dailyStats = this.initializeMetrics();
    this.initializeDriverSubscriptions();
    this.startLoadAggregation();
  }

  private initializeConfig(): LoadAggregationConfig {
    return {
      subscriptions: {
        datLoadboard: {
          active: !!process.env.DAT_API_KEY,
          monthlyFee: 149, // What you pay DAT
          apiKey: process.env.DAT_API_KEY,
          maxRequestsPerDay: 10000
        },
        truckstop: {
          active: !!process.env.TRUCKSTOP_API_KEY,
          monthlyFee: 129, // What you pay Truckstop
          apiKey: process.env.TRUCKSTOP_API_KEY,
          maxRequestsPerDay: 8000
        },
        chRobinson: {
          active: !!process.env.CHROBINSON_API_KEY,
          monthlyFee: 299, // Enterprise pricing
          apiKey: process.env.CHROBINSON_API_KEY,
          maxRequestsPerDay: 20000
        },
        convoy: {
          active: !!process.env.CONVOY_API_KEY,
          monthlyFee: 199,
          apiKey: process.env.CONVOY_API_KEY,
          maxRequestsPerDay: 12000
        }
      },
      aggregationSettings: {
        pollingIntervalMinutes: 5,
        dataRetentionHours: 24,
        duplicateDetection: true,
        priceEnhancement: true,
        aiFiltering: true
      },
      distributionModel: {
        driverSubscriptionFee: 79, // What you charge drivers (vs $149 they'd pay DAT)
        freeLoadsPerDay: 10,
        premiumLoadsUnlimited: true,
        priorityAccess: true
      }
    };
  }

  private initializeMetrics(): LoadDistributionMetrics {
    return {
      totalLoadsAggregated: 0,
      uniqueLoadsAfterDeduplication: 0,
      loadsDistributedToDrivers: 0,
      averageEnhancementTime: 0,
      subscriptionRevenue: 0,
      costSavingsForDrivers: 0,
      profitMargin: 0
    };
  }

  private initializeDriverSubscriptions() {
    // Create sample driver subscriptions
    const subscriptions = [
      { driverId: 1, plan: 'premium' as const, fee: 79 },
      { driverId: 2, plan: 'free' as const, fee: 0 },
      { driverId: 3, plan: 'premium' as const, fee: 79 },
      { driverId: 4, plan: 'enterprise' as const, fee: 149 },
      { driverId: 5, plan: 'premium' as const, fee: 79 }
    ];

    subscriptions.forEach(sub => {
      const subscription: DriverSubscription = {
        driverId: sub.driverId,
        plan: sub.plan,
        monthlyFee: sub.fee,
        startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        usage: {
          loadsViewedToday: Math.floor(Math.random() * 50),
          loadsViewedMonth: Math.floor(Math.random() * 500),
          premiumFeaturesUsed: ['ai_optimization', 'rate_analysis', 'route_planning']
        },
        preferences: {
          equipmentTypes: ['Van', 'Reefer'],
          preferredRegions: ['Southeast', 'Texas'],
          minRate: 2.50,
          maxMiles: 500,
          homeBase: { lat: 33.4484, lng: -84.3917 } // Atlanta
        }
      };
      this.driverSubscriptions.set(sub.driverId, subscription);
    });
  }

  private startLoadAggregation() {
    // Poll every 5 minutes for new loads
    setInterval(() => {
      this.aggregateLoadsFromAllSources();
    }, this.config.aggregationSettings.pollingIntervalMinutes * 60 * 1000);

    // Clean up old loads every hour
    setInterval(() => {
      this.cleanupExpiredLoads();
    }, 60 * 60 * 1000);

    // Initial aggregation
    this.aggregateLoadsFromAllSources();
  }

  private async aggregateLoadsFromAllSources() {
    console.log('🔄 Starting load aggregation from all sources...');
    
    const startTime = Date.now();
    let newLoadsCount = 0;

    // DAT LoadBoard
    if (this.config.subscriptions.datLoadboard.active) {
      const datLoads = await this.fetchDATLoads();
      newLoadsCount += datLoads.length;
    }

    // Truckstop.com
    if (this.config.subscriptions.truckstop.active) {
      const truckstopLoads = await this.fetchTruckstopLoads();
      newLoadsCount += truckstopLoads.length;
    }

    // CH Robinson
    if (this.config.subscriptions.chRobinson.active) {
      const chRobinsonLoads = await this.fetchCHRobinsonLoads();
      newLoadsCount += chRobinsonLoads.length;
    }

    // Convoy
    if (this.config.subscriptions.convoy.active) {
      const convoyLoads = await this.fetchConvoyLoads();
      newLoadsCount += convoyLoads.length;
    }

    const processingTime = Date.now() - startTime;
    this.dailyStats.averageEnhancementTime = processingTime;
    this.dailyStats.totalLoadsAggregated += newLoadsCount;

    console.log(`✅ Aggregated ${newLoadsCount} new loads in ${processingTime}ms`);
    this.updateRevenueMeterics();
  }

  private async fetchDATLoads(): Promise<AggregatedLoad[]> {
    // Simulate DAT API call - replace with actual DAT API integration
    return this.simulateLoadFetch('DAT LoadBoard', 50);
  }

  private async fetchTruckstopLoads(): Promise<AggregatedLoad[]> {
    // Simulate Truckstop API call - replace with actual Truckstop API integration
    return this.simulateLoadFetch('Truckstop.com', 30);
  }

  private async fetchCHRobinsonLoads(): Promise<AggregatedLoad[]> {
    // Simulate CH Robinson API call - replace with actual CH Robinson API integration
    return this.simulateLoadFetch('CH Robinson', 25);
  }

  private async fetchConvoyLoads(): Promise<AggregatedLoad[]> {
    // Simulate Convoy API call - replace with actual Convoy API integration
    return this.simulateLoadFetch('Convoy', 20);
  }

  private simulateLoadFetch(source: string, count: number): AggregatedLoad[] {
    const loads: AggregatedLoad[] = [];
    
    for (let i = 0; i < count; i++) {
      const loadId = `${source.toLowerCase().replace(/[^a-z]/g, '')}_${Date.now()}_${i}`;
      const rate = Math.floor(Math.random() * 2000) + 1500;
      const mileage = Math.floor(Math.random() * 800) + 200;
      
      const load: AggregatedLoad = {
        id: loadId,
        originalId: `${source}_${Math.random().toString(36).substring(2, 8)}`,
        source,
        aggregatedAt: new Date(),
        priority: Math.random() > 0.7 ? 'premium' : 'standard',
        
        origin: {
          city: this.getRandomCity(),
          state: this.getRandomState(),
          zip: `${Math.floor(Math.random() * 90000) + 10000}`
        },
        destination: {
          city: this.getRandomCity(),
          state: this.getRandomState(),
          zip: `${Math.floor(Math.random() * 90000) + 10000}`
        },
        equipment: this.getRandomEquipment(),
        weight: Math.floor(Math.random() * 40000) + 5000,
        commodity: this.getRandomCommodity(),
        rate,
        ratePerMile: Number((rate / mileage).toFixed(2)),
        mileage,
        pickupDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        
        aiEnhancements: {
          rateOptimization: {
            suggestedRate: rate + Math.floor(Math.random() * 300),
            marketComparison: 'Above market average',
            negotiationTips: ['Mention fuel costs', 'Highlight quick delivery', 'Reference clean driving record']
          },
          routeOptimization: {
            fuelCost: Math.floor(mileage * 0.15 * 4.50),
            estimatedTime: Math.floor(mileage / 55),
            weatherAlerts: [],
            traffcWarnings: []
          },
          profitabilityScore: Math.floor(Math.random() * 40) + 60,
          riskAssessment: {
            brokerRating: Math.floor(Math.random() * 3) + 3,
            paymentHistory: 'Excellent',
            loadComplexity: 'Standard'
          }
        },
        
        broker: {
          name: this.getRandomBroker(),
          contact: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          mcNumber: `MC${Math.floor(Math.random() * 900000) + 100000}`,
          rating: Math.floor(Math.random() * 2) + 4,
          paymentTerms: 'Net 30'
        }
      };

      this.aggregatedLoads.set(loadId, load);
      loads.push(load);
    }

    return loads;
  }

  private getRandomCity(): string {
    const cities = ['Atlanta', 'Dallas', 'Chicago', 'Los Angeles', 'Miami', 'Denver', 'Phoenix', 'Seattle'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private getRandomState(): string {
    const states = ['GA', 'TX', 'IL', 'CA', 'FL', 'CO', 'AZ', 'WA'];
    return states[Math.floor(Math.random() * states.length)];
  }

  private getRandomEquipment(): string {
    const equipment = ['Van', 'Reefer', 'Flatbed', 'Stepdeck', 'Lowboy'];
    return equipment[Math.floor(Math.random() * equipment.length)];
  }

  private getRandomCommodity(): string {
    const commodities = ['General Freight', 'Food Products', 'Electronics', 'Machinery', 'Construction Materials'];
    return commodities[Math.floor(Math.random() * commodities.length)];
  }

  private getRandomBroker(): string {
    const brokers = ['FreightCorp', 'LogiSolutions', 'TransportPro', 'LoadMaster', 'CargoLink'];
    return brokers[Math.floor(Math.random() * brokers.length)];
  }

  private cleanupExpiredLoads() {
    const cutoffTime = Date.now() - (this.config.aggregationSettings.dataRetentionHours * 60 * 60 * 1000);
    
    for (const [loadId, load] of this.aggregatedLoads) {
      if (load.aggregatedAt.getTime() < cutoffTime) {
        this.aggregatedLoads.delete(loadId);
      }
    }
  }

  private updateRevenueMeterics() {
    // Calculate subscription revenue
    let subscriptionRevenue = 0;
    let driverCostSavings = 0;
    
    this.driverSubscriptions.forEach(sub => {
      if (sub.status === 'active') {
        subscriptionRevenue += sub.monthlyFee;
        
        // Calculate savings vs paying for each service individually
        const individualCosts = 149 + 129 + 299; // DAT + Truckstop + CH Robinson
        driverCostSavings += (individualCosts - sub.monthlyFee);
      }
    });

    // Calculate your costs
    const monthlyCosts = Object.values(this.config.subscriptions)
      .filter(sub => sub.active)
      .reduce((sum, sub) => sum + sub.monthlyFee, 0);

    this.dailyStats.subscriptionRevenue = subscriptionRevenue;
    this.dailyStats.costSavingsForDrivers = driverCostSavings;
    this.dailyStats.profitMargin = subscriptionRevenue - monthlyCosts;
  }

  // Public API methods
  public getLoadsForDriver(driverId: number, filters?: any): AggregatedLoad[] {
    const subscription = this.driverSubscriptions.get(driverId);
    if (!subscription || subscription.status !== 'active') {
      return [];
    }

    let availableLoads = Array.from(this.aggregatedLoads.values());

    // Apply subscription limits
    if (subscription.plan === 'free') {
      if (subscription.usage.loadsViewedToday >= this.config.distributionModel.freeLoadsPerDay) {
        return [];
      }
      // Only show standard loads for free users
      availableLoads = availableLoads.filter(load => load.priority === 'standard');
    }

    // Apply driver preferences
    if (subscription.preferences) {
      availableLoads = availableLoads.filter(load => {
        return subscription.preferences.equipmentTypes.includes(load.equipment) &&
               load.ratePerMile >= subscription.preferences.minRate &&
               load.mileage <= subscription.preferences.maxMiles;
      });
    }

    // Sort by profitability score
    availableLoads.sort((a, b) => b.aiEnhancements.profitabilityScore - a.aiEnhancements.profitabilityScore);

    // Update usage stats
    subscription.usage.loadsViewedToday += Math.min(availableLoads.length, 50);

    return availableLoads.slice(0, subscription.plan === 'free' ? 10 : 100);
  }

  public getSubscriptionPlans(): any[] {
    return [
      {
        name: 'Free',
        price: 0,
        features: [
          '10 loads per day',
          'Standard loads only',
          'Basic AI filtering',
          'Email support'
        ],
        savings: 'vs $577/month for individual subscriptions'
      },
      {
        name: 'Premium',
        price: 79,
        features: [
          'Unlimited loads',
          'Premium and standard loads',
          'Full AI optimization',
          'Rate negotiation tips',
          'Route optimization',
          'Priority support'
        ],
        savings: 'Save $498/month vs individual subscriptions',
        popular: true
      },
      {
        name: 'Enterprise',
        price: 149,
        features: [
          'Everything in Premium',
          'Priority load access',
          'Custom AI training',
          'Dedicated account manager',
          'API access',
          'White-label options'
        ],
        savings: 'Save $428/month vs individual subscriptions'
      }
    ];
  }

  public getAggregationMetrics(): LoadDistributionMetrics & {
    businessMetrics: {
      totalSubscriptions: number;
      monthlyRevenue: number;
      monthlyCosts: number;
      netProfit: number;
      profitMargin: number;
      driverSavings: number;
    };
  } {
    const activeSubscriptions = Array.from(this.driverSubscriptions.values())
      .filter(sub => sub.status === 'active');

    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => sum + sub.monthlyFee, 0);
    const monthlyCosts = Object.values(this.config.subscriptions)
      .filter(sub => sub.active)
      .reduce((sum, sub) => sum + sub.monthlyFee, 0);

    return {
      ...this.dailyStats,
      businessMetrics: {
        totalSubscriptions: activeSubscriptions.length,
        monthlyRevenue,
        monthlyCosts,
        netProfit: monthlyRevenue - monthlyCosts,
        profitMargin: monthlyRevenue > 0 ? ((monthlyRevenue - monthlyCosts) / monthlyRevenue) * 100 : 0,
        driverSavings: this.dailyStats.costSavingsForDrivers
      }
    };
  }

  public subscribeDriver(driverId: number, plan: 'free' | 'premium' | 'enterprise'): boolean {
    const planPricing = { free: 0, premium: 79, enterprise: 149 };
    
    const subscription: DriverSubscription = {
      driverId,
      plan,
      monthlyFee: planPricing[plan],
      startDate: new Date(),
      status: 'active',
      usage: {
        loadsViewedToday: 0,
        loadsViewedMonth: 0,
        premiumFeaturesUsed: []
      },
      preferences: {
        equipmentTypes: ['Van'],
        preferredRegions: ['US'],
        minRate: 2.00,
        maxMiles: 1000,
        homeBase: { lat: 39.8283, lng: -98.5795 } // Center of US
      }
    };

    this.driverSubscriptions.set(driverId, subscription);
    return true;
  }

  public getDriverSubscription(driverId: number): DriverSubscription | undefined {
    return this.driverSubscriptions.get(driverId);
  }

  public getAllLoads(): AggregatedLoad[] {
    return Array.from(this.aggregatedLoads.values());
  }

  public getActiveSubscriptions(): DriverSubscription[] {
    return Array.from(this.driverSubscriptions.values())
      .filter(sub => sub.status === 'active');
  }
}

export const loadAggregationService = new LoadAggregationService();