// Production Environment Validator for Zologistics
class ProductionEnvValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  // Critical environment variables for production
  private criticalVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'NODE_ENV'
  ];

  // Important environment variables (warnings if missing)
  private importantVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'SENDGRID_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
  ];

  // Production-specific validations
  private productionValidations = [
    {
      name: 'SESSION_SECRET',
      validate: (value: string) => value.length >= 32,
      message: 'SESSION_SECRET must be at least 32 characters for production'
    },
    {
      name: 'DATABASE_URL',
      validate: (value: string) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
      message: 'DATABASE_URL must be a valid PostgreSQL connection string'
    },
    {
      name: 'NODE_ENV',
      validate: (value: string) => ['production', 'development'].includes(value),
      message: 'NODE_ENV must be either "production" or "development"'
    }
  ];

  validateEnvironment(): {isValid: boolean, errors: string[], warnings: string[]} {
    this.errors = [];
    this.warnings = [];

    // Check critical variables
    this.criticalVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        this.errors.push(`Critical: ${varName} is required but not set`);
      }
    });

    // Check important variables
    this.importantVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        this.warnings.push(`Warning: ${varName} is not set - some features may be disabled`);
      }
    });

    // Run specific validations
    this.productionValidations.forEach(validation => {
      const value = process.env[validation.name];
      if (value && !validation.validate(value)) {
        this.errors.push(validation.message);
      }
    });

    // Production-specific checks
    if (process.env.NODE_ENV === 'production') {
      this.validateProductionSpecific();
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  private validateProductionSpecific() {
    // Ensure no debug flags in production
    if (process.env.DEBUG) {
      this.warnings.push('DEBUG flag is set in production - consider removing');
    }

    // Check SSL/TLS configuration
    if (!process.env.HTTPS && !process.env.SSL_CERT) {
      this.warnings.push('No SSL configuration detected - ensure HTTPS is configured at load balancer level');
    }

    // Check for development-only settings
    if (process.env.LOG_LEVEL === 'debug') {
      this.warnings.push('LOG_LEVEL is set to debug in production - consider changing to "info" or "error"');
    }

    // Validate SMS service for 2FA
    const hasPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const hasCredentials = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
    
    if (hasPhoneNumber && !hasCredentials) {
      this.errors.push('TWILIO_PHONE_NUMBER is set but TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing');
    }

    // Validate email service
    const hasEmailConfig = process.env.SENDGRID_API_KEY || 
                          (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    
    if (!hasEmailConfig) {
      this.warnings.push('No email service configured - email notifications will be disabled');
    }
  }

  validateOrExit() {
    const result = this.validateEnvironment();
    
    // Print validation results
    console.log('🔍 Environment Validation Results:');
    
    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
      console.log('\n💡 Fix these issues before starting the application.');
      process.exit(1);
    }
    
    if (result.warnings.length === 0 && result.errors.length === 0) {
      console.log('✅ All environment variables validated successfully');
    }
    
    return result;
  }

  // Generate production-ready .env template
  generateProductionEnvTemplate(): string {
    return `# Production Environment Configuration for Zologistics
# Copy this file to .env and fill in your actual values

# ================================
# CRITICAL SETTINGS (REQUIRED)
# ================================

# Database Configuration (Required)
DATABASE_URL=postgresql://username:password@your-db-host:5432/zologistics_prod
PGHOST=your-db-host
PGPORT=5432
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGDATABASE=zologistics_prod

# Security (Required)
SESSION_SECRET=your_32_character_minimum_session_secret_here
NODE_ENV=production

# ================================
# IMPORTANT SERVICES (RECOMMENDED)
# ================================

# AI Services (At least one recommended)
OPENAI_API_KEY=sk-your_openai_api_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here

# Email Service (Recommended for notifications)
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
# OR SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@zologistics.com

# SMS Service (Recommended for 2FA)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ================================
# OPTIONAL SERVICES
# ================================

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key

# Monitoring & Analytics
SENTRY_DSN=your_sentry_dsn_for_error_tracking
MIXPANEL_TOKEN=your_mixpanel_token

# External APIs
DAT_API_KEY=your_dat_loadboard_api_key
TRUCKSTOP_API_KEY=your_truckstop_api_key
WEATHER_API_KEY=your_weather_api_key
MAPS_API_KEY=your_maps_api_key

# File Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket
AWS_REGION=us-east-1

# ================================
# DEPLOYMENT CONFIGURATION
# ================================

# Replit Deployment (if using Replit)
REPL_ID=your_repl_id
REPLIT_DOMAINS=your-app.replit.app,your-custom-domain.com
ISSUER_URL=https://replit.com/oidc

# Server Configuration
PORT=5000
HTTPS=true
SSL_CERT=path/to/ssl/cert.pem
SSL_KEY=path/to/ssl/key.pem

# Logging
LOG_LEVEL=info
DEBUG=false
`;
  }
}

export const productionEnvValidator = new ProductionEnvValidator();