import { storage } from './storage';

export interface CarbonFootprint {
  loadId: number;
  vehicleId: string;
  totalEmissions: number; // kg CO2
  emissionSources: {
    fuel: number;
    idling: number;
    maintenance: number;
    infrastructure: number;
  };
  efficiency: {
    mpg: number;
    loadUtilization: number;
    emptyMiles: number;
    routeOptimization: number;
  };
  offsetOptions: Array<{
    type: string;
    cost: number;
    reduction: number;
    provider: string;
  }>;
  calculatedAt: Date;
}

export interface SustainabilityMetrics {
  companyId: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    totalEmissions: number;
    emissionReduction: number;
    fuelEfficiency: number;
    alternativeFuelUsage: number;
    routeOptimization: number;
    loadConsolidation: number;
  };
  goals: {
    emissionReduction: number;
    fuelEfficiencyTarget: number;
    alternativeFuelTarget: number;
  };
  certifications: Array<{
    name: string;
    status: 'achieved' | 'in_progress' | 'pending';
    validUntil: Date;
  }>;
  calculatedAt: Date;
}

export interface EcoRoute {
  routeId: string;
  loadId: number;
  standardRoute: {
    distance: number;
    fuelConsumption: number;
    emissions: number;
    cost: number;
  };
  ecoRoute: {
    distance: number;
    fuelConsumption: number;
    emissions: number;
    cost: number;
    improvements: string[];
  };
  savings: {
    fuel: number;
    emissions: number;
    cost: number;
    percentage: number;
  };
  tradeoffs: {
    additionalTime: number;
    complexityIncrease: number;
  };
}

export class SustainabilityTrackingService {
  private carbonFootprints: Map<number, CarbonFootprint> = new Map();
  private sustainabilityMetrics: Map<string, SustainabilityMetrics> = new Map();
  private ecoRoutes: Map<string, EcoRoute> = new Map();

  async calculateCarbonFootprint(loadId: number, vehicleData: any): Promise<CarbonFootprint> {
    const load = await storage.getLoad(loadId);
    if (!load) {
      throw new Error('Load not found');
    }

    const footprint: CarbonFootprint = {
      loadId,
      vehicleId: vehicleData.id,
      totalEmissions: 0,
      emissionSources: {
        fuel: 0,
        idling: 0,
        maintenance: 0,
        infrastructure: 0
      },
      efficiency: {
        mpg: vehicleData.mpg || 6.5,
        loadUtilization: this.calculateLoadUtilization(load),
        emptyMiles: vehicleData.emptyMiles || 0,
        routeOptimization: vehicleData.routeOptimization || 85
      },
      offsetOptions: [],
      calculatedAt: new Date()
    };

    // Calculate fuel emissions (primary source)
    const fuelConsumption = (load.miles || 500) / footprint.efficiency.mpg;
    footprint.emissionSources.fuel = fuelConsumption * 22.4; // kg CO2 per gallon diesel

    // Calculate idling emissions
    const estimatedIdlingHours = (load.miles || 500) / 50 * 0.5; // 30 min per 50 miles
    footprint.emissionSources.idling = estimatedIdlingHours * 3.8; // kg CO2 per hour idling

    // Calculate maintenance emissions (lifecycle)
    footprint.emissionSources.maintenance = (load.miles || 500) * 0.02; // kg CO2 per mile

    // Calculate infrastructure emissions
    footprint.emissionSources.infrastructure = (load.miles || 500) * 0.05; // kg CO2 per mile

    footprint.totalEmissions = Object.values(footprint.emissionSources).reduce((a, b) => a + b, 0);

    // Generate offset options
    footprint.offsetOptions = this.generateOffsetOptions(footprint.totalEmissions);

    this.carbonFootprints.set(loadId, footprint);
    return footprint;
  }

  private calculateLoadUtilization(load: any): number {
    const maxWeight = 80000; // lbs
    const actualWeight = load.weight || 40000;
    return Math.min(100, (actualWeight / maxWeight) * 100);
  }

  private generateOffsetOptions(emissions: number) {
    const baseOptions = [
      {
        type: 'Forest Conservation',
        costPerTon: 15,
        provider: 'American Carbon Registry'
      },
      {
        type: 'Renewable Energy',
        costPerTon: 20,
        provider: 'Gold Standard'
      },
      {
        type: 'Methane Capture',
        costPerTon: 25,
        provider: 'Verified Carbon Standard'
      },
      {
        type: 'Direct Air Capture',
        costPerTon: 150,
        provider: 'Climeworks'
      }
    ];

    const emissionsInTons = emissions / 1000;

    return baseOptions.map(option => ({
      type: option.type,
      cost: Math.round(emissionsInTons * option.costPerTon * 100) / 100,
      reduction: emissions,
      provider: option.provider
    }));
  }

  async generateEcoRoute(loadId: number): Promise<EcoRoute> {
    const load = await storage.getLoad(loadId);
    if (!load) {
      throw new Error('Load not found');
    }

    const standardDistance = load.miles || 500;
    const standardFuelConsumption = standardDistance / 6.5; // MPG
    const standardEmissions = standardFuelConsumption * 22.4; // kg CO2
    const standardCost = standardFuelConsumption * 3.50; // fuel cost

    // Simulate eco route optimization
    const ecoImprovements = this.calculateEcoImprovements();
    
    const ecoRoute: EcoRoute = {
      routeId: this.generateRouteId(),
      loadId,
      standardRoute: {
        distance: standardDistance,
        fuelConsumption: standardFuelConsumption,
        emissions: standardEmissions,
        cost: standardCost
      },
      ecoRoute: {
        distance: standardDistance * (1 + ecoImprovements.distanceChange),
        fuelConsumption: standardFuelConsumption * (1 - ecoImprovements.fuelSavings),
        emissions: standardEmissions * (1 - ecoImprovements.emissionReduction),
        cost: standardCost * (1 - ecoImprovements.costSavings),
        improvements: ecoImprovements.techniques
      },
      savings: {
        fuel: 0,
        emissions: 0,
        cost: 0,
        percentage: 0
      },
      tradeoffs: {
        additionalTime: ecoImprovements.timeIncrease,
        complexityIncrease: ecoImprovements.complexity
      }
    };

    // Calculate savings
    ecoRoute.savings.fuel = ecoRoute.standardRoute.fuelConsumption - ecoRoute.ecoRoute.fuelConsumption;
    ecoRoute.savings.emissions = ecoRoute.standardRoute.emissions - ecoRoute.ecoRoute.emissions;
    ecoRoute.savings.cost = ecoRoute.standardRoute.cost - ecoRoute.ecoRoute.cost;
    ecoRoute.savings.percentage = (ecoRoute.savings.emissions / ecoRoute.standardRoute.emissions) * 100;

    this.ecoRoutes.set(ecoRoute.routeId, ecoRoute);
    return ecoRoute;
  }

  private calculateEcoImprovements() {
    return {
      fuelSavings: 0.12, // 12% fuel reduction
      emissionReduction: 0.15, // 15% emission reduction
      costSavings: 0.10, // 10% cost reduction
      distanceChange: 0.05, // 5% distance increase
      timeIncrease: 15, // 15 minutes additional time
      complexity: 3, // complexity rating 1-10
      techniques: [
        'Avoid high-traffic areas during peak hours',
        'Optimize for gradual inclines and declines',
        'Route through areas with better fuel station options',
        'Minimize stop-and-go traffic patterns',
        'Utilize truck-optimized highways'
      ]
    };
  }

  async generateSustainabilityReport(companyId: number, period: 'weekly' | 'monthly' | 'yearly'): Promise<SustainabilityMetrics> {
    const loads = await storage.getLoads(companyId);
    const carbonFootprints = loads.map(load => this.carbonFootprints.get(load.id)).filter(Boolean);

    const totalEmissions = carbonFootprints.reduce((sum, fp) => sum + (fp?.totalEmissions || 0), 0);
    const avgMPG = carbonFootprints.reduce((sum, fp) => sum + (fp?.efficiency.mpg || 0), 0) / carbonFootprints.length;

    const metrics: SustainabilityMetrics = {
      companyId,
      period,
      metrics: {
        totalEmissions,
        emissionReduction: this.calculateEmissionReduction(companyId, period),
        fuelEfficiency: avgMPG,
        alternativeFuelUsage: this.calculateAlternativeFuelUsage(loads),
        routeOptimization: this.calculateRouteOptimizationScore(loads),
        loadConsolidation: this.calculateLoadConsolidationScore(loads)
      },
      goals: {
        emissionReduction: 20, // 20% reduction target
        fuelEfficiencyTarget: 7.5, // MPG target
        alternativeFuelTarget: 15 // 15% alternative fuel usage
      },
      certifications: this.generateCertificationStatus(),
      calculatedAt: new Date()
    };

    const metricsKey = `${companyId}_${period}`;
    this.sustainabilityMetrics.set(metricsKey, metrics);
    return metrics;
  }

  private calculateEmissionReduction(companyId: number, period: string): number {
    // Simulate historical comparison
    return Math.random() * 15 + 5; // 5-20% reduction
  }

  private calculateAlternativeFuelUsage(loads: any[]): number {
    // Simulate alternative fuel adoption
    return Math.random() * 10; // 0-10% current usage
  }

  private calculateRouteOptimizationScore(loads: any[]): number {
    // Calculate average route optimization efficiency
    return Math.random() * 20 + 75; // 75-95% optimization score
  }

  private calculateLoadConsolidationScore(loads: any[]): number {
    // Calculate load consolidation efficiency
    return Math.random() * 15 + 80; // 80-95% consolidation score
  }

  private generateCertificationStatus() {
    return [
      {
        name: 'ISO 14001 Environmental Management',
        status: 'achieved' as const,
        validUntil: new Date(2025, 11, 31)
      },
      {
        name: 'SmartWay Transport Partnership',
        status: 'in_progress' as const,
        validUntil: new Date(2024, 11, 31)
      },
      {
        name: 'Green Freight Certification',
        status: 'pending' as const,
        validUntil: new Date(2024, 5, 30)
      }
    ];
  }

  async generateSustainabilityRecommendations(companyId: number): Promise<Array<{
    category: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
    implementation: string;
    estimatedSavings: number;
  }>> {
    const metrics = await this.generateSustainabilityReport(companyId, 'monthly');
    const recommendations = [];

    if (metrics.metrics.fuelEfficiency < metrics.goals.fuelEfficiencyTarget) {
      recommendations.push({
        category: 'Fuel Efficiency',
        recommendation: 'Implement driver training program focused on eco-driving techniques',
        impact: 'high' as const,
        implementation: 'Schedule training sessions and monitor performance improvements',
        estimatedSavings: 8500
      });
    }

    if (metrics.metrics.alternativeFuelUsage < metrics.goals.alternativeFuelTarget) {
      recommendations.push({
        category: 'Alternative Fuels',
        recommendation: 'Transition 25% of fleet to compressed natural gas (CNG) vehicles',
        impact: 'high' as const,
        implementation: 'Evaluate CNG infrastructure and vehicle conversion costs',
        estimatedSavings: 15000
      });
    }

    if (metrics.metrics.routeOptimization < 90) {
      recommendations.push({
        category: 'Route Optimization',
        recommendation: 'Implement AI-powered route optimization for all loads',
        impact: 'medium' as const,
        implementation: 'Deploy advanced routing algorithms and real-time traffic integration',
        estimatedSavings: 5200
      });
    }

    recommendations.push({
      category: 'Load Consolidation',
      recommendation: 'Increase load consolidation through strategic partnerships',
      impact: 'medium' as const,
      implementation: 'Develop partnerships with complementary carriers for shared loads',
      estimatedSavings: 7800
    });

    return recommendations;
  }

  private generateRouteId(): string {
    return `eco_route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCarbonFootprint(loadId: number): CarbonFootprint | undefined {
    return this.carbonFootprints.get(loadId);
  }

  getEcoRoute(routeId: string): EcoRoute | undefined {
    return this.ecoRoutes.get(routeId);
  }

  getSustainabilityMetrics(companyId: number, period: string): SustainabilityMetrics | undefined {
    return this.sustainabilityMetrics.get(`${companyId}_${period}`);
  }

  getAllCarbonFootprints(): CarbonFootprint[] {
    return Array.from(this.carbonFootprints.values());
  }

  getAllEcoRoutes(): EcoRoute[] {
    return Array.from(this.ecoRoutes.values());
  }
}

export const sustainabilityService = new SustainabilityTrackingService();