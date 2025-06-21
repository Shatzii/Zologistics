// Multi-vehicle brokerage system for hotshot, box trucks, and small vehicles

export interface VehicleSpecification {
  class: 'Class_8' | 'Class_7' | 'Class_6' | 'Class_5' | 'Class_4' | 'Class_3' | 'Pickup';
  type: 'Semi_Truck' | 'Box_Truck' | 'Hotshot' | 'Cargo_Van' | 'Pickup_Truck' | 'Straight_Truck';
  equipment: 'Dry_Van' | 'Flatbed' | 'Reefer' | 'Box' | 'Pickup_Bed' | 'Cargo_Area' | 'Stepdeck';
  maxWeight: number; // in pounds
  maxDimensions: { length: number; width: number; height: number };
  capabilities: string[];
}

export interface LoadOpportunity {
  id: string;
  vehicleClass: string;
  equipmentType: string;
  origin: string;
  destination: string;
  weight: number;
  dimensions: { length: number; width: number; height: number; pieces: number };
  commodity: string;
  rate: number;
  mileage: number;
  ratePerMile: number;
  urgency: 'standard' | 'expedite' | 'emergency' | 'hotshot' | 'same_day';
  loadSize: 'full' | 'partial' | 'ltl' | 'expedite' | 'hotshot' | 'small_package';
  brokerageType: 'direct' | 'brokered' | 'partner' | 'spot_market' | 'expedite_network';
  aiMatchScore: number;
  marketRate: number;
  competitorAnalysis: {
    averageRate: number;
    rateRange: { min: number; max: number };
    marketDemand: 'low' | 'medium' | 'high' | 'critical';
  };
  pickupWindow: { start: Date; end: Date };
  deliveryWindow: { start: Date; end: Date };
  specialRequirements: string[];
  profitMargin: number;
  source: string;
}

export interface BrokerageStrategy {
  targetVehicleTypes: string[];
  loadSizePreference: string[];
  urgencyHandling: string[];
  rateOptimization: {
    minimumMargin: number;
    targetMargin: number;
    aggressiveBidding: boolean;
  };
  marketFocus: string[];
  geographicPreference: string[];
}

export class MultiVehicleBrokerage {
  private vehicleSpecs: Map<string, VehicleSpecification> = new Map();
  private loadOpportunities: Map<string, LoadOpportunity> = new Map();
  private brokerageStrategies: Map<string, BrokerageStrategy> = new Map();

  constructor() {
    this.initializeVehicleSpecifications();
    this.initializeBrokerageStrategies();
    this.startLoadDiscovery();
  }

  private initializeVehicleSpecifications() {
    // Class 8 Semi Trucks
    this.vehicleSpecs.set('class_8_semi', {
      class: 'Class_8',
      type: 'Semi_Truck',
      equipment: 'Dry_Van',
      maxWeight: 80000,
      maxDimensions: { length: 53, width: 8.5, height: 13.5 },
      capabilities: ['long_haul', 'full_truckload', 'high_capacity']
    });

    // Box Trucks (Class 5-7)
    this.vehicleSpecs.set('class_6_box', {
      class: 'Class_6',
      type: 'Box_Truck',
      equipment: 'Box',
      maxWeight: 26000,
      maxDimensions: { length: 26, width: 8, height: 8 },
      capabilities: ['local_delivery', 'urban_access', 'residential']
    });

    this.vehicleSpecs.set('class_5_box', {
      class: 'Class_5',
      type: 'Box_Truck',
      equipment: 'Box',
      maxWeight: 19500,
      maxDimensions: { length: 20, width: 8, height: 8 },
      capabilities: ['local_delivery', 'urban_access', 'small_loads']
    });

    // Hotshot Trucks (Class 3-5)
    this.vehicleSpecs.set('class_5_hotshot', {
      class: 'Class_5',
      type: 'Hotshot',
      equipment: 'Flatbed',
      maxWeight: 19500,
      maxDimensions: { length: 40, width: 8.5, height: 8.5 },
      capabilities: ['expedite', 'time_critical', 'specialized_cargo']
    });

    this.vehicleSpecs.set('class_4_hotshot', {
      class: 'Class_4',
      type: 'Hotshot',
      equipment: 'Flatbed',
      maxWeight: 16000,
      maxDimensions: { length: 32, width: 8, height: 8 },
      capabilities: ['expedite', 'regional', 'quick_turnaround']
    });

    // Pickup Trucks and Small Vehicles
    this.vehicleSpecs.set('pickup_truck', {
      class: 'Pickup',
      type: 'Pickup_Truck',
      equipment: 'Pickup_Bed',
      maxWeight: 3500,
      maxDimensions: { length: 8, width: 6, height: 2 },
      capabilities: ['small_loads', 'expedite', 'local', 'same_day']
    });

    this.vehicleSpecs.set('cargo_van', {
      class: 'Class_3',
      type: 'Cargo_Van',
      equipment: 'Cargo_Area',
      maxWeight: 10000,
      maxDimensions: { length: 12, width: 6, height: 6 },
      capabilities: ['expedite', 'urban', 'same_day', 'small_package']
    });

    // Straight Trucks
    this.vehicleSpecs.set('class_7_straight', {
      class: 'Class_7',
      type: 'Straight_Truck',
      equipment: 'Box',
      maxWeight: 33000,
      maxDimensions: { length: 28, width: 8, height: 9 },
      capabilities: ['regional', 'ltl', 'furniture', 'appliances']
    });
  }

  private initializeBrokerageStrategies() {
    // Hotshot Expedite Strategy
    this.brokerageStrategies.set('hotshot_expedite', {
      targetVehicleTypes: ['Hotshot', 'Pickup_Truck'],
      loadSizePreference: ['expedite', 'hotshot', 'small_package'],
      urgencyHandling: ['emergency', 'hotshot', 'same_day', 'expedite'],
      rateOptimization: {
        minimumMargin: 25,
        targetMargin: 40,
        aggressiveBidding: true
      },
      marketFocus: ['expedite_network', 'spot_market'],
      geographicPreference: ['regional', 'urban', 'high_demand_lanes']
    });

    // Box Truck Local Strategy
    this.brokerageStrategies.set('box_truck_local', {
      targetVehicleTypes: ['Box_Truck', 'Straight_Truck'],
      loadSizePreference: ['partial', 'ltl', 'full'],
      urgencyHandling: ['standard', 'expedite'],
      rateOptimization: {
        minimumMargin: 20,
        targetMargin: 30,
        aggressiveBidding: false
      },
      marketFocus: ['direct', 'partner'],
      geographicPreference: ['local', 'regional', 'urban']
    });

    // Small Vehicle Same-Day Strategy
    this.brokerageStrategies.set('small_vehicle_same_day', {
      targetVehicleTypes: ['Pickup_Truck', 'Cargo_Van'],
      loadSizePreference: ['small_package', 'expedite'],
      urgencyHandling: ['same_day', 'emergency', 'hotshot'],
      rateOptimization: {
        minimumMargin: 35,
        targetMargin: 50,
        aggressiveBidding: true
      },
      marketFocus: ['spot_market', 'expedite_network'],
      geographicPreference: ['urban', 'metro', 'high_density']
    });

    // Semi Truck Traditional Strategy
    this.brokerageStrategies.set('semi_truck_traditional', {
      targetVehicleTypes: ['Semi_Truck'],
      loadSizePreference: ['full'],
      urgencyHandling: ['standard', 'expedite'],
      rateOptimization: {
        minimumMargin: 15,
        targetMargin: 25,
        aggressiveBidding: false
      },
      marketFocus: ['direct', 'brokered', 'partner'],
      geographicPreference: ['long_haul', 'regional', 'dedicated_lanes']
    });
  }

  private startLoadDiscovery() {
    // Simulate real-time load discovery across multiple sources
    this.generateSampleOpportunities();
    
    // Set up continuous monitoring
    setInterval(() => {
      this.updateMarketConditions();
      this.optimizeRates();
    }, 30000); // Every 30 seconds
  }

  private generateSampleOpportunities() {
    // Hotshot Opportunities
    const hotshotOpportunity: LoadOpportunity = {
      id: 'hotshot-001',
      vehicleClass: 'Class_5',
      equipmentType: 'Flatbed',
      origin: 'Houston, TX',
      destination: 'Dallas, TX',
      weight: 8500,
      dimensions: { length: 20, width: 8, height: 4, pieces: 1 },
      commodity: 'Steel Beams',
      rate: 2400,
      mileage: 240,
      ratePerMile: 10.00,
      urgency: 'hotshot',
      loadSize: 'hotshot',
      brokerageType: 'expedite_network',
      aiMatchScore: 94,
      marketRate: 2200,
      competitorAnalysis: {
        averageRate: 2100,
        rateRange: { min: 1900, max: 2500 },
        marketDemand: 'high'
      },
      pickupWindow: { start: new Date(Date.now() + 2 * 60 * 60 * 1000), end: new Date(Date.now() + 4 * 60 * 60 * 1000) },
      deliveryWindow: { start: new Date(Date.now() + 8 * 60 * 60 * 1000), end: new Date(Date.now() + 12 * 60 * 60 * 1000) },
      specialRequirements: ['tarps_required', 'time_critical'],
      profitMargin: 35,
      source: 'SuperDispatch'
    };

    // Box Truck Opportunity
    const boxTruckOpportunity: LoadOpportunity = {
      id: 'box-001',
      vehicleClass: 'Class_6',
      equipmentType: 'Box',
      origin: 'Los Angeles, CA',
      destination: 'San Diego, CA',
      weight: 15000,
      dimensions: { length: 24, width: 8, height: 8, pieces: 45 },
      commodity: 'Retail Goods',
      rate: 850,
      mileage: 120,
      ratePerMile: 7.08,
      urgency: 'standard',
      loadSize: 'partial',
      brokerageType: 'direct',
      aiMatchScore: 89,
      marketRate: 800,
      competitorAnalysis: {
        averageRate: 780,
        rateRange: { min: 700, max: 900 },
        marketDemand: 'medium'
      },
      pickupWindow: { start: new Date(Date.now() + 24 * 60 * 60 * 1000), end: new Date(Date.now() + 28 * 60 * 60 * 1000) },
      deliveryWindow: { start: new Date(Date.now() + 30 * 60 * 60 * 1000), end: new Date(Date.now() + 36 * 60 * 60 * 1000) },
      specialRequirements: ['liftgate_required', 'residential_delivery'],
      profitMargin: 28,
      source: 'DAT'
    };

    // Pickup Truck Expedite
    const pickupOpportunity: LoadOpportunity = {
      id: 'pickup-001',
      vehicleClass: 'Pickup',
      equipmentType: 'Pickup_Bed',
      origin: 'Phoenix, AZ',
      destination: 'Tucson, AZ',
      weight: 1200,
      dimensions: { length: 6, width: 4, height: 3, pieces: 3 },
      commodity: 'Medical Supplies',
      rate: 650,
      mileage: 116,
      ratePerMile: 5.60,
      urgency: 'same_day',
      loadSize: 'small_package',
      brokerageType: 'spot_market',
      aiMatchScore: 96,
      marketRate: 600,
      competitorAnalysis: {
        averageRate: 580,
        rateRange: { min: 500, max: 700 },
        marketDemand: 'critical'
      },
      pickupWindow: { start: new Date(Date.now() + 1 * 60 * 60 * 1000), end: new Date(Date.now() + 2 * 60 * 60 * 1000) },
      deliveryWindow: { start: new Date(Date.now() + 4 * 60 * 60 * 1000), end: new Date(Date.now() + 6 * 60 * 60 * 1000) },
      specialRequirements: ['temperature_controlled', 'signature_required'],
      profitMargin: 45,
      source: 'Expedite Exchange'
    };

    // Cargo Van Opportunity
    const cargoVanOpportunity: LoadOpportunity = {
      id: 'van-001',
      vehicleClass: 'Class_3',
      equipmentType: 'Cargo_Area',
      origin: 'Miami, FL',
      destination: 'Fort Lauderdale, FL',
      weight: 2800,
      dimensions: { length: 10, width: 5, height: 5, pieces: 12 },
      commodity: 'Electronics',
      rate: 420,
      mileage: 28,
      ratePerMile: 15.00,
      urgency: 'expedite',
      loadSize: 'small_package',
      brokerageType: 'expedite_network',
      aiMatchScore: 92,
      marketRate: 380,
      competitorAnalysis: {
        averageRate: 360,
        rateRange: { min: 320, max: 450 },
        marketDemand: 'high'
      },
      pickupWindow: { start: new Date(Date.now() + 3 * 60 * 60 * 1000), end: new Date(Date.now() + 5 * 60 * 60 * 1000) },
      deliveryWindow: { start: new Date(Date.now() + 6 * 60 * 60 * 1000), end: new Date(Date.now() + 8 * 60 * 60 * 1000) },
      specialRequirements: ['inside_delivery', 'white_glove'],
      profitMargin: 38,
      source: 'Amazon Relay'
    };

    // Store opportunities
    this.loadOpportunities.set(hotshotOpportunity.id, hotshotOpportunity);
    this.loadOpportunities.set(boxTruckOpportunity.id, boxTruckOpportunity);
    this.loadOpportunities.set(pickupOpportunity.id, pickupOpportunity);
    this.loadOpportunities.set(cargoVanOpportunity.id, cargoVanOpportunity);
  }

  private updateMarketConditions() {
    // Update AI match scores and market rates based on real-time conditions
    for (const [id, opportunity] of this.loadOpportunities) {
      // Simulate market fluctuation
      const marketVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
      opportunity.marketRate = Math.round(opportunity.marketRate * (1 + marketVariation));
      
      // Update match score based on urgency and market demand
      if (opportunity.urgency === 'same_day' || opportunity.urgency === 'hotshot') {
        opportunity.aiMatchScore = Math.min(98, opportunity.aiMatchScore + 2);
      }
    }
  }

  private optimizeRates() {
    // AI-powered rate optimization for each load type
    for (const [id, opportunity] of this.loadOpportunities) {
      const strategy = this.getBestStrategy(opportunity);
      if (strategy) {
        this.applyOptimizationStrategy(opportunity, strategy);
      }
    }
  }

  private getBestStrategy(opportunity: LoadOpportunity): BrokerageStrategy | undefined {
    for (const [strategyId, strategy] of this.brokerageStrategies) {
      const vehicleMatch = strategy.targetVehicleTypes.some(type => 
        opportunity.equipmentType.toLowerCase().includes(type.toLowerCase())
      );
      const loadSizeMatch = strategy.loadSizePreference.includes(opportunity.loadSize);
      const urgencyMatch = strategy.urgencyHandling.includes(opportunity.urgency);
      
      if (vehicleMatch && loadSizeMatch && urgencyMatch) {
        return strategy;
      }
    }
    return undefined;
  }

  private applyOptimizationStrategy(opportunity: LoadOpportunity, strategy: BrokerageStrategy) {
    const currentMargin = opportunity.profitMargin;
    const targetMargin = strategy.rateOptimization.targetMargin;
    
    if (currentMargin < strategy.rateOptimization.minimumMargin) {
      // Increase rate to meet minimum margin
      const newRate = opportunity.marketRate * (1 + strategy.rateOptimization.minimumMargin / 100);
      opportunity.rate = Math.round(newRate);
      opportunity.ratePerMile = Math.round((opportunity.rate / opportunity.mileage) * 100) / 100;
    } else if (strategy.rateOptimization.aggressiveBidding && currentMargin > targetMargin) {
      // Competitive pricing for aggressive markets
      const competitiveRate = opportunity.competitorAnalysis.averageRate * 1.05;
      opportunity.rate = Math.round(competitiveRate);
      opportunity.ratePerMile = Math.round((opportunity.rate / opportunity.mileage) * 100) / 100;
    }
  }

  public async findOptimalOpportunities(vehicleClass: string, equipmentType: string): Promise<LoadOpportunity[]> {
    const opportunities = Array.from(this.loadOpportunities.values());
    
    return opportunities.filter(opp => {
      const vehicleSpec = this.getVehicleSpec(vehicleClass, equipmentType);
      if (!vehicleSpec) return false;
      
      // Check weight capacity
      if (opp.weight > vehicleSpec.maxWeight) return false;
      
      // Check dimensions
      if (opp.dimensions.length > vehicleSpec.maxDimensions.length ||
          opp.dimensions.width > vehicleSpec.maxDimensions.width ||
          opp.dimensions.height > vehicleSpec.maxDimensions.height) return false;
      
      // Check equipment compatibility
      if (!this.isEquipmentCompatible(opp.equipmentType, vehicleSpec.equipment)) return false;
      
      return true;
    }).sort((a, b) => b.aiMatchScore - a.aiMatchScore);
  }

  private getVehicleSpec(vehicleClass: string, equipmentType: string): VehicleSpecification | undefined {
    const key = `${vehicleClass.toLowerCase()}_${equipmentType.toLowerCase()}`;
    return this.vehicleSpecs.get(key);
  }

  private isEquipmentCompatible(loadEquipment: string, vehicleEquipment: string): boolean {
    const compatibilityMap: { [key: string]: string[] } = {
      'Dry_Van': ['Van', 'Box'],
      'Flatbed': ['Flatbed', 'Pickup_Bed'],
      'Box': ['Box', 'Cargo_Area'],
      'Pickup_Bed': ['Flatbed', 'Pickup_Bed'],
      'Cargo_Area': ['Box', 'Cargo_Area', 'Van']
    };
    
    const compatibleTypes = compatibilityMap[vehicleEquipment] || [];
    return compatibleTypes.includes(loadEquipment);
  }

  public getOpportunityById(id: string): LoadOpportunity | undefined {
    return this.loadOpportunities.get(id);
  }

  public getAllOpportunities(): LoadOpportunity[] {
    return Array.from(this.loadOpportunities.values());
  }

  public getOpportunitiesByUrgency(urgency: string): LoadOpportunity[] {
    return Array.from(this.loadOpportunities.values())
      .filter(opp => opp.urgency === urgency)
      .sort((a, b) => b.aiMatchScore - a.aiMatchScore);
  }

  public getOpportunitiesByVehicleClass(vehicleClass: string): LoadOpportunity[] {
    return Array.from(this.loadOpportunities.values())
      .filter(opp => opp.vehicleClass === vehicleClass)
      .sort((a, b) => b.profitMargin - a.profitMargin);
  }

  public async generateMarketReport(): Promise<{
    summary: any;
    hotshots: any;
    boxTrucks: any;
    smallVehicles: any;
    opportunities: any;
  }> {
    const opportunities = this.getAllOpportunities();
    
    const hotshotOpps = opportunities.filter(opp => 
      opp.equipmentType === 'Flatbed' && (opp.vehicleClass === 'Class_4' || opp.vehicleClass === 'Class_5')
    );
    
    const boxTruckOpps = opportunities.filter(opp => 
      opp.equipmentType === 'Box' && (opp.vehicleClass === 'Class_5' || opp.vehicleClass === 'Class_6' || opp.vehicleClass === 'Class_7')
    );
    
    const smallVehicleOpps = opportunities.filter(opp => 
      opp.vehicleClass === 'Pickup' || opp.vehicleClass === 'Class_3'
    );
    
    return {
      summary: {
        totalOpportunities: opportunities.length,
        averageRate: opportunities.reduce((sum, opp) => sum + opp.rate, 0) / opportunities.length,
        averageMargin: opportunities.reduce((sum, opp) => sum + opp.profitMargin, 0) / opportunities.length,
        highUrgencyCount: opportunities.filter(opp => opp.urgency === 'hotshot' || opp.urgency === 'same_day').length
      },
      hotshots: {
        count: hotshotOpps.length,
        averageRate: hotshotOpps.reduce((sum, opp) => sum + opp.ratePerMile, 0) / hotshotOpps.length,
        topRate: Math.max(...hotshotOpps.map(opp => opp.ratePerMile)),
        urgentLoads: hotshotOpps.filter(opp => opp.urgency === 'hotshot').length
      },
      boxTrucks: {
        count: boxTruckOpps.length,
        averageRate: boxTruckOpps.reduce((sum, opp) => sum + opp.ratePerMile, 0) / boxTruckOpps.length,
        topRate: Math.max(...boxTruckOpps.map(opp => opp.ratePerMile)),
        localDeliveries: boxTruckOpps.filter(opp => opp.mileage < 200).length
      },
      smallVehicles: {
        count: smallVehicleOpps.length,
        averageRate: smallVehicleOpps.reduce((sum, opp) => sum + opp.ratePerMile, 0) / smallVehicleOpps.length,
        topRate: Math.max(...smallVehicleOpps.map(opp => opp.ratePerMile)),
        sameDayLoads: smallVehicleOpps.filter(opp => opp.urgency === 'same_day').length
      },
      opportunities: opportunities.slice(0, 10) // Top 10 opportunities
    };
  }
}

export const multiVehicleBrokerage = new MultiVehicleBrokerage();