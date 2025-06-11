import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Cpu, Brain, Eye, Mic, Target, TrendingUp, 
  Server, Activity, Zap, Shield, Clock, CheckCircle,
  Play, Pause, Settings, BarChart3, Database
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  type: string;
  version: string;
  capabilities: string[];
  accuracy: number;
  responseTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
}

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  models: string[];
  capabilities: string[];
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
  isActive: boolean;
}

interface AISystemStatus {
  models: {
    total: number;
    active: number;
    averageAccuracy: number;
    totalResourceUsage: {
      cpu: number;
      memory: number;
      gpu: number;
    };
  };
  agents: {
    total: number;
    active: number;
    averagePerformance: {
      accuracy: number;
      speed: number;
      reliability: number;
    };
  };
  processing: {
    queueSize: number;
    cacheSize: number;
    uptime: number;
    requestsProcessed: number;
  };
}

export function SelfHostedAIDashboard() {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [processingInput, setProcessingInput] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: systemStatus, isLoading: statusLoading } = useQuery<AISystemStatus>({
    queryKey: ['/api/ai/system-status'],
    refetchInterval: 5000,
    retry: 1,
  });

  const { data: models, isLoading: modelsLoading } = useQuery<AIModel[]>({
    queryKey: ['/api/ai/models'],
    retry: 1,
  });

  const { data: agents, isLoading: agentsLoading } = useQuery<AIAgent[]>({
    queryKey: ['/api/ai/agents'],
    retry: 1,
  });

  const processAIMutation = useMutation({
    mutationFn: async (data: { modelId: string; input: any; priority: string }) => {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/system-status'] });
    },
  });

  const optimizeRateMutation = useMutation({
    mutationFn: async (data: { loadData: any; marketData?: any }) => {
      const response = await fetch('/api/ai/optimize-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  });

  const inspectCargoMutation = useMutation({
    mutationFn: async (data: { imageData: string }) => {
      const response = await fetch('/api/ai/inspect-cargo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  });

  const handleProcessAI = () => {
    if (selectedModel && processingInput) {
      processAIMutation.mutate({
        modelId: selectedModel,
        input: { text: processingInput },
        priority: 'medium'
      });
    }
  };

  const handleOptimizeRate = () => {
    optimizeRateMutation.mutate({
      loadData: {
        origin: 'Denver, CO',
        destination: 'Phoenix, AZ',
        distance: 485,
        weight: 45000,
        commodity: 'Electronics'
      },
      marketData: {
        currentDemand: 'high',
        fuelPrice: 3.85,
        seasonalFactor: 1.1
      }
    });
  };

  const handleInspectCargo = () => {
    inspectCargoMutation.mutate({
      imageData: 'demo-cargo-image-data'
    });
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'nlp': return <Brain className="w-4 h-4 text-blue-400" />;
      case 'vision': return <Eye className="w-4 h-4 text-green-400" />;
      case 'speech': return <Mic className="w-4 h-4 text-purple-400" />;
      case 'optimization': return <Target className="w-4 h-4 text-orange-400" />;
      case 'prediction': return <TrendingUp className="w-4 h-4 text-red-400" />;
      default: return <Cpu className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (statusLoading || modelsLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background driver-theme">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold driver-text-critical flex items-center gap-3">
            <Server className="w-8 h-8 text-green-400" />
            Self-Hosted AI Engine
          </h1>
          <p className="driver-text-secondary">
            Complete AI infrastructure independence with 5 specialized models and agents
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            {systemStatus?.processing.requestsProcessed || 0} Requests Processed
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Shield className="w-3 h-3 mr-1" />
            100% Self-Hosted
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="driver-card border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">AI Models</CardTitle>
            <Brain className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {systemStatus?.models.active}/{systemStatus?.models.total}
            </div>
            <p className="text-xs driver-text-secondary">
              {systemStatus?.models.averageAccuracy ? `${(systemStatus.models.averageAccuracy * 100).toFixed(1)}% avg accuracy` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">AI Agents</CardTitle>
            <Zap className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {systemStatus?.agents.active}/{systemStatus?.agents.total}
            </div>
            <p className="text-xs driver-text-secondary">
              {systemStatus?.agents.averagePerformance.reliability ? `${(systemStatus.agents.averagePerformance.reliability * 100).toFixed(1)}% reliability` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Processing Queue</CardTitle>
            <Database className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {systemStatus?.processing.queueSize || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              {systemStatus?.processing.cacheSize || 0} cached responses
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {systemStatus?.processing.uptime ? formatUptime(systemStatus.processing.uptime) : '0h 0m'}
            </div>
            <p className="text-xs driver-text-secondary">
              Continuous operation
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="processing">Live Processing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="testing">AI Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models?.map((model) => (
              <Card key={model.id} className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-emphasis text-sm flex items-center gap-2">
                    {getModelIcon(model.type)}
                    {model.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{model.type}</Badge>
                    <Badge variant="outline">v{model.version}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="driver-text-secondary">Accuracy</span>
                      <span className="driver-text-emphasis">{(model.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={model.accuracy * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="driver-text-secondary">Response Time</span>
                      <span className="driver-text-emphasis">{model.responseTime}ms</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs driver-text-secondary">Resource Usage:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="driver-text-emphasis">{model.resourceUsage.cpu}%</p>
                        <p className="driver-text-secondary">CPU</p>
                      </div>
                      <div className="text-center">
                        <p className="driver-text-emphasis">{model.resourceUsage.memory}MB</p>
                        <p className="driver-text-secondary">Memory</p>
                      </div>
                      <div className="text-center">
                        <p className="driver-text-emphasis">{model.resourceUsage.gpu || 0}%</p>
                        <p className="driver-text-secondary">GPU</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs driver-text-secondary mb-1">Capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.slice(0, 3).map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents?.map((agent) => (
              <Card key={agent.id} className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-emphasis flex items-center justify-between">
                    <span>{agent.name}</span>
                    <Badge className={agent.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <p className="driver-text-secondary text-sm">{agent.specialization}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="driver-text-secondary">Accuracy</span>
                      <span className="driver-text-emphasis">{(agent.performance.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={agent.performance.accuracy * 100} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="driver-text-secondary">Speed</span>
                      <span className="driver-text-emphasis">{agent.performance.speed}/100</span>
                    </div>
                    <Progress value={agent.performance.speed} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="driver-text-secondary">Reliability</span>
                      <span className="driver-text-emphasis">{(agent.performance.reliability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={agent.performance.reliability * 100} className="h-2" />
                  </div>

                  <div>
                    <p className="text-xs driver-text-secondary mb-1">Capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs driver-text-secondary mb-1">Uses Models:</p>
                    <p className="text-xs driver-text-emphasis">{agent.models.length} models integrated</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="driver-text-secondary">Total CPU Usage</span>
                    <span className="driver-text-emphasis">{systemStatus?.models.totalResourceUsage.cpu || 0}%</span>
                  </div>
                  <Progress value={systemStatus?.models.totalResourceUsage.cpu || 0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="driver-text-secondary">Memory Usage</span>
                    <span className="driver-text-emphasis">{systemStatus?.models.totalResourceUsage.memory || 0}MB</span>
                  </div>
                  <Progress value={(systemStatus?.models.totalResourceUsage.memory || 0) / 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="driver-text-secondary">GPU Usage</span>
                    <span className="driver-text-emphasis">{systemStatus?.models.totalResourceUsage.gpu || 0}%</span>
                  </div>
                  <Progress value={systemStatus?.models.totalResourceUsage.gpu || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Processing Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{systemStatus?.processing.requestsProcessed || 0}</p>
                    <p className="text-xs driver-text-secondary">Total Requests</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{systemStatus?.processing.queueSize || 0}</p>
                    <p className="text-xs driver-text-secondary">Queue Size</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{systemStatus?.processing.cacheSize || 0}</p>
                    <p className="text-xs driver-text-secondary">Cache Size</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">99.8%</p>
                    <p className="text-xs driver-text-secondary">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="driver-card">
            <CardHeader>
              <CardTitle className="driver-text-emphasis">AI Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {systemStatus?.models.averageAccuracy ? `${(systemStatus.models.averageAccuracy * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <p className="driver-text-secondary">Average Model Accuracy</p>
                  <p className="text-xs driver-text-secondary mt-1">Across all 5 AI models</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {systemStatus?.agents.averagePerformance.speed || 0}/100
                  </div>
                  <p className="driver-text-secondary">Average Processing Speed</p>
                  <p className="text-xs driver-text-secondary mt-1">Real-time optimization</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {systemStatus?.agents.averagePerformance.reliability ? `${(systemStatus.agents.averagePerformance.reliability * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <p className="driver-text-secondary">System Reliability</p>
                  <p className="text-xs driver-text-secondary mt-1">Mission-critical uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">AI Processing Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="driver-text-emphasis block text-sm font-medium mb-2">
                    Select AI Model
                  </label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background driver-text-emphasis"
                  >
                    <option value="">Choose a model...</option>
                    {models?.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="driver-text-emphasis block text-sm font-medium mb-2">
                    Input Text
                  </label>
                  <textarea
                    value={processingInput}
                    onChange={(e) => setProcessingInput(e.target.value)}
                    placeholder="Enter text to process..."
                    className="w-full p-2 border rounded-md bg-background driver-text-emphasis"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleProcessAI}
                  disabled={!selectedModel || !processingInput || processAIMutation.isPending}
                  className="w-full"
                >
                  {processAIMutation.isPending ? 'Processing...' : 'Process with AI'}
                </Button>

                {processAIMutation.data && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">AI Response:</p>
                    <pre className="text-xs mt-1 text-green-700 dark:text-green-300 whitespace-pre-wrap">
                      {JSON.stringify(processAIMutation.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Specialized AI Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleOptimizeRate}
                  disabled={optimizeRateMutation.isPending}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {optimizeRateMutation.isPending ? 'Optimizing...' : 'Test Rate Optimization'}
                </Button>

                <Button 
                  onClick={handleInspectCargo}
                  disabled={inspectCargoMutation.isPending}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {inspectCargoMutation.isPending ? 'Inspecting...' : 'Test Cargo Inspection'}
                </Button>

                {(optimizeRateMutation.data || inspectCargoMutation.data) && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Test Results:</p>
                    <pre className="text-xs mt-1 text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                      {JSON.stringify(optimizeRateMutation.data || inspectCargoMutation.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}