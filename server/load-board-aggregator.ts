import { db } from "./db";
import { freeLoadBoards, freeLoads, scrapingPerformance } from "@shared/schema";
import { eq, and, isNull, gte } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface LoadBoardConfig {
  name: string;
  url: string;
  tags: string[];
  description?: string;
  apiAvailable: boolean;
  scrapingDifficulty: string;
  updateFrequency: string;
}

interface ScrapedLoad {
  externalId: string;
  origin: string;
  destination: string;
  pickupDate?: Date;
  deliveryDate?: Date;
  equipmentType?: string;
  weight?: number;
  distance: number;
  rate: number;
  rateType: string;
  ratePerMile: number;
  commodity?: string;
  loadDetails?: any;
  contactInfo?: any;
  requirements?: string[];
  sourceUrl?: string;
}

export class LoadBoardAggregator {
  private loadBoards: Map<number, LoadBoardConfig> = new Map();
  private isScrapingActive = false;
  private scrapingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeLoadBoards();
    this.startContinuousScrapingSchedule();
  }

  private async initializeLoadBoards() {
    try {
      // Load configuration from JSON file
      const configPath = path.join(process.cwd(), "loadboards.json");
      const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Insert or update load boards in database
      for (const config of configData) {
        const [existingBoard] = await db
          .select()
          .from(freeLoadBoards)
          .where(eq(freeLoadBoards.name, config.name))
          .limit(1);

        if (!existingBoard) {
          const [newBoard] = await db
            .insert(freeLoadBoards)
            .values({
              name: config.name,
              url: config.url,
              tags: config.tags,
              description: config.description,
              apiAvailable: config.api_available || false,
              scrapingDifficulty: config.scraping_difficulty || "Medium",
              updateFrequency: config.update_frequency || "Every 30 minutes",
              isActive: true,
            })
            .returning();

          this.loadBoards.set(newBoard.id, {
            name: newBoard.name,
            url: newBoard.url,
            tags: newBoard.tags,
            description: newBoard.description || "",
            apiAvailable: newBoard.apiAvailable,
            scrapingDifficulty: newBoard.scrapingDifficulty || "Medium",
            updateFrequency: newBoard.updateFrequency || "Every 30 minutes",
          });
        } else {
          this.loadBoards.set(existingBoard.id, {
            name: existingBoard.name,
            url: existingBoard.url,
            tags: existingBoard.tags,
            description: existingBoard.description || "",
            apiAvailable: existingBoard.apiAvailable,
            scrapingDifficulty: existingBoard.scrapingDifficulty || "Medium",
            updateFrequency: existingBoard.updateFrequency || "Every 30 minutes",
          });
        }
      }

      console.log(`🔗 Initialized ${this.loadBoards.size} load boards for aggregation`);
    } catch (error) {
      console.error("Error initializing load boards:", error);
    }
  }

  private startContinuousScrapingSchedule() {
    // Scrape every 30 minutes
    this.scrapingInterval = setInterval(async () => {
      await this.performFullScraping();
    }, 30 * 60 * 1000);

    // Initial scraping
    setTimeout(() => this.performFullScraping(), 5000);
  }

  private async performFullScraping() {
    if (this.isScrapingActive) {
      console.log("⏳ Scraping already in progress, skipping...");
      return;
    }

    this.isScrapingActive = true;
    const sessionId = `scraping-${Date.now()}`;
    console.log(`🔍 Starting full load board scraping session: ${sessionId}`);

    let totalLoadsFound = 0;
    let totalLoadsAdded = 0;

    for (const [boardId, config] of this.loadBoards) {
      try {
        const sessionStart = new Date();
        console.log(`📋 Scraping ${config.name}...`);

        // Record scraping session start
        const [performance] = await db
          .insert(scrapingPerformance)
          .values({
            loadBoardId: boardId,
            sessionId,
            startTime: sessionStart,
            status: "running",
          })
          .returning();

        const result = await this.scrapeLoadBoard(boardId, config);
        
        totalLoadsFound += result.loadsFound;
        totalLoadsAdded += result.loadsAdded;

        // Update scraping session
        await db
          .update(scrapingPerformance)
          .set({
            endTime: new Date(),
            loadsFound: result.loadsFound,
            loadsAdded: result.loadsAdded,
            loadsUpdated: result.loadsUpdated,
            loadsDuplicated: result.loadsDuplicated,
            status: "completed",
            performance: {
              duration: Date.now() - sessionStart.getTime(),
              successRate: result.loadsFound > 0 ? result.loadsAdded / result.loadsFound : 0,
            },
          })
          .where(eq(scrapingPerformance.id, performance.id));

        // Update load board statistics
        await db
          .update(freeLoadBoards)
          .set({
            lastScraped: new Date(),
            totalLoadsScraped: result.loadsFound,
            successRate: (result.loadsFound > 0 ? (result.loadsAdded / result.loadsFound) * 100 : 0).toString(),
            updatedAt: new Date(),
          })
          .where(eq(freeLoadBoards.id, boardId));

        console.log(`✅ ${config.name}: Found ${result.loadsFound}, Added ${result.loadsAdded} new loads`);
      } catch (error) {
        console.error(`❌ Error scraping ${config.name}:`, error);
      }
    }

    console.log(`🎯 Scraping complete: ${totalLoadsFound} loads found, ${totalLoadsAdded} new loads added`);
    this.isScrapingActive = false;
  }

  private async scrapeLoadBoard(boardId: number, config: LoadBoardConfig) {
    // Simulate scraping different load boards with realistic data
    const loads = this.generateSimulatedLoads(config);
    
    let loadsAdded = 0;
    let loadsUpdated = 0;
    let loadsDuplicated = 0;

    for (const load of loads) {
      try {
        // Check if load already exists
        const [existingLoad] = await db
          .select()
          .from(freeLoads)
          .where(
            and(
              eq(freeLoads.loadBoardId, boardId),
              eq(freeLoads.externalId, load.externalId)
            )
          )
          .limit(1);

        if (existingLoad) {
          // Update existing load
          await db
            .update(freeLoads)
            .set({
              rate: load.rate,
              ratePerMile: load.ratePerMile,
              updatedAt: new Date(),
            })
            .where(eq(freeLoads.id, existingLoad.id));
          loadsUpdated++;
        } else {
          // Add new load
          const aiScore = this.calculateAIScore(load);
          const profitMargin = this.calculateProfitMargin(load);

          await db.insert(freeLoads).values({
            loadBoardId: boardId,
            externalId: load.externalId,
            origin: load.origin,
            destination: load.destination,
            pickupDate: load.pickupDate,
            deliveryDate: load.deliveryDate,
            equipmentType: load.equipmentType,
            weight: load.weight,
            distance: load.distance,
            rate: load.rate,
            rateType: load.rateType,
            ratePerMile: load.ratePerMile,
            commodity: load.commodity,
            loadDetails: load.loadDetails,
            contactInfo: load.contactInfo,
            requirements: load.requirements,
            aiScore,
            profitMargin,
            sourceUrl: load.sourceUrl,
            isProcessed: false,
          });
          loadsAdded++;
        }
      } catch (error) {
        if (error.message?.includes("duplicate")) {
          loadsDuplicated++;
        } else {
          console.error("Error processing load:", error);
        }
      }
    }

    return {
      loadsFound: loads.length,
      loadsAdded,
      loadsUpdated,
      loadsDuplicated,
    };
  }

  private generateSimulatedLoads(config: LoadBoardConfig): ScrapedLoad[] {
    const loads: ScrapedLoad[] = [];
    const loadCount = Math.floor(Math.random() * 25) + 5; // 5-30 loads per board

    const cities = [
      "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA",
      "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA", "Austin, TX",
      "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC", "San Francisco, CA",
      "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Washington, DC", "Boston, MA",
      "El Paso, TX", "Nashville, TN", "Detroit, MI", "Oklahoma City, OK", "Portland, OR",
      "Las Vegas, NV", "Memphis, TN", "Louisville, KY", "Baltimore, MD", "Milwaukee, WI"
    ];

    const equipmentTypes = ["Van", "Flatbed", "Reefer", "Step Deck", "RGN", "Conestoga"];
    const commodities = ["General Freight", "Electronics", "Food Products", "Machinery", "Steel", "Paper Products"];

    for (let i = 0; i < loadCount; i++) {
      const origin = cities[Math.floor(Math.random() * cities.length)];
      let destination = cities[Math.floor(Math.random() * cities.length)];
      while (destination === origin) {
        destination = cities[Math.floor(Math.random() * cities.length)];
      }

      const distance = Math.floor(Math.random() * 2500) + 100; // 100-2600 miles
      const baseRate = Math.random() * 3 + 1.5; // $1.50-$4.50 per mile
      const rate = Math.floor(distance * baseRate);
      const ratePerMile = parseFloat((rate / distance).toFixed(2));

      const pickupDate = new Date();
      pickupDate.setDate(pickupDate.getDate() + Math.floor(Math.random() * 7)); // Next 7 days

      const deliveryDate = new Date(pickupDate);
      deliveryDate.setDate(deliveryDate.getDate() + Math.floor(distance / 500) + 1); // Realistic delivery time

      loads.push({
        externalId: `${config.name.toLowerCase().replace(/\s+/g, "")}-${Date.now()}-${i}`,
        origin,
        destination,
        pickupDate,
        deliveryDate,
        equipmentType: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)],
        weight: Math.floor(Math.random() * 40000) + 5000, // 5k-45k lbs
        distance,
        rate,
        rateType: "flat_rate",
        ratePerMile,
        commodity: commodities[Math.floor(Math.random() * commodities.length)],
        loadDetails: {
          dimensions: {
            length: Math.floor(Math.random() * 30) + 20,
            width: Math.floor(Math.random() * 8) + 4,
            height: Math.floor(Math.random() * 8) + 4,
          },
          specialInstructions: Math.random() > 0.7 ? "Appointment required" : null,
        },
        contactInfo: {
          company: `${config.name} Broker`,
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: `broker${i}@${config.name.toLowerCase().replace(/\s+/g, "")}.com`,
        },
        requirements: Math.random() > 0.5 ? ["MC Number Required"] : [],
        sourceUrl: `${config.url}/load/${i}`,
      });
    }

    return loads;
  }

  private calculateAIScore(load: ScrapedLoad): number {
    let score = 50; // Base score

    // Rate per mile scoring
    if (load.ratePerMile >= 3.0) score += 30;
    else if (load.ratePerMile >= 2.5) score += 20;
    else if (load.ratePerMile >= 2.0) score += 10;
    else if (load.ratePerMile < 1.5) score -= 20;

    // Distance scoring (sweet spot 500-1500 miles)
    if (load.distance >= 500 && load.distance <= 1500) score += 15;
    else if (load.distance < 300) score -= 10;
    else if (load.distance > 2000) score -= 5;

    // Equipment type scoring
    if (load.equipmentType === "Van") score += 10; // Most common
    else if (load.equipmentType === "Reefer") score += 5; // Higher rates
    else if (load.equipmentType === "Flatbed") score += 5;

    // Commodity scoring
    if (load.commodity === "Electronics") score += 10; // High value
    else if (load.commodity === "Food Products") score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculateProfitMargin(load: ScrapedLoad): number {
    // Estimate costs
    const fuelCostPerMile = 0.65; // Average fuel cost
    const maintenanceCostPerMile = 0.15;
    const totalCostPerMile = fuelCostPerMile + maintenanceCostPerMile;
    
    const totalCosts = load.distance * totalCostPerMile;
    const profit = load.rate - totalCosts;
    
    return parseFloat(profit.toFixed(2));
  }

  // Public methods for API access
  async getActiveLoadBoards() {
    return await db
      .select()
      .from(freeLoadBoards)
      .where(eq(freeLoadBoards.isActive, true));
  }

  async getRecentLoads(limit = 50) {
    return await db
      .select({
        id: freeLoads.id,
        origin: freeLoads.origin,
        destination: freeLoads.destination,
        rate: freeLoads.rate,
        ratePerMile: freeLoads.ratePerMile,
        distance: freeLoads.distance,
        equipmentType: freeLoads.equipmentType,
        aiScore: freeLoads.aiScore,
        profitMargin: freeLoads.profitMargin,
        createdAt: freeLoads.createdAt,
        loadBoard: {
          name: freeLoadBoards.name,
          tags: freeLoadBoards.tags,
        },
      })
      .from(freeLoads)
      .leftJoin(freeLoadBoards, eq(freeLoads.loadBoardId, freeLoadBoards.id))
      .where(eq(freeLoads.isDead, false))
      .orderBy(freeLoads.createdAt)
      .limit(limit);
  }

  async getHighValueLoads(minRatePerMile = 2.5, minAiScore = 70) {
    return await db
      .select()
      .from(freeLoads)
      .leftJoin(freeLoadBoards, eq(freeLoads.loadBoardId, freeLoadBoards.id))
      .where(
        and(
          gte(freeLoads.ratePerMile, minRatePerMile.toString()),
          gte(freeLoads.aiScore, minAiScore),
          eq(freeLoads.isDead, false)
        )
      )
      .orderBy(freeLoads.aiScore);
  }

  async getScrapingPerformance() {
    return await db
      .select({
        loadBoard: {
          name: freeLoadBoards.name,
          tags: freeLoadBoards.tags,
          lastScraped: freeLoadBoards.lastScraped,
          totalLoadsScraped: freeLoadBoards.totalLoadsScraped,
          successRate: freeLoadBoards.successRate,
        },
        performance: scrapingPerformance,
      })
      .from(scrapingPerformance)
      .leftJoin(freeLoadBoards, eq(scrapingPerformance.loadBoardId, freeLoadBoards.id))
      .orderBy(scrapingPerformance.startTime);
  }

  destroy() {
    if (this.scrapingInterval) {
      clearInterval(this.scrapingInterval);
    }
  }
}

export const loadBoardAggregator = new LoadBoardAggregator();