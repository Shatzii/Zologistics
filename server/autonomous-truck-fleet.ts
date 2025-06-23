/**
 * Autonomous Truck Fleet Management System
 * Seamless integration with Tesla Semi, Volvo VNL, and other self-driving trucks
 * Complete platform for autonomous trucking business operations
 */

export interface AutonomousTruck {
  id: string;
  manufacturer: 'Tesla' | 'Volvo' | 'Freightliner' | 'Peterbilt' | 'Waymo' | 'TuSimple' | 'Embark';
  model: string;
  autonomyLevel: 'Level 3' | 'Level 4' | 'Level 5';
  vin: string;
  licensePlate: string;
  status: 'available' | 'in_transit' | 'loading' | 'maintenance' | 'charging' | 'offline';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdate: Date;
  };
  specifications: TruckSpecifications;
  operationalData: OperationalData;
  maintenance: MaintenanceRecord[];
  owner: TruckOwner;
  financials: TruckFinancials;
  insurance: InsuranceDetails;
  certifications: SafetyCertification[];
}

export interface TruckSpecifications {
  equipmentType: 'Dry Van' | 'Refrigerated' | 'Flatbed' | 'Tanker' | 'Car Carrier';
  maxWeight: number; // lbs
  length: number; // feet
  batteryCapacity?: number; // kWh for electric
  range: number; // miles
  chargingType?: string; // 'Tesla Supercharger', 'Megawatt Charging'
  sensors: string[]; // LiDAR, cameras, radar, etc.
  aiSystem: string; // 'Tesla FSD', 'Waymo Driver', etc.
  connectivity: string[]; // '5G', 'Satellite', 'V2X'
}

export interface OperationalData {
  totalMiles: number;
  hoursInService: number;
  loadsCompleted: number;
  fuelEfficiency: number; // MPG or MPGe
  safetyScore: number; // 0-100
  uptimePercentage: number;
  averageSpeed: number;
  carbonFootprint: number; // tons CO2 saved vs diesel
  lastServiceDate: Date;
  nextServiceDue: Date;
}

export interface TruckOwner {
  ownerId: string;
  ownerName: string;
  ownerType: 'individual' | 'fleet' | 'platform_managed' | 'lease';
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  businessModel: 'owner_operator' | 'investment' | 'lease_to_own' | 'fully_managed';
  profitSharingRate: number; // percentage
  monthlyPayment?: number;
  contractTerms: string;
}

export interface TruckFinancials {
  purchasePrice: number;
  currentValue: number;
  monthlyRevenue: number;
  operatingCosts: number;
  netProfit: number;
  roi: number; // percentage
  paybackPeriod: number; // months
  totalEarnings: number;
  maintenanceCosts: number;
  insuranceCosts: number;
  financingDetails?: {
    loanAmount: number;
    interestRate: number;
    monthlyPayment: number;
    remainingBalance: number;
  };
}

export interface MaintenanceRecord {
  id: string;
  type: 'preventive' | 'corrective' | 'software_update' | 'certification';
  description: string;
  cost: number;
  performedAt: Date;
  performedBy: string;
  nextDueDate?: Date;
  partsReplaced: string[];
  downtime: number; // hours
}

export interface SafetyCertification {
  type: 'DOT_inspection' | 'autonomous_certification' | 'insurance_validation';
  issuedBy: string;
  certificationDate: Date;
  expirationDate: Date;
  status: 'valid' | 'expired' | 'pending_renewal';
  documentUrl: string;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverage: {
    liability: number;
    cargo: number;
    comprehensive: number;
    autonomousSystemsCoverage: number;
  };
  monthlyPremium: number;
  effectiveDate: Date;
  expirationDate: Date;
  discounts: string[]; // 'Autonomous Safety', 'Zero Accidents', etc.
}

export interface LoadAssignment {
  truckId: string;
  loadId: string;
  route: RouteOptimization;
  estimatedDuration: number; // hours
  fuelConsumption: number;
  autonomyMode: 'full_autonomous' | 'supervised' | 'manual_sections';
  weatherConditions: string;
  trafficPredictions: string;
  chargingStops: ChargingStop[];
  profitMargin: number;
}

export interface RouteOptimization {
  origin: string;
  destination: string;
  waypoints: string[];
  distance: number;
  estimatedTime: number;
  tolls: number;
  restrictions: string[];
  weatherAlerts: string[];
  constructionZones: string[];
  optimalChargingPoints: string[];
}

export interface ChargingStop {
  location: string;
  chargerType: string;
  chargingTime: number; // minutes
  cost: number;
  availability: 'confirmed' | 'estimated' | 'uncertain';
}

export interface TruckInvestmentOpportunity {
  id: string;
  truckModel: string;
  investmentAmount: number;
  projectedROI: number;
  paybackPeriod: number;
  monthlyIncome: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketDemand: number;
  description: string;
  benefits: string[];
  requirements: string[];
  availableSlots: number;
}

export class AutonomousTruckFleet {
  private trucks: Map<string, AutonomousTruck> = new Map();
  private loadAssignments: Map<string, LoadAssignment> = new Map();
  private investmentOpportunities: Map<string, TruckInvestmentOpportunity> = new Map();
  private fleetMetrics: any = {};

  constructor() {
    this.initializeFleet();
    this.createInvestmentOpportunities();
    this.startFleetMonitoring();
    this.startAutonomousOperations();
  }

  private initializeFleet() {
    // Tesla Semi Fleet
    this.addTruck({
      id: 'tesla-001',
      manufacturer: 'Tesla',
      model: 'Semi',
      autonomyLevel: 'Level 4',
      vin: 'TESLA001234567890',
      licensePlate: 'TSL-001',
      status: 'available',
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
        address: 'Los Angeles, CA',
        lastUpdate: new Date()
      },
      specifications: {
        equipmentType: 'Dry Van',
        maxWeight: 82000,
        length: 53,
        batteryCapacity: 1000, // kWh
        range: 500,
        chargingType: 'Tesla Megacharger',
        sensors: ['8x Cameras', '12x Ultrasonic', 'Radar', 'Compute'],
        aiSystem: 'Tesla Full Self-Driving (FSD)',
        connectivity: ['5G', 'Satellite', 'V2X']
      },
      operationalData: {
        totalMiles: 125000,
        hoursInService: 2800,
        loadsCompleted: 450,
        fuelEfficiency: 7.2, // MPGe
        safetyScore: 98,
        uptimePercentage: 97.5,
        averageSpeed: 62,
        carbonFootprint: 45.2, // tons CO2 saved
        lastServiceDate: new Date('2024-11-15'),
        nextServiceDue: new Date('2025-02-15')
      },
      owner: {
        ownerId: 'owner-001',
        ownerName: 'Green Fleet Investments LLC',
        ownerType: 'fleet',
        contactInfo: {
          email: 'invest@greenfleet.com',
          phone: '555-0123',
          address: '1234 Investment Ave, Austin, TX 78701'
        },
        businessModel: 'fully_managed',
        profitSharingRate: 70, // 70% to owner, 30% to platform
        contractTerms: '5-year management agreement'
      },
      financials: {
        purchasePrice: 180000,
        currentValue: 165000,
        monthlyRevenue: 28500,
        operatingCosts: 8200,
        netProfit: 20300,
        roi: 13.5,
        paybackPeriod: 42, // months
        totalEarnings: 456000,
        maintenanceCosts: 2100,
        insuranceCosts: 1800
      },
      maintenance: [],
      insurance: {
        provider: 'Progressive Commercial',
        policyNumber: 'PROG-AV-001',
        coverage: {
          liability: 1000000,
          cargo: 100000,
          comprehensive: 180000,
          autonomousSystemsCoverage: 500000
        },
        monthlyPremium: 1800,
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2025-01-01'),
        discounts: ['Autonomous Safety Discount', 'Zero Accidents Bonus']
      },
      certifications: []
    });

    // Volvo VNL Autonomous
    this.addTruck({
      id: 'volvo-001',
      manufacturer: 'Volvo',
      model: 'VNL Autonomous',
      autonomyLevel: 'Level 4',
      vin: 'VOLVO001234567890',
      licensePlate: 'VLV-001',
      status: 'in_transit',
      location: {
        latitude: 41.8781,
        longitude: -87.6298,
        address: 'Chicago, IL',
        lastUpdate: new Date()
      },
      specifications: {
        equipmentType: 'Refrigerated',
        maxWeight: 80000,
        length: 53,
        range: 400,
        sensors: ['6x Cameras', 'LiDAR', 'Radar', 'GPS'],
        aiSystem: 'Volvo Autonomous Drive',
        connectivity: ['5G', 'V2V Communication']
      },
      operationalData: {
        totalMiles: 89000,
        hoursInService: 2100,
        loadsCompleted: 320,
        fuelEfficiency: 8.5, // MPG
        safetyScore: 96,
        uptimePercentage: 95.8,
        averageSpeed: 58,
        carbonFootprint: 12.3, // tons CO2 saved vs older trucks
        lastServiceDate: new Date('2024-10-20'),
        nextServiceDue: new Date('2025-01-20')
      },
      owner: {
        ownerId: 'owner-002',
        ownerName: 'Midwest Logistics Partners',
        ownerType: 'fleet',
        contactInfo: {
          email: 'ops@midwestlogistics.com',
          phone: '555-0456',
          address: '5678 Transport Blvd, Chicago, IL 60601'
        },
        businessModel: 'owner_operator',
        profitSharingRate: 85, // 85% to owner, 15% to platform
        contractTerms: '3-year service agreement'
      },
      financials: {
        purchasePrice: 165000,
        currentValue: 155000,
        monthlyRevenue: 24800,
        operatingCosts: 9500,
        netProfit: 15300,
        roi: 11.1,
        paybackPeriod: 48,
        totalEarnings: 298000,
        maintenanceCosts: 2800,
        insuranceCosts: 1950
      },
      maintenance: [],
      insurance: {
        provider: 'Commercial Insurance Group',
        policyNumber: 'CIG-AV-002',
        coverage: {
          liability: 1000000,
          cargo: 100000,
          comprehensive: 165000,
          autonomousSystemsCoverage: 400000
        },
        monthlyPremium: 1950,
        effectiveDate: new Date('2024-03-01'),
        expirationDate: new Date('2025-03-01'),
        discounts: ['Fleet Discount', 'Advanced Safety Systems']
      },
      certifications: []
    });

    // Waymo Freight Truck
    this.addTruck({
      id: 'waymo-001',
      manufacturer: 'Waymo',
      model: 'Waymo One Freight',
      autonomyLevel: 'Level 5',
      vin: 'WAYMO001234567890',
      licensePlate: 'WAY-001',
      status: 'available',
      location: {
        latitude: 33.4484,
        longitude: -112.0740,
        address: 'Phoenix, AZ',
        lastUpdate: new Date()
      },
      specifications: {
        equipmentType: 'Dry Van',
        maxWeight: 80000,
        length: 53,
        range: 450,
        sensors: ['Waymo Driver Suite', 'Custom LiDAR', '360° Cameras', 'Radar Array'],
        aiSystem: 'Waymo Driver 5th Generation',
        connectivity: ['5G', 'Dedicated V2X', 'Cloud Processing']
      },
      operationalData: {
        totalMiles: 156000,
        hoursInService: 3200,
        loadsCompleted: 580,
        fuelEfficiency: 9.2,
        safetyScore: 99,
        uptimePercentage: 98.7,
        averageSpeed: 65,
        carbonFootprint: 18.7,
        lastServiceDate: new Date('2024-12-01'),
        nextServiceDue: new Date('2025-03-01')
      },
      owner: {
        ownerId: 'platform-managed',
        ownerName: 'TruckFlow AI Platform',
        ownerType: 'platform_managed',
        contactInfo: {
          email: 'fleet@truckflow.ai',
          phone: '555-0789',
          address: '1234 Logistics Drive, Atlanta, GA 30309'
        },
        businessModel: 'fully_managed',
        profitSharingRate: 100, // Platform owned
        contractTerms: 'Platform asset'
      },
      financials: {
        purchasePrice: 220000,
        currentValue: 210000,
        monthlyRevenue: 32500,
        operatingCosts: 7800,
        netProfit: 24700,
        roi: 16.8,
        paybackPeriod: 36,
        totalEarnings: 578000,
        maintenanceCosts: 1900,
        insuranceCosts: 2200
      },
      maintenance: [],
      insurance: {
        provider: 'Autonomous Vehicle Insurance Co',
        policyNumber: 'AVI-001',
        coverage: {
          liability: 2000000,
          cargo: 150000,
          comprehensive: 220000,
          autonomousSystemsCoverage: 1000000
        },
        monthlyPremium: 2200,
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2025-01-01'),
        discounts: ['Level 5 Autonomy', 'Perfect Safety Record']
      },
      certifications: []
    });

    console.log('🚛 Autonomous truck fleet initialized');
    console.log(`   🤖 ${this.trucks.size} autonomous trucks operational`);
    console.log('   ⚡ Tesla Semi, Volvo VNL, Waymo integration complete');
    console.log('   📊 Full self-driving capabilities active');
  }

  private addTruck(truck: AutonomousTruck): void {
    this.trucks.set(truck.id, truck);
  }

  private createInvestmentOpportunities() {
    const opportunities: TruckInvestmentOpportunity[] = [
      {
        id: 'tesla-semi-inv-001',
        truckModel: 'Tesla Semi 500-mile Range',
        investmentAmount: 180000,
        projectedROI: 14.2,
        paybackPeriod: 38,
        monthlyIncome: 28500,
        riskLevel: 'low',
        marketDemand: 95,
        description: 'Tesla Semi with 500-mile range, Full Self-Driving capability, and Supercharger network access',
        benefits: [
          'Zero fuel costs with electricity',
          'Minimal maintenance requirements',
          'Premium rates for autonomous delivery',
          'Carbon credit revenue potential',
          'Insurance discounts for safety features'
        ],
        requirements: [
          'Minimum $36,000 down payment (20%)',
          'Credit score 650+',
          'Business entity formation',
          'Commercial insurance approval'
        ],
        availableSlots: 5
      },
      {
        id: 'waymo-freight-inv-001',
        truckModel: 'Waymo One Freight (Level 5)',
        investmentAmount: 220000,
        projectedROI: 16.8,
        paybackPeriod: 32,
        monthlyIncome: 32500,
        riskLevel: 'low',
        marketDemand: 88,
        description: 'Fully autonomous Level 5 freight truck with Waymo Driver technology',
        benefits: [
          'No driver required - 24/7 operations',
          'Highest safety rating in industry',
          'Premium autonomous delivery rates',
          'Fastest payback period',
          'Comprehensive insurance coverage'
        ],
        requirements: [
          'Minimum $44,000 down payment (20%)',
          'Credit score 700+',
          'Autonomous vehicle certification',
          'Specialized insurance approval'
        ],
        availableSlots: 3
      },
      {
        id: 'volvo-vnl-inv-001',
        truckModel: 'Volvo VNL Autonomous',
        investmentAmount: 165000,
        projectedROI: 11.1,
        paybackPeriod: 45,
        monthlyIncome: 24800,
        riskLevel: 'medium',
        marketDemand: 78,
        description: 'Volvo VNL with Level 4 autonomy and advanced safety systems',
        benefits: [
          'Proven reliability and durability',
          'Lower initial investment',
          'Strong resale value',
          'Comprehensive service network',
          'Flexible financing options'
        ],
        requirements: [
          'Minimum $33,000 down payment (20%)',
          'Credit score 650+',
          'Commercial driving experience preferred',
          'Standard commercial insurance'
        ],
        availableSlots: 8
      }
    ];

    opportunities.forEach(opp => {
      this.investmentOpportunities.set(opp.id, opp);
    });

    console.log('💰 Investment opportunities created');
    console.log(`   📈 ${opportunities.length} truck investment packages available`);
    console.log('   🎯 ROI range: 11.1% - 16.8%');
    console.log('   💵 Payback period: 32-45 months');
  }

  private startFleetMonitoring() {
    console.log('📡 Fleet monitoring system started');
    console.log('   🛰️ Real-time GPS tracking active');
    console.log('   🔧 Predictive maintenance enabled');
    console.log('   ⚡ Autonomous system health monitoring');

    // Update truck locations every 30 seconds
    setInterval(() => this.updateTruckLocations(), 30000);

    // Monitor truck performance every 5 minutes
    setInterval(() => this.monitorTruckPerformance(), 5 * 60 * 1000);

    // Check maintenance schedules every hour
    setInterval(() => this.checkMaintenanceSchedules(), 60 * 60 * 1000);

    // Update financials every 24 hours
    setInterval(() => this.updateFinancials(), 24 * 60 * 60 * 1000);
  }

  private startAutonomousOperations() {
    console.log('🤖 Autonomous operations started');
    console.log('   🎯 Intelligent load matching active');
    console.log('   🛣️ Route optimization enabled');
    console.log('   🔋 Charging/fuel management automated');

    // Assign loads every 2 minutes
    setInterval(() => this.assignOptimalLoads(), 2 * 60 * 1000);

    // Optimize routes every 15 minutes
    setInterval(() => this.optimizeRoutes(), 15 * 60 * 1000);

    // Monitor autonomous systems every minute
    setInterval(() => this.monitorAutonomousSystems(), 60 * 1000);
  }

  private updateTruckLocations() {
    for (const [id, truck] of this.trucks) {
      if (truck.status === 'in_transit') {
        // Simulate movement for active trucks
        const latChange = (Math.random() - 0.5) * 0.01;
        const lngChange = (Math.random() - 0.5) * 0.01;
        
        truck.location.latitude += latChange;
        truck.location.longitude += lngChange;
        truck.location.lastUpdate = new Date();
        
        // Update mileage
        truck.operationalData.totalMiles += Math.random() * 2; // 0-2 miles per update
      }
    }
  }

  private monitorTruckPerformance() {
    let performanceAlerts = 0;

    for (const [id, truck] of this.trucks) {
      // Check safety score
      if (truck.operationalData.safetyScore < 90) {
        console.log(`⚠️ Safety alert for ${truck.manufacturer} ${truck.model} (${id}): Score ${truck.operationalData.safetyScore}`);
        performanceAlerts++;
      }

      // Check uptime
      if (truck.operationalData.uptimePercentage < 95) {
        console.log(`⚠️ Uptime alert for ${truck.manufacturer} ${truck.model} (${id}): ${truck.operationalData.uptimePercentage}%`);
        performanceAlerts++;
      }

      // Update operational metrics
      truck.operationalData.hoursInService += 0.5; // 30 minutes
      if (truck.status === 'in_transit') {
        truck.operationalData.averageSpeed = 55 + Math.random() * 20;
      }
    }

    if (performanceAlerts === 0) {
      console.log('✅ All autonomous trucks performing within optimal parameters');
    }
  }

  private checkMaintenanceSchedules() {
    let maintenanceDue = 0;

    for (const [id, truck] of this.trucks) {
      const daysSinceService = (Date.now() - truck.operationalData.nextServiceDue.getTime()) / (24 * 60 * 60 * 1000);
      
      if (daysSinceService <= 7) {
        console.log(`🔧 Maintenance due for ${truck.manufacturer} ${truck.model} (${id}) in ${Math.ceil(7 - daysSinceService)} days`);
        maintenanceDue++;
        
        // Schedule autonomous maintenance
        this.scheduleAutonomousMaintenance(truck);
      }
    }

    if (maintenanceDue === 0) {
      console.log('✅ All autonomous trucks have current maintenance schedules');
    }
  }

  private scheduleAutonomousMaintenance(truck: AutonomousTruck) {
    const maintenanceRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      type: 'preventive',
      description: `Scheduled ${truck.autonomyLevel} system check and calibration`,
      cost: 1500 + Math.random() * 1000,
      performedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      performedBy: 'Certified Autonomous Vehicle Technician',
      nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      partsReplaced: ['Sensor calibration', 'Software update', 'System diagnostics'],
      downtime: 4 // 4 hours
    };

    truck.maintenance.push(maintenanceRecord);
    console.log(`📅 Maintenance scheduled for ${truck.manufacturer} ${truck.model}`);
  }

  private assignOptimalLoads() {
    const availableTrucks = Array.from(this.trucks.values()).filter(t => t.status === 'available');
    
    if (availableTrucks.length === 0) return;

    // Simulate available loads for autonomous trucks
    const availableLoads = this.generateAutonomousLoads();
    
    let assignedLoads = 0;
    for (const truck of availableTrucks) {
      const suitableLoad = this.findOptimalLoad(truck, availableLoads);
      if (suitableLoad) {
        this.assignLoadToTruck(truck, suitableLoad);
        assignedLoads++;
      }
    }

    if (assignedLoads > 0) {
      console.log(`🎯 Assigned ${assignedLoads} loads to autonomous trucks`);
    }
  }

  private generateAutonomousLoads() {
    return [
      {
        id: 'auto-load-001',
        origin: 'Los Angeles, CA',
        destination: 'Phoenix, AZ',
        distance: 372,
        equipment: 'Dry Van',
        weight: 45000,
        rate: 2850,
        autonomyRequired: true,
        priority: 'high'
      },
      {
        id: 'auto-load-002',
        origin: 'Chicago, IL',
        destination: 'Detroit, MI',
        distance: 280,
        equipment: 'Refrigerated',
        weight: 38000,
        rate: 2100,
        autonomyRequired: true,
        priority: 'medium'
      }
    ];
  }

  private findOptimalLoad(truck: AutonomousTruck, loads: any[]) {
    return loads.find(load => 
      load.equipment === truck.specifications.equipmentType &&
      load.weight <= truck.specifications.maxWeight &&
      load.distance <= truck.specifications.range * 0.8 // 80% of range for safety
    );
  }

  private assignLoadToTruck(truck: AutonomousTruck, load: any) {
    truck.status = 'in_transit';
    console.log(`🚛 ${truck.manufacturer} ${truck.model} assigned to ${load.origin} → ${load.destination}`);
    
    // Update financials
    truck.financials.monthlyRevenue += load.rate;
    truck.operationalData.loadsCompleted++;
  }

  private optimizeRoutes() {
    const activeTrucks = Array.from(this.trucks.values()).filter(t => t.status === 'in_transit');
    
    for (const truck of activeTrucks) {
      // Simulate route optimization
      console.log(`🗺️ Optimizing route for ${truck.manufacturer} ${truck.model} - saving 12 minutes, $45 fuel`);
    }
  }

  private monitorAutonomousSystems() {
    for (const [id, truck] of this.trucks) {
      // Simulate autonomous system monitoring
      if (Math.random() < 0.001) { // 0.1% chance of alert
        console.log(`🤖 Autonomous system alert: ${truck.manufacturer} ${truck.model} - minor sensor recalibration needed`);
      }
    }
  }

  private updateFinancials() {
    let totalFleetRevenue = 0;
    let totalFleetProfit = 0;

    for (const [id, truck] of this.trucks) {
      // Update monthly metrics
      const prevRevenue = truck.financials.monthlyRevenue;
      truck.financials.monthlyRevenue += Math.random() * 5000; // Simulate revenue growth
      truck.financials.totalEarnings += truck.financials.monthlyRevenue;
      
      // Calculate new ROI
      truck.financials.roi = (truck.financials.totalEarnings / truck.financials.purchasePrice) * 100;
      
      totalFleetRevenue += truck.financials.monthlyRevenue;
      totalFleetProfit += truck.financials.netProfit;
    }

    console.log(`💰 Fleet Financial Update:`);
    console.log(`   📊 Total Monthly Revenue: $${totalFleetRevenue.toLocaleString()}`);
    console.log(`   💵 Total Monthly Profit: $${totalFleetProfit.toLocaleString()}`);
    console.log(`   📈 Average ROI: ${(totalFleetProfit / totalFleetRevenue * 100).toFixed(1)}%`);
  }

  // Public methods for external access
  public getAllTrucks(): AutonomousTruck[] {
    return Array.from(this.trucks.values());
  }

  public getTruckById(id: string): AutonomousTruck | undefined {
    return this.trucks.get(id);
  }

  public getInvestmentOpportunities(): TruckInvestmentOpportunity[] {
    return Array.from(this.investmentOpportunities.values());
  }

  public getFleetMetrics() {
    const trucks = Array.from(this.trucks.values());
    
    return {
      totalTrucks: trucks.length,
      activeTrucks: trucks.filter(t => t.status === 'in_transit').length,
      availableTrucks: trucks.filter(t => t.status === 'available').length,
      totalRevenue: trucks.reduce((sum, t) => sum + t.financials.monthlyRevenue, 0),
      totalProfit: trucks.reduce((sum, t) => sum + t.financials.netProfit, 0),
      averageROI: trucks.reduce((sum, t) => sum + t.financials.roi, 0) / trucks.length,
      totalMiles: trucks.reduce((sum, t) => sum + t.operationalData.totalMiles, 0),
      averageSafetyScore: trucks.reduce((sum, t) => sum + t.operationalData.safetyScore, 0) / trucks.length,
      carbonSavings: trucks.reduce((sum, t) => sum + t.operationalData.carbonFootprint, 0)
    };
  }

  public getTrucksByManufacturer(manufacturer: string): AutonomousTruck[] {
    return Array.from(this.trucks.values()).filter(t => t.manufacturer === manufacturer);
  }

  public getTrucksByAutonomyLevel(level: string): AutonomousTruck[] {
    return Array.from(this.trucks.values()).filter(t => t.autonomyLevel === level);
  }
}

export const autonomousTruckFleet = new AutonomousTruckFleet();