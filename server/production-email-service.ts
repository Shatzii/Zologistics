import nodemailer from 'nodemailer';
import { MailService } from '@sendgrid/mail';

// Production Email Service with multiple providers
class ProductionEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private sendgridService: MailService | null = null;
  private isDevelopment: boolean;
  private fromEmail: string;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.fromEmail = process.env.FROM_EMAIL || 'admin@zologistics.com';
    
    if (!this.isDevelopment) {
      this.initializeServices();
    }
  }

  private initializeServices() {
    this.initializeSendGrid();
    this.initializeNodemailer();
  }

  private initializeSendGrid() {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (apiKey) {
      try {
        this.sendgridService = new MailService();
        this.sendgridService.setApiKey(apiKey);
        console.log('✅ SendGrid email service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize SendGrid:', error);
      }
    }
  }

  private initializeNodemailer() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransporter({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });
        console.log('✅ SMTP email service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize SMTP:', error);
      }
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    // Development mode - log without sending
    if (this.isDevelopment) {
      console.log(`📧 Email (Dev Mode) to ${to}: ${subject}`);
      return true;
    }

    // Try SendGrid first
    if (this.sendgridService) {
      try {
        await this.sendgridService.send({
          to,
          from: this.fromEmail,
          subject,
          text,
          html
        });
        console.log(`✅ Email sent via SendGrid to ${to}`);
        return true;
      } catch (error) {
        console.error('❌ SendGrid failed:', error);
      }
    }

    // Fallback to SMTP
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to,
          subject,
          text,
          html
        });
        console.log(`✅ Email sent via SMTP to ${to}`);
        return true;
      } catch (error) {
        console.error('❌ SMTP failed:', error);
      }
    }

    console.error('❌ No email service available');
    return false;
  }

  async sendTwoFactorCode(email: string, code: string): Promise<boolean> {
    const subject = 'Zologistics Two-Factor Authentication Code';
    const text = `Your verification code is: ${code}. Valid for 5 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Zologistics Security Verification</h2>
        <p>Your two-factor authentication code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1f2937; font-size: 32px; margin: 0;">${code}</h1>
        </div>
        <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
        <p>If you didn't request this code, please secure your account immediately.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated message from Zologistics. Please do not reply.
        </p>
      </div>
    `;

    return this.sendEmail(email, subject, text, html);
  }

  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const subject = 'Welcome to Zologistics - Your AI-Powered Logistics Platform';
    const text = `Welcome ${username}! Your Zologistics account is ready.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Zologistics</h2>
        <p>Hi ${username},</p>
        <p>Welcome to the world's most advanced AI-powered logistics platform!</p>
        <p>Your account is now active and ready to revolutionize your freight operations.</p>
        <h3>What's Next?</h3>
        <ul>
          <li>Complete your profile setup</li>
          <li>Explore our AI-powered load matching</li>
          <li>Connect with our global driver network</li>
          <li>Start earning with ghost load optimization</li>
        </ul>
        <p>Need help? Our support team is available 24/7.</p>
        <p>Best regards,<br>The Zologistics Team</p>
      </div>
    `;

    return this.sendEmail(email, subject, text, html);
  }

  async sendSecurityAlert(email: string, event: string): Promise<boolean> {
    const subject = 'Zologistics Security Alert';
    const text = `Security Alert: ${event}. If this wasn't you, secure your account immediately.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Security Alert</h2>
        <p><strong>Event:</strong> ${event}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>If this was you, no action is required.</p>
        <p>If this wasn't you, please secure your account immediately by:</p>
        <ul>
          <li>Changing your password</li>
          <li>Enabling two-factor authentication</li>
          <li>Reviewing your account activity</li>
        </ul>
        <p>Contact support if you need assistance.</p>
      </div>
    `;

    return this.sendEmail(email, subject, text, html);
  }

  // Test email functionality
  async testEmail(): Promise<boolean> {
    const testEmail = 'admin@zologistics.com';
    const subject = 'Zologistics Email Service Test';
    const text = 'Email service test - system operational';
    
    console.log(`📧 Testing email to ${testEmail}...`);
    const result = await this.sendEmail(testEmail, subject, text);
    
    if (result) {
      console.log('✅ Email test successful');
    } else {
      console.log('❌ Email test failed');
    }
    
    return result;
  }
}

export const emailService = new ProductionEmailService();

// Initialize email service on startup
if (process.env.NODE_ENV === 'production') {
  emailService.testEmail().then(success => {
    if (success) {
      console.log('🚀 Production email service ready');
    } else {
      console.log('⚠️ Production email service has issues - check configuration');
    }
  });
}