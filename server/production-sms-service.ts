import { Twilio } from 'twilio';

// Production SMS Service using Twilio
class ProductionSMSService {
  private client: Twilio | null = null;
  private fromNumber: string;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
    
    if (!this.isDevelopment) {
      this.initializeTwilio();
    }
  }

  private initializeTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn('⚠️ Twilio credentials not found - SMS will use demo mode');
      return;
    }

    try {
      this.client = new Twilio(accountSid, authToken);
      console.log('✅ Twilio SMS service initialized for production');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio:', error);
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    // Development mode - return success without sending
    if (this.isDevelopment) {
      console.log(`📱 SMS (Dev Mode) to ${phoneNumber}: ${message}`);
      return true;
    }

    // Production mode - send real SMS
    if (!this.client) {
      console.error('❌ Twilio client not initialized');
      return false;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log(`✅ SMS sent successfully: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      return false;
    }
  }

  async sendTwoFactorCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your Zologistics verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendSecurityAlert(phoneNumber: string, event: string): Promise<boolean> {
    const message = `Zologistics Security Alert: ${event}. If this wasn't you, secure your account immediately.`;
    return this.sendSMS(phoneNumber, message);
  }

  // Test SMS functionality
  async testSMS(): Promise<boolean> {
    const testNumber = '+1 205 434 8405'; // Your configured number
    const testMessage = 'Zologistics SMS service test - system operational';
    
    console.log(`📱 Testing SMS to ${testNumber}...`);
    const result = await this.sendSMS(testNumber, testMessage);
    
    if (result) {
      console.log('✅ SMS test successful');
    } else {
      console.log('❌ SMS test failed');
    }
    
    return result;
  }
}

export const smsService = new ProductionSMSService();

// Initialize SMS service on startup
if (process.env.NODE_ENV === 'production') {
  smsService.testSMS().then(success => {
    if (success) {
      console.log('🚀 Production SMS service ready');
    } else {
      console.log('⚠️ Production SMS service has issues - check configuration');
    }
  });
}