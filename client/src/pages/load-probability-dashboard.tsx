import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Clock, 
  Activity, 
  AlertTriangle,
  BarChart3,
  Zap,
  Eye,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Truck,
  Route,
  Thermometer
} from "lucide-react";

interface LoadProbabilityPrediction {
  loadId: string;
  driverId: number;
  overallProbability: number;
  confidence: number;
  factorBreakdown: {
    marketConditions: number;
    driverProfile: number;
    routeFactors: number;
    temporalFactors: number;
    competitiveFactors: number;
  };
  recommendations: {
    rateAdjustment: number;
    timingOptimization: string;
    profileEnhancements: string[];
    competitiveAdvantages: string[];
  };
  riskFactors: {
    factor: string;
    impact: number;
    mitigation: string;
  }[];
  historicalComparison: {
    similarLoads: number;
    averageProbability: number;
    successRate: number;
  };
  realTimeUpdates: {
    lastUpdated: Date;
    nextUpdateIn: number;
    volatilityAlert: boolean;
  };
}

interface LoadProbabilityAlert {
  id: string;
  driverId: number;
  alertType: 'high_probability' | 'rate_drop' | 'competition_increase' | 'market_shift' | 'timing_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionable: boolean;
  suggestedActions: string[];
  timeWindow: string;
  estimatedImpact: number;
  timestamp: Date;
}

interface MarketOverview {
  averageDemand: number;
  averageSupply: number;
  volatilityIndex: number;
  topLanes: string[];
}

export default function LoadProbabilityDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: probabilityPredictions } = useQuery<LoadProbabilityPrediction[]>({
    queryKey: ['/api/load-probability/predictions', 1],
  });

  const { data: probabilityAlerts } = useQuery<LoadProbabilityAlert[]>({
    queryKey: ['/api/load-probability/alerts', 1],
  });

  const { data: marketOverview } = useQuery<MarketOverview>({
    queryKey: ['/api/load-probability/market-overview'],
  });

  const { data: probabilityTrends } = useQuery({
    queryKey: ['/api/load-probability/trends', 1],
  });

  const calculateProbabilityMutation = useMutation({
    mutationFn: async (loadData: any) => {
      const response = await fetch('/api/load-probability/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loadData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/load-probability'] });
    }
  });

  const refreshPredictionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/load-probability/refresh', {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/load-probability'] });
    }
  });

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-100';
    if (probability >= 60) return 'text-blue-600 bg-blue-100';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-blue-600';
    if (confidence >= 55) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'border-green-200 bg-green-50',
      medium: 'border-yellow-200 bg-yellow-50',
      high: 'border-orange-200 bg-orange-50',
      critical: 'border-red-200 bg-red-50'
    };
    return colors[severity as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  const getAlertTypeIcon = (type: string) => {
    const icons = {
      high_probability: TrendingUp,
      rate_drop: TrendingDown,
      competition_increase: Users,
      market_shift: BarChart3,
      timing_opportunity: Clock
    };
    const Icon = icons[type as keyof typeof icons] || AlertTriangle;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Load Probability</h1>
          <p className="text-gray-600">AI-powered probability analysis for optimal load selection</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => refreshPredictionsMutation.mutate()}
            disabled={refreshPredictionsMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-1" />
            Analyze New Load
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {probabilityAlerts && probabilityAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High-Priority Market Alert</AlertTitle>
          <AlertDescription>
            {probabilityAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high')[0]?.message}
            <div className="mt-2">
              <Button size="sm" variant="outline" className="mr-2">
                View Details
              </Button>
              <Button size="sm" variant="outline">
                Take Action
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Load Probability</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73.2%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={73.2} className="flex-1" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+5.3%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prediction Confidence</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89.7%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={89.7} className="flex-1" />
                  <span className="text-sm text-blue-600">High Confidence</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Volatility</CardTitle>
                <Thermometer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42.3%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={42.3} className="flex-1" />
                  <span className="text-sm text-yellow-600">Moderate</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-600">Across 23 lanes</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* High Probability Opportunities */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                High Probability Opportunities
              </CardTitle>
              <CardDescription>
                Loads with 80%+ probability of acceptance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {probabilityPredictions && probabilityPredictions
                  .filter(p => p.overallProbability >= 80)
                  .slice(0, 3)
                  .map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Truck className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Load #{prediction.loadId}</h4>
                          <p className="text-sm text-gray-600">Chicago, IL → Atlanta, GA</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{prediction.overallProbability}%</div>
                        <div className="text-sm text-gray-600">Confidence: {prediction.confidence}%</div>
                      </div>
                      <Button size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Snapshot */}
          {marketOverview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{marketOverview.averageDemand.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Average Demand</div>
                    <Progress value={marketOverview.averageDemand} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{marketOverview.averageSupply.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Average Supply</div>
                    <Progress value={marketOverview.averageSupply} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{marketOverview.volatilityIndex.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Volatility Index</div>
                    <Progress value={marketOverview.volatilityIndex} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Load Predictions</CardTitle>
                <CardDescription>
                  Real-time probability analysis for available loads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {probabilityPredictions && probabilityPredictions.map((prediction, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Route className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Load #{prediction.loadId}</h4>
                            <p className="text-sm text-gray-600">Chicago, IL → Atlanta, GA • 450 miles</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold px-3 py-1 rounded-lg ${getProbabilityColor(prediction.overallProbability)}`}>
                            {prediction.overallProbability}%
                          </div>
                          <div className={`text-sm mt-1 ${getConfidenceColor(prediction.confidence)}`}>
                            {prediction.confidence}% confidence
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Market</div>
                          <div className="font-semibold">{prediction.factorBreakdown.marketConditions}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Driver</div>
                          <div className="font-semibold">{prediction.factorBreakdown.driverProfile}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Route</div>
                          <div className="font-semibold">{prediction.factorBreakdown.routeFactors}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Timing</div>
                          <div className="font-semibold">{prediction.factorBreakdown.temporalFactors}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Competition</div>
                          <div className="font-semibold">{prediction.factorBreakdown.competitiveFactors}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Updated {Math.floor((Date.now() - new Date(prediction.realTimeUpdates.lastUpdated).getTime()) / 60000)}m ago
                          </Badge>
                          {prediction.realTimeUpdates.volatilityAlert && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              High Volatility
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedLoadId(prediction.loadId)}>
                            View Analysis
                          </Button>
                          <Button size="sm">
                            Submit Quote
                          </Button>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {prediction.recommendations.rateAdjustment !== 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-1">Rate Recommendation</h5>
                          <p className="text-sm text-blue-800">
                            {prediction.recommendations.rateAdjustment > 0 ? 'Increase' : 'Decrease'} rate by {Math.abs(prediction.recommendations.rateAdjustment)}% 
                            for optimal acceptance probability
                          </p>
                        </div>
                      )}

                      {/* Risk Factors */}
                      {prediction.riskFactors.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <h5 className="font-medium text-yellow-900 mb-2">Risk Factors</h5>
                          <div className="space-y-1">
                            {prediction.riskFactors.slice(0, 2).map((risk, idx) => (
                              <div key={idx} className="text-sm text-yellow-800 flex items-center justify-between">
                                <span>{risk.factor}</span>
                                <span className="font-medium">{risk.impact > 0 ? '+' : ''}{risk.impact}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Conditions Analysis
                </CardTitle>
                <CardDescription>
                  Real-time freight market intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Lane Performance</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <span className="font-medium">Chicago → Atlanta</span>
                          <div className="text-sm text-gray-600">High demand corridor</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">85%</div>
                          <div className="text-sm text-gray-600">Avg. Probability</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <span className="font-medium">Dallas → Houston</span>
                          <div className="text-sm text-gray-600">Consistent volume</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">72%</div>
                          <div className="text-sm text-gray-600">Avg. Probability</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <span className="font-medium">LA → Phoenix</span>
                          <div className="text-sm text-gray-600">Seasonal variation</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-yellow-600">68%</div>
                          <div className="text-sm text-gray-600">Avg. Probability</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Market Drivers</h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Fuel Cost Impact</span>
                          <span className="text-red-600 font-bold">-8%</span>
                        </div>
                        <Progress value={65} className="mb-1" />
                        <p className="text-sm text-gray-600">Above baseline affecting carrier margins</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Seasonal Demand</span>
                          <span className="text-green-600 font-bold">+12%</span>
                        </div>
                        <Progress value={78} className="mb-1" />
                        <p className="text-sm text-gray-600">Peak shipping season boost</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Driver Availability</span>
                          <span className="text-orange-600 font-bold">-5%</span>
                        </div>
                        <Progress value={45} className="mb-1" />
                        <p className="text-sm text-gray-600">Tight capacity in key markets</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Landscape</CardTitle>
                <CardDescription>
                  Analysis of carrier competition and market positioning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">12.3</div>
                    <div className="text-sm text-gray-600">Avg. Competitors per Load</div>
                    <Badge className="mt-2" variant="outline">Moderate Competition</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">$2.45</div>
                    <div className="text-sm text-gray-600">Avg. Rate per Mile</div>
                    <Badge className="mt-2" variant="outline">Above Market</Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">73%</div>
                    <div className="text-sm text-gray-600">Win Rate vs Competition</div>
                    <Badge className="mt-2" variant="outline">Strong Position</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Probability Trends
                </CardTitle>
                <CardDescription>
                  Historical and predictive probability patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {probabilityTrends && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Last 24 Hours</h3>
                      <div className="space-y-2">
                        {probabilityTrends.last24Hours.slice(0, 8).map((hour: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{hour.hour}:00</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={hour.averageProbability} className="w-20" />
                              <span className="text-sm font-medium">{hour.averageProbability.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Last 7 Days</h3>
                      <div className="space-y-2">
                        {probabilityTrends.last7Days.map((day: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">Day {day.day + 1}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={day.averageProbability} className="w-20" />
                              <span className="text-sm font-medium">{day.averageProbability.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Key patterns and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Peak Performance Windows</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Tuesday-Thursday: 85% avg probability</li>
                      <li>• 8 AM - 11 AM: Highest quote acceptance</li>
                      <li>• Month-end periods: +15% probability boost</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Optimization Opportunities</h4>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• Rate flexibility: +12% probability improvement</li>
                      <li>• Equipment versatility: +8% more opportunities</li>
                      <li>• Geographic expansion: +23% load volume</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Real-Time Probability Alerts
                </CardTitle>
                <CardDescription>
                  Market changes and opportunity notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {probabilityAlerts && probabilityAlerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getAlertTypeIcon(alert.alertType)}
                          <span className="font-semibold">{alert.message}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                            {alert.severity}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Time Window: {alert.timeWindow}
                          </p>
                          <p className="text-sm font-medium">
                            Estimated Impact: ${alert.estimatedImpact.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {alert.actionable && alert.suggestedActions.slice(0, 2).map((action, idx) => (
                            <Button key={idx} size="sm" variant="outline">
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Configuration</CardTitle>
                <CardDescription>
                  Customize your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Alert Thresholds</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>High Probability Opportunities</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">≥ 80%</span>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Market Volatility Warnings</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">≥ 70%</span>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Competition Increases</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">≥ 15 carriers</span>
                          <Badge variant="outline">
                            <XCircle className="h-3 w-3 mr-1" />
                            Disabled
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Notification Methods</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Push Notifications</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Email Alerts</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>SMS Notifications</span>
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Disabled
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}