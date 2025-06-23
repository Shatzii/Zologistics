import { storage } from './storage';

export interface DriverPreferences {
  id: number;
  driverId: number;
  homeBase: {
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  preferredRegions: string[];
  equipmentTypes: string[];
  timePreferences: {
    weekends: boolean;
    holidays: boolean;
    nightDriving: boolean;
  };
  profitTargets: {
    minimumRate: number;
    targetRPM: number; // Revenue per mile
    maximumDeadhead: number; // percentage
  };
  brokerPreferences: {
    preferred: string[];
    blocked: string[];
  };
  routeTypes: ('local' | 'regional' | 'otr')[];
}

export interface SmartLoadMatch {
  loadId: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  profitAnalysis: {
    grossRevenue: number;
    estimatedExpenses: number;
    netProfit: number;
    profitMargin: number;
    rpmActual: number;
    rpmTarget: number;
  };
  efficiency: {
    deadheadMiles: number;
    deadheadPercentage: number;
    fuelEfficiencyScore: number;
    timeToDeliver: number;
  };
  risk: {
    brokerRating: number;
    weatherRisk: number;
    routeDifficulty: number;
    overallRisk: 'low' | 'medium' | 'high';
  };
  urgency: 'standard' | 'expedite' | 'hotshot' | 'emergency';
  recommendations: string[];
}

export class SmartLoadMatchingEngine {
  private driverPreferences: Map<number, DriverPreferences> = new Map();
  private loadMatches: Map<string, SmartLoadMatch[]> = new Map();
  private historicalPerformance: Map<number, any> = new Map();

  constructor() {
    this.initializeDriverPreferences();
    this.startMatchingEngine();
  }

  private initializeDriverPreferences() {
    // Sample driver preferences
    const samplePrefs: DriverPreferences = {
      id: 1,
      driverId: 1,
      homeBase: {
        city: 'Denver',
        state: 'CO',
        coordinates: { lat: 39.7392, lng: -104.9903 }
      },
      preferredRegions: ['Mountain West', 'Southwest', 'Pacific'],
      equipmentTypes: ['Dry Van', 'Reefer'],
      timePreferences: {
        weekends: false,
        holidays: false,
        nightDriving: true
      },
      profitTargets: {
        minimumRate: 1800,
        targetRPM: 2.50,
        maximumDeadhead: 15
      },
      brokerPreferences: {
        preferred: ['C.H. Robinson', 'XPO Logistics', 'J.B. Hunt'],
        blocked: []
      },
      routeTypes: ['regional', 'otr']
    };

    this.driverPreferences.set(1, samplePrefs);
  }

  private startMatchingEngine() {
    // Run matching every 2 minutes
    setInterval(() => {
      this.performSmartMatching();
    }, 2 * 60 * 1000);

    // Initial run
    this.performSmartMatching();
  }

  private async performSmartMatching() {
    for (const [driverId, preferences] of this.driverPreferences) {
      const matches = await this.generateMatchesForDriver(driverId, preferences);
      this.loadMatches.set(`driver-${driverId}`, matches);
    }
  }

  private async generateMatchesForDriver(driverId: number, preferences: DriverPreferences): Promise<SmartLoadMatch[]> {
    // Simulate smart matching with various loads
    const loads = this.generateSampleLoads();
    const matches: SmartLoadMatch[] = [];

    for (const load of loads) {
      const match = this.calculateLoadMatch(load, preferences, driverId);
      if (match.matchScore >= 60) { // Only show high-quality matches
        matches.push(match);
      }
    }

    // Sort by match score descending
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateLoadMatch(load: any, preferences: DriverPreferences, driverId: number): SmartLoadMatch {
    let matchScore = 0;
    const matchReasons: string[] = [];

    // Equipment type matching (25 points)
    if (preferences.equipmentTypes.includes(load.equipment)) {
      matchScore += 25;
      matchReasons.push(`Perfect equipment match: ${load.equipment}`);
    }

    // Rate matching (30 points)
    const rpm = load.rate / load.miles;
    if (rpm >= preferences.profitTargets.targetRPM) {
      matchScore += 30;
      matchReasons.push(`Exceeds target rate: $${rpm.toFixed(2)}/mile`);
    } else if (rpm >= preferences.profitTargets.minimumRate / load.miles) {
      matchScore += 15;
      matchReasons.push(`Meets minimum rate requirements`);
    }

    // Region preference (20 points)
    if (this.isInPreferredRegion(load.destination, preferences.preferredRegions)) {
      matchScore += 20;
      matchReasons.push(`Destination in preferred region`);
    }

    // Deadhead optimization (15 points)
    const deadheadPercentage = this.calculateDeadhead(preferences.homeBase, load.origin, load.miles);
    if (deadheadPercentage <= preferences.profitTargets.maximumDeadhead) {
      matchScore += 15;
      matchReasons.push(`Low deadhead: ${deadheadPercentage.toFixed(1)}%`);
    }

    // Broker preference (10 points)
    if (preferences.brokerPreferences.preferred.includes(load.broker)) {
      matchScore += 10;
      matchReasons.push(`Preferred broker: ${load.broker}`);
    }

    const profitAnalysis = this.calculateProfitAnalysis(load, deadheadPercentage);
    const efficiency = this.calculateEfficiency(load, deadheadPercentage);
    const risk = this.calculateRisk(load);

    return {
      loadId: load.id,
      matchScore: Math.min(100, matchScore),
      matchReasons,
      profitAnalysis,
      efficiency,
      risk,
      urgency: load.urgency || 'standard',
      recommendations: this.generateRecommendations(load, preferences, matchScore)
    };
  }

  private calculateProfitAnalysis(load: any, deadheadPercentage: number) {
    const grossRevenue = load.rate;
    const totalMiles = load.miles * (1 + deadheadPercentage / 100);
    const fuelCost = totalMiles * 0.40; // $0.40/mile fuel cost
    const maintenanceCost = totalMiles * 0.15; // $0.15/mile maintenance
    const estimatedExpenses = fuelCost + maintenanceCost;
    const netProfit = grossRevenue - estimatedExpenses;
    const profitMargin = (netProfit / grossRevenue) * 100;

    return {
      grossRevenue,
      estimatedExpenses,
      netProfit,
      profitMargin,
      rpmActual: grossRevenue / load.miles,
      rpmTarget: 2.50
    };
  }

  private calculateEfficiency(load: any, deadheadPercentage: number) {
    const deadheadMiles = load.miles * (deadheadPercentage / 100);
    const fuelEfficiencyScore = deadheadPercentage <= 10 ? 90 : deadheadPercentage <= 20 ? 70 : 50;
    const timeToDeliver = load.miles / 500; // Assuming 500 miles per day

    return {
      deadheadMiles,
      deadheadPercentage,
      fuelEfficiencyScore,
      timeToDeliver
    };
  }

  private calculateRisk(load: any) {
    const brokerRating = Math.floor(Math.random() * 5) + 1; // 1-5 rating
    const weatherRisk = Math.floor(Math.random() * 3) + 1; // 1-3 risk level
    const routeDifficulty = Math.floor(Math.random() * 3) + 1; // 1-3 difficulty

    const overallRiskScore = (brokerRating + weatherRisk + routeDifficulty) / 3;
    const overallRisk = overallRiskScore <= 2 ? 'low' : overallRiskScore <= 3.5 ? 'medium' : 'high';

    return {
      brokerRating,
      weatherRisk,
      routeDifficulty,
      overallRisk: overallRisk as 'low' | 'medium' | 'high'
    };
  }

  private generateRecommendations(load: any, preferences: DriverPreferences, matchScore: number): string[] {
    const recommendations: string[] = [];

    if (matchScore >= 80) {
      recommendations.push('Excellent match - book immediately');
    } else if (matchScore >= 70) {
      recommendations.push('Good match - consider booking');
    } else if (matchScore >= 60) {
      recommendations.push('Acceptable match - negotiate rate if possible');
    }

    if (load.rate / load.miles < preferences.profitTargets.targetRPM) {
      recommendations.push(`Try negotiating rate to $${(preferences.profitTargets.targetRPM * load.miles).toFixed(0)}`);
    }

    return recommendations;
  }

  private isInPreferredRegion(destination: string, preferredRegions: string[]): boolean {
    // Simplified region matching
    return preferredRegions.some(region => 
      destination.toLowerCase().includes(region.toLowerCase().replace(' ', ''))
    );
  }

  private calculateDeadhead(homeBase: any, origin: string, loadMiles: number): number {
    // Simplified deadhead calculation
    return Math.random() * 20; // 0-20% deadhead
  }

  private generateSampleLoads() {
    return [
      {
        id: 'SMART001',
        origin: 'Denver, CO',
        destination: 'Phoenix, AZ',
        equipment: 'Dry Van',
        rate: 2800,
        miles: 1200,
        broker: 'C.H. Robinson',
        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        urgency: 'standard'
      },
      {
        id: 'SMART002',
        origin: 'Salt Lake City, UT',
        destination: 'Los Angeles, CA',
        equipment: 'Reefer',
        rate: 3200,
        miles: 1300,
        broker: 'XPO Logistics',
        pickupDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        urgency: 'expedite'
      },
      {
        id: 'SMART003',
        origin: 'Albuquerque, NM',
        destination: 'San Diego, CA',
        equipment: 'Dry Van',
        rate: 2100,
        miles: 850,
        broker: 'J.B. Hunt',
        pickupDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
        urgency: 'standard'
      }
    ];
  }

  public getSmartMatches(driverId: number): SmartLoadMatch[] {
    return this.loadMatches.get(`driver-${driverId}`) || [];
  }

  public updateDriverPreferences(driverId: number, preferences: Partial<DriverPreferences>) {
    const existing = this.driverPreferences.get(driverId);
    if (existing) {
      this.driverPreferences.set(driverId, { ...existing, ...preferences });
    }
  }

  public getDriverPreferences(driverId: number): DriverPreferences | undefined {
    return this.driverPreferences.get(driverId);
  }
}

export const smartLoadMatcher = new SmartLoadMatchingEngine();