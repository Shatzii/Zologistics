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
  Globe, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Clock,
  Target,
  Zap,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  Star,
  RefreshCw,
  Truck,
  Building2
} from "lucide-react";

export default function LoadBoardOptimizer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, formatCurrency, formatNumber } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const { data: optimizations, isLoading: optimizationsLoading } = useQuery({
    queryKey: ['/api/load-boards/optimizations'],
    retry: false,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/load-boards/metrics'],
    retry: false,
  });

  const switchRegionMutation = useMutation({
    mutationFn: async (region: string) => {
      const response = await fetch('/api/load-boards/switch-region', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region }),
      });
      if (!response.ok) throw new Error('Failed to switch region');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Region Switched Successfully!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/load-boards'] });
    },
    onError: (error) => {
      toast({
        title: "Switch Failed",
        description: "Failed to switch load board region. Please try again.",
        variant: "destructive",
      });
    },
  });

  const optimizeRegionMutation = useMutation({
    mutationFn: async (region: string) => {
      const response = await fetch(`/api/load-boards/optimize/${region}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to optimize region');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Optimization Complete!",
        description: "Load boards have been optimized for the selected region.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/load-boards'] });
    },
  });

  const handleRegionSwitch = (region: string) => {
    setSelectedRegion(region);
    switchRegionMutation.mutate(region);
  };

  const getRegionDisplayName = (region: string) => {
    const regionNames = {
      'north_america': 'North America',
      'central_america': 'Central America',
      'europe': 'Europe',
      'asia_pacific': 'Asia Pacific'
    };
    return regionNames[region as keyof typeof regionNames] || region;
  };

  const getOptimizationColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRegionFlag = (region: string) => {
    const flags = {
      'north_america': '🇺🇸',
      'central_america': '🇬🇹',
      'europe': '🇪🇺',
      'asia_pacific': '🌏'
    };
    return flags[region as keyof typeof flags] || '🌍';
  };

  if (optimizationsLoading || metricsLoading) {
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
                Regional Load Board Optimizer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Automatically optimize load boards based on geographic regions
              </p>
            </div>
          </div>
          
          {/* Region Selector */}
          <div className="flex items-center space-x-4">
            <Select onValueChange={handleRegionSwitch} value={selectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Switch Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north_america">🇺🇸 North America</SelectItem>
                <SelectItem value="central_america">🇬🇹 Central America</SelectItem>
                <SelectItem value="europe">🇪🇺 Europe</SelectItem>
                <SelectItem value="asia_pacific">🌏 Asia Pacific</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => selectedRegion && optimizeRegionMutation.mutate(selectedRegion)}
              disabled={!selectedRegion || optimizeRegionMutation.isPending}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Optimize
            </Button>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Total Load Boards</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(metrics?.totalLoadBoards || 0)}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Across {metrics?.totalRegions || 0} regions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-600" />
                <span>Daily Loads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatNumber(metrics?.totalEstimatedLoads || 0)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Estimated per day
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span>Projected Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(metrics?.totalProjectedRevenue || 0)}
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Monthly potential
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Star className="h-5 w-5 text-orange-600" />
                <span>Top Performers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {metrics?.topPerformingBoards?.length || 0}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Optimized boards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="regional" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="regional">Regional Overview</TabsTrigger>
            <TabsTrigger value="optimization">Optimization Details</TabsTrigger>
            <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          </TabsList>
          
          {/* Regional Overview Tab */}
          <TabsContent value="regional" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {optimizations && Object.entries(optimizations).map(([region, regionOptimizations]: [string, any[]]) => (
                <Card key={region} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getRegionFlag(region)}</span>
                        <span>{getRegionDisplayName(region)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {regionOptimizations.length} boards
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {regionOptimizations.slice(0, 3).map((optimization: any, index: number) => (
                      <div key={optimization.boardId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm truncate">
                            {optimization.boardId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {formatNumber(optimization.estimatedLoadsPerDay)} loads/day
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-xs ${getOptimizationColor(optimization.optimizationScore)}`}>
                            {optimization.optimizationScore}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      onClick={() => handleRegionSwitch(region)}
                      disabled={switchRegionMutation.isPending}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      {switchRegionMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <MapPin className="h-4 w-4 mr-2" />
                      )}
                      Switch to {getRegionDisplayName(region)}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Optimization Details Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="space-y-4">
              {metrics?.topPerformingBoards?.map((board: any, index: number) => (
                <Card key={board.boardId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-lg">{getRegionFlag(board.region)}</span>
                        <span>{board.boardId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                      </CardTitle>
                      <Badge className={`${getOptimizationColor(board.optimizationScore)}`}>
                        {board.optimizationScore}% Optimized
                      </Badge>
                    </div>
                    <CardDescription>
                      {getRegionDisplayName(board.region)} • {formatNumber(board.estimatedLoadsPerDay)} loads/day
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Market Share</div>
                        <div className="font-bold">{Math.round(board.factors.marketShare * 100)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rate</div>
                        <div className="font-bold">{Math.round(board.factors.avgRate * 100)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Load Volume</div>
                        <div className="font-bold">{Math.round(board.factors.loadVolume * 100)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Compliance</div>
                        <div className="font-bold">{Math.round(board.factors.compliance * 100)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Language</div>
                        <div className="font-bold">{Math.round(board.factors.language * 100)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Timezone</div>
                        <div className="font-bold">{Math.round(board.factors.timezone * 100)}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Optimization Recommendations:</h4>
                      {board.recommendations?.map((rec: string, recIndex: number) => (
                        <div key={recIndex} className="flex items-start space-x-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Analytics Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Revenue Projection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>Revenue Projections</span>
                  </CardTitle>
                  <CardDescription>
                    Monthly revenue potential by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizations && Object.entries(optimizations).map(([region, regionOptimizations]: [string, any[]]) => {
                      const totalRevenue = regionOptimizations.reduce((sum: number, opt: any) => sum + opt.projectedRevenue, 0);
                      return (
                        <div key={region} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>{getRegionFlag(region)}</span>
                            <span className="font-medium">{getRegionDisplayName(region)}</span>
                          </div>
                          <span className="font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Load Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Load Distribution</span>
                  </CardTitle>
                  <CardDescription>
                    Daily load estimates by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimizations && Object.entries(optimizations).map(([region, regionOptimizations]: [string, any[]]) => {
                      const totalLoads = regionOptimizations.reduce((sum: number, opt: any) => sum + opt.estimatedLoadsPerDay, 0);
                      return (
                        <div key={region} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{getRegionFlag(region)}</span>
                              <span className="font-medium">{getRegionDisplayName(region)}</span>
                            </div>
                            <span className="font-bold">{formatNumber(totalLoads)} loads</span>
                          </div>
                          <Progress 
                            value={(totalLoads / (metrics?.totalEstimatedLoads || 1)) * 100} 
                            className="h-2"
                          />
                        </div>
                      );
                    })}
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