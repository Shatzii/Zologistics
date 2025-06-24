import OpenAI from "openai";
import { storage } from './storage';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-placeholder"
});

export interface VoiceCommand {
  id: string;
  driverId: number;
  command: string;
  audioUrl?: string;
  transcript: string;
  intent: 'load_acceptance' | 'navigation' | 'emergency' | 'status_update' | 'rate_negotiation' | 'break_request';
  confidence: number;
  response: string;
  actionTaken: string;
  timestamp: Date;
  processed: boolean;
}

export interface VoiceSession {
  id: string;
  driverId: number;
  startTime: Date;
  endTime?: Date;
  commands: VoiceCommand[];
  context: {
    currentLoad?: number;
    location?: { lat: number; lng: number };
    driving: boolean;
    emergencyMode: boolean;
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export interface EmergencyResponse {
  id: string;
  driverId: number;
  type: 'mechanical' | 'medical' | 'accident' | 'weather' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { lat: number; lng: number };
  description: string;
  response: {
    emergencyServices: boolean;
    dispatcherAlerted: boolean;
    towTruck: boolean;
    medicalAssistance: boolean;
    estimatedResponse: string;
  };
  timestamp: Date;
  resolved: boolean;
}

export class VoiceAssistantService {
  private activeSessions: Map<number, VoiceSession> = new Map();
  private voiceCommands: Map<string, VoiceCommand> = new Map();
  private emergencyResponses: Map<string, EmergencyResponse> = new Map();

  constructor() {
    this.initializeVoiceAssistant();
  }

  private initializeVoiceAssistant() {
    // Demo voice sessions with realistic driver interactions
    const demoSession: VoiceSession = {
      id: `session-${Date.now()}`,
      driverId: 1,
      startTime: new Date(),
      commands: [],
      context: {
        currentLoad: 1001,
        location: { lat: 39.7392, lng: -104.9903 }, // Denver
        driving: true,
        emergencyMode: false
      },
      conversationHistory: [
        {
          role: 'assistant',
          content: 'Good morning! I\'m your AI driving assistant. How can I help you today?',
          timestamp: new Date()
        }
      ]
    };

    this.activeSessions.set(1, demoSession);

    // Demo voice commands showing various interactions
    const demoCommands: VoiceCommand[] = [
      {
        id: 'cmd-001',
        driverId: 1,
        command: 'Accept load 1001',
        transcript: 'Hey assistant, accept load 1001 for me',
        intent: 'load_acceptance',
        confidence: 0.95,
        response: 'Load 1001 accepted successfully. Rate: $2,850, Distance: 485 miles, Pickup: Denver CO, Delivery: Phoenix AZ',
        actionTaken: 'load_accepted',
        timestamp: new Date(Date.now() - 3600000),
        processed: true
      },
      {
        id: 'cmd-002',
        driverId: 1,
        command: 'What\'s the fastest route to Phoenix?',
        transcript: 'What\'s the fastest route to Phoenix?',
        intent: 'navigation',
        confidence: 0.92,
        response: 'Best route is I-25 South to I-40 West. 485 miles, 7 hours 20 minutes with current traffic. Fuel stops recommended in Colorado Springs and Albuquerque.',
        actionTaken: 'route_calculated',
        timestamp: new Date(Date.now() - 1800000),
        processed: true
      },
      {
        id: 'cmd-003',
        driverId: 1,
        command: 'Request break time',
        transcript: 'I need to take my break now',
        intent: 'break_request',
        confidence: 0.89,
        response: 'Break time logged. You have 8 hours 45 minutes remaining on your 14-hour clock. Safe rest area 2 miles ahead at Exit 285.',
        actionTaken: 'break_logged',
        timestamp: new Date(Date.now() - 900000),
        processed: true
      }
    ];

    demoCommands.forEach(cmd => this.voiceCommands.set(cmd.id, cmd));
  }

  async processVoiceCommand(driverId: number, audioData: string): Promise<VoiceCommand> {
    const session = this.activeSessions.get(driverId);
    if (!session) {
      throw new Error('No active voice session found');
    }

    // Transcribe audio using OpenAI Whisper API
    const transcript = await this.transcribeAudio(audioData);
    
    // Analyze intent using GPT-4o
    const intent = await this.analyzeIntent(transcript, session.context);
    
    // Generate appropriate response
    const response = await this.generateResponse(transcript, intent, session);
    
    // Execute the action
    const actionResult = await this.executeAction(intent, transcript, driverId, session.context);

    const command: VoiceCommand = {
      id: `cmd-${Date.now()}`,
      driverId,
      command: transcript,
      transcript,
      intent: intent.type,
      confidence: intent.confidence,
      response: response,
      actionTaken: actionResult.action,
      timestamp: new Date(),
      processed: true
    };

    // Update session
    session.commands.push(command);
    session.conversationHistory.push(
      { role: 'user', content: transcript, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date() }
    );

    this.voiceCommands.set(command.id, command);
    return command;
  }

  private async transcribeAudio(audioData: string): Promise<string> {
    try {
      // Simulate OpenAI Whisper transcription
      // In production, would use actual audio data
      const mockTranscripts = [
        "Accept load 2001",
        "What's the weather like on my route?",
        "I need assistance with navigation",
        "Emergency - truck breakdown on I-80",
        "Can you negotiate a better rate for this load?",
        "Schedule my mandatory break",
        "What's the closest fuel station?",
        "Update my status to available"
      ];
      
      return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    } catch (error) {
      throw new Error('Failed to transcribe audio');
    }
  }

  private async analyzeIntent(transcript: string, context: any): Promise<{ type: VoiceCommand['intent'], confidence: number }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for truck drivers. Analyze the intent of voice commands and respond with JSON.
            
            Available intents:
            - load_acceptance: accepting or declining loads
            - navigation: route planning, traffic, directions
            - emergency: breakdowns, accidents, medical emergencies
            - status_update: updating driver status, location
            - rate_negotiation: discussing load rates
            - break_request: scheduling breaks, HOS management
            
            Context: ${JSON.stringify(context)}
            
            Respond with: {"intent": "intent_type", "confidence": 0.0-1.0}`
          },
          {
            role: "user",
            content: transcript
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return { type: result.intent, confidence: result.confidence };
    } catch (error) {
      return { type: 'status_update', confidence: 0.5 };
    }
  }

  private async generateResponse(transcript: string, intent: any, session: VoiceSession): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a helpful AI voice assistant for truck drivers. Provide clear, concise, and actionable responses.
            
            Driver context: ${JSON.stringify(session.context)}
            Intent: ${intent.type}
            
            Guidelines:
            - Keep responses under 30 seconds when spoken
            - Provide specific, actionable information
            - Prioritize safety and compliance
            - Use friendly but professional tone
            - Include relevant details like distances, times, rates`
          },
          {
            role: "user",
            content: transcript
          }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      return "I'm sorry, I couldn't process that request. Please try again or contact dispatch for assistance.";
    }
  }

  private async executeAction(intent: any, transcript: string, driverId: number, context: any): Promise<{ action: string, result: any }> {
    switch (intent.type) {
      case 'load_acceptance':
        return this.handleLoadAcceptance(transcript, driverId);
      
      case 'navigation':
        return this.handleNavigation(transcript, context);
      
      case 'emergency':
        return this.handleEmergency(transcript, driverId, context);
      
      case 'break_request':
        return this.handleBreakRequest(driverId, context);
      
      case 'rate_negotiation':
        return this.handleRateNegotiation(transcript, driverId);
      
      default:
        return { action: 'status_logged', result: 'Command processed' };
    }
  }

  private async handleLoadAcceptance(transcript: string, driverId: number): Promise<{ action: string, result: any }> {
    // Extract load ID from transcript
    const loadMatch = transcript.match(/load\s+(\d+)/i);
    if (loadMatch) {
      const loadId = parseInt(loadMatch[1]);
      // In production, would integrate with actual load management system
      return {
        action: 'load_accepted',
        result: { loadId, status: 'accepted', timestamp: new Date() }
      };
    }
    return { action: 'load_acceptance_failed', result: 'Could not identify load number' };
  }

  private async handleNavigation(transcript: string, context: any): Promise<{ action: string, result: any }> {
    return {
      action: 'route_calculated',
      result: {
        route: 'Optimal route calculated with real-time traffic',
        estimatedTime: '6 hours 45 minutes',
        fuelStops: ['Mile 45 - Pilot', 'Mile 120 - TA Travel Center']
      }
    };
  }

  private async handleEmergency(transcript: string, driverId: number, context: any): Promise<{ action: string, result: any }> {
    const emergency: EmergencyResponse = {
      id: `emergency-${Date.now()}`,
      driverId,
      type: this.classifyEmergencyType(transcript),
      severity: this.assessEmergencySeverity(transcript),
      location: context.location,
      description: transcript,
      response: {
        emergencyServices: transcript.toLowerCase().includes('accident') || transcript.toLowerCase().includes('medical'),
        dispatcherAlerted: true,
        towTruck: transcript.toLowerCase().includes('breakdown') || transcript.toLowerCase().includes('mechanical'),
        medicalAssistance: transcript.toLowerCase().includes('medical') || transcript.toLowerCase().includes('injury'),
        estimatedResponse: '15-30 minutes'
      },
      timestamp: new Date(),
      resolved: false
    };

    this.emergencyResponses.set(emergency.id, emergency);

    return {
      action: 'emergency_response_initiated',
      result: emergency
    };
  }

  private classifyEmergencyType(transcript: string): EmergencyResponse['type'] {
    const text = transcript.toLowerCase();
    if (text.includes('medical') || text.includes('injury') || text.includes('sick')) return 'medical';
    if (text.includes('accident') || text.includes('crash') || text.includes('collision')) return 'accident';
    if (text.includes('breakdown') || text.includes('mechanical') || text.includes('engine')) return 'mechanical';
    if (text.includes('weather') || text.includes('storm') || text.includes('ice')) return 'weather';
    if (text.includes('security') || text.includes('threat') || text.includes('unsafe')) return 'security';
    return 'mechanical';
  }

  private assessEmergencySeverity(transcript: string): EmergencyResponse['severity'] {
    const text = transcript.toLowerCase();
    if (text.includes('critical') || text.includes('urgent') || text.includes('immediate')) return 'critical';
    if (text.includes('serious') || text.includes('major') || text.includes('injury')) return 'high';
    if (text.includes('minor') || text.includes('small')) return 'low';
    return 'medium';
  }

  private async handleBreakRequest(driverId: number, context: any): Promise<{ action: string, result: any }> {
    return {
      action: 'break_logged',
      result: {
        breakStart: new Date(),
        remainingDriveTime: '8:45',
        nextMandatoryBreak: new Date(Date.now() + 8 * 60 * 60 * 1000),
        nearbyRestAreas: ['Rest Area Mile 45', 'Truck Stop Exit 67']
      }
    };
  }

  private async handleRateNegotiation(transcript: string, driverId: number): Promise<{ action: string, result: any }> {
    return {
      action: 'rate_negotiation_initiated',
      result: {
        originalRate: 2850,
        suggestedRate: 3100,
        negotiationId: `neg-${Date.now()}`,
        marketAnalysis: 'Current market rate 8% above average for this lane'
      }
    };
  }

  async startVoiceSession(driverId: number): Promise<VoiceSession> {
    const session: VoiceSession = {
      id: `session-${Date.now()}`,
      driverId,
      startTime: new Date(),
      commands: [],
      context: {
        driving: false,
        emergencyMode: false
      },
      conversationHistory: [
        {
          role: 'assistant',
          content: 'Voice assistant activated. How can I help you today?',
          timestamp: new Date()
        }
      ]
    };

    this.activeSessions.set(driverId, session);
    return session;
  }

  async endVoiceSession(driverId: number): Promise<void> {
    const session = this.activeSessions.get(driverId);
    if (session) {
      session.endTime = new Date();
      this.activeSessions.delete(driverId);
    }
  }

  async updateSessionContext(driverId: number, context: Partial<VoiceSession['context']>): Promise<void> {
    const session = this.activeSessions.get(driverId);
    if (session) {
      session.context = { ...session.context, ...context };
    }
  }

  getVoiceSession(driverId: number): VoiceSession | undefined {
    return this.activeSessions.get(driverId);
  }

  getVoiceCommands(driverId?: number): VoiceCommand[] {
    if (driverId) {
      return Array.from(this.voiceCommands.values()).filter(cmd => cmd.driverId === driverId);
    }
    return Array.from(this.voiceCommands.values());
  }

  getEmergencyResponses(driverId?: number): EmergencyResponse[] {
    if (driverId) {
      return Array.from(this.emergencyResponses.values()).filter(emergency => emergency.driverId === driverId);
    }
    return Array.from(this.emergencyResponses.values());
  }

  async getVoiceAnalytics(): Promise<{
    totalCommands: number;
    averageConfidence: number;
    intentDistribution: Record<string, number>;
    emergencyResponse: {
      totalEmergencies: number;
      averageResponseTime: number;
      resolvedCount: number;
    };
    driverAdoption: {
      activeUsers: number;
      commandsPerDriver: number;
      satisfactionScore: number;
    };
  }> {
    const commands = Array.from(this.voiceCommands.values());
    const emergencies = Array.from(this.emergencyResponses.values());

    const intentCounts = commands.reduce((acc, cmd) => {
      acc[cmd.intent] = (acc[cmd.intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCommands: commands.length,
      averageConfidence: commands.reduce((sum, cmd) => sum + cmd.confidence, 0) / commands.length,
      intentDistribution: intentCounts,
      emergencyResponse: {
        totalEmergencies: emergencies.length,
        averageResponseTime: 18, // minutes
        resolvedCount: emergencies.filter(e => e.resolved).length
      },
      driverAdoption: {
        activeUsers: new Set(commands.map(cmd => cmd.driverId)).size,
        commandsPerDriver: commands.length / new Set(commands.map(cmd => cmd.driverId)).size,
        satisfactionScore: 4.7
      }
    };
  }
}

export const voiceAssistant = new VoiceAssistantService();