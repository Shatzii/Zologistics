import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Database, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  Settings,
  Server,
  Globe
} from "lucide-react";

interface ModelStatus {
  [key: string]: {
    name: string;
    type: string;
    version: string;
    accuracy: number;
    isActive: boolean;
    trainingDataSize: number;
    lastUpdated: string;
  };
}

interface IntegrationStatus {
  totalSources: number;
  activeSources: number;
  availableLoads: number;
  lastPolled: string;
  totalProcessed: number;
  sources: Array<{
    id: string;
    name: string;
    isActive: boolean;
    dataQuality: number;
    authRequired: boolean;
    hasCredentials: boolean;
  }>;
}

interface AuthenticLoad {
  id: string;
  source: string;
  origin: { city: string; state: string };
  destination: { city: string; state: string };
  equipment: string;
  rate: number;
  mileage: number;
  urgency: string;
  isVerified: boolean;
  lastUpdated: string;
}

export default function ProductionDashboard() {
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const { data: modelStatus, isLoading: modelsLoading } = useQuery<ModelStatus>({
    queryKey: ["/api/production-ai/models"],
  });

  const { data: integrationStatus, isLoading: integrationLoading } = useQuery<IntegrationStatus>({
    queryKey: ["/api/load-integration/status"],
  });

  const { data: authenticLoads, isLoading: loadsLoading } = useQuery<AuthenticLoad[]>({
    queryKey: ["/api/authentic-loads"],
  });

  const testConnection = async (sourceId: string) => {
    setTestingConnection(sourceId);
    try {
      const response = await fetch(`/api/load-integration/test-connection/${sourceId}`, {
        method: 'POST',
      });
      const result = await response.json();
      console.log('Connection test result:', result);
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTestingConnection(null);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (modelsLoading || integrationLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Production Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Self-hosted AI engines and authentic load data integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-green-500" />
          <span className="text-green-600 font-medium">Production Ready</span>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              AI Models Active
            </CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {modelStatus ? Object.keys(modelStatus).length : 0}
            </div>
            <p className="text-xs driver-text-secondary">
              Self-hosted engines
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Load Sources
            </CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {integrationStatus?.activeSources || 0}/{integrationStatus?.totalSources || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Available Loads
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {integrationStatus?.availableLoads || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              Real-time data
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Total Processed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {formatNumber(integrationStatus?.totalProcessed || 0)}
            </div>
            <p className="text-xs driver-text-secondary">
              Loads analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="ai-models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-models">AI Models</TabsTrigger>
          <TabsTrigger value="load-sources">Load Sources</TabsTrigger>
          <TabsTrigger value="authentic-loads">Live Loads</TabsTrigger>
          <TabsTrigger value="system-config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-models" className="space-y-4">
          <div className="grid gap-4">
            {modelStatus && Object.entries(modelStatus).map(([modelId, model]) => (
              <Card key={modelId} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-lg driver-text-emphasis">
                          {model.name}
                        </CardTitle>
                        <p className="text-sm driver-text-secondary">
                          {model.type} • Version {model.version}
                        </p>
                      </div>
                    </div>
                    <Badge variant={model.isActive ? "default" : "secondary"}>
                      {model.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="driver-text-secondary">Accuracy:</span>
                      <div className="font-medium driver-text-emphasis">
                        {model.accuracy.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="driver-text-secondary">Training Data:</span>
                      <div className="font-medium driver-text-emphasis">
                        {formatNumber(model.trainingDataSize)}
                      </div>
                    </div>
                    <div>
                      <span className="driver-text-secondary">Last Updated:</span>
                      <div className="font-medium driver-text-emphasis">
                        {new Date(model.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="driver-text-secondary">Status:</span>
                      <div className="flex items-center gap-1">
                        {model.isActive ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        )}
                        <span className="font-medium driver-text-emphasis">
                          {model.isActive ? "Operational" : "Standby"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="load-sources" className="space-y-4">
          <div className="grid gap-4">
            {integrationStatus?.sources.map((source) => (
              <Card key={source.id} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-green-500" />
                      <div>
                        <CardTitle className="text-lg driver-text-emphasis">
                          {source.name}
                        </CardTitle>
                        <p className="text-sm driver-text-secondary">
                          Quality Score: {source.dataQuality}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={source.isActive ? "default" : "secondary"}>
                        {source.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {source.authRequired && (
                        <Badge variant={source.hasCredentials ? "default" : "destructive"}>
                          {source.hasCredentials ? "Authenticated" : "Needs API Key"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {source.isActive ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        )}
                        <span className="driver-text-secondary">
                          Status: {source.isActive ? "Connected" : "Disconnected"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-500" />
                        <span className="driver-text-secondary">
                          Auth: {source.authRequired ? "Required" : "None"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(source.id)}
                      disabled={testingConnection === source.id}
                    >
                      {testingConnection === source.id ? "Testing..." : "Test Connection"}
                    </Button>
                  </div>
                  
                  {source.authRequired && !source.hasCredentials && (
                    <Alert className="mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        API credentials required. Set {source.id.toUpperCase()}_API_KEY environment variable.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="authentic-loads" className="space-y-4">
          <div className="grid gap-4">
            {loadsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 driver-text-secondary">Loading authentic load data...</p>
              </div>
            ) : authenticLoads && authenticLoads.length > 0 ? (
              authenticLoads.slice(0, 10).map((load) => (
                <Card key={load.id} className="driver-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-lg driver-text-emphasis">
                            {load.origin.city}, {load.origin.state} → {load.destination.city}, {load.destination.state}
                          </CardTitle>
                          <p className="text-sm driver-text-secondary">
                            {load.equipment} • {load.source}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(load.rate)}
                        </div>
                        <p className="text-sm driver-text-secondary">
                          {load.mileage} miles
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-500" />
                          <span className="driver-text-secondary">
                            Urgency: {load.urgency}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {load.isVerified ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          )}
                          <span className="driver-text-secondary">
                            {load.isVerified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="driver-text-secondary">
                          Updated: {new Date(load.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="driver-card">
                <CardContent className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium driver-text-emphasis mb-2">No Authentic Loads Available</h3>
                  <p className="driver-text-secondary mb-4">
                    Configure load source API keys to begin receiving real load data.
                  </p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="system-config" className="space-y-4">
          <div className="grid gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Production Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium driver-text-emphasis mb-2">Required API Keys</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>DAT_API_KEY:</span>
                        <Badge variant={process.env.DAT_API_KEY ? "default" : "destructive"}>
                          {process.env.DAT_API_KEY ? "Configured" : "Missing"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>TRUCKSTOP_API_KEY:</span>
                        <Badge variant={process.env.TRUCKSTOP_API_KEY ? "default" : "destructive"}>
                          {process.env.TRUCKSTOP_API_KEY ? "Configured" : "Missing"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>LOADBOARD123_API_KEY:</span>
                        <Badge variant={process.env.LOADBOARD123_API_KEY ? "default" : "destructive"}>
                          {process.env.LOADBOARD123_API_KEY ? "Configured" : "Missing"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium driver-text-emphasis mb-2">System Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Environment:</span>
                        <Badge variant="default">
                          {process.env.NODE_ENV || "development"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Models:</span>
                        <Badge variant="default">
                          Self-Hosted
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Sources:</span>
                        <Badge variant="default">
                          Authentic Only
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Production system configured for complete independence with self-hosted AI engines and authentic load data integration.
                Configure API keys through environment variables to activate external load sources.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}