import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Calculator,
  Activity,
  Calendar,
  Users,
  Truck,
  Play,
  Pause,
  RotateCcw,
  Settings,
  ArrowUp,
  ArrowDown,
  Percent
} from "lucide-react";

interface SimulationParams {
  captureRate: number;
  operatingHours: number;
  teamSize: number;
  avgProcessingTime: number;
  seasonalMultiplier: number;
  marketPenetration: number;
}

interface RegionSimulation {
  region: string;
  enabled: boolean;
  loadCount: number;
  avgValue: number;
  captureRate: number;
  hourlyRevenue: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  annualRevenue: number;
  marginPercent: number;
  competitiveAdvantage: number;
}

export default function EarningsSimulator() {
  const { formatCurrency, formatNumber } = useLanguage();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms between updates
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [sessionStartTime] = useState(Date.now());

  // Simulation parameters
  const [params, setParams] = useState<SimulationParams>({
    captureRate: 15, // 15% capture rate
    operatingHours: 16, // 16 hours per day
    teamSize: 5, // 5 team members
    avgProcessingTime: 20, // 20 minutes per load
    seasonalMultiplier: 1.2, // 20% seasonal boost
    marketPenetration: 8 // 8% market penetration
  });

  // Regional simulations
  const [regionalSims, setRegionalSims] = useState<RegionSimulation[]>([
    {
      region: "North America",
      enabled: true,
      loadCount: 2850,
      avgValue: 2100,
      captureRate: 15,
      hourlyRevenue: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      marginPercent: 34,
      competitiveAdvantage: 85
    },
    {
      region: "Central America",
      enabled: true,
      loadCount: 1250,
      avgValue: 1950,
      captureRate: 18,
      hourlyRevenue: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      marginPercent: 42,
      competitiveAdvantage: 92
    },
    {
      region: "Europe",
      enabled: true,
      loadCount: 3200,
      avgValue: 2450,
      captureRate: 12,
      hourlyRevenue: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      marginPercent: 31,
      competitiveAdvantage: 88
    },
    {
      region: "Asia Pacific",
      enabled: false,
      loadCount: 1800,
      avgValue: 2800,
      captureRate: 10,
      hourlyRevenue: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      marginPercent: 38,
      competitiveAdvantage: 95
    },
    {
      region: "Middle East",
      enabled: false,
      loadCount: 850,
      avgValue: 2200,
      captureRate: 8,
      hourlyRevenue: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      marginPercent: 36,
      competitiveAdvantage: 98
    },
    {
      region: "Africa",
      enabled: false,
      loadCount: 650,
      avgValue: 1800,
      captureRate: 6,
      hourlyRevenue: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      marginPercent: 33,
      competitiveAdvantage: 99
    },
    {
      region: "South America",
      enabled: false,
      loadCount: 950,
      avgValue: 2050,
      captureRate: 7,
      hourlyRevenue: 0,
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      marginPercent: 35,
      competitiveAdvantage: 96
    }
  ]);

  const { data: globalGhostLoads } = useQuery({
    queryKey: ['/api/global/ghost-loads'],
    retry: false,
  });

  const { data: globalValuation } = useQuery({
    queryKey: ['/api/global/valuation'],
    retry: false,
  });

  // Calculate regional revenues based on parameters
  useEffect(() => {
    const updatedSims = regionalSims.map(sim => {
      if (!sim.enabled) return sim;

      // Hourly calculations
      const loadsPerHour = (sim.loadCount * (params.captureRate / 100) * (params.marketPenetration / 100)) / (24 * 30); // Monthly loads spread across hours
      const hourlyRevenue = loadsPerHour * sim.avgValue * (sim.marginPercent / 100) * params.seasonalMultiplier;
      
      // Daily, monthly, annual projections
      const dailyRevenue = hourlyRevenue * params.operatingHours;
      const monthlyRevenue = dailyRevenue * 30;
      const annualRevenue = monthlyRevenue * 12;

      return {
        ...sim,
        captureRate: params.captureRate,
        hourlyRevenue,
        dailyRevenue,
        monthlyRevenue,
        annualRevenue
      };
    });

    setRegionalSims(updatedSims);
  }, [params]);

  // Simulation engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const enabledRegions = regionalSims.filter(sim => sim.enabled);
      const totalHourlyRevenue = enabledRegions.reduce((sum, sim) => sum + sim.hourlyRevenue, 0);
      
      // Add random variation (±20%)
      const variation = 0.8 + (Math.random() * 0.4);
      const earningsIncrement = (totalHourlyRevenue / 3600) * (simulationSpeed / 1000) * variation; // Per second revenue
      
      setTotalEarnings(prev => prev + earningsIncrement);
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, regionalSims]);

  const toggleRegion = (regionName: string) => {
    setRegionalSims(prev => prev.map(sim => 
      sim.region === regionName ? { ...sim, enabled: !sim.enabled } : sim
    ));
  };

  const resetSimulation = () => {
    setTotalEarnings(0);
    setIsSimulating(false);
  };

  const getTotalProjections = () => {
    const enabled = regionalSims.filter(sim => sim.enabled);
    return {
      hourly: enabled.reduce((sum, sim) => sum + sim.hourlyRevenue, 0),
      daily: enabled.reduce((sum, sim) => sum + sim.dailyRevenue, 0),
      monthly: enabled.reduce((sum, sim) => sum + sim.monthlyRevenue, 0),
      annual: enabled.reduce((sum, sim) => sum + sim.annualRevenue, 0),
      regions: enabled.length,
      totalLoads: enabled.reduce((sum, sim) => sum + sim.loadCount, 0)
    };
  };

  const totals = getTotalProjections();
  const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
  const projectedSessionRevenue = totals.hourly * (sessionDuration / 60);

  const getRegionColor = (region: string) => {
    const colors = {
      "North America": "from-blue-500 to-blue-600",
      "Central America": "from-green-500 to-green-600", 
      "Europe": "from-purple-500 to-purple-600",
      "Asia Pacific": "from-orange-500 to-orange-600",
      "Middle East": "from-yellow-500 to-yellow-600",
      "Africa": "from-red-500 to-red-600",
      "South America": "from-indigo-500 to-indigo-600"
    };
    return colors[region as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calculator className="h-12 w-12" />
              <div>
                <h1 className="text-4xl font-bold">Global Earnings Simulator</h1>
                <p className="text-green-100 text-xl">
                  Real-time ghost load revenue visualization across regions
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatCurrency(totalEarnings)}</div>
              <div className="text-green-200">Live Earnings</div>
            </div>
          </div>
        </div>

        {/* Simulation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <span>Simulation Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Start/Stop Controls */}
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`flex-1 ${isSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isSimulating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isSimulating ? 'Pause' : 'Start'}
                  </Button>
                  <Button onClick={resetSimulation} variant="outline">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Label>Simulation Speed</Label>
                  <Slider
                    value={[simulationSpeed]}
                    onValueChange={([value]) => setSimulationSpeed(value)}
                    max={2000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    {simulationSpeed}ms updates ({(1000/simulationSpeed).toFixed(1)}x speed)
                  </div>
                </div>
              </div>

              {/* Capture Rate */}
              <div className="space-y-2">
                <Label>Capture Rate: {params.captureRate}%</Label>
                <Slider
                  value={[params.captureRate]}
                  onValueChange={([value]) => setParams(prev => ({ ...prev, captureRate: value }))}
                  max={50}
                  min={5}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-gray-600">
                  Percentage of ghost loads captured
                </div>
              </div>

              {/* Operating Hours */}
              <div className="space-y-2">
                <Label>Operating Hours: {params.operatingHours}h/day</Label>
                <Slider
                  value={[params.operatingHours]}
                  onValueChange={([value]) => setParams(prev => ({ ...prev, operatingHours: value }))}
                  max={24}
                  min={8}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-gray-600">
                  Daily operational hours
                </div>
              </div>

              {/* Market Penetration */}
              <div className="space-y-2">
                <Label>Market Penetration: {params.marketPenetration}%</Label>
                <Slider
                  value={[params.marketPenetration]}
                  onValueChange={([value]) => setParams(prev => ({ ...prev, marketPenetration: value }))}
                  max={25}
                  min={3}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-gray-600">
                  Market share captured
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Hourly Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totals.hourly)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Per hour projection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Daily Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(totals.daily)}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {params.operatingHours}h operation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Monthly Target</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(totals.monthly)}
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                30-day projection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span>Annual Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(totals.annual)}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Year 1 target
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Globe className="h-5 w-5 text-red-600" />
                <span>Active Regions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                {totals.regions}
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {formatNumber(totals.totalLoads)} loads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Regional Simulators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-6 w-6" />
              <span>Regional Revenue Simulators</span>
            </CardTitle>
            <CardDescription>
              Toggle regions and see real-time revenue impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {regionalSims.map((sim) => (
                <Card key={sim.region} className={`border-2 transition-all ${sim.enabled ? 'border-green-300 bg-green-50 dark:bg-green-950' : 'border-gray-200 bg-gray-50 dark:bg-gray-800'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sim.region}</CardTitle>
                      <Switch
                        checked={sim.enabled}
                        onCheckedChange={() => toggleRegion(sim.region)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sim.enabled ? (
                      <div className="space-y-3">
                        <div className={`text-center p-3 bg-gradient-to-r ${getRegionColor(sim.region)} text-white rounded-lg`}>
                          <div className="text-2xl font-bold">{formatCurrency(sim.hourlyRevenue)}</div>
                          <div className="text-sm opacity-90">Per Hour</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Daily:</span>
                            <div className="font-bold">{formatCurrency(sim.dailyRevenue)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Monthly:</span>
                            <div className="font-bold">{formatCurrency(sim.monthlyRevenue)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Loads:</span>
                            <div className="font-bold">{formatNumber(sim.loadCount)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Margin:</span>
                            <div className="font-bold text-green-600">{sim.marginPercent}%</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Competitive Edge:</span>
                            <span className="font-bold">{sim.competitiveAdvantage}%</span>
                          </div>
                          <Progress value={sim.competitiveAdvantage} className="h-2" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Region Disabled</p>
                        <p className="text-sm">Enable to see projections</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Session Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Session Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <span className="font-medium">Session Duration</span>
                  <span className="font-bold text-blue-600">{sessionDuration.toFixed(1)} min</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                  <span className="font-medium">Live Earnings</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalEarnings)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <span className="font-medium">Projected vs Actual</span>
                  <span className="font-bold text-purple-600">
                    {projectedSessionRevenue > 0 ? ((totalEarnings / projectedSessionRevenue * 100).toFixed(0)) : 0}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                  <span className="font-medium">Earnings Rate</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(sessionDuration > 0 ? (totalEarnings / sessionDuration * 60) : 0)}/hour
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parameter Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span>Parameter Impact Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Capture Rate Impact</span>
                  <div className="flex items-center space-x-2">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-bold">+{((params.captureRate - 10) * totals.annual / 10).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Operating Hours Impact</span>
                  <div className="flex items-center space-x-2">
                    <ArrowUp className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-bold">+{((params.operatingHours - 8) * totals.annual / 16).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Market Penetration Impact</span>
                  <div className="flex items-center space-x-2">
                    <ArrowUp className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-600 font-bold">+{((params.marketPenetration - 5) * totals.annual / 5).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totals.annual)}
                    </div>
                    <div className="text-sm text-gray-600">Total Annual Projection</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}