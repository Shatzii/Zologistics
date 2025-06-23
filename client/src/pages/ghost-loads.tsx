import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Ghost, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Truck, 
  MapPin, 
  Clock, 
  Zap,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Search
} from "lucide-react";

export default function GhostLoads() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, formatCurrency, formatNumber } = useLanguage();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  // Fetch ghost loads data
  const { data: ghostLoads = [] } = useQuery({
    queryKey: ['/api/ghost-loads/all'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/ghost-loads/analytics'],
  });

  const { data: topMatches = [] } = useQuery({
    queryKey: ['/api/ghost-loads/matches/top/20'],
  });

  const { data: recentScans = [] } = useQuery({
    queryKey: ['/api/ghost-loads/scans/recent/10'],
  });

  // Mutations
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ghost-loads/optimize', { method: 'POST' });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Optimization Complete",
        description: `Found ${data.matchesFound} new optimization opportunities`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ghost-loads'] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await fetch(`/api/ghost-loads/assign/${matchId}`, { method: 'POST' });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Assignment Successful" : "Assignment Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ghost-loads'] });
    },
  });

  const formatDistance = (miles: number) => `${miles.toLocaleString()} mi`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'discovered': return 'bg-blue-500';
      case 'analyzing': return 'bg-yellow-500';
      case 'matching': return 'bg-orange-500';
      case 'assigned': return 'bg-green-500';
      case 'in_transit': return 'bg-purple-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Ghost className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('ghost_loads.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('ghost_loads.subtitle')}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => optimizeMutation.mutate()}
            disabled={optimizeMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {optimizeMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Run Optimization
          </Button>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Total Ghost Loads</CardTitle>
                <Ghost className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalGhostLoads}</div>
                <p className="text-xs text-muted-foreground">
                  Active opportunities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalPotentialRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From captured loads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analytics.averageMarginPotential * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Profit margin potential
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Ghost loads captured
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matches">Route Matches</TabsTrigger>
            <TabsTrigger value="ghost-loads">Ghost Loads</TabsTrigger>
            <TabsTrigger value="scans">Market Scans</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Route Optimization Matches */}
          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Route Optimization Matches</CardTitle>
                <CardDescription>
                  Ghost loads optimally matched to drivers already on routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topMatches.map((match: any, index: number) => (
                    <div 
                      key={`${match.driverId}-${match.ghostLoadMatch.ghostLoadId}`}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                            <Truck className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Driver #{match.driverId}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {match.currentRoute.origin} → {match.currentRoute.destination}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(match.ghostLoadMatch.netProfit)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {(match.ghostLoadMatch.profitMargin * 100).toFixed(1)}% margin
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-sm font-medium">Additional Miles</div>
                          <div className="text-lg text-orange-600">+{match.ghostLoadMatch.additionalMiles}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">Feasibility</div>
                          <div className="text-lg text-blue-600">{match.feasibilityScore}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">Acceptance</div>
                          <div className="text-lg text-green-600">{match.driverAcceptanceProbability}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{match.ghostLoadMatch.insertionPoint.replace('_', ' ')}</Badge>
                          <Badge className={getUrgencyColor('medium')}>
                            {formatDistance(match.optimizationImpact.deadheadReduction)} saved
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            assignMutation.mutate(`${match.driverId}-${match.ghostLoadMatch.ghostLoadId}`);
                          }}
                          disabled={assignMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {assignMutation.isPending ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ghost Loads */}
          <TabsContent value="ghost-loads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discovered Ghost Loads</CardTitle>
                <CardDescription>
                  Loads that fell through market cracks and are available for optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ghostLoads.map((load: any) => (
                    <div key={load.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(load.status)}`} />
                          <div>
                            <h4 className="font-semibold">{load.origin.location} → {load.destination.location}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {load.equipment} • {load.weight.toLocaleString()} lbs • {formatDistance(load.distance)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(load.optimizedRate)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            vs {formatCurrency(load.marketRate)} market
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium">Urgency</div>
                          <Badge className={getUrgencyColor(load.urgencyLevel)}>
                            {load.urgencyLevel}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Time on Market</div>
                          <div className="text-sm">{load.timeOnMarket}h</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Optimization Score</div>
                          <div className="text-sm font-bold text-blue-600">{load.routeOptimizationScore}/100</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Margin Potential</div>
                          <div className="text-sm font-bold text-green-600">
                            {(load.marginPotential * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Why Available:</strong> {load.reasonForAvailability}
                      </div>
                      
                      <Progress value={load.routeOptimizationScore} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Scans */}
          <TabsContent value="scans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Market Scans</CardTitle>
                <CardDescription>
                  Automated scanning for ghost load opportunities across multiple sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentScans.map((scan: any) => (
                    <div key={scan.scanId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Search className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold">Scan #{scan.scanId.split('-')[1]}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(scan.scanTimestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">
                            {scan.ghostLoadsIdentified} found
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            from {scan.totalLoadsScanned.toLocaleString()} scanned
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium">Potential Revenue</div>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(scan.opportunityValue.totalPotentialRevenue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Avg Margin</div>
                          <div className="text-lg font-bold text-blue-600">
                            {(scan.opportunityValue.averageMarginPotential * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Network Value</div>
                          <div className="text-lg font-bold text-orange-600">
                            {formatCurrency(scan.opportunityValue.networkOptimizationValue)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          Expired: {scan.categoryBreakdown.expiredPostings}
                        </Badge>
                        <Badge variant="outline">
                          Cancelled: {scan.categoryBreakdown.cancelledBookings}
                        </Badge>
                        <Badge variant="outline">
                          Oversight: {scan.categoryBreakdown.brokerOversights}
                        </Badge>
                        <Badge variant="outline">
                          Timing: {scan.categoryBreakdown.timingMismatches}
                        </Badge>
                        <Badge variant="outline">
                          Disputes: {scan.categoryBreakdown.rateDisputes}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Ghost load sources by revenue potential</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.topCategories?.map((category: any) => (
                    <div key={category.category} className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {category.count} loads
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(category.value)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(Math.round(category.value / category.count))} avg
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Impact</CardTitle>
                  <CardDescription>Total value created through optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Direct Revenue</span>
                      <span className="font-bold">{formatCurrency(analytics?.totalPotentialRevenue || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Network Optimization</span>
                      <span className="font-bold">{formatCurrency(analytics?.totalNetworkValue || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold">Total Value Created</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency((analytics?.totalPotentialRevenue || 0) + (analytics?.totalNetworkValue || 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Billion Dollar Opportunity Card */}
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Billion Dollar Ghost Load Market</span>
                </CardTitle>
                <CardDescription>
                  Estimated $1B+ in annual lost load value across North America alone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">$1.2B+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Annual Lost Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">15-25%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Market Capture Target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$180-300M</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Potential</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">35-45%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Profit Margins</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Match Detail Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Route Optimization Details</CardTitle>
                <CardDescription>
                  Driver #{selectedMatch.driverId} - Ghost Load Optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Current Route</h4>
                    <p className="text-sm">{selectedMatch.currentRoute.origin} → {selectedMatch.currentRoute.destination}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMatch.currentRoute.currentProgress}% complete
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Ghost Load</h4>
                    <p className="text-sm">ID: {selectedMatch.ghostLoadMatch.ghostLoadId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Insert: {selectedMatch.ghostLoadMatch.insertionPoint.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold">Financial Impact</h4>
                    <div className="space-y-1 text-sm">
                      <div>Revenue: {formatCurrency(selectedMatch.ghostLoadMatch.revenueGenerated)}</div>
                      <div>Fuel Cost: {formatCurrency(selectedMatch.ghostLoadMatch.additionalFuelCost)}</div>
                      <div className="font-bold text-green-600">
                        Net Profit: {formatCurrency(selectedMatch.ghostLoadMatch.netProfit)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Route Changes</h4>
                    <div className="space-y-1 text-sm">
                      <div>+{selectedMatch.ghostLoadMatch.additionalMiles} miles</div>
                      <div>+{selectedMatch.ghostLoadMatch.additionalTime.toFixed(1)} hours</div>
                      <div className="text-green-600">
                        -{selectedMatch.optimizationImpact.deadheadReduction} deadhead
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Success Factors</h4>
                    <div className="space-y-1 text-sm">
                      <div>Feasibility: {selectedMatch.feasibilityScore}%</div>
                      <div>Acceptance: {selectedMatch.driverAcceptanceProbability}%</div>
                      <div>Risk: {selectedMatch.customerSatisfactionRisk}%</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedMatch(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      assignMutation.mutate(`${selectedMatch.driverId}-${selectedMatch.ghostLoadMatch.ghostLoadId}`);
                      setSelectedMatch(null);
                    }}
                    disabled={assignMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Assign Load
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}