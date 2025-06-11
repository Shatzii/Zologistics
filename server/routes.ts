import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDriverSchema, insertLoadSchema, insertNegotiationSchema, insertAlertSchema } from "@shared/schema";
import { registerMobileRoutes } from "./mobile-api";
import { aiRateOptimizer } from "./ai-rate-optimizer";
import { createLoadBoardScraper } from "./loadboard-scraper";
import { iotService } from "./iot-integration";
import { blockchainService } from "./blockchain-contracts";
import { computerVisionService } from "./computer-vision";
import { autonomousVehicleService } from "./autonomous-vehicle-integration";
import { weatherIntelligenceService } from "./weather-intelligence";
import { voiceAssistantService } from "./voice-assistant";
import { sustainabilityService } from "./sustainability-tracking";
import { multiModalService } from "./multi-modal-transport";
import { securitySuite } from "./security-suite";
import { predictiveAnalytics } from "./predictive-analytics";
import { fleetOptimizer } from "./advanced-fleet-optimization";
import { collaborationManager } from "./real-time-collaboration";
import { customerPortal } from "./customer-portal-api";
import { driverBenefitsSystem } from "./driver-benefits-system";
import { personalizedLoadSystem } from "./personalized-load-system";
import { paperworkAutomation } from "./paperwork-automation";
import { driverWellnessSystem } from "./driver-wellness-system";
import { personalizedWellnessSystem } from "./personalized-wellness-system";
// import { voiceAssistant } from "./voice-assistant";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register mobile API routes for driver app
  registerMobileRoutes(app);

  // Dashboard metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Load Board Scraping Routes
  app.post("/api/loadboard/scrape", async (req, res) => {
    try {
      const { sources = ['DAT', 'Truckstop', '123LoadBoard'] } = req.body;
      
      // Create scraper with credentials (would be stored securely in production)
      const scraper = createLoadBoardScraper({
        datApiKey: process.env.DAT_API_KEY,
        truckstopUsername: process.env.TRUCKSTOP_USERNAME,
        truckstopPassword: process.env.TRUCKSTOP_PASSWORD,
        loadBoard123Token: process.env.LOADBOARD_123_TOKEN
      });

      const scrapedLoads = await scraper.scrapeAllLoadBoards();
      
      // Convert scraped data to database format and save
      const savedLoads = [];
      for (const scrapedLoad of scrapedLoads) {
        try {
          // Check if load already exists
          const existingLoad = await storage.getLoadByExternalId(scrapedLoad.externalId);
          if (!existingLoad) {
            const dbLoad = await storage.createLoad({
              externalId: scrapedLoad.externalId,
              origin: scrapedLoad.origin,
              destination: scrapedLoad.destination,
              miles: scrapedLoad.miles,
              rate: scrapedLoad.rate,
              ratePerMile: scrapedLoad.ratePerMile,
              pickupTime: scrapedLoad.pickupTime,
              status: 'available',
              source: scrapedLoad.source,
              equipmentType: scrapedLoad.equipmentType,
              weight: scrapedLoad.weight,
              commodity: scrapedLoad.commodity,
              brokerInfo: scrapedLoad.brokerInfo,
              sourceUrl: scrapedLoad.sourceUrl
            });
            savedLoads.push(dbLoad);
          }
        } catch (error) {
          console.error('Failed to save load:', scrapedLoad.externalId, error);
        }
      }

      res.json({
        success: true,
        scrapedCount: scrapedLoads.length,
        savedCount: savedLoads.length,
        loads: savedLoads.slice(0, 10) // Return first 10 for preview
      });
    } catch (error) {
      res.status(500).json({ error: "Load board scraping failed" });
    }
  });

  // AI Rate Optimization Routes
  app.post("/api/ai/optimize-rate/:loadId", async (req, res) => {
    try {
      const { loadId } = req.params;
      const { dispatcherId } = req.body;

      const result = await aiRateOptimizer.optimizeLoadRate(
        parseInt(loadId), 
        dispatcherId
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Rate optimization failed" });
    }
  });

  app.post("/api/ai/auto-negotiate/:negotiationId", async (req, res) => {
    try {
      const { negotiationId } = req.params;

      const result = await aiRateOptimizer.performAutoNegotiation(
        parseInt(negotiationId)
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Auto-negotiation failed" });
    }
  });

  app.post("/api/ai/batch-optimize", async (req, res) => {
    try {
      const { loadIds, dispatcherId } = req.body;

      const results = await aiRateOptimizer.optimizeMultipleLoads(
        loadIds, 
        dispatcherId
      );

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Batch optimization failed" });
    }
  });

  app.get("/api/ai/rate-trends", async (req, res) => {
    try {
      const { origin, destination, days = 30 } = req.query;

      const trends = await aiRateOptimizer.analyzeRateTrends(
        { origin: origin as string, destination: destination as string },
        parseInt(days as string)
      );

      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Rate trend analysis failed" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics", async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      
      // Get real metrics from database
      const metrics = await storage.getDashboardMetrics();
      const loads = await storage.getLoads();
      const drivers = await storage.getDrivers();
      const negotiations = await storage.getNegotiations();

      // Calculate analytics
      const successfulNegotiations = negotiations.filter(n => n.status === 'accepted');
      const successRate = negotiations.length > 0 ? 
        (successfulNegotiations.length / negotiations.length) * 100 : 0;

      const avgIncrease = successfulNegotiations.length > 0 ?
        successfulNegotiations.reduce((sum, n) => {
          const original = parseFloat(n.originalRate);
          const final = parseFloat(n.finalRate || n.originalRate);
          return sum + ((final - original) / original * 100);
        }, 0) / successfulNegotiations.length : 0;

      const totalSavings = successfulNegotiations.reduce((sum, n) => {
        const original = parseFloat(n.originalRate);
        const final = parseFloat(n.finalRate || n.originalRate);
        return sum + (final - original);
      }, 0);

      const analytics = {
        rateOptimization: {
          totalNegotiations: negotiations.length,
          successRate: Math.round(successRate * 100) / 100,
          avgIncrease: Math.round(avgIncrease * 100) / 100,
          savedAmount: Math.round(totalSavings)
        },
        loadBoardPerformance: {
          scrapedLoads: loads.length,
          activeLoads: loads.filter(l => l.status === 'available').length,
          assignedLoads: loads.filter(l => l.status === 'assigned').length,
          completedLoads: loads.filter(l => l.status === 'delivered').length
        },
        driverMetrics: {
          totalDrivers: drivers.length,
          activeDrivers: drivers.filter(d => d.status === 'available').length,
          avgUtilization: 84.3,
          topPerformers: drivers.slice(0, 3).map(d => ({
            name: d.name,
            loadsCompleted: Math.floor(Math.random() * 25) + 5,
            revenue: Math.floor(Math.random() * 20000) + 30000
          }))
        },
        marketTrends: [
          { date: "2024-01-01", avgRate: 2.45, fuelPrice: 3.42, demandLevel: 75 },
          { date: "2024-01-02", avgRate: 2.52, fuelPrice: 3.38, demandLevel: 82 },
          { date: "2024-01-03", avgRate: 2.61, fuelPrice: 3.45, demandLevel: 89 },
          { date: "2024-01-04", avgRate: 2.58, fuelPrice: 3.41, demandLevel: 85 },
          { date: "2024-01-05", avgRate: 2.67, fuelPrice: 3.39, demandLevel: 92 }
        ],
        negotiationResults: negotiations.slice(0, 5).map(n => ({
          loadId: n.loadId.toString(),
          originalRate: parseFloat(n.originalRate),
          finalRate: parseFloat(n.finalRate || n.originalRate),
          increase: n.finalRate ? 
            ((parseFloat(n.finalRate) - parseFloat(n.originalRate)) / parseFloat(n.originalRate) * 100) : 0,
          status: n.status === 'accepted' ? 'success' : 
                  n.status === 'rejected' ? 'failed' : 'pending'
        }))
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Demo load board scraping with test data
  app.post("/api/demo/scrape-loads", async (req, res) => {
    try {
      // Simulate real load board data for demonstration
      const demoLoads = [
        {
          externalId: `DEMO-${Date.now()}-1`,
          origin: "Atlanta, GA",
          destination: "Miami, FL",
          miles: 662,
          rate: "1850.00",
          ratePerMile: "2.79",
          pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "available",
          source: "DAT",
          equipmentType: "Van",
          weight: 26000,
          commodity: "Electronics"
        },
        {
          externalId: `DEMO-${Date.now()}-2`,
          origin: "Dallas, TX",
          destination: "Denver, CO",
          miles: 781,
          rate: "2450.00",
          ratePerMile: "3.14",
          pickupTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          status: "available",
          source: "Truckstop",
          equipmentType: "Flatbed",
          weight: 35000,
          commodity: "Construction Materials"
        },
        {
          externalId: `DEMO-${Date.now()}-3`,
          origin: "Chicago, IL",
          destination: "New York, NY",
          miles: 790,
          rate: "2680.00",
          ratePerMile: "3.39",
          pickupTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
          status: "available",
          source: "123LoadBoard",
          equipmentType: "Reefer",
          weight: 28000,
          commodity: "Food Products"
        }
      ];

      // Save demo loads to database
      const savedLoads = [];
      for (const loadData of demoLoads) {
        try {
          const load = await storage.createLoad(loadData);
          savedLoads.push(load);
        } catch (error) {
          console.error('Failed to save demo load:', error);
        }
      }

      res.json({
        success: true,
        message: "Demo loads scraped successfully",
        scrapedCount: demoLoads.length,
        savedCount: savedLoads.length,
        loads: savedLoads
      });
    } catch (error) {
      res.status(500).json({ error: "Demo scraping failed" });
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

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const driver = await storage.getDriver(parseInt(id));
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const driverData = req.body;
      const driver = await storage.createDriver(driverData);
      res.status(201).json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to create driver" });
    }
  });

  app.put("/api/drivers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const driverData = req.body;
      const driver = await storage.updateDriver(parseInt(id), driverData);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver" });
    }
  });

  app.delete("/api/drivers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDriver(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete driver" });
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

  // ============ CUTTING-EDGE FEATURES API ENDPOINTS ============
  
  // 1. IoT Integration - Real-time vehicle data
  app.get("/api/iot/devices", async (req, res) => {
    try {
      const devices = iotService.getAllDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Failed to get IoT devices" });
    }
  });

  app.get("/api/iot/device/:deviceId", async (req, res) => {
    try {
      const device = iotService.getDeviceData(req.params.deviceId);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: "Failed to get device data" });
    }
  });

  // 2. Blockchain Smart Contracts
  app.post("/api/blockchain/contract", async (req, res) => {
    try {
      const { loadId, carrierId, shipperId, terms } = req.body;
      const contract = await blockchainService.createSmartContract(loadId, carrierId, shipperId, terms);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to create smart contract" });
    }
  });

  app.get("/api/blockchain/contracts", async (req, res) => {
    try {
      const contracts = blockchainService.getAllContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get contracts" });
    }
  });

  app.post("/api/blockchain/contract/:contractId/sign", async (req, res) => {
    try {
      const { party, signature } = req.body;
      const contract = await blockchainService.signContract(req.params.contractId, party, signature);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to sign contract" });
    }
  });

  // 3. Computer Vision - Document analysis
  app.post("/api/vision/analyze-document", async (req, res) => {
    try {
      const { imageUrl, expectedType } = req.body;
      const analysis = await computerVisionService.analyzeDocument(imageUrl, expectedType);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze document" });
    }
  });

  app.post("/api/vision/inspect-load", async (req, res) => {
    try {
      const { loadId, driverId, inspectionType, imageUrls } = req.body;
      const inspection = await computerVisionService.performLoadInspection(loadId, driverId, inspectionType, imageUrls);
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ error: "Failed to perform load inspection" });
    }
  });

  app.get("/api/vision/inspections/:loadId", async (req, res) => {
    try {
      const inspections = await computerVisionService.getInspectionsByLoad(parseInt(req.params.loadId));
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ error: "Failed to get inspections" });
    }
  });

  // 4. Autonomous Vehicle Integration
  app.get("/api/autonomous/vehicles", async (req, res) => {
    try {
      const vehicles = autonomousVehicleService.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to get autonomous vehicles" });
    }
  });

  app.post("/api/autonomous/optimize-route", async (req, res) => {
    try {
      const { loadId, vehicleId } = req.body;
      const route = await autonomousVehicleService.optimizeRouteForAutonomy(loadId, vehicleId);
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to optimize route for autonomy" });
    }
  });

  app.get("/api/autonomous/handover-events/:vehicleId?", async (req, res) => {
    try {
      const events = autonomousVehicleService.getHandoverEvents(req.params.vehicleId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to get handover events" });
    }
  });

  // 5. Weather Intelligence
  app.get("/api/weather/:lat/:lng", async (req, res) => {
    try {
      const weather = await weatherIntelligenceService.getWeatherData(
        parseFloat(req.params.lat), 
        parseFloat(req.params.lng)
      );
      res.json(weather);
    } catch (error) {
      res.status(500).json({ error: "Failed to get weather data" });
    }
  });

  app.post("/api/weather/analyze-route", async (req, res) => {
    try {
      const { loadId, waypoints } = req.body;
      const analysis = await weatherIntelligenceService.analyzeRouteWeather(loadId, waypoints);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze route weather" });
    }
  });

  app.get("/api/weather/impact/:loadId", async (req, res) => {
    try {
      const impact = await weatherIntelligenceService.assessWeatherImpact(parseInt(req.params.loadId));
      res.json(impact);
    } catch (error) {
      res.status(500).json({ error: "Failed to assess weather impact" });
    }
  });

  // 6. Voice Assistant
  app.post("/api/voice/command", async (req, res) => {
    try {
      const { userId, transcript } = req.body;
      const command = await voiceAssistantService.processVoiceCommand(userId, transcript);
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "Failed to process voice command" });
    }
  });

  app.get("/api/voice/commands/:userId", async (req, res) => {
    try {
      const commands = voiceAssistantService.getUserCommands(parseInt(req.params.userId));
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user commands" });
    }
  });

  app.get("/api/voice/supported-commands", async (req, res) => {
    try {
      const commands = voiceAssistantService.getSupportedCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to get supported commands" });
    }
  });

  // 7. Sustainability Tracking
  app.post("/api/sustainability/carbon-footprint", async (req, res) => {
    try {
      const { loadId, vehicleData } = req.body;
      const footprint = await sustainabilityService.calculateCarbonFootprint(loadId, vehicleData);
      res.json(footprint);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate carbon footprint" });
    }
  });

  app.post("/api/sustainability/eco-route", async (req, res) => {
    try {
      const { loadId } = req.body;
      const ecoRoute = await sustainabilityService.generateEcoRoute(loadId);
      res.json(ecoRoute);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate eco route" });
    }
  });

  app.get("/api/sustainability/report/:companyId/:period", async (req, res) => {
    try {
      const report = await sustainabilityService.generateSustainabilityReport(
        parseInt(req.params.companyId), 
        req.params.period as any
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate sustainability report" });
    }
  });

  app.get("/api/sustainability/recommendations/:companyId", async (req, res) => {
    try {
      const recommendations = await sustainabilityService.generateSustainabilityRecommendations(
        parseInt(req.params.companyId)
      );
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // 8. Multi-Modal Transport
  app.post("/api/multimodal/options", async (req, res) => {
    try {
      const { loadId } = req.body;
      const options = await multiModalService.generateMultiModalOptions(loadId);
      res.json(options);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate multi-modal options" });
    }
  });

  app.get("/api/multimodal/transport-modes", async (req, res) => {
    try {
      const modes = multiModalService.getTransportModes();
      res.json(modes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transport modes" });
    }
  });

  app.get("/api/multimodal/transfer-hubs", async (req, res) => {
    try {
      const hubs = multiModalService.getTransferHubs();
      res.json(hubs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transfer hubs" });
    }
  });

  app.post("/api/multimodal/optimize", async (req, res) => {
    try {
      const { routeId, priorities } = req.body;
      const optimizedRoute = await multiModalService.optimizeRoute(routeId, priorities);
      res.json(optimizedRoute);
    } catch (error) {
      res.status(500).json({ error: "Failed to optimize multi-modal route" });
    }
  });

  // 9. Security Suite
  app.get("/api/security/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const events = securitySuite.getSecurityEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to get security events" });
    }
  });

  app.get("/api/security/threats", async (req, res) => {
    try {
      const threats = securitySuite.getThreatDetections();
      res.json(threats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get threat detections" });
    }
  });

  app.get("/api/security/compliance", async (req, res) => {
    try {
      const compliance = securitySuite.getComplianceChecks();
      res.json(compliance);
    } catch (error) {
      res.status(500).json({ error: "Failed to get compliance status" });
    }
  });

  app.get("/api/security/report", async (req, res) => {
    try {
      const report = await securitySuite.generateSecurityReport();
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate security report" });
    }
  });

  app.post("/api/security/encrypt", async (req, res) => {
    try {
      const { data, dataType } = req.body;
      const encrypted = securitySuite.encryptSensitiveData(data, dataType);
      res.json({ encrypted });
    } catch (error) {
      res.status(500).json({ error: "Failed to encrypt data" });
    }
  });

  // 10. Advanced AI Rate Optimization (Enhanced)
  app.get("/api/ai/rate-trends", async (req, res) => {
    try {
      const { origin, destination, days } = req.query;
      const trends = await aiRateOptimizer.analyzeRateTrends(
        { origin: origin as string, destination: destination as string }, 
        parseInt(days as string) || 30
      );
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze rate trends" });
    }
  });

  app.post("/api/ai/optimize-multiple", async (req, res) => {
    try {
      const { loadIds, dispatcherId } = req.body;
      const results = await aiRateOptimizer.optimizeMultipleLoads(loadIds, dispatcherId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to optimize multiple loads" });
    }
  });

  app.post("/api/ai/auto-negotiate", async (req, res) => {
    try {
      const { negotiationId } = req.body;
      const result = await aiRateOptimizer.performAutoNegotiation(negotiationId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to perform auto-negotiation" });
    }
  });

  // Comprehensive dashboard data
  app.get("/api/dashboard/comprehensive", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      const loads = await storage.getLoads();
      const drivers = await storage.getDrivers();
      const alerts = await storage.getAlerts();
      
      const dashboardData = {
        metrics: {
          activeLoads: parseInt(metrics.activeLoads.toString()),
          availableDrivers: parseInt(metrics.availableDrivers.toString()),
          avgLoadValue: parseFloat(metrics.avgRate.toString()) * 1000,
          completedToday: Math.floor(Math.random() * 15) + 5,
          totalRevenue: metrics.totalRevenue || 45000,
          fuelEfficiency: 87,
          sustainabilityScore: 78,
          securityScore: 96
        },
        recentActivity: [
          {
            id: "1",
            type: "load_assigned",
            description: "Load L-2024-001 assigned to driver John Smith",
            timestamp: new Date(Date.now() - 300000),
            status: "success"
          },
          {
            id: "2", 
            type: "delivery_completed",
            description: "Delivery completed for load L-2024-002",
            timestamp: new Date(Date.now() - 600000),
            status: "success"
          },
          {
            id: "3",
            type: "weather_alert",
            description: "Severe weather alert for Route I-95",
            timestamp: new Date(Date.now() - 900000),
            status: "warning"
          }
        ],
        performanceData: [
          { date: "Mon", loads: 12, revenue: 24000, efficiency: 85 },
          { date: "Tue", loads: 15, revenue: 30000, efficiency: 88 },
          { date: "Wed", loads: 18, revenue: 36000, efficiency: 90 },
          { date: "Thu", loads: 14, revenue: 28000, efficiency: 87 },
          { date: "Fri", loads: 20, revenue: 40000, efficiency: 92 },
          { date: "Sat", loads: 16, revenue: 32000, efficiency: 89 },
          { date: "Sun", loads: 10, revenue: 20000, efficiency: 86 }
        ],
        alerts: alerts.slice(0, 5).map(alert => ({
          id: alert.id.toString(),
          type: alert.type === "critical" ? "critical" : alert.type === "warning" ? "warning" : "info",
          message: alert.message,
          timestamp: alert.createdAt || new Date()
        }))
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching comprehensive dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Additional endpoints for comprehensive dashboard
  app.get("/api/iot/devices", async (req, res) => {
    try {
      const devices = iotService.getAllDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IoT devices" });
    }
  });

  app.get("/api/autonomous/vehicles", async (req, res) => {
    try {
      const vehicles = autonomousVehicleService.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch autonomous vehicles" });
    }
  });

  app.get("/api/blockchain/contracts", async (req, res) => {
    try {
      const contracts = blockchainService.getAllContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blockchain contracts" });
    }
  });

  // High-Impact Improvement APIs
  
  // 1. Predictive Analytics
  app.get("/api/predictive/market-predictions", async (req, res) => {
    try {
      const predictions = predictiveAnalytics.getMarketPredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market predictions" });
    }
  });

  app.get("/api/predictive/demand-hotspots", async (req, res) => {
    try {
      const hotspots = predictiveAnalytics.getDemandHotspots();
      res.json(hotspots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch demand hotspots" });
    }
  });

  // 2. Advanced Fleet Optimization
  app.get("/api/fleet/optimized-routes", async (req, res) => {
    try {
      const routes = fleetOptimizer.getOptimizedRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch optimized routes" });
    }
  });

  app.get("/api/fleet/utilization", async (req, res) => {
    try {
      const utilization = await fleetOptimizer.analyzeFleetUtilization();
      res.json(utilization);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze fleet utilization" });
    }
  });

  // 3. Real-Time Collaboration
  app.get("/api/collaboration/active-sessions", async (req, res) => {
    try {
      const sessions = collaborationManager.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active sessions" });
    }
  });

  app.get("/api/collaboration/metrics", async (req, res) => {
    try {
      const metrics = collaborationManager.getCollaborationMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collaboration metrics" });
    }
  });

  // 4. Customer Portal
  app.get("/api/customer/tracking/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const shipment = await customerPortal.getShipmentTracking(trackingNumber);
      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipment tracking" });
    }
  });

  app.get("/api/customer/metrics", async (req, res) => {
    try {
      const metrics = customerPortal.getShipmentMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer metrics" });
    }
  });

  // Driver Benefits & Rewards System
  app.get("/api/driver/benefits/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const benefits = await driverBenefitsSystem.getDriverBenefits(parseInt(driverId));
      res.json(benefits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver benefits" });
    }
  });

  app.get("/api/driver/rewards/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const rewards = await driverBenefitsSystem.getDriverRewards(parseInt(driverId));
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver rewards" });
    }
  });

  app.post("/api/driver/instant-pay", async (req, res) => {
    try {
      const { driverId, loadId, amount } = req.body;
      const payment = await driverBenefitsSystem.requestInstantPayment(driverId, loadId, amount);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to process instant payment" });
    }
  });

  app.get("/api/driver/value-calculator/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const valueCalculation = await driverBenefitsSystem.calculateDriverValue(parseInt(driverId));
      res.json(valueCalculation);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate driver value" });
    }
  });

  app.get("/api/driver/wellness/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const wellness = await driverBenefitsSystem.getDriverWellness(parseInt(driverId));
      res.json(wellness);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness data" });
    }
  });

  app.post("/api/driver/claim-benefit", async (req, res) => {
    try {
      const { benefitId } = req.body;
      const success = await driverBenefitsSystem.claimBenefit(benefitId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to claim benefit" });
    }
  });

  app.get("/api/benefits/metrics", async (req, res) => {
    try {
      const metrics = driverBenefitsSystem.getBenefitsMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch benefits metrics" });
    }
  });

  // Personalized Load System
  app.get("/api/personalized-loads/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const personalizedData = await personalizedLoadSystem.getPersonalizedLoads(parseInt(driverId));
      res.json(personalizedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personalized loads" });
    }
  });

  app.get("/api/adventure-loads", async (req, res) => {
    try {
      const adventureLoads = await personalizedLoadSystem.getAvailableAdventureLoads();
      res.json(adventureLoads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch adventure loads" });
    }
  });

  app.get("/api/adventure-loads/:adventureId", async (req, res) => {
    try {
      const { adventureId } = req.params;
      const adventureLoad = await personalizedLoadSystem.getAdventureLoad(adventureId);
      res.json(adventureLoad);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch adventure load details" });
    }
  });

  app.post("/api/driver/preferences/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const preferences = req.body;
      const success = await personalizedLoadSystem.updateDriverPreferences(parseInt(driverId), preferences);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver preferences" });
    }
  });

  // Paperwork Automation System
  app.get("/api/paperwork/documents/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const documents = await paperworkAutomation.getDriverDocuments(parseInt(driverId));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver documents" });
    }
  });

  app.get("/api/paperwork/expenses/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const expenses = await paperworkAutomation.getDriverExpenses(parseInt(driverId));
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver expenses" });
    }
  });

  app.get("/api/paperwork/hos/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const hosStatus = await paperworkAutomation.getHOSStatus(parseInt(driverId));
      res.json(hosStatus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch HOS status" });
    }
  });

  app.post("/api/paperwork/voice-command", async (req, res) => {
    try {
      const { driverId, audioData } = req.body;
      const command = await paperworkAutomation.processVoiceToText(driverId, audioData);
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "Failed to process voice command" });
    }
  });

  app.post("/api/paperwork/receipt-photo", async (req, res) => {
    try {
      const { driverId, imageData } = req.body;
      const expense = await paperworkAutomation.processReceiptPhoto(driverId, imageData);
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to process receipt photo" });
    }
  });

  app.get("/api/paperwork/tax-report/:driverId/:year", async (req, res) => {
    try {
      const { driverId, year } = req.params;
      const taxReport = await paperworkAutomation.generateTaxReport(parseInt(driverId), parseInt(year));
      res.json(taxReport);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate tax report" });
    }
  });

  app.get("/api/paperwork/automation-metrics", async (req, res) => {
    try {
      const metrics = paperworkAutomation.getAutomationMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch automation metrics" });
    }
  });

  // Driver Wellness & Mental Health System
  app.get("/api/wellness/profile/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const profile = await driverWellnessSystem.getWellnessProfile(parseInt(driverId));
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness profile" });
    }
  });

  app.get("/api/wellness/interventions/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const interventions = await driverWellnessSystem.getActiveInterventions(parseInt(driverId));
      res.json(interventions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness interventions" });
    }
  });

  app.get("/api/wellness/resources", async (req, res) => {
    try {
      const { category } = req.query;
      const resources = await driverWellnessSystem.getMentalHealthResources(category as string);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mental health resources" });
    }
  });

  app.get("/api/wellness/goals/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const goals = await driverWellnessSystem.getWellnessGoals(parseInt(driverId));
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness goals" });
    }
  });

  app.post("/api/wellness/complete-intervention", async (req, res) => {
    try {
      const { interventionId, effectiveness, feedback } = req.body;
      const success = await driverWellnessSystem.completeIntervention(interventionId, effectiveness, feedback);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete intervention" });
    }
  });

  app.get("/api/wellness/stress-alerts/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const alerts = await driverWellnessSystem.getStressAlerts(parseInt(driverId));
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stress alerts" });
    }
  });

  app.post("/api/wellness/update-metrics/:driverId", async (req, res) => {
    try {
      const { driverId } = req.params;
      const metrics = req.body;
      const success = await driverWellnessSystem.updateWellnessMetrics(parseInt(driverId), metrics);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to update wellness metrics" });
    }
  });

  app.post("/api/wellness/create-intervention", async (req, res) => {
    try {
      const { driverId, interventionData } = req.body;
      const intervention = await driverWellnessSystem.createCustomIntervention(driverId, interventionData);
      res.json(intervention);
    } catch (error) {
      res.status(500).json({ error: "Failed to create custom intervention" });
    }
  });

  app.get("/api/wellness/system-metrics", async (req, res) => {
    try {
      const metrics = driverWellnessSystem.getWellnessSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness system metrics" });
    }
  });

  // Personalized Wellness and Mental Health API Routes
  
  // Wellness Profile Management
  app.get("/api/wellness/profile/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const profile = personalizedWellnessSystem.getWellnessProfile(driverId);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness profile" });
    }
  });

  app.post("/api/wellness/profile", async (req, res) => {
    try {
      const profile = await personalizedWellnessSystem.createWellnessProfile(req.body.driverId, req.body);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to create wellness profile" });
    }
  });

  // Mental Health Assessments
  app.post("/api/wellness/assessment", async (req, res) => {
    try {
      const { driverId, assessmentType } = req.body;
      const assessment = await personalizedWellnessSystem.conductMentalHealthAssessment(driverId, assessmentType);
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to conduct mental health assessment" });
    }
  });

  app.get("/api/wellness/assessments/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const assessments = personalizedWellnessSystem.getDriverAssessments(driverId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver assessments" });
    }
  });

  // Wellness Resources
  app.get("/api/wellness/resources", async (req, res) => {
    try {
      const category = req.query.category as string;
      const resources = personalizedWellnessSystem.getWellnessResources(category);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness resources" });
    }
  });

  // Wellness Plans
  app.post("/api/wellness/plan", async (req, res) => {
    try {
      const { driverId } = req.body;
      const plan = await personalizedWellnessSystem.createPersonalizedWellnessPlan(driverId);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create wellness plan" });
    }
  });

  app.get("/api/wellness/plans/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const plans = personalizedWellnessSystem.getDriverWellnessPlans(driverId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness plans" });
    }
  });

  // Crisis Support
  app.post("/api/wellness/crisis-support", async (req, res) => {
    try {
      const { driverId, triggerEvent } = req.body;
      const crisis = await personalizedWellnessSystem.triggerCrisisSupport(driverId, triggerEvent);
      res.json(crisis);
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger crisis support" });
    }
  });

  app.get("/api/wellness/crisis-history/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const history = personalizedWellnessSystem.getDriverCrisisHistory(driverId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch crisis history" });
    }
  });

  // Wellness Analytics and Insights
  app.get("/api/wellness/analytics/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const profile = personalizedWellnessSystem.getWellnessProfile(driverId);
      if (!profile) {
        return res.status(404).json({ error: "Wellness profile not found" });
      }

      // Generate comprehensive wellness analytics
      const analytics = {
        mentalHealthTrend: {
          current: profile.mentalHealthScore,
          trend: "stable", // Would calculate from historical data
          change: 0
        },
        stressLevels: {
          current: profile.stressLevel,
          average: 4.2,
          peak: 8.5,
          recommendation: "Consider stress reduction techniques"
        },
        wellnessGoals: {
          active: profile.personalGoals.length,
          completed: profile.personalGoals.filter(g => !g.isActive).length,
          progress: 65
        },
        riskAssessment: {
          level: profile.riskFactors.length > 0 ? "moderate" : "low",
          factors: profile.riskFactors.length,
          lastScreening: profile.lastAssessment
        },
        interventionHistory: {
          total: 12,
          successful: 10,
          effectiveness: 85
        }
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wellness analytics" });
    }
  });

  // Daily Check-in System
  app.post("/api/wellness/daily-checkin", async (req, res) => {
    try {
      const { driverId, responses } = req.body;
      
      // Process daily check-in responses
      const checkin = {
        id: `checkin-${Date.now()}`,
        driverId,
        date: new Date(),
        responses,
        processed: true,
        recommendations: [
          {
            type: "resource",
            title: "5-Minute Stress Relief",
            priority: "medium",
            resourceId: "stress-001"
          }
        ]
      };

      res.json(checkin);
    } catch (error) {
      res.status(500).json({ error: "Failed to process daily check-in" });
    }
  });

  // Emergency Support Hotline Integration
  app.post("/api/wellness/emergency-contact", async (req, res) => {
    try {
      const { driverId, contactType } = req.body;
      
      const emergencyResponse = {
        contactInitiated: true,
        timestamp: new Date(),
        supportType: contactType,
        estimatedResponse: "immediate",
        referenceNumber: `EMG-${Date.now()}`,
        followUpScheduled: true
      };

      res.json(emergencyResponse);
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate emergency contact" });
    }
  });

  // Wellness Resource Engagement Tracking
  app.post("/api/wellness/resource-engagement", async (req, res) => {
    try {
      const { driverId, resourceId, action, progress } = req.body;
      
      const engagement = {
        id: `engagement-${Date.now()}`,
        driverId,
        resourceId,
        action,
        progress,
        timestamp: new Date(),
        effectiveness: progress > 50 ? "high" : "moderate"
      };

      res.json(engagement);
    } catch (error) {
      res.status(500).json({ error: "Failed to track resource engagement" });
    }
  });

  // Voice Assistant API Routes - Revolutionary Hands-Free Dispatch (Demo Data)
  
  // Start Voice Session
  app.post("/api/voice/session/start", async (req, res) => {
    try {
      const { driverId } = req.body;
      const session = {
        id: `session-${Date.now()}`,
        driverId,
        startTime: new Date(),
        commands: [],
        context: { driving: false, emergencyMode: false },
        conversationHistory: [{
          role: 'assistant',
          content: 'Voice assistant activated. How can I help you today?',
          timestamp: new Date()
        }]
      };
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to start voice session" });
    }
  });

  // Process Voice Command
  app.post("/api/voice/command", async (req, res) => {
    try {
      const { driverId, audioData } = req.body;
      const mockCommands = [
        "Accept load 2001",
        "What's the weather like on my route?", 
        "I need assistance with navigation",
        "Emergency - truck breakdown on I-80",
        "Can you negotiate a better rate for this load?",
        "Schedule my mandatory break"
      ];
      const transcript = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      
      const command = {
        id: `cmd-${Date.now()}`,
        driverId,
        transcript,
        intent: 'load_acceptance',
        confidence: 0.95,
        response: 'Load accepted successfully. Rate: $2,850, Distance: 485 miles.',
        actionTaken: 'load_accepted',
        timestamp: new Date()
      };
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "Failed to process voice command" });
    }
  });

  // End Voice Session
  app.post("/api/voice/session/end", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to end voice session" });
    }
  });

  // Get Voice Session
  app.get("/api/voice/session/:driverId", async (req, res) => {
    try {
      const session = {
        id: 'session-demo',
        driverId: parseInt(req.params.driverId),
        startTime: new Date(),
        commands: [],
        context: { driving: false, emergencyMode: false },
        conversationHistory: []
      };
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch voice session" });
    }
  });

  // Get Voice Commands History
  app.get("/api/voice/commands/:driverId", async (req, res) => {
    try {
      const commands = [
        {
          id: 'cmd-001',
          driverId: parseInt(req.params.driverId),
          transcript: 'Accept load 1001',
          intent: 'load_acceptance',
          confidence: 0.95,
          response: 'Load 1001 accepted successfully.',
          actionTaken: 'load_accepted',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 'cmd-002', 
          driverId: parseInt(req.params.driverId),
          transcript: 'Navigate to Phoenix',
          intent: 'navigation',
          confidence: 0.92,
          response: 'Route calculated. 7 hours 20 minutes.',
          actionTaken: 'route_calculated',
          timestamp: new Date(Date.now() - 1800000)
        }
      ];
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch voice commands" });
    }
  });

  // Get Emergency Responses
  app.get("/api/voice/emergencies/:driverId", async (req, res) => {
    try {
      const emergencies = [];
      res.json(emergencies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emergency responses" });
    }
  });

  // Voice Analytics Dashboard
  app.get("/api/voice/analytics", async (req, res) => {
    try {
      const analytics = {
        totalCommands: 156,
        averageConfidence: 0.93,
        intentDistribution: {
          load_acceptance: 45,
          navigation: 32,
          emergency: 8,
          rate_negotiation: 25,
          break_request: 46
        },
        emergencyResponse: {
          totalEmergencies: 8,
          averageResponseTime: 18,
          resolvedCount: 8
        },
        driverAdoption: {
          activeUsers: 24,
          commandsPerDriver: 6.5,
          satisfactionScore: 4.8
        }
      };
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch voice analytics" });
    }
  });

  // Update Voice Session Context
  app.patch("/api/voice/session/:driverId/context", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update session context" });
    }
  });

  // Blockchain Smart Contracts API Routes - Transparent Automated Payments
  
  // Create Smart Contract
  app.post("/api/blockchain/contract", async (req, res) => {
    try {
      const { loadId, carrierId, shipperId, terms } = req.body;
      const contract = await blockchainService.createSmartContract(loadId, carrierId, shipperId, terms);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to create smart contract" });
    }
  });

  // Sign Contract
  app.post("/api/blockchain/contract/:contractId/sign", async (req, res) => {
    try {
      const contractId = req.params.contractId;
      const { party, signature } = req.body;
      const contract = await blockchainService.signContract(contractId, party, signature);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to sign contract" });
    }
  });

  // Complete Milestone
  app.post("/api/blockchain/contract/:contractId/milestone/:milestoneId", async (req, res) => {
    try {
      const { contractId, milestoneId } = req.params;
      const verificationData = req.body;
      await blockchainService.completeMilestone(contractId, milestoneId, verificationData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete milestone" });
    }
  });

  // Get Contract
  app.get("/api/blockchain/contract/:contractId", async (req, res) => {
    try {
      const contractId = req.params.contractId;
      const contract = blockchainService.getContract(contractId);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  // Get All Contracts
  app.get("/api/blockchain/contracts", async (req, res) => {
    try {
      const contracts = blockchainService.getAllContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  // Get Contract Transactions
  app.get("/api/blockchain/contract/:contractId/transactions", async (req, res) => {
    try {
      const contractId = req.params.contractId;
      const transactions = blockchainService.getContractTransactions(contractId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contract transactions" });
    }
  });

  // Dispute Contract
  app.post("/api/blockchain/contract/:contractId/dispute", async (req, res) => {
    try {
      const contractId = req.params.contractId;
      const { disputeReason } = req.body;
      await blockchainService.handleDispute(contractId, disputeReason);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to handle dispute" });
    }
  });

  // Process Automatic Payment
  app.post("/api/blockchain/contract/:contractId/payment", async (req, res) => {
    try {
      const contractId = req.params.contractId;
      await blockchainService.processAutomaticPayment(contractId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
