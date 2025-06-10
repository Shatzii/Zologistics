import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, MapPin, DollarSign, Truck } from "lucide-react";
import { Link } from "wouter";
import type { Load } from "@shared/schema";

export default function LoadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const { data: loads, isLoading } = useQuery<Load[]>({
    queryKey: ["/api/loads"],
  });

  const filteredLoads = loads?.filter(load => {
    const matchesSearch = load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.externalId.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || load.status === statusFilter;
    const matchesSource = sourceFilter === "all" || load.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in_transit": return "bg-yellow-100 text-yellow-800";
      case "delivered": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
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
          <h1 className="text-3xl font-bold">Load Board</h1>
          <p className="text-muted-foreground">Manage and track all loads</p>
        </div>
        <Link href="/loads/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Load
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search loads by origin, destination, or ID..."
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
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="DAT">DAT</SelectItem>
                <SelectItem value="Truckstop">Truckstop</SelectItem>
                <SelectItem value="123LoadBoard">123LoadBoard</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Load Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Loads</p>
                <p className="text-2xl font-bold">{loads?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">
                  {loads?.filter(l => l.status === 'available').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rate/Mile</p>
                <p className="text-2xl font-bold">
                  ${loads?.reduce((acc, load) => acc + parseFloat(load.ratePerMile), 0) / (loads?.length || 1) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtered</p>
                <p className="text-2xl font-bold">{filteredLoads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLoads.map((load) => (
          <Link key={load.id} href={`/loads/${load.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{load.externalId}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {load.origin} → {load.destination}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(load.status)}>
                    {load.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Distance:</span>
                    <span className="font-medium">{load.miles} miles</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rate:</span>
                    <span className="font-medium text-green-600">${load.rate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rate/Mile:</span>
                    <span className="font-medium">${load.ratePerMile}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Source:</span>
                    <Badge variant="outline">{load.source}</Badge>
                  </div>
                  {load.pickupTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pickup:</span>
                      <span className="text-sm">{new Date(load.pickupTime).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredLoads.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No loads found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || sourceFilter !== "all" 
                ? "Try adjusting your search criteria or filters"
                : "Get started by creating your first load"
              }
            </p>
            <Link href="/loads/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Load
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}