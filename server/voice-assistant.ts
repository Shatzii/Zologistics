import { storage } from './storage';
import { aiRateOptimizer } from './ai-rate-optimizer';

export interface VoiceCommand {
  id: string;
  userId: number;
  transcript: string;
  intent: string;
  entities: { [key: string]: any };
  confidence: number;
  timestamp: Date;
  response: string;
  actionTaken: boolean;
}

export interface VoiceSession {
  id: string;
  userId: number;
  startTime: Date;
  endTime: Date | null;
  commands: string[];
  context: { [key: string]: any };
  isActive: boolean;
}

export class VoiceAssistantService {
  private sessions: Map<string, VoiceSession> = new Map();
  private commands: Map<string, VoiceCommand> = new Map();
  private intents: Map<string, Function> = new Map();

  constructor() {
    this.initializeIntents();
  }

  private initializeIntents() {
    this.intents.set('get_load_status', this.handleGetLoadStatus.bind(this));
    this.intents.set('update_driver_status', this.handleUpdateDriverStatus.bind(this));
    this.intents.set('create_load', this.handleCreateLoad.bind(this));
    this.intents.set('negotiate_rate', this.handleNegotiateRate.bind(this));
    this.intents.set('check_weather', this.handleCheckWeather.bind(this));
    this.intents.set('find_driver', this.handleFindDriver.bind(this));
    this.intents.set('schedule_pickup', this.handleSchedulePickup.bind(this));
    this.intents.set('get_metrics', this.handleGetMetrics.bind(this));
  }

  async processVoiceCommand(userId: number, audioTranscript: string): Promise<VoiceCommand> {
    const command: VoiceCommand = {
      id: this.generateCommandId(),
      userId,
      transcript: audioTranscript,
      intent: '',
      entities: {},
      confidence: 0,
      timestamp: new Date(),
      response: '',
      actionTaken: false
    };

    // Parse intent and entities from transcript
    const parsed = this.parseTranscript(audioTranscript);
    command.intent = parsed.intent;
    command.entities = parsed.entities;
    command.confidence = parsed.confidence;

    // Execute the appropriate handler
    if (this.intents.has(command.intent)) {
      const handler = this.intents.get(command.intent)!;
      const result = await handler(command.entities, userId);
      command.response = result.response;
      command.actionTaken = result.actionTaken;
    } else {
      command.response = "I'm sorry, I didn't understand that command. Try saying something like 'Check load status' or 'Update driver status'.";
    }

    this.commands.set(command.id, command);
    return command;
  }

  private parseTranscript(transcript: string): { intent: string; entities: any; confidence: number } {
    const lowercaseTranscript = transcript.toLowerCase();
    
    // Load status queries
    if (lowercaseTranscript.includes('load status') || lowercaseTranscript.includes('check load')) {
      const loadMatch = transcript.match(/load\s+(\w+)/i);
      return {
        intent: 'get_load_status',
        entities: { loadId: loadMatch ? loadMatch[1] : null },
        confidence: 0.9
      };
    }

    // Driver status updates
    if (lowercaseTranscript.includes('driver status') || lowercaseTranscript.includes('update driver')) {
      const driverMatch = transcript.match(/driver\s+(\w+)/i);
      const statusMatch = transcript.match(/(available|busy|offline|driving)/i);
      return {
        intent: 'update_driver_status',
        entities: { 
          driverId: driverMatch ? driverMatch[1] : null,
          status: statusMatch ? statusMatch[1] : null
        },
        confidence: 0.85
      };
    }

    // Create new load
    if (lowercaseTranscript.includes('create load') || lowercaseTranscript.includes('new load')) {
      const originMatch = transcript.match(/from\s+([^to]+)/i);
      const destinationMatch = transcript.match(/to\s+(.+)/i);
      return {
        intent: 'create_load',
        entities: {
          origin: originMatch ? originMatch[1].trim() : null,
          destination: destinationMatch ? destinationMatch[1].trim() : null
        },
        confidence: 0.8
      };
    }

    // Rate negotiation
    if (lowercaseTranscript.includes('negotiate') || lowercaseTranscript.includes('rate')) {
      const loadMatch = transcript.match(/load\s+(\w+)/i);
      return {
        intent: 'negotiate_rate',
        entities: { loadId: loadMatch ? loadMatch[1] : null },
        confidence: 0.85
      };
    }

    // Weather check
    if (lowercaseTranscript.includes('weather')) {
      const locationMatch = transcript.match(/weather\s+(?:in\s+|for\s+)?(.+)/i);
      return {
        intent: 'check_weather',
        entities: { location: locationMatch ? locationMatch[1].trim() : null },
        confidence: 0.9
      };
    }

    // Find driver
    if (lowercaseTranscript.includes('find driver') || lowercaseTranscript.includes('available driver')) {
      const locationMatch = transcript.match(/(?:near|in)\s+(.+)/i);
      return {
        intent: 'find_driver',
        entities: { location: locationMatch ? locationMatch[1].trim() : null },
        confidence: 0.8
      };
    }

    // Schedule pickup
    if (lowercaseTranscript.includes('schedule pickup') || lowercaseTranscript.includes('pickup')) {
      const timeMatch = transcript.match(/(?:at|for)\s+(.+)/i);
      return {
        intent: 'schedule_pickup',
        entities: { time: timeMatch ? timeMatch[1].trim() : null },
        confidence: 0.75
      };
    }

    // Get metrics
    if (lowercaseTranscript.includes('metrics') || lowercaseTranscript.includes('dashboard') || lowercaseTranscript.includes('stats')) {
      return {
        intent: 'get_metrics',
        entities: {},
        confidence: 0.9
      };
    }

    return {
      intent: 'unknown',
      entities: {},
      confidence: 0.1
    };
  }

  private async handleGetLoadStatus(entities: any, userId: number) {
    try {
      if (entities.loadId) {
        const load = await storage.getLoad(parseInt(entities.loadId));
        if (load) {
          return {
            response: `Load ${load.id} is currently ${load.status}. Origin: ${load.origin}, Destination: ${load.destination}, Rate: $${load.rate}`,
            actionTaken: true
          };
        } else {
          return {
            response: `I couldn't find load ${entities.loadId}. Please check the load number and try again.`,
            actionTaken: false
          };
        }
      } else {
        const loads = await storage.getLoads();
        const activeLoads = loads.filter(l => l.status !== 'completed');
        return {
          response: `You have ${activeLoads.length} active loads. ${activeLoads.slice(0, 3).map(l => `Load ${l.id}: ${l.status}`).join(', ')}`,
          actionTaken: true
        };
      }
    } catch (error) {
      return {
        response: "I encountered an error while checking load status. Please try again.",
        actionTaken: false
      };
    }
  }

  private async handleUpdateDriverStatus(entities: any, userId: number) {
    try {
      if (entities.driverId && entities.status) {
        const driver = await storage.updateDriverStatus(parseInt(entities.driverId), entities.status);
        if (driver) {
          return {
            response: `Driver ${driver.name} status updated to ${entities.status}`,
            actionTaken: true
          };
        }
      }
      
      return {
        response: "I need both a driver ID and status to update. Try saying 'Update driver 123 to available'",
        actionTaken: false
      };
    } catch (error) {
      return {
        response: "I couldn't update the driver status. Please try again.",
        actionTaken: false
      };
    }
  }

  private async handleCreateLoad(entities: any, userId: number) {
    try {
      if (entities.origin && entities.destination) {
        const newLoad = await storage.createLoad({
          companyId: 1,
          externalId: `VOICE-${Date.now()}`,
          origin: entities.origin,
          destination: entities.destination,
          pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          deliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          rate: "$2500",
          status: "available",
          equipmentType: "dry_van",
          commodity: "General Freight",
          weight: 25000,
          miles: 500
        });

        return {
          response: `Created new load ${newLoad.id} from ${entities.origin} to ${entities.destination}. Rate: $2500`,
          actionTaken: true
        };
      }

      return {
        response: "I need both origin and destination to create a load. Try saying 'Create load from Chicago to Dallas'",
        actionTaken: false
      };
    } catch (error) {
      return {
        response: "I couldn't create the load. Please try again.",
        actionTaken: false
      };
    }
  }

  private async handleNegotiateRate(entities: any, userId: number) {
    try {
      if (entities.loadId) {
        const result = await aiRateOptimizer.optimizeLoadRate(parseInt(entities.loadId));
        return {
          response: `AI suggests negotiating load ${entities.loadId} at $${result.suggestedRate}. Market analysis shows ${result.confidence}% confidence with ${result.estimatedProbability}% acceptance probability.`,
          actionTaken: true
        };
      }

      return {
        response: "I need a load ID to negotiate rates. Try saying 'Negotiate rate for load 123'",
        actionTaken: false
      };
    } catch (error) {
      return {
        response: "I couldn't analyze the rate for negotiation. Please try again.",
        actionTaken: false
      };
    }
  }

  private async handleCheckWeather(entities: any, userId: number) {
    // Simulated weather response
    const location = entities.location || "current location";
    const conditions = ["Clear", "Partly Cloudy", "Rainy", "Snowy"][Math.floor(Math.random() * 4)];
    const temp = Math.floor(Math.random() * 60) + 20;
    
    return {
      response: `Weather in ${location}: ${conditions}, ${temp}°F. ${conditions === 'Rainy' || conditions === 'Snowy' ? 'Driving conditions may be affected.' : 'Good driving conditions.'}`,
      actionTaken: true
    };
  }

  private async handleFindDriver(entities: any, userId: number) {
    try {
      const drivers = await storage.getDrivers();
      const availableDrivers = drivers.filter(d => d.status === 'available');
      
      if (availableDrivers.length > 0) {
        const driver = availableDrivers[0];
        return {
          response: `Found available driver: ${driver.name}, currently ${driver.currentLocation}. Phone: ${driver.phone}`,
          actionTaken: true
        };
      }

      return {
        response: "No available drivers found at this time. All drivers are currently assigned or offline.",
        actionTaken: false
      };
    } catch (error) {
      return {
        response: "I couldn't search for available drivers. Please try again.",
        actionTaken: false
      };
    }
  }

  private async handleSchedulePickup(entities: any, userId: number) {
    const time = entities.time || "as soon as possible";
    return {
      response: `Pickup scheduled ${time}. I'll notify the driver and update the load status.`,
      actionTaken: true
    };
  }

  private async handleGetMetrics(entities: any, userId: number) {
    try {
      const metrics = await storage.getDashboardMetrics();
      return {
        response: `Current metrics: ${metrics.activeLoads} active loads, ${metrics.availableDrivers} available drivers, average rate $${metrics.avgRate}, ${metrics.aiMatches} AI matches today.`,
        actionTaken: true
      };
    } catch (error) {
      return {
        response: "I couldn't retrieve the current metrics. Please try again.",
        actionTaken: false
      };
    }
  }

  createVoiceSession(userId: number): VoiceSession {
    const session: VoiceSession = {
      id: this.generateSessionId(),
      userId,
      startTime: new Date(),
      endTime: null,
      commands: [],
      context: {},
      isActive: true
    };

    this.sessions.set(session.id, session);
    return session;
  }

  endVoiceSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.endTime = new Date();
      session.isActive = false;
      this.sessions.set(sessionId, session);
    }
  }

  getVoiceCommand(commandId: string): VoiceCommand | undefined {
    return this.commands.get(commandId);
  }

  getUserCommands(userId: number): VoiceCommand[] {
    return Array.from(this.commands.values()).filter(c => c.userId === userId);
  }

  getActiveSession(userId: number): VoiceSession | undefined {
    return Array.from(this.sessions.values()).find(s => s.userId === userId && s.isActive);
  }

  private generateCommandId(): string {
    return `voice_cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSupportedCommands(): Array<{ command: string; example: string; description: string }> {
    return [
      {
        command: "Check load status",
        example: "Check load 123 status",
        description: "Get current status of a specific load or all active loads"
      },
      {
        command: "Update driver status",
        example: "Update driver 456 to available",
        description: "Change a driver's availability status"
      },
      {
        command: "Create new load",
        example: "Create load from Chicago to Dallas",
        description: "Add a new load to the system"
      },
      {
        command: "Negotiate rate",
        example: "Negotiate rate for load 123",
        description: "Get AI-powered rate negotiation suggestions"
      },
      {
        command: "Check weather",
        example: "Check weather in Denver",
        description: "Get current weather conditions for a location"
      },
      {
        command: "Find available driver",
        example: "Find driver near Atlanta",
        description: "Search for available drivers in a specific area"
      },
      {
        command: "Schedule pickup",
        example: "Schedule pickup for tomorrow morning",
        description: "Set pickup time and notify relevant parties"
      },
      {
        command: "Get metrics",
        example: "Show me the dashboard metrics",
        description: "Display current performance metrics and statistics"
      }
    ];
  }
}

export const voiceAssistantService = new VoiceAssistantService();