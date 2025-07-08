import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Truck, 
  MapPin, 
  Phone,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceCommand {
  command: string;
  intent: 'search_loads' | 'book_load' | 'get_directions' | 'call_broker' | 'check_status';
  parameters: Record<string, any>;
  confidence: number;
  response: string;
  timestamp: Date;
}

interface VoiceSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  commands: VoiceCommand[];
  status: 'active' | 'completed' | 'error';
}

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([]);
  const [voiceSession, setVoiceSession] = useState<VoiceSession | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate voice commands from existing mobile-driver-app functionality
    const mockCommands: VoiceCommand[] = [
      {
        command: "Find loads near Dallas",
        intent: 'search_loads',
        parameters: { location: 'Dallas, TX', equipment: 'dry_van' },
        confidence: 0.95,
        response: "Found 3 loads near Dallas. Highest paying is $2,850 to Houston.",
        timestamp: new Date(Date.now() - 300000)
      },
      {
        command: "Book load LD001",
        intent: 'book_load', 
        parameters: { loadId: 'LD001' },
        confidence: 0.92,
        response: "Load LD001 booked successfully. Route optimization activated.",
        timestamp: new Date(Date.now() - 240000)
      },
      {
        command: "Call dispatcher",
        intent: 'call_broker',
        parameters: { contact: 'dispatcher' },
        confidence: 0.88,
        response: "Connecting you to dispatch. Please hold.",
        timestamp: new Date(Date.now() - 180000)
      }
    ];
    setRecentCommands(mockCommands);
  }, []);

  const startListening = () => {
    setIsListening(true);
    setCurrentCommand("");
    setConfidence(0);
    
    // Create new voice session
    const newSession: VoiceSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      commands: [],
      status: 'active'
    };
    setVoiceSession(newSession);

    // Simulate voice recognition
    const commands = [
      "Find loads from Chicago to Miami",
      "Book the highest paying load",
      "Get directions to pickup location",
      "Check my hours of service",
      "Update status to available"
    ];
    
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    
    setTimeout(() => {
      setCurrentCommand(randomCommand);
      setConfidence(Math.random() * 0.3 + 0.7); // 70-100% confidence
    }, 1500);

    setTimeout(() => {
      processVoiceCommand(randomCommand);
      setIsListening(false);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    if (voiceSession) {
      setVoiceSession({
        ...voiceSession,
        endTime: new Date(),
        status: 'completed'
      });
    }
  };

  const processVoiceCommand = (command: string) => {
    const intents = ['search_loads', 'book_load', 'get_directions', 'call_broker', 'check_status'] as const;
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    
    const responses = {
      search_loads: "Found 4 available loads. Top rate is $3,200 to Los Angeles.",
      book_load: "Load booked successfully. Dispatch has been notified.",
      get_directions: "Route calculated. Starting navigation to pickup location.",
      call_broker: "Calling broker TQL. Connection established.",
      check_status: "You have 8 hours remaining on your 11-hour drive time."
    };

    const newCommand: VoiceCommand = {
      command,
      intent: randomIntent,
      parameters: {},
      confidence: confidence,
      response: responses[randomIntent],
      timestamp: new Date()
    };

    setRecentCommands(prev => [newCommand, ...prev.slice(0, 4)]);
    
    // Speak response
    setIsSpeaking(true);
    toast({
      title: "Voice Command Processed",
      description: newCommand.response,
    });

    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'search_loads': return <Search className="h-4 w-4" />;
      case 'book_load': return <CheckCircle className="h-4 w-4" />;
      case 'get_directions': return <MapPin className="h-4 w-4" />;
      case 'call_broker': return <Phone className="h-4 w-4" />;
      case 'check_status': return <Clock className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'search_loads': return "bg-blue-100 text-blue-800";
      case 'book_load': return "bg-green-100 text-green-800";
      case 'get_directions': return "bg-purple-100 text-purple-800";
      case 'call_broker': return "bg-orange-100 text-orange-800";
      case 'check_status': return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Voice Assistant</h1>
            <p className="text-gray-600 mt-1">Hands-free trucking operations with AI voice commands</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isListening ? "default" : "outline"}>
              {isListening ? "Listening" : "Ready"}
            </Badge>
            <Badge variant={isSpeaking ? "default" : "outline"}>
              {isSpeaking ? "Speaking" : "Silent"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Voice Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all ${
                isListening ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  className="w-20 h-20 rounded-full"
                >
                  {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>
              </div>
              
              {isListening && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Listening...</span>
                  </div>
                  {currentCommand && (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">"{currentCommand}"</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <Progress value={confidence * 100} className="flex-1" />
                        <span className="text-sm font-medium">{Math.round(confidence * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!isListening && (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Press to speak</p>
                  <p className="text-sm text-gray-600">
                    Say commands like "Find loads near me" or "Book load LD001"
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Quick Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {[
                { command: "Find loads near me", icon: Search },
                { command: "Book highest paying load", icon: CheckCircle },
                { command: "Get directions", icon: MapPin },
                { command: "Call dispatcher", icon: Phone },
                { command: "Check my status", icon: Clock }
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-12"
                  onClick={() => processVoiceCommand(item.command)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.command}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Session Status */}
      {voiceSession && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Current Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{voiceSession.commands.length}</div>
                <p className="text-sm text-gray-600">Commands</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {voiceSession.status === 'active' ? 'Active' : 'Complete'}
                </div>
                <p className="text-sm text-gray-600">Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((Date.now() - voiceSession.startTime.getTime()) / 1000)}s
                </div>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">94%</div>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Voice Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCommands.map((command, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getIntentColor(command.intent)}>
                        {getIntentIcon(command.intent)}
                        <span className="ml-1 capitalize">{command.intent.replace('_', ' ')}</span>
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(command.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900">"{command.command}"</p>
                    <p className="text-sm text-gray-600 mt-1">{command.response}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {command.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Features Info */}
      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Voice Assistant Features:</strong> Search loads, book loads, get directions, call contacts, 
          check status, update location, and manage loads - all hands-free for safer driving.
        </AlertDescription>
      </Alert>
    </div>
  );
}