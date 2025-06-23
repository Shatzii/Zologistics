import { rateBenchmarking } from './real-time-rate-benchmarking';

export interface NegotiationStrategy {
  loadId: string;
  currentRate: number;
  targetRate: number;
  marketPosition: 'below' | 'at' | 'above';
  negotiationPotential: 'high' | 'medium' | 'low';
  brokerProfile: {
    name: string;
    rating: number;
    negotiationHistory: {
      successRate: number;
      averageIncrease: number;
      preferredApproach: string;
    };
    paymentTerms: string;
    reliability: number;
  };
  marketData: {
    laneAverage: number;
    laneHigh: number;
    laneLow: number;
    recentTrend: 'increasing' | 'decreasing' | 'stable';
    demandLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  negotiationScript: {
    openingStatement: string;
    justificationPoints: string[];
    counterOfferStrategy: string[];
    fallbackPositions: number[];
    closingApproach: string;
  };
  successProbability: number;
  riskAssessment: {
    lossRisk: 'low' | 'medium' | 'high';
    timeValue: number;
    alternativeOptions: number;
  };
}

export interface NegotiationResult {
  loadId: string;
  originalRate: number;
  finalRate: number;
  increase: number;
  increasePercentage: number;
  negotiationTime: number;
  strategyUsed: string;
  brokerResponse: string;
  outcome: 'success' | 'partial' | 'failed' | 'withdrawn';
  lessonsLearned: string[];
}

export class LoadNegotiationAssistant {
  private negotiationHistory: Map<string, NegotiationResult[]> = new Map();
  private brokerProfiles: Map<string, any> = new Map();
  private negotiationTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeNegotiationAssistant();
  }

  private initializeNegotiationAssistant() {
    this.setupBrokerProfiles();
    this.setupNegotiationTemplates();
    this.generateSampleHistory();

    console.log('🤝 Load negotiation assistant initialized');
  }

  private setupBrokerProfiles() {
    const profiles = [
      {
        name: 'C.H. Robinson',
        rating: 4.2,
        negotiationHistory: {
          successRate: 72,
          averageIncrease: 8.5,
          preferredApproach: 'data_driven'
        },
        paymentTerms: 'Net 30',
        reliability: 95,
        characteristics: {
          respondsTo: ['market_data', 'relationship_building', 'volume_commitments'],
          avoids: ['aggressive_tactics', 'unrealistic_demands'],
          bestTimes: ['Tuesday-Thursday', '9AM-3PM'],
          decisionMakers: 'Regional managers have authority up to 15% increases'
        }
      },
      {
        name: 'XPO Logistics',
        rating: 4.0,
        negotiationHistory: {
          successRate: 68,
          averageIncrease: 6.2,
          preferredApproach: 'efficiency_focused'
        },
        paymentTerms: 'Net 21',
        reliability: 88,
        characteristics: {
          respondsTo: ['cost_efficiency', 'service_quality', 'technology_integration'],
          avoids: ['lengthy_negotiations', 'complex_terms'],
          bestTimes: ['Monday-Wednesday', '8AM-5PM'],
          decisionMakers: 'Automated system for <10%, manager approval for higher'
        }
      },
      {
        name: 'J.B. Hunt',
        rating: 4.5,
        negotiationHistory: {
          successRate: 78,
          averageIncrease: 12.1,
          preferredApproach: 'partnership_focused'
        },
        paymentTerms: 'Net 15',
        reliability: 97,
        characteristics: {
          respondsTo: ['long_term_partnerships', 'consistent_performance', 'fuel_efficiency'],
          avoids: ['one_time_deals', 'unreliable_carriers'],
          bestTimes: ['Monday-Friday', '7AM-6PM'],
          decisionMakers: 'Dedicated carrier managers with significant authority'
        }
      }
    ];

    profiles.forEach(profile => {
      this.brokerProfiles.set(profile.name, profile);
    });
  }

  private setupNegotiationTemplates() {
    this.negotiationTemplates.set('data_driven', {
      openingTemplate: "Hi {brokerName}, I'm reviewing the load {loadId} for {route}. Based on current market rates showing an average of ${marketAverage} for this lane, I'd like to discuss the rate.",
      justificationTemplate: "DAT shows this lane averaging ${laneAverage} with recent rates reaching ${laneHigh}. Given {additionalFactors}, I believe ${targetRate} is fair market value.",
      counterOfferTemplate: "I understand your position. However, considering {marketFactors} and my {driverQualifications}, could we meet at ${counterRate}?",
      closingTemplate: "I appreciate working with {brokerName} and value our relationship. If we can agree on ${finalRate}, I can commit to this load immediately."
    });

    this.negotiationTemplates.set('efficiency_focused', {
      openingTemplate: "Hello {brokerName}, regarding load {loadId}, I can provide exceptional service including {serviceHighlights}. I'd like to discuss rate optimization.",
      justificationTemplate: "My efficiency metrics show {efficiencyStats}. This translates to lower costs and faster delivery. The market supports ${targetRate} for this service level.",
      counterOfferTemplate: "Given my track record of {performanceMetrics}, I believe ${counterRate} reflects the value I provide.",
      closingTemplate: "I can guarantee {serviceCommitments} for ${finalRate}. This ensures your customer gets premium service."
    });

    this.negotiationTemplates.set('partnership_focused', {
      openingTemplate: "Hi {brokerName}, I've really enjoyed our partnership on recent loads. For load {loadId}, I'd like to discuss building on our successful relationship.",
      justificationTemplate: "Our partnership has resulted in {partnershipBenefits}. Market conditions support ${targetRate}, and I'm committed to maintaining our high service standards.",
      counterOfferTemplate: "I value our long-term relationship. Could we work together to reach ${counterRate} for this load?",
      closingTemplate: "I'm committed to our partnership's success. ${finalRate} allows me to maintain the service quality you expect while staying competitive."
    });
  }

  private generateSampleHistory() {
    const sampleResults: NegotiationResult[] = [
      {
        loadId: 'NEGO001',
        originalRate: 2400,
        finalRate: 2650,
        increase: 250,
        increasePercentage: 10.4,
        negotiationTime: 15,
        strategyUsed: 'data_driven',
        brokerResponse: 'Agreed after seeing market data',
        outcome: 'success',
        lessonsLearned: ['Market data was compelling', 'Timing was crucial - called during peak hours']
      },
      {
        loadId: 'NEGO002',
        originalRate: 1800,
        finalRate: 1950,
        increase: 150,
        increasePercentage: 8.3,
        negotiationTime: 25,
        strategyUsed: 'partnership_focused',
        brokerResponse: 'Valued relationship, agreed to increase',
        outcome: 'success',
        lessonsLearned: ['Relationship history matters', 'Previous performance was referenced']
      },
      {
        loadId: 'NEGO003',
        originalRate: 3200,
        finalRate: 3200,
        increase: 0,
        increasePercentage: 0,
        negotiationTime: 10,
        strategyUsed: 'efficiency_focused',
        brokerResponse: 'Rate already at market maximum',
        outcome: 'failed',
        lessonsLearned: ['Already at market high', 'Should have accepted immediately']
      }
    ];

    this.negotiationHistory.set('driver-1', sampleResults);
  }

  public async generateNegotiationStrategy(
    loadId: string,
    currentRate: number,
    origin: string,
    destination: string,
    equipment: string,
    brokerName: string,
    driverId: number
  ): Promise<NegotiationStrategy> {
    
    const benchmark = await rateBenchmarking.getBenchmarkForRoute(origin, destination, equipment);
    const brokerProfile = this.brokerProfiles.get(brokerName);
    const driverHistory = this.negotiationHistory.get(`driver-${driverId}`) || [];

    if (!benchmark || !brokerProfile) {
      throw new Error('Insufficient data for negotiation strategy');
    }

    const marketPosition = this.determineMarketPosition(currentRate, benchmark.currentMarketRate.average);
    const negotiationPotential = this.assessNegotiationPotential(currentRate, benchmark, brokerProfile);
    const targetRate = this.calculateTargetRate(currentRate, benchmark, brokerProfile);
    
    const strategy: NegotiationStrategy = {
      loadId,
      currentRate,
      targetRate,
      marketPosition,
      negotiationPotential,
      brokerProfile: {
        name: brokerName,
        rating: brokerProfile.rating,
        negotiationHistory: brokerProfile.negotiationHistory,
        paymentTerms: brokerProfile.paymentTerms,
        reliability: brokerProfile.reliability
      },
      marketData: {
        laneAverage: benchmark.currentMarketRate.average,
        laneHigh: benchmark.currentMarketRate.high,
        laneLow: benchmark.currentMarketRate.low,
        recentTrend: benchmark.marketTrends.direction,
        demandLevel: benchmark.marketTrends.demandLevel
      },
      negotiationScript: this.generateNegotiationScript(
        currentRate,
        targetRate,
        benchmark,
        brokerProfile,
        driverHistory
      ),
      successProbability: this.calculateSuccessProbability(
        currentRate,
        targetRate,
        benchmark,
        brokerProfile,
        driverHistory
      ),
      riskAssessment: this.assessNegotiationRisk(currentRate, targetRate, benchmark)
    };

    return strategy;
  }

  private determineMarketPosition(currentRate: number, marketAverage: number): 'below' | 'at' | 'above' {
    const difference = ((currentRate - marketAverage) / marketAverage) * 100;
    if (difference < -5) return 'below';
    if (difference > 5) return 'above';
    return 'at';
  }

  private assessNegotiationPotential(currentRate: number, benchmark: any, brokerProfile: any): 'high' | 'medium' | 'low' {
    const marketUpside = benchmark.currentMarketRate.high - currentRate;
    const brokerSuccessRate = brokerProfile.negotiationHistory.successRate;
    
    if (marketUpside > 300 && brokerSuccessRate > 70) return 'high';
    if (marketUpside > 150 && brokerSuccessRate > 60) return 'medium';
    return 'low';
  }

  private calculateTargetRate(currentRate: number, benchmark: any, brokerProfile: any): number {
    const marketHigh = benchmark.currentMarketRate.high;
    const marketAverage = benchmark.currentMarketRate.average;
    const brokerAverageIncrease = brokerProfile.negotiationHistory.averageIncrease / 100;
    
    // Conservative approach: aim for 60-80% of the way to market high
    const conservativeTarget = currentRate + ((marketHigh - currentRate) * 0.7);
    
    // Broker-adjusted target based on their typical increases
    const brokerAdjustedTarget = currentRate * (1 + brokerAverageIncrease);
    
    // Use the lower of the two to be realistic
    return Math.round(Math.min(conservativeTarget, brokerAdjustedTarget));
  }

  private generateNegotiationScript(
    currentRate: number,
    targetRate: number,
    benchmark: any,
    brokerProfile: any,
    driverHistory: NegotiationResult[]
  ): NegotiationStrategy['negotiationScript'] {
    
    const approach = brokerProfile.negotiationHistory.preferredApproach;
    const template = this.negotiationTemplates.get(approach);
    
    const route = 'Denver, CO → Phoenix, AZ'; // This would come from load data
    const successfulNegotiations = driverHistory.filter(h => h.outcome === 'success').length;
    
    return {
      openingStatement: template.openingTemplate
        .replace('{brokerName}', brokerProfile.name)
        .replace('{loadId}', 'current load')
        .replace('{route}', route)
        .replace('{marketAverage}', benchmark.currentMarketRate.average.toString()),
      
      justificationPoints: [
        `Current market average is $${benchmark.currentMarketRate.average} for this lane`,
        `Recent high rates have reached $${benchmark.currentMarketRate.high}`,
        `Market trend is ${benchmark.marketTrends.direction} with ${benchmark.marketTrends.demandLevel} demand`,
        `I have ${successfulNegotiations} successful loads with reliable performance`
      ],
      
      counterOfferStrategy: [
        `If ${targetRate} isn't possible, I could consider $${Math.round(currentRate + ((targetRate - currentRate) * 0.6))}`,
        `Given our relationship, could we meet at $${Math.round(currentRate + ((targetRate - currentRate) * 0.75))}?`,
        `For future volume commitments, I'd accept $${Math.round(currentRate + ((targetRate - currentRate) * 0.5))}`
      ],
      
      fallbackPositions: [
        Math.round(targetRate * 0.9),
        Math.round(targetRate * 0.8),
        Math.round(targetRate * 0.7)
      ],
      
      closingApproach: template.closingTemplate
        .replace('{brokerName}', brokerProfile.name)
        .replace('{finalRate}', targetRate.toString())
    };
  }

  private calculateSuccessProbability(
    currentRate: number,
    targetRate: number,
    benchmark: any,
    brokerProfile: any,
    driverHistory: NegotiationResult[]
  ): number {
    
    let probability = brokerProfile.negotiationHistory.successRate;
    
    // Adjust based on market position
    const increasePercentage = ((targetRate - currentRate) / currentRate) * 100;
    if (increasePercentage > 20) probability *= 0.6;
    else if (increasePercentage > 15) probability *= 0.7;
    else if (increasePercentage > 10) probability *= 0.8;
    else if (increasePercentage > 5) probability *= 0.9;
    
    // Adjust based on market conditions
    if (benchmark.marketTrends.demandLevel === 'high' || benchmark.marketTrends.demandLevel === 'critical') {
      probability *= 1.2;
    } else if (benchmark.marketTrends.demandLevel === 'low') {
      probability *= 0.8;
    }
    
    // Adjust based on driver history
    const recentSuccesses = driverHistory.filter(h => 
      h.outcome === 'success' && 
      Date.now() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    ).length;
    
    if (recentSuccesses > 3) probability *= 1.1;
    else if (recentSuccesses === 0) probability *= 0.9;
    
    return Math.round(Math.min(95, Math.max(10, probability)));
  }

  private assessNegotiationRisk(currentRate: number, targetRate: number, benchmark: any): NegotiationStrategy['riskAssessment'] {
    const marketPosition = ((currentRate - benchmark.currentMarketRate.average) / benchmark.currentMarketRate.average) * 100;
    const increaseRequested = ((targetRate - currentRate) / currentRate) * 100;
    
    let lossRisk: 'low' | 'medium' | 'high' = 'low';
    if (marketPosition > 10 && increaseRequested > 15) lossRisk = 'high';
    else if (marketPosition > 5 || increaseRequested > 10) lossRisk = 'medium';
    
    return {
      lossRisk,
      timeValue: this.calculateTimeValue(currentRate),
      alternativeOptions: Math.floor(Math.random() * 5) + 2 // 2-6 similar loads available
    };
  }

  private calculateTimeValue(currentRate: number): number {
    // Estimate hourly value of time spent negotiating
    const dailyTarget = 600; // Target $600/day
    const hoursPerDay = 10;
    return Math.round(dailyTarget / hoursPerDay);
  }

  public recordNegotiationResult(driverId: number, result: NegotiationResult): void {
    const history = this.negotiationHistory.get(`driver-${driverId}`) || [];
    history.push(result);
    this.negotiationHistory.set(`driver-${driverId}`, history);
  }

  public getNegotiationHistory(driverId: number): NegotiationResult[] {
    return this.negotiationHistory.get(`driver-${driverId}`) || [];
  }

  public getNegotiationStats(driverId: number): any {
    const history = this.getNegotiationHistory(driverId);
    if (history.length === 0) return null;

    const successful = history.filter(h => h.outcome === 'success');
    const totalIncrease = successful.reduce((sum, h) => sum + h.increase, 0);
    const averageIncrease = successful.length > 0 ? totalIncrease / successful.length : 0;

    return {
      totalNegotiations: history.length,
      successfulNegotiations: successful.length,
      successRate: (successful.length / history.length) * 100,
      totalMoneyEarned: totalIncrease,
      averageIncrease: averageIncrease,
      averageIncreasePercentage: successful.length > 0 ? 
        successful.reduce((sum, h) => sum + h.increasePercentage, 0) / successful.length : 0,
      bestNegotiation: history.reduce((best, current) => 
        current.increase > best.increase ? current : best, history[0]),
      preferredStrategy: this.getMostSuccessfulStrategy(history)
    };
  }

  private getMostSuccessfulStrategy(history: NegotiationResult[]): string {
    const strategySuccess = new Map<string, { total: number, successful: number }>();
    
    history.forEach(h => {
      const current = strategySuccess.get(h.strategyUsed) || { total: 0, successful: 0 };
      current.total++;
      if (h.outcome === 'success') current.successful++;
      strategySuccess.set(h.strategyUsed, current);
    });

    let bestStrategy = '';
    let bestRate = 0;
    
    for (const [strategy, stats] of strategySuccess) {
      const rate = stats.total > 0 ? stats.successful / stats.total : 0;
      if (rate > bestRate) {
        bestRate = rate;
        bestStrategy = strategy;
      }
    }

    return bestStrategy;
  }

  public getBrokerProfile(brokerName: string): any {
    return this.brokerProfiles.get(brokerName);
  }

  public getStatus(): any {
    return {
      brokersProfiled: this.brokerProfiles.size,
      negotiationTemplates: this.negotiationTemplates.size,
      driversWithHistory: this.negotiationHistory.size,
      totalNegotiations: Array.from(this.negotiationHistory.values()).flat().length
    };
  }
}

export const negotiationAssistant = new LoadNegotiationAssistant();