import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "default_key"
});

// Rate negotiation analysis
export async function analyzeRateNegotiation(loadData: {
  origin: string;
  destination: string;
  miles: number;
  currentRate: number;
  ratePerMile: number;
  pickupTime: string;
}) {
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

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    throw new Error("Failed to analyze rate negotiation: " + error);
  }
}

// Driver-load matching
export async function analyzeDriverLoadMatch(driverPreferences: any, loadData: any) {
  try {
    const prompt = `Analyze compatibility between this driver and load:
    
    Driver preferences: ${JSON.stringify(driverPreferences)}
    Load details: ${JSON.stringify(loadData)}
    
    Provide a JSON response with:
    - matchScore: number (0-100)
    - reasoning: string
    - concerns: string[]
    - benefits: string[]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an AI dispatcher expert at matching drivers with optimal loads based on preferences and efficiency."
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
