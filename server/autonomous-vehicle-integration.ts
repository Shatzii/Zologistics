import { storage } from './storage';
import { iotService } from './iot-integration';

export interface AutonomousVehicle {
  id: string;
  driverId: number;
  vehicleType: 'level_3' | 'level_4' | 'level_5';
  manufacturer: string;
  model: string;
  autonomyCapabilities: {
    highway: boolean;
    cityDriving: boolean;
    parking: boolean;
    loading: boolean;
    weatherAdaptation: string[];
  };
  currentMode: 'manual' | 'assisted' | 'autonomous';
  systemStatus: 'online' | 'offline' | 'maintenance' | 'error';
  sensors: {
    lidar: boolean;
    cameras: number;
    radar: boolean;
    gps: boolean;
    imu: boolean;
  };
  lastUpdate: Date;
}

export interface RouteOptimization {
  routeId: string;
  loadId: number;
  vehicleId: string;
  optimizationType: 'fuel_efficient' | 'time_optimal' | 'safety_focused' | 'autonomous_friendly';
  waypoints: Array<{
    lat: number;
    lng: number;
    type: 'pickup' | 'delivery' | 'rest' | 'fuel' | 'charging';
    estimatedArrival: Date;
    autonomyCompatible: boolean;
  }>;
  restrictions: {
    noAutonomousZones: Array<{ lat: number; lng: number; radius: number }>;
    requiredHumanTakeover: string[];
    weatherLimitations: string[];
  };
  metrics: {
    totalDistance: number;
    estimatedTime: number;
    fuelConsumption: number;
    autonomousPercentage: number;
    safetyScore: number;
  };
}

export interface HandoverEvent {
  id: string;
  vehicleId: string;
  timestamp: Date;
  type: 'manual_to_autonomous' | 'autonomous_to_manual';
  reason: string;
  location: { lat: number; lng: number };
  driverResponse: 'accepted' | 'declined' | 'timeout';
  systemConfidence: number;
  conditions: {
    weather: string;
    traffic: string;
    roadType: string;
    visibility: string;
  };
}

export class AutonomousVehicleService {
  private vehicles: Map<string, AutonomousVehicle> = new Map();
  private routeOptimizations: Map<string, RouteOptimization> = new Map();
  private handoverEvents: Map<string, HandoverEvent> = new Map();

  constructor() {
    this.initializeDemoVehicles();
    this.startSystemMonitoring();
  }

  private initializeDemoVehicles() {
    const demoVehicles: AutonomousVehicle[] = [
      {
        id: 'av-001',
        driverId: 1,
        vehicleType: 'level_4',
        manufacturer: 'Volvo',
        model: 'VNL Autonomous',
        autonomyCapabilities: {
          highway: true,
          cityDriving: true,
          parking: true,
          loading: false,
          weatherAdaptation: ['clear', 'light_rain', 'overcast']
        },
        currentMode: 'autonomous',
        systemStatus: 'online',
        sensors: {
          lidar: true,
          cameras: 8,
          radar: true,
          gps: true,
          imu: true
        },
        lastUpdate: new Date()
      }
    ];

    demoVehicles.forEach(vehicle => {
      this.vehicles.set(vehicle.id, vehicle);
    });
  }

  private startSystemMonitoring() {
    setInterval(() => {
      this.vehicles.forEach((vehicle, vehicleId) => {
        this.updateVehicleStatus(vehicleId);
        this.checkHandoverConditions(vehicleId);
      });
    }, 10000); // Check every 10 seconds
  }

  private updateVehicleStatus(vehicleId: string) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return;

    // Simulate system status updates
    vehicle.lastUpdate = new Date();
    
    // Randomly simulate mode changes based on conditions
    if (Math.random() > 0.95) {
      const currentMode = vehicle.currentMode;
      const newMode = this.determineOptimalMode(vehicle);
      
      if (currentMode !== newMode) {
        this.initiateHandover(vehicleId, currentMode, newMode);
      }
    }

    this.vehicles.set(vehicleId, vehicle);
  }

  private determineOptimalMode(vehicle: AutonomousVehicle): AutonomousVehicle['currentMode'] {
    // Simulate intelligent mode selection based on conditions
    const conditions = this.getCurrentConditions();
    
    if (!vehicle.autonomyCapabilities.weatherAdaptation.includes(conditions.weather)) {
      return 'manual';
    }
    
    if (conditions.roadType === 'city' && !vehicle.autonomyCapabilities.cityDriving) {
      return 'assisted';
    }
    
    if (conditions.traffic === 'heavy' && vehicle.vehicleType === 'level_3') {
      return 'assisted';
    }
    
    return 'autonomous';
  }

  private getCurrentConditions() {
    return {
      weather: ['clear', 'light_rain', 'heavy_rain', 'snow', 'fog'][Math.floor(Math.random() * 5)],
      traffic: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)],
      roadType: ['highway', 'city', 'rural'][Math.floor(Math.random() * 3)],
      visibility: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)]
    };
  }

  private async initiateHandover(vehicleId: string, fromMode: string, toMode: string) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return;

    const handoverEvent: HandoverEvent = {
      id: this.generateHandoverId(),
      vehicleId,
      timestamp: new Date(),
      type: fromMode === 'manual' ? 'manual_to_autonomous' : 'autonomous_to_manual',
      reason: this.generateHandoverReason(fromMode, toMode),
      location: { lat: 40.7128, lng: -74.0060 }, // Simulate current location
      driverResponse: 'accepted', // Simulate driver response
      systemConfidence: Math.random() * 0.3 + 0.7,
      conditions: this.getCurrentConditions()
    };

    this.handoverEvents.set(handoverEvent.id, handoverEvent);
    
    // Update vehicle mode
    vehicle.currentMode = toMode as AutonomousVehicle['currentMode'];
    this.vehicles.set(vehicleId, vehicle);
  }

  private generateHandoverReason(fromMode: string, toMode: string): string {
    const reasons = {
      'manual_to_autonomous': [
        'Highway conditions optimal for autonomous driving',
        'Traffic flow suitable for autonomous operation',
        'Weather conditions within autonomous capability'
      ],
      'autonomous_to_manual': [
        'Construction zone detected requiring manual control',
        'Weather conditions outside autonomous parameters',
        'Complex traffic situation requires human intervention'
      ]
    };

    const key = fromMode === 'manual' ? 'manual_to_autonomous' : 'autonomous_to_manual';
    const reasonList = reasons[key];
    return reasonList[Math.floor(Math.random() * reasonList.length)];
  }

  async optimizeRouteForAutonomy(loadId: number, vehicleId: string): Promise<RouteOptimization> {
    const load = await storage.getLoad(loadId);
    const vehicle = this.vehicles.get(vehicleId);
    
    if (!load || !vehicle) {
      throw new Error('Load or vehicle not found');
    }

    const routeOptimization: RouteOptimization = {
      routeId: this.generateRouteId(),
      loadId,
      vehicleId,
      optimizationType: 'autonomous_friendly',
      waypoints: await this.generateOptimizedWaypoints(load, vehicle),
      restrictions: this.calculateAutonomyRestrictions(vehicle),
      metrics: {
        totalDistance: 0,
        estimatedTime: 0,
        fuelConsumption: 0,
        autonomousPercentage: 0,
        safetyScore: 0
      }
    };

    // Calculate metrics
    routeOptimization.metrics = this.calculateRouteMetrics(routeOptimization, vehicle);
    
    this.routeOptimizations.set(routeOptimization.routeId, routeOptimization);
    return routeOptimization;
  }

  private async generateOptimizedWaypoints(load: any, vehicle: AutonomousVehicle) {
    const waypoints = [
      {
        lat: 41.8781,
        lng: -87.6298,
        type: 'pickup' as const,
        estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000),
        autonomyCompatible: vehicle.autonomyCapabilities.loading
      },
      {
        lat: 39.7392,
        lng: -104.9903,
        type: 'rest' as const,
        estimatedArrival: new Date(Date.now() + 12 * 60 * 60 * 1000),
        autonomyCompatible: true
      },
      {
        lat: 32.7767,
        lng: -96.7970,
        type: 'delivery' as const,
        estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000),
        autonomyCompatible: vehicle.autonomyCapabilities.loading
      }
    ];

    return waypoints;
  }

  private calculateAutonomyRestrictions(vehicle: AutonomousVehicle) {
    return {
      noAutonomousZones: [
        { lat: 40.7589, lng: -73.9851, radius: 5000 }, // NYC - complex urban area
        { lat: 34.0522, lng: -118.2437, radius: 3000 }  // LA - heavy traffic
      ],
      requiredHumanTakeover: [
        'Construction zones',
        'Emergency vehicle presence',
        'Severe weather conditions',
        'Complex loading/unloading areas'
      ],
      weatherLimitations: vehicle.autonomyCapabilities.weatherAdaptation
    };
  }

  private calculateRouteMetrics(route: RouteOptimization, vehicle: AutonomousVehicle) {
    const totalDistance = route.waypoints.reduce((sum, waypoint, index) => {
      if (index === 0) return 0;
      const prev = route.waypoints[index - 1];
      return sum + this.calculateDistance(prev.lat, prev.lng, waypoint.lat, waypoint.lng);
    }, 0);

    const autonomousSegments = route.waypoints.filter(w => w.autonomyCompatible).length;
    const autonomousPercentage = (autonomousSegments / route.waypoints.length) * 100;

    return {
      totalDistance: Math.round(totalDistance),
      estimatedTime: Math.round(totalDistance / 60), // Simplified: 60 mph average
      fuelConsumption: Math.round(totalDistance * 0.15), // Gallons
      autonomousPercentage: Math.round(autonomousPercentage),
      safetyScore: Math.min(100, Math.round(85 + (autonomousPercentage * 0.15)))
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private generateHandoverId(): string {
    return `handover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRouteId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async checkHandoverConditions(vehicleId: string) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle || vehicle.currentMode === 'manual') return;

    const conditions = this.getCurrentConditions();
    let shouldHandover = false;
    let reason = '';

    if (conditions.weather === 'heavy_rain' || conditions.weather === 'snow') {
      shouldHandover = true;
      reason = 'Severe weather conditions detected';
    }

    if (conditions.visibility === 'poor') {
      shouldHandover = true;
      reason = 'Poor visibility conditions';
    }

    if (shouldHandover) {
      await this.initiateHandover(vehicleId, vehicle.currentMode, 'manual');
    }
  }

  getVehicle(vehicleId: string): AutonomousVehicle | undefined {
    return this.vehicles.get(vehicleId);
  }

  getAllVehicles(): AutonomousVehicle[] {
    return Array.from(this.vehicles.values());
  }

  getRouteOptimization(routeId: string): RouteOptimization | undefined {
    return this.routeOptimizations.get(routeId);
  }

  getHandoverEvents(vehicleId?: string): HandoverEvent[] {
    const events = Array.from(this.handoverEvents.values());
    return vehicleId ? events.filter(e => e.vehicleId === vehicleId) : events;
  }

  async getVehiclesByDriver(driverId: number): Promise<AutonomousVehicle[]> {
    return Array.from(this.vehicles.values()).filter(v => v.driverId === driverId);
  }
}

export const autonomousVehicleService = new AutonomousVehicleService();