import OpenAI from "openai";

export interface RateBenchmark {
  lane: string;
  equipment: string;
  currentMarketRate: {
    average: number;
    low: number;
    high: number;
    samples: number;
  };
  driverRate: number;
  comparison: {
    vsMarketAverage: {
      difference: number;
      percentage: number;
      status: 'above' | 'below' | 'at_market';
    };
    vsMarketHigh: {
      difference: number;
      percentage: number;
    };
    potentialUpside: number;
  };
  brokerAnalysis: {
    brokerName: string;
    brokerRating: number;
    typicalRates: {
      low: number;
      high: number;
      average: number;
    };
    negotiationPotential: 'high' | 'medium' | 'low';
  };
  marketTrends: {
    direction: 'increasing' | 'decreasing' | 'stable';
    velocity: number; // percentage change per week
    seasonalFactor: number;
    demandLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  recommendations: string[];
  lastUpdated: Date;
}

export interface MarketSnapshot {
  totalLanes: number;
  averageRate: number;
  medianRate: number;
  rateRange: {
    min: number;
    max: number;
  };
  topPerformingLanes: Array<{
    lane: string;
    rate: number;
    trend: string;
  }>;
  marketConditions: {
    fuelPrice: number;
    capacity: 'tight' | 'balanced' | 'loose';
    seasonality: string;
  };
  generatedAt: Date;
}

export class RealTimeRateBenchmarking {
  private openai: OpenAI;
  private rateBenchmarks: Map<string, RateBenchmark> = new Map();
  private marketSnapshot: MarketSnapshot | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.initializeBenchmarking();
  }

  private async initializeBenchmarking() {
    console.log('📊 Initializing real-time rate benchmarking...');
    
    // Initialize with sample data
    await this.generateSampleBenchmarks();
    await this.updateMarketSnapshot();
    
    // Update benchmarks every 15 minutes
    setInterval(() => {
      this.updateAllBenchmarks();
    }, 15 * 60 * 1000);

    // Update market snapshot every hour
    setInterval(() => {
      this.updateMarketSnapshot();
    }, 60 * 60 * 1000);

    this.isInitialized = true;
    console.log('✅ Rate benchmarking engine started');
  }

  private async generateSampleBenchmarks() {
    const sampleLanes = [
      { origin: 'Denver, CO', destination: 'Phoenix, AZ', equipment: 'Dry Van', miles: 1200 },
      { origin: 'Atlanta, GA', destination: 'Miami, FL', equipment: 'Reefer', miles: 650 },
      { origin: 'Chicago, IL', destination: 'Los Angeles, CA', equipment: 'Dry Van', miles: 2100 },
      { origin: 'Dallas, TX', destination: 'Houston, TX', equipment: 'Flatbed', miles: 240 },
      { origin: 'Seattle, WA', destination: 'Portland, OR', equipment: 'Dry Van', miles: 180 }
    ];

    for (const lane of sampleLanes) {
      const benchmark = await this.generateBenchmarkForLane(lane);
      const key = `${lane.origin}-${lane.destination}-${lane.equipment}`;
      this.rateBenchmarks.set(key, benchmark);
    }
  }

  private async generateBenchmarkForLane(lane: any): Promise<RateBenchmark> {
    const laneKey = `${lane.origin} to ${lane.destination}`;
    const baseRate = lane.miles * (1.8 + Math.random() * 1.0); // $1.80-$2.80 per mile base
    
    // Generate market rate variations
    const marketLow = baseRate * 0.85;
    const marketHigh = baseRate * 1.25;
    const marketAverage = baseRate;
    const driverRate = baseRate * (0.90 + Math.random() * 0.20); // Driver's current rate

    const currentMarketRate = {
      average: Math.round(marketAverage),
      low: Math.round(marketLow),
      high: Math.round(marketHigh),
      samples: Math.floor(Math.random() * 50) + 20
    };

    const comparison = {
      vsMarketAverage: {
        difference: Math.round(driverRate - marketAverage),
        percentage: Math.round(((driverRate - marketAverage) / marketAverage) * 100),
        status: (driverRate > marketAverage ? 'above' : driverRate < marketAverage ? 'below' : 'at_market') as 'above' | 'below' | 'at_market'
      },
      vsMarketHigh: {
        difference: Math.round(driverRate - marketHigh),
        percentage: Math.round(((driverRate - marketHigh) / marketHigh) * 100)
      },
      potentialUpside: Math.round(marketHigh - driverRate)
    };

    const brokers = ['C.H. Robinson', 'XPO Logistics', 'J.B. Hunt', 'Schneider', 'Knight Transportation'];
    const selectedBroker = brokers[Math.floor(Math.random() * brokers.length)];

    const brokerAnalysis = {
      brokerName: selectedBroker,
      brokerRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      typicalRates: {
        low: Math.round(marketLow * 1.05),
        high: Math.round(marketHigh * 0.95),
        average: Math.round(marketAverage * 1.02)
      },
      negotiationPotential: (Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };

    const trends = ['increasing', 'decreasing', 'stable'];
    const demands = ['low', 'medium', 'high', 'critical'];

    const marketTrends = {
      direction: trends[Math.floor(Math.random() * trends.length)] as 'increasing' | 'decreasing' | 'stable',
      velocity: (Math.random() - 0.5) * 10, // -5% to +5% per week
      seasonalFactor: 0.95 + Math.random() * 0.10, // 0.95 to 1.05
      demandLevel: demands[Math.floor(Math.random() * demands.length)] as 'low' | 'medium' | 'high' | 'critical'
    };

    const recommendations = this.generateRecommendations(comparison, brokerAnalysis, marketTrends);

    return {
      lane: laneKey,
      equipment: lane.equipment,
      currentMarketRate,
      driverRate: Math.round(driverRate),
      comparison,
      brokerAnalysis,
      marketTrends,
      recommendations,
      lastUpdated: new Date()
    };
  }

  private generateRecommendations(comparison: any, brokerAnalysis: any, trends: any): string[] {
    const recommendations: string[] = [];

    if (comparison.vsMarketAverage.status === 'below') {
      if (Math.abs(comparison.vsMarketAverage.percentage) > 15) {
        recommendations.push(`Rate is ${Math.abs(comparison.vsMarketAverage.percentage)}% below market - strong negotiation opportunity`);
      } else {
        recommendations.push('Rate slightly below market average - consider negotiating');
      }
    } else if (comparison.vsMarketAverage.status === 'above') {
      recommendations.push(`Excellent rate - ${comparison.vsMarketAverage.percentage}% above market average`);
    }

    if (brokerAnalysis.negotiationPotential === 'high') {
      recommendations.push(`${brokerAnalysis.brokerName} typically negotiates - try for $${brokerAnalysis.typicalRates.high}`);
    }

    if (trends.direction === 'increasing' && trends.velocity > 2) {
      recommendations.push('Market rates trending up - good time to negotiate higher rates');
    } else if (trends.direction === 'decreasing') {
      recommendations.push('Market rates declining - secure loads quickly at current rates');
    }

    if (trends.demandLevel === 'high' || trends.demandLevel === 'critical') {
      recommendations.push('High demand market - drivers have negotiation leverage');
    }

    if (comparison.potentialUpside > 500) {
      recommendations.push(`Potential upside of $${comparison.potentialUpside} - worth pursuing higher rates`);
    }

    return recommendations;
  }

  private async updateAllBenchmarks() {
    console.log('🔄 Updating rate benchmarks...');
    
    for (const [key, benchmark] of this.rateBenchmarks) {
      // Simulate market fluctuations
      const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
      benchmark.currentMarketRate.average = Math.round(benchmark.currentMarketRate.average * (1 + fluctuation));
      benchmark.currentMarketRate.low = Math.round(benchmark.currentMarketRate.average * 0.85);
      benchmark.currentMarketRate.high = Math.round(benchmark.currentMarketRate.average * 1.25);
      
      // Update comparisons
      benchmark.comparison.vsMarketAverage.difference = Math.round(benchmark.driverRate - benchmark.currentMarketRate.average);
      benchmark.comparison.vsMarketAverage.percentage = Math.round(((benchmark.driverRate - benchmark.currentMarketRate.average) / benchmark.currentMarketRate.average) * 100);
      benchmark.comparison.potentialUpside = Math.round(benchmark.currentMarketRate.high - benchmark.driverRate);
      
      // Update trends
      benchmark.marketTrends.velocity = (Math.random() - 0.5) * 10;
      benchmark.lastUpdated = new Date();
      
      this.rateBenchmarks.set(key, benchmark);
    }
  }

  private async updateMarketSnapshot() {
    const benchmarks = Array.from(this.rateBenchmarks.values());
    
    if (benchmarks.length === 0) return;

    const rates = benchmarks.map(b => b.currentMarketRate.average);
    const totalLanes = benchmarks.length;
    const averageRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const sortedRates = rates.sort((a, b) => a - b);
    const medianRate = sortedRates[Math.floor(sortedRates.length / 2)];

    const topPerformingLanes = benchmarks
      .sort((a, b) => b.currentMarketRate.average - a.currentMarketRate.average)
      .slice(0, 3)
      .map(b => ({
        lane: b.lane,
        rate: b.currentMarketRate.average,
        trend: b.marketTrends.direction
      }));

    this.marketSnapshot = {
      totalLanes,
      averageRate: Math.round(averageRate),
      medianRate: Math.round(medianRate),
      rateRange: {
        min: Math.min(...rates),
        max: Math.max(...rates)
      },
      topPerformingLanes,
      marketConditions: {
        fuelPrice: 3.65 + (Math.random() - 0.5) * 0.5, // $3.40-$3.90
        capacity: ['tight', 'balanced', 'loose'][Math.floor(Math.random() * 3)] as 'tight' | 'balanced' | 'loose',
        seasonality: this.getCurrentSeasonality()
      },
      generatedAt: new Date()
    };
  }

  private getCurrentSeasonality(): string {
    const month = new Date().getMonth();
    if (month >= 10 || month <= 1) return 'Peak shipping season';
    if (month >= 5 && month <= 8) return 'Summer freight season';
    return 'Standard shipping season';
  }

  public async getBenchmarkForRoute(origin: string, destination: string, equipment: string): Promise<RateBenchmark | null> {
    const key = `${origin}-${destination}-${equipment}`;
    let benchmark = this.rateBenchmarks.get(key);
    
    if (!benchmark) {
      // Generate new benchmark for this route
      benchmark = await this.generateBenchmarkForLane({ origin, destination, equipment, miles: 1000 });
      this.rateBenchmarks.set(key, benchmark);
    }
    
    return benchmark;
  }

  public getAllBenchmarks(): RateBenchmark[] {
    return Array.from(this.rateBenchmarks.values());
  }

  public getMarketSnapshot(): MarketSnapshot | null {
    return this.marketSnapshot;
  }

  public async analyzeDriverRate(driverRate: number, origin: string, destination: string, equipment: string): Promise<any> {
    const benchmark = await this.getBenchmarkForRoute(origin, destination, equipment);
    
    if (!benchmark) return null;

    const analysis = {
      driverRate,
      marketRate: benchmark.currentMarketRate.average,
      performance: {
        vsMarket: ((driverRate - benchmark.currentMarketRate.average) / benchmark.currentMarketRate.average) * 100,
        vsHigh: ((driverRate - benchmark.currentMarketRate.high) / benchmark.currentMarketRate.high) * 100,
        ranking: this.calculateRateRanking(driverRate, benchmark)
      },
      opportunities: {
        immediateUpside: Math.max(0, benchmark.currentMarketRate.high - driverRate),
        negotiationTarget: benchmark.currentMarketRate.high,
        marketTrend: benchmark.marketTrends.direction
      },
      recommendations: benchmark.recommendations
    };

    return analysis;
  }

  private calculateRateRanking(driverRate: number, benchmark: RateBenchmark): string {
    const { low, average, high } = benchmark.currentMarketRate;
    
    if (driverRate >= high) return 'Top 10%';
    if (driverRate >= average + (high - average) * 0.5) return 'Top 25%';
    if (driverRate >= average) return 'Above Average';
    if (driverRate >= low + (average - low) * 0.5) return 'Below Average';
    return 'Bottom 25%';
  }

  public getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      totalBenchmarks: this.rateBenchmarks.size,
      lastUpdate: this.marketSnapshot?.generatedAt,
      averageMarketRate: this.marketSnapshot?.averageRate
    };
  }
}

export const rateBenchmarking = new RealTimeRateBenchmarking();