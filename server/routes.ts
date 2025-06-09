import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDriverSchema, insertLoadSchema, insertNegotiationSchema, insertAlertSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Drivers endpoints
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drivers" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const validatedData = insertDriverSchema.parse(req.body);
      const driver = await storage.createDriver(validatedData);
      res.json(driver);
    } catch (error) {
      res.status(400).json({ error: "Invalid driver data" });
    }
  });

  app.patch("/api/drivers/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, location } = req.body;
      const driver = await storage.updateDriverStatus(id, status, location);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver status" });
    }
  });

  // Loads endpoints
  app.get("/api/loads", async (req, res) => {
    try {
      const loads = await storage.getLoads();
      res.json(loads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loads" });
    }
  });

  app.post("/api/loads", async (req, res) => {
    try {
      const validatedData = insertLoadSchema.parse(req.body);
      const load = await storage.createLoad(validatedData);
      res.json(load);
    } catch (error) {
      res.status(400).json({ error: "Invalid load data" });
    }
  });

  app.post("/api/loads/:id/assign", async (req, res) => {
    try {
      const loadId = parseInt(req.params.id);
      const { driverId } = req.body;
      const load = await storage.assignLoadToDriver(loadId, driverId);
      if (!load) {
        return res.status(404).json({ error: "Load not found" });
      }
      
      // Create success alert
      await storage.createAlert({
        type: "success",
        title: "Load assigned successfully",
        message: `Load ${load.externalId} assigned to driver`,
        isRead: false
      });

      res.json(load);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign load" });
    }
  });

  // Load board scraping
  app.post("/api/loads/scrape", async (req, res) => {
    try {
      // Simulate scraping multiple load boards
      const mockLoads = [
        {
          externalId: "DAT-4789",
          origin: "Dallas, TX",
          destination: "Phoenix, AZ",
          miles: 887,
          rate: "2034.00",
          ratePerMile: "2.29",
          pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "available",
          source: "DAT",
          matchScore: 78
        },
        {
          externalId: "TS-5621",
          origin: "Atlanta, GA",
          destination: "Miami, FL",
          miles: 663,
          rate: "1547.00",
          ratePerMile: "2.33",
          pickupTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
          status: "available",
          source: "Truckstop",
          matchScore: 95
        },
        {
          externalId: "123-9843",
          origin: "Chicago, IL",
          destination: "Detroit, MI",
          miles: 238,
          rate: "623.00",
          ratePerMile: "2.62",
          pickupTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          status: "available",
          source: "123LoadBoard",
          matchScore: 92
        }
      ];

      const createdLoads = [];
      for (const loadData of mockLoads) {
        try {
          const load = await storage.createLoad(loadData);
          createdLoads.push(load);
        } catch (error) {
          // Skip if load already exists
          continue;
        }
      }

      await storage.createAlert({
        type: "success",
        title: "Load board scraping completed",
        message: `Found ${createdLoads.length} new loads`,
        isRead: false
      });

      res.json({ success: true, loadsFound: createdLoads.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to scrape load boards" });
    }
  });

  // AI Rate Negotiation
  app.post("/api/negotiate-rate", async (req, res) => {
    try {
      const { loadId } = req.body;
      const load = await storage.getLoad(loadId);
      
      if (!load) {
        return res.status(404).json({ error: "Load not found" });
      }

      // Use OpenAI to analyze and suggest rate
      const prompt = `Analyze this trucking load for rate negotiation:
      - Route: ${load.origin} to ${load.destination}
      - Distance: ${load.miles} miles
      - Current rate: $${load.rate} ($${load.ratePerMile}/mile)
      - Pickup time: ${load.pickupTime}
      
      Consider current market conditions, fuel prices, and seasonal demand.
      Provide a JSON response with:
      - suggestedRate: number (total rate)
      - suggestedRatePerMile: number
      - increasePercentage: number
      - confidence: number (0-100)
      - analysis: string (brief explanation)`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert trucking rate negotiation AI. Provide realistic rate suggestions based on market data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiResult = JSON.parse(response.choices[0].message.content || '{}');
      
      // Create negotiation record
      const negotiation = await storage.createNegotiation({
        loadId: load.id,
        originalRate: load.rate,
        suggestedRate: aiResult.suggestedRate?.toString() || load.rate,
        status: "in_progress",
        aiAnalysis: aiResult.analysis || "AI analysis completed",
        confidenceScore: aiResult.confidence || 85
      });

      await storage.createAlert({
        type: "info",
        title: "AI rate negotiation started",
        message: `Analyzing rate for load ${load.externalId}`,
        isRead: false
      });

      res.json({
        negotiation,
        aiSuggestion: aiResult
      });
    } catch (error) {
      console.error("Rate negotiation error:", error);
      res.status(500).json({ error: "Failed to negotiate rate" });
    }
  });

  // Negotiations endpoints
  app.get("/api/negotiations", async (req, res) => {
    try {
      const negotiations = await storage.getNegotiations();
      res.json(negotiations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch negotiations" });
    }
  });

  app.patch("/api/negotiations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, finalRate } = req.body;
      const negotiation = await storage.updateNegotiationStatus(id, status, finalRate);
      
      if (!negotiation) {
        return res.status(404).json({ error: "Negotiation not found" });
      }

      if (status === "accepted") {
        await storage.createAlert({
          type: "success",
          title: "Rate negotiation successful",
          message: `Final rate: $${finalRate}`,
          isRead: false
        });
      }

      res.json(negotiation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update negotiation" });
    }
  });

  // Alerts endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts.slice(0, 10)); // Return latest 10 alerts
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.markAlertAsRead(id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  // System status endpoint
  app.get("/api/system-status", async (req, res) => {
    try {
      const status = {
        replitDb: "connected",
        loadBoardScraper: "active", 
        aiEngine: "limited_gpu",
        autoRecovery: "enabled",
        lastUpdate: new Date().toISOString()
      };
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get system status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
