export interface DriverLocation {
  driverId: number;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: Date;
  accuracy: number;
  currentLoad?: {
    id: string;
    origin: string;
    destination: string;
    estimatedArrival: Date;
    status: 'en_route' | 'at_pickup' | 'loaded' | 'delivering';
  };
}

export interface LiveLoadOpportunity {
  id: string;
  driverId: number;
  type: 'pickup' | 'delivery' | 'backhaul' | 'detour_optimization';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  origin: {
    location: string;
    coordinates: { lat: number; lng: number };
    distanceFromDriver: number;
    estimatedArrival: Date;
  };
  destination: {
    location: string;
    coordinates: { lat: number; lng: number };
    timeWindow: { start: Date; end: Date };
  };
  loadDetails: {
    rate: number;
    equipment: string;
    weight: number;
    commodity: string;
    specialRequirements?: string[];
  };
  routeImpact: {
    additionalMiles: number;
    additionalTime: number;
    fuelCost: number;
    netProfit: number;
    efficiencyScore: number;
  };
  expiresAt: Date;
  sentAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface RouteOptimization {
  driverId: number;
  currentRoute: {
    origin: string;
    destination: string;
    estimatedArrival: Date;
    remainingMiles: number;
    estimatedFuel: number;
  };
  optimizedRoute: {
    waypoints: Array<{
      type: 'pickup' | 'delivery' | 'fuel' | 'rest';
      location: string;
      coordinates: { lat: number; lng: number };
      estimatedArrival: Date;
      duration: number;
    }>;
    totalAdditionalRevenue: number;
    totalAdditionalMiles: number;
    totalAdditionalTime: number;
    fuelSavings: number;
    efficiencyGain: number;
  };
  generatedAt: Date;
}

export class LiveRouteTracker {
  private driverLocations: Map<number, DriverLocation> = new Map();
  private activeOpportunities: Map<string, LiveLoadOpportunity> = new Map();
  private routeOptimizations: Map<number, RouteOptimization> = new Map();
  private locationUpdateInterval: NodeJS.Timeout;
  private opportunityCheckInterval: NodeJS.Timeout;

  constructor() {
    this.startLocationTracking();
    this.startOpportunityMonitoring();
    console.log('📍 Live Route Tracker initialized with GPS monitoring');
  }

  private startLocationTracking() {
    // Simulate real-time GPS updates every 30 seconds
    this.locationUpdateInterval = setInterval(() => {
      this.simulateDriverMovements();
    }, 30000);
  }

  private startOpportunityMonitoring() {
    // Check for new opportunities every 2 minutes
    this.opportunityCheckInterval = setInterval(() => {
      this.scanForNearbyOpportunities();
    }, 120000);
  }

  private simulateDriverMovements() {
    // In production, this would receive real GPS data from mobile apps
    const sampleDrivers = [1, 2, 3, 4, 5];
    
    sampleDrivers.forEach(driverId => {
      const currentLocation = this.driverLocations.get(driverId);
      
      // Simulate movement along route
      const newLocation: DriverLocation = {
        driverId,
        latitude: 39.7392 + (Math.random() - 0.5) * 10, // Center around Kansas (US center)
        longitude: -104.9903 + (Math.random() - 0.5) * 20,
        heading: Math.random() * 360,
        speed: 55 + (Math.random() * 20), // 55-75 mph
        timestamp: new Date(),
        accuracy: Math.random() * 10 + 5, // 5-15 meter accuracy
        currentLoad: currentLocation?.currentLoad || {
          id: `load-${driverId}-${Date.now()}`,
          origin: "Current Pickup",
          destination: "Current Delivery",
          estimatedArrival: new Date(Date.now() + 14400000), // 4 hours
          status: 'en_route'
        }
      };

      this.driverLocations.set(driverId, newLocation);
      
      // Check for nearby opportunities when driver moves
      this.checkNearbyOpportunities(driverId, newLocation);
    });

    console.log(`📍 Updated GPS locations for ${sampleDrivers.length} drivers`);
  }

  private scanForNearbyOpportunities() {
    this.driverLocations.forEach((location, driverId) => {
      this.findOpportunitiesNearDriver(driverId, location);
    });
  }

  private checkNearbyOpportunities(driverId: number, location: DriverLocation) {
    const nearbyOpportunities = this.findOpportunitiesNearDriver(driverId, location);
    
    if (nearbyOpportunities.length > 0) {
      console.log(`🎯 Found ${nearbyOpportunities.length} opportunities near driver ${driverId}`);
      
      // Send push notification (in production, would use real push service)
      this.sendOpportunityNotification(driverId, nearbyOpportunities[0]);
    }
  }

  private findOpportunitiesNearDriver(driverId: number, location: DriverLocation): LiveLoadOpportunity[] {
    const opportunities: LiveLoadOpportunity[] = [];
    
    // Generate 1-3 opportunities near driver
    const numOpportunities = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numOpportunities; i++) {
      const distanceFromDriver = Math.random() * 50 + 5; // 5-55 miles away
      
      const opportunity: LiveLoadOpportunity = {
        id: `live-opp-${driverId}-${Date.now()}-${i}`,
        driverId,
        type: ['pickup', 'delivery', 'backhaul', 'detour_optimization'][Math.floor(Math.random() * 4)] as any,
        priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
        origin: {
          location: this.generateNearbyCity(location.latitude, location.longitude),
          coordinates: {
            lat: location.latitude + (Math.random() - 0.5) * 0.5,
            lng: location.longitude + (Math.random() - 0.5) * 0.5
          },
          distanceFromDriver,
          estimatedArrival: new Date(Date.now() + (distanceFromDriver / 55) * 3600000) // ETA based on distance
        },
        destination: {
          location: this.generateNearbyCity(location.latitude + 2, location.longitude + 2),
          coordinates: {
            lat: location.latitude + (Math.random() - 0.5) * 2,
            lng: location.longitude + (Math.random() - 0.5) * 2
          },
          timeWindow: {
            start: new Date(Date.now() + 7200000), // 2 hours from now
            end: new Date(Date.now() + 21600000)   // 6 hours from now
          }
        },
        loadDetails: {
          rate: Math.floor(Math.random() * 1500) + 800, // $800-$2300
          equipment: ['Dry Van', 'Reefer', 'Flatbed'][Math.floor(Math.random() * 3)],
          weight: Math.floor(Math.random() * 30000) + 15000, // 15k-45k lbs
          commodity: ['Electronics', 'Food Products', 'Auto Parts', 'Retail Goods'][Math.floor(Math.random() * 4)]
        },
        routeImpact: {
          additionalMiles: distanceFromDriver + Math.floor(Math.random() * 100),
          additionalTime: (distanceFromDriver / 55) + Math.random() * 2, // Hours
          fuelCost: (distanceFromDriver * 0.60), // $0.60 per mile fuel cost
          netProfit: 0, // Will be calculated
          efficiencyScore: Math.floor(Math.random() * 25) + 75 // 75-100%
        },
        expiresAt: new Date(Date.now() + 1800000), // 30 minutes to respond
        sentAt: new Date(),
        status: 'pending'
      };

      // Calculate net profit
      opportunity.routeImpact.netProfit = opportunity.loadDetails.rate - opportunity.routeImpact.fuelCost - 50; // $50 misc costs

      opportunities.push(opportunity);
      this.activeOpportunities.set(opportunity.id, opportunity);
    }

    return opportunities;
  }

  private generateNearbyCity(lat: number, lng: number): string {
    const cities = [
      "Springfield", "Franklin", "Georgetown", "Clinton", "Fairview",
      "Madison", "Washington", "Lincoln", "Jackson", "Monroe"
    ];
    
    const states = [
      "TX", "CA", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI"
    ];

    return `${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]}`;
  }

  private sendOpportunityNotification(driverId: number, opportunity: LiveLoadOpportunity) {
    // In production, this would send push notifications to mobile app
    console.log(`📱 Push notification sent to driver ${driverId}: New ${opportunity.priority} priority ${opportunity.type} opportunity - ${opportunity.loadDetails.rate} @ ${opportunity.origin.location}`);
  }

  public updateDriverLocation(driverId: number, location: Partial<DriverLocation>) {
    const currentLocation = this.driverLocations.get(driverId);
    const updatedLocation: DriverLocation = {
      ...currentLocation,
      ...location,
      driverId,
      timestamp: new Date()
    } as DriverLocation;

    this.driverLocations.set(driverId, updatedLocation);
    
    // Check for new opportunities at updated location
    this.checkNearbyOpportunities(driverId, updatedLocation);
    
    return updatedLocation;
  }

  public respondToOpportunity(opportunityId: string, response: 'accepted' | 'declined'): boolean {
    const opportunity = this.activeOpportunities.get(opportunityId);
    
    if (!opportunity || opportunity.status !== 'pending') {
      return false;
    }

    opportunity.status = response;
    
    if (response === 'accepted') {
      console.log(`✅ Driver ${opportunity.driverId} accepted opportunity ${opportunityId} for ${opportunity.loadDetails.rate}`);
      this.optimizeRouteWithNewLoad(opportunity.driverId, opportunity);
    } else {
      console.log(`❌ Driver ${opportunity.driverId} declined opportunity ${opportunityId}`);
    }

    return true;
  }

  private optimizeRouteWithNewLoad(driverId: number, opportunity: LiveLoadOpportunity) {
    const currentLocation = this.driverLocations.get(driverId);
    
    if (!currentLocation) return;

    const optimization: RouteOptimization = {
      driverId,
      currentRoute: {
        origin: currentLocation.currentLoad?.origin || "Current Location",
        destination: currentLocation.currentLoad?.destination || "Unknown Destination",
        estimatedArrival: currentLocation.currentLoad?.estimatedArrival || new Date(),
        remainingMiles: Math.random() * 500 + 100,
        estimatedFuel: Math.random() * 200 + 50
      },
      optimizedRoute: {
        waypoints: [
          {
            type: 'pickup',
            location: opportunity.origin.location,
            coordinates: opportunity.origin.coordinates,
            estimatedArrival: opportunity.origin.estimatedArrival,
            duration: 0.5
          },
          {
            type: 'delivery',
            location: opportunity.destination.location,
            coordinates: opportunity.destination.coordinates,
            estimatedArrival: new Date(opportunity.origin.estimatedArrival.getTime() + opportunity.routeImpact.additionalTime * 3600000),
            duration: 0.75
          }
        ],
        totalAdditionalRevenue: opportunity.loadDetails.rate,
        totalAdditionalMiles: opportunity.routeImpact.additionalMiles,
        totalAdditionalTime: opportunity.routeImpact.additionalTime,
        fuelSavings: Math.random() * 50, // Efficiency gains
        efficiencyGain: opportunity.routeImpact.efficiencyScore
      },
      generatedAt: new Date()
    };

    this.routeOptimizations.set(driverId, optimization);
    console.log(`🗺️ Generated optimized route for driver ${driverId} with additional revenue of $${opportunity.loadDetails.rate}`);
  }

  public getDriverLocation(driverId: number): DriverLocation | undefined {
    return this.driverLocations.get(driverId);
  }

  public getAllDriverLocations(): DriverLocation[] {
    return Array.from(this.driverLocations.values());
  }

  public getActiveOpportunities(driverId?: number): LiveLoadOpportunity[] {
    if (driverId) {
      return Array.from(this.activeOpportunities.values()).filter(opp => opp.driverId === driverId);
    }
    return Array.from(this.activeOpportunities.values());
  }

  public getRouteOptimization(driverId: number): RouteOptimization | undefined {
    return this.routeOptimizations.get(driverId);
  }

  public expireOldOpportunities() {
    const now = new Date();
    
    this.activeOpportunities.forEach((opportunity, id) => {
      if (opportunity.expiresAt < now && opportunity.status === 'pending') {
        opportunity.status = 'expired';
        console.log(`⏰ Opportunity ${id} expired for driver ${opportunity.driverId}`);
      }
    });
  }

  public getTrackingStats(): {
    activeDrivers: number;
    activeOpportunities: number;
    acceptanceRate: number;
    avgResponseTime: number;
  } {
    const opportunities = Array.from(this.activeOpportunities.values());
    const responded = opportunities.filter(opp => opp.status !== 'pending');
    const accepted = opportunities.filter(opp => opp.status === 'accepted');
    
    return {
      activeDrivers: this.driverLocations.size,
      activeOpportunities: opportunities.filter(opp => opp.status === 'pending').length,
      acceptanceRate: responded.length > 0 ? (accepted.length / responded.length) * 100 : 0,
      avgResponseTime: Math.random() * 10 + 5 // 5-15 minutes average
    };
  }

  public cleanup() {
    if (this.locationUpdateInterval) clearInterval(this.locationUpdateInterval);
    if (this.opportunityCheckInterval) clearInterval(this.opportunityCheckInterval);
  }
}

export const liveRouteTracker = new LiveRouteTracker();