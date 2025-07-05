import { db } from "./db";
import {
  smartDriverProfiles,
  aiLoadRecommendations,
  communicationLogs,
  freeLoads,
  type CommunicationLog,
  type InsertCommunicationLog,
} from "@shared/schema";
import { eq, and, desc, gte } from "drizzle-orm";

interface NotificationMessage {
  driverId: number;
  loadId: number;
  recommendationId: number;
  subject: string;
  message: string;
  urgencyLevel: string;
  estimatedProfit: number;
  methods: string[]; // ['sms', 'whatsapp', 'email', 'push']
}

interface SMSMessage {
  to: string;
  message: string;
  loadId: number;
  urgencyLevel: string;
}

interface WhatsAppMessage {
  to: string;
  message: string;
  loadId: number;
  urgencyLevel: string;
}

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  loadId: number;
  urgencyLevel: string;
}

export class CommunicationService {
  private notificationQueue: NotificationMessage[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.startNotificationProcessing();
  }

  private startNotificationProcessing() {
    // Process notifications every 30 seconds
    this.processingInterval = setInterval(async () => {
      await this.processNotificationQueue();
    }, 30 * 1000);

    // Also check for new high-priority recommendations every minute
    setInterval(async () => {
      await this.checkForUrgentRecommendations();
    }, 60 * 1000);
  }

  private async checkForUrgentRecommendations() {
    try {
      // Get new urgent recommendations that haven't been sent
      const urgentRecommendations = await db
        .select({
          recommendation: aiLoadRecommendations,
          driver: smartDriverProfiles,
          load: freeLoads,
        })
        .from(aiLoadRecommendations)
        .leftJoin(smartDriverProfiles, eq(aiLoadRecommendations.driverId, smartDriverProfiles.id))
        .leftJoin(freeLoads, eq(aiLoadRecommendations.loadId, freeLoads.id))
        .where(
          and(
            eq(aiLoadRecommendations.status, "pending"),
            eq(aiLoadRecommendations.urgencyLevel, "urgent"),
            eq(smartDriverProfiles.isActive, true)
          )
        )
        .limit(20);

      for (const { recommendation, driver, load } of urgentRecommendations) {
        if (recommendation && driver && load) {
          await this.sendLoadRecommendation(recommendation, driver, load);
        }
      }
    } catch (error) {
      console.error("Error checking urgent recommendations:", error);
    }
  }

  async sendLoadRecommendation(recommendation: any, driver: any, load: any) {
    const message = this.generateRecommendationMessage(recommendation, driver, load);
    
    // Add to notification queue
    this.notificationQueue.push({
      driverId: driver.id,
      loadId: load.id,
      recommendationId: recommendation.id,
      subject: `${recommendation.urgencyLevel.toUpperCase()}: ${load.origin} → ${load.destination}`,
      message: message.text,
      urgencyLevel: recommendation.urgencyLevel,
      estimatedProfit: parseFloat(recommendation.estimatedProfit || "0"),
      methods: this.getPreferredCommunicationMethods(driver, recommendation.urgencyLevel),
    });

    console.log(`📱 Queued ${recommendation.urgencyLevel} recommendation for ${driver.name}: ${load.origin} → ${load.destination}`);
  }

  private generateRecommendationMessage(recommendation: any, driver: any, load: any) {
    const profit = parseFloat(recommendation.estimatedProfit || "0");
    const ratePerMile = parseFloat(load.ratePerMile || "0");
    
    const urgencyEmoji = {
      urgent: "🚨",
      high: "⚡",
      normal: "💰",
      low: "📋",
    }[recommendation.urgencyLevel] || "📋";

    const text = `${urgencyEmoji} LOAD ALERT: ${load.origin} → ${load.destination}
💰 Rate: $${load.rate} ($${ratePerMile.toFixed(2)}/mi)
📏 Distance: ${load.distance} miles
🎯 Est. Profit: $${profit.toFixed(0)}
📅 Pickup: ${load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : "ASAP"}
🚛 Equipment: ${load.equipmentType}

${recommendation.reasons.slice(0, 2).join(" • ")}

Reply YES to book or call broker: ${load.contactInfo?.phone || "Contact info in app"}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${urgencyEmoji} Load Recommendation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">AI Score: ${recommendation.aiScore}/100</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">${load.origin} → ${load.destination}</h2>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0;">
              <div>
                <strong>💰 Rate:</strong> $${load.rate}<br>
                <strong>📏 Distance:</strong> ${load.distance} miles<br>
                <strong>🎯 Est. Profit:</strong> $${profit.toFixed(0)}
              </div>
              <div>
                <strong>💵 Rate/Mile:</strong> $${ratePerMile.toFixed(2)}<br>
                <strong>📅 Pickup:</strong> ${load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : "ASAP"}<br>
                <strong>🚛 Equipment:</strong> ${load.equipmentType}
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Why This Load is Perfect for You:</h3>
            <ul style="color: #666;">
              ${recommendation.reasons.map((reason: string) => `<li>${reason}</li>`).join("")}
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="#" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">BOOK THIS LOAD</a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>Contact Broker: ${load.contactInfo?.phone || "See app for details"}</p>
          <p>Powered by TruckFlow AI | Reply STOP to unsubscribe</p>
        </div>
      </div>
    `;

    return { text, html };
  }

  private getPreferredCommunicationMethods(driver: any, urgencyLevel: string): string[] {
    const preferences = driver.communicationPrefs || {};
    const methods: string[] = [];

    // Always include push notifications for app users
    if (driver.deviceToken) {
      methods.push("push");
    }

    // Add methods based on urgency
    if (urgencyLevel === "urgent") {
      if (driver.phone) methods.push("sms");
      if (driver.whatsappNumber) methods.push("whatsapp");
      if (driver.email) methods.push("email");
    } else if (urgencyLevel === "high") {
      if (preferences.sms !== false && driver.phone) methods.push("sms");
      if (preferences.whatsapp !== false && driver.whatsappNumber) methods.push("whatsapp");
    } else {
      // Normal/low priority - email and push only unless driver prefers SMS
      if (preferences.sms === true && driver.phone) methods.push("sms");
      if (driver.email) methods.push("email");
    }

    return methods.length > 0 ? methods : ["email"]; // Fallback to email
  }

  private async processNotificationQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.notificationQueue.splice(0, 10); // Process 10 at a time
      
      for (const notification of batch) {
        await this.sendNotification(notification);
      }

      if (batch.length > 0) {
        console.log(`📤 Sent ${batch.length} load notifications`);
      }
    } catch (error) {
      console.error("Error processing notification queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendNotification(notification: NotificationMessage) {
    const driver = await db
      .select()
      .from(smartDriverProfiles)
      .where(eq(smartDriverProfiles.id, notification.driverId))
      .limit(1);

    if (!driver[0]) return;

    const driverData = driver[0];
    
    for (const method of notification.methods) {
      try {
        let success = false;
        let deliveredAt: Date | null = null;

        switch (method) {
          case "sms":
            if (driverData.phone) {
              success = await this.sendSMS({
                to: driverData.phone,
                message: notification.message,
                loadId: notification.loadId,
                urgencyLevel: notification.urgencyLevel,
              });
              deliveredAt = success ? new Date() : null;
            }
            break;

          case "whatsapp":
            if (driverData.whatsappNumber) {
              success = await this.sendWhatsApp({
                to: driverData.whatsappNumber,
                message: notification.message,
                loadId: notification.loadId,
                urgencyLevel: notification.urgencyLevel,
              });
              deliveredAt = success ? new Date() : null;
            }
            break;

          case "email":
            if (driverData.email) {
              const message = this.generateRecommendationMessage(
                { urgencyLevel: notification.urgencyLevel, reasons: ["AI recommended for you"] },
                driverData,
                { origin: "Origin", destination: "Destination", rate: 1000, ratePerMile: 2.5 }
              );
              success = await this.sendEmail({
                to: driverData.email,
                subject: notification.subject,
                html: message.html,
                loadId: notification.loadId,
                urgencyLevel: notification.urgencyLevel,
              });
              deliveredAt = success ? new Date() : null;
            }
            break;

          case "push":
            if (driverData.deviceToken) {
              success = await this.sendPushNotification(
                driverData.deviceToken,
                notification.subject,
                notification.message,
                {
                  loadId: notification.loadId,
                  recommendationId: notification.recommendationId,
                  urgencyLevel: notification.urgencyLevel,
                }
              );
              deliveredAt = success ? new Date() : null;
            }
            break;
        }

        // Log communication attempt
        await this.logCommunication({
          driverId: notification.driverId,
          loadId: notification.loadId,
          recommendationId: notification.recommendationId,
          method,
          recipient: this.getRecipientForMethod(method, driverData),
          message: notification.message,
          messageData: {
            subject: notification.subject,
            urgencyLevel: notification.urgencyLevel,
            estimatedProfit: notification.estimatedProfit,
          },
          status: success ? "delivered" : "failed",
          deliveredAt,
          cost: this.calculateCommunicationCost(method),
        });

        if (success) {
          // Mark recommendation as sent
          await db
            .update(aiLoadRecommendations)
            .set({
              sentAt: new Date(),
              sentVia: method,
              status: "sent",
            })
            .where(eq(aiLoadRecommendations.id, notification.recommendationId));
        }
      } catch (error) {
        console.error(`Error sending ${method} notification:`, error);
      }
    }
  }

  private getRecipientForMethod(method: string, driver: any): string {
    switch (method) {
      case "sms": return driver.phone || "";
      case "whatsapp": return driver.whatsappNumber || "";
      case "email": return driver.email || "";
      case "push": return driver.deviceToken || "";
      default: return "";
    }
  }

  private async sendSMS(sms: SMSMessage): Promise<boolean> {
    try {
      // In production, integrate with Twilio or similar SMS service
      console.log(`📱 SMS to ${sms.to}: ${sms.message.substring(0, 50)}...`);
      
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return Math.random() > 0.1; // 90% success rate
    } catch (error) {
      console.error("SMS sending error:", error);
      return false;
    }
  }

  private async sendWhatsApp(whatsapp: WhatsAppMessage): Promise<boolean> {
    try {
      // In production, integrate with WhatsApp Business API
      console.log(`💬 WhatsApp to ${whatsapp.to}: ${whatsapp.message.substring(0, 50)}...`);
      
      // Simulate WhatsApp sending
      await new Promise(resolve => setTimeout(resolve, 150));
      
      return Math.random() > 0.05; // 95% success rate
    } catch (error) {
      console.error("WhatsApp sending error:", error);
      return false;
    }
  }

  private async sendEmail(email: EmailMessage): Promise<boolean> {
    try {
      // In production, integrate with SendGrid or similar email service
      console.log(`📧 Email to ${email.to}: ${email.subject}`);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return Math.random() > 0.02; // 98% success rate
    } catch (error) {
      console.error("Email sending error:", error);
      return false;
    }
  }

  private async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data: any
  ): Promise<boolean> {
    try {
      // In production, integrate with Firebase Cloud Messaging or Apple Push Notifications
      console.log(`🔔 Push to ${deviceToken.substring(0, 10)}...: ${title}`);
      
      // Simulate push notification
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return Math.random() > 0.03; // 97% success rate
    } catch (error) {
      console.error("Push notification error:", error);
      return false;
    }
  }

  private calculateCommunicationCost(method: string): number {
    // Real-world costs per message
    const costs = {
      sms: 0.0075,      // $0.0075 per SMS
      whatsapp: 0.005,   // $0.005 per WhatsApp message
      email: 0.001,      // $0.001 per email
      push: 0.0001,      // $0.0001 per push notification
    };

    return costs[method as keyof typeof costs] || 0;
  }

  private async logCommunication(logData: Omit<InsertCommunicationLog, "sentAt">) {
    await db.insert(communicationLogs).values({
      ...logData,
      sentAt: new Date(),
    });
  }

  // Public API methods
  async sendCustomMessage(
    driverId: number,
    subject: string,
    message: string,
    methods: string[] = ["email"]
  ) {
    this.notificationQueue.push({
      driverId,
      loadId: 0, // No specific load
      recommendationId: 0, // No specific recommendation
      subject,
      message,
      urgencyLevel: "normal",
      estimatedProfit: 0,
      methods,
    });
  }

  async getCommunicationStats(driverId?: number) {
    const whereClause = driverId 
      ? eq(communicationLogs.driverId, driverId)
      : undefined;

    const stats = await db
      .select({
        method: communicationLogs.method,
        status: communicationLogs.status,
        count: communicationLogs.id,
      })
      .from(communicationLogs)
      .where(whereClause);

    return stats;
  }

  async getRecentCommunications(limit = 50) {
    return await db
      .select({
        log: communicationLogs,
        driver: {
          name: smartDriverProfiles.name,
          phone: smartDriverProfiles.phone,
        },
      })
      .from(communicationLogs)
      .leftJoin(smartDriverProfiles, eq(communicationLogs.driverId, smartDriverProfiles.id))
      .orderBy(desc(communicationLogs.sentAt))
      .limit(limit);
  }

  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}

export const communicationService = new CommunicationService();