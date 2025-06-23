import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Clock,
  DollarSign,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Route,
  Users,
  BarChart3,
  RefreshCw,
  Phone,
  MessageSquare,
  Plus,
  Minus
} from "lucide-react";

interface DriverLocation {
  driverId: number;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: string;
  accuracy: number;
  currentLoad?: {
    id: string;
    origin: string;
    destination: string;
    estimatedArrival: string;
    status: string;
  };
}

interface LiveOpportunity {
  id: string;
  driverId: number;
  type: string;
  priority: string;
  origin: {
    location: string;
    distanceFromDriver: number;
    estimatedArrival: string;
  };
  destination: {
    location: string;
  };
  loadDetails: {
    rate: number;
    equipment: string;
    weight: number;
    commodity: string;
  };
  routeImpact: {
    additionalMiles: number;
    additionalTime: number;
    netProfit: number;
  };
  expiresAt: string;
  status: string;
}

export default function LiveTrackingDashboard() {
  const { formatCurrency, formatNumber } = useLanguage();
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: allDrivers, refetch: refetchDrivers } = useQuery({
    queryKey: ['/api/tracking/all-drivers'],
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
    retry: false,
  });

  const { data: trackingStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/tracking/stats'],
    refetchInterval: autoRefresh ? 30000 : false,
    retry: false,
  });

  const { data: selectedDriverOpportunities } = useQuery({
    queryKey: [`/api/tracking/opportunities/${selectedDriver}`],
    enabled: !!selectedDriver,
    refetchInterval: autoRefresh ? 15000 : false,
    retry: false,
  });

  const handleOpportunityResponse = async (opportunityId: string, response: 'accepted' | 'declined') => {
    try {
      const res = await fetch('/api/tracking/respond-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, response })
      });

      if (res.ok) {
        // Refresh opportunities
        refetchDrivers();
        refetchStats();
      }
    } catch (error) {
      console.error('Error responding to opportunity:', error);
    }
  };

  const getDriverStatus = (driver: DriverLocation) => {
    const lastUpdate = new Date(driver.timestamp);
    const now = new Date();
    const minutesAgo = (now.getTime() - lastUpdate.getTime()) / 60000;

    if (minutesAgo > 10) return { status: 'offline', color: 'bg-red-500' };
    if (driver.speed < 5) return { status: 'stopped', color: 'bg-yellow-500' };
    if (driver.speed > 65) return { status: 'highway', color: 'bg-green-500' };
    return { status: 'driving', color: 'bg-blue-500' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white';
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
      case 'detour_optimization': return <Zap className="h-4 w-4" />;
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
              <MapPin className="h-12 w-12" />
              <div>
                <h1 className="text-4xl font-bold">Live Route Tracking</h1>
                <p className="text-blue-100 text-xl">
                  Real-time GPS monitoring and load opportunity management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "secondary" : "outline"}
                className="text-white border-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Live' : 'Manual'}
              </Button>
              <div className="text-right">
                <div className="text-2xl font-bold">{allDrivers?.length || 0}</div>
                <div className="text-blue-200">Active Drivers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Active Drivers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {trackingStats?.activeDrivers || 0}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Currently tracked
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Live Opportunities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {trackingStats?.activeOpportunities || 0}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Pending responses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Acceptance Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {(trackingStats?.acceptanceRate || 0).toFixed(0)}%
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Driver responses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span>Avg Response</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {(trackingStats?.avgResponseTime || 0).toFixed(0)}m
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Driver List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-6 w-6" />
                <span>Active Drivers</span>
              </CardTitle>
              <CardDescription>
                Click a driver to view their opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allDrivers?.map((driver: DriverLocation) => {
                  const status = getDriverStatus(driver);
                  const isSelected = selectedDriver === driver.driverId;
                  
                  return (
                    <div
                      key={driver.driverId}
                      onClick={() => setSelectedDriver(driver.driverId)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                          <span className="font-medium">Driver {driver.driverId}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {status.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Speed:</span>
                          <span>{Math.round(driver.speed)} mph</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Update:</span>
                          <span>{new Date(driver.timestamp).toLocaleTimeString()}</span>
                        </div>
                        {driver.currentLoad && (
                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            <div className="font-medium truncate">
                              {driver.currentLoad.origin} → {driver.currentLoad.destination}
                            </div>
                            <div className="text-gray-500">
                              Status: {driver.currentLoad.status}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active drivers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Driver Details & Opportunities */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedDriver ? (
              <>
                {/* Driver Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Navigation className="h-6 w-6" />
                      <span>Driver {selectedDriver} Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const driver = allDrivers?.find((d: DriverLocation) => d.driverId === selectedDriver);
                      if (!driver) return <p>Driver not found</p>;
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Current Location</label>
                              <div className="text-lg font-bold">
                                {driver.latitude.toFixed(4)}, {driver.longitude.toFixed(4)}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Speed & Heading</label>
                              <div className="text-lg font-bold">
                                {Math.round(driver.speed)} mph, {Math.round(driver.heading)}°
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">GPS Accuracy</label>
                              <div className="text-lg font-bold">{driver.accuracy.toFixed(1)}m</div>
                            </div>
                          </div>
                          
                          {driver.currentLoad && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">Current Load</label>
                                <div className="text-lg font-bold">{driver.currentLoad.id}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Route</label>
                                <div className="text-sm">
                                  {driver.currentLoad.origin} → {driver.currentLoad.destination}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">ETA</label>
                                <div className="text-sm">
                                  {new Date(driver.currentLoad.estimatedArrival).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Live Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-6 w-6" />
                      <span>Live Opportunities</span>
                      <Badge className="bg-green-600 text-white">
                        {selectedDriverOpportunities?.length || 0} Available
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Real-time load opportunities for this driver
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedDriverOpportunities?.map((opp: LiveOpportunity) => (
                        <div key={opp.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getLoadTypeIcon(opp.type)}
                                <span className="font-medium capitalize">{opp.type.replace('_', ' ')}</span>
                              </div>
                              <Badge className={getPriorityColor(opp.priority)}>
                                {opp.priority.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {opp.loadDetails.equipment}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(opp.loadDetails.rate)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Net: {formatCurrency(opp.routeImpact.netProfit)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-gray-600">Route:</span>
                              <div className="font-medium">
                                {opp.origin.location} → {opp.destination.location}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Distance:</span>
                              <div className="font-medium">
                                {opp.origin.distanceFromDriver.toFixed(1)} mi away
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Additional:</span>
                              <div className="font-medium">
                                +{opp.routeImpact.additionalMiles} mi, +{opp.routeImpact.additionalTime.toFixed(1)}h
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Expires: {new Date(opp.expiresAt).toLocaleTimeString()}
                            </div>
                            
                            {opp.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpportunityResponse(opp.id, 'declined')}
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleOpportunityResponse(opp.id, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </Button>
                              </div>
                            )}
                            
                            {opp.status === 'accepted' && (
                              <Badge className="bg-green-600 text-white">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accepted
                              </Badge>
                            )}
                            
                            {opp.status === 'declined' && (
                              <Badge className="bg-red-600 text-white">
                                <XCircle className="h-4 w-4 mr-1" />
                                Declined
                              </Badge>
                            )}
                            
                            {opp.status === 'expired' && (
                              <Badge className="bg-gray-600 text-white">
                                <Clock className="h-4 w-4 mr-1" />
                                Expired
                              </Badge>
                            )}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No active opportunities</p>
                          <p className="text-sm">New opportunities will appear automatically</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Select a Driver</h3>
                  <p>Choose a driver from the list to view their live opportunities and route details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}