import OpenAI from "openai";
import { storage } from "./storage";
import type { InsertLoad, InsertScrapingSession } from "@shared/schema";

// Initialize OpenAI with fallback handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } else {
    console.warn("OPENAI_API_KEY not found - AI market analysis will be disabled");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client in loadboard scraper:", error);
}

export interface LoadBoardCredentials {
  datApiKey?: string;
  truckstopUsername?: string;
  truckstopPassword?: string;
  loadBoard123Token?: string;
}

export interface ScrapedLoadData {
  externalId: string;
  origin: string;
  destination: string;
  miles: number;
  rate: string;
  ratePerMile: string;
  pickupTime: Date;
  source: 'DAT' | 'Truckstop' | '123LoadBoard';
  equipmentType?: string;
  weight?: number;
  commodity?: string;
  brokerInfo?: any;
  sourceUrl?: string;
}

export class LoadBoardScraper {
  private credentials: LoadBoardCredentials;

  constructor(credentials: LoadBoardCredentials) {
    this.credentials = credentials;
  }

  // DAT Power API Integration
  async scrapeDATLoads(): Promise<ScrapedLoadData[]> {
    const sessionId = await this.createSession('DAT');
    
    try {
      if (!this.credentials.datApiKey) {
        throw new Error('DAT API key not configured');
      }

      // DAT Power API endpoint for load search
      const response = await fetch('https://power.dat.com/api/v2/loads/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.datApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup: { radius: 100 },
          delivery: { radius: 100 },
          equipment: ['V', 'R', 'F'], // Van, Reefer, Flatbed
          loadSize: 'FULL',
          maxResults: 50
        })
      });

      if (!response.ok) {
        throw new Error(`DAT API error: ${response.status}`);
      }

      const data = await response.json();
      const loads = this.transformDATData(data.loads || []);
      
      await this.updateSession(sessionId, {
        status: 'completed',
        loadsFound: loads.length,
        completedAt: new Date()
      });

      return loads;
    } catch (error) {
      await this.updateSession(sessionId, {
        status: 'failed',
        errors: { message: error instanceof Error ? error.message : String(error) },
        completedAt: new Date()
      });
      throw error;
    }
  }

  // Truckstop.com scraping (web scraping approach)
  async scrapeTruckstopLoads(): Promise<ScrapedLoadData[]> {
    const sessionId = await this.createSession('Truckstop');
    
    try {
      // Note: This would require Puppeteer for real implementation
      // For now, implementing the structure for API-based approach
      
      const response = await fetch('https://api.truckstop.com/loadboard/loads', {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.credentials.truckstopUsername}:${this.credentials.truckstopPassword}`).toString('base64')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Truckstop API error: ${response.status}`);
      }

      const data = await response.json();
      const loads = this.transformTruckstopData(data.results || []);
      
      await this.updateSession(sessionId, {
        status: 'completed',
        loadsFound: loads.length,
        completedAt: new Date()
      });

      return loads;
    } catch (error) {
      await this.updateSession(sessionId, {
        status: 'failed',
        errors: { message: error instanceof Error ? error.message : String(error) },
        completedAt: new Date()
      });
      return []; // Return empty array for failed scraping
    }
  }

  // 123LoadBoard API integration
  async scrape123LoadBoardLoads(): Promise<ScrapedLoadData[]> {
    const sessionId = await this.createSession('123LoadBoard');
    
    try {
      if (!this.credentials.loadBoard123Token) {
        throw new Error('123LoadBoard token not configured');
      }

      const response = await fetch('https://api.123loadboard.com/v2/loads', {
        headers: {
          'Authorization': `Bearer ${this.credentials.loadBoard123Token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`123LoadBoard API error: ${response.status}`);
      }

      const data = await response.json();
      const loads = this.transform123LoadBoardData(data.loads || []);
      
      await this.updateSession(sessionId, {
        status: 'completed',
        loadsFound: loads.length,
        completedAt: new Date()
      });

      return loads;
    } catch (error) {
      await this.updateSession(sessionId, {
        status: 'failed',
        errors: { message: error instanceof Error ? error.message : String(error) },
        completedAt: new Date()
      });
      return [];
    }
  }

  // Master scraping function
  async scrapeAllLoadBoards(): Promise<ScrapedLoadData[]> {
    const results = await Promise.allSettled([
      this.scrapeDATLoads(),
      this.scrapeTruckstopLoads(),
      this.scrape123LoadBoardLoads()
    ]);

    const allLoads: ScrapedLoadData[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allLoads.push(...result.value);
      } else {
        console.error(`Load board ${index} failed:`, result.reason);
      }
    });

    return this.deduplicateLoads(allLoads);
  }

  // AI-powered load analysis and matching
  async analyzeAndCalculateMatchScores(loads: ScrapedLoadData[], driverPreferences: any[]): Promise<ScrapedLoadData[]> {
    const enhancedLoads = await Promise.all(
      loads.map(async (load) => {
        try {
          // Calculate market rate using AI
          const marketAnalysis = await this.calculateMarketRate(load);
          
          // Calculate match scores for each driver
          const matchScores = await Promise.all(
            driverPreferences.map(driver => this.calculateDriverMatch(load, driver))
          );
          
          const bestMatchScore = Math.max(...matchScores.map(m => m.score));
          
          return {
            ...load,
            marketRate: marketAnalysis.marketRate,
            matchScore: bestMatchScore,
            aiAnalysis: marketAnalysis.analysis
          };
        } catch (error) {
          console.error('AI analysis failed for load:', load.externalId, error);
          return load;
        }
      })
    );

    return enhancedLoads;
  }

  // AI market rate calculation
  private async calculateMarketRate(load: ScrapedLoadData): Promise<{ marketRate: string; analysis: string }> {
    if (!openai) {
      return {
        marketRate: load.rate,
        analysis: "Basic market analysis (AI unavailable)"
      };
    }

    try {
      const prompt = `Analyze this trucking load and calculate the fair market rate:
      - Route: ${load.origin} to ${load.destination}
      - Distance: ${load.miles} miles
      - Current rate: $${load.rate} ($${load.ratePerMile}/mile)
      - Equipment: ${load.equipmentType || 'Van'}
      - Weight: ${load.weight || 'Unknown'} lbs
      - Commodity: ${load.commodity || 'General freight'}
      
      Consider current fuel prices, seasonal demand, route difficulty, and market conditions.
      Return JSON with: { "marketRate": "total_amount", "ratePerMile": "per_mile_rate", "analysis": "brief_explanation", "confidence": 0-100 }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a trucking market rate analyst with access to current market data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        marketRate: result.marketRate || load.rate,
        analysis: result.analysis || "AI market analysis completed"
      };
    } catch (error) {
      console.error("OpenAI API error in market rate calculation:", error);
      return {
        marketRate: load.rate,
        analysis: "Market analysis failed, using current rate"
      };
    }
  }

  // AI driver-load matching
  private async calculateDriverMatch(load: ScrapedLoadData, driver: any): Promise<{ score: number; reasoning: string }> {
    if (!openai) {
      return {
        score: 70,
        reasoning: "Basic compatibility match (AI unavailable)"
      };
    }

    try {
      const prompt = `Calculate compatibility score (0-100) between this driver and load:
      
      Driver: ${JSON.stringify(driver.preferences || {})}
      Current location: ${driver.currentLocation}
      
      Load: Route ${load.origin} to ${load.destination}, ${load.miles} miles, $${load.ratePerMile}/mile
      Equipment: ${load.equipmentType || 'Van'}
      
      Consider distance from pickup, route preferences, equipment type, and rate expectations.
      Return JSON: { "score": 0-100, "reasoning": "explanation", "concerns": ["list"], "benefits": ["list"] }`;

      const response = await openai!.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI dispatcher expert at optimal driver-load matching."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        score: result.score || 70,
        reasoning: result.reasoning || "AI compatibility analysis completed"
      };
    } catch (error) {
      console.error("OpenAI API error in driver matching:", error);
      return {
        score: 70,
        reasoning: "Driver matching failed, using default score"
      };
    }
  }

  // Data transformation functions
  private transformDATData(datLoads: any[]): ScrapedLoadData[] {
    return datLoads.map(load => ({
      externalId: `DAT-${load.loadId}`,
      origin: `${load.pickup.city}, ${load.pickup.state}`,
      destination: `${load.delivery.city}, ${load.delivery.state}`,
      miles: load.miles || 0,
      rate: load.rate?.toString() || "0",
      ratePerMile: load.ratePerMile?.toString() || "0",
      pickupTime: new Date(load.pickupDate),
      source: 'DAT' as const,
      equipmentType: load.equipmentType,
      weight: load.weight,
      commodity: load.commodity,
      brokerInfo: {
        name: load.broker?.name,
        phone: load.broker?.phone,
        email: load.broker?.email
      },
      sourceUrl: `https://power.dat.com/load/${load.loadId}`
    }));
  }

  private transformTruckstopData(truckstopLoads: any[]): ScrapedLoadData[] {
    return truckstopLoads.map(load => ({
      externalId: `TS-${load.id}`,
      origin: load.origin,
      destination: load.destination,
      miles: load.miles || 0,
      rate: load.rate?.toString() || "0",
      ratePerMile: load.ratePerMile?.toString() || "0",
      pickupTime: new Date(load.pickupDate),
      source: 'Truckstop' as const,
      equipmentType: load.equipment,
      weight: load.weight,
      commodity: load.commodity,
      sourceUrl: load.url
    }));
  }

  private transform123LoadBoardData(loads123: any[]): ScrapedLoadData[] {
    return loads123.map(load => ({
      externalId: `123-${load.loadNumber}`,
      origin: `${load.pickupCity}, ${load.pickupState}`,
      destination: `${load.deliveryCity}, ${load.deliveryState}`,
      miles: load.totalMiles || 0,
      rate: load.linehaul?.toString() || "0",
      ratePerMile: load.ratePerMile?.toString() || "0",
      pickupTime: new Date(load.pickupDate),
      source: '123LoadBoard' as const,
      equipmentType: load.equipmentType,
      weight: load.weight,
      commodity: load.commodity
    }));
  }

  // Utility functions
  private deduplicateLoads(loads: ScrapedLoadData[]): ScrapedLoadData[] {
    const seen = new Set();
    return loads.filter(load => {
      const key = `${load.origin}-${load.destination}-${load.pickupTime.toISOString()}-${load.rate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async createSession(source: string): Promise<number> {
    const session = await storage.createScrapingSession({
      source,
      status: 'running'
    });
    return session.id;
  }

  private async updateSession(id: number, updates: any): Promise<void> {
    await storage.updateScrapingSession(id, updates);
  }
}

// Factory function for creating scraper with credentials
export function createLoadBoardScraper(credentials: LoadBoardCredentials): LoadBoardScraper {
  return new LoadBoardScraper(credentials);
}