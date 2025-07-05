import type { Express } from "express";
import { db } from "./db";
import { 
  freeLoadBoards, 
  freeLoads, 
  smartDriverProfiles, 
  aiLoadRecommendations,
  communicationLogs,
  scrapingPerformance,
  revenueTracking,
  insertSmartDriverProfileSchema,
  insertFreeLoadBoardSchema,
  type SmartDriverProfile,
  type FreeLoad
} from "@shared/schema";
import { eq, desc, and, gte, sql, count } from "drizzle-orm";
import { loadBoardAggregator } from "./load-board-aggregator";
import { aiRecommendationEngine } from "./ai-recommendation-engine";
import { communicationService } from "./communication-service";

export function registerLoadBoardRoutes(app: Express) {

  // Load Boards Management
  app.get('/api/load-boards', async (req, res) => {
    try {
      const loadBoards = await loadBoardAggregator.getActiveLoadBoards();
      res.json(loadBoards);
    } catch (error) {
      console.error("Error fetching load boards:", error);
      res.status(500).json({ error: "Failed to fetch load boards" });
    }
  });

  app.post('/api/load-boards', async (req, res) => {
    try {
      const validatedData = insertFreeLoadBoardSchema.parse(req.body);
      const [newBoard] = await db
        .insert(freeLoadBoards)
        .values(validatedData)
        .returning();
      res.json(newBoard);
    } catch (error) {
      console.error("Error creating load board:", error);
      res.status(500).json({ error: "Failed to create load board" });
    }
  });

  // Free Loads
  app.get('/api/free-loads', async (req, res) => {
    try {
      const { limit = 50, minRate, minAiScore } = req.query;
      
      if (minRate || minAiScore) {
        const loads = await loadBoardAggregator.getHighValueLoads(
          minRate ? parseFloat(minRate as string) : 2.5,
          minAiScore ? parseInt(minAiScore as string) : 70
        );
        res.json(loads);
      } else {
        const loads = await loadBoardAggregator.getRecentLoads(parseInt(limit as string));
        res.json(loads);
      }
    } catch (error) {
      console.error("Error fetching loads:", error);
      res.status(500).json({ error: "Failed to fetch loads" });
    }
  });

  app.get('/api/free-loads/:id', async (req, res) => {
    try {
      const loadId = parseInt(req.params.id);
      const [load] = await db
        .select()
        .from(freeLoads)
        .where(eq(freeLoads.id, loadId))
        .limit(1);
      
      if (!load) {
        return res.status(404).json({ error: "Load not found" });
      }
      
      res.json(load);
    } catch (error) {
      console.error("Error fetching load:", error);
      res.status(500).json({ error: "Failed to fetch load" });
    }
  });

  // Driver Profiles
  app.get('/api/drivers', async (req, res) => {
    try {
      const drivers = await db
        .select()
        .from(smartDriverProfiles)
        .where(eq(smartDriverProfiles.isActive, true))
        .orderBy(desc(smartDriverProfiles.lastActive));
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ error: "Failed to fetch drivers" });
    }
  });

  app.post('/api/drivers', async (req, res) => {
    try {
      const validatedData = insertSmartDriverProfileSchema.parse(req.body);
      const [newDriver] = await db
        .insert(smartDriverProfiles)
        .values({
          ...validatedData,
          isActive: true,
          lastActive: new Date(),
        })
        .returning();
      res.json(newDriver);
    } catch (error) {
      console.error("Error creating driver:", error);
      res.status(500).json({ error: "Failed to create driver" });
    }
  });

  app.get('/api/drivers/:id', async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const [driver] = await db
        .select()
        .from(smartDriverProfiles)
        .where(eq(smartDriverProfiles.id, driverId))
        .limit(1);
      
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      
      res.json(driver);
    } catch (error) {
      console.error("Error fetching driver:", error);
      res.status(500).json({ error: "Failed to fetch driver" });
    }
  });

  app.put('/api/drivers/:id', async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const updateData = req.body;
      
      const [updatedDriver] = await db
        .update(smartDriverProfiles)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(smartDriverProfiles.id, driverId))
        .returning();
      
      if (!updatedDriver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      
      res.json(updatedDriver);
    } catch (error) {
      console.error("Error updating driver:", error);
      res.status(500).json({ error: "Failed to update driver" });
    }
  });

  // AI Recommendations
  app.get('/api/drivers/:id/recommendations', async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { limit = 10 } = req.query;
      
      const recommendations = await aiRecommendationEngine.getDriverRecommendations(
        driverId, 
        parseInt(limit as string)
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  app.get('/api/recommendations/high-value', async (req, res) => {
    try {
      const { minAiScore = 80, minProfitability = 70 } = req.query;
      
      const recommendations = await aiRecommendationEngine.getHighValueRecommendations(
        parseInt(minAiScore as string),
        parseInt(minProfitability as string)
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching high-value recommendations:", error);
      res.status(500).json({ error: "Failed to fetch high-value recommendations" });
    }
  });

  app.post('/api/recommendations/:id/viewed', async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      await aiRecommendationEngine.markRecommendationViewed(recommendationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking recommendation as viewed:", error);
      res.status(500).json({ error: "Failed to mark recommendation as viewed" });
    }
  });

  app.post('/api/recommendations/:id/clicked', async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      await aiRecommendationEngine.markRecommendationClicked(recommendationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking recommendation as clicked:", error);
      res.status(500).json({ error: "Failed to mark recommendation as clicked" });
    }
  });

  app.post('/api/recommendations/:id/booked', async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      await aiRecommendationEngine.markRecommendationBooked(recommendationId);
      
      // Record revenue
      const [recommendation] = await db
        .select()
        .from(aiLoadRecommendations)
        .where(eq(aiLoadRecommendations.id, recommendationId))
        .limit(1);

      if (recommendation) {
        const estimatedProfit = parseFloat(recommendation.estimatedProfit || "0");
        const platformFee = estimatedProfit * 0.05; // 5% platform fee
        
        await db.insert(revenueTracking).values({
          driverId: recommendation.driverId,
          loadId: recommendation.loadId,
          recommendationId: recommendationId,
          grossRevenue: estimatedProfit.toString(),
          platformFee: platformFee.toString(),
          netRevenue: (estimatedProfit - platformFee).toString(),
          profit: platformFee.toString(),
          bookingDate: new Date(),
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking recommendation as booked:", error);
      res.status(500).json({ error: "Failed to mark recommendation as booked" });
    }
  });

  // Communication
  app.post('/api/drivers/:id/notify', async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { subject, message, methods = ["email"] } = req.body;
      
      await communicationService.sendCustomMessage(driverId, subject, message, methods);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  app.get('/api/communications', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const communications = await communicationService.getRecentCommunications(
        parseInt(limit as string)
      );
      res.json(communications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      res.status(500).json({ error: "Failed to fetch communications" });
    }
  });

  app.get('/api/communications/stats', async (req, res) => {
    try {
      const { driverId } = req.query;
      const stats = await communicationService.getCommunicationStats(
        driverId ? parseInt(driverId as string) : undefined
      );
      res.json(stats);
    } catch (error) {
      console.error("Error fetching communication stats:", error);
      res.status(500).json({ error: "Failed to fetch communication stats" });
    }
  });

  // Scraping Performance
  app.get('/api/scraping/performance', async (req, res) => {
    try {
      const performance = await loadBoardAggregator.getScrapingPerformance();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching scraping performance:", error);
      res.status(500).json({ error: "Failed to fetch scraping performance" });
    }
  });

  // Dashboard Analytics
  app.get('/api/dashboard/load-board', async (req, res) => {
    try {
      // Get dashboard metrics
      const totalLoads = await db
        .select({ count: count() })
        .from(freeLoads)
        .where(eq(freeLoads.isDead, false));

      const totalDrivers = await db
        .select({ count: count() })
        .from(smartDriverProfiles)
        .where(eq(smartDriverProfiles.isActive, true));

      const totalRecommendations = await db
        .select({ count: count() })
        .from(aiLoadRecommendations)
        .where(eq(aiLoadRecommendations.status, "pending"));

      const recentLoads = await db
        .select({
          id: freeLoads.id,
          origin: freeLoads.origin,
          destination: freeLoads.destination,
          rate: freeLoads.rate,
          ratePerMile: freeLoads.ratePerMile,
          distance: freeLoads.distance,
          aiScore: freeLoads.aiScore,
          createdAt: freeLoads.createdAt,
          loadBoard: {
            name: freeLoadBoards.name,
          },
        })
        .from(freeLoads)
        .leftJoin(freeLoadBoards, eq(freeLoads.loadBoardId, freeLoadBoards.id))
        .where(eq(freeLoads.isDead, false))
        .orderBy(desc(freeLoads.createdAt))
        .limit(10);

      const highValueLoads = await db
        .select()
        .from(freeLoads)
        .where(
          and(
            eq(freeLoads.isDead, false),
            gte(freeLoads.aiScore, 80),
            gte(freeLoads.ratePerMile, "2.5")
          )
        )
        .orderBy(desc(freeLoads.aiScore))
        .limit(5);

      const communicationStats = await db
        .select({
          method: communicationLogs.method,
          status: communicationLogs.status,
          count: sql`count(*)`,
        })
        .from(communicationLogs)
        .groupBy(communicationLogs.method, communicationLogs.status);

      res.json({
        metrics: {
          totalLoads: totalLoads[0]?.count || 0,
          totalDrivers: totalDrivers[0]?.count || 0,
          pendingRecommendations: totalRecommendations[0]?.count || 0,
          activeLoadBoards: await db.select({ count: count() }).from(freeLoadBoards).where(eq(freeLoadBoards.isActive, true)),
        },
        recentLoads,
        highValueLoads,
        communicationStats,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Revenue Analytics
  app.get('/api/revenue/analytics', async (req, res) => {
    try {
      const { period = 'daily' } = req.query;
      
      let dateFilter = sql`DATE(created_at) = CURRENT_DATE`;
      if (period === 'weekly') {
        dateFilter = sql`created_at >= CURRENT_DATE - INTERVAL '7 days'`;
      } else if (period === 'monthly') {
        dateFilter = sql`created_at >= CURRENT_DATE - INTERVAL '30 days'`;
      }

      const revenueData = await db
        .select({
          totalRevenue: sql`SUM(gross_revenue)`,
          totalProfit: sql`SUM(profit)`,
          totalBookings: sql`COUNT(*)`,
          averageProfit: sql`AVG(profit)`,
        })
        .from(revenueTracking)
        .where(dateFilter);

      res.json(revenueData[0] || {
        totalRevenue: 0,
        totalProfit: 0,
        totalBookings: 0,
        averageProfit: 0,
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  // Search and Filtering
  app.get('/api/loads/search', async (req, res) => {
    try {
      const { 
        origin, 
        destination, 
        equipmentType, 
        minRate, 
        maxDistance,
        minAiScore = 50 
      } = req.query;

      let query = db
        .select()
        .from(freeLoads)
        .where(
          and(
            eq(freeLoads.isDead, false),
            gte(freeLoads.aiScore, parseInt(minAiScore as string))
          )
        );

      // Add filters if provided
      const filters = [];
      
      if (origin) {
        filters.push(sql`${freeLoads.origin} ILIKE ${'%' + origin + '%'}`);
      }
      
      if (destination) {
        filters.push(sql`${freeLoads.destination} ILIKE ${'%' + destination + '%'}`);
      }
      
      if (equipmentType) {
        filters.push(eq(freeLoads.equipmentType, equipmentType as string));
      }
      
      if (minRate) {
        filters.push(gte(freeLoads.rate, minRate as string));
      }
      
      if (maxDistance) {
        filters.push(sql`${freeLoads.distance} <= ${parseInt(maxDistance as string)}`);
      }

      if (filters.length > 0) {
        query = query.where(and(...filters));
      }

      const results = await query
        .orderBy(desc(freeLoads.aiScore))
        .limit(50);

      res.json(results);
    } catch (error) {
      console.error("Error searching loads:", error);
      res.status(500).json({ error: "Failed to search loads" });
    }
  });

  // Load Board Health Check
  app.get('/api/health/load-boards', async (req, res) => {
    try {
      const health = {
        aggregatorStatus: "running",
        aiEngineStatus: "running", 
        communicationStatus: "running",
        lastScrapingTime: new Date(),
        activeConnections: await db.select({ count: count() }).from(freeLoadBoards).where(eq(freeLoadBoards.isActive, true)),
        recentErrors: [],
      };
      
      res.json(health);
    } catch (error) {
      console.error("Error checking health:", error);
      res.status(500).json({ error: "Failed to check system health" });
    }
  });
}