export interface DriverLocation {
  driverId: number;
  currentLat: number;
  currentLng: number;
  destinationLat: number;
  destinationLng: number;
  plannedRoute: RoutePoint[];
  estimatedArrival: Date;
  availableCapacity: {
    weight: number; // remaining weight capacity in lbs
    volume: number; // remaining volume in cubic feet
    trailerType: string;
  };
  currentLoad: {
    id: number;
    deliveryTime: Date;
    unloadingDuration: number; // minutes
  };
  returnJourney: {
    homeBase: { lat: number; lng: number };
    preferredReturnTime: Date;
    maxDetourMiles: number;
    minLoadValue: number;
  };
}

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: Date;
  milesFromStart: number;
}

export interface BackhaulOpportunity {
  id: string;
  loadId: number;
  driverId: number;
  pickupLocation: { lat: number; lng: number; address: string };
  deliveryLocation: { lat: number; lng: number; address: string };
  pickupTime: Date;
  deliveryTime: Date;
  rate: number;
  distance: number;
  detourMiles: number;
  timeAdded: number; // minutes
  efficiency: {
    revenuePerMile: number;
    timeEfficiency: number; // percentage
    routeOptimization: number; // 0-100 score
  };
  loadDetails: {
    weight: number;
    equipmentType: string;
    commodityType: string;
    specialRequirements: string[];
  };
  matchScore: number; // 0-100 overall compatibility
  urgency: 'high' | 'medium' | 'low';
  estimatedProfit: number;
}

export interface DriverAlert {
  id: string;
  driverId: number;
  alertType: 'backhaul_opportunity' | 'route_optimization' | 'urgent_load';
  title: string;
  message: string;
  opportunities: BackhaulOpportunity[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  expiresAt: Date;
  actionRequired: boolean;
  contactMethods: ('sms' | 'call' | 'app_notification' | 'email')[];
  responseOptions: AlertResponse[];
  sentAt: Date;
  respondedAt?: Date;
  response?: string;
}

export interface AlertResponse {
  id: string;
  text: string;
  action: 'accept' | 'decline' | 'request_more_info' | 'negotiate' | 'defer';
  requiresInput: boolean;
}

export interface DriverContactInfo {
  driverId: number;
  phoneNumber: string;
  email: string;
  preferredContactMethod: 'sms' | 'call' | 'app' | 'email';
  contactHours: {
    start: string; // "06:00"
    end: string;   // "22:00"
    timezone: string;
  };
  alertPreferences: {
    minLoadValue: number;
    maxDetourMiles: number;
    commodityTypes: string[];
    urgencyLevels: string[];
  };
}

export class BackhaulRouteOptimizer {
  private driverLocations: Map<number, DriverLocation> = new Map();
  private availableLoads: Map<number, any> = new Map();
  private driverContacts: Map<number, DriverContactInfo> = new Map();
  private activeAlerts: Map<string, DriverAlert> = new Map();
  private routeOptimizationEngine: any;

  constructor() {
    this.initializeDriverContacts();
    this.initializeMockDriverLocations();
    this.startBackhaulMonitoring();
    console.log('🎯 Backhaul Route Optimizer initialized with intelligent load matching');
  }

  private initializeDriverContacts() {
    const mockContacts: DriverContactInfo[] = [
      {
        driverId: 1,
        phoneNumber: '+1-555-0123',
        email: 'john.driver@truckflow.ai',
        preferredContactMethod: 'sms',
        contactHours: {
          start: '06:00',
          end: '22:00',
          timezone: 'America/Chicago'
        },
        alertPreferences: {
          minLoadValue: 800,
          maxDetourMiles: 50,
          commodityTypes: ['general_freight', 'food_beverage', 'automotive'],
          urgencyLevels: ['high', 'medium']
        }
      },
      {
        driverId: 2,
        phoneNumber: '+1-555-0456',
        email: 'maria.driver@truckflow.ai',
        preferredContactMethod: 'app',
        contactHours: {
          start: '05:00',
          end: '21:00',
          timezone: 'America/New_York'
        },
        alertPreferences: {
          minLoadValue: 1200,
          maxDetourMiles: 75,
          commodityTypes: ['electronics', 'automotive', 'machinery'],
          urgencyLevels: ['critical', 'high']
        }
      }
    ];

    mockContacts.forEach(contact => {
      this.driverContacts.set(contact.driverId, contact);
    });
  }

  private initializeMockDriverLocations() {
    const mockLocations: DriverLocation[] = [
      {
        driverId: 1,
        currentLat: 41.8781,
        currentLng: -87.6298, // Chicago
        destinationLat: 39.7392,
        destinationLng: -104.9903, // Denver
        plannedRoute: [
          { lat: 41.8781, lng: -87.6298, timestamp: new Date(), milesFromStart: 0 },
          { lat: 41.2524, lng: -95.9980, timestamp: new Date(Date.now() + 4 * 60 * 60 * 1000), milesFromStart: 468 }, // Omaha
          { lat: 40.8136, lng: -96.7026, timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000), milesFromStart: 545 }, // Lincoln
          { lat: 39.7392, lng: -104.9903, timestamp: new Date(Date.now() + 10 * 60 * 60 * 1000), milesFromStart: 920 } // Denver
        ],
        estimatedArrival: new Date(Date.now() + 10 * 60 * 60 * 1000),
        availableCapacity: {
          weight: 15000, // 15k lbs remaining
          volume: 1200,  // 1200 cubic feet
          trailerType: 'dry_van'
        },
        currentLoad: {
          id: 1001,
          deliveryTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
          unloadingDuration: 120
        },
        returnJourney: {
          homeBase: { lat: 41.8781, lng: -87.6298 }, // Chicago home base
          preferredReturnTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          maxDetourMiles: 100,
          minLoadValue: 800
        }
      },
      {
        driverId: 2,
        currentLat: 32.7767,
        currentLng: -96.7970, // Dallas
        destinationLat: 34.0522,
        destinationLng: -118.2437, // Los Angeles
        plannedRoute: [
          { lat: 32.7767, lng: -96.7970, timestamp: new Date(), milesFromStart: 0 },
          { lat: 31.7619, lng: -106.4850, timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000), milesFromStart: 572 }, // El Paso
          { lat: 33.4484, lng: -112.0740, timestamp: new Date(Date.now() + 10 * 60 * 60 * 1000), milesFromStart: 887 }, // Phoenix
          { lat: 34.0522, lng: -118.2437, timestamp: new Date(Date.now() + 14 * 60 * 60 * 1000), milesFromStart: 1285 } // LA
        ],
        estimatedArrival: new Date(Date.now() + 14 * 60 * 60 * 1000),
        availableCapacity: {
          weight: 8000,
          volume: 800,
          trailerType: 'reefer'
        },
        currentLoad: {
          id: 1002,
          deliveryTime: new Date(Date.now() + 14 * 60 * 60 * 1000),
          unloadingDuration: 180
        },
        returnJourney: {
          homeBase: { lat: 32.7767, lng: -96.7970 }, // Dallas home base
          preferredReturnTime: new Date(Date.now() + 30 * 60 * 60 * 1000),
          maxDetourMiles: 150,
          minLoadValue: 1200
        }
      }
    ];

    mockLocations.forEach(location => {
      this.driverLocations.set(location.driverId, location);
    });
  }

  public findBackhaulOpportunities(driverId: number): BackhaulOpportunity[] {
    const driverLocation = this.driverLocations.get(driverId);
    if (!driverLocation) return [];

    const opportunities: BackhaulOpportunity[] = [];

    // Generate mock backhaul opportunities based on return route
    const mockOpportunities = this.generateMockBackhaulLoads(driverLocation);

    for (const load of mockOpportunities) {
      const opportunity = this.calculateBackhaulMatch(driverLocation, load);
      if (opportunity && opportunity.matchScore >= 70) {
        opportunities.push(opportunity);
      }
    }

    return opportunities.sort((a, b) => b.matchScore - a.matchScore);
  }

  private generateMockBackhaulLoads(driverLocation: DriverLocation): any[] {
    // Generate loads along the return route from destination to home base
    return [
      {
        id: 2001,
        pickupLat: 39.6612,
        pickupLng: -105.0178, // Lakewood, CO (near Denver)
        pickupAddress: 'Lakewood Distribution Center, CO',
        deliveryLat: 41.5868,
        deliveryLng: -93.6250, // Des Moines, IA (on route to Chicago)
        deliveryAddress: 'Des Moines Warehouse, IA',
        rate: 1850,
        distance: 650,
        weight: 12000,
        equipmentType: 'dry_van',
        commodityType: 'general_freight',
        pickupTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        deliveryTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
        specialRequirements: []
      },
      {
        id: 2002,
        pickupLat: 39.7392,
        pickupLng: -104.9903, // Denver
        pickupAddress: 'Denver Food Processing, CO',
        deliveryLat: 41.2033,
        deliveryLng: -95.9934, // Omaha (on route to Chicago)
        deliveryAddress: 'Omaha Distribution, NE',
        rate: 1650,
        distance: 540,
        weight: 18000,
        equipmentType: 'dry_van',
        commodityType: 'food_beverage',
        pickupTime: new Date(Date.now() + 11 * 60 * 60 * 1000),
        deliveryTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
        specialRequirements: ['temperature_controlled']
      },
      {
        id: 2003,
        pickupLat: 34.1478,
        pickupLng: -118.1445, // LA area
        pickupAddress: 'Los Angeles Electronics Hub, CA',
        deliveryLat: 33.4484,
        deliveryLng: -112.0740, // Phoenix (on route back to Dallas)
        deliveryAddress: 'Phoenix Tech Center, AZ',
        rate: 1200,
        distance: 385,
        weight: 5000,
        equipmentType: 'reefer',
        commodityType: 'electronics',
        pickupTime: new Date(Date.now() + 16 * 60 * 60 * 1000),
        deliveryTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
        specialRequirements: ['high_value', 'security']
      }
    ];
  }

  private calculateBackhaulMatch(driverLocation: DriverLocation, load: any): BackhaulOpportunity | null {
    const detourMiles = this.calculateDetourDistance(driverLocation, load);
    
    if (detourMiles > driverLocation.returnJourney.maxDetourMiles) {
      return null;
    }

    const timeAdded = this.calculateTimeImpact(detourMiles);
    const efficiency = this.calculateEfficiency(load, detourMiles, timeAdded);
    const matchScore = this.calculateMatchScore(driverLocation, load, efficiency);

    const opportunity: BackhaulOpportunity = {
      id: `backhaul_${driverLocation.driverId}_${load.id}_${Date.now()}`,
      loadId: load.id,
      driverId: driverLocation.driverId,
      pickupLocation: {
        lat: load.pickupLat,
        lng: load.pickupLng,
        address: load.pickupAddress
      },
      deliveryLocation: {
        lat: load.deliveryLat,
        lng: load.deliveryLng,
        address: load.deliveryAddress
      },
      pickupTime: load.pickupTime,
      deliveryTime: load.deliveryTime,
      rate: load.rate,
      distance: load.distance,
      detourMiles,
      timeAdded,
      efficiency,
      loadDetails: {
        weight: load.weight,
        equipmentType: load.equipmentType,
        commodityType: load.commodityType,
        specialRequirements: load.specialRequirements
      },
      matchScore,
      urgency: this.determineUrgency(load, matchScore),
      estimatedProfit: load.rate - (detourMiles * 1.85) // Estimated cost per mile
    };

    return opportunity;
  }

  private calculateDetourDistance(driverLocation: DriverLocation, load: any): number {
    // Simplified distance calculation - in production, use proper routing APIs
    const directDistance = this.calculateDistance(
      driverLocation.destinationLat, driverLocation.destinationLng,
      driverLocation.returnJourney.homeBase.lat, driverLocation.returnJourney.homeBase.lng
    );

    const routeWithLoad = 
      this.calculateDistance(driverLocation.destinationLat, driverLocation.destinationLng, load.pickupLat, load.pickupLng) +
      load.distance +
      this.calculateDistance(load.deliveryLat, load.deliveryLng, driverLocation.returnJourney.homeBase.lat, driverLocation.returnJourney.homeBase.lng);

    return Math.max(0, routeWithLoad - directDistance);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateTimeImpact(detourMiles: number): number {
    // Estimate time impact: detour miles at 55 mph average + loading/unloading
    return Math.round((detourMiles / 55) * 60) + 180; // 3 hours for pickup/delivery
  }

  private calculateEfficiency(load: any, detourMiles: number, timeAdded: number): any {
    return {
      revenuePerMile: load.rate / (load.distance + detourMiles),
      timeEfficiency: Math.max(0, 100 - (timeAdded / 10)), // Penalty for time added
      routeOptimization: Math.max(0, 100 - (detourMiles * 2)) // Penalty for detour
    };
  }

  private calculateMatchScore(driverLocation: DriverLocation, load: any, efficiency: any): number {
    let score = 0;

    // Equipment compatibility (30%)
    if (driverLocation.availableCapacity.trailerType === load.equipmentType) {
      score += 30;
    } else if (this.isCompatibleEquipment(driverLocation.availableCapacity.trailerType, load.equipmentType)) {
      score += 20;
    }

    // Capacity match (25%)
    const weightUtilization = load.weight / driverLocation.availableCapacity.weight;
    if (weightUtilization <= 1) {
      score += 25 * Math.min(weightUtilization, 0.9); // Prefer high utilization but not overweight
    }

    // Efficiency factors (25%)
    score += (efficiency.revenuePerMile / 4) * 0.1; // Revenue per mile component
    score += (efficiency.timeEfficiency / 100) * 15; // Time efficiency component
    score += (efficiency.routeOptimization / 100) * 10; // Route optimization component

    // Driver preferences (20%)
    const contact = this.driverContacts.get(driverLocation.driverId);
    if (contact) {
      if (load.rate >= contact.alertPreferences.minLoadValue) score += 10;
      if (contact.alertPreferences.commodityTypes.includes(load.commodityType)) score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private isCompatibleEquipment(driverEquipment: string, loadEquipment: string): boolean {
    const compatibility = {
      'dry_van': ['general_freight', 'packaged_goods'],
      'reefer': ['food_beverage', 'pharmaceuticals', 'electronics'],
      'flatbed': ['construction', 'machinery', 'steel']
    };

    return compatibility[driverEquipment as keyof typeof compatibility]?.includes(loadEquipment) || false;
  }

  private determineUrgency(load: any, matchScore: number): 'high' | 'medium' | 'low' {
    const timeToPickup = (load.pickupTime.getTime() - Date.now()) / (1000 * 60 * 60); // hours

    if (timeToPickup < 4 && matchScore > 85) return 'high';
    if (timeToPickup < 8 && matchScore > 75) return 'medium';
    return 'low';
  }

  public async sendDriverAlert(driverId: number, opportunities: BackhaulOpportunity[]): Promise<DriverAlert> {
    const contact = this.driverContacts.get(driverId);
    if (!contact) {
      throw new Error(`No contact information found for driver ${driverId}`);
    }

    const bestOpportunity = opportunities[0];
    const totalRevenue = opportunities.reduce((sum, opp) => sum + opp.estimatedProfit, 0);

    const alert: DriverAlert = {
      id: `alert_${driverId}_${Date.now()}`,
      driverId,
      alertType: 'backhaul_opportunity',
      title: `${opportunities.length} Backhaul Opportunity${opportunities.length > 1 ? 'ies' : ''} Found!`,
      message: this.generateAlertMessage(opportunities, totalRevenue),
      opportunities,
      priority: this.determinePriority(opportunities),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      actionRequired: true,
      contactMethods: this.determineContactMethods(contact, opportunities),
      responseOptions: [
        { id: 'accept', text: 'Accept Best Option', action: 'accept', requiresInput: false },
        { id: 'view_all', text: 'View All Options', action: 'request_more_info', requiresInput: false },
        { id: 'negotiate', text: 'Negotiate Rate', action: 'negotiate', requiresInput: true },
        { id: 'decline', text: 'Decline All', action: 'decline', requiresInput: false }
      ],
      sentAt: new Date()
    };

    this.activeAlerts.set(alert.id, alert);

    // Send the alert via preferred contact methods
    await this.deliverAlert(alert, contact);

    console.log(`📱 Sent backhaul alert to driver ${driverId}: ${opportunities.length} opportunities worth $${totalRevenue}`);
    return alert;
  }

  private generateAlertMessage(opportunities: BackhaulOpportunity[], totalRevenue: number): string {
    const best = opportunities[0];
    
    if (opportunities.length === 1) {
      return `Great backhaul opportunity on your route home! Load from ${best.pickupLocation.address} to ${best.deliveryLocation.address}. Only ${best.detourMiles} mile detour for $${best.estimatedProfit} profit. Pickup in ${Math.round((best.pickupTime.getTime() - Date.now()) / (1000 * 60 * 60))} hours.`;
    } else {
      return `${opportunities.length} backhaul opportunities available on your return route! Best option: $${best.estimatedProfit} profit with ${best.detourMiles} mile detour. Total potential earnings: $${totalRevenue}. Act fast - these loads won't last!`;
    }
  }

  private determinePriority(opportunities: BackhaulOpportunity[]): 'critical' | 'high' | 'medium' | 'low' {
    const maxMatchScore = Math.max(...opportunities.map(opp => opp.matchScore));
    const maxProfit = Math.max(...opportunities.map(opp => opp.estimatedProfit));
    const hasHighUrgency = opportunities.some(opp => opp.urgency === 'high');

    if (hasHighUrgency && maxMatchScore > 90 && maxProfit > 1000) return 'critical';
    if (maxMatchScore > 85 && maxProfit > 800) return 'high';
    if (maxMatchScore > 75) return 'medium';
    return 'low';
  }

  private determineContactMethods(contact: DriverContactInfo, opportunities: BackhaulOpportunity[]): ('sms' | 'call' | 'app_notification' | 'email')[] {
    const methods: ('sms' | 'call' | 'app_notification' | 'email')[] = ['app_notification'];
    
    // Add preferred method
    if (contact.preferredContactMethod !== 'app') {
      methods.push(contact.preferredContactMethod);
    }

    // Add urgent contact for high-value opportunities
    const hasHighValue = opportunities.some(opp => opp.estimatedProfit > 1500);
    if (hasHighValue && !methods.includes('call')) {
      methods.push('call');
    }

    return methods;
  }

  private async deliverAlert(alert: DriverAlert, contact: DriverContactInfo): Promise<void> {
    for (const method of alert.contactMethods) {
      try {
        switch (method) {
          case 'sms':
            await this.sendSMS(contact.phoneNumber, this.createSMSMessage(alert));
            break;
          case 'call':
            await this.initiateCall(contact.phoneNumber, alert);
            break;
          case 'app_notification':
            await this.sendAppNotification(contact.driverId, alert);
            break;
          case 'email':
            await this.sendEmail(contact.email, alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send alert via ${method}:`, error);
      }
    }
  }

  private createSMSMessage(alert: DriverAlert): string {
    const best = alert.opportunities[0];
    return `TruckFlow Alert: ${alert.title} ${best.pickupLocation.address} → ${best.deliveryLocation.address}. $${best.estimatedProfit} profit, ${best.detourMiles}mi detour. Reply 1=Accept, 2=Decline, 3=More info`;
  }

  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    // In production, integrate with Twilio or similar SMS service
    console.log(`📱 SMS to ${phoneNumber}: ${message}`);
  }

  private async initiateCall(phoneNumber: string, alert: DriverAlert): Promise<void> {
    // In production, integrate with voice calling service
    console.log(`📞 Calling ${phoneNumber} about alert: ${alert.title}`);
  }

  private async sendAppNotification(driverId: number, alert: DriverAlert): Promise<void> {
    // In production, integrate with push notification service
    console.log(`🔔 App notification to driver ${driverId}: ${alert.title}`);
  }

  private async sendEmail(email: string, alert: DriverAlert): Promise<void> {
    // In production, integrate with email service
    console.log(`📧 Email to ${email}: ${alert.title}`);
  }

  private startBackhaulMonitoring(): void {
    // Monitor for backhaul opportunities every 5 minutes
    setInterval(async () => {
      await this.scanForBackhaulOpportunities();
    }, 5 * 60 * 1000);

    console.log('⏰ Started backhaul monitoring - scanning every 5 minutes');
  }

  private async scanForBackhaulOpportunities(): Promise<void> {
    console.log('🔍 Scanning for backhaul opportunities...');

    for (const [driverId, location] of this.driverLocations) {
      // Only scan for drivers who are close to their destination
      const timeToDestination = location.estimatedArrival.getTime() - Date.now();
      if (timeToDestination <= 4 * 60 * 60 * 1000) { // Within 4 hours of destination
        const opportunities = this.findBackhaulOpportunities(driverId);
        
        if (opportunities.length > 0) {
          const contact = this.driverContacts.get(driverId);
          if (contact) {
            // Check if we haven't sent an alert recently
            const recentAlert = Array.from(this.activeAlerts.values()).find(
              alert => alert.driverId === driverId && 
              (Date.now() - alert.sentAt.getTime()) < 30 * 60 * 1000 // 30 minutes
            );

            if (!recentAlert) {
              await this.sendDriverAlert(driverId, opportunities);
            }
          }
        }
      }
    }
  }

  public updateDriverLocation(driverId: number, lat: number, lng: number): void {
    const location = this.driverLocations.get(driverId);
    if (location) {
      location.currentLat = lat;
      location.currentLng = lng;
      console.log(`📍 Updated driver ${driverId} location: ${lat}, ${lng}`);
    }
  }

  public getActiveAlerts(driverId?: number): DriverAlert[] {
    const alerts = Array.from(this.activeAlerts.values());
    return driverId ? alerts.filter(alert => alert.driverId === driverId) : alerts;
  }

  public respondToAlert(alertId: string, response: string, input?: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.respondedAt = new Date();
    alert.response = response;

    console.log(`✅ Driver ${alert.driverId} responded to alert ${alertId}: ${response}`);
    return true;
  }

  public getBackhaulMetrics(): {
    totalDriversMonitored: number;
    activeOpportunities: number;
    alertsSent: number;
    responseRate: number;
    averageProfitPerOpportunity: number;
  } {
    const alerts = Array.from(this.activeAlerts.values());
    const responded = alerts.filter(alert => alert.respondedAt);
    const totalProfit = alerts.reduce((sum, alert) => 
      sum + alert.opportunities.reduce((opSum, opp) => opSum + opp.estimatedProfit, 0), 0
    );

    return {
      totalDriversMonitored: this.driverLocations.size,
      activeOpportunities: alerts.reduce((sum, alert) => sum + alert.opportunities.length, 0),
      alertsSent: alerts.length,
      responseRate: alerts.length > 0 ? (responded.length / alerts.length) * 100 : 0,
      averageProfitPerOpportunity: alerts.length > 0 ? totalProfit / alerts.reduce((sum, alert) => sum + alert.opportunities.length, 0) : 0
    };
  }
}

export const backhaulRouteOptimizer = new BackhaulRouteOptimizer();