/**
 * Ghost Load Optimization Engine
 * Captures and optimizes "lost loads" that fall through market cracks
 * Matches them to drivers already on routes for maximum efficiency
 */

export interface GhostLoad {
  id: string;
  originalLoadId?: string;
  source: 'expired_posting' | 'cancelled_booking' | 'broker_oversight' | 'timing_mismatch' | 'rate_dispute';
  
  // Load Details
  origin: {
    location: string;
    coordinates: { lat: number; lng: number };
    pickupWindow: { start: Date; end: Date };
    flexibility: 'rigid' | 'moderate' | 'flexible'; // how much pickup time can shift
  };
  
  destination: {
    location: string;
    coordinates: { lat: number; lng: number };
    deliveryWindow: { start: Date; end: Date };
    flexibility: 'rigid' | 'moderate' | 'flexible';
  };
  
  // Load Characteristics
  equipment: string;
  weight: number;
  commodity: string;
  distance: number;
  
  // Market Intelligence
  originalRate: number;
  marketRate: number;
  optimizedRate: number; // our calculated rate
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  demurrageRisk: number; // 0-100 scale
  
  // Why it's a ghost load
  reasonForAvailability: string;
  timeOnMarket: number; // hours since first posted
  competitorMisses: number; // how many brokers passed on it
  
  // Optimization Potential
  routeOptimizationScore: number; // 0-100, how well it fits existing routes
  marginPotential: number; // projected profit margin
  networkEffectValue: number; // value to overall network optimization
  
  discoveredAt: Date;
  lastUpdated: Date;
  status: 'discovered' | 'analyzing' | 'matching' | 'assigned' | 'in_transit' | 'delivered';
}

export interface RouteOptimizationMatch {
  driverId: number;
  currentRoute: {
    origin: string;
    destination: string;
    currentProgress: number; // percentage complete
    estimatedCompletion: Date;
    remainingMiles: number;
  };
  
  ghostLoadMatch: {
    ghostLoadId: string;
    insertionPoint: 'before_current' | 'after_current' | 'detour_during';
    additionalMiles: number;
    additionalTime: number; // hours
    additionalFuelCost: number;
    revenueGenerated: number;
    netProfit: number;
    profitMargin: number;
  };
  
  optimizationImpact: {
    deadheadReduction: number; // miles saved
    fuelEfficiencyGain: number; // percentage
    timeUtilizationImprovement: number; // percentage
    revenuePerMileIncrease: number;
  };
  
  feasibilityScore: number; // 0-100
  driverAcceptanceProbability: number; // 0-100
  customerSatisfactionRisk: number; // 0-100
  
  matchedAt: Date;
}

export interface GhostLoadMarketScan {
  scanId: string;
  scanTimestamp: Date;
  scannedSources: string[];
  totalLoadsScanned: number;
  ghostLoadsIdentified: number;
  averageTimeOnMarket: number;
  averageRateBelow: number; // percentage below market rate
  
  categoryBreakdown: {
    expiredPostings: number;
    cancelledBookings: number;
    brokerOversights: number;
    timingMismatches: number;
    rateDisputes: number;
  };
  
  opportunityValue: {
    totalPotentialRevenue: number;
    averageMarginPotential: number;
    networkOptimizationValue: number;
  };
}

export class GhostLoadOptimizationEngine {
  private ghostLoads: Map<string, GhostLoad> = new Map();
  private activeMatches: Map<string, RouteOptimizationMatch[]> = new Map();
  private marketScans: Map<string, GhostLoadMarketScan> = new Map();
  private scanInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.initializeGhostLoadEngine();
    this.startContinuousScanning();
  }
  
  private initializeGhostLoadEngine() {
    console.log('👻 Initializing Ghost Load Optimization Engine');
    console.log('🔍 Starting systematic market gap analysis');
    
    // Initialize with some example ghost loads that represent real market gaps
    this.createExampleGhostLoads();
  }
  
  private createExampleGhostLoads() {
    const exampleGhostLoads: GhostLoad[] = [
      {
        id: 'ghost-001',
        originalLoadId: 'dat-12345-expired',
        source: 'expired_posting',
        origin: {
          location: 'Atlanta, GA',
          coordinates: { lat: 33.7490, lng: -84.3880 },
          pickupWindow: { start: new Date(Date.now() + 3600000), end: new Date(Date.now() + 7200000) },
          flexibility: 'moderate'
        },
        destination: {
          location: 'Jacksonville, FL',
          coordinates: { lat: 30.3322, lng: -81.6557 },
          deliveryWindow: { start: new Date(Date.now() + 18000000), end: new Date(Date.now() + 21600000) },
          flexibility: 'flexible'
        },
        equipment: 'Dry Van',
        weight: 34000,
        commodity: 'Consumer Electronics',
        distance: 346,
        originalRate: 1800,
        marketRate: 2100,
        optimizedRate: 2350, // higher because we can optimize routing
        urgencyLevel: 'high',
        demurrageRisk: 25,
        reasonForAvailability: 'Original broker overbooked, load expired on DAT after 6 hours',
        timeOnMarket: 8,
        competitorMisses: 12,
        routeOptimizationScore: 87,
        marginPotential: 0.35,
        networkEffectValue: 850,
        discoveredAt: new Date(),
        lastUpdated: new Date(),
        status: 'discovered'
      },
      {
        id: 'ghost-002',
        source: 'timing_mismatch',
        origin: {
          location: 'Phoenix, AZ',
          coordinates: { lat: 33.4484, lng: -112.0740 },
          pickupWindow: { start: new Date(Date.now() + 10800000), end: new Date(Date.now() + 14400000) },
          flexibility: 'rigid'
        },
        destination: {
          location: 'Denver, CO',
          coordinates: { lat: 39.7392, lng: -104.9903 },
          deliveryWindow: { start: new Date(Date.now() + 36000000), end: new Date(Date.now() + 43200000) },
          flexibility: 'moderate'
        },
        equipment: 'Refrigerated',
        weight: 41000,
        commodity: 'Fresh Produce',
        distance: 602,
        originalRate: 2800,
        marketRate: 3200,
        optimizedRate: 3650,
        urgencyLevel: 'critical',
        demurrageRisk: 65,
        reasonForAvailability: 'Shipper needs 3-hour pickup window, most drivers need 6+ hours notice',
        timeOnMarket: 4,
        competitorMisses: 8,
        routeOptimizationScore: 92,
        marginPotential: 0.42,
        networkEffectValue: 1200,
        discoveredAt: new Date(),
        lastUpdated: new Date(),
        status: 'analyzing'
      },
      {
        id: 'ghost-003',
        source: 'broker_oversight',
        origin: {
          location: 'Chicago, IL',
          coordinates: { lat: 41.8781, lng: -87.6298 },
          pickupWindow: { start: new Date(Date.now() + 14400000), end: new Date(Date.now() + 18000000) },
          flexibility: 'flexible'
        },
        destination: {
          location: 'Memphis, TN',
          coordinates: { lat: 35.1495, lng: -90.0490 },
          deliveryWindow: { start: new Date(Date.now() + 28800000), end: new Date(Date.now() + 36000000) },
          flexibility: 'flexible'
        },
        equipment: 'Flatbed',
        weight: 38000,
        commodity: 'Construction Materials',
        distance: 341,
        originalRate: 1650,
        marketRate: 1900,
        optimizedRate: 2150,
        urgencyLevel: 'medium',
        demurrageRisk: 15,
        reasonForAvailability: 'Small broker missed opportunity, posted on wrong board category',
        timeOnMarket: 12,
        competitorMisses: 15,
        routeOptimizationScore: 78,
        marginPotential: 0.28,
        networkEffectValue: 680,
        discoveredAt: new Date(),        
        lastUpdated: new Date(),
        status: 'matching'
      }
    ];
    
    exampleGhostLoads.forEach(load => {
      this.ghostLoads.set(load.id, load);
    });
    
    console.log(`👻 Initialized ${exampleGhostLoads.length} example ghost loads`);
    console.log(`💰 Total potential revenue: $${exampleGhostLoads.reduce((sum, load) => sum + load.optimizedRate, 0).toLocaleString()}`);
  }
  
  /**
   * Continuous scanning for ghost loads across multiple sources
   */
  private startContinuousScanning() {
    console.log('🔄 Starting continuous ghost load scanning (every 2 minutes)');
    
    // Scan every 2 minutes for maximum opportunity capture
    this.scanInterval = setInterval(() => {
      this.performMarketScan();
    }, 120000);
    
    // Initial scan
    this.performMarketScan();
  }
  
  /**
   * Performs comprehensive market scan for ghost loads
   */
  private async performMarketScan(): Promise<GhostLoadMarketScan> {
    const scanId = `scan-${Date.now()}`;
    const scanTimestamp = new Date();
    
    console.log(`🔍 Performing ghost load market scan: ${scanId}`);
    
    // Simulate scanning multiple sources for ghost loads
    const scannedSources = [
      'DAT Load Board - Expired Listings',
      'Truckstop.com - Cancelled Bookings', 
      'Direct Shipper Contacts - Timing Issues',
      'Broker Network - Overflow Loads',
      '123LoadBoard - Rate Disputes',
      'Load Matching - Failed Matches'
    ];
    
    // Simulate finding new ghost loads
    const newGhostLoads = this.simulateGhostLoadDiscovery();
    
    const scan: GhostLoadMarketScan = {
      scanId,
      scanTimestamp,
      scannedSources,
      totalLoadsScanned: 1247,
      ghostLoadsIdentified: newGhostLoads.length,
      averageTimeOnMarket: 6.8,
      averageRateBelow: 18.5,
      categoryBreakdown: {
        expiredPostings: Math.floor(newGhostLoads.length * 0.35),
        cancelledBookings: Math.floor(newGhostLoads.length * 0.25),
        brokerOversights: Math.floor(newGhostLoads.length * 0.20),
        timingMismatches: Math.floor(newGhostLoads.length * 0.15),
        rateDisputes: Math.floor(newGhostLoads.length * 0.05)
      },
      opportunityValue: {
        totalPotentialRevenue: newGhostLoads.reduce((sum, load) => sum + load.optimizedRate, 0),
        averageMarginPotential: newGhostLoads.reduce((sum, load) => sum + load.marginPotential, 0) / newGhostLoads.length,
        networkOptimizationValue: newGhostLoads.reduce((sum, load) => sum + load.networkEffectValue, 0)
      }
    };
    
    this.marketScans.set(scanId, scan);
    
    // Add new ghost loads to our tracking
    newGhostLoads.forEach(load => {
      this.ghostLoads.set(load.id, load);
    });
    
    console.log(`👻 Scan complete: Found ${newGhostLoads.length} new ghost loads worth $${scan.opportunityValue.totalPotentialRevenue.toLocaleString()}`);
    
    // Immediately start matching process for new loads
    if (newGhostLoads.length > 0) {
      this.optimizeGhostLoadMatching();
    }
    
    return scan;
  }
  
  /**
   * Simulates discovering new ghost loads in the market
   */
  private simulateGhostLoadDiscovery(): GhostLoad[] {
    // Enhanced with Central America and EU markets
    const cities = [
      // North America
      { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, region: 'north_america' },
      { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970, region: 'north_america' },
      { name: 'Miami, FL', lat: 25.7617, lng: -80.1918, region: 'north_america' },
      { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, region: 'north_america' },
      { name: 'New York, NY', lat: 40.7128, lng: -74.0060, region: 'north_america' },
      { name: 'Kansas City, MO', lat: 39.0997, lng: -94.5786, region: 'north_america' },
      
      // Central America
      { name: 'Panama City, PA', lat: 8.9824, lng: -79.5199, region: 'central_america' },
      { name: 'San José, CR', lat: 9.9281, lng: -84.0907, region: 'central_america' },
      { name: 'Guatemala City, GT', lat: 14.6349, lng: -90.5069, region: 'central_america' },
      { name: 'Tegucigalpa, HN', lat: 14.0723, lng: -87.1921, region: 'central_america' },
      { name: 'San Salvador, SV', lat: 13.6929, lng: -89.2182, region: 'central_america' },
      { name: 'Managua, NI', lat: 12.1364, lng: -86.2514, region: 'central_america' },
      
      // European Union
      { name: 'Hamburg, DE', lat: 53.5511, lng: 9.9937, region: 'european_union' },
      { name: 'Rotterdam, NL', lat: 51.9225, lng: 4.4792, region: 'european_union' },
      { name: 'Antwerp, BE', lat: 51.2194, lng: 4.4025, region: 'european_union' },
      { name: 'Milan, IT', lat: 45.4642, lng: 9.1900, region: 'european_union' },
      { name: 'Barcelona, ES', lat: 41.3851, lng: 2.1734, region: 'european_union' },
      { name: 'Lyon, FR', lat: 45.7640, lng: 4.8357, region: 'european_union' },
      { name: 'Warsaw, PL', lat: 52.2297, lng: 21.0122, region: 'european_union' },
      { name: 'Prague, CZ', lat: 50.0755, lng: 14.4378, region: 'european_union' }
    ];
    
    const sources: GhostLoad['source'][] = ['expired_posting', 'cancelled_booking', 'broker_oversight', 'timing_mismatch', 'rate_dispute'];
    const equipment = ['Dry Van', 'Refrigerated', 'Flatbed', 'Step Deck', 'Box Truck'];
    
    // Region-specific commodities and pricing
    const regionalData = {
      north_america: {
        commodities: ['Consumer Electronics', 'Food Products', 'Auto Parts', 'Construction Materials', 'Retail Goods'],
        baseRateMultiplier: 1.0,
        ghostLoadPremium: 1.15
      },
      central_america: {
        commodities: ['Coffee', 'Bananas', 'Medical Devices', 'Textiles', 'Electronics Assembly'],
        baseRateMultiplier: 1.25,
        ghostLoadPremium: 1.35
      },
      european_union: {
        commodities: ['Automotive Parts', 'Luxury Goods', 'Pharmaceuticals', 'Fresh Flowers', 'Machinery'],
        baseRateMultiplier: 1.40,
        ghostLoadPremium: 1.25
      }
    };
    
    const newLoads: GhostLoad[] = [];
    const loadCount = Math.floor(Math.random() * 8) + 3; // 3-10 new ghost loads per scan
    
    for (let i = 0; i < loadCount; i++) {
      const origin = cities[Math.floor(Math.random() * cities.length)];
      const destination = cities[Math.floor(Math.random() * cities.length)];
      
      if (origin.name === destination.name) continue; // Skip same city loads
      
      // Get regional data for pricing calculations
      const regionData = regionalData[origin.region as keyof typeof regionalData];
      const commodity = regionData.commodities[Math.floor(Math.random() * regionData.commodities.length)];
      
      // Calculate distance based on region (EU has shorter average distances)
      const baseDistance = origin.region === 'european_union' ? 800 : 1500;
      const distance = Math.floor(Math.random() * baseDistance) + 200;
      
      // Regional pricing with appropriate multipliers
      const baseRate = distance * (1.8 + Math.random() * 0.8) * regionData.baseRateMultiplier;
      const marketRate = baseRate * (1.1 + Math.random() * 0.3);
      const optimizedRate = marketRate * regionData.ghostLoadPremium;
      
      const ghostLoad: GhostLoad = {
        id: `ghost-${Date.now()}-${i}`,
        originalLoadId: `external-${Math.random().toString(36).substr(2, 9)}`,
        source: sources[Math.floor(Math.random() * sources.length)],
        origin: {
          location: origin.name,
          coordinates: { lat: origin.lat, lng: origin.lng },
          pickupWindow: {
            start: new Date(Date.now() + Math.random() * 14400000), // 0-4 hours from now
            end: new Date(Date.now() + Math.random() * 28800000 + 7200000) // 2-10 hours from now
          },
          flexibility: ['rigid', 'moderate', 'flexible'][Math.floor(Math.random() * 3)] as any
        },
        destination: {
          location: destination.name,
          coordinates: { lat: destination.lat, lng: destination.lng },
          deliveryWindow: {
            start: new Date(Date.now() + distance * 3600), // Rough travel time
            end: new Date(Date.now() + distance * 3600 + 14400000) // + 4 hours flexibility
          },
          flexibility: ['rigid', 'moderate', 'flexible'][Math.floor(Math.random() * 3)] as any
        },
        equipment: equipment[Math.floor(Math.random() * equipment.length)],
        weight: Math.floor(Math.random() * 35000) + 15000, // 15k-50k lbs
        commodity: commodity,
        distance,
        originalRate: Math.floor(baseRate),
        marketRate: Math.floor(marketRate),
        optimizedRate: Math.floor(optimizedRate),
        urgencyLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        demurrageRisk: Math.floor(Math.random() * 80) + 10, // 10-90%
        reasonForAvailability: this.generateGhostLoadReason(origin.region),
        timeOnMarket: Math.floor(Math.random() * 24) + 1, // 1-24 hours
        competitorMisses: Math.floor(Math.random() * 20) + 3, // 3-23 misses
        routeOptimizationScore: Math.floor(Math.random() * 40) + 60, // 60-100 score
        marginPotential: 0.2 + Math.random() * 0.3, // 20-50% margin
        networkEffectValue: Math.floor(Math.random() * 1500) + 300, // $300-1800 network value
        discoveredAt: new Date(),
        lastUpdated: new Date(),
        status: 'discovered'
      };
      
      newLoads.push(ghostLoad);
    }
    
    return newLoads;
  }
  
  private generateGhostLoadReason(region: string): string {
    const reasonsByRegion = {
      north_america: [
        'Broker overbooked and had to drop lowest margin load',
        'Rate dispute between shipper and original broker fell through',
        'Timing conflict with driver\'s hours of service regulations',
        'Original carrier had equipment breakdown last minute',
        'Cross-dock timing issue caused original plan to fail'
      ],
      central_america: [
        'Infrastructure delays due to road conditions in rainy season',
        'Cross-border documentation issues with CAFTA-DR requirements',
        'Currency fluctuation exceeded broker\'s risk tolerance',
        'Security escort requirements not initially factored in',
        'Customs clearance timing mismatch at border crossing',
        'Small local broker lacks carrier network for this route',
        'Fuel availability concerns in remote pickup location'
      ],
      european_union: [
        'EU Mobility Package compliance violation by original carrier',
        'Low Emission Zone restriction discovered after booking',
        'Driver weekly rest period conflict with delivery schedule',
        'Brexit documentation requirements caused booking failure',
        'Cabotage restrictions prevented original carrier assignment',
        'Digital tachograph data compliance issue',
        'Multi-language documentation error in customs paperwork'
      ]
    };
    
    const reasons = reasonsByRegion[region as keyof typeof reasonsByRegion] || reasonsByRegion.north_america;
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
  
  /**
   * Core optimization: Match ghost loads to drivers already on routes
   */
  public async optimizeGhostLoadMatching(): Promise<RouteOptimizationMatch[]> {
    console.log('🎯 Starting ghost load route optimization matching');
    
    const activeDrivers = await this.getActiveDriverRoutes();
    const availableGhostLoads = Array.from(this.ghostLoads.values())
      .filter(load => load.status === 'discovered' || load.status === 'analyzing');
    
    const allMatches: RouteOptimizationMatch[] = [];
    
    for (const ghostLoad of availableGhostLoads) {
      const matches = await this.findOptimalRouteMatches(ghostLoad, activeDrivers);
      allMatches.push(...matches);
      
      // Update ghost load status
      if (matches.length > 0) {
        ghostLoad.status = 'matching';
        this.ghostLoads.set(ghostLoad.id, ghostLoad);
      }
    }
    
    // Sort by profitability and feasibility
    allMatches.sort((a, b) => {
      const scoreA = a.ghostLoadMatch.netProfit * (a.feasibilityScore / 100) * (a.driverAcceptanceProbability / 100);
      const scoreB = b.ghostLoadMatch.netProfit * (b.feasibilityScore / 100) * (b.driverAcceptanceProbability / 100);
      return scoreB - scoreA;
    });
    
    console.log(`🔗 Generated ${allMatches.length} potential ghost load matches`);
    console.log(`💰 Top match potential profit: $${allMatches[0]?.ghostLoadMatch.netProfit.toLocaleString() || 0}`);
    
    // Store matches for further processing
    allMatches.forEach(match => {
      const key = `${match.driverId}-${match.ghostLoadMatch.ghostLoadId}`;
      if (!this.activeMatches.has(key)) {
        this.activeMatches.set(key, []);
      }
      this.activeMatches.get(key)!.push(match);
    });
    
    return allMatches.slice(0, 20); // Return top 20 matches
  }
  
  /**
   * Find optimal route matches for a specific ghost load
   */
  private async findOptimalRouteMatches(
    ghostLoad: GhostLoad, 
    activeDrivers: any[]
  ): Promise<RouteOptimizationMatch[]> {
    const matches: RouteOptimizationMatch[] = [];
    
    for (const driver of activeDrivers) {
      // Calculate if this ghost load can be optimally inserted into driver's route
      const routeAnalysis = this.analyzeRouteInsertion(ghostLoad, driver);
      
      if (routeAnalysis.feasibilityScore >= 70) { // Only consider highly feasible matches
        const match: RouteOptimizationMatch = {
          driverId: driver.id,
          currentRoute: {
            origin: driver.currentLoad?.origin || driver.location,
            destination: driver.currentLoad?.destination || driver.homeBase,
            currentProgress: driver.currentProgress || 0,
            estimatedCompletion: driver.estimatedCompletion || new Date(Date.now() + 14400000),
            remainingMiles: driver.remainingMiles || 0
          },
          ghostLoadMatch: {
            ghostLoadId: ghostLoad.id,
            insertionPoint: routeAnalysis.optimalInsertion,
            additionalMiles: routeAnalysis.additionalMiles,
            additionalTime: routeAnalysis.additionalTime,
            additionalFuelCost: routeAnalysis.additionalMiles * 0.65, // $0.65 per mile fuel cost
            revenueGenerated: ghostLoad.optimizedRate,
            netProfit: ghostLoad.optimizedRate - (routeAnalysis.additionalMiles * 1.2), // $1.20 total cost per additional mile
            profitMargin: (ghostLoad.optimizedRate - (routeAnalysis.additionalMiles * 1.2)) / ghostLoad.optimizedRate
          },
          optimizationImpact: {
            deadheadReduction: routeAnalysis.deadheadSavings,
            fuelEfficiencyGain: routeAnalysis.fuelEfficiencyImprovement,
            timeUtilizationImprovement: routeAnalysis.timeUtilizationGain,
            revenuePerMileIncrease: routeAnalysis.revenuePerMileIncrease
          },
          feasibilityScore: routeAnalysis.feasibilityScore,
          driverAcceptanceProbability: this.calculateDriverAcceptanceProbability(driver, ghostLoad, routeAnalysis),
          customerSatisfactionRisk: routeAnalysis.customerRisk,
          matchedAt: new Date()
        };
        
        matches.push(match);
      }
    }
    
    return matches;
  }
  
  /**
   * Analyze how a ghost load can be inserted into an existing route
   */
  private analyzeRouteInsertion(ghostLoad: GhostLoad, driver: any): any {
    // Simulate complex route analysis
    const driverLat = driver.currentLocation?.lat || 39.8283;
    const driverLng = driver.currentLocation?.lng || -98.5795;
    
    // Calculate distances
    const distanceToPickup = this.calculateDistance(
      driverLat, driverLng,
      ghostLoad.origin.coordinates.lat, ghostLoad.origin.coordinates.lng
    );
    
    const distanceFromDeliveryToDestination = driver.currentLoad ? this.calculateDistance(
      ghostLoad.destination.coordinates.lat, ghostLoad.destination.coordinates.lng,
      driver.currentLoad.destination.lat, driver.currentLoad.destination.lng
    ) : 0;
    
    // Determine optimal insertion point
    let optimalInsertion: 'before_current' | 'after_current' | 'detour_during' = 'after_current';
    let additionalMiles = distanceToPickup + ghostLoad.distance;
    let deadheadSavings = 0;
    
    if (driver.currentLoad) {
      // Check if ghost load can be picked up on the way to current destination
      const routeDetourDistance = this.calculateDistance(
        driver.currentLoad.origin.lat, driver.currentLoad.origin.lng,
        ghostLoad.origin.coordinates.lat, ghostLoad.origin.coordinates.lng
      ) + this.calculateDistance(
        ghostLoad.destination.coordinates.lat, ghostLoad.destination.coordinates.lng,
        driver.currentLoad.destination.lat, driver.currentLoad.destination.lng
      );
      
      const directDistance = this.calculateDistance(
        driver.currentLoad.origin.lat, driver.currentLoad.origin.lng,
        driver.currentLoad.destination.lat, driver.currentLoad.destination.lng
      );
      
      if (routeDetourDistance < directDistance + 100) { // Within 100 miles of direct route
        optimalInsertion = 'detour_during';
        additionalMiles = routeDetourDistance - directDistance;
        deadheadSavings = Math.max(0, 150 - additionalMiles); // Assume 150 miles average deadhead saved
      }
    } else {
      // Driver is returning home or deadheading
      deadheadSavings = Math.min(distanceToPickup, 200); // Up to 200 miles deadhead savings
      additionalMiles = Math.max(0, distanceToPickup + ghostLoad.distance - deadheadSavings);
    }
    
    // Calculate timing feasibility
    const timeToPickup = distanceToPickup / 55; // 55 mph average
    const currentTime = new Date();
    const canMakePickup = new Date(currentTime.getTime() + timeToPickup * 3600000) <= ghostLoad.origin.pickupWindow.end;
    
    // Calculate feasibility score
    let feasibilityScore = 0;
    if (canMakePickup) feasibilityScore += 40;
    if (additionalMiles < 100) feasibilityScore += 30;
    if (deadheadSavings > 50) feasibilityScore += 20;
    if (ghostLoad.equipment === driver.equipment) feasibilityScore += 10;
    
    return {
      optimalInsertion,
      additionalMiles: Math.round(additionalMiles),
      additionalTime: Math.round((additionalMiles / 55) * 10) / 10, // Hours
      deadheadSavings: Math.round(deadheadSavings),
      fuelEfficiencyImprovement: Math.min(15, deadheadSavings / 10), // Up to 15% improvement
      timeUtilizationGain: Math.min(25, deadheadSavings / 8), // Up to 25% improvement
      revenuePerMileIncrease: ghostLoad.optimizedRate / (driver.totalMiles + additionalMiles) - (driver.currentRevenue / driver.totalMiles),
      feasibilityScore: Math.min(100, feasibilityScore),
      customerRisk: additionalMiles > 150 ? 30 : 10 // Higher risk with longer detours
    };
  }
  
  /**
   * Calculate driver acceptance probability based on multiple factors
   */
  private calculateDriverAcceptanceProbability(driver: any, ghostLoad: GhostLoad, routeAnalysis: any): number {
    let probability = 50; // Base 50%
    
    // Rate attractiveness
    const ratePerMile = ghostLoad.optimizedRate / ghostLoad.distance;
    if (ratePerMile > 2.5) probability += 25;
    else if (ratePerMile > 2.0) probability += 15;
    else if (ratePerMile > 1.5) probability += 5;
    
    // Route efficiency
    if (routeAnalysis.deadheadSavings > 100) probability += 20;
    else if (routeAnalysis.deadheadSavings > 50) probability += 10;
    
    // Additional miles (drivers don't like too much extra driving)
    if (routeAnalysis.additionalMiles < 50) probability += 15;
    else if (routeAnalysis.additionalMiles > 200) probability -= 20;
    
    // Timing convenience
    if (routeAnalysis.optimalInsertion === 'detour_during') probability += 10;
    
    // Driver performance history (simulate)
    const driverFlexibilityScore = Math.random() * 30 + 70; // 70-100
    probability += (driverFlexibilityScore - 85) / 2;
    
    return Math.max(10, Math.min(95, Math.round(probability)));
  }
  
  /**
   * Get active drivers with their current routes
   */
  private async getActiveDriverRoutes(): Promise<any[]> {
    // Simulate active drivers with current routes
    return [
      {
        id: 1,
        name: 'Mike Johnson',
        currentLocation: { lat: 35.2271, lng: -80.8431 }, // Charlotte, NC
        equipment: 'Dry Van',
        currentLoad: {
          origin: { lat: 35.2271, lng: -80.8431 },
          destination: { lat: 25.7617, lng: -80.1918 }, // Miami, FL
        },
        currentProgress: 25,
        estimatedCompletion: new Date(Date.now() + 18000000), // 5 hours
        remainingMiles: 425,
        totalMiles: 650,
        currentRevenue: 1850,
        homeBase: 'Atlanta, GA'
      },
      {
        id: 2,
        name: 'Sarah Williams',
        currentLocation: { lat: 32.7767, lng: -96.7970 }, // Dallas, TX
        equipment: 'Refrigerated',
        currentLoad: null, // Deadheading home
        currentProgress: 0,
        estimatedCompletion: new Date(Date.now() + 14400000), // 4 hours to home
        remainingMiles: 280,
        totalMiles: 280,
        currentRevenue: 0,
        homeBase: 'Oklahoma City, OK'
      },
      {
        id: 3,
        name: 'David Rodriguez',
        currentLocation: { lat: 39.7392, lng: -104.9903 }, // Denver, CO
        equipment: 'Flatbed',
        currentLoad: {
          origin: { lat: 39.7392, lng: -104.9903 },
          destination: { lat: 47.6062, lng: -122.3321 }, // Seattle, WA
        },
        currentProgress: 10,
        estimatedCompletion: new Date(Date.now() + 43200000), // 12 hours
        remainingMiles: 920,
        totalMiles: 1020,
        currentRevenue: 2850,
        homeBase: 'Phoenix, AZ'
      }
    ];
  }
  
  /**
   * Calculate distance between two points (simplified)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  /**
   * API Methods for frontend integration
   */
  
  public getAllGhostLoads(): GhostLoad[] {
    return Array.from(this.ghostLoads.values()).sort((a, b) => 
      b.optimizedRate - a.optimizedRate
    );
  }
  
  public getGhostLoadsByStatus(status: GhostLoad['status']): GhostLoad[] {
    return Array.from(this.ghostLoads.values())
      .filter(load => load.status === status)
      .sort((a, b) => b.routeOptimizationScore - a.routeOptimizationScore);
  }
  
  public getTopOptimizationMatches(limit: number = 10): RouteOptimizationMatch[] {
    const allMatches = Array.from(this.activeMatches.values()).flat();
    return allMatches
      .sort((a, b) => b.ghostLoadMatch.netProfit - a.ghostLoadMatch.netProfit)
      .slice(0, limit);
  }
  
  public getRecentMarketScans(limit: number = 5): GhostLoadMarketScan[] {
    return Array.from(this.marketScans.values())
      .sort((a, b) => b.scanTimestamp.getTime() - a.scanTimestamp.getTime())
      .slice(0, limit);
  }
  
  public getGhostLoadAnalytics(): {
    totalGhostLoads: number;
    totalPotentialRevenue: number;
    averageMarginPotential: number;
    totalNetworkValue: number;
    conversionRate: number;
    topCategories: Array<{ category: string; count: number; value: number }>;
    regionalBreakdown: Array<{ region: string; loads: number; revenue: number; avgMargin: number }>;
  } {
    const allLoads = Array.from(this.ghostLoads.values());
    const totalPotentialRevenue = allLoads.reduce((sum, load) => sum + load.optimizedRate, 0);
    const totalNetworkValue = allLoads.reduce((sum, load) => sum + load.networkEffectValue, 0);
    const averageMarginPotential = allLoads.reduce((sum, load) => sum + load.marginPotential, 0) / allLoads.length;
    
    // Calculate conversion rate (how many ghost loads we successfully match)
    const matchedLoads = allLoads.filter(load => load.status === 'assigned' || load.status === 'in_transit' || load.status === 'delivered');
    const conversionRate = (matchedLoads.length / allLoads.length) * 100;
    
    // Categorize by source
    const categoryMap = new Map<string, { count: number; value: number }>();
    allLoads.forEach(load => {
      const category = load.source.replace('_', ' ').toUpperCase();
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, value: 0 });
      }
      const cat = categoryMap.get(category)!;
      cat.count++;
      cat.value += load.optimizedRate;
    });
    
    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value);
    
    // Calculate regional breakdown
    const regionalMap = new Map<string, { loads: number; revenue: number; totalMargin: number }>();
    allLoads.forEach(load => {
      // Extract region from load origin (simplified approach)
      let region = 'North America'; // default
      if (load.origin.location.includes('PA') || load.origin.location.includes('CR') || 
          load.origin.location.includes('GT') || load.origin.location.includes('HN') ||
          load.origin.location.includes('SV') || load.origin.location.includes('NI')) {
        region = 'Central America';
      } else if (load.origin.location.includes('DE') || load.origin.location.includes('NL') ||
                load.origin.location.includes('BE') || load.origin.location.includes('IT') ||
                load.origin.location.includes('ES') || load.origin.location.includes('FR') ||
                load.origin.location.includes('PL') || load.origin.location.includes('CZ')) {
        region = 'European Union';
      }
      
      if (!regionalMap.has(region)) {
        regionalMap.set(region, { loads: 0, revenue: 0, totalMargin: 0 });
      }
      const regionData = regionalMap.get(region)!;
      regionData.loads++;
      regionData.revenue += load.optimizedRate;
      regionData.totalMargin += load.marginPotential;
    });
    
    const regionalBreakdown = Array.from(regionalMap.entries())
      .map(([region, data]) => ({
        region,
        loads: data.loads,
        revenue: data.revenue,
        avgMargin: data.loads > 0 ? (data.totalMargin / data.loads) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    return {
      totalGhostLoads: allLoads.length,
      totalPotentialRevenue,
      averageMarginPotential: isNaN(averageMarginPotential) ? 0 : averageMarginPotential,
      totalNetworkValue,
      conversionRate: isNaN(conversionRate) ? 0 : conversionRate,
      topCategories,
      regionalBreakdown
    };
  }
  
  /**
   * Assign a ghost load match to a driver
   */
  public async assignGhostLoadToDriver(matchId: string): Promise<{ success: boolean; message: string }> {
    // Find the match
    const allMatches = Array.from(this.activeMatches.values()).flat();
    const match = allMatches.find(m => `${m.driverId}-${m.ghostLoadMatch.ghostLoadId}` === matchId);
    
    if (!match) {
      return { success: false, message: 'Match not found' };
    }
    
    // Update ghost load status
    const ghostLoad = this.ghostLoads.get(match.ghostLoadMatch.ghostLoadId);
    if (ghostLoad) {
      ghostLoad.status = 'assigned';
      this.ghostLoads.set(ghostLoad.id, ghostLoad);
    }
    
    console.log(`✅ Assigned ghost load ${match.ghostLoadMatch.ghostLoadId} to driver ${match.driverId}`);
    console.log(`💰 Expected profit: $${match.ghostLoadMatch.netProfit.toLocaleString()}`);
    
    return { 
      success: true, 
      message: `Ghost load successfully assigned! Expected profit: $${match.ghostLoadMatch.netProfit.toLocaleString()}` 
    };
  }
  
  /**
   * Cleanup method
   */
  public destroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
  }
}

// Export single instance
export const ghostLoadEngine = new GhostLoadOptimizationEngine();