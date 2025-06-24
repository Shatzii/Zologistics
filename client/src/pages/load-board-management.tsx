import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, XCircle, Clock, Zap, Key, Globe, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LoadBoardConfig {
  id: string;
  name: string;
  type: 'free' | 'paid' | 'open_source';
  apiUrl: string;
  apiKey?: string;
  authMethod: 'api_key' | 'oauth' | 'basic_auth' | 'none';
  enabled: boolean;
  rateLimit: number;
  status: 'active' | 'error' | 'rate_limited' | 'disabled';
  errorMessage?: string;
  lastSync: string;
}

export default function LoadBoardManagement() {
  const { toast } = useToast();
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState('');

  const { data: loadBoards = [], isLoading } = useQuery({
    queryKey: ['/api/content-management/load-boards'],
    refetchInterval: 10000,
  });

  const { data: dataStats } = useQuery({
    queryKey: ['/api/content-management/stats'],
    refetchInterval: 5000,
  });

  const { data: realLoads = [] } = useQuery({
    queryKey: ['/api/content-management/real-loads'],
    refetchInterval: 30000,
  });

  const enableBoardMutation = useMutation({
    mutationFn: async ({ id, apiKey }: { id: string; apiKey?: string }) => {
      return apiRequest(`/api/content-management/enable-board`, {
        method: 'POST',
        body: { id, apiKey }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-management/load-boards'] });
      toast({
        title: "Load Board Enabled",
        description: "Successfully connected to load board API",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiRequest(`/api/content-management/test-connection`, {
        method: 'POST',
        body: { id }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test Successful",
        description: `Retrieved ${data.loadCount} loads from API`,
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEnableBoard = (board: LoadBoardConfig) => {
    if (board.authMethod === 'api_key' && !newApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key to enable this load board",
        variant: "destructive",
      });
      return;
    }

    enableBoardMutation.mutate({ 
      id: board.id, 
      apiKey: board.authMethod === 'api_key' ? newApiKey : undefined 
    });
    setNewApiKey('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'rate_limited': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'open_source': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Load Board Management</h1>
          <p className="text-gray-600">Connect to real load boards and eliminate fake data</p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Sources</p>
                <p className="text-2xl font-bold">{dataStats?.activeSources || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Real Loads</p>
                <p className="text-2xl font-bold">{realLoads.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="load-boards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="load-boards">Load Boards</TabsTrigger>
          <TabsTrigger value="real-data">Real Data</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="load-boards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadBoards.map((board: LoadBoardConfig) => (
              <Card key={board.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{board.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(board.status)}
                      <Badge className={getTypeColor(board.type)}>
                        {board.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate Limit:</span>
                      <span>{board.rateLimit}/min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Auth Method:</span>
                      <span>{board.authMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Sync:</span>
                      <span>{new Date(board.lastSync).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {board.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-red-800 text-sm">{board.errorMessage}</p>
                    </div>
                  )}

                  {!board.enabled && board.authMethod === 'api_key' && (
                    <div className="space-y-2">
                      <Label htmlFor={`api-key-${board.id}`}>API Key</Label>
                      <Input
                        id={`api-key-${board.id}`}
                        type="password"
                        placeholder="Enter your API key"
                        value={selectedBoard === board.id ? newApiKey : ''}
                        onChange={(e) => {
                          setSelectedBoard(board.id);
                          setNewApiKey(e.target.value);
                        }}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!board.enabled ? (
                      <Button 
                        onClick={() => handleEnableBoard(board)}
                        disabled={enableBoardMutation.isPending}
                        className="flex-1"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Enable
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => testConnectionMutation.mutate({ id: board.id })}
                        disabled={testConnectionMutation.isPending}
                        variant="outline"
                        className="flex-1"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Free Load Board Options Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800">✅ Freight Caviar Open API (Active)</h4>
                  <p className="text-green-700 text-sm">No API key required - pulling real loads now</p>
                  <p className="text-xs text-green-600 mt-1">200 requests/minute • Public load data</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800">🔑 FreightPost Free Tier</h4>
                  <p className="text-blue-700 text-sm">100 requests/minute with free API key</p>
                  <p className="text-xs text-blue-600 mt-1">Sign up at freightpost.com/api</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800">🔑 LoadLink Free API</h4>
                  <p className="text-blue-700 text-sm">50 requests/minute with free account</p>
                  <p className="text-xs text-blue-600 mt-1">Canadian loads • Sign up at loadlink.ca/api</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="real-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real Load Data (Live Feed)</CardTitle>
              <p className="text-sm text-gray-600">
                {realLoads.length > 0 ? `Showing ${realLoads.length} real loads from connected sources` : 'No real load data available - connect to load boards above'}
              </p>
            </CardHeader>
            <CardContent>
              {realLoads.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {realLoads.slice(0, 20).map((load: any, index: number) => (
                    <div key={index} className="border rounded p-3 bg-green-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{load.origin} → {load.destination}</p>
                          <p className="text-sm text-gray-600">
                            {load.equipment} • Pickup: {new Date(load.pickupDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${load.rate}</p>
                          <Badge variant="outline" className="text-xs">Real Data</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No real load data available</p>
                  <p className="text-sm">Enable load boards above to start receiving real loads</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Preferred Data Sources Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free-first">Free sources first</SelectItem>
                    <SelectItem value="quality-first">Highest quality first</SelectItem>
                    <SelectItem value="speed-first">Fastest response first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="auto-fallback" />
                <Label htmlFor="auto-fallback">Auto-fallback to backup sources</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="real-only" defaultChecked />
                <Label htmlFor="real-only">Use only real data sources (no fake data)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}