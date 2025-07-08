import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, DollarSign, Settings, Key } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoadBoardSource {
  id: string;
  name: string;
  type: 'api' | 'scraping';
  isActive: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  loadVolume: number;
  costStructure: {
    subscriptionRequired: boolean;
    monthlyFee?: number;
    perLoadFee?: number;
    enterpriseOnly: boolean;
  };
  authentication: {
    required: boolean;
    type: 'api_key' | 'username_password' | 'oauth';
    credentialEnvVar?: string;
  };
  specialization: string[];
  coverage: {
    regions: string[];
    equipmentTypes: string[];
  };
}

interface PaymentSettings {
  stripeEnabled: boolean;
  stripeFees: number;
  driverSubscriptionFee: number;
  premiumFeatures: string[];
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const { data: loadBoardSources = [], isLoading: loadingBoards } = useQuery({
    queryKey: ['/api/admin/load-board-sources'],
  });

  const { data: paymentSettings, isLoading: loadingPayment } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
  });

  const { data: systemStats } = useQuery({
    queryKey: ['/api/admin/system-stats'],
  });

  const updateLoadBoardMutation = useMutation({
    mutationFn: async ({ boardId, enabled, apiKey }: { boardId: string; enabled: boolean; apiKey?: string }) => {
      return apiRequest('PATCH', `/api/admin/load-board-sources/${boardId}`, {
        enabled,
        apiKey
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/load-board-sources'] });
      toast({
        title: "Load Board Updated",
        description: "Load board configuration saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async (settings: Partial<PaymentSettings>) => {
      return apiRequest('PATCH', '/api/admin/payment-settings', settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      toast({
        title: "Payment Settings Updated",
        description: "Payment configuration saved successfully",
      });
    },
  });

  const handleLoadBoardToggle = (boardId: string, enabled: boolean) => {
    const board = loadBoardSources.find((b: LoadBoardSource) => b.id === boardId);
    
    if (enabled && board?.authentication.required && !board.isActive) {
      const apiKey = apiKeys[boardId];
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: `Please enter API key for ${board.name}`,
          variant: "destructive",
        });
        return;
      }
    }

    updateLoadBoardMutation.mutate({
      boardId,
      enabled,
      apiKey: apiKeys[boardId]
    });
  };

  const handleApiKeyUpdate = (boardId: string, apiKey: string) => {
    setApiKeys(prev => ({ ...prev, [boardId]: apiKey }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loadingBoards || loadingPayment) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage load board subscriptions and payment settings</p>
      </div>

      <Tabs defaultValue="load-boards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="load-boards">Load Boards</TabsTrigger>
          <TabsTrigger value="payments">Payment Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="load-boards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadBoardSources.map((board: LoadBoardSource) => (
              <Card key={board.id} className={`${board.isActive ? 'border-green-500' : 'border-gray-300'}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg">{board.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={getPriorityColor(board.priority)}>
                        {board.priority}
                      </Badge>
                      <Badge variant="outline">
                        {board.loadVolume.toLocaleString()} loads/day
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={board.isActive}
                    onCheckedChange={(enabled) => handleLoadBoardToggle(board.id, enabled)}
                    disabled={updateLoadBoardMutation.isPending}
                  />
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Type:</strong> {board.type}</p>
                    <p><strong>Regions:</strong> {board.coverage.regions.join(', ')}</p>
                    <p><strong>Equipment:</strong> {board.coverage.equipmentTypes.join(', ')}</p>
                  </div>

                  {board.authentication.required && (
                    <div className="space-y-2">
                      <Label htmlFor={`api-key-${board.id}`} className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        API Key
                      </Label>
                      <Input
                        id={`api-key-${board.id}`}
                        type="password"
                        placeholder={`Enter ${board.name} API key`}
                        value={apiKeys[board.id] || ''}
                        onChange={(e) => handleApiKeyUpdate(board.id, e.target.value)}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Environment variable: {board.authentication.credentialEnvVar}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Monthly Cost:</span>
                      <span className="font-semibold">
                        {board.costStructure.monthlyFee 
                          ? `$${board.costStructure.monthlyFee}`
                          : board.costStructure.perLoadFee
                          ? `$${board.costStructure.perLoadFee}/load`
                          : 'Free'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {board.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs">
                        {board.isActive ? 'Active & Connected' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Setup Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Critical Load Boards (High Volume)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• DAT LoadBoard - $149/month (500K+ loads)</li>
                    <li>• Truckstop.com - $129/month (300K+ loads)</li>
                    <li>• CH Robinson - $299/month (200K+ loads)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Free Load Boards (Active)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 123LoadBoard - Free tier available</li>
                    <li>• FreeFreightSearch - Completely free</li>
                    <li>• uShip - Free tier for carriers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Driver Subscription Fee</Label>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <Input
                      type="number"
                      value={paymentSettings?.driverSubscriptionFee || 79}
                      onChange={(e) => updatePaymentMutation.mutate({
                        driverSubscriptionFee: Number(e.target.value)
                      })}
                    />
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stripe Processing Fee</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={paymentSettings?.stripeFees || 2.9}
                      onChange={(e) => updatePaymentMutation.mutate({
                        stripeFees: Number(e.target.value)
                      })}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Revenue Calculation</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Driver Pays</p>
                    <p className="text-xl font-bold text-green-600">
                      ${paymentSettings?.driverSubscriptionFee || 79}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Load Board Costs</p>
                    <p className="text-xl font-bold text-blue-600">
                      $577
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Your Profit</p>
                    <p className="text-xl font-bold text-purple-600">
                      ${Math.max(0, (paymentSettings?.driverSubscriptionFee || 79) - 577)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Load Boards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {systemStats?.activeLoadBoards || 0}
                </div>
                <p className="text-muted-foreground">
                  {systemStats?.totalLoadBoards || 0} total configured
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Daily Load Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {systemStats?.dailyLoadVolume?.toLocaleString() || 0}
                </div>
                <p className="text-muted-foreground">loads aggregated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${systemStats?.monthlyRevenue?.toLocaleString() || 0}
                </div>
                <p className="text-muted-foreground">
                  {systemStats?.activeDrivers || 0} active drivers
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}