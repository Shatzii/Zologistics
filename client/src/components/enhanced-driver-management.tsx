import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Plus, Users, MapPin, Phone, Mail, Edit, Trash2, 
  Heart, Shield, Activity, Calendar, AlertTriangle
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DriverForm } from "./driver-form";
import type { Driver } from "@shared/schema";

interface WellnessMetrics {
  stressLevel: number;
  sleepQuality: number;
  lastAssessment: Date;
}

interface EnhancedDriver extends Driver {
  wellness?: WellnessMetrics;
}

export function EnhancedDriverManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useQuery<EnhancedDriver[]>({
    queryKey: ["/api/drivers"],
  });

  const deleteDriverMutation = useMutation({
    mutationFn: async (driverId: number) => {
      return apiRequest(`/api/drivers/${driverId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      toast({
        title: "Driver Deleted",
        description: "Driver has been removed from your fleet.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete driver. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phoneNumber?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "en_route": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "off_duty": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "break": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getWellnessColor = (level: number) => {
    if (level >= 8) return "text-green-400";
    if (level >= 6) return "text-yellow-400";
    if (level >= 4) return "text-orange-400";
    return "text-red-400";
  };

  const handleDeleteDriver = (driverId: number, driverName: string) => {
    if (confirm(`Are you sure you want to delete ${driverName}? This action cannot be undone.`)) {
      deleteDriverMutation.mutate(driverId);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Driver Management</h1>
          <p className="text-muted-foreground">Comprehensive driver fleet management with wellness integration</p>
        </div>
        <div className="flex gap-2">
          <Link href="/wellness">
            <Button variant="outline">
              <Heart className="w-4 h-4 mr-2" />
              Wellness Dashboard
            </Button>
          </Link>
          <Link href="/driver-solutions">
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Driver Solutions
            </Button>
          </Link>
          <Dialog open={showAddDriver} onOpenChange={setShowAddDriver}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
              </DialogHeader>
              <DriverForm 
                onSuccess={() => setShowAddDriver(false)}
                onCancel={() => setShowAddDriver(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Driver Overview</TabsTrigger>
          <TabsTrigger value="wellness">Wellness Monitoring</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search drivers by name, license, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="en_route">En Route</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                    <SelectItem value="break">On Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Driver Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
                    <p className="text-2xl font-bold">{drivers?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full">
                    🟢
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold">
                      {drivers?.filter(d => d.status === 'available').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Wellness Alerts</p>
                    <p className="text-2xl font-bold">
                      {drivers?.filter(d => d.wellness && d.wellness.stressLevel >= 7).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Routes</p>
                    <p className="text-2xl font-bold">
                      {drivers?.filter(d => d.status === 'en_route').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Driver Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => (
              <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{driver.name}</CardTitle>
                        <CardDescription>License: {driver.licenseNumber || 'N/A'}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(driver.status)}>
                        {driver.status.replace('_', ' ')}
                      </Badge>
                      {driver.wellness && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span className={`text-sm font-medium ${getWellnessColor(driver.wellness.stressLevel)}`}>
                            {driver.wellness.stressLevel}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {driver.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{driver.phoneNumber}</span>
                      </div>
                    )}
                    {driver.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{driver.email}</span>
                      </div>
                    )}
                    {driver.currentLocation && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{driver.currentLocation}</span>
                      </div>
                    )}
                    
                    {/* Wellness Quick View */}
                    {driver.wellness && (
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Sleep Quality:</span>
                          <span className={getWellnessColor(driver.wellness.sleepQuality)}>
                            {driver.wellness.sleepQuality}/10
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span className="text-muted-foreground">
                            {new Date(driver.wellness.lastAssessment).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingDriver(driver)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Driver: {driver.name}</DialogTitle>
                            </DialogHeader>
                            <DriverForm 
                              driver={editingDriver || undefined}
                              onSuccess={() => setEditingDriver(null)}
                              onCancel={() => setEditingDriver(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteDriver(driver.id, driver.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Link href={`/wellness?driverId=${driver.id}`}>
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 mr-1" />
                          Wellness
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDrivers.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search criteria or filters"
                    : "Get started by adding your first driver"
                  }
                </p>
                <Button onClick={() => setShowAddDriver(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Wellness Monitoring Tab */}
        <TabsContent value="wellness" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* High Priority Wellness Alerts */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Wellness Alerts Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers?.filter(d => d.wellness && d.wellness.stressLevel >= 7).map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-muted-foreground">
                            High stress level: {driver.wellness?.stressLevel}/10
                          </div>
                        </div>
                      </div>
                      <Link href={`/wellness?driverId=${driver.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No wellness alerts at this time
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Wellness Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Average Stress Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {drivers?.length ? 
                    (drivers.reduce((sum, d) => sum + (d.wellness?.stressLevel || 5), 0) / drivers.length).toFixed(1)
                    : '0'
                  }/10
                </div>
                <p className="text-sm text-muted-foreground">Fleet average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {drivers?.length ? 
                    (drivers.reduce((sum, d) => sum + (d.wellness?.sleepQuality || 7), 0) / drivers.length).toFixed(1)
                    : '0'
                  }/10
                </div>
                <p className="text-sm text-muted-foreground">Fleet average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wellness Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {drivers?.filter(d => d.wellness).length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Drivers enrolled</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance Metrics</CardTitle>
              <CardDescription>
                Comprehensive performance tracking and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Performance Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced performance metrics and analytics dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Analytics Dashboard</CardTitle>
              <CardDescription>
                Data-driven insights for fleet optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Comprehensive fleet analytics and reporting dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}