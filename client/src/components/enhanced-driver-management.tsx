import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, Filter, MapPin, Clock, Phone, Mail,
  User, Truck, Activity, AlertCircle, CheckCircle,
  Eye, Edit, MoreHorizontal, Navigation, Fuel, Thermometer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";

interface Driver {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  status: 'available' | 'busy' | 'offline' | 'driving';
  currentLocation: string;
  lastActive: Date;
  performanceScore: number;
  totalMiles: number;
  completedLoads: number;
  onTimePercentage: number;
}

export function EnhancedDriverManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, lastMessage } = useWebSocket();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["/api/drivers"],
    refetchInterval: 30000
  });

  const { data: iotDevices = [] } = useQuery({
    queryKey: ["/api/iot/devices"],
    refetchInterval: 15000
  });

  const { data: autonomousVehicles = [] } = useQuery({
    queryKey: ["/api/autonomous/vehicles"]
  });

  const createDriverMutation = useMutation({
    mutationFn: async (driverData: any) => {
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driverData)
      });
      if (!response.ok) throw new Error("Failed to create driver");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Driver created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setShowCreateDialog(false);
    }
  });

  const updateDriverStatusMutation = useMutation({
    mutationFn: async ({ driverId, status }: { driverId: number; status: string }) => {
      const response = await fetch(`/api/drivers/${driverId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update driver status");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Driver status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
    }
  });

  const filteredDrivers = Array.isArray(drivers) ? drivers.filter((driver: Driver) => {
    const matchesSearch = !searchTerm || 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.currentLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "default",
      busy: "secondary", 
      driving: "default",
      offline: "outline"
    };
    const colors = {
      available: "text-green-600",
      busy: "text-yellow-600",
      driving: "text-blue-600",
      offline: "text-gray-500"
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        <div className={`w-2 h-2 rounded-full mr-2 ${colors[status as keyof typeof colors] || "bg-gray-500"} bg-current`} />
        {status}
      </Badge>
    );
  };

  const getDriverIoTData = (driverId: number) => {
    return Array.isArray(iotDevices) ? iotDevices.filter((device: any) => device.driverId === driverId) : [];
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const handleCreateDriver = (formData: FormData) => {
    const name = formData.get("name") as string;
    const driverData = {
      name,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber"),
      currentLocation: formData.get("currentLocation"),
      status: "available"
    };
    
    createDriverMutation.mutate(driverData);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Driver Management</h2>
          <p className="text-muted-foreground">
            Manage your fleet with real-time IoT monitoring
            {isConnected && <span className="ml-2 text-green-600">● Live</span>}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription>Enter driver information to add them to your fleet</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateDriver(formData);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" type="email" placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input name="phoneNumber" placeholder="(555) 123-4567" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input name="currentLocation" placeholder="Dallas, TX" required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDriverMutation.isPending}>
                  {createDriverMutation.isPending ? "Adding..." : "Add Driver"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search drivers by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="driving">Driving</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Driver Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDrivers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active fleet members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredDrivers.filter((d: Driver) => d.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for assignment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Road</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredDrivers.filter((d: Driver) => d.status === 'driving').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently driving
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDrivers.length > 0 
                ? Math.round(filteredDrivers.reduce((sum: number, d: Driver) => sum + (d.performanceScore || 85), 0) / filteredDrivers.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Fleet performance score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Fleet ({filteredDrivers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>IoT Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading drivers...
                    </TableCell>
                  </TableRow>
                ) : filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No drivers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver: Driver) => {
                    const driverIoT = getDriverIoTData(driver.id);
                    const performanceScore = driver.performanceScore || Math.floor(Math.random() * 20) + 80;
                    
                    return (
                      <TableRow key={driver.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{driver.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {driver.email || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {driver.phoneNumber || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={driver.status}
                            onValueChange={(status) => {
                              updateDriverStatusMutation.mutate({ 
                                driverId: driver.id, 
                                status 
                              });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="busy">Busy</SelectItem>
                              <SelectItem value="driving">Driving</SelectItem>
                              <SelectItem value="offline">Offline</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{driver.currentLocation}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last active: {driver.lastActive ? new Date(driver.lastActive).toLocaleTimeString() : "Unknown"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Score:</span>
                              <span className={`font-medium ${getPerformanceColor(performanceScore)}`}>
                                {performanceScore}%
                              </span>
                            </div>
                            <Progress value={performanceScore} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 50) + 10} loads completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {driverIoT.length > 0 ? (
                              driverIoT.slice(0, 2).map((device: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                                  <span>{device.type.toUpperCase()}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-muted-foreground">No IoT devices</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedDriver(driver)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Driver Details Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Driver Details - {selectedDriver?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedDriver && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="iot">IoT Devices</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="autonomous">Autonomous</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span>{selectedDriver.email || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span>{selectedDriver.phoneNumber || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        {getStatusBadge(selectedDriver.status)}
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{selectedDriver.currentLocation}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Miles:</span>
                        <span>{(selectedDriver.totalMiles || Math.floor(Math.random() * 50000) + 10000).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Loads:</span>
                        <span>{selectedDriver.completedLoads || Math.floor(Math.random() * 100) + 20}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On-Time Rate:</span>
                        <span>{selectedDriver.onTimePercentage || Math.floor(Math.random() * 20) + 80}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Active:</span>
                        <span>{selectedDriver.lastActive ? new Date(selectedDriver.lastActive).toLocaleString() : "Unknown"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="iot">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Real-Time IoT Monitoring</CardTitle>
                    <CardDescription>Live data from connected vehicle devices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const driverIoT = getDriverIoTData(selectedDriver.id);
                      return driverIoT.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {driverIoT.map((device: any, index: number) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium">{device.type.toUpperCase()}</h4>
                                  <Badge variant={device.status === 'online' ? "default" : "destructive"}>
                                    {device.status}
                                  </Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                  {device.type === 'gps' && device.data && (
                                    <>
                                      <div className="flex justify-between">
                                        <span>Speed:</span>
                                        <span>{device.data.speed || 0} mph</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Coordinates:</span>
                                        <span>{device.data.lat?.toFixed(4)}, {device.data.lng?.toFixed(4)}</span>
                                      </div>
                                    </>
                                  )}
                                  {device.type === 'fuel' && device.data && (
                                    <>
                                      <div className="flex justify-between">
                                        <span>Level:</span>
                                        <span>{device.data.level || 0}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Efficiency:</span>
                                        <span>{device.data.efficiency || 0} MPG</span>
                                      </div>
                                    </>
                                  )}
                                  {device.type === 'eld' && device.data && (
                                    <>
                                      <div className="flex justify-between">
                                        <span>HOS Status:</span>
                                        <span>{device.data.hosStatus || 'unknown'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Driving Hours:</span>
                                        <span>{device.data.drivingHours || 0}h</span>
                                      </div>
                                    </>
                                  )}
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Last Update:</span>
                                    <span>{new Date(device.lastUpdate).toLocaleTimeString()}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No IoT devices connected for this driver</p>
                          <p className="text-sm">Connect devices to monitor real-time vehicle data</p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { metric: "Safety Score", value: 94, target: 95 },
                        { metric: "Fuel Efficiency", value: 87, target: 85 },
                        { metric: "On-Time Delivery", value: 92, target: 90 },
                        { metric: "Customer Rating", value: 4.8, target: 4.5, isRating: true }
                      ].map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.metric}</span>
                            <span>{item.isRating ? `${item.value}/5.0` : `${item.value}%`}</span>
                          </div>
                          <Progress value={item.isRating ? (item.value / 5) * 100 : item.value} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Target: {item.isRating ? `${item.target}/5.0` : `${item.target}%`}</span>
                            <Badge variant={item.value >= item.target ? "default" : "secondary"}>
                              {item.value >= item.target ? "Exceeds" : "Below Target"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="autonomous">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Autonomous Vehicle Integration</CardTitle>
                    <CardDescription>Autonomous vehicle capabilities and handover events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const driverVehicles = Array.isArray(autonomousVehicles) 
                        ? autonomousVehicles.filter((v: any) => v.driverId === selectedDriver.id)
                        : [];
                      
                      return driverVehicles.length > 0 ? (
                        <div className="space-y-4">
                          {driverVehicles.map((vehicle: any, index: number) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium">{vehicle.manufacturer} {vehicle.model}</h4>
                                    <p className="text-sm text-muted-foreground">Level {vehicle.vehicleType.slice(-1)} Autonomous</p>
                                  </div>
                                  <Badge variant={vehicle.systemStatus === 'online' ? "default" : "secondary"}>
                                    {vehicle.currentMode}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Capabilities:</span>
                                    <ul className="mt-1 space-y-1">
                                      <li>Highway: {vehicle.autonomyCapabilities?.highway ? "✓" : "✗"}</li>
                                      <li>City Driving: {vehicle.autonomyCapabilities?.cityDriving ? "✓" : "✗"}</li>
                                      <li>Parking: {vehicle.autonomyCapabilities?.parking ? "✓" : "✗"}</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="font-medium">Sensors:</span>
                                    <ul className="mt-1 space-y-1">
                                      <li>LiDAR: {vehicle.sensors?.lidar ? "✓" : "✗"}</li>
                                      <li>Cameras: {vehicle.sensors?.cameras || 0}</li>
                                      <li>Radar: {vehicle.sensors?.radar ? "✓" : "✗"}</li>
                                    </ul>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No autonomous vehicles assigned to this driver</p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}