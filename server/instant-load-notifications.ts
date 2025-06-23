import { WebSocketServer, WebSocket } from 'ws';
import { smartLoadMatcher } from './smart-load-matching';
import { rateBenchmarking } from './real-time-rate-benchmarking';

export interface LoadNotification {
  id: string;
  type: 'high_value' | 'perfect_match' | 'urgent' | 'preferred_broker' | 'nearby';
  priority: 'critical' | 'high' | 'medium' | 'low';
  load: {
    id: string;
    origin: string;
    destination: string;
    equipment: string;
    rate: number;
    miles: number;
    ratePerMile: number;
    broker: string;
    pickupDate: Date;
    deliveryDate?: Date;
  };
  matchScore: number;
  reasons: string[];
  urgencyFactors: string[];
  recommendations: string[];
  expiresAt: Date;
  timestamp: Date;
}

export interface NotificationPreferences {
  driverId: number;
  enabledTypes: string[];
  minMatchScore: number;
  minRatePerMile: number;
  maxRadius: number; // miles from current location
  preferredBrokers: string[];
  blockedBrokers: string[];
  timeWindow: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  weekendNotifications: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export class InstantLoadNotificationService {
  private wss: WebSocketServer | null = null;
  private driverConnections: Map<number, WebSocket[]> = new Map();
  private notificationPreferences: Map<number, NotificationPreferences> = new Map();
  private recentNotifications: Map<number, LoadNotification[]> = new Map();
  private notificationHistory: LoadNotification[] = [];

  constructor() {
    this.initializeNotificationService();
  }

  public setupWebSocketServer(server: any) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/notifications'
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('📱 Driver connected for notifications');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.removeDriverConnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeDriverConnection(ws);
      });
    });

    console.log('🔔 Instant notification service started');
  }

  private initializeNotificationService() {
    // Initialize default preferences for existing drivers
    this.setupDefaultPreferences();
    
    // Start monitoring for high-value loads
    this.startLoadMonitoring();
    
    // Clean up old notifications every hour
    setInterval(() => {
      this.cleanupOldNotifications();
    }, 60 * 60 * 1000);
  }

  private setupDefaultPreferences() {
    const defaultPrefs: NotificationPreferences = {
      driverId: 1,
      enabledTypes: ['high_value', 'perfect_match', 'urgent', 'preferred_broker'],
      minMatchScore: 70,
      minRatePerMile: 2.00,
      maxRadius: 200,
      preferredBrokers: ['C.H. Robinson', 'XPO Logistics', 'J.B. Hunt'],
      blockedBrokers: [],
      timeWindow: {
        start: '06:00',
        end: '22:00'
      },
      weekendNotifications: true,
      soundEnabled: true,
      pushEnabled: true,
      emailEnabled: false
    };

    this.notificationPreferences.set(1, defaultPrefs);
  }

  private startLoadMonitoring() {
    // Monitor for new high-value loads every 30 seconds
    setInterval(() => {
      this.checkForNotificationTriggers();
    }, 30 * 1000);

    console.log('🔍 Load monitoring started - checking every 30 seconds');
  }

  private async checkForNotificationTriggers() {
    for (const [driverId, preferences] of this.notificationPreferences) {
      if (!this.isWithinNotificationWindow(preferences)) continue;

      const smartMatches = smartLoadMatcher.getSmartMatches(driverId);
      const newNotifications: LoadNotification[] = [];

      for (const match of smartMatches) {
        if (match.matchScore < preferences.minMatchScore) continue;

        const load = this.generateLoadFromMatch(match);
        if (load.ratePerMile < preferences.minRatePerMile) continue;

        // Check if we already sent this notification
        if (this.wasRecentlyNotified(driverId, load.id)) continue;

        const notification = await this.createLoadNotification(load, match, preferences);
        if (notification) {
          newNotifications.push(notification);
        }
      }

      if (newNotifications.length > 0) {
        await this.sendNotifications(driverId, newNotifications);
      }
    }
  }

  private generateLoadFromMatch(match: any) {
    return {
      id: match.loadId,
      origin: 'Denver, CO',
      destination: 'Phoenix, AZ',
      equipment: 'Dry Van',
      rate: 2800,
      miles: 1200,
      ratePerMile: 2800 / 1200,
      broker: 'C.H. Robinson',
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  private async createLoadNotification(load: any, match: any, preferences: NotificationPreferences): Promise<LoadNotification | null> {
    const notificationType = this.determineNotificationType(load, match, preferences);
    const priority = this.calculatePriority(load, match);
    
    if (!preferences.enabledTypes.includes(notificationType)) return null;

    const urgencyFactors = this.calculateUrgencyFactors(load, match);
    const recommendations = await this.generateRecommendations(load, match);

    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: notificationType,
      priority,
      load,
      matchScore: match.matchScore,
      reasons: match.matchReasons || [],
      urgencyFactors,
      recommendations,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      timestamp: new Date()
    };
  }

  private determineNotificationType(load: any, match: any, preferences: NotificationPreferences): 'high_value' | 'perfect_match' | 'urgent' | 'preferred_broker' | 'nearby' {
    if (load.ratePerMile >= preferences.minRatePerMile * 1.3) return 'high_value';
    if (match.matchScore >= 90) return 'perfect_match';
    if (preferences.preferredBrokers.includes(load.broker)) return 'preferred_broker';
    if (load.pickupDate && new Date(load.pickupDate).getTime() < Date.now() + 6 * 60 * 60 * 1000) return 'urgent';
    return 'nearby';
  }

  private calculatePriority(load: any, match: any): 'critical' | 'high' | 'medium' | 'low' {
    if (match.matchScore >= 95 && load.ratePerMile >= 3.0) return 'critical';
    if (match.matchScore >= 85 && load.ratePerMile >= 2.5) return 'high';
    if (match.matchScore >= 75) return 'medium';
    return 'low';
  }

  private calculateUrgencyFactors(load: any, match: any): string[] {
    const factors: string[] = [];
    
    if (load.ratePerMile >= 3.0) factors.push('Premium rate - 20% above market');
    if (match.matchScore >= 90) factors.push('Perfect equipment and route match');
    if (load.pickupDate && new Date(load.pickupDate).getTime() < Date.now() + 6 * 60 * 60 * 1000) {
      factors.push('Pickup within 6 hours');
    }
    if (match.efficiency?.deadheadPercentage <= 10) factors.push('Minimal deadhead miles');
    
    return factors;
  }

  private async generateRecommendations(load: any, match: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    recommendations.push(`Book immediately - expires in ${this.getTimeToExpiry()}`);
    
    if (load.ratePerMile >= 2.8) {
      recommendations.push('Excellent rate - no negotiation needed');
    } else {
      const benchmark = await rateBenchmarking.getBenchmarkForRoute(load.origin, load.destination, load.equipment);
      if (benchmark && load.rate < benchmark.currentMarketRate.high) {
        recommendations.push(`Try negotiating to $${benchmark.currentMarketRate.high}`);
      }
    }
    
    if (match.risk?.overallRisk === 'low') {
      recommendations.push('Low-risk load with reliable broker');
    }
    
    return recommendations;
  }

  private getTimeToExpiry(): string {
    const minutes = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
    return `${minutes} minutes`;
  }

  private isWithinNotificationWindow(preferences: NotificationPreferences): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(preferences.timeWindow.start.replace(':', ''));
    const endTime = parseInt(preferences.timeWindow.end.replace(':', ''));
    
    if (!preferences.weekendNotifications && (now.getDay() === 0 || now.getDay() === 6)) {
      return false;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  private wasRecentlyNotified(driverId: number, loadId: string): boolean {
    const recent = this.recentNotifications.get(driverId) || [];
    return recent.some(n => n.load.id === loadId && 
      Date.now() - n.timestamp.getTime() < 30 * 60 * 1000); // 30 minutes
  }

  private async sendNotifications(driverId: number, notifications: LoadNotification[]) {
    // Store notifications
    const existing = this.recentNotifications.get(driverId) || [];
    this.recentNotifications.set(driverId, [...existing, ...notifications]);
    this.notificationHistory.push(...notifications);

    // Send via WebSocket
    const connections = this.driverConnections.get(driverId) || [];
    const message = JSON.stringify({
      type: 'load_notifications',
      notifications: notifications.map(n => ({
        ...n,
        displayTitle: this.generateNotificationTitle(n),
        displayMessage: this.generateNotificationMessage(n)
      }))
    });

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`📱 Sent ${notifications.length} notifications to driver ${driverId}`);
  }

  private generateNotificationTitle(notification: LoadNotification): string {
    switch (notification.type) {
      case 'high_value':
        return `🔥 Premium Load - $${notification.load.ratePerMile.toFixed(2)}/mile`;
      case 'perfect_match':
        return `⭐ Perfect Match - ${notification.matchScore}% score`;
      case 'urgent':
        return `⚡ Urgent Load - Pickup Soon`;
      case 'preferred_broker':
        return `✅ ${notification.load.broker} Load Available`;
      case 'nearby':
        return `📍 Nearby Load - ${notification.load.miles} miles`;
      default:
        return 'New Load Available';
    }
  }

  private generateNotificationMessage(notification: LoadNotification): string {
    const { load } = notification;
    return `${load.origin} → ${load.destination} | ${load.equipment} | $${load.rate.toLocaleString()} | ${load.miles} mi`;
  }

  private handleWebSocketMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'register_driver':
        this.registerDriverConnection(message.driverId, ws);
        break;
      case 'update_preferences':
        this.updateNotificationPreferences(message.driverId, message.preferences);
        break;
      case 'mark_read':
        this.markNotificationRead(message.driverId, message.notificationId);
        break;
      case 'get_history':
        this.sendNotificationHistory(message.driverId, ws);
        break;
    }
  }

  private registerDriverConnection(driverId: number, ws: WebSocket) {
    const existing = this.driverConnections.get(driverId) || [];
    existing.push(ws);
    this.driverConnections.set(driverId, existing);
    
    // Send welcome message with current settings
    const preferences = this.notificationPreferences.get(driverId);
    ws.send(JSON.stringify({
      type: 'connection_established',
      driverId,
      preferences,
      status: 'Notifications active'
    }));
  }

  private removeDriverConnection(ws: WebSocket) {
    for (const [driverId, connections] of this.driverConnections) {
      const filtered = connections.filter(conn => conn !== ws);
      if (filtered.length !== connections.length) {
        this.driverConnections.set(driverId, filtered);
        break;
      }
    }
  }

  private updateNotificationPreferences(driverId: number, preferences: Partial<NotificationPreferences>) {
    const existing = this.notificationPreferences.get(driverId);
    if (existing) {
      this.notificationPreferences.set(driverId, { ...existing, ...preferences });
    }
  }

  private markNotificationRead(driverId: number, notificationId: string) {
    const recent = this.recentNotifications.get(driverId) || [];
    const filtered = recent.filter(n => n.id !== notificationId);
    this.recentNotifications.set(driverId, filtered);
  }

  private sendNotificationHistory(driverId: number, ws: WebSocket) {
    const driverNotifications = this.notificationHistory
      .filter(n => this.recentNotifications.get(driverId)?.some(r => r.id === n.id))
      .slice(-50); // Last 50 notifications

    ws.send(JSON.stringify({
      type: 'notification_history',
      notifications: driverNotifications
    }));
  }

  private cleanupOldNotifications() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    
    for (const [driverId, notifications] of this.recentNotifications) {
      const filtered = notifications.filter(n => n.timestamp.getTime() > cutoff);
      this.recentNotifications.set(driverId, filtered);
    }
    
    this.notificationHistory = this.notificationHistory.filter(n => n.timestamp.getTime() > cutoff);
  }

  public getNotificationPreferences(driverId: number): NotificationPreferences | undefined {
    return this.notificationPreferences.get(driverId);
  }

  public getRecentNotifications(driverId: number): LoadNotification[] {
    return this.recentNotifications.get(driverId) || [];
  }

  public getStatus(): any {
    return {
      connectedDrivers: this.driverConnections.size,
      totalNotificationsSent: this.notificationHistory.length,
      activeNotifications: Array.from(this.recentNotifications.values()).flat().length
    };
  }
}

export const notificationService = new InstantLoadNotificationService();