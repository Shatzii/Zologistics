import OpenAI from "openai";

// Initialize OpenAI with fallback handling
let openai: OpenAI | null = null;
try {
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({ 
      apiKey: import.meta.env.VITE_OPENAI_API_KEY
    });
  } else {
    console.warn("VITE_OPENAI_API_KEY not found - AI features will be disabled on client");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client on client:", error);
}

// Rate negotiation analysis
export async function analyzeRateNegotiation(loadData: {
  origin: string;
  destination: string;
  miles: number;
  currentRate: number;
  ratePerMile: number;
  pickupTime: string;
}) {
  if (!openai) {
    throw new Error("OpenAI API key is required for rate negotiation analysis. Please configure VITE_OPENAI_API_KEY.");
  }

  try {
    const prompt = `Analyze this trucking load for rate negotiation:
    - Route: ${loadData.origin} to ${loadData.destination}
    - Distance: ${loadData.miles} miles
    - Current rate: $${loadData.currentRate} ($${loadData.ratePerMile}/mile)
    - Pickup time: ${loadData.pickupTime}
    
    Consider current market conditions, fuel prices, and seasonal demand.
    Provide a JSON response with:
    - suggestedRate: number (total rate)
    - suggestedRatePerMile: number
    - increasePercentage: number
    - confidence: number (0-100)
    - analysis: string (brief explanation)`;

    const response = await openai!.chat.completions.create({
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

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    throw new Error("Failed to analyze rate negotiation: " + error);
  }
}

// Driver-load matching
export async function analyzeDriverLoadMatch(driverPreferences: any, loadData: any) {
  if (!openai) {
    throw new Error("OpenAI API key is required for driver-load matching. Please configure VITE_OPENAI_API_KEY.");
  }

  try {
    const prompt = `Analyze compatibility between this driver and load:
    
    Driver preferences: ${JSON.stringify(driverPreferences)}
    Load details: ${JSON.stringify(loadData)}
    
    Provide a JSON response with:
    - matchScore: number (0-100)
    - reasons: array of strings explaining the match
    - concerns: array of potential issues
    - recommendation: string summary`;

    const response = await openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI dispatcher that matches drivers with loads based on preferences and efficiency."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    throw new Error("Failed to analyze driver-load match: " + error);
  }
}