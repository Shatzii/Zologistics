export interface LoadProbabilityFactors {
  marketConditions: {
    demandLevel: number; // 0-100
    supplyLevel: number; // 0-100
    rateVolatility: number; // 0-100
    seasonalInfluence: number; // -50 to +50
  };
  driverProfile: {
    performanceRating: number; // 0-100
    completionRate: number; // 0-100
    timelyDeliveryRate: number; // 0-100
    customerRatings: number; // 0-5
    equipmentType: string;
    experienceLevel: number; // years
  };
  routeFactors: {
    lanePopularity: number; // 0-100
    returnLoadAvailability: number; // 0-100
    weatherConditions: number; // 0-100 (100 = ideal)
    trafficDensity: number; // 0-100
    fuelCostIndex: number; // 0-200 (100 = baseline)
  };
  temporalFactors: {
    timeOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    monthOfYear: number; // 0-11
    holidayProximity: number; // days to nearest holiday
    shippingUrgency: number; // 0-100
  };
  competitiveFactors: {
    activeCompetitors: number;
    averageCompetitorRating: number;
    rateCompetitiveness: number; // percentage vs market average
    uniqueValueProposition: string[];
  };
}

export interface LoadProbabilityPrediction {
  loadId: string;
  driverId: number;
  overallProbability: number; // 0-100
  confidence: number; // 0-100
  factorBreakdown: {
    marketConditions: number;
    driverProfile: number;
    routeFactors: number;
    temporalFactors: number;
    competitiveFactors: number;
  };
  recommendations: {
    rateAdjustment: number; // suggested percentage change
    timingOptimization: string;
    profileEnhancements: string[];
    competitiveAdvantages: string[];
  };
  riskFactors: {
    factor: string;
    impact: number; // -100 to +100
    mitigation: string;
  }[];
  historicalComparison: {
    similarLoads: number;
    averageProbability: number;
    successRate: number;
  };
  realTimeUpdates: {
    lastUpdated: Date;
    nextUpdateIn: number; // minutes
    volatilityAlert: boolean;
  };
}

export interface LoadProbabilityAlert {
  id: string;
  driverId: number;
  alertType: 'high_probability' | 'rate_drop' | 'competition_increase' | 'market_shift' | 'timing_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionable: boolean;
  suggestedActions: string[];
  timeWindow: string;
  estimatedImpact: number;
  timestamp: Date;
}

export class RealTimeLoadProbability {
  private probabilityCache: Map<string, LoadProbabilityPrediction> = new Map();
  private marketData: Map<string, any> = new Map();
  private driverMetrics: Map<number, any> = new Map();
  private historicalPatterns: Map<string, any> = new Map();
  private activeAlerts: Map<string, LoadProbabilityAlert> = new Map();

  constructor() {
    this.initializeMarketData();
    this.initializeDriverMetrics();
    this.startRealTimeMonitoring();
  }

  private initializeMarketData() {
    // Initialize market conditions data
    const marketLanes = [
      'Chicago-Atlanta', 'Los Angeles-Phoenix', 'Dallas-Houston', 'New York-Philadelphia',
      'Denver-Salt Lake City', 'Miami-Orlando', 'Seattle-Portland', 'Detroit-Cleveland'
    ];

    marketLanes.forEach(lane => {
      this.marketData.set(lane, {
        demandLevel: Math.random() * 100,
        supplyLevel: Math.random() * 100,
        rateVolatility: Math.random() * 50,
        seasonalInfluence: (Math.random() - 0.5) * 100,
        lastUpdated: new Date(),
        trendDirection: Math.random() > 0.5 ? 'increasing' : 'decreasing'
      });
    });
  }

  private initializeDriverMetrics() {
    // Initialize sample driver metrics
    for (let i = 1; i <= 50; i++) {
      this.driverMetrics.set(i, {
        performanceRating: Math.random() * 40 + 60, // 60-100
        completionRate: Math.random() * 20 + 80, // 80-100
        timelyDeliveryRate: Math.random() * 25 + 75, // 75-100
        customerRatings: Math.random() * 2 + 3, // 3-5
        equipmentType: ['dry_van', 'refrigerated', 'flatbed', 'tanker'][Math.floor(Math.random() * 4)],
        experienceLevel: Math.random() * 20 + 1, // 1-21 years
        recentPerformanceTrend: Math.random() > 0.5 ? 'improving' : 'stable'
      });
    }
  }

  private startRealTimeMonitoring() {
    // Update probability calculations every 5 minutes
    setInterval(() => {
      this.updateMarketConditions();
      this.recalculateAllProbabilities();
      this.generateProbabilityAlerts();
    }, 5 * 60 * 1000);

    // Generate new market insights every 15 minutes
    setInterval(() => {
      this.analyzeMarketTrends();
      this.updateCompetitiveIntelligence();
    }, 15 * 60 * 1000);
  }

  private updateMarketConditions() {
    this.marketData.forEach((data, lane) => {
      // Simulate market fluctuations
      data.demandLevel += (Math.random() - 0.5) * 10;
      data.supplyLevel += (Math.random() - 0.5) * 8;
      data.rateVolatility += (Math.random() - 0.5) * 5;
      
      // Keep values in bounds
      data.demandLevel = Math.max(0, Math.min(100, data.demandLevel));
      data.supplyLevel = Math.max(0, Math.min(100, data.supplyLevel));
      data.rateVolatility = Math.max(0, Math.min(100, data.rateVolatility));
      
      data.lastUpdated = new Date();
    });
  }

  public calculateLoadProbability(loadId: string, driverId: number, routeInfo: any): LoadProbabilityPrediction {
    const factors = this.gatherProbabilityFactors(driverId, routeInfo);
    const probability = this.computeOverallProbability(factors);
    
    const prediction: LoadProbabilityPrediction = {
      loadId,
      driverId,
      overallProbability: probability.overall,
      confidence: probability.confidence,
      factorBreakdown: probability.breakdown,
      recommendations: this.generateRecommendations(factors, probability),
      riskFactors: this.identifyRiskFactors(factors),
      historicalComparison: this.getHistoricalComparison(routeInfo),
      realTimeUpdates: {
        lastUpdated: new Date(),
        nextUpdateIn: 5,
        volatilityAlert: factors.marketConditions.rateVolatility > 70
      }
    };

    // Cache the prediction
    this.probabilityCache.set(`${loadId}_${driverId}`, prediction);
    
    return prediction;
  }

  private gatherProbabilityFactors(driverId: number, routeInfo: any): LoadProbabilityFactors {
    const driverData = this.driverMetrics.get(driverId) || {};
    const marketData = this.marketData.get(routeInfo.lane) || {};
    
    return {
      marketConditions: {
        demandLevel: marketData.demandLevel || 50,
        supplyLevel: marketData.supplyLevel || 50,
        rateVolatility: marketData.rateVolatility || 25,
        seasonalInfluence: this.calculateSeasonalInfluence()
      },
      driverProfile: {
        performanceRating: driverData.performanceRating || 75,
        completionRate: driverData.completionRate || 90,
        timelyDeliveryRate: driverData.timelyDeliveryRate || 85,
        customerRatings: driverData.customerRatings || 4.0,
        equipmentType: driverData.equipmentType || 'dry_van',
        experienceLevel: driverData.experienceLevel || 5
      },
      routeFactors: {
        lanePopularity: this.calculateLanePopularity(routeInfo.lane),
        returnLoadAvailability: this.calculateReturnLoadAvailability(routeInfo),
        weatherConditions: this.getWeatherScore(routeInfo),
        trafficDensity: this.getTrafficDensity(routeInfo),
        fuelCostIndex: this.getFuelCostIndex(routeInfo)
      },
      temporalFactors: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        monthOfYear: new Date().getMonth(),
        holidayProximity: this.calculateHolidayProximity(),
        shippingUrgency: routeInfo.urgency || 50
      },
      competitiveFactors: {
        activeCompetitors: this.getActiveCompetitors(routeInfo),
        averageCompetitorRating: 4.2,
        rateCompetitiveness: this.calculateRateCompetitiveness(routeInfo),
        uniqueValueProposition: driverData.uniqueStrengths || []
      }
    };
  }

  private computeOverallProbability(factors: LoadProbabilityFactors): any {
    // Weighted probability calculation
    const weights = {
      marketConditions: 0.25,
      driverProfile: 0.30,
      routeFactors: 0.20,
      temporalFactors: 0.15,
      competitiveFactors: 0.10
    };

    // Calculate individual factor scores
    const marketScore = this.calculateMarketScore(factors.marketConditions);
    const driverScore = this.calculateDriverScore(factors.driverProfile);
    const routeScore = this.calculateRouteScore(factors.routeFactors);
    const temporalScore = this.calculateTemporalScore(factors.temporalFactors);
    const competitiveScore = this.calculateCompetitiveScore(factors.competitiveFactors);

    const overall = (
      marketScore * weights.marketConditions +
      driverScore * weights.driverProfile +
      routeScore * weights.routeFactors +
      temporalScore * weights.temporalFactors +
      competitiveScore * weights.competitiveFactors
    );

    return {
      overall: Math.round(overall),
      confidence: this.calculateConfidence(factors),
      breakdown: {
        marketConditions: Math.round(marketScore),
        driverProfile: Math.round(driverScore),
        routeFactors: Math.round(routeScore),
        temporalFactors: Math.round(temporalScore),
        competitiveFactors: Math.round(competitiveScore)
      }
    };
  }

  private calculateMarketScore(market: LoadProbabilityFactors['marketConditions']): number {
    // High demand + low supply = high probability
    const demandSupplyRatio = (market.demandLevel / Math.max(market.supplyLevel, 1)) * 50;
    const volatilityPenalty = market.rateVolatility * 0.3;
    const seasonalBonus = Math.max(0, market.seasonalInfluence * 0.5);
    
    return Math.max(0, Math.min(100, demandSupplyRatio - volatilityPenalty + seasonalBonus));
  }

  private calculateDriverScore(driver: LoadProbabilityFactors['driverProfile']): number {
    const performanceWeight = driver.performanceRating * 0.3;
    const reliabilityWeight = (driver.completionRate + driver.timelyDeliveryRate) / 2 * 0.4;
    const customerWeight = driver.customerRatings * 20 * 0.2;
    const experienceWeight = Math.min(driver.experienceLevel * 2, 20) * 0.1;
    
    return performanceWeight + reliabilityWeight + customerWeight + experienceWeight;
  }

  private calculateRouteScore(route: LoadProbabilityFactors['routeFactors']): number {
    const popularityWeight = route.lanePopularity * 0.25;
    const returnLoadWeight = route.returnLoadAvailability * 0.25;
    const weatherWeight = route.weatherConditions * 0.2;
    const trafficWeight = (100 - route.trafficDensity) * 0.15;
    const fuelWeight = Math.max(0, (200 - route.fuelCostIndex)) * 0.15;
    
    return popularityWeight + returnLoadWeight + weatherWeight + trafficWeight + fuelWeight;
  }

  private calculateTemporalScore(temporal: LoadProbabilityFactors['temporalFactors']): number {
    // Peak shipping hours get higher scores
    const timeBonus = this.getTimeOfDayBonus(temporal.timeOfDay);
    const dayBonus = this.getDayOfWeekBonus(temporal.dayOfWeek);
    const monthBonus = this.getMonthlyBonus(temporal.monthOfYear);
    const urgencyBonus = temporal.shippingUrgency * 0.5;
    const holidayPenalty = Math.max(0, (7 - temporal.holidayProximity) * 5);
    
    return timeBonus + dayBonus + monthBonus + urgencyBonus - holidayPenalty;
  }

  private calculateCompetitiveScore(competitive: LoadProbabilityFactors['competitiveFactors']): number {
    const competitorPenalty = Math.min(competitive.activeCompetitors * 5, 50);
    const rateBonus = Math.max(0, (competitive.rateCompetitiveness - 100) * 0.5);
    const uniquenessBonus = competitive.uniqueValueProposition.length * 10;
    
    return Math.max(0, 100 - competitorPenalty + rateBonus + uniquenessBonus);
  }

  private calculateConfidence(factors: LoadProbabilityFactors): number {
    // Confidence based on data quality and market stability
    let confidence = 85; // Base confidence
    
    // Reduce confidence for high volatility
    confidence -= factors.marketConditions.rateVolatility * 0.3;
    
    // Increase confidence for experienced drivers
    confidence += Math.min(factors.driverProfile.experienceLevel, 10);
    
    // Reduce confidence for high competition
    confidence -= Math.min(factors.competitiveFactors.activeCompetitors * 2, 20);
    
    return Math.max(50, Math.min(100, confidence));
  }

  private generateRecommendations(factors: LoadProbabilityFactors, probability: any): any {
    const recommendations = {
      rateAdjustment: 0,
      timingOptimization: '',
      profileEnhancements: [] as string[],
      competitiveAdvantages: [] as string[]
    };

    // Rate adjustment recommendations
    if (factors.marketConditions.demandLevel > 80) {
      recommendations.rateAdjustment = 5; // Suggest 5% increase
    } else if (factors.marketConditions.supplyLevel > 80) {
      recommendations.rateAdjustment = -3; // Suggest 3% decrease for competitiveness
    }

    // Timing optimization
    if (factors.temporalFactors.timeOfDay < 6 || factors.temporalFactors.timeOfDay > 22) {
      recommendations.timingOptimization = 'Consider adjusting pickup time to business hours for better acceptance rates';
    }

    // Profile enhancements
    if (factors.driverProfile.customerRatings < 4.0) {
      recommendations.profileEnhancements.push('Focus on customer service improvement');
    }
    if (factors.driverProfile.timelyDeliveryRate < 85) {
      recommendations.profileEnhancements.push('Improve on-time delivery performance');
    }

    // Competitive advantages
    if (factors.competitiveFactors.activeCompetitors > 10) {
      recommendations.competitiveAdvantages.push('Highlight unique equipment or certifications');
      recommendations.competitiveAdvantages.push('Emphasize excellent safety record');
    }

    return recommendations;
  }

  private identifyRiskFactors(factors: LoadProbabilityFactors): any[] {
    const risks = [];

    if (factors.marketConditions.rateVolatility > 70) {
      risks.push({
        factor: 'High market volatility',
        impact: -20,
        mitigation: 'Consider rate protection or flexible pricing'
      });
    }

    if (factors.routeFactors.weatherConditions < 50) {
      risks.push({
        factor: 'Poor weather conditions',
        impact: -15,
        mitigation: 'Plan for delays and communicate proactively'
      });
    }

    if (factors.competitiveFactors.activeCompetitors > 15) {
      risks.push({
        factor: 'High competition',
        impact: -25,
        mitigation: 'Differentiate through service quality and reliability'
      });
    }

    return risks;
  }

  private recalculateAllProbabilities() {
    // Recalculate cached probabilities with updated market data
    const updatedPredictions = new Map();
    
    this.probabilityCache.forEach((prediction, key) => {
      // Simplified recalculation - in practice, you'd recalculate fully
      prediction.overallProbability += (Math.random() - 0.5) * 10;
      prediction.overallProbability = Math.max(0, Math.min(100, prediction.overallProbability));
      prediction.realTimeUpdates.lastUpdated = new Date();
      
      updatedPredictions.set(key, prediction);
    });
    
    this.probabilityCache = updatedPredictions;
  }

  private generateProbabilityAlerts() {
    this.probabilityCache.forEach((prediction, key) => {
      // Generate alerts for significant probability changes
      if (prediction.overallProbability > 85) {
        this.createAlert(prediction.driverId, 'high_probability', 
          `High probability load detected: ${prediction.overallProbability}%`, 'medium');
      }
      
      if (prediction.realTimeUpdates.volatilityAlert) {
        this.createAlert(prediction.driverId, 'market_shift',
          'Market volatility detected - monitor rates closely', 'high');
      }
    });
  }

  private createAlert(driverId: number, type: string, message: string, severity: string) {
    const alertId = `alert_${Date.now()}_${driverId}`;
    const alert: LoadProbabilityAlert = {
      id: alertId,
      driverId,
      alertType: type as any,
      severity: severity as any,
      message,
      actionable: true,
      suggestedActions: this.getSuggestedActions(type),
      timeWindow: '2 hours',
      estimatedImpact: Math.random() * 1000 + 500,
      timestamp: new Date()
    };

    this.activeAlerts.set(alertId, alert);
    console.log(`🚨 LOAD PROBABILITY ALERT: ${message} for driver ${driverId}`);
  }

  private getSuggestedActions(alertType: string): string[] {
    const actionMap: Record<string, string[]> = {
      'high_probability': ['Submit competitive rate quote', 'Ensure all documentation is ready', 'Contact shipper proactively'],
      'market_shift': ['Monitor rate trends', 'Consider rate adjustments', 'Review competitor activity'],
      'competition_increase': ['Emphasize unique value proposition', 'Consider rate reduction', 'Improve response time'],
      'timing_opportunity': ['Adjust pickup/delivery windows', 'Expedite quote submission', 'Leverage urgency for premium rates']
    };

    return actionMap[alertType] || ['Monitor situation closely'];
  }

  // Helper methods for factor calculations
  private calculateSeasonalInfluence(): number {
    const month = new Date().getMonth();
    const seasonalFactors = [10, 5, 15, 20, 25, 20, 15, 10, 15, 25, 30, 35]; // Holiday season boost
    return seasonalFactors[month] - 20; // Normalize around 0
  }

  private calculateLanePopularity(lane: string): number {
    const popularLanes = ['Chicago-Atlanta', 'Los Angeles-Phoenix', 'Dallas-Houston'];
    return popularLanes.includes(lane) ? Math.random() * 30 + 70 : Math.random() * 50 + 25;
  }

  private calculateReturnLoadAvailability(routeInfo: any): number {
    return Math.random() * 100; // Simplified - would use real data
  }

  private getWeatherScore(routeInfo: any): number {
    return Math.random() * 40 + 60; // Generally favorable
  }

  private getTrafficDensity(routeInfo: any): number {
    return Math.random() * 60 + 20; // Moderate traffic
  }

  private getFuelCostIndex(routeInfo: any): number {
    return Math.random() * 40 + 90; // Around baseline
  }

  private calculateHolidayProximity(): number {
    return Math.random() * 30; // Days to next holiday
  }

  private getActiveCompetitors(routeInfo: any): number {
    return Math.floor(Math.random() * 20) + 5; // 5-25 competitors
  }

  private calculateRateCompetitiveness(routeInfo: any): number {
    return Math.random() * 30 + 85; // 85-115% of market rate
  }

  private getTimeOfDayBonus(hour: number): number {
    // Business hours get higher scores
    if (hour >= 8 && hour <= 17) return 25;
    if (hour >= 6 && hour <= 22) return 15;
    return 5;
  }

  private getDayOfWeekBonus(day: number): number {
    // Monday-Friday get higher scores
    return day >= 1 && day <= 5 ? 20 : 10;
  }

  private getMonthlyBonus(month: number): number {
    // Peak shipping months
    const peakMonths = [8, 9, 10, 11]; // Sep-Dec
    return peakMonths.includes(month) ? 15 : 10;
  }

  private calculateConfidence(factors: LoadProbabilityFactors): number {
    return Math.random() * 20 + 80; // 80-100% confidence
  }

  private getHistoricalComparison(routeInfo: any): any {
    return {
      similarLoads: Math.floor(Math.random() * 50) + 10,
      averageProbability: Math.random() * 30 + 60,
      successRate: Math.random() * 20 + 75
    };
  }

  private analyzeMarketTrends() {
    console.log('📈 MARKET ANALYSIS: Analyzing current freight market trends...');
    
    this.marketData.forEach((data, lane) => {
      const trend = data.demandLevel > data.supplyLevel ? 'Shipper Market' : 'Carrier Market';
      console.log(`   ${lane}: ${trend} (Demand: ${data.demandLevel.toFixed(1)}, Supply: ${data.supplyLevel.toFixed(1)})`);
    });
  }

  private updateCompetitiveIntelligence() {
    console.log('🎯 COMPETITIVE INTEL: Updating competitive landscape analysis...');
  }

  // Public API methods
  public getLoadProbability(loadId: string, driverId: number): LoadProbabilityPrediction | undefined {
    return this.probabilityCache.get(`${loadId}_${driverId}`);
  }

  public getActiveAlerts(driverId: number): LoadProbabilityAlert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => alert.driverId === driverId);
  }

  public getMarketOverview(): any {
    const marketSummary = {
      averageDemand: 0,
      averageSupply: 0,
      volatilityIndex: 0,
      topLanes: [] as string[]
    };

    const marketValues = Array.from(this.marketData.values());
    marketSummary.averageDemand = marketValues.reduce((sum, data) => sum + data.demandLevel, 0) / marketValues.length;
    marketSummary.averageSupply = marketValues.reduce((sum, data) => sum + data.supplyLevel, 0) / marketValues.length;
    marketSummary.volatilityIndex = marketValues.reduce((sum, data) => sum + data.rateVolatility, 0) / marketValues.length;
    
    return marketSummary;
  }

  public getProbabilityTrends(driverId: number): any {
    // Return probability trends for the driver
    return {
      last24Hours: Array.from({length: 24}, (_, i) => ({
        hour: i,
        averageProbability: Math.random() * 40 + 60
      })),
      last7Days: Array.from({length: 7}, (_, i) => ({
        day: i,
        averageProbability: Math.random() * 30 + 65
      }))
    };
  }
}

export const realTimeLoadProbability = new RealTimeLoadProbability();