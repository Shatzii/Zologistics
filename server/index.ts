import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { envValidator } from "./env-validator";
import { productionEnvValidator } from "./production-env-validator";
import { configureProduction } from "./production-config";
import { errorHandler, notFound } from "./error-handler";
import { setupMonitoring } from "./production-monitoring";

// Initialize all autonomous systems
import "./dynamic-pricing-engine";
import "./autonomous-broker-agreements";
import "./autonomous-truck-fleet";
import "./aggressive-customer-acquisition";

const app = express();

// Configure production settings (security, compression, rate limiting)
if (process.env.NODE_ENV === 'production') {
  configureProduction(app);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Validate environment variables on startup
    console.log('🚀 Starting trucking dispatch system...');
    
    // Validate critical environment variables
    envValidator.validateOrExit();
    
    // Production environment validation
    if (process.env.NODE_ENV === 'production') {
      productionEnvValidator.validateOrExit();
    }
    
    // Initialize optional services conditionally
    console.log('🔧 Initializing optional services...');
    
    // Check for Twilio configuration
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      console.log('✅ SMS service (Twilio) configured and ready');
    } else {
      console.log('⚠️  SMS service (Twilio) not configured - SMS features disabled');
    }
    
    // Check for email service configuration
    if (process.env.SENDGRID_API_KEY) {
      console.log('✅ Email service (SendGrid) configured and ready');
    } else {
      console.log('⚠️  Email service (SendGrid) not configured - email notifications disabled');
    }
    
    // Check for Anthropic API configuration
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('✅ AI service (Anthropic) configured and ready');
    } else {
      console.log('⚠️  AI service (Anthropic) not configured - some AI features may be limited');
    }
    
    console.log('📡 Registering routes...');
    const server = await registerRoutes(app);
    console.log('✅ Routes registered successfully');
    
    // Setup production monitoring endpoints
    if (process.env.NODE_ENV === 'production') {
      setupMonitoring(app);
    }

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Add error handling middleware (must be after routes)
    app.use(notFound);
    app.use(errorHandler);

    // Use Railway port in production, 5000 in development  
    const port = process.env.PORT || process.env.RAILWAY_STATIC_PORT || 5000;
    
    // Log port configuration for debugging
    console.log(`🚀 Server starting on port ${port} (NODE_ENV: ${process.env.NODE_ENV})`);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
})();
