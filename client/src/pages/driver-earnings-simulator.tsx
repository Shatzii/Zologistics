import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Truck, 
  TrendingUp, 
  DollarSign, 
  MapPin,
  Route,
  Fuel,
  Clock,
  Calculator,
  Navigation,
  Plus,
  Target,
  Activity,
  Calendar,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  BarChart3
} from "lucide-react";

interface LoadOpportunity {
  id: string;
  type: 'pickup' | 'delivery' | 'backhaul' | 'deadhead_reduction';
  origin: string;
  destination: string;
  distance: number;
  detourMiles: number;
  rate: number;
  equipment: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timeWindow: { start: string; end: string };
  efficiency: number;
  profitability: number;
}

interface RouteOptimization {
  originalRoute: {
    origin: string;
    destination: string;
    distance: number;
    baseRate: number;
    fuelCost: number;
    estimatedTime: number;
  };
  optimizedRoute: {
    totalDistance: number;
    totalRate: number;
    totalFuelCost: number;
    estimatedTime: number;
    additionalLoads: LoadOpportunity[];
  };
  improvements: {
    additionalRevenue: number;
    revenueIncrease: number;
    efficiencyGain: number;
    deadheadReduction: number;
    fuelSavings: number;
  };
}

export default function DriverEarningsSimulator() {
  const { formatCurrency, formatNumber } = useLanguage();
  const [currentRoute, setCurrentRoute] = useState({
    origin: "Dallas, TX",
    destination: "Chicago, IL",
    distance: 925,
    baseRate: 2800,
    equipment: "Dry Van"
  });

  const [driverPreferences, setDriverPreferences] = useState({
    maxDetourMiles: 50,
    preferredEquipment: ["Dry Van", "Reefer"],
    minimumRate: 2.50, // per mile
    maxAdditionalHours: 4,
    fuelMpg: 6.5,
    fuelPrice: 3.85
  });

  const [optimizationResults, setOptimizationResults] = useState<RouteOptimization | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Sample load opportunities along the route
  const [availableLoads] = useState<LoadOpportunity[]>([
    {
      id: "load-001",
      type: "pickup",
      origin: "Fort Worth, TX",
      destination: "Oklahoma City, OK",
      distance: 195,
      detourMiles: 25,
      rate: 650,
      equipment: "Dry Van",
      urgency: "high",
      timeWindow: { start: "14:00", end: "18:00" },
      efficiency: 92,
      profitability: 3.33
    },
    {
      id: "load-002",
      type: "backhaul",
      origin: "Springfield, IL",
      destination: "Memphis, TN",
      distance: 285,
      detourMiles: 35,
      rate: 875,
      equipment: "Dry Van",
      urgency: "medium",
      timeWindow: { start: "08:00", end: "16:00" },
      efficiency: 88,
      profitability: 3.07
    },
    {
      id: "load-003",
      type: "deadhead_reduction",
      origin: "Chicago, IL",
      destination: "Milwaukee, WI",
      distance: 92,
      detourMiles: 0,
      rate: 350,
      equipment: "Dry Van",
      urgency: "critical",
      timeWindow: { start: "16:00", end: "20:00" },
      efficiency: 95,
      profitability: 3.80
    },
    {
      id: "load-004",
      type: "pickup",
      origin: "St. Louis, MO",
      destination: "Indianapolis, IN",
      distance: 242,
      detourMiles: 42,
      rate: 725,
      equipment: "Dry Van",
      urgency: "high",
      timeWindow: { start: "10:00", end: "14:00" },
      efficiency: 90,
      profitability: 2.99
    },
    {
      id: "load-005",
      type: "delivery",
      origin: "Joliet, IL",
      destination: "Rockford, IL",
      distance: 78,
      detourMiles: 15,
      rate: 280,
      equipment: "Dry Van",
      urgency: "low",
      timeWindow: { start: "09:00", end: "17:00" },
      efficiency: 85,
      profitability: 3.59
    }
  ]);

  // Optimize route when current route changes
  useEffect(() => {
    optimizeRoute();
  }, [currentRoute, driverPreferences]);

  const optimizeRoute = () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization delay
    setTimeout(() => {
      const baseRevenue = currentRoute.baseRate;
      const baseFuelCost = (currentRoute.distance / driverPreferences.fuelMpg) * driverPreferences.fuelPrice;
      
      // Filter loads based on preferences
      const suitableLoads = availableLoads.filter(load => 
        load.detourMiles <= driverPreferences.maxDetourMiles &&
        driverPreferences.preferredEquipment.includes(load.equipment) &&
        load.profitability >= driverPreferences.minimumRate
      );

      // Select best combination of loads
      const selectedLoads = suitableLoads
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 3); // Max 3 additional loads

      const additionalRevenue = selectedLoads.reduce((sum, load) => sum + load.rate, 0);
      const additionalDistance = selectedLoads.reduce((sum, load) => sum + load.detourMiles, 0);
      const additionalFuelCost = (additionalDistance / driverPreferences.fuelMpg) * driverPreferences.fuelPrice;
      
      const totalDistance = currentRoute.distance + additionalDistance;
      const totalRate = baseRevenue + additionalRevenue;
      const totalFuelCost = baseFuelCost + additionalFuelCost;
      
      const improvements = {
        additionalRevenue,
        revenueIncrease: (additionalRevenue / baseRevenue) * 100,
        efficiencyGain: selectedLoads.length > 0 ? selectedLoads.reduce((sum, load) => sum + load.efficiency, 0) / selectedLoads.length : 0,
        deadheadReduction: selectedLoads.filter(load => load.type === 'deadhead_reduction').length * 15, // 15% per deadhead reduction
        fuelSavings: Math.max(0, baseFuelCost - totalFuelCost + 50) // Efficiency savings
      };

      setOptimizationResults({
        originalRoute: {
          origin: currentRoute.origin,
          destination: currentRoute.destination,
          distance: currentRoute.distance,
          baseRate: currentRoute.baseRate,
          fuelCost: baseFuelCost,
          estimatedTime: currentRoute.distance / 55 // Assuming 55 mph average
        },
        optimizedRoute: {
          totalDistance,
          totalRate,
          totalFuelCost,
          estimatedTime: totalDistance / 55,
          additionalLoads: selectedLoads
        },
        improvements
      });
      
      setIsOptimizing(false);
    }, 1500);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-blue-600 text-white';
      case 'low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getLoadTypeIcon = (type: string) => {
    switch (type) {
      case 'pickup': return <Plus className="h-4 w-4" />;
      case 'delivery': return <Target className="h-4 w-4" />;
      case 'backhaul': return <Route className="h-4 w-4" />;
      case 'deadhead_reduction': return <Zap className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-700 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calculator className="h-12 w-12" />
              <div>
                <h1 className="text-4xl font-bold">Driver Route Optimizer</h1>
                <p className="text-blue-100 text-xl">
                  Maximize earnings by finding additional loads along your route
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {optimizationResults ? formatCurrency(optimizationResults.improvements.additionalRevenue) : "$0"}
              </div>
              <div className="text-blue-200">Additional Revenue</div>
            </div>
          </div>
        </div>

        {/* Current Route Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Route className="h-6 w-6" />
              <span>Current Route</span>
            </CardTitle>
            <CardDescription>
              Enter your main route to find optimization opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label>Origin</Label>
                <Input
                  value={currentRoute.origin}
                  onChange={(e) => setCurrentRoute(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="Starting city"
                />
              </div>
              <div>
                <Label>Destination</Label>
                <Input
                  value={currentRoute.destination}
                  onChange={(e) => setCurrentRoute(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Destination city"
                />
              </div>
              <div>
                <Label>Distance (miles)</Label>
                <Input
                  type="number"
                  value={currentRoute.distance}
                  onChange={(e) => setCurrentRoute(prev => ({ ...prev, distance: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Base Rate</Label>
                <Input
                  type="number"
                  value={currentRoute.baseRate}
                  onChange={(e) => setCurrentRoute(prev => ({ ...prev, baseRate: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Equipment</Label>
                <Input
                  value={currentRoute.equipment}
                  onChange={(e) => setCurrentRoute(prev => ({ ...prev, equipment: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimization Results */}
        {isOptimizing ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Optimizing Your Route</h3>
                <p className="text-gray-600">Finding the best additional loads...</p>
              </div>
            </CardContent>
          </Card>
        ) : optimizationResults && (
          <div className="space-y-6">
            
            {/* Optimization Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Additional Revenue</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(optimizationResults.improvements.additionalRevenue)}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    +{optimizationResults.improvements.revenueIncrease.toFixed(1)}% increase
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Route className="h-5 w-5 text-blue-600" />
                    <span>Total Distance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {formatNumber(optimizationResults.optimizedRoute.totalDistance)}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    +{optimizationResults.optimizedRoute.totalDistance - optimizationResults.originalRoute.distance} miles
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span>Efficiency Gain</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {optimizationResults.improvements.efficiencyGain.toFixed(0)}%
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Route optimization
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Fuel className="h-5 w-5 text-orange-600" />
                    <span>Fuel Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {formatCurrency(optimizationResults.optimizedRoute.totalFuelCost)}
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Total fuel cost
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Route Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Original Route */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <span>Original Route</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium">Route</span>
                      <span className="text-gray-600">
                        {optimizationResults.originalRoute.origin} → {optimizationResults.originalRoute.destination}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Distance:</span>
                        <div className="font-bold">{formatNumber(optimizationResults.originalRoute.distance)} mi</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Revenue:</span>
                        <div className="font-bold">{formatCurrency(optimizationResults.originalRoute.baseRate)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Fuel Cost:</span>
                        <div className="font-bold">{formatCurrency(optimizationResults.originalRoute.fuelCost)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Est. Time:</span>
                        <div className="font-bold">{optimizationResults.originalRoute.estimatedTime.toFixed(1)}h</div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Net Profit:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {formatCurrency(optimizationResults.originalRoute.baseRate - optimizationResults.originalRoute.fuelCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Optimized Route */}
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-green-600" />
                    <span>Optimized Route</span>
                    <Badge className="bg-green-600 text-white">RECOMMENDED</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <span className="font-medium">Enhanced Route</span>
                      <span className="text-green-600 font-bold">
                        +{optimizationResults.optimizedRoute.additionalLoads.length} loads
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Total Distance:</span>
                        <div className="font-bold">{formatNumber(optimizationResults.optimizedRoute.totalDistance)} mi</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Total Revenue:</span>
                        <div className="font-bold text-green-600">{formatCurrency(optimizationResults.optimizedRoute.totalRate)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Fuel Cost:</span>
                        <div className="font-bold">{formatCurrency(optimizationResults.optimizedRoute.totalFuelCost)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Est. Time:</span>
                        <div className="font-bold">{optimizationResults.optimizedRoute.estimatedTime.toFixed(1)}h</div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Net Profit:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(optimizationResults.optimizedRoute.totalRate - optimizationResults.optimizedRoute.totalFuelCost)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-green-600">Improvement:</span>
                        <span className="font-bold text-green-600">
                          +{formatCurrency(optimizationResults.improvements.additionalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Load Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-6 w-6" />
                  <span>Recommended Additional Loads</span>
                </CardTitle>
                <CardDescription>
                  Optimize your route with these carefully selected opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationResults.optimizedRoute.additionalLoads.map((load, index) => (
                    <div key={load.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getLoadTypeIcon(load.type)}
                            <span className="font-medium capitalize">{load.type.replace('_', ' ')}</span>
                          </div>
                          <Badge className={getUrgencyColor(load.urgency)}>
                            {load.urgency.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {load.equipment}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{formatCurrency(load.rate)}</div>
                          <div className="text-sm text-gray-600">${load.profitability.toFixed(2)}/mi</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Route:</span>
                          <div className="font-medium">{load.origin} → {load.destination}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Distance:</span>
                          <div className="font-medium">{load.distance} mi (+{load.detourMiles} detour)</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Time Window:</span>
                          <div className="font-medium">{load.timeWindow.start} - {load.timeWindow.end}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Efficiency:</span>
                          <div className="font-medium">{load.efficiency}%</div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress value={load.efficiency} className="h-2" />
                      </div>
                    </div>
                  ))}
                  
                  {optimizationResults.optimizedRoute.additionalLoads.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No suitable additional loads found</p>
                      <p className="text-sm">Try adjusting your preferences to see more opportunities</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Driver Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Optimization Preferences</span>
            </CardTitle>
            <CardDescription>
              Customize the optimization to match your driving preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="space-y-2">
                <Label>Max Detour Miles: {driverPreferences.maxDetourMiles}</Label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={driverPreferences.maxDetourMiles}
                  onChange={(e) => setDriverPreferences(prev => ({ ...prev, maxDetourMiles: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  Maximum miles you're willing to detour for additional loads
                </div>
              </div>

              <div className="space-y-2">
                <Label>Minimum Rate: ${driverPreferences.minimumRate.toFixed(2)}/mile</Label>
                <input
                  type="range"
                  min="1.50"
                  max="5.00"
                  step="0.25"
                  value={driverPreferences.minimumRate}
                  onChange={(e) => setDriverPreferences(prev => ({ ...prev, minimumRate: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  Minimum rate per mile for additional loads
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fuel MPG: {driverPreferences.fuelMpg}</Label>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.5"
                  value={driverPreferences.fuelMpg}
                  onChange={(e) => setDriverPreferences(prev => ({ ...prev, fuelMpg: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  Your truck's average fuel efficiency
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fuel Price: ${driverPreferences.fuelPrice.toFixed(2)}/gallon</Label>
                <input
                  type="range"
                  min="3.00"
                  max="5.50"
                  step="0.05"
                  value={driverPreferences.fuelPrice}
                  onChange={(e) => setDriverPreferences(prev => ({ ...prev, fuelPrice: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  Current fuel price per gallon
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Additional Hours: {driverPreferences.maxAdditionalHours}</Label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={driverPreferences.maxAdditionalHours}
                  onChange={(e) => setDriverPreferences(prev => ({ ...prev, maxAdditionalHours: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  Maximum additional driving hours
                </div>
              </div>

              <div className="space-y-3">
                <Label>Preferred Equipment</Label>
                <div className="space-y-2">
                  {["Dry Van", "Reefer", "Flatbed", "Tanker"].map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={equipment}
                        checked={driverPreferences.preferredEquipment.includes(equipment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDriverPreferences(prev => ({
                              ...prev,
                              preferredEquipment: [...prev.preferredEquipment, equipment]
                            }));
                          } else {
                            setDriverPreferences(prev => ({
                              ...prev,
                              preferredEquipment: prev.preferredEquipment.filter(eq => eq !== equipment)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}