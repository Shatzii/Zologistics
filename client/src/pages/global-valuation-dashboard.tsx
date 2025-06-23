import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Globe, 
  TrendingUp, 
  DollarSign, 
  Target,
  Zap,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Rocket,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Star,
  Activity,
  Calendar,
  Users,
  Truck
} from "lucide-react";

export default function GlobalValuationDashboard() {
  const { formatCurrency, formatNumber } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const { data: globalValuation, isLoading: valuationLoading } = useQuery({
    queryKey: ['/api/global/valuation'],
    retry: false,
  });

  const { data: globalGhostLoads, isLoading: ghostLoadsLoading } = useQuery({
    queryKey: ['/api/global/ghost-loads'],
    retry: false,
  });

  const { data: readinessReport, isLoading: readinessLoading } = useQuery({
    queryKey: ['/api/global/readiness-report'],
    retry: false,
  });

  const { data: centralAmericaReadiness, isLoading: caLoading } = useQuery({
    queryKey: ['/api/global/central-america-readiness'],
    retry: false,
  });

  const { data: europeReadiness, isLoading: euLoading } = useQuery({
    queryKey: ['/api/global/europe-readiness'],
    retry: false,
  });

  if (valuationLoading || ghostLoadsLoading || readinessLoading || caLoading || euLoading) {
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-blue-600 text-white';
      case 'low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getRegionColor = (region: string) => {
    const colors = {
      'north_america': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'central_america': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'europe': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'asia_pacific': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'middle_east': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'africa': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'south_america': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    };
    return colors[region as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatRegionName = (region: string) => {
    return region.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Launch Alert */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Rocket className="h-12 w-12" />
              <div>
                <h1 className="text-4xl font-bold">Global Market Launch</h1>
                <p className="text-blue-100 text-xl">
                  USA • Central America • European Union • 2-Day Deployment
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatCurrency(readinessReport?.valuation || 0)}</div>
              <div className="text-blue-200">Platform Valuation</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Immediate Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(readinessReport?.immediateRevenue || 0)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Day 1 capture potential
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Monthly Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(readinessReport?.monthlyRecurring || 0)}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Recurring monthly
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Annual Target</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(readinessReport?.annualProjection || 0)}
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Year 1 projection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span>Market Share</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {((globalValuation?.marketShare || 0) * 100).toFixed(2)}%
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Global freight market
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-600" />
                <span>Time to Market</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                {readinessReport?.timeToMarket || "2 days"}
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Deployment ready
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="market-readiness" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="market-readiness">Launch Readiness</TabsTrigger>
            <TabsTrigger value="global-opportunities">Global Opportunities</TabsTrigger>
            <TabsTrigger value="regional-analysis">Regional Analysis</TabsTrigger>
            <TabsTrigger value="valuation-metrics">Valuation Model</TabsTrigger>
          </TabsList>
          
          {/* Launch Readiness Tab */}
          <TabsContent value="market-readiness" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* USA Market */}
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span>USA Market</span>
                    <Badge className="bg-green-600 text-white">READY</Badge>
                  </CardTitle>
                  <CardDescription>
                    North American operations fully deployed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Market Size:</span>
                      <span className="font-bold">{formatCurrency(485000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Loads:</span>
                      <span className="font-bold text-green-600">2,850</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Margin:</span>
                      <span className="font-bold text-green-600">34%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate:</span>
                      <span className="font-bold text-green-600">78%</span>
                    </div>
                    <Progress value={100} className="h-3" />
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Zap className="h-4 w-4 mr-2" />
                      LIVE & OPERATING
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Central America Market */}
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="h-6 w-6 text-orange-600" />
                    <span>Central America</span>
                    <Badge className="bg-orange-600 text-white">LAUNCHING</Badge>
                  </CardTitle>
                  <CardDescription>
                    SIECA & CargoX integration complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Market Size:</span>
                      <span className="font-bold">{formatCurrency(centralAmericaReadiness?.totalOpportunity || 185000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ready Loads:</span>
                      <span className="font-bold text-orange-600">{centralAmericaReadiness?.readyLoads || 1250}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integration Cost:</span>
                      <span className="font-bold text-red-600">{formatCurrency(centralAmericaReadiness?.integrationCost || 450000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected ROI:</span>
                      <span className="font-bold text-green-600">{((centralAmericaReadiness?.projectedROI || 3.8) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={95} className="h-3" />
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      <Target className="h-4 w-4 mr-2" />
                      DEPLOY IN 2 DAYS
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* European Union Market */}
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="h-6 w-6 text-purple-600" />
                    <span>European Union</span>
                    <Badge className="bg-purple-600 text-white">LAUNCHING</Badge>
                  </CardTitle>
                  <CardDescription>
                    TimoCom & Trans.eu integration ready
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Market Size:</span>
                      <span className="font-bold">{formatCurrency(europeReadiness?.totalOpportunity || 420000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ready Loads:</span>
                      <span className="font-bold text-purple-600">{europeReadiness?.readyLoads || 3200}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integration Cost:</span>
                      <span className="font-bold text-red-600">{formatCurrency(europeReadiness?.integrationCost || 750000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected ROI:</span>
                      <span className="font-bold text-green-600">{((europeReadiness?.projectedROI || 4.2) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={92} className="h-3" />
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Target className="h-4 w-4 mr-2" />
                      DEPLOY IN 2 DAYS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Combined Launch Metrics */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-gold-600" />
                  <span>Combined Launch Impact</span>
                </CardTitle>
                <CardDescription>
                  USA + Central America + EU simultaneous deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(1090000000)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Market Access</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">7,300</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Combined Ghost Loads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{formatCurrency(1200000)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Integration Investment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">410%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average ROI</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Opportunities Tab */}
          <TabsContent value="global-opportunities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* High Priority Ghost Loads */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Critical Ghost Loads</span>
                  </CardTitle>
                  <CardDescription>
                    High-value opportunities requiring immediate action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {globalGhostLoads && globalGhostLoads
                      .filter((load: any) => load.urgencyLevel === 'critical' || load.urgencyLevel === 'high')
                      .slice(0, 6)
                      .map((load: any) => (
                      <div key={load.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getRegionColor(load.region)}`}>
                              {formatRegionName(load.region)}
                            </Badge>
                            <Badge className={`${getUrgencyColor(load.urgencyLevel)}`}>
                              {load.urgencyLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <span className="font-bold text-green-600">
                            {formatCurrency(load.usdValue)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>{load.origin.location} → {load.destination.location}</span>
                            <span>{load.equipment}</span>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs">{load.reasonForAvailability}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Regional Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <span>Regional Value Distribution</span>
                  </CardTitle>
                  <CardDescription>
                    Ghost load value breakdown by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {globalValuation?.regionalBreakdown?.map((region: any) => (
                      <div key={region.region}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{region.region}</span>
                          <span className="text-sm">
                            {formatCurrency(region.totalValue)} ({(region.totalValue / globalValuation.totalGhostLoadOpportunity * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={(region.totalValue / globalValuation.totalGhostLoadOpportunity) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <span>{formatNumber(region.totalLoads)} loads</span>
                          <span>{(region.averageMargin * 100).toFixed(0)}% avg margin</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Regional Analysis Tab */}
          <TabsContent value="regional-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {globalValuation?.regionalBreakdown?.map((region: any) => (
                <Card key={region.region} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span>{region.region}</span>
                    </CardTitle>
                    <CardDescription>
                      Market analysis and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Value:</span>
                        <span className="font-bold">{formatCurrency(region.totalValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Loads:</span>
                        <span className="font-bold">{formatNumber(region.totalLoads)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Margin:</span>
                        <span className="font-bold text-green-600">{(region.averageMargin * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversion Rate:</span>
                        <span className="font-bold text-blue-600">{(region.conversionRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Capture Time:</span>
                        <span className="font-bold">{region.averageTimeToCapture.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Market Penetration:</span>
                        <span className="font-bold text-orange-600">{(region.marketPenetration * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Competitive Advantage:</span>
                        <span className="font-bold text-purple-600">{(region.competitiveAdvantage * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Valuation Metrics Tab */}
          <TabsContent value="valuation-metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Valuation Model */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>Platform Valuation Model</span>
                  </CardTitle>
                  <CardDescription>
                    Financial metrics and valuation calculation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <span className="font-medium">Global Freight Market</span>
                      <span className="font-bold text-blue-600">{formatCurrency(globalValuation?.totalGlobalMarket || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <span className="font-medium">Ghost Load Opportunity</span>
                      <span className="font-bold text-green-600">{formatCurrency(globalValuation?.totalGhostLoadOpportunity || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                      <span className="font-medium">Capturable Market</span>
                      <span className="font-bold text-orange-600">{formatCurrency(globalValuation?.captureableMarket || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                      <span className="font-medium">Annual Revenue Projection</span>
                      <span className="font-bold text-purple-600">{formatCurrency(globalValuation?.projectedAnnualRevenue || 0)}</span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Revenue Multiple</span>
                        <span className="text-lg font-bold text-indigo-600">{globalValuation?.revenueMultiple || 0}x</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xl font-bold">Platform Valuation</span>
                        <span className="text-2xl font-bold text-gold-600">{formatCurrency(globalValuation?.platformValuation || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span>Growth Projections</span>
                  </CardTitle>
                  <CardDescription>
                    Market expansion and revenue scaling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
                      <div className="text-4xl font-bold text-green-600">{((globalValuation?.growthRate || 0) * 100).toFixed(0)}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Annual Growth Rate</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{((globalValuation?.marketShare || 0) * 100).toFixed(2)}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Market Share</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">85%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Capture Rate</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Year 1 Projections</div>
                      <div className="flex justify-between">
                        <span className="text-sm">Monthly Revenue:</span>
                        <span className="font-bold">{formatCurrency((globalValuation?.projectedAnnualRevenue || 0) / 12)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Market Penetration:</span>
                        <span className="font-bold">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Regions:</span>
                        <span className="font-bold">7 Global</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-2">3-Year Trajectory</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Year 2:</span>
                          <span className="font-bold">{formatCurrency((globalValuation?.projectedAnnualRevenue || 0) * 2.8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Year 3:</span>
                          <span className="font-bold">{formatCurrency((globalValuation?.projectedAnnualRevenue || 0) * 2.8 * 2.8)}</span>
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
    </div>
  );
}