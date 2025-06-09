// Environment variable validation and graceful error handling

interface EnvironmentConfig {
  OPENAI_API_KEY?: string;
  DATABASE_URL: string;
  NODE_ENV: string;
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private config: EnvironmentConfig;
  private validationErrors: string[] = [];

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  private loadConfig(): EnvironmentConfig {
    return {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      DATABASE_URL: process.env.DATABASE_URL || '',
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
  }

  private validateConfig(): void {
    this.validationErrors = [];

    // Required environment variables
    if (!this.config.DATABASE_URL) {
      this.validationErrors.push('DATABASE_URL is required');
    }

    // Optional but recommended environment variables
    if (!this.config.OPENAI_API_KEY) {
      console.warn('⚠️  OPENAI_API_KEY not found - AI features will be disabled');
    }

    // Log validation results
    if (this.validationErrors.length > 0) {
      console.error('❌ Environment validation failed:');
      this.validationErrors.forEach(error => console.error(`   - ${error}`));
    } else {
      console.log('✅ Environment validation passed');
    }
  }

  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  public hasValidationErrors(): boolean {
    return this.validationErrors.length > 0;
  }

  public getValidationErrors(): string[] {
    return [...this.validationErrors];
  }

  public isOpenAIAvailable(): boolean {
    return Boolean(this.config.OPENAI_API_KEY);
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  // Graceful shutdown if critical environment variables are missing
  public validateOrExit(): void {
    if (this.hasValidationErrors()) {
      console.error('\n💥 Application cannot start due to missing required environment variables.');
      console.error('Please check your environment configuration and try again.\n');
      process.exit(1);
    }
  }
}

export const envValidator = EnvironmentValidator.getInstance();