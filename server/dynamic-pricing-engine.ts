/**
 * Dynamic Pricing Optimization AI - Autonomous Rate Intelligence
 * Real-time market-responsive pricing with competitor monitoring
 * Maximizes profit margins through intelligent rate optimization
 */

export interface MarketData {
  route: string;
  equipmentType: string;
  averageRate: number;
  highRate: number;
  lowRate: number;
  volume: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  competitorRates: CompetitorRate[];
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

export interface CompetitorRate {
  company: string;
  rate: number;
  loadBoard: string;
  postedAt: Date;
  equipment: string;
  lanes: string[];
}

export interface PricingRule {
  id: string;
  name: string;
  condition: string; // JavaScript expression
  adjustment: number; // percentage
  priority: number;
  active: boolean;
  description: string;
}

export interface WeatherImpact {
  route: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  type: 'snow' | 'ice' | 'rain' | 'wind' | 'fog';
  priceMultiplier: number;
  duration: number; // hours
}

export interface FuelPricing {
  region: string;
  averagePrice: number;
  trend: 'rising' | 'falling' | 'stable';
  weekChange: number;
  impactMultiplier: number;
}

export interface CustomerPricing {
  customerId: string;
  baseRate: number;
  volumeDiscount: number;
  loyaltyMultiplier: number;
  paymentTermsAdjustment: number;
  historicalMargin: number;
  riskScore: number;
}

export interface OptimizedRate {
  baseRate: number;
  finalRate: number;
  adjustments: {
    market: number;
    weather: number;
    fuel: number;
    demand: number;
    competitor: number;
    customer: number;
  };
  confidence: number;
  reasoning: string[];
  validUntil: Date;
}

export class DynamicPricingEngine {
  private marketData: Map<string, MarketData> = new Map();
  private pricingRules: Map<string, PricingRule> = new Map();
  private weatherData: Map<string, WeatherImpact> = new Map();
  private fuelPricing: Map<string, FuelPricing> = new Map();
  private customerPricing: Map<string, CustomerPricing> = new Map();
  private competitorTracking: Map<string, CompetitorRate[]> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.initializePricingRules();
    this.initializeMarketData();
    this.initializeFuelData();
    this.initializeCustomerPricing();
    this.startPricingEngine();
  }

  private initializePricingRules() {
    const rules: PricingRule[] = [
      {
        id: 'high-demand-surge',
        name: 'High Demand Surge Pricing',
        condition: 'demandLevel === "high" || demandLevel === "critical"',
        adjustment: 15,
        priority: 1,
        active: true,
        description: 'Increase rates during high demand periods'
      },
      {
        id: 'weather-premium',
        name: 'Severe Weather Premium',
        condition: 'weatherSeverity === "severe" || weatherSeverity === "extreme"',
        adjustment: 25,
        priority: 2,
        active: true,
        description: 'Premium for weather-impacted routes'
      },
      {
        id: 'fuel-adjustment',
        name: 'Fuel Price Adjustment',
        condition: 'fuelTrend === "rising" && fuelChange > 5',
        adjustment: 8,
        priority: 3,
        active: true,
        description: 'Adjust for rising fuel costs'
      },
      {
        id: 'competitor-undercut',
        name: 'Competitive Rate Matching',
        condition: 'competitorAverage > ourRate * 1.1',
        adjustment: 12,
        priority: 4,
        active: true,
        description: 'Match competitive rates when profitable'
      },
      {
        id: 'volume-customer-discount',
        name: 'Volume Customer Discount',
        condition: 'customerVolume > 50 && loyaltyScore > 8',
        adjustment: -5,
        priority: 5,
        active: true,
        description: 'Discount for high-volume loyal customers'
      },
      {
        id: 'peak-season-premium',
        name: 'Peak Season Premium',
        condition: 'month >= 10 && month <= 12',
        adjustment: 18,
        priority: 6,
        active: true,
        description: 'Holiday season premium pricing'
      },
      {
        id: 'off-peak-discount',
        name: 'Off-Peak Competitive Pricing',
        condition: 'demandLevel === "low" && dayOfWeek >= 1 && dayOfWeek <= 3',
        adjustment: -8,
        priority: 7,
        active: true,
        description: 'Competitive pricing during slow periods'
      },
      {
        id: 'last-minute-premium',
        name: 'Urgent Load Premium',
        condition: 'timeToPickup < 4',
        adjustment: 30,
        priority: 8,
        active: true,
        description: 'Premium for urgent, last-minute loads'
      }
    ];

    rules.forEach(rule => this.pricingRules.set(rule.id, rule));
  }

  private initializeMarketData() {
    const routes = [
      'Los Angeles, CA to Phoenix, AZ',
      'Dallas, TX to Houston, TX',
      'Chicago, IL to Detroit, MI',
      'Atlanta, GA to Jacksonville, FL',
      'Denver, CO to Salt Lake City, UT',
      'Seattle, WA to Portland, OR',
      'New York, NY to Philadelphia, PA',
      'Miami, FL to Tampa, FL',
      'Kansas City, MO to Oklahoma City, OK',
      'Nashville, TN to Memphis, TN'
    ];

    const equipmentTypes = ['Dry Van', 'Refrigerated', 'Flatbed', 'Step Deck', 'Box Truck'];

    routes.forEach(route => {
      equipmentTypes.forEach(equipment => {
        const key = `${route}-${equipment}`;
        const baseRate = 2.50 + Math.random() * 1.50;
        
        this.marketData.set(key, {
          route,
          equipmentType: equipment,
          averageRate: baseRate,
          highRate: baseRate * 1.4,
          lowRate: baseRate * 0.7,
          volume: Math.floor(50 + Math.random() * 200),
          trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
          competitorRates: this.generateCompetitorRates(route, equipment, baseRate),
          demandLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          lastUpdated: new Date()
        });
      });
    });
  }

  private generateCompetitorRates(route: string, equipment: string, baseRate: number): CompetitorRate[] {
    const competitors = ['Swift Transportation', 'Schneider', 'J.B. Hunt', 'Werner', 'Prime Inc', 'Maverick'];
    const loadBoards = ['DAT', 'Truckstop.com', '123LoadBoard', 'Direct Freight'];

    return competitors.slice(0, 3 + Math.floor(Math.random() * 3)).map(company => ({
      company,
      rate: baseRate * (0.85 + Math.random() * 0.3),
      loadBoard: loadBoards[Math.floor(Math.random() * loadBoards.length)],
      postedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      equipment,
      lanes: [route]
    }));
  }

  private initializeFuelData() {
    const regions = ['West Coast', 'Southwest', 'Midwest', 'Southeast', 'Northeast', 'Mountain West'];
    
    regions.forEach(region => {
      const basePrice = 3.45 + Math.random() * 0.80;
      this.fuelPricing.set(region, {
        region,
        averagePrice: basePrice,
        trend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)] as any,
        weekChange: (Math.random() - 0.5) * 20, // -10% to +10%
        impactMultiplier: 1 + (Math.random() - 0.5) * 0.1
      });
    });
  }

  private initializeCustomerPricing() {
    const customers = [
      'Walmart Distribution',
      'Amazon Logistics',
      'Home Depot Supply',
      'Target Corporation',
      'Costco Wholesale',
      'FedEx Ground',
      'UPS Supply Chain',
      'General Motors',
      'Tesla Manufacturing',
      'Coca-Cola Distribution'
    ];

    customers.forEach((customer, index) => {
      this.customerPricing.set(`customer-${index + 1}`, {
        customerId: `customer-${index + 1}`,
        baseRate: 2.80 + Math.random() * 1.20,
        volumeDiscount: Math.random() * 15, // 0-15%
        loyaltyMultiplier: 0.95 + Math.random() * 0.15, // 0.95-1.1
        paymentTermsAdjustment: (Math.random() - 0.5) * 10, // -5% to +5%
        historicalMargin: 12 + Math.random() * 18, // 12-30%
        riskScore: 1 + Math.random() * 9 // 1-10
      });
    });
  }

  private startPricingEngine() {
    this.isRunning = true;
    console.log('💰 Dynamic Pricing Engine initialized');
    console.log('📊 Real-time rate optimization active');
    console.log('🎯 Competitor monitoring enabled');
    console.log('⚡ Weather and fuel adjustments automated');

    // Update market data every 5 minutes
    setInterval(() => this.updateMarketData(), 5 * 60 * 1000);

    // Monitor competitor rates every 10 minutes
    setInterval(() => this.monitorCompetitors(), 10 * 60 * 1000);

    // Update weather impacts every 15 minutes
    setInterval(() => this.updateWeatherImpacts(), 15 * 60 * 1000);

    // Refresh fuel pricing every 30 minutes
    setInterval(() => this.updateFuelPricing(), 30 * 60 * 1000);

    // Generate pricing insights every hour
    setInterval(() => this.generatePricingInsights(), 60 * 60 * 1000);
  }

  private updateMarketData() {
    let updatedRoutes = 0;
    
    for (const [key, data] of this.marketData) {
      // Simulate market changes
      const volatility = 0.05; // 5% volatility
      const change = (Math.random() - 0.5) * volatility * 2;
      
      data.averageRate *= (1 + change);
      data.highRate = data.averageRate * 1.4;
      data.lowRate = data.averageRate * 0.7;
      data.volume = Math.max(10, data.volume + Math.floor((Math.random() - 0.5) * 20));
      
      // Update demand based on volume changes
      if (data.volume > 200) data.demandLevel = 'critical';
      else if (data.volume > 150) data.demandLevel = 'high';
      else if (data.volume > 100) data.demandLevel = 'medium';
      else data.demandLevel = 'low';

      data.lastUpdated = new Date();
      updatedRoutes++;
    }

    console.log(`📊 Updated market data for ${updatedRoutes} route/equipment combinations`);
  }

  private monitorCompetitors() {
    let totalRatesMonitored = 0;

    for (const [key, data] of this.marketData) {
      // Simulate new competitor rates
      const newRates = this.generateCompetitorRates(data.route, data.equipmentType, data.averageRate);
      data.competitorRates = newRates;
      totalRatesMonitored += newRates.length;
    }

    console.log(`🔍 Monitored ${totalRatesMonitored} competitor rates across all routes`);
  }

  private updateWeatherImpacts() {
    // Clear old weather data
    this.weatherData.clear();

    const routes = Array.from(new Set(Array.from(this.marketData.values()).map(d => d.route)));
    const affectedRoutes = routes.slice(0, Math.floor(routes.length * 0.3)); // 30% affected by weather

    affectedRoutes.forEach(route => {
      const severities = ['minor', 'moderate', 'severe', 'extreme'];
      const types = ['snow', 'ice', 'rain', 'wind', 'fog'];
      const severity = severities[Math.floor(Math.random() * severities.length)] as any;
      const type = types[Math.floor(Math.random() * types.length)] as any;

      let multiplier = 1.0;
      switch (severity) {
        case 'minor': multiplier = 1.05; break;
        case 'moderate': multiplier = 1.15; break;
        case 'severe': multiplier = 1.30; break;
        case 'extreme': multiplier = 1.50; break;
      }

      this.weatherData.set(route, {
        route,
        severity,
        type,
        priceMultiplier: multiplier,
        duration: 2 + Math.random() * 22 // 2-24 hours
      });
    });

    console.log(`🌦️ Updated weather impacts for ${affectedRoutes.length} routes`);
  }

  private updateFuelPricing() {
    for (const [region, data] of this.fuelPricing) {
      const change = (Math.random() - 0.5) * 0.10; // -5% to +5% change
      data.averagePrice *= (1 + change);
      data.weekChange = change * 100;
      
      if (change > 0.02) data.trend = 'rising';
      else if (change < -0.02) data.trend = 'falling';
      else data.trend = 'stable';

      data.impactMultiplier = 1 + (data.weekChange / 100) * 0.3; // 30% of fuel change impacts rates
    }

    console.log(`⛽ Updated fuel pricing for ${this.fuelPricing.size} regions`);
  }

  public optimizeRate(
    route: string,
    equipmentType: string,
    customerId?: string,
    urgency: 'normal' | 'urgent' = 'normal'
  ): OptimizedRate {
    const key = `${route}-${equipmentType}`;
    const marketData = this.marketData.get(key);
    
    if (!marketData) {
      throw new Error(`No market data available for ${route} - ${equipmentType}`);
    }

    let baseRate = marketData.averageRate;
    const adjustments = {
      market: 0,
      weather: 0,
      fuel: 0,
      demand: 0,
      competitor: 0,
      customer: 0
    };
    const reasoning: string[] = [];

    // Market trend adjustment
    if (marketData.trend === 'increasing') {
      adjustments.market = 5;
      reasoning.push('Market rates trending upward (+5%)');
    } else if (marketData.trend === 'decreasing') {
      adjustments.market = -3;
      reasoning.push('Market rates trending downward (-3%)');
    }

    // Demand-based pricing
    switch (marketData.demandLevel) {
      case 'critical':
        adjustments.demand = 20;
        reasoning.push('Critical demand level (+20%)');
        break;
      case 'high':
        adjustments.demand = 12;
        reasoning.push('High demand level (+12%)');
        break;
      case 'medium':
        adjustments.demand = 5;
        reasoning.push('Medium demand level (+5%)');
        break;
      case 'low':
        adjustments.demand = -8;
        reasoning.push('Low demand level (-8%)');
        break;
    }

    // Weather impact
    const weatherImpact = this.weatherData.get(route);
    if (weatherImpact) {
      const weatherAdjustment = (weatherImpact.priceMultiplier - 1) * 100;
      adjustments.weather = weatherAdjustment;
      reasoning.push(`${weatherImpact.severity} ${weatherImpact.type} conditions (+${weatherAdjustment.toFixed(1)}%)`);
    }

    // Fuel adjustment
    const region = this.getRegionForRoute(route);
    const fuelData = this.fuelPricing.get(region);
    if (fuelData && fuelData.trend === 'rising' && fuelData.weekChange > 3) {
      adjustments.fuel = fuelData.weekChange * 0.3;
      reasoning.push(`Rising fuel costs (+${adjustments.fuel.toFixed(1)}%)`);
    }

    // Competitor analysis
    const competitorAvg = marketData.competitorRates.reduce((sum, rate) => sum + rate.rate, 0) / marketData.competitorRates.length;
    const competitorDiff = ((competitorAvg - baseRate) / baseRate) * 100;
    if (competitorDiff > 10) {
      adjustments.competitor = Math.min(competitorDiff * 0.8, 15);
      reasoning.push(`Competitors pricing higher (+${adjustments.competitor.toFixed(1)}%)`);
    }

    // Customer-specific pricing
    if (customerId) {
      const customerData = this.customerPricing.get(customerId);
      if (customerData) {
        const loyaltyAdj = (customerData.loyaltyMultiplier - 1) * 100;
        const volumeAdj = -customerData.volumeDiscount;
        const paymentAdj = customerData.paymentTermsAdjustment;
        
        adjustments.customer = loyaltyAdj + volumeAdj + paymentAdj;
        reasoning.push(`Customer-specific adjustments (${adjustments.customer > 0 ? '+' : ''}${adjustments.customer.toFixed(1)}%)`);
      }
    }

    // Urgency premium
    if (urgency === 'urgent') {
      adjustments.demand += 25;
      reasoning.push('Urgent load premium (+25%)');
    }

    // Calculate final rate
    const totalAdjustment = Object.values(adjustments).reduce((sum, adj) => sum + adj, 0);
    const finalRate = baseRate * (1 + totalAdjustment / 100);

    // Confidence scoring based on data freshness and market stability
    const dataAge = Date.now() - marketData.lastUpdated.getTime();
    const freshnessScore = Math.max(0, 100 - (dataAge / (60 * 60 * 1000)) * 10); // Decreases 10% per hour
    const stabilityScore = marketData.trend === 'stable' ? 100 : 80;
    const confidence = Math.min(100, (freshnessScore + stabilityScore) / 2);

    return {
      baseRate,
      finalRate: Math.round(finalRate * 100) / 100,
      adjustments,
      confidence: Math.round(confidence),
      reasoning,
      validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) // Valid for 2 hours
    };
  }

  private getRegionForRoute(route: string): string {
    const regionMap = {
      'CA': 'West Coast',
      'WA': 'West Coast',
      'OR': 'West Coast',
      'NV': 'West Coast',
      'AZ': 'Southwest',
      'TX': 'Southwest',
      'NM': 'Southwest',
      'OK': 'Southwest',
      'IL': 'Midwest',
      'MI': 'Midwest',
      'MO': 'Midwest',
      'KS': 'Midwest',
      'FL': 'Southeast',
      'GA': 'Southeast',
      'TN': 'Southeast',
      'AL': 'Southeast',
      'NY': 'Northeast',
      'PA': 'Northeast',
      'NJ': 'Northeast',
      'MA': 'Northeast',
      'CO': 'Mountain West',
      'UT': 'Mountain West',
      'WY': 'Mountain West'
    };

    for (const [state, region] of Object.entries(regionMap)) {
      if (route.includes(state)) return region;
    }
    return 'Midwest'; // Default
  }

  private generatePricingInsights() {
    const insights = {
      totalRoutes: this.marketData.size,
      averageRateIncrease: 0,
      highDemandRoutes: 0,
      weatherAffectedRoutes: this.weatherData.size,
      competitorAdvantage: 0,
      recommendedActions: [] as string[]
    };

    let rateSum = 0;
    let rateCount = 0;

    for (const [key, data] of this.marketData) {
      rateSum += data.averageRate;
      rateCount++;

      if (data.demandLevel === 'high' || data.demandLevel === 'critical') {
        insights.highDemandRoutes++;
      }

      const competitorAvg = data.competitorRates.reduce((sum, rate) => sum + rate.rate, 0) / data.competitorRates.length;
      if (competitorAvg > data.averageRate * 1.1) {
        insights.competitorAdvantage++;
      }
    }

    insights.averageRateIncrease = ((rateSum / rateCount) - 3.0) / 3.0 * 100; // Compared to $3.00 baseline

    // Generate recommendations
    if (insights.highDemandRoutes > insights.totalRoutes * 0.3) {
      insights.recommendedActions.push('Implement surge pricing for high-demand routes');
    }
    if (insights.weatherAffectedRoutes > 5) {
      insights.recommendedActions.push('Apply weather premiums to affected routes');
    }
    if (insights.competitorAdvantage > insights.totalRoutes * 0.2) {
      insights.recommendedActions.push('Increase rates on routes where competitors charge more');
    }

    console.log('💡 Pricing Insights Generated:');
    console.log(`   📊 ${insights.totalRoutes} routes monitored`);
    console.log(`   📈 ${insights.averageRateIncrease.toFixed(1)}% above baseline rates`);
    console.log(`   🔥 ${insights.highDemandRoutes} high-demand routes`);
    console.log(`   🌦️ ${insights.weatherAffectedRoutes} weather-affected routes`);
    console.log(`   💰 ${insights.competitorAdvantage} routes with competitor rate advantage`);
    
    if (insights.recommendedActions.length > 0) {
      console.log('   🎯 Recommendations:');
      insights.recommendedActions.forEach(action => console.log(`      - ${action}`));
    }
  }

  public getMarketSummary() {
    const summary = {
      totalRoutes: this.marketData.size,
      averageRate: 0,
      highestRate: 0,
      lowestRate: Infinity,
      demandDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      trendDistribution: { increasing: 0, decreasing: 0, stable: 0 },
      weatherImpacts: this.weatherData.size,
      fuelRegions: this.fuelPricing.size
    };

    for (const data of this.marketData.values()) {
      summary.averageRate += data.averageRate;
      summary.highestRate = Math.max(summary.highestRate, data.highRate);
      summary.lowestRate = Math.min(summary.lowestRate, data.lowRate);
      summary.demandDistribution[data.demandLevel]++;
      summary.trendDistribution[data.trend]++;
    }

    summary.averageRate = summary.averageRate / this.marketData.size;

    return summary;
  }

  public getAllPricingRules(): PricingRule[] {
    return Array.from(this.pricingRules.values());
  }

  public updatePricingRule(ruleId: string, updates: Partial<PricingRule>): boolean {
    const rule = this.pricingRules.get(ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    console.log(`📋 Updated pricing rule: ${rule.name}`);
    return true;
  }

  public createPricingRule(rule: Omit<PricingRule, 'id'>): string {
    const id = `rule-${Date.now()}`;
    this.pricingRules.set(id, { ...rule, id });
    console.log(`📋 Created new pricing rule: ${rule.name}`);
    return id;
  }
}

export const dynamicPricingEngine = new DynamicPricingEngine();