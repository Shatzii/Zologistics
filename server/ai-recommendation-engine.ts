import { db } from "./db";
import { 
  smartDriverProfiles, 
  freeLoads, 
  aiLoadRecommendations, 
  aiPerformance,
  type SmartDriverProfile,
  type FreeLoad,
  type InsertAiLoadRecommendation 
} from "@shared/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { AIRateOptimizer, type MarketAnalysis } from "./ai-rate-optimizer";

interface LoadMatchFactors {
  locationMatch: number;
  equipmentMatch: number;
  rateMatch: number;
  distancePreference: number;
  lanePreference: number;
  profitability: number;
  urgency: number;
  reliability: number;
}

interface RecommendationResult {
  loadId: number;
  driverId: number;
  aiScore: number;
  profitabilityScore: number;
  estimatedProfit: number;
  reasons: string[];
  matchFactors: LoadMatchFactors;
  urgencyLevel: string;
}

export class AIRecommendationEngine {
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private rateOptimizer: AIRateOptimizer;

  constructor() {
    this.rateOptimizer = new AIRateOptimizer();
    this.startContinuousProcessing();
  }

  private startContinuousProcessing() {
    // Process recommendations every 2 minutes
    this.processingInterval = setInterval(async () => {
      await this.processNewRecommendations();
    }, 2 * 60 * 1000);

    // Initial processing
    setTimeout(() => this.processNewRecommendations(), 3000);
  }

  private async processNewRecommendations() {
    if (this.isProcessing) {
      console.log("⏳ AI recommendation processing already running...");
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log("🤖 Starting AI load recommendation processing...");

      // Get active drivers
      const activeDrivers = await db
        .select()
        .from(smartDriverProfiles)
        .where(eq(smartDriverProfiles.isActive, true));

      // Get unprocessed loads
      const unprocessedLoads = await db
        .select()
        .from(freeLoads)
        .where(
          and(
            eq(freeLoads.isProcessed, false),
            eq(freeLoads.isDead, false),
            gte(freeLoads.aiScore, 50) // Only process decent quality loads
          )
        )
        .limit(100); // Process in batches

      let recommendationsGenerated = 0;

      for (const load of unprocessedLoads) {
        const recommendations = await this.generateLoadRecommendations(load, activeDrivers);
        
        for (const rec of recommendations) {
          await this.saveRecommendation(rec);
          recommendationsGenerated++;
        }

        // Mark load as processed
        await db
          .update(freeLoads)
          .set({ 
            isProcessed: true,
            updatedAt: new Date()
          })
          .where(eq(freeLoads.id, load.id));
      }

      // Record AI performance
      await this.recordAIPerformance(
        "load_matching",
        { 
          driversCount: activeDrivers.length,
          loadsProcessed: unprocessedLoads.length,
          recommendationsGenerated 
        },
        { recommendationsGenerated },
        Date.now() - startTime
      );

      console.log(`✅ AI processing complete: ${recommendationsGenerated} recommendations generated for ${unprocessedLoads.length} loads`);
    } catch (error) {
      console.error("❌ Error in AI recommendation processing:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async generateLoadRecommendations(
    load: FreeLoad, 
    drivers: SmartDriverProfile[]
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    for (const driver of drivers) {
      const matchFactors = await this.calculateMatchFactors(load, driver);
      const aiScore = this.calculateOverallAIScore(matchFactors);
      
      // Only recommend loads with 60+ score
      if (aiScore >= 60) {
        const profitabilityScore = this.calculateProfitabilityScore(load, driver);
        const estimatedProfit = this.calculateEstimatedProfit(load, driver);
        const reasons = this.generateRecommendationReasons(matchFactors, load, driver);
        const urgencyLevel = this.determineUrgencyLevel(load, matchFactors);

        recommendations.push({
          loadId: load.id,
          driverId: driver.id,
          aiScore,
          profitabilityScore,
          estimatedProfit,
          reasons,
          matchFactors,
          urgencyLevel,
        });
      }
    }

    // Sort by AI score and return top 5 recommendations per load
    return recommendations
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 5);
  }

  private async calculateMatchFactors(load: FreeLoad, driver: SmartDriverProfile): Promise<LoadMatchFactors> {
    // Location Match (0-100)
    const locationMatch = this.calculateLocationMatch(load, driver);
    
    // Equipment Match (0-100)
    const equipmentMatch = this.calculateEquipmentMatch(load, driver);
    
    // Rate Match (0-100)
    const rateMatch = this.calculateRateMatch(load, driver);
    
    // Distance Preference (0-100)
    const distancePreference = this.calculateDistancePreference(load, driver);
    
    // Lane Preference (0-100)
    const lanePreference = this.calculateLanePreference(load, driver);
    
    // Profitability (0-100)
    const profitability = this.calculateProfitabilityMatch(load, driver);
    
    // Urgency (0-100)
    const urgency = this.calculateUrgencyMatch(load, driver);
    
    // Reliability (0-100)
    const reliability = this.calculateReliabilityMatch(load, driver);

    return {
      locationMatch,
      equipmentMatch,
      rateMatch,
      distancePreference,
      lanePreference,
      profitability,
      urgency,
      reliability,
    };
  }

  private calculateLocationMatch(load: FreeLoad, driver: SmartDriverProfile): number {
    if (!driver.currentLocation || !driver.maxRadius) return 50;

    // Simulate distance calculation (in real implementation, use geolocation API)
    const driverCity = driver.currentLocation.split(',')[0].trim();
    const loadOriginCity = load.origin.split(',')[0].trim();
    
    // Simple city match check (enhance with actual distance calculation)
    if (driverCity.toLowerCase() === loadOriginCity.toLowerCase()) return 100;
    
    // Simulate distance-based matching
    const simulatedDistance = Math.random() * driver.maxRadius;
    return Math.max(0, 100 - (simulatedDistance / driver.maxRadius) * 100);
  }

  private calculateEquipmentMatch(load: FreeLoad, driver: SmartDriverProfile): number {
    if (!load.equipmentType || !driver.equipmentTypes?.length) return 50;
    
    return driver.equipmentTypes.includes(load.equipmentType) ? 100 : 0;
  }

  private calculateRateMatch(load: FreeLoad, driver: SmartDriverProfile): number {
    if (!load.ratePerMile || !driver.minRatePerMile) return 50;
    
    const loadRate = parseFloat(load.ratePerMile.toString());
    const minRate = parseFloat(driver.minRatePerMile.toString());
    
    if (loadRate >= minRate * 1.2) return 100; // 20% above minimum
    if (loadRate >= minRate) return 80;
    if (loadRate >= minRate * 0.9) return 60; // 10% below minimum
    return 30;
  }

  private calculateDistancePreference(load: FreeLoad, driver: SmartDriverProfile): number {
    if (!load.distance) return 50;
    
    // Most drivers prefer 500-1500 mile runs
    if (load.distance >= 500 && load.distance <= 1500) return 100;
    if (load.distance >= 300 && load.distance <= 2000) return 80;
    if (load.distance < 300) return 60; // Short runs
    return 40; // Very long runs
  }

  private calculateLanePreference(load: FreeLoad, driver: SmartDriverProfile): number {
    if (!driver.preferredLanes?.length) return 50;
    
    // Check if load lane matches driver preferences
    const loadLane = `${load.origin} → ${load.destination}`;
    const reverseLoadLane = `${load.destination} → ${load.origin}`;
    
    for (const preferredLane of driver.preferredLanes) {
      if (preferredLane.includes(load.origin.split(',')[0]) || 
          preferredLane.includes(load.destination.split(',')[0])) {
        return 90;
      }
    }
    
    return 40;
  }

  private calculateProfitabilityMatch(load: FreeLoad, driver: SmartDriverProfile): number {
    if (!load.profitMargin) return 50;
    
    const profit = parseFloat(load.profitMargin.toString());
    
    if (profit >= 1000) return 100;
    if (profit >= 500) return 80;
    if (profit >= 200) return 60;
    if (profit >= 0) return 40;
    return 10; // Losing money
  }

  private calculateUrgencyMatch(load: FreeLoad, driver: SmartDriverProfile): number {
    if (!load.pickupDate) return 50;
    
    const daysUntilPickup = Math.ceil(
      (load.pickupDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilPickup <= 1) return 100; // Very urgent
    if (daysUntilPickup <= 2) return 80;  // Urgent
    if (daysUntilPickup <= 5) return 60;  // Normal
    return 40; // Future loads
  }

  private calculateReliabilityMatch(load: FreeLoad, driver: SmartDriverProfile): number {
    // Based on load board reliability and broker quality
    if (load.aiScore >= 80) return 90;
    if (load.aiScore >= 60) return 70;
    if (load.aiScore >= 40) return 50;
    return 30;
  }

  private calculateOverallAIScore(factors: LoadMatchFactors): number {
    // Weighted scoring system
    const weights = {
      locationMatch: 0.20,
      equipmentMatch: 0.15,
      rateMatch: 0.20,
      distancePreference: 0.10,
      lanePreference: 0.10,
      profitability: 0.15,
      urgency: 0.05,
      reliability: 0.05,
    };

    let totalScore = 0;
    totalScore += factors.locationMatch * weights.locationMatch;
    totalScore += factors.equipmentMatch * weights.equipmentMatch;
    totalScore += factors.rateMatch * weights.rateMatch;
    totalScore += factors.distancePreference * weights.distancePreference;
    totalScore += factors.lanePreference * weights.lanePreference;
    totalScore += factors.profitability * weights.profitability;
    totalScore += factors.urgency * weights.urgency;
    totalScore += factors.reliability * weights.reliability;

    return Math.round(totalScore);
  }

  private calculateProfitabilityScore(load: FreeLoad, driver: SmartDriverProfile): number {
    const estimatedProfit = this.calculateEstimatedProfit(load, driver);
    
    if (estimatedProfit >= 1500) return 100;
    if (estimatedProfit >= 1000) return 90;
    if (estimatedProfit >= 500) return 70;
    if (estimatedProfit >= 200) return 50;
    if (estimatedProfit >= 0) return 30;
    return 10;
  }

  private async calculateEstimatedProfit(load: FreeLoad, driver: SmartDriverProfile): Promise<number> {
    if (!load.rate || !load.distance) return 0;
    
    let revenue = parseFloat(load.rate.toString());
    
    // Use AI rate optimizer to get better rate if possible
    try {
      const loadData = {
        id: load.id,
        origin: load.origin,
        destination: load.destination,
        rate: revenue,
        distance: load.distance,
        equipmentType: load.equipmentType,
        pickupDate: load.pickupDate?.toISOString() || new Date().toISOString(),
        deliveryDate: load.deliveryDate?.toISOString() || new Date().toISOString()
      };
      
      const negotiationResult = await this.rateOptimizer.analyzeAndNegotiate(loadData as any);
      if (negotiationResult && negotiationResult.suggestedRate > revenue) {
        revenue = negotiationResult.suggestedRate;
      }
    } catch (error) {
      console.log("Rate optimization failed, using original rate");
    }
    
    // Estimate costs
    const fuelCostPerMile = 0.65;
    const maintenanceCostPerMile = 0.15;
    const driverPayPerMile = 0.55; // If company driver
    const totalCostPerMile = fuelCostPerMile + maintenanceCostPerMile + driverPayPerMile;
    
    const totalCosts = load.distance * totalCostPerMile;
    const profit = revenue - totalCosts;
    
    return Math.round(profit);
  }

  private generateRecommendationReasons(
    factors: LoadMatchFactors, 
    load: FreeLoad, 
    driver: SmartDriverProfile
  ): string[] {
    const reasons: string[] = [];
    
    if (factors.locationMatch >= 80) {
      reasons.push("Close to your current location - minimal deadhead");
    }
    
    if (factors.equipmentMatch === 100) {
      reasons.push("Perfect equipment match for your truck");
    }
    
    if (factors.rateMatch >= 90) {
      reasons.push("Excellent rate - above your minimum requirements");
    }
    
    if (factors.profitability >= 80) {
      reasons.push("High profit potential - great earning opportunity");
    }
    
    if (factors.distancePreference >= 80) {
      reasons.push("Ideal distance for good revenue and quick turnaround");
    }
    
    if (factors.lanePreference >= 80) {
      reasons.push("Matches your preferred lanes and routes");
    }
    
    if (factors.urgency >= 80) {
      reasons.push("Urgent load - premium rates for quick pickup");
    }
    
    if (load.ratePerMile && parseFloat(load.ratePerMile.toString()) >= 3.0) {
      reasons.push("Premium rate - $3.00+ per mile");
    }
    
    return reasons.slice(0, 4); // Limit to top 4 reasons
  }

  private determineUrgencyLevel(load: FreeLoad, factors: LoadMatchFactors): string {
    if (factors.urgency >= 90 && factors.rateMatch >= 80) return "urgent";
    if (factors.urgency >= 70 || factors.profitability >= 90) return "high";
    if (factors.rateMatch >= 70) return "normal";
    return "low";
  }

  private async saveRecommendation(recommendation: RecommendationResult) {
    const recommendationData: InsertAiLoadRecommendation = {
      driverId: recommendation.driverId,
      loadId: recommendation.loadId,
      aiScore: recommendation.aiScore,
      profitabilityScore: recommendation.profitabilityScore,
      reasons: recommendation.reasons,
      matchFactors: recommendation.matchFactors,
      estimatedProfit: recommendation.estimatedProfit.toString(),
      fuelCosts: this.calculateFuelCosts(recommendation.loadId).toString(),
      tollCosts: this.calculateTollCosts(recommendation.loadId).toString(),
      deadheadMiles: await this.calculateDeadheadMiles(recommendation.loadId, recommendation.driverId),
      totalMiles: await this.calculateTotalMiles(recommendation.loadId, recommendation.driverId),
      hoursToComplete: this.calculateHoursToComplete(recommendation.loadId).toString(),
      urgencyLevel: recommendation.urgencyLevel,
      status: "pending",
    };

    await db.insert(aiLoadRecommendations).values(recommendationData);
  }

  private calculateFuelCosts(loadId: number): number {
    // Simplified fuel cost calculation
    return Math.round(Math.random() * 500 + 200); // $200-$700
  }

  private calculateTollCosts(loadId: number): number {
    // Simplified toll cost calculation
    return Math.round(Math.random() * 100 + 20); // $20-$120
  }

  private async calculateDeadheadMiles(loadId: number, driverId: number): Promise<number> {
    // Simplified deadhead calculation
    return Math.round(Math.random() * 200 + 10); // 10-210 miles
  }

  private async calculateTotalMiles(loadId: number, driverId: number): Promise<number> {
    const load = await db.select().from(freeLoads).where(eq(freeLoads.id, loadId)).limit(1);
    const deadhead = await this.calculateDeadheadMiles(loadId, driverId);
    return (load[0]?.distance || 0) + deadhead;
  }

  private calculateHoursToComplete(loadId: number): number {
    // Simplified time calculation (includes driving, loading, unloading)
    return parseFloat((Math.random() * 24 + 8).toFixed(1)); // 8-32 hours
  }

  private async recordAIPerformance(
    modelType: string,
    inputData: any,
    outputData: any,
    processingTime: number
  ) {
    await db.insert(aiPerformance).values({
      modelType,
      inputData,
      outputData,
      processingTime,
      accuracyScore: "85.5", // Simulated accuracy
    });
  }

  // Public API methods
  async getDriverRecommendations(driverId: number, limit = 10) {
    return await db
      .select({
        recommendation: aiLoadRecommendations,
        load: freeLoads,
      })
      .from(aiLoadRecommendations)
      .leftJoin(freeLoads, eq(aiLoadRecommendations.loadId, freeLoads.id))
      .where(
        and(
          eq(aiLoadRecommendations.driverId, driverId),
          eq(aiLoadRecommendations.status, "pending")
        )
      )
      .orderBy(desc(aiLoadRecommendations.aiScore))
      .limit(limit);
  }

  async getHighValueRecommendations(minAiScore = 80, minProfitability = 70) {
    return await db
      .select({
        recommendation: aiLoadRecommendations,
        load: freeLoads,
        driver: smartDriverProfiles,
      })
      .from(aiLoadRecommendations)
      .leftJoin(freeLoads, eq(aiLoadRecommendations.loadId, freeLoads.id))
      .leftJoin(smartDriverProfiles, eq(aiLoadRecommendations.driverId, smartDriverProfiles.id))
      .where(
        and(
          gte(aiLoadRecommendations.aiScore, minAiScore),
          gte(aiLoadRecommendations.profitabilityScore, minProfitability),
          eq(aiLoadRecommendations.status, "pending")
        )
      )
      .orderBy(desc(aiLoadRecommendations.aiScore));
  }

  async markRecommendationViewed(recommendationId: number) {
    await db
      .update(aiLoadRecommendations)
      .set({
        viewedAt: new Date(),
        status: "viewed",
      })
      .where(eq(aiLoadRecommendations.id, recommendationId));
  }

  async markRecommendationClicked(recommendationId: number) {
    await db
      .update(aiLoadRecommendations)
      .set({
        clickedAt: new Date(),
        status: "clicked",
      })
      .where(eq(aiLoadRecommendations.id, recommendationId));
  }

  async markRecommendationBooked(recommendationId: number) {
    await db
      .update(aiLoadRecommendations)
      .set({
        bookedAt: new Date(),
        status: "booked",
      })
      .where(eq(aiLoadRecommendations.id, recommendationId));
  }

  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();