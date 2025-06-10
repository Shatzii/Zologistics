import { storage } from './storage';

export interface WeatherData {
  location: { lat: number; lng: number };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    conditions: string;
    severity: 'low' | 'moderate' | 'high' | 'severe';
  };
  forecast: Array<{
    timestamp: Date;
    temperature: number;
    precipitation: number;
    windSpeed: number;
    conditions: string;
    drivingConditions: 'excellent' | 'good' | 'caution' | 'hazardous';
  }>;
  alerts: Array<{
    type: string;
    severity: 'watch' | 'warning' | 'advisory';
    description: string;
    startTime: Date;
    endTime: Date;
  }>;
}

export interface RouteWeatherAnalysis {
  routeId: string;
  loadId: number;
  segments: Array<{
    from: { lat: number; lng: number; name: string };
    to: { lat: number; lng: number; name: string };
    distance: number;
    estimatedTime: number;
    weatherRisk: 'low' | 'moderate' | 'high' | 'severe';
    conditions: string;
    recommendations: string[];
  }>;
  overallRisk: 'low' | 'moderate' | 'high' | 'severe';
  delayProbability: number;
  alternativeRoutes: Array<{
    description: string;
    additionalDistance: number;
    additionalTime: number;
    riskReduction: number;
  }>;
  recommendations: {
    departureTime: Date;
    equipment: string[];
    precautions: string[];
    monitoring: string[];
  };
}

export interface WeatherImpactAssessment {
  loadId: number;
  currentWeather: WeatherData;
  projectedDelays: {
    pickup: number; // minutes
    delivery: number; // minutes
    total: number;
  };
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'moderate' | 'high' | 'severe';
    mitigation: string;
  }>;
  costImpact: {
    fuelIncrease: number;
    timeDelay: number;
    alternativeRoute: number;
    total: number;
  };
  actionRequired: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export class WeatherIntelligenceService {
  private weatherCache: Map<string, WeatherData> = new Map();
  private routeAnalyses: Map<string, RouteWeatherAnalysis> = new Map();

  async getWeatherData(lat: number, lng: number): Promise<WeatherData> {
    const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
    
    // Check cache first
    if (this.weatherCache.has(cacheKey)) {
      const cached = this.weatherCache.get(cacheKey)!;
      if (Date.now() - cached.current.timestamp < 30 * 60 * 1000) { // 30 minutes
        return cached;
      }
    }

    // Simulate realistic weather data
    const weatherData: WeatherData = {
      location: { lat, lng },
      current: {
        temperature: Math.round(Math.random() * 60 + 20), // 20-80°F
        humidity: Math.round(Math.random() * 50 + 30), // 30-80%
        windSpeed: Math.round(Math.random() * 25 + 5), // 5-30 mph
        windDirection: Math.round(Math.random() * 360),
        visibility: Math.round(Math.random() * 8 + 2), // 2-10 miles
        conditions: this.generateWeatherConditions(),
        severity: this.calculateSeverity()
      },
      forecast: this.generateForecast(),
      alerts: this.generateWeatherAlerts()
    };

    this.weatherCache.set(cacheKey, weatherData);
    return weatherData;
  }

  private generateWeatherConditions(): string {
    const conditions = [
      'Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain',
      'Thunderstorms', 'Light Snow', 'Heavy Snow', 'Fog', 'Sleet'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private calculateSeverity(): 'low' | 'moderate' | 'high' | 'severe' {
    const rand = Math.random();
    if (rand < 0.5) return 'low';
    if (rand < 0.8) return 'moderate';
    if (rand < 0.95) return 'high';
    return 'severe';
  }

  private generateForecast() {
    const forecast = [];
    for (let i = 1; i <= 72; i += 3) { // 72-hour forecast, 3-hour intervals
      const timestamp = new Date(Date.now() + i * 60 * 60 * 1000);
      forecast.push({
        timestamp,
        temperature: Math.round(Math.random() * 50 + 25),
        precipitation: Math.round(Math.random() * 100) / 100,
        windSpeed: Math.round(Math.random() * 20 + 5),
        conditions: this.generateWeatherConditions(),
        drivingConditions: this.calculateDrivingConditions()
      });
    }
    return forecast;
  }

  private calculateDrivingConditions(): 'excellent' | 'good' | 'caution' | 'hazardous' {
    const rand = Math.random();
    if (rand < 0.4) return 'excellent';
    if (rand < 0.7) return 'good';
    if (rand < 0.9) return 'caution';
    return 'hazardous';
  }

  private generateWeatherAlerts() {
    const alerts = [];
    if (Math.random() > 0.7) {
      const alertTypes = ['Winter Storm', 'Severe Thunderstorm', 'High Wind', 'Dense Fog'];
      const severities: Array<'watch' | 'warning' | 'advisory'> = ['watch', 'warning', 'advisory'];
      
      alerts.push({
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: 'Weather conditions may impact travel safety and timing',
        startTime: new Date(),
        endTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000)
      });
    }
    return alerts;
  }

  async analyzeRouteWeather(loadId: number, waypoints: Array<{ lat: number; lng: number; name: string }>): Promise<RouteWeatherAnalysis> {
    const analysis: RouteWeatherAnalysis = {
      routeId: this.generateRouteId(),
      loadId,
      segments: [],
      overallRisk: 'low',
      delayProbability: 0,
      alternativeRoutes: [],
      recommendations: {
        departureTime: new Date(),
        equipment: [],
        precautions: [],
        monitoring: []
      }
    };

    // Analyze each route segment
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      
      const fromWeather = await this.getWeatherData(from.lat, from.lng);
      const toWeather = await this.getWeatherData(to.lat, to.lng);
      
      const segment = await this.analyzeSegment(from, to, fromWeather, toWeather);
      analysis.segments.push(segment);
    }

    // Calculate overall analysis
    analysis.overallRisk = this.calculateOverallRisk(analysis.segments);
    analysis.delayProbability = this.calculateDelayProbability(analysis.segments);
    analysis.alternativeRoutes = await this.generateAlternativeRoutes(analysis.segments);
    analysis.recommendations = this.generateRecommendations(analysis);

    this.routeAnalyses.set(analysis.routeId, analysis);
    return analysis;
  }

  private async analyzeSegment(
    from: { lat: number; lng: number; name: string },
    to: { lat: number; lng: number; name: string },
    fromWeather: WeatherData,
    toWeather: WeatherData
  ) {
    const distance = this.calculateDistance(from.lat, from.lng, to.lat, to.lng);
    const baseTime = distance / 60; // Assume 60 mph base speed
    
    const worstSeverity = this.getWorstSeverity([fromWeather.current.severity, toWeather.current.severity]);
    const conditions = this.combineConditions([fromWeather.current.conditions, toWeather.current.conditions]);
    
    return {
      from,
      to,
      distance: Math.round(distance),
      estimatedTime: Math.round(baseTime * 60), // Convert to minutes
      weatherRisk: worstSeverity,
      conditions,
      recommendations: this.generateSegmentRecommendations(worstSeverity, conditions)
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

  private getWorstSeverity(severities: string[]): 'low' | 'moderate' | 'high' | 'severe' {
    if (severities.includes('severe')) return 'severe';
    if (severities.includes('high')) return 'high';
    if (severities.includes('moderate')) return 'moderate';
    return 'low';
  }

  private combineConditions(conditions: string[]): string {
    const unique = [...new Set(conditions)];
    return unique.join(' / ');
  }

  private generateSegmentRecommendations(risk: string, conditions: string): string[] {
    const recommendations = [];
    
    if (risk === 'severe' || risk === 'high') {
      recommendations.push('Consider delaying departure');
      recommendations.push('Monitor weather conditions closely');
    }
    
    if (conditions.includes('Rain') || conditions.includes('Snow')) {
      recommendations.push('Reduce speed and increase following distance');
      recommendations.push('Ensure tires are in good condition');
    }
    
    if (conditions.includes('Fog')) {
      recommendations.push('Use low beam headlights');
      recommendations.push('Consider alternative route if visibility < 1/4 mile');
    }
    
    if (conditions.includes('Wind')) {
      recommendations.push('Be aware of crosswinds, especially with high-profile loads');
    }
    
    return recommendations;
  }

  private calculateOverallRisk(segments: any[]): 'low' | 'moderate' | 'high' | 'severe' {
    const risks = segments.map(s => s.weatherRisk);
    return this.getWorstSeverity(risks);
  }

  private calculateDelayProbability(segments: any[]): number {
    const riskValues = { low: 0.1, moderate: 0.3, high: 0.6, severe: 0.9 };
    const avgRisk = segments.reduce((sum, s) => sum + riskValues[s.weatherRisk], 0) / segments.length;
    return Math.round(avgRisk * 100);
  }

  private async generateAlternativeRoutes(segments: any[]) {
    const alternatives = [];
    
    if (segments.some(s => s.weatherRisk === 'severe' || s.weatherRisk === 'high')) {
      alternatives.push({
        description: 'Northern route avoiding severe weather',
        additionalDistance: 50,
        additionalTime: 75,
        riskReduction: 40
      });
      
      alternatives.push({
        description: 'Delay departure by 6 hours',
        additionalDistance: 0,
        additionalTime: 360,
        riskReduction: 60
      });
    }
    
    return alternatives;
  }

  private generateRecommendations(analysis: RouteWeatherAnalysis) {
    const recommendations = {
      departureTime: new Date(),
      equipment: [] as string[],
      precautions: [] as string[],
      monitoring: [] as string[]
    };

    if (analysis.overallRisk === 'severe') {
      recommendations.departureTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
      recommendations.equipment.push('Tire chains', 'Emergency kit', 'Extra fuel');
      recommendations.precautions.push('Notify dispatcher of delays', 'Check in every 2 hours');
    } else if (analysis.overallRisk === 'high') {
      recommendations.equipment.push('Emergency kit', 'Flashlight');
      recommendations.precautions.push('Monitor weather updates', 'Have alternate route ready');
    }

    recommendations.monitoring.push('Weather radar', 'Road condition updates', 'Traffic reports');
    
    return recommendations;
  }

  async assessWeatherImpact(loadId: number): Promise<WeatherImpactAssessment> {
    const load = await storage.getLoad(loadId);
    if (!load) {
      throw new Error('Load not found');
    }

    // Get weather for pickup and delivery locations
    const pickupWeather = await this.getWeatherData(40.7128, -74.0060); // Example coordinates
    const deliveryWeather = await this.getWeatherData(34.0522, -118.2437);

    const assessment: WeatherImpactAssessment = {
      loadId,
      currentWeather: pickupWeather,
      projectedDelays: this.calculateProjectedDelays(pickupWeather, deliveryWeather),
      riskFactors: this.identifyRiskFactors(pickupWeather, deliveryWeather),
      costImpact: this.calculateCostImpact(pickupWeather, deliveryWeather),
      actionRequired: false,
      urgency: 'low'
    };

    assessment.actionRequired = assessment.riskFactors.some(r => r.impact === 'high' || r.impact === 'severe');
    assessment.urgency = this.determineUrgency(assessment);

    return assessment;
  }

  private calculateProjectedDelays(pickupWeather: WeatherData, deliveryWeather: WeatherData) {
    const pickupDelay = this.getWeatherDelay(pickupWeather.current.severity);
    const deliveryDelay = this.getWeatherDelay(deliveryWeather.current.severity);
    
    return {
      pickup: pickupDelay,
      delivery: deliveryDelay,
      total: pickupDelay + deliveryDelay
    };
  }

  private getWeatherDelay(severity: string): number {
    const delays = { low: 0, moderate: 30, high: 90, severe: 180 };
    return delays[severity] || 0;
  }

  private identifyRiskFactors(pickupWeather: WeatherData, deliveryWeather: WeatherData) {
    const riskFactors = [];
    
    if (pickupWeather.current.conditions.includes('Snow')) {
      riskFactors.push({
        factor: 'Snow conditions at pickup',
        impact: pickupWeather.current.severity as any,
        mitigation: 'Delay pickup until conditions improve or use snow chains'
      });
    }
    
    if (deliveryWeather.current.visibility < 2) {
      riskFactors.push({
        factor: 'Low visibility at delivery',
        impact: 'high' as const,
        mitigation: 'Delay delivery until visibility improves'
      });
    }
    
    return riskFactors;
  }

  private calculateCostImpact(pickupWeather: WeatherData, deliveryWeather: WeatherData) {
    const baseImpact = {
      fuelIncrease: 0,
      timeDelay: 0,
      alternativeRoute: 0,
      total: 0
    };

    const severities = [pickupWeather.current.severity, deliveryWeather.current.severity];
    
    if (severities.includes('severe')) {
      baseImpact.fuelIncrease = 150;
      baseImpact.timeDelay = 200;
      baseImpact.alternativeRoute = 100;
    } else if (severities.includes('high')) {
      baseImpact.fuelIncrease = 75;
      baseImpact.timeDelay = 100;
      baseImpact.alternativeRoute = 50;
    }
    
    baseImpact.total = baseImpact.fuelIncrease + baseImpact.timeDelay + baseImpact.alternativeRoute;
    return baseImpact;
  }

  private determineUrgency(assessment: WeatherImpactAssessment): 'low' | 'medium' | 'high' | 'critical' {
    if (assessment.riskFactors.some(r => r.impact === 'severe')) return 'critical';
    if (assessment.riskFactors.some(r => r.impact === 'high')) return 'high';
    if (assessment.projectedDelays.total > 120) return 'medium';
    return 'low';
  }

  private generateRouteId(): string {
    return `route_weather_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getRouteAnalysis(routeId: string): RouteWeatherAnalysis | undefined {
    return this.routeAnalyses.get(routeId);
  }

  getAllRouteAnalyses(): RouteWeatherAnalysis[] {
    return Array.from(this.routeAnalyses.values());
  }
}

export const weatherIntelligenceService = new WeatherIntelligenceService();