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
import { 
  Plus, Search, Filter, MapPin, Clock, DollarSign, 
  Truck, Users, Calendar, AlertTriangle, CheckCircle,
  Eye, Edit, Trash2, MoreHorizontal, ArrowUpDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Load {
  id: number;
  externalId: string;
  origin: string;
  destination: string;
  miles: number;
  rate: string;
  ratePerMile: string;
  pickupTime: Date;
  deliveryTime?: Date;
  status: string;
  equipmentType?: string;
  commodity?: string;
  weight?: number;
  assignedDriverId?: number;
  source: string;
}

interface Driver {
  id: number;
  name: string;
  status: string;
  currentLocation: string;
}

export function EnhancedLoadManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [sortField, setSortField] = useState<keyof Load>("pickupTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ["/api/loads"],
    refetchInterval: 30000
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"]
  });

  const { data: multiModalOptions } = useQuery({
    queryKey: ["/api/multimodal/options", selectedLoad?.id],
    enabled: !!selectedLoad?.id
  });

  const { data: weatherImpact } = useQuery({
    queryKey: ["/api/weather/impact", selectedLoad?.id],
    enabled: !!selectedLoad?.id
  });

  const { data: sustainabilityData } = useQuery({
    queryKey: ["/api/sustainability/carbon-footprint"],
    enabled: !!selectedLoad?.id
  });

  const createLoadMutation = useMutation({
    mutationFn: async (loadData: any) => {
      const response = await fetch("/api/loads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loadData)
      });
      if (!response.ok) throw new Error("Failed to create load");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Load created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      setShowCreateDialog(false);
    }
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({ loadId, driverId }: { loadId: number; driverId: number }) => {
      const response = await fetch(`/api/loads/${loadId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId })
      });
      if (!response.ok) throw new Error("Failed to assign driver");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Driver assigned successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
    }
  });

  const optimizeRateMutation = useMutation({
    mutationFn: async (loadId: number) => {
      const response = await fetch("/api/negotiate-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loadId })
      });
      if (!response.ok) throw new Error("Failed to optimize rate");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Rate optimization completed" });
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
    }
  });

  const filteredLoads = loads
    .filter((load: Load) => {
      const matchesSearch = !searchTerm || 
        load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.externalId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || load.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a: Load, b: Load) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "default",
      assigned: "secondary", 
      in_transit: "default",
      delivered: "outline",
      cancelled: "destructive"
    };
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
  };

  const handleCreateLoad = (formData: FormData) => {
    const loadData = {
      externalId: formData.get("externalId"),
      origin: formData.get("origin"),
      destination: formData.get("destination"),
      miles: parseInt(formData.get("miles") as string),
      rate: formData.get("rate"),
      ratePerMile: formData.get("ratePerMile"),
      pickupTime: new Date(formData.get("pickupTime") as string),
      equipmentType: formData.get("equipmentType"),
      commodity: formData.get("commodity"),
      weight: parseInt(formData.get("weight") as string),
      status: "available",
      source: "manual"
    };
    
    createLoadMutation.mutate(loadData);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Load Management</h2>
          <p className="text-muted-foreground">Manage loads with AI-powered optimization</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Load
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Load</DialogTitle>
              <DialogDescription>Enter load details to create a new shipment</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateLoad(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="externalId">Load ID</Label>
                  <Input name="externalId" placeholder="LOAD-001" required />
                </div>
                <div>
                  <Label htmlFor="equipmentType">Equipment Type</Label>
                  <Select name="equipmentType">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry_van">Dry Van</SelectItem>
                      <SelectItem value="flatbed">Flatbed</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="tanker">Tanker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input name="origin" placeholder="Chicago, IL" required />
                </div>
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input name="destination" placeholder="Dallas, TX" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="miles">Miles</Label>
                  <Input name="miles" type="number" placeholder="500" required />
                </div>
                <div>
                  <Label htmlFor="rate">Total Rate</Label>
                  <Input name="rate" placeholder="2500" required />
                </div>
                <div>
                  <Label htmlFor="ratePerMile">Rate/Mile</Label>
                  <Input name="ratePerMile" placeholder="5.00" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pickupTime">Pickup Date</Label>
                  <Input name="pickupTime" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="commodity">Commodity</Label>
                  <Input name="commodity" placeholder="General Freight" />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input name="weight" type="number" placeholder="25000" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoadMutation.isPending}>
                  {createLoadMutation.isPending ? "Creating..." : "Create Load"}
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
            placeholder="Search loads by origin, destination, or ID..."
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
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Loads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Load Board ({filteredLoads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSortField("externalId");
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                    }}>
                      Load ID <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSortField("rate");
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                    }}>
                      Rate <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSortField("pickupTime");
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                    }}>
                      Pickup <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading loads...
                    </TableCell>
                  </TableRow>
                ) : filteredLoads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No loads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoads.map((load: Load) => {
                    const assignedDriver = drivers.find((d: Driver) => d.id === load.assignedDriverId);
                    
                    return (
                      <TableRow key={load.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{load.externalId}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-green-500" />
                              <span className="text-sm">{load.origin}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-red-500" />
                              <span className="text-sm">{load.destination}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{load.miles} miles</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">${load.rate}</div>
                            <div className="text-sm text-muted-foreground">${load.ratePerMile}/mi</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{new Date(load.pickupTime).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(load.pickupTime).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(load.status)}</TableCell>
                        <TableCell>
                          {assignedDriver ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{assignedDriver.name}</div>
                              <div className="text-xs text-muted-foreground">{assignedDriver.currentLocation}</div>
                            </div>
                          ) : (
                            <Select onValueChange={(driverId) => {
                              assignDriverMutation.mutate({ 
                                loadId: load.id, 
                                driverId: parseInt(driverId) 
                              });
                            }}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Assign" />
                              </SelectTrigger>
                              <SelectContent>
                                {drivers.filter((d: Driver) => d.status === 'available').map((driver: Driver) => (
                                  <SelectItem key={driver.id} value={driver.id.toString()}>
                                    {driver.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLoad(load)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => optimizeRateMutation.mutate(load.id)}
                              disabled={optimizeRateMutation.isPending}
                            >
                              <DollarSign className="h-3 w-3" />
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

      {/* Load Details Dialog */}
      <Dialog open={!!selectedLoad} onOpenChange={() => setSelectedLoad(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Details - {selectedLoad?.externalId}</DialogTitle>
          </DialogHeader>
          
          {selectedLoad && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="multimodal">Multi-Modal</TabsTrigger>
                <TabsTrigger value="weather">Weather</TabsTrigger>
                <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Load Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        {getStatusBadge(selectedLoad.status)}
                      </div>
                      <div className="flex justify-between">
                        <span>Equipment:</span>
                        <span>{selectedLoad.equipmentType || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commodity:</span>
                        <span>{selectedLoad.commodity || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weight:</span>
                        <span>{selectedLoad.weight ? `${selectedLoad.weight} lbs` : "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Financial Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Rate:</span>
                        <span className="font-medium">${selectedLoad.rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate per Mile:</span>
                        <span>${selectedLoad.ratePerMile}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span>{selectedLoad.miles} miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Source:</span>
                        <span>{selectedLoad.source}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="multimodal">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Multi-Modal Transport Options</CardTitle>
                    <CardDescription>Alternative transport methods for this load</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {multiModalOptions ? (
                      <div className="space-y-3">
                        {multiModalOptions.map((option: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{option.segments?.[0]?.mode?.type || "Standard Route"}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {option.totalDistance} miles, {Math.round(option.totalTime)} hours
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${option.totalCost}</div>
                                <Badge variant="outline">{option.environmentalScore}% eco-friendly</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Loading multi-modal options...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="weather">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weather Impact Analysis</CardTitle>
                    <CardDescription>Weather conditions affecting this route</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {weatherImpact ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Projected Delays</Label>
                            <div className="text-2xl font-bold">{weatherImpact.projectedDelays?.total || 0} min</div>
                          </div>
                          <div>
                            <Label>Cost Impact</Label>
                            <div className="text-2xl font-bold">${weatherImpact.costImpact?.total || 0}</div>
                          </div>
                        </div>
                        {weatherImpact.riskFactors?.length > 0 && (
                          <div>
                            <Label>Risk Factors</Label>
                            <div className="space-y-2 mt-2">
                              {weatherImpact.riskFactors.map((risk: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span>{risk.factor}</span>
                                  <Badge variant={risk.impact === 'high' ? 'destructive' : 'secondary'}>
                                    {risk.impact}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Loading weather analysis...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sustainability">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Environmental Impact</CardTitle>
                    <CardDescription>Carbon footprint and sustainability metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Estimated CO2 Emissions</Label>
                          <div className="text-2xl font-bold">285 kg</div>
                        </div>
                        <div>
                          <Label>Fuel Efficiency</Label>
                          <div className="text-2xl font-bold">6.8 MPG</div>
                        </div>
                      </div>
                      <div>
                        <Label>Carbon Offset Options</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between items-center p-2 bg-muted rounded">
                            <span>Forest Conservation</span>
                            <span className="font-medium">$4.28</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-muted rounded">
                            <span>Renewable Energy</span>
                            <span className="font-medium">$5.70</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tracking">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Real-Time Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>IoT tracking data will appear here when load is in transit</p>
                    </div>
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