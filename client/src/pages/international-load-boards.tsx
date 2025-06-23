import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Globe, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Building,
  Users,
  BarChart3,
  Calendar,
  Shield,
  Zap,
  Target,
  Network,
  Languages,
  CreditCard
} from "lucide-react";

export default function InternationalLoadBoards() {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const { data: loadBoards, isLoading: loadBoardsLoading } = useQuery({
    queryKey: ['/api/international/load-boards', selectedRegion === 'all' ? null : selectedRegion],
    retry: false,
  });

  const { data: globalOpportunity, isLoading: opportunityLoading } = useQuery({
    queryKey: ['/api/international/global-opportunity'],
    retry: false,
  });

  const { data: integrationCosts, isLoading: costsLoading } = useQuery({
    queryKey: ['/api/international/integration-costs'],
    retry: false,
  });

  const { data: roadmap, isLoading: roadmapLoading } = useQuery({
    queryKey: ['/api/international/roadmap'],
    retry: false,
  });

  const { data: marketData, isLoading: marketDataLoading } = useQuery({
    queryKey: ['/api/international/market-data'],
    retry: false,
  });

  const getRegionColor = (region: string) => {
    const colors = {
      'north_america': 'bg-blue-100 text-blue-800',
      'central_america': 'bg-green-100 text-green-800',
      'europe': 'bg-purple-100 text-purple-800',
      'asia_pacific': 'bg-orange-100 text-orange-800',
      'middle_east': 'bg-yellow-100 text-yellow-800',
      'africa': 'bg-red-100 text-red-800',
      'south_america': 'bg-indigo-100 text-indigo-800'
    };
    return colors[region as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'development': return 'bg-blue-600 text-white';
      case 'planned': return 'bg-orange-600 text-white';
      case 'pending': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-blue-600 text-white';
      case 'low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const formatRegionName = (region: string) => {
    return region.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loadBoardsLoading || opportunityLoading || costsLoading || roadmapLoading || marketDataLoading) {
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
            <Globe className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                International Load Boards
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Global freight network connections and market opportunities
              </p>
            </div>
          </div>
          
          {/* Region Selector */}
          <div className="flex items-center space-x-4">
            <Select onValueChange={setSelectedRegion} value={selectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="north_america">North America</SelectItem>
                <SelectItem value="central_america">Central America</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
                <SelectItem value="middle_east">Middle East</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
                <SelectItem value="south_america">South America</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Global Opportunity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>Total Market</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency((globalOpportunity?.totalMarketSize || 0) * 1000000)}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Global freight market
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Ghost Load Opportunity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency((globalOpportunity?.totalGhostLoadOpportunity || 0) * 1000000)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Available market capture
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Network className="h-5 w-5 text-purple-600" />
                <span>Load Boards</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatNumber(loadBoards?.length || 0)}
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Platform connections
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <span>Integration Cost</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(integrationCosts?.totalSetupCost || 0)}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Setup investment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="load-boards" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="load-boards">Load Boards</TabsTrigger>
            <TabsTrigger value="market-data">Market Analysis</TabsTrigger>
            <TabsTrigger value="roadmap">Integration Roadmap</TabsTrigger>
            <TabsTrigger value="costs">Financial Analysis</TabsTrigger>
          </TabsList>
          
          {/* Load Boards Tab */}
          <TabsContent value="load-boards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loadBoards && loadBoards.length > 0 ? (
                loadBoards.map((board: any) => (
                  <Card key={board.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Building className="h-5 w-5 text-blue-600" />
                          <span>{board.name}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getRegionColor(board.region)}`}>
                            {formatRegionName(board.region)}
                          </Badge>
                          <Badge className={`${getStatusColor(board.integrationStatus)}`}>
                            {board.integrationStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {board.countries.length} countries • {board.marketShare}% market share
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Dry Van Rate</div>
                            <div className="font-bold text-green-600">{formatCurrency(board.averageRates.dryVan)}/mi</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Fee</div>
                            <div className="font-bold">{formatCurrency(board.costStructure.monthlyFee)}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Features</div>
                          <div className="flex flex-wrap gap-2">
                            {board.features.realTimeTracking && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Real-time
                              </Badge>
                            )}
                            {board.features.automaticBidding && (
                              <Badge variant="outline" className="text-xs">
                                <Target className="h-3 w-3 mr-1" />
                                Auto Bidding
                              </Badge>
                            )}
                            {board.features.crossBorderSupport && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Cross-border
                              </Badge>
                            )}
                            {board.features.multiCurrencySupport && (
                              <Badge variant="outline" className="text-xs">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Multi-currency
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Languages</div>
                          <div className="flex items-center space-x-2">
                            <Languages className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {board.languages.join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Load Types</div>
                          <div className="flex flex-wrap gap-1">
                            {board.loadTypes.map((type: string) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {board.integrationStatus === 'active' ? (
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Connected
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {board.integrationStatus === 'development' ? 'In Development' : 'Plan Integration'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-2">
                  <CardContent className="text-center py-12">
                    <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Load Boards Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No load boards available for the selected region.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Market Data Tab */}
          <TabsContent value="market-data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Regional Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Regional Market Breakdown</span>
                  </CardTitle>
                  <CardDescription>
                    Ghost load opportunities by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {globalOpportunity?.regionBreakdown?.map((region: any) => (
                      <div key={region.region}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{region.region}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(region.ghostLoadOpportunity * 1000000)}
                          </span>
                        </div>
                        <Progress value={region.percentage} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(region.percentage)}% of total opportunity
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Characteristics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <span>Market Characteristics</span>
                  </CardTitle>
                  <CardDescription>
                    Regional freight characteristics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketData && marketData.slice(0, 3).map((market: any) => (
                      <div key={market.region} className="border-b pb-3 last:border-b-0">
                        <div className="font-medium mb-2">{market.region}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Avg Load Value:</span>
                            <div className="font-medium">{formatCurrency(market.averageLoadValue)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Complexity:</span>
                            <div className="font-medium capitalize">{market.regulatoryComplexity}</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-600 text-sm">Primary Commodities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {market.primaryCommodities?.slice(0, 3).map((commodity: string) => (
                              <Badge key={commodity} variant="secondary" className="text-xs">
                                {commodity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span>Integration Roadmap</span>
                </CardTitle>
                <CardDescription>
                  Planned rollout schedule for international load board connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roadmap && roadmap.map((phase: any, index: number) => (
                    <div key={`${phase.quarter}-${phase.year}`} className="relative">
                      {index < roadmap.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPriorityColor(phase.priority)}`}>
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg">
                              {phase.quarter} {phase.year}
                            </h3>
                            <Badge className={`${getPriorityColor(phase.priority)}`}>
                              {phase.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Regions</div>
                              <div className="font-medium">{phase.regions.join(', ')}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Investment</div>
                              <div className="font-medium text-red-600">{formatCurrency(phase.estimatedCost)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Projected Revenue</div>
                              <div className="font-medium text-green-600">{formatCurrency(phase.projectedRevenue)}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Load Boards</div>
                            <div className="flex flex-wrap gap-2">
                              {phase.loadBoards.map((board: string) => (
                                <Badge key={board} variant="outline" className="text-xs">
                                  {board}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Overall Costs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Integration Costs</span>
                  </CardTitle>
                  <CardDescription>
                    Total investment required for global load board connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                      <span className="font-medium">Total Setup Cost</span>
                      <span className="font-bold text-red-600">{formatCurrency(integrationCosts?.totalSetupCost || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <span className="font-medium">Monthly Operating Cost</span>
                      <span className="font-bold text-blue-600">{formatCurrency(integrationCosts?.monthlyOperatingCost || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                      <span className="font-medium">Avg Transaction Fee</span>
                      <span className="font-bold text-purple-600">{(integrationCosts?.averageTransactionFee || 0).toFixed(2)}%</span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Annual Operating Cost</span>
                        <span className="text-lg font-bold text-orange-600">
                          {formatCurrency((integrationCosts?.monthlyOperatingCost || 0) * 12)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <span>Cost by Region</span>
                  </CardTitle>
                  <CardDescription>
                    Integration costs breakdown by geographic region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrationCosts?.costByRegion?.map((region: any) => (
                      <div key={region.region} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{formatRegionName(region.region)}</span>
                          <Badge variant="outline">{region.loadBoards} boards</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Setup:</span>
                            <div className="font-medium text-red-600">{formatCurrency(region.setupCost)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Monthly:</span>
                            <div className="font-medium text-blue-600">{formatCurrency(region.monthlyCost)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
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