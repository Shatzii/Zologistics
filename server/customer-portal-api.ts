// 4. Advanced Customer Portal with Real-Time Shipment Tracking
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "default_key"
});

export interface CustomerShipment {
  id: string;
  customerId: string;
  customerName: string;
  loadId: number;
  trackingNumber: string;
  status: 'pickup_scheduled' | 'in_transit' | 'delivered' | 'exception' | 'delayed';
  origin: {
    address: string;
    coords: { lat: number; lng: number };
    scheduledPickup: Date;
    actualPickup?: Date;
  };
  destination: {
    address: string;
    coords: { lat: number; lng: number };
    scheduledDelivery: Date;
    estimatedDelivery: Date;
    actualDelivery?: Date;
  };
  currentLocation: {
    coords: { lat: number; lng: number };
    address: string;
    lastUpdate: Date;
  };
  driverInfo: {
    name: string;
    phone: string;
    photoUrl?: string;
    rating: number;
  };
  shipmentDetails: {
    commodity: string;
    weight: number;
    pieces: number;
    specialHandling: string[];
    insuranceValue: number;
  };
  timeline: ShipmentEvent[];
  notifications: CustomerNotification[];
  documents: ShipmentDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentEvent {
  id: string;
  type: 'scheduled' | 'picked_up' | 'in_transit' | 'delivered' | 'exception' | 'delay';
  description: string;
  location: string;
  timestamp: Date;
  driverNotes?: string;
  customerVisible: boolean;
}

export interface CustomerNotification {
  id: string;
  type: 'sms' | 'email' | 'push' | 'call';
  template: 'pickup_confirmed' | 'in_transit' | 'delivery_soon' | 'delivered' | 'exception';
  sent: boolean;
  sentAt?: Date;
  content: string;
  recipientPreferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
}

export interface ShipmentDocument {
  id: string;
  type: 'bill_of_lading' | 'delivery_receipt' | 'photo' | 'signature' | 'inspection';
  name: string;
  url: string;
  uploadedAt: Date;
  customerVisible: boolean;
  description?: string;
}

export interface CustomerDashboard {
  customerId: string;
  summary: {
    activeShipments: number;
    completedThisMonth: number;
    totalSpent: number;
    onTimePercentage: number;
  };
  recentShipments: CustomerShipment[];
  alerts: CustomerAlert[];
  performanceMetrics: {
    averageTransitTime: number;
    damageRate: number;
    customerSatisfaction: number;
  };
  preferredRoutes: Array<{
    origin: string;
    destination: string;
    frequency: number;
    avgCost: number;
  }>;
}

export interface CustomerAlert {
  id: string;
  type: 'delay' | 'exception' | 'delivery' | 'pickup' | 'weather';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  shipmentId?: string;
  actionRequired: boolean;
  createdAt: Date;
  acknowledged: boolean;
}

export class CustomerPortalService {
  private shipments: Map<string, CustomerShipment> = new Map();
  private customerDashboards: Map<string, CustomerDashboard> = new Map();

  constructor() {
    this.initializeCustomerData();
    this.startRealtimeTracking();
  }

  private initializeCustomerData() {
    // Create sample customer shipments
    const sampleShipment: CustomerShipment = {
      id: `shipment_${Date.now()}`,
      customerId: "customer_001",
      customerName: "ABC Manufacturing",
      loadId: 1,
      trackingNumber: "TF2024001789",
      status: 'in_transit',
      origin: {
        address: "1234 Industrial Blvd, Atlanta, GA 30309",
        coords: { lat: 33.7490, lng: -84.3880 },
        scheduledPickup: new Date(Date.now() - 6 * 60 * 60 * 1000),
        actualPickup: new Date(Date.now() - 5.5 * 60 * 60 * 1000)
      },
      destination: {
        address: "5678 Commerce St, Miami, FL 33101",
        coords: { lat: 25.7617, lng: -80.1918 },
        scheduledDelivery: new Date(Date.now() + 6 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 5.5 * 60 * 60 * 1000)
      },
      currentLocation: {
        coords: { lat: 31.5804, lng: -84.1557 },
        address: "I-75 near Tifton, GA",
        lastUpdate: new Date(Date.now() - 15 * 60 * 1000)
      },
      driverInfo: {
        name: "John Smith",
        phone: "(555) 123-4567",
        photoUrl: "/drivers/john-smith.jpg",
        rating: 4.8
      },
      shipmentDetails: {
        commodity: "Electronics Components",
        weight: 26000,
        pieces: 48,
        specialHandling: ["Fragile", "Climate Controlled"],
        insuranceValue: 150000
      },
      timeline: [
        {
          id: "event_1",
          type: 'scheduled',
          description: "Pickup scheduled",
          location: "Atlanta, GA",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          customerVisible: true
        },
        {
          id: "event_2",
          type: 'picked_up',
          description: "Shipment picked up successfully",
          location: "1234 Industrial Blvd, Atlanta, GA",
          timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
          driverNotes: "All items secured properly. Customer provided special handling instructions.",
          customerVisible: true
        },
        {
          id: "event_3",
          type: 'in_transit',
          description: "In transit to destination",
          location: "I-75 South",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          customerVisible: true
        }
      ],
      notifications: [
        {
          id: "notif_1",
          type: 'email',
          template: 'pickup_confirmed',
          sent: true,
          sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          content: "Your shipment TF2024001789 has been picked up and is on the way.",
          recipientPreferences: { sms: true, email: true, push: false }
        }
      ],
      documents: [
        {
          id: "doc_1",
          type: 'bill_of_lading',
          name: "Bill of Lading - TF2024001789.pdf",
          url: "/documents/bol_tf2024001789.pdf",
          uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          customerVisible: true,
          description: "Signed bill of lading with pickup confirmation"
        }
      ],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000)
    };

    this.shipments.set(sampleShipment.id, sampleShipment);
    this.createCustomerDashboard("customer_001");
  }

  private createCustomerDashboard(customerId: string) {
    const dashboard: CustomerDashboard = {
      customerId,
      summary: {
        activeShipments: 3,
        completedThisMonth: 24,
        totalSpent: 145680,
        onTimePercentage: 94.2
      },
      recentShipments: Array.from(this.shipments.values())
        .filter(s => s.customerId === customerId)
        .slice(0, 5),
      alerts: [
        {
          id: "alert_1",
          type: 'delivery',
          severity: 'info',
          title: "Delivery Update",
          message: "Your shipment TF2024001789 is arriving 30 minutes early",
          shipmentId: Array.from(this.shipments.values())[0]?.id,
          actionRequired: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          acknowledged: false
        }
      ],
      performanceMetrics: {
        averageTransitTime: 18.5, // hours
        damageRate: 0.02, // 0.02%
        customerSatisfaction: 4.6
      },
      preferredRoutes: [
        {
          origin: "Atlanta, GA",
          destination: "Miami, FL",
          frequency: 12,
          avgCost: 2450
        },
        {
          origin: "Dallas, TX",
          destination: "Houston, TX",
          frequency: 8,
          avgCost: 1680
        }
      ]
    };

    this.customerDashboards.set(customerId, dashboard);
  }

  private startRealtimeTracking() {
    setInterval(() => {
      this.updateShipmentLocations();
      this.checkDeliveryAlerts();
    }, 300000); // Every 5 minutes
  }

  private updateShipmentLocations() {
    for (const shipment of this.shipments.values()) {
      if (shipment.status === 'in_transit') {
        // Simulate movement towards destination
        const progress = Math.random() * 0.1; // Small movement increment
        shipment.currentLocation.coords.lat += (shipment.destination.coords.lat - shipment.currentLocation.coords.lat) * progress;
        shipment.currentLocation.coords.lng += (shipment.destination.coords.lng - shipment.currentLocation.coords.lng) * progress;
        shipment.currentLocation.lastUpdate = new Date();
        shipment.updatedAt = new Date();

        // Add transit event occasionally
        if (Math.random() < 0.3) {
          this.addShipmentEvent(shipment.id, {
            type: 'in_transit',
            description: "Location update",
            location: shipment.currentLocation.address,
            customerVisible: false
          });
        }
      }
    }
  }

  private checkDeliveryAlerts() {
    for (const shipment of this.shipments.values()) {
      const timeToDelivery = shipment.destination.estimatedDelivery.getTime() - Date.now();
      
      // Send delivery soon notification
      if (timeToDelivery <= 2 * 60 * 60 * 1000 && timeToDelivery > 1.5 * 60 * 60 * 1000) {
        this.sendCustomerNotification(shipment.id, 'delivery_soon');
      }
    }
  }

  async getCustomerDashboard(customerId: string): Promise<CustomerDashboard | null> {
    return this.customerDashboards.get(customerId) || null;
  }

  async getShipmentTracking(trackingNumber: string): Promise<CustomerShipment | null> {
    for (const shipment of this.shipments.values()) {
      if (shipment.trackingNumber === trackingNumber) {
        return shipment;
      }
    }
    return null;
  }

  async getCustomerShipments(customerId: string, status?: string): Promise<CustomerShipment[]> {
    return Array.from(this.shipments.values())
      .filter(shipment => 
        shipment.customerId === customerId && 
        (!status || shipment.status === status)
      );
  }

  async addShipmentEvent(shipmentId: string, eventData: Partial<ShipmentEvent>): Promise<boolean> {
    const shipment = this.shipments.get(shipmentId);
    if (shipment) {
      const event: ShipmentEvent = {
        id: `event_${Date.now()}`,
        type: eventData.type || 'in_transit',
        description: eventData.description || '',
        location: eventData.location || shipment.currentLocation.address,
        timestamp: new Date(),
        driverNotes: eventData.driverNotes,
        customerVisible: eventData.customerVisible ?? true
      };

      shipment.timeline.push(event);
      shipment.updatedAt = new Date();

      // Update shipment status based on event type
      if (event.type === 'delivered') {
        shipment.status = 'delivered';
        shipment.destination.actualDelivery = new Date();
      }

      return true;
    }
    return false;
  }

  async sendCustomerNotification(shipmentId: string, template: CustomerNotification['template']): Promise<boolean> {
    const shipment = this.shipments.get(shipmentId);
    if (shipment) {
      const notification: CustomerNotification = {
        id: `notif_${Date.now()}`,
        type: 'email',
        template,
        sent: true,
        sentAt: new Date(),
        content: this.getNotificationContent(template, shipment),
        recipientPreferences: { sms: true, email: true, push: false }
      };

      shipment.notifications.push(notification);
      return true;
    }
    return false;
  }

  private getNotificationContent(template: CustomerNotification['template'], shipment: CustomerShipment): string {
    const templates = {
      pickup_confirmed: `Your shipment ${shipment.trackingNumber} has been picked up and is on the way.`,
      in_transit: `Your shipment ${shipment.trackingNumber} is in transit and on schedule.`,
      delivery_soon: `Your shipment ${shipment.trackingNumber} will arrive within 2 hours.`,
      delivered: `Your shipment ${shipment.trackingNumber} has been successfully delivered.`,
      exception: `There's an update on your shipment ${shipment.trackingNumber}. Please check for details.`
    };
    return templates[template];
  }

  async uploadShipmentDocument(shipmentId: string, document: Omit<ShipmentDocument, 'id' | 'uploadedAt'>): Promise<boolean> {
    const shipment = this.shipments.get(shipmentId);
    if (shipment) {
      const fullDocument: ShipmentDocument = {
        ...document,
        id: `doc_${Date.now()}`,
        uploadedAt: new Date()
      };

      shipment.documents.push(fullDocument);
      shipment.updatedAt = new Date();
      return true;
    }
    return false;
  }

  async generateShipmentReport(customerId: string, dateRange: { start: Date; end: Date }): Promise<{
    totalShipments: number;
    onTimeDeliveries: number;
    averageTransitTime: number;
    totalCost: number;
    topRoutes: Array<{ route: string; count: number; avgCost: number }>;
    monthlyTrends: Array<{ month: string; shipments: number; cost: number }>;
  }> {
    const customerShipments = await this.getCustomerShipments(customerId);
    
    return {
      totalShipments: customerShipments.length,
      onTimeDeliveries: Math.floor(customerShipments.length * 0.94),
      averageTransitTime: 18.5,
      totalCost: 145680,
      topRoutes: [
        { route: "Atlanta, GA → Miami, FL", count: 12, avgCost: 2450 },
        { route: "Dallas, TX → Houston, TX", count: 8, avgCost: 1680 }
      ],
      monthlyTrends: [
        { month: "Nov 2024", shipments: 24, cost: 58640 },
        { month: "Dec 2024", shipments: 31, cost: 87040 }
      ]
    };
  }

  async getShipmentDocuments(shipmentId: string, customerVisible: boolean = true): Promise<ShipmentDocument[]> {
    const shipment = this.shipments.get(shipmentId);
    if (shipment) {
      return shipment.documents.filter(doc => 
        !customerVisible || doc.customerVisible
      );
    }
    return [];
  }

  async acknowledgeAlert(customerId: string, alertId: string): Promise<boolean> {
    const dashboard = this.customerDashboards.get(customerId);
    if (dashboard) {
      const alert = dashboard.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        return true;
      }
    }
    return false;
  }

  async updateNotificationPreferences(customerId: string, preferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
  }): Promise<boolean> {
    // Update customer notification preferences
    console.log(`Updated notification preferences for customer ${customerId}:`, preferences);
    return true;
  }

  getAllActiveShipments(): CustomerShipment[] {
    return Array.from(this.shipments.values())
      .filter(shipment => ['pickup_scheduled', 'in_transit'].includes(shipment.status));
  }

  getShipmentMetrics(): {
    totalActiveShipments: number;
    averageTransitTime: number;
    onTimePerformance: number;
    customerSatisfaction: number;
  } {
    const activeShipments = this.getAllActiveShipments();
    
    return {
      totalActiveShipments: activeShipments.length,
      averageTransitTime: 18.5,
      onTimePerformance: 94.2,
      customerSatisfaction: 4.6
    };
  }
}

export const customerPortal = new CustomerPortalService();