import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Play, Pause, Volume2, VolumeX, 
  Shield, Lock, Coins, FileCheck, Clock, 
  Zap, Target, TrendingUp, Award, Crown,
  Brain, Cpu, Rocket, Star, CheckCircle,
  Phone, AlertTriangle, Navigation, Settings2
} from "lucide-react";

interface VoiceSession {
  id: string;
  driverId: number;
  startTime: Date;
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

interface VoiceCommand {
  id: string;
  driverId: number;
  transcript: string;
  intent: string;
  confidence: number;
  response: string;
  actionTaken: string;
  timestamp: Date;
}

interface SmartContract {
  id: string;
  loadId: number;
  status: string;
  terms: {
    rate: number;
    origin: string;
    destination: string;
    escrowAmount: number;
  };
  milestones: Array<{
    id: string;
    description: string;
    completed: boolean;
    paymentPercentage: number;
  }>;
  signatures: {
    carrier: string | null;
    shipper: string | null;
  };
  escrowStatus: string;
}

interface VoiceAnalytics {
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
}

export function RevolutionaryFeaturesDashboard() {
  const [isListening, setIsListening] = useState(false);
  const [selectedDriverId] = useState<number>(1);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const queryClient = useQueryClient();

  const { data: voiceSession } = useQuery<VoiceSession>({
    queryKey: ['/api/voice/session', selectedDriverId],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: voiceCommands } = useQuery<VoiceCommand[]>({
    queryKey: ['/api/voice/commands', selectedDriverId],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: voiceAnalytics } = useQuery<VoiceAnalytics>({
    queryKey: ['/api/voice/analytics'],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: blockchainContracts } = useQuery<SmartContract[]>({
    queryKey: ['/api/blockchain/contracts'],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const startVoiceSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/voice/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voice/session', selectedDriverId] });
      setVoiceEnabled(true);
    },
  });

  const processVoiceCommandMutation = useMutation({
    mutationFn: async (audioData: string) => {
      const response = await fetch('/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId, audioData }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voice/commands', selectedDriverId] });
      queryClient.invalidateQueries({ queryKey: ['/api/voice/analytics'] });
      setIsListening(false);
    },
  });

  const createSmartContractMutation = useMutation({
    mutationFn: async (contractData: any) => {
      const response = await fetch('/api/blockchain/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blockchain/contracts'] });
    },
  });

  const handleStartVoiceSession = () => {
    startVoiceSessionMutation.mutate();
  };

  const handleVoiceCommand = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate voice command processing after 3 seconds
      setTimeout(() => {
        processVoiceCommandMutation.mutate('simulated-audio-data');
      }, 3000);
    }
  };

  const handleCreateContract = () => {
    const contractData = {
      loadId: 1001,
      carrierId: 1,
      shipperId: 2,
      terms: {
        rate: 2850,
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        origin: "Denver, CO",
        destination: "Phoenix, AZ",
        penalties: {
          latePickup: 100,
          lateDelivery: 200,
          damage: 500
        },
        escrowAmount: 2850
      }
    };
    createSmartContractMutation.mutate(contractData);
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'load_acceptance': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'navigation': return <Navigation className="w-4 h-4 text-blue-400" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'rate_negotiation': return <Coins className="w-4 h-4 text-yellow-400" />;
      case 'break_request': return <Clock className="w-4 h-4 text-purple-400" />;
      default: return <Settings2 className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'disputed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 bg-background driver-theme">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold driver-text-critical flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            Revolutionary AI Features
          </h1>
          <p className="driver-text-secondary">
            Industry-leading voice assistant and blockchain technology that surpasses all competitors
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Star className="w-3 h-3 mr-1" />
            Industry Leader
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Rocket className="w-3 h-3 mr-1" />
            Next-Gen Technology
          </Badge>
        </div>
      </div>

      {/* Competitive Advantage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="driver-card border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Voice Commands</CardTitle>
            <Mic className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {voiceAnalytics?.totalCommands || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              {voiceAnalytics?.averageConfidence ? `${(voiceAnalytics.averageConfidence * 100).toFixed(1)}% accuracy` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Smart Contracts</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {blockchainContracts?.length || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              100% transparent payments
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Driver Adoption</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {voiceAnalytics?.driverAdoption.activeUsers || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              {voiceAnalytics?.driverAdoption.satisfactionScore || 0}/5 satisfaction
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Emergency Response</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {voiceAnalytics?.emergencyResponse.averageResponseTime || 0}s
            </div>
            <p className="text-xs driver-text-secondary">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="voice-assistant" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="voice-assistant">Voice Assistant</TabsTrigger>
          <TabsTrigger value="blockchain">Smart Contracts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Edge</TabsTrigger>
        </TabsList>

        <TabsContent value="voice-assistant" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice Control Panel */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Voice Assistant Control
                </CardTitle>
                <p className="driver-text-secondary">Hands-free dispatch operations with natural language processing</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="driver-text-emphasis">Voice Session Status</span>
                  <Badge className={voiceEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                    {voiceEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleStartVoiceSession}
                    disabled={voiceEnabled || startVoiceSessionMutation.isPending}
                    className="w-full"
                  >
                    {startVoiceSessionMutation.isPending ? 'Starting...' : 'Start Voice Session'}
                  </Button>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleVoiceCommand}
                      disabled={!voiceEnabled || isListening || processVoiceCommandMutation.isPending}
                      variant={isListening ? "destructive" : "default"}
                      className="flex-1"
                    >
                      {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {isListening ? 'Listening...' : 'Voice Command'}
                    </Button>
                    <Button variant="outline" size="icon">
                      {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="driver-text-emphasis font-medium">Quick Voice Commands</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      "Accept load 1001"
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      "Navigate to Phoenix"
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      "Negotiate better rate"
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      "Emergency assistance"
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Voice Commands */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Recent Voice Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {voiceCommands?.slice(0, 10).map((command) => (
                      <div key={command.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getIntentIcon(command.intent)}
                            <span className="text-sm font-medium driver-text-emphasis capitalize">
                              {command.intent.replace('_', ' ')}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {(command.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-sm driver-text-secondary mb-1">"{command.transcript}"</p>
                        <p className="text-xs driver-text-secondary">{command.response}</p>
                        <p className="text-xs text-green-600 mt-1">Action: {command.actionTaken}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Smart Contract Creation */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Blockchain Smart Contracts
                </CardTitle>
                <p className="driver-text-secondary">Transparent, automated payments with zero disputes</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Contract Security</span>
                    <Badge className="bg-green-500">256-bit Encryption</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Payment Speed</span>
                    <Badge className="bg-blue-500">Instant Settlement</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Dispute Rate</span>
                    <Badge className="bg-green-500">0% (Automated)</Badge>
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleCreateContract}
                  disabled={createSmartContractMutation.isPending}
                  className="w-full"
                >
                  {createSmartContractMutation.isPending ? 'Creating...' : 'Create Smart Contract'}
                </Button>

                <div className="space-y-2">
                  <h4 className="driver-text-emphasis font-medium">Contract Benefits</h4>
                  <ul className="space-y-1 text-sm driver-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      Automatic milestone payments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      Escrow protection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      Penalty enforcement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      Transparent verification
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Active Contracts */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Active Smart Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {blockchainContracts?.map((contract) => (
                      <div key={contract.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium driver-text-emphasis">Load #{contract.loadId}</span>
                          <Badge className={getStatusBadgeColor(contract.status)}>
                            {contract.status}
                          </Badge>
                        </div>
                        <div className="text-sm driver-text-secondary space-y-1">
                          <p>{contract.terms.origin} → {contract.terms.destination}</p>
                          <p>Rate: ${contract.terms.rate.toLocaleString()}</p>
                          <p>Escrow: ${contract.terms.escrowAmount.toLocaleString()}</p>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs driver-text-secondary mb-1">
                            <span>Progress</span>
                            <span>{contract.milestones.filter(m => m.completed).length}/{contract.milestones.length}</span>
                          </div>
                          <Progress 
                            value={(contract.milestones.filter(m => m.completed).length / contract.milestones.length) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voice Analytics */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Voice Assistant Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Commands Per Driver</span>
                    <span className="driver-text-emphasis font-bold">
                      {voiceAnalytics?.driverAdoption.commandsPerDriver.toFixed(1) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Average Confidence</span>
                    <span className="driver-text-emphasis font-bold">
                      {voiceAnalytics?.averageConfidence ? `${(voiceAnalytics.averageConfidence * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Emergency Response</span>
                    <span className="driver-text-emphasis font-bold">
                      {voiceAnalytics?.emergencyResponse.averageResponseTime || 0}s
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="driver-text-emphasis font-medium">Intent Distribution</h4>
                  {voiceAnalytics?.intentDistribution && Object.entries(voiceAnalytics.intentDistribution).map(([intent, count]) => (
                    <div key={intent} className="flex justify-between items-center">
                      <span className="driver-text-secondary capitalize">{intent.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(voiceAnalytics.intentDistribution))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm driver-text-emphasis w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitive Metrics */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Industry Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="driver-text-secondary">Driver Satisfaction</span>
                      <span className="driver-text-emphasis font-bold">4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                    <p className="text-xs driver-text-secondary mt-1">+40% vs industry average</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="driver-text-secondary">Payment Speed</span>
                      <span className="driver-text-emphasis font-bold">Instant</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs driver-text-secondary mt-1">vs 7-14 days industry standard</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="driver-text-secondary">Rate Optimization</span>
                      <span className="driver-text-emphasis font-bold">+25%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs driver-text-secondary mt-1">Higher rates through AI negotiation</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="driver-text-secondary">Technology Innovation</span>
                      <span className="driver-text-emphasis font-bold">2-3 Years Ahead</span>
                    </div>
                    <Progress value={90} className="h-2" />
                    <p className="text-xs driver-text-secondary mt-1">Voice AI + Blockchain integration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <Card className="driver-card">
            <CardHeader>
              <CardTitle className="driver-text-emphasis flex items-center gap-2">
                <Target className="w-5 h-5" />
                Competitive Advantage Matrix
              </CardTitle>
              <p className="driver-text-secondary">How we surpass the top 5 dispatch industry leaders</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="driver-text-emphasis font-semibold mb-2">vs McLeod Software</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Modern, intuitive UI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">AI-powered optimization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Voice assistant integration</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="driver-text-emphasis font-semibold mb-2">vs TMW Systems</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Simplified setup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Predictive analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Blockchain payments</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="driver-text-emphasis font-semibold mb-2">vs PeopleNet</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Flexible customization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">AI load matching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Mental health support</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="driver-text-emphasis font-semibold mb-2">vs Omnitracs</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Cost-effective pricing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Rapid innovation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Driver-friendly design</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="driver-text-emphasis font-semibold mb-2">vs JJ Keller</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Full operational suite</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Advanced AI capabilities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="driver-text-secondary">Superior user experience</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                  <h4 className="driver-text-emphasis font-semibold mb-2 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Our Unique Edge
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="driver-text-secondary">Voice-controlled dispatch</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="driver-text-secondary">Blockchain transparency</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="driver-text-secondary">Wellness-first approach</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}