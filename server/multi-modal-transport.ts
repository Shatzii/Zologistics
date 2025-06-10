import { storage } from './storage';

export interface TransportMode {
  type: 'truck' | 'rail' | 'air' | 'ocean' | 'intermodal';
  provider: string;
  capabilities: {
    maxWeight: number;
    maxDistance: number;
    speedRange: { min: number; max: number };
    costPerMile: number;
    environmentalImpact: number;
  };
  restrictions: {
    hazmat: boolean;
    oversized: boolean;
    temperature: boolean;
    timeWindow: boolean;
  };
  reliability: number; // 0-100%
  availability: string[];
}

export interface MultiModalRoute {
  routeId: string;
  loadId: number;
  segments: Array<{
    id: string;
    mode: TransportMode;
    from: { location: string; coordinates: { lat: number; lng: number } };
    to: { location: string; coordinates: { lat: number; lng: number } };
    distance: number;
    estimatedTime: number;
    cost: number;
    transferPoint?: {
      location: string;
      type: 'port' | 'rail_yard' | 'airport' | 'warehouse';
      transferTime: number;
      transferCost: number;
    };
  }>;
  totalCost: number;
  totalTime: number;
  totalDistance: number;
  environmentalScore: number;
  reliability: number;
  complexity: number;
  advantages: string[];
  disadvantages: string[];
}

export interface TransferHub {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  type: 'port' | 'rail_yard' | 'airport' | 'intermodal_facility';
  supportedModes: string[];
  capabilities: {
    maxCapacity: number;
    operatingHours: string;
    equipment: string[];
    services: string[];
  };
  costs: {
    handling: number;
    storage: number;
    documentation: number;
  };
  averageTransferTime: number;
  reliability: number;
}

export class MultiModalTransportService {
  private transportModes: Map<string, TransportMode> = new Map();
  private transferHubs: Map<string, TransferHub> = new Map();
  private multiModalRoutes: Map<string, MultiModalRoute> = new Map();

  constructor() {
    this.initializeTransportModes();
    this.initializeTransferHubs();
  }

  private initializeTransportModes() {
    const modes: TransportMode[] = [
      {
        type: 'truck',
        provider: 'Road Transport',
        capabilities: {
          maxWeight: 80000,
          maxDistance: 3000,
          speedRange: { min: 45, max: 70 },
          costPerMile: 1.85,
          environmentalImpact: 85
        },
        restrictions: {
          hazmat: true,
          oversized: true,
          temperature: true,
          timeWindow: true
        },
        reliability: 92,
        availability: ['24/7']
      },
      {
        type: 'rail',
        provider: 'Rail Freight',
        capabilities: {
          maxWeight: 125000,
          maxDistance: 2500,
          speedRange: { min: 25, max: 60 },
          costPerMile: 0.75,
          environmentalImpact: 35
        },
        restrictions: {
          hazmat: true,
          oversized: true,
          temperature: false,
          timeWindow: false
        },
        reliability: 88,
        availability: ['Mon-Fri 6AM-10PM']
      },
      {
        type: 'air',
        provider: 'Air Cargo',
        capabilities: {
          maxWeight: 150000,
          maxDistance: 6000,
          speedRange: { min: 400, max: 550 },
          costPerMile: 12.50,
          environmentalImpact: 120
        },
        restrictions: {
          hazmat: false,
          oversized: false,
          temperature: true,
          timeWindow: true
        },
        reliability: 95,
        availability: ['24/7']
      },
      {
        type: 'ocean',
        provider: 'Ocean Freight',
        capabilities: {
          maxWeight: 500000,
          maxDistance: 12000,
          speedRange: { min: 15, max: 25 },
          costPerMile: 0.25,
          environmentalImpact: 15
        },
        restrictions: {
          hazmat: true,
          oversized: true,
          temperature: true,
          timeWindow: false
        },
        reliability: 82,
        availability: ['Schedule dependent']
      },
      {
        type: 'intermodal',
        provider: 'Intermodal Services',
        capabilities: {
          maxWeight: 80000,
          maxDistance: 2000,
          speedRange: { min: 35, max: 65 },
          costPerMile: 1.25,
          environmentalImpact: 45
        },
        restrictions: {
          hazmat: true,
          oversized: false,
          temperature: false,
          timeWindow: false
        },
        reliability: 90,
        availability: ['Mon-Sat']
      }
    ];

    modes.forEach(mode => {
      this.transportModes.set(mode.type, mode);
    });
  }

  private initializeTransferHubs() {
    const hubs: TransferHub[] = [
      {
        id: 'hub-001',
        name: 'Chicago Intermodal Terminal',
        location: { lat: 41.8781, lng: -87.6298 },
        type: 'intermodal_facility',
        supportedModes: ['truck', 'rail', 'intermodal'],
        capabilities: {
          maxCapacity: 5000,
          operatingHours: '24/7',
          equipment: ['cranes', 'forklifts', 'container_handlers'],
          services: ['customs', 'inspection', 'storage', 'maintenance']
        },
        costs: {
          handling: 150,
          storage: 25,
          documentation: 75
        },
        averageTransferTime: 4,
        reliability: 94
      },
      {
        id: 'hub-002',
        name: 'Los Angeles Port Complex',
        location: { lat: 33.7361, lng: -118.2922 },
        type: 'port',
        supportedModes: ['truck', 'ocean', 'rail'],
        capabilities: {
          maxCapacity: 15000,
          operatingHours: '24/7',
          equipment: ['ship_to_shore_cranes', 'yard_cranes', 'reach_stackers'],
          services: ['customs', 'inspection', 'storage', 'consolidation']
        },
        costs: {
          handling: 200,
          storage: 35,
          documentation: 100
        },
        averageTransferTime: 8,
        reliability: 89
      },
      {
        id: 'hub-003',
        name: 'Memphis Air Cargo Hub',
        location: { lat: 35.1495, lng: -89.9747 },
        type: 'airport',
        supportedModes: ['truck', 'air'],
        capabilities: {
          maxCapacity: 3000,
          operatingHours: '24/7',
          equipment: ['cargo_loaders', 'tugs', 'conveyor_systems'],
          services: ['customs', 'security_screening', 'cold_storage']
        },
        costs: {
          handling: 300,
          storage: 50,
          documentation: 125
        },
        averageTransferTime: 3,
        reliability: 96
      }
    ];

    hubs.forEach(hub => {
      this.transferHubs.set(hub.id, hub);
    });
  }

  async generateMultiModalOptions(loadId: number): Promise<MultiModalRoute[]> {
    const load = await storage.getLoad(loadId);
    if (!load) {
      throw new Error('Load not found');
    }

    const routes: MultiModalRoute[] = [];

    // Generate truck-only route (baseline)
    routes.push(await this.generateTruckOnlyRoute(load));

    // Generate intermodal routes if distance > 500 miles
    if ((load.miles || 0) > 500) {
      routes.push(await this.generateTruckRailRoute(load));
      routes.push(await this.generateIntermodalRoute(load));
    }

    // Generate air route for time-sensitive loads
    if (load.commodity?.includes('Express') || load.equipmentType === 'expedite') {
      routes.push(await this.generateAirRoute(load));
    }

    // Generate ocean route for international shipments
    if (this.isInternationalShipment(load)) {
      routes.push(await this.generateOceanRoute(load));
    }

    // Sort by cost-effectiveness
    routes.sort((a, b) => this.calculateCostEffectiveness(a) - this.calculateCostEffectiveness(b));

    routes.forEach(route => {
      this.multiModalRoutes.set(route.routeId, route);
    });

    return routes;
  }

  private async generateTruckOnlyRoute(load: any): Promise<MultiModalRoute> {
    const truckMode = this.transportModes.get('truck')!;
    const distance = load.miles || 500;
    const estimatedTime = distance / 55; // Average 55 mph

    return {
      routeId: this.generateRouteId(),
      loadId: load.id,
      segments: [{
        id: 'segment-1',
        mode: truckMode,
        from: { location: load.origin, coordinates: { lat: 40.7128, lng: -74.0060 } },
        to: { location: load.destination, coordinates: { lat: 34.0522, lng: -118.2437 } },
        distance,
        estimatedTime,
        cost: distance * truckMode.capabilities.costPerMile
      }],
      totalCost: distance * truckMode.capabilities.costPerMile,
      totalTime: estimatedTime,
      totalDistance: distance,
      environmentalScore: 100 - truckMode.capabilities.environmentalImpact,
      reliability: truckMode.reliability,
      complexity: 1,
      advantages: ['Direct delivery', 'Full control', 'Flexible timing'],
      disadvantages: ['Higher cost per mile', 'Driver hours limitations', 'Weather dependent']
    };
  }

  private async generateTruckRailRoute(load: any): Promise<MultiModalRoute> {
    const truckMode = this.transportModes.get('truck')!;
    const railMode = this.transportModes.get('rail')!;
    const hub = this.transferHubs.get('hub-001')!; // Chicago hub

    const totalDistance = load.miles || 500;
    const truckSegment1 = totalDistance * 0.2; // 20% truck to rail
    const railSegment = totalDistance * 0.6; // 60% rail
    const truckSegment2 = totalDistance * 0.2; // 20% truck from rail

    const segments = [
      {
        id: 'segment-1',
        mode: truckMode,
        from: { location: load.origin, coordinates: { lat: 40.7128, lng: -74.0060 } },
        to: { location: hub.name, coordinates: hub.location },
        distance: truckSegment1,
        estimatedTime: truckSegment1 / 55,
        cost: truckSegment1 * truckMode.capabilities.costPerMile,
        transferPoint: {
          location: hub.name,
          type: hub.type,
          transferTime: hub.averageTransferTime,
          transferCost: hub.costs.handling
        }
      },
      {
        id: 'segment-2',
        mode: railMode,
        from: { location: hub.name, coordinates: hub.location },
        to: { location: 'Destination Rail Yard', coordinates: { lat: 33.7361, lng: -118.2922 } },
        distance: railSegment,
        estimatedTime: railSegment / 45,
        cost: railSegment * railMode.capabilities.costPerMile
      },
      {
        id: 'segment-3',
        mode: truckMode,
        from: { location: 'Destination Rail Yard', coordinates: { lat: 33.7361, lng: -118.2922 } },
        to: { location: load.destination, coordinates: { lat: 34.0522, lng: -118.2437 } },
        distance: truckSegment2,
        estimatedTime: truckSegment2 / 55,
        cost: truckSegment2 * truckMode.capabilities.costPerMile
      }
    ];

    const totalCost = segments.reduce((sum, seg) => sum + seg.cost, 0) + 
                     (segments[0].transferPoint?.transferCost || 0) + hub.costs.handling;
    const totalTime = segments.reduce((sum, seg) => sum + seg.estimatedTime, 0) + 
                     hub.averageTransferTime + 4; // Additional transfer time

    return {
      routeId: this.generateRouteId(),
      loadId: load.id,
      segments,
      totalCost,
      totalTime,
      totalDistance: totalDistance,
      environmentalScore: 65, // Better than truck-only
      reliability: 89,
      complexity: 3,
      advantages: ['Lower cost for long distance', 'Reduced emissions', 'Less driver fatigue'],
      disadvantages: ['Transfer delays', 'Less flexibility', 'Multiple handoffs']
    };
  }

  private async generateIntermodalRoute(load: any): Promise<MultiModalRoute> {
    const intermodalMode = this.transportModes.get('intermodal')!;
    
    return {
      routeId: this.generateRouteId(),
      loadId: load.id,
      segments: [{
        id: 'segment-1',
        mode: intermodalMode,
        from: { location: load.origin, coordinates: { lat: 40.7128, lng: -74.0060 } },
        to: { location: load.destination, coordinates: { lat: 34.0522, lng: -118.2437 } },
        distance: load.miles || 500,
        estimatedTime: (load.miles || 500) / 50,
        cost: (load.miles || 500) * intermodalMode.capabilities.costPerMile
      }],
      totalCost: (load.miles || 500) * intermodalMode.capabilities.costPerMile,
      totalTime: (load.miles || 500) / 50,
      totalDistance: load.miles || 500,
      environmentalScore: 55,
      reliability: intermodalMode.reliability,
      complexity: 2,
      advantages: ['Cost-effective', 'Environmentally friendly', 'Reduced road congestion'],
      disadvantages: ['Limited routes', 'Schedule constraints', 'Longer transit time']
    };
  }

  private async generateAirRoute(load: any): Promise<MultiModalRoute> {
    const airMode = this.transportModes.get('air')!;
    const truckMode = this.transportModes.get('truck')!;

    const airDistance = this.calculateAirDistance(load.origin, load.destination);
    const truckToAirport = 50; // Assume 50 miles to airport
    const truckFromAirport = 50; // Assume 50 miles from airport

    const segments = [
      {
        id: 'segment-1',
        mode: truckMode,
        from: { location: load.origin, coordinates: { lat: 40.7128, lng: -74.0060 } },
        to: { location: 'Origin Airport', coordinates: { lat: 40.6413, lng: -73.7781 } },
        distance: truckToAirport,
        estimatedTime: truckToAirport / 55,
        cost: truckToAirport * truckMode.capabilities.costPerMile
      },
      {
        id: 'segment-2',
        mode: airMode,
        from: { location: 'Origin Airport', coordinates: { lat: 40.6413, lng: -73.7781 } },
        to: { location: 'Destination Airport', coordinates: { lat: 33.9425, lng: -118.4081 } },
        distance: airDistance,
        estimatedTime: airDistance / 500,
        cost: airDistance * airMode.capabilities.costPerMile
      },
      {
        id: 'segment-3',
        mode: truckMode,
        from: { location: 'Destination Airport', coordinates: { lat: 33.9425, lng: -118.4081 } },
        to: { location: load.destination, coordinates: { lat: 34.0522, lng: -118.2437 } },
        distance: truckFromAirport,
        estimatedTime: truckFromAirport / 55,
        cost: truckFromAirport * truckMode.capabilities.costPerMile
      }
    ];

    return {
      routeId: this.generateRouteId(),
      loadId: load.id,
      segments,
      totalCost: segments.reduce((sum, seg) => sum + seg.cost, 0) + 500, // Airport handling fees
      totalTime: segments.reduce((sum, seg) => sum + seg.estimatedTime, 0) + 4, // Airport processing time
      totalDistance: segments.reduce((sum, seg) => sum + seg.distance, 0),
      environmentalScore: 20, // Air transport has high emissions
      reliability: 95,
      complexity: 4,
      advantages: ['Fastest delivery', 'Global reach', 'High reliability'],
      disadvantages: ['Very expensive', 'High emissions', 'Weight/size restrictions']
    };
  }

  private async generateOceanRoute(load: any): Promise<MultiModalRoute> {
    const oceanMode = this.transportModes.get('ocean')!;
    const truckMode = this.transportModes.get('truck')!;

    // Simplified ocean route for demonstration
    return {
      routeId: this.generateRouteId(),
      loadId: load.id,
      segments: [{
        id: 'segment-1',
        mode: oceanMode,
        from: { location: 'Port of Long Beach', coordinates: { lat: 33.7553, lng: -118.2129 } },
        to: { location: 'Port of Shanghai', coordinates: { lat: 31.2304, lng: 121.4737 } },
        distance: 6500,
        estimatedTime: 6500 / 20, // 20 mph average
        cost: 6500 * oceanMode.capabilities.costPerMile
      }],
      totalCost: 6500 * oceanMode.capabilities.costPerMile + 1000, // Port fees
      totalTime: 6500 / 20 + 48, // Additional port processing
      totalDistance: 6500,
      environmentalScore: 85, // Ocean is very efficient
      reliability: oceanMode.reliability,
      complexity: 5,
      advantages: ['Lowest cost per ton', 'Massive capacity', 'Low emissions per unit'],
      disadvantages: ['Very slow', 'Port delays', 'Weather dependent']
    };
  }

  private isInternationalShipment(load: any): boolean {
    return load.destination?.includes('International') || 
           load.origin?.includes('Port') || 
           load.commodity?.includes('Export');
  }

  private calculateAirDistance(origin: string, destination: string): number {
    // Simplified calculation - in reality would use great circle distance
    return 2500; // Approximate coast-to-coast distance
  }

  private calculateCostEffectiveness(route: MultiModalRoute): number {
    // Weight factors: cost (40%), time (30%), reliability (20%), environmental (10%)
    const costScore = 1 - (route.totalCost / 10000); // Normalize cost
    const timeScore = 1 - (route.totalTime / 100); // Normalize time
    const reliabilityScore = route.reliability / 100;
    const environmentalScore = route.environmentalScore / 100;

    return (costScore * 0.4) + (timeScore * 0.3) + (reliabilityScore * 0.2) + (environmentalScore * 0.1);
  }

  async optimizeRoute(routeId: string, priorities: { cost: number; time: number; reliability: number; environmental: number }): Promise<MultiModalRoute> {
    const route = this.multiModalRoutes.get(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    // Recalculate route based on new priorities
    // This would involve more complex optimization algorithms in a real implementation
    const optimizedRoute = { ...route };
    optimizedRoute.routeId = this.generateRouteId();

    // Apply optimizations based on priorities
    if (priorities.cost > 0.5) {
      // Optimize for cost - prefer rail/ocean over truck/air
      optimizedRoute.advantages.push('Cost-optimized routing selected');
    }

    if (priorities.time > 0.5) {
      // Optimize for time - prefer air/truck over rail/ocean
      optimizedRoute.advantages.push('Time-optimized routing selected');
    }

    this.multiModalRoutes.set(optimizedRoute.routeId, optimizedRoute);
    return optimizedRoute;
  }

  private generateRouteId(): string {
    return `multimodal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getMultiModalRoute(routeId: string): MultiModalRoute | undefined {
    return this.multiModalRoutes.get(routeId);
  }

  getAllRoutes(): MultiModalRoute[] {
    return Array.from(this.multiModalRoutes.values());
  }

  getTransferHubs(): TransferHub[] {
    return Array.from(this.transferHubs.values());
  }

  getTransportModes(): TransportMode[] {
    return Array.from(this.transportModes.values());
  }

  async getRoutesForLoad(loadId: number): Promise<MultiModalRoute[]> {
    return Array.from(this.multiModalRoutes.values()).filter(route => route.loadId === loadId);
  }
}

export const multiModalService = new MultiModalTransportService();