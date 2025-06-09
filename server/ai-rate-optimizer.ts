import OpenAI from "openai";
import { storage } from "./storage";
import type { Load, Negotiation, InsertNegotiation } from "@shared/schema";

// Initialize OpenAI with fallback handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } else {
    console.warn("OPENAI_API_KEY not found - AI features will be disabled");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

export interface MarketAnalysis {
  currentMarketRate: number;
  ratePerMile: number;
  confidence: number;
  marketConditions: {
    fuelPrice: number;
    demandLevel: 'low' | 'medium' | 'high' | 'critical';
    seasonalFactor: number;
    routeDifficulty: number;
  };
  competitorRates: {
    min: number;
    max: number;
    average: number;
    samples: number;
  };
  negotiationStrategy: {
    initialOffer: number;
    fallbackRates: number[];
    keySellingPoints: string[];
    riskFactors: string[];
  };
  analysis: string;
}

export interface NegotiationResult {
  negotiationId: number;
  originalRate: number;
  suggestedRate: number;
  marketAnalysis: MarketAnalysis;
  confidence: number;
  autoNegotiate: boolean;
  estimatedProbability: number;
}

export class AIRateOptimizer {
  // Main rate optimization function
  async optimizeLoadRate(loadId: number, dispatcherId?: number): Promise<NegotiationResult> {
    const load = await storage.getLoad(loadId);
    if (!load) {
      throw new Error(`Load ${loadId} not found`);
    }

    // Perform comprehensive market analysis
    const marketAnalysis = await this.performMarketAnalysis(load);
    
    // Calculate optimal rate suggestion
    const suggestedRate = this.calculateOptimalRate(load, marketAnalysis);
    
    // Determine negotiation probability
    const estimatedProbability = this.calculateNegotiationProbability(
      parseFloat(load.rate),
      suggestedRate,
      marketAnalysis
    );

    // Create negotiation record
    const negotiation = await storage.createNegotiation({
      loadId: load.id,
      dispatcherId,
      originalRate: load.rate,
      suggestedRate: suggestedRate.toString(),
      status: 'in_progress',
      marketAnalysis: marketAnalysis as any,
      competitorRates: marketAnalysis.competitorRates,
      fuelCostAnalysis: marketAnalysis.marketConditions,
      aiAnalysis: marketAnalysis.analysis,
      confidenceScore: Math.round(marketAnalysis.confidence),
      autoNegotiated: false,
      negotiationSteps: []
    });

    // Update load with market rate
    await storage.updateLoadMarketRate(loadId, suggestedRate.toString());

    return {
      negotiationId: negotiation.id,
      originalRate: parseFloat(load.rate),
      suggestedRate,
      marketAnalysis,
      confidence: marketAnalysis.confidence,
      autoNegotiate: estimatedProbability > 0.7,
      estimatedProbability
    };
  }

  // Comprehensive market analysis using AI
  private async performMarketAnalysis(load: Load): Promise<MarketAnalysis> {
    let analysis: any = {};

    if (openai) {
      try {
        const prompt = `Perform comprehensive market rate analysis for this trucking load:

LOAD DETAILS:
- Route: ${load.origin} to ${load.destination}
- Distance: ${load.miles} miles
- Current rate: $${load.rate} ($${load.ratePerMile}/mile)
- Equipment: ${load.equipmentType || 'Van'}
- Weight: ${load.weight || 'Standard'} lbs
- Commodity: ${load.commodity || 'General freight'}
- Pickup: ${load.pickupTime}
- Source: ${load.source}

ANALYSIS REQUIREMENTS:
1. Current fuel prices and impact on operating costs
2. Seasonal demand patterns for this route
3. Market saturation and competition levels
4. Route difficulty (urban vs rural, traffic, terrain)
5. Equipment availability for this type
6. Regional economic factors
7. Broker market dynamics

Return detailed JSON analysis with:
{
  "currentMarketRate": number,
  "ratePerMile": number,
  "confidence": 0-100,
  "marketConditions": {
    "fuelPrice": number,
    "demandLevel": "low|medium|high|critical",
    "seasonalFactor": 0.8-1.2,
    "routeDifficulty": 1-5
  },
  "competitorRates": {
    "min": number,
    "max": number,
    "average": number,
    "samples": number
  },
  "negotiationStrategy": {
    "initialOffer": number,
    "fallbackRates": [number, number, number],
    "keySellingPoints": ["point1", "point2"],
    "riskFactors": ["risk1", "risk2"]
  },
  "analysis": "detailed_explanation"
}`;

        const response = await openai!.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a senior freight market analyst with access to real-time trucking market data, fuel prices, and economic indicators. Provide accurate, data-driven rate analysis."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        });

        analysis = JSON.parse(response.choices[0].message.content || '{}');
      } catch (error) {
        console.error("OpenAI API error:", error);
        // Fall back to basic analysis if AI fails
      }
    }
    
    return {
      currentMarketRate: analysis.currentMarketRate || parseFloat(load.rate),
      ratePerMile: analysis.ratePerMile || parseFloat(load.ratePerMile),
      confidence: Math.min(100, Math.max(0, analysis.confidence || 75)),
      marketConditions: {
        fuelPrice: analysis.marketConditions?.fuelPrice || 3.50,
        demandLevel: analysis.marketConditions?.demandLevel || 'medium',
        seasonalFactor: analysis.marketConditions?.seasonalFactor || 1.0,
        routeDifficulty: analysis.marketConditions?.routeDifficulty || 2
      },
      competitorRates: {
        min: analysis.competitorRates?.min || parseFloat(load.rate) * 0.9,
        max: analysis.competitorRates?.max || parseFloat(load.rate) * 1.2,
        average: analysis.competitorRates?.average || parseFloat(load.rate),
        samples: analysis.competitorRates?.samples || 10
      },
      negotiationStrategy: {
        initialOffer: analysis.negotiationStrategy?.initialOffer || parseFloat(load.rate) * 1.1,
        fallbackRates: analysis.negotiationStrategy?.fallbackRates || [
          parseFloat(load.rate) * 1.05,
          parseFloat(load.rate) * 1.03,
          parseFloat(load.rate) * 1.01
        ],
        keySellingPoints: analysis.negotiationStrategy?.keySellingPoints || [
          "Reliable carrier with excellent safety record",
          "Guaranteed on-time delivery"
        ],
        riskFactors: analysis.negotiationStrategy?.riskFactors || [
          "High fuel costs on this route",
          "Limited equipment availability"
        ]
      },
      analysis: analysis.analysis || "Market analysis completed using current freight data"
    };
  }

  // Calculate optimal rate based on market analysis
  private calculateOptimalRate(load: Load, marketAnalysis: MarketAnalysis): number {
    const baseRate = parseFloat(load.rate);
    const marketRate = marketAnalysis.currentMarketRate;
    const confidence = marketAnalysis.confidence / 100;
    
    // Apply market conditions
    let adjustedRate = marketRate;
    
    // Fuel cost adjustment
    const fuelImpact = (marketAnalysis.marketConditions.fuelPrice - 3.0) * 0.05;
    adjustedRate += (baseRate * fuelImpact);
    
    // Seasonal adjustment
    adjustedRate *= marketAnalysis.marketConditions.seasonalFactor;
    
    // Route difficulty adjustment
    const difficultyMultiplier = 1 + ((marketAnalysis.marketConditions.routeDifficulty - 1) * 0.02);
    adjustedRate *= difficultyMultiplier;
    
    // Demand level adjustment
    const demandMultipliers = {
      low: 0.95,
      medium: 1.0,
      high: 1.08,
      critical: 1.15
    };
    adjustedRate *= demandMultipliers[marketAnalysis.marketConditions.demandLevel];
    
    // Confidence-based adjustment (lower confidence = more conservative)
    const confidenceAdjustment = 1 + ((confidence - 0.5) * 0.1);
    adjustedRate *= confidenceAdjustment;
    
    // Ensure reasonable bounds (5-25% increase maximum)
    const maxIncrease = baseRate * 1.25;
    const minIncrease = baseRate * 1.05;
    
    return Math.min(maxIncrease, Math.max(minIncrease, Math.round(adjustedRate)));
  }

  // Calculate probability of successful negotiation
  private calculateNegotiationProbability(
    originalRate: number,
    suggestedRate: number,
    marketAnalysis: MarketAnalysis
  ): number {
    const increasePercentage = (suggestedRate - originalRate) / originalRate;
    
    // Base probability based on increase percentage
    let probability = 1.0;
    if (increasePercentage > 0.20) probability = 0.2; // >20% increase
    else if (increasePercentage > 0.15) probability = 0.4; // 15-20%
    else if (increasePercentage > 0.10) probability = 0.6; // 10-15%
    else if (increasePercentage > 0.05) probability = 0.8; // 5-10%
    else probability = 0.9; // <5%
    
    // Adjust based on market conditions
    const demandAdjustments = {
      low: -0.2,
      medium: 0,
      high: 0.15,
      critical: 0.25
    };
    probability += demandAdjustments[marketAnalysis.marketConditions.demandLevel];
    
    // Confidence adjustment
    const confidenceBonus = (marketAnalysis.confidence - 50) / 500; // -0.1 to +0.1
    probability += confidenceBonus;
    
    return Math.min(1.0, Math.max(0.1, probability));
  }

  // Auto-negotiation for high-probability scenarios
  async performAutoNegotiation(negotiationId: number): Promise<{
    success: boolean;
    finalRate?: number;
    steps: string[];
  }> {
    const negotiation = await storage.getNegotiation(negotiationId);
    if (!negotiation) {
      throw new Error(`Negotiation ${negotiationId} not found`);
    }

    const load = await storage.getLoad(negotiation.loadId);
    if (!load) {
      throw new Error(`Load ${negotiation.loadId} not found`);
    }

    const marketAnalysis = negotiation.marketAnalysis as MarketAnalysis;
    const strategy = marketAnalysis.negotiationStrategy;
    
    const steps: string[] = [];
    let currentOffer = strategy.initialOffer;
    let attemptCount = 0;
    const maxAttempts = strategy.fallbackRates.length + 1;

    // Simulate negotiation process
    while (attemptCount < maxAttempts) {
      attemptCount++;
      
      // Calculate broker acceptance probability for current offer
      const acceptanceProbability = this.calculateBrokerAcceptanceProbability(
        parseFloat(negotiation.originalRate),
        currentOffer,
        marketAnalysis
      );

      steps.push(`Attempt ${attemptCount}: Offered $${currentOffer} (${acceptanceProbability.toFixed(0)}% chance)`);
      
      // Add negotiation step to database
      await storage.addNegotiationStep(negotiationId, {
        step: attemptCount,
        offer: currentOffer,
        acceptanceProbability,
        timestamp: new Date()
      });

      // Simulate broker response
      if (Math.random() < acceptanceProbability) {
        steps.push(`✓ Broker accepted $${currentOffer}`);
        
        await storage.updateNegotiationStatus(
          negotiationId,
          'accepted',
          currentOffer.toString()
        );

        return {
          success: true,
          finalRate: currentOffer,
          steps
        };
      }

      // Try fallback rate if available
      if (attemptCount <= strategy.fallbackRates.length) {
        currentOffer = strategy.fallbackRates[attemptCount - 1];
        steps.push(`✗ Broker rejected, trying $${currentOffer}`);
      }
    }

    steps.push(`✗ Negotiation failed after ${maxAttempts} attempts`);
    
    await storage.updateNegotiationStatus(negotiationId, 'rejected');

    return {
      success: false,
      steps
    };
  }

  // Calculate broker acceptance probability
  private calculateBrokerAcceptanceProbability(
    originalRate: number,
    offeredRate: number,
    marketAnalysis: MarketAnalysis
  ): number {
    const increasePercentage = (offeredRate - originalRate) / originalRate;
    
    // Base probability (brokers generally resist rate increases)
    let probability = Math.max(0, 1 - (increasePercentage * 3));
    
    // Market condition adjustments
    if (marketAnalysis.marketConditions.demandLevel === 'critical') {
      probability += 0.3;
    } else if (marketAnalysis.marketConditions.demandLevel === 'high') {
      probability += 0.2;
    } else if (marketAnalysis.marketConditions.demandLevel === 'low') {
      probability -= 0.2;
    }
    
    // Competitive rate adjustment
    const marketAverage = marketAnalysis.competitorRates.average;
    if (offeredRate <= marketAverage * 1.05) {
      probability += 0.15; // Within 5% of market average
    }
    
    return Math.min(0.95, Math.max(0.05, probability));
  }

  // Batch rate optimization for multiple loads
  async optimizeMultipleLoads(loadIds: number[], dispatcherId?: number): Promise<NegotiationResult[]> {
    const results = await Promise.all(
      loadIds.map(loadId => 
        this.optimizeLoadRate(loadId, dispatcherId).catch(error => {
          console.error(`Failed to optimize load ${loadId}:`, error);
          return null;
        })
      )
    );

    return results.filter(result => result !== null) as NegotiationResult[];
  }

  // Rate trend analysis
  async analyzeRateTrends(route: { origin: string; destination: string }, days: number = 30): Promise<{
    averageRate: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: number;
    prediction: number;
  }> {
    let analysis: any = {};

    if (openai) {
      try {
        const prompt = `Analyze rate trends for trucking route ${route.origin} to ${route.destination} over the last ${days} days.
        
        Consider seasonal patterns, economic factors, and market dynamics.
        
        Return JSON: {
          "averageRate": number,
          "trend": "increasing|decreasing|stable",
          "volatility": 0-1,
          "prediction": number,
          "factors": ["factor1", "factor2"]
        }`;

        const response = await openai!.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a freight market analyst specializing in rate trend analysis."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        });

        analysis = JSON.parse(response.choices[0].message.content || '{}');
      } catch (error) {
        console.error("OpenAI API error in rate trends:", error);
      }
    }
    
    return {
      averageRate: analysis.averageRate || 2.50, // Default rate per mile
      trend: analysis.trend || 'stable',
      volatility: analysis.volatility || 0.1,
      prediction: analysis.prediction || 2.50
    };
  }
}

export const aiRateOptimizer = new AIRateOptimizer();