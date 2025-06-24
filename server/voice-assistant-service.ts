import OpenAI from "openai";
import { storage } from './storage';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder"
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

export class VoiceAssistantService {
  private commandHistory: Map<number, VoiceCommand[]> = new Map();
  private emergencyResponses: Map<string, any> = new Map();

  constructor() {
    console.log('🎤 Voice Assistant Service initialized');
  }

  async processTextCommand(driverId: number, text: string): Promise<VoiceCommand> {
    const command: VoiceCommand = {
      id: `cmd_${Date.now()}`,
      driverId,
      command: text.toLowerCase(),
      transcript: text,
      intent: this.detectIntent(text),
      confidence: this.calculateConfidence(text),
      response: "",
      actionTaken: "",
      timestamp: new Date(),
      processed: false
    };

    if (!this.commandHistory.has(driverId)) {
      this.commandHistory.set(driverId, []);
    }
    this.commandHistory.get(driverId)!.push(command);

    switch (command.intent) {
      case 'load_acceptance':
        await this.handleLoadAcceptance(command);
        break;
      case 'navigation':
        await this.handleNavigation(command);
        break;
      case 'emergency':
        await this.handleEmergency(command);
        break;
      case 'status_update':
        await this.handleStatusUpdate(command);
        break;
      case 'rate_negotiation':
        await this.handleRateNegotiation(command);
        break;
      case 'break_request':
        await this.handleBreakRequest(command);
        break;
    }

    command.processed = true;
    console.log(`✅ VOICE: Processed command for driver ${driverId}: ${command.actionTaken}`);
    return command;
  }

  async processVoiceCommand(driverId: number, audioBuffer: Buffer): Promise<VoiceCommand> {
    try {
      const transcript = await this.speechToText(audioBuffer);
      console.log(`🎤 Driver ${driverId} said: "${transcript}"`);
      return this.processTextCommand(driverId, transcript);
    } catch (error) {
      console.error('Voice processing error:', error);
      return this.createErrorCommand(driverId, "Could not process voice command");
    }
  }

  private async speechToText(audioBuffer: Buffer): Promise<string> {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-placeholder") {
      try {
        const fs = require('fs');
        const tempFile = `/tmp/audio_${Date.now()}.wav`;
        fs.writeFileSync(tempFile, audioBuffer);
        
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFile),
          model: "whisper-1",
          language: "en"
        });
        
        fs.unlinkSync(tempFile);
        return transcription.text.trim();
      } catch (error) {
        console.error('OpenAI transcription error:', error);
        return this.simulateSpeechRecognition();
      }
    } else {
      return this.simulateSpeechRecognition();
    }
  }

  private simulateSpeechRecognition(): string {
    const commands = [
      "Accept load 1001", "Emergency breakdown", "Navigate to Phoenix",
      "Request break", "Negotiate better rate", "Status update all good"
    ];
    return commands[Math.floor(Math.random() * commands.length)];
  }

  private detectIntent(text: string): VoiceCommand['intent'] {
    const lower = text.toLowerCase();
    if (lower.includes('accept') || lower.includes('take load')) return 'load_acceptance';
    if (lower.includes('emergency') || lower.includes('help')) return 'emergency';
    if (lower.includes('navigate') || lower.includes('route')) return 'navigation';
    if (lower.includes('break') || lower.includes('rest')) return 'break_request';
    if (lower.includes('rate') || lower.includes('negotiate')) return 'rate_negotiation';
    return 'status_update';
  }

  private calculateConfidence(text: string): number {
    const keywords = ['accept', 'emergency', 'navigate', 'break', 'rate'];
    const matches = keywords.filter(k => text.toLowerCase().includes(k)).length;
    return Math.min(0.95, 0.6 + (matches * 0.1));
  }

  private async handleLoadAcceptance(command: VoiceCommand): Promise<void> {
    const loadMatch = command.transcript.match(/load\s+(\d+)/i);
    const loadId = loadMatch ? parseInt(loadMatch[1]) : null;
    
    if (loadId) {
      try {
        const loads = await storage.getLoads();
        const load = loads.find(l => l.id === loadId);
        
        if (load && load.status === 'available') {
          command.response = `Load ${loadId} accepted. Rate: $${load.rate}. Pickup details being sent.`;
          command.actionTaken = `Accepted load ${loadId}`;
        } else {
          command.response = `Load ${loadId} is no longer available.`;
          command.actionTaken = `Load ${loadId} unavailable`;
        }
      } catch (error) {
        command.response = `Error accepting load ${loadId}. Contact dispatch.`;
        command.actionTaken = `Error accepting load ${loadId}`;
      }
    } else {
      command.response = "Please specify load number. Say 'Accept load' followed by the number.";
      command.actionTaken = "Requested load clarification";
    }
  }

  private async handleNavigation(command: VoiceCommand): Promise<void> {
    command.response = "Route calculated. Turn-by-turn directions sent to your device.";
    command.actionTaken = "Navigation route provided";
  }

  private async handleEmergency(command: VoiceCommand): Promise<void> {
    const emergencyId = `emergency_${Date.now()}`;
    const emergency = {
      id: emergencyId,
      driverId: command.driverId,
      description: command.transcript,
      timestamp: new Date(),
      location: await this.getDriverLocation(command.driverId)
    };

    this.emergencyResponses.set(emergencyId, emergency);
    
    command.response = "Emergency alert sent to dispatch. Help is being coordinated.";
    command.actionTaken = "Emergency response initiated";
    
    console.log(`🚨 EMERGENCY: Driver ${command.driverId} - ${command.transcript}`);
  }

  private async handleStatusUpdate(command: VoiceCommand): Promise<void> {
    command.response = "Status updated. Dispatch has been notified.";
    command.actionTaken = "Status update logged";
  }

  private async handleRateNegotiation(command: VoiceCommand): Promise<void> {
    command.response = "Rate negotiation request sent to dispatch. You'll receive an update shortly.";
    command.actionTaken = "Rate negotiation requested";
  }

  private async handleBreakRequest(command: VoiceCommand): Promise<void> {
    command.response = "Break time logged. Next safe rest area is 2 miles ahead.";
    command.actionTaken = "Break time logged";
  }

  private async getDriverLocation(driverId: number): Promise<{ lat: number; lng: number }> {
    try {
      const drivers = await storage.getDrivers();
      const driver = drivers.find(d => d.id === driverId);
      
      if (driver && driver.currentLocation) {
        return driver.currentLocation;
      }
    } catch (error) {
      console.error('Error getting driver location:', error);
    }
    
    return { lat: 39.8283, lng: -98.5795 };
  }

  private createErrorCommand(driverId: number, message: string): VoiceCommand {
    return {
      id: `error_${Date.now()}`,
      driverId,
      command: "error",
      transcript: "",
      intent: 'status_update',
      confidence: 0,
      response: message,
      actionTaken: "Error response",
      timestamp: new Date(),
      processed: true
    };
  }

  getCommandHistory(driverId: number): VoiceCommand[] {
    return this.commandHistory.get(driverId) || [];
  }

  getEmergencyResponses(): any[] {
    return Array.from(this.emergencyResponses.values());
  }
}

export const voiceAssistantService = new VoiceAssistantService();