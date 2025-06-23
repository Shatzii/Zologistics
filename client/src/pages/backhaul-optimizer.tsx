import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Route, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Clock,
  Target,
  Zap,
  Bell,
  CheckCircle,
  AlertTriangle,
  Phone,
  MessageSquare,
  Mail,
  Truck,
  Navigation,
  Gauge,
  Star
} from "lucide-react";

export default function BackhaulOptimizer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, formatCurrency, formatNumber } = useLanguage();
  const [selectedDriver, setSelectedDriver] = useState<string>('1');

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/backhaul/opportunities', selectedDriver],
    retry: false,
    enabled: !!selectedDriver,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/backhaul/alerts', selectedDriver],
    retry: false,
    enabled: !!selectedDriver,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/backhaul/metrics'],
    retry: false,
  });

  const respondToAlertMutation = useMutation({
    mutationFn: async (data: { alertId: string; response: string; input?: string }) => {
      const response = await fetch('/api/backhaul/respond-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to respond to alert');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Response Recorded",
        description: "Your response has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/backhaul'] });
    },
    onError: () => {
      toast({
        title: "Response Failed",
        description: "Failed to record your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async (data: { driverId: number; lat: number; lng: number }) => {
      const response = await fetch('/api/backhaul/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update location');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backhaul'] });
    },
  });

  const handleAlertResponse = (alertId: string, response: string, input?: string) => {
    respondToAlertMutation.mutate({ alertId, response, input });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-blue-600 text-white';
      case 'low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const formatDistance = (miles: number) => {
    return `${formatNumber(miles)} mi`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (opportunitiesLoading || alertsLoading || metricsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Route className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Backhaul Route Optimizer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Intelligent load matching for maximum trip revenue
              </p>
            </div>
          </div>
          
          {/* Driver Selector */}
          <div className="flex items-center space-x-4">
            <Select onValueChange={setSelectedDriver} value={selectedDriver}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Driver #1 - John D.</SelectItem>
                <SelectItem value="2">Driver #2 - Maria S.</SelectItem>
                <SelectItem value="3">Driver #3 - Robert T.</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Monitored Drivers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(metrics?.totalDriversMonitored || 0)}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Active drivers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Opportunities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatNumber(metrics?.activeOpportunities || 0)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Available loads
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bell className="h-5 w-5 text-purple-600" />
                <span>Alerts Sent</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatNumber(metrics?.alertsSent || 0)}
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                This week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>Response Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {Math.round(metrics?.responseRate || 0)}%
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Driver engagement
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                <span>Avg Profit</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {formatCurrency(metrics?.averageProfitPerOpportunity || 0)}
              </div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                Per opportunity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="opportunities">Backhaul Opportunities</TabsTrigger>
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          </TabsList>
          
          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="space-y-4">
              {opportunities && opportunities.length > 0 ? (
                opportunities.map((opportunity: any, index: number) => (
                  <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Navigation className="h-5 w-5 text-blue-600" />
                          <span>Load #{opportunity.loadId}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getUrgencyColor(opportunity.urgency)}`}>
                            {opportunity.urgency.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(opportunity.matchScore)}% Match
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {opportunity.pickupLocation.address} → {opportunity.deliveryLocation.address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Rate</div>
                          <div className="font-bold text-green-600">{formatCurrency(opportunity.rate)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Distance</div>
                          <div className="font-bold">{formatDistance(opportunity.distance)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Detour</div>
                          <div className="font-bold text-orange-600">{formatDistance(opportunity.detourMiles)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Est. Profit</div>
                          <div className="font-bold text-blue-600">{formatCurrency(opportunity.estimatedProfit)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Time Added</div>
                          <div className="font-medium">{formatTime(opportunity.timeAdded)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Revenue/Mile</div>
                          <div className="font-medium">{formatCurrency(opportunity.efficiency.revenuePerMile)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Equipment</div>
                          <div className="font-medium capitalize">{opportunity.loadDetails.equipmentType.replace('_', ' ')}</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency Metrics</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className="text-xs text-gray-500">Revenue Efficiency</div>
                            <Progress value={opportunity.efficiency.revenuePerMile * 20} className="h-2" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Time Efficiency</div>
                            <Progress value={opportunity.efficiency.timeEfficiency} className="h-2" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Route Optimization</div>
                            <Progress value={opportunity.efficiency.routeOptimization} className="h-2" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Pickup: {new Date(opportunity.pickupTime).toLocaleString()}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            More Details
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Accept Load
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Backhaul Opportunities Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No suitable loads found on the selected driver's return route at this time.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              {alerts && alerts.length > 0 ? (
                alerts.map((alert: any) => (
                  <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Bell className="h-5 w-5 text-blue-600" />
                          <span>{alert.title}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getPriorityColor(alert.priority)}`}>
                            {alert.priority.toUpperCase()}
                          </Badge>
                          {alert.respondedAt && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Responded
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>
                        Sent: {new Date(alert.sentAt).toLocaleString()} • 
                        Expires: {new Date(alert.expiresAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-gray-700 dark:text-gray-300">{alert.message}</p>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Contact Methods:</span>
                        {alert.contactMethods.map((method: string) => (
                          <Badge key={method} variant="outline" className="text-xs">
                            {method === 'sms' && <MessageSquare className="h-3 w-3 mr-1" />}
                            {method === 'call' && <Phone className="h-3 w-3 mr-1" />}
                            {method === 'email' && <Mail className="h-3 w-3 mr-1" />}
                            {method === 'app_notification' && <Bell className="h-3 w-3 mr-1" />}
                            {method.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>

                      {!alert.respondedAt && (
                        <div className="flex flex-wrap gap-2">
                          {alert.responseOptions.map((option: any) => (
                            <Button
                              key={option.id}
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlertResponse(alert.id, option.action)}
                              disabled={respondToAlertMutation.isPending}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      )}

                      {alert.respondedAt && (
                        <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Response: {alert.response}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Responded at: {new Date(alert.respondedAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Active Alerts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No alerts have been sent to the selected driver recently.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Driver Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>Driver Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Backhaul optimization metrics by driver
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">Driver #1 - John D.</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">3 opportunities found</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(2850)}</div>
                        <div className="text-xs text-gray-500">Potential profit</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">Driver #2 - Maria S.</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">1 opportunity found</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(1200)}</div>
                        <div className="text-xs text-gray-500">Potential profit</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Efficiency */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5 text-blue-600" />
                    <span>System Efficiency</span>
                  </CardTitle>
                  <CardDescription>
                    Overall backhaul optimization performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Alert Response Rate</span>
                        <span className="text-sm text-gray-600">{Math.round(metrics?.responseRate || 0)}%</span>
                      </div>
                      <Progress value={metrics?.responseRate || 0} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Driver Engagement</span>
                        <span className="text-sm text-gray-600">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Route Optimization</span>
                        <span className="text-sm text-gray-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Revenue Maximization</span>
                        <span className="text-sm text-gray-600">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}