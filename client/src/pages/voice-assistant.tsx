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
  customVariations?: string[];
}

interface VoiceProfile {
  driverId: string;
  name: string;
  dialect: 'southern' | 'midwest' | 'northeast' | 'western' | 'international';
  accent: string;
  customCommands: {
    [intent: string]: string[];
  };
  learningData: {
    successfulCommands: string[];
    failedCommands: string[];
    preferredPhrasing: string[];
  };
  adaptationLevel: number; // 0-100% how well system has learned driver's speech
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
  const [selectedDriver, setSelectedDriver] = useState<string>("driver_001");
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize voice profiles with regional dialects and custom commands
    const profiles: VoiceProfile[] = [
      {
        driverId: "driver_001",
        name: "Jake Thompson (Southern)",
        dialect: 'southern',
        accent: 'Texas',
        customCommands: {
          search_loads: ["Find me some loads", "Y'all got any loads", "Show me what's available"],
          book_load: ["Book that one", "I'll take it", "Sign me up"],
          get_directions: ["Where am I headed", "Point me the right way", "Show me the route"],
          call_broker: ["Get me dispatch", "Call the office", "Ring them up"],
          check_status: ["How am I doing", "What's my status", "Check my time"]
        },
        learningData: {
          successfulCommands: ["Find me some loads around Dallas", "Book that load", "Call dispatch"],
          failedCommands: ["Find loads in Dallas area"],
          preferredPhrasing: ["Y'all", "around", "that one"]
        },
        adaptationLevel: 85
      },
      {
        driverId: "driver_002", 
        name: "Maria Gonzalez (Southwest)",
        dialect: 'western',
        accent: 'Spanish-influenced',
        customCommands: {
          search_loads: ["Buscar cargas", "Find loads por favor", "Show loads"],
          book_load: ["Take this one", "Reserve esta carga", "Book it"],
          get_directions: ["Directions please", "Como llego", "Show route"],
          call_broker: ["Call broker", "Llamar dispatch", "Contact office"],
          check_status: ["Check my hours", "Ver mi status", "How much time"]
        },
        learningData: {
          successfulCommands: ["Find loads por favor", "Reserve esta carga", "Llamar dispatch"],
          failedCommands: ["Buscar cargas cerca"],
          preferredPhrasing: ["por favor", "esta", "como"]
        },
        adaptationLevel: 72
      },
      {
        driverId: "driver_003",
        name: "Bob Miller (Midwest)",
        dialect: 'midwest',
        accent: 'Chicago',
        customCommands: {
          search_loads: ["Find loads", "What loads ya got", "Show available"],
          book_load: ["I'll take that", "Book it", "That'll work"],
          get_directions: ["Where to", "Show me directions", "Point the way"],
          call_broker: ["Call dispatch", "Get me the office", "Ring dispatch"],
          check_status: ["Check hours", "What's my time", "Status check"]
        },
        learningData: {
          successfulCommands: ["What loads ya got", "I'll take that", "Call dispatch"],
          failedCommands: ["Find loads nearby"],
          preferredPhrasing: ["ya got", "that'll work", "get me"]
        },
        adaptationLevel: 91
      }
    ];
    setVoiceProfiles(profiles);

    // Set recent commands based on selected driver's customizations
    const selectedProfile = profiles.find(p => p.driverId === selectedDriver);
    const mockCommands: VoiceCommand[] = [
      {
        command: selectedProfile?.customCommands.search_loads[0] || "Find loads near Dallas",
        intent: 'search_loads',
        parameters: { location: 'Dallas, TX', equipment: 'dry_van' },
        confidence: 0.95,
        response: "Found 3 loads near Dallas. Highest paying is $2,850 to Houston.",
        timestamp: new Date(Date.now() - 300000),
        customVariations: selectedProfile?.customCommands.search_loads
      },
      {
        command: selectedProfile?.customCommands.book_load[0] || "Book load LD001",
        intent: 'book_load', 
        parameters: { loadId: 'LD001' },
        confidence: 0.92,
        response: "Load LD001 booked successfully. Route optimization activated.",
        timestamp: new Date(Date.now() - 240000),
        customVariations: selectedProfile?.customCommands.book_load
      },
      {
        command: selectedProfile?.customCommands.call_broker[0] || "Call dispatcher",
        intent: 'call_broker',
        parameters: { contact: 'dispatcher' },
        confidence: 0.88,
        response: "Connecting you to dispatch. Please hold.",
        timestamp: new Date(Date.now() - 180000),
        customVariations: selectedProfile?.customCommands.call_broker
      }
    ];
    setRecentCommands(mockCommands);
  }, [selectedDriver]);

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

    // Get selected driver's custom commands
    const selectedProfile = voiceProfiles.find(p => p.driverId === selectedDriver);
    
    // Use driver's personalized command variations
    const commands = selectedProfile ? [
      ...selectedProfile.customCommands.search_loads,
      ...selectedProfile.customCommands.book_load,
      ...selectedProfile.customCommands.get_directions,
      ...selectedProfile.customCommands.check_status
    ] : [
      "Find loads from Chicago to Miami",
      "Book the highest paying load", 
      "Get directions to pickup location",
      "Check my hours of service"
    ];
    
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    
    // Adjust confidence based on driver's adaptation level
    const baseConfidence = selectedProfile ? selectedProfile.adaptationLevel / 100 : 0.7;
    const variance = Math.random() * 0.3;
    
    setTimeout(() => {
      setCurrentCommand(randomCommand);
      setConfidence(Math.min(0.99, baseConfidence + variance));
    }, 1500);

    setTimeout(() => {
      processVoiceCommand(randomCommand);
      setIsListening(false);
      
      // Update learning data if in training mode
      if (isTrainingMode && selectedProfile) {
        updateLearningData(selectedProfile, randomCommand, true);
      }
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

  const updateLearningData = (profile: VoiceProfile, command: string, success: boolean) => {
    const updatedProfiles = voiceProfiles.map(p => {
      if (p.driverId === profile.driverId) {
        const updatedProfile = { ...p };
        if (success) {
          updatedProfile.learningData.successfulCommands.push(command);
          updatedProfile.adaptationLevel = Math.min(100, updatedProfile.adaptationLevel + 2);
        } else {
          updatedProfile.learningData.failedCommands.push(command);
        }
        return updatedProfile;
      }
      return p;
    });
    setVoiceProfiles(updatedProfiles);
  };

  const trainCustomCommand = (intent: string, newPhrase: string) => {
    const selectedProfile = voiceProfiles.find(p => p.driverId === selectedDriver);
    if (!selectedProfile) return;

    const updatedProfiles = voiceProfiles.map(p => {
      if (p.driverId === selectedDriver) {
        const updatedProfile = { ...p };
        if (!updatedProfile.customCommands[intent]) {
          updatedProfile.customCommands[intent] = [];
        }
        if (!updatedProfile.customCommands[intent].includes(newPhrase)) {
          updatedProfile.customCommands[intent].push(newPhrase);
          updatedProfile.learningData.preferredPhrasing.push(newPhrase);
          updatedProfile.adaptationLevel = Math.min(100, updatedProfile.adaptationLevel + 5);
        }
        return updatedProfile;
      }
      return p;
    });
    setVoiceProfiles(updatedProfiles);
    
    toast({
      title: "Custom Command Added",
      description: `"${newPhrase}" added for ${intent.replace('_', ' ')}`,
    });
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
            <p className="text-gray-600 mt-1">Personalized voice commands with dialect and accent recognition</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isListening ? "default" : "outline"}>
              {isListening ? "Listening" : "Ready"}
            </Badge>
            <Badge variant={isSpeaking ? "default" : "outline"}>
              {isSpeaking ? "Speaking" : "Silent"}
            </Badge>
            <Badge variant={isTrainingMode ? "default" : "outline"}>
              {isTrainingMode ? "Training" : "Normal"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Driver Profile Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Driver Voice Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {voiceProfiles.map((profile) => (
              <Card 
                key={profile.driverId}
                className={`cursor-pointer border-2 transition-all ${
                  selectedDriver === profile.driverId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedDriver(profile.driverId)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">{profile.name}</h3>
                    <Badge variant="outline">{profile.accent}</Badge>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Adaptation Level:</span>
                        <span className="font-medium">{profile.adaptationLevel}%</span>
                      </div>
                      <Progress value={profile.adaptationLevel} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-600">
                      {profile.customCommands.search_loads.length + 
                       profile.customCommands.book_load.length + 
                       profile.customCommands.get_directions.length + 
                       profile.customCommands.call_broker.length + 
                       profile.customCommands.check_status.length} custom commands
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowProfileSetup(true)}
            >
              Add New Driver Profile
            </Button>
            <div className="flex gap-2">
              <Button 
                variant={isTrainingMode ? "default" : "outline"}
                onClick={() => setIsTrainingMode(!isTrainingMode)}
              >
                {isTrainingMode ? "Exit Training" : "Training Mode"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Custom Commands Training */}
      {selectedDriver && voiceProfiles.find(p => p.driverId === selectedDriver) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Custom Commands for {voiceProfiles.find(p => p.driverId === selectedDriver)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(voiceProfiles.find(p => p.driverId === selectedDriver)?.customCommands || {}).map(([intent, commands]) => (
                <div key={intent} className="space-y-3">
                  <h4 className="font-semibold capitalize flex items-center gap-2">
                    {getIntentIcon(intent)}
                    {intent.replace('_', ' ')}
                  </h4>
                  <div className="space-y-2">
                    {commands.map((command, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">"{command}"</span>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                    ))}
                  </div>
                  {isTrainingMode && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Add new ${intent.replace('_', ' ')} command...`}
                        className="flex-1 px-3 py-2 border rounded text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              trainCustomCommand(intent, target.value.trim());
                              target.value = '';
                            }
                          }
                        }}
                      />
                      <Button size="sm" variant="outline">Add</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {isTrainingMode && (
              <Alert className="mt-4">
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>Training Mode Active:</strong> Speak commands naturally and the system will learn your speech patterns. 
                  Add custom phrases above to expand recognition for your dialect and accent.
                </AlertDescription>
              </Alert>
            )}
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
                      {command.customVariations && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Personalized
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">"{command.command}"</p>
                    <p className="text-sm text-gray-600 mt-1">{command.response}</p>
                    {command.customVariations && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Alternative phrases you can use:</p>
                        <div className="flex flex-wrap gap-1">
                          {command.customVariations.slice(0, 3).map((variation, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              "{variation}"
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
          <strong>Personalized Voice Recognition:</strong> The system learns each driver's unique speech patterns, 
          dialect, and preferred phrases to eliminate repetition and improve accuracy. Training mode helps 
          customize commands for regional accents and personal speaking styles.
        </AlertDescription>
      </Alert>
    </div>
  );
}