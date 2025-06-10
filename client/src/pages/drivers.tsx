import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Users, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "wouter";
import type { Driver } from "@shared/schema";

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
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
      case "available": return "bg-green-100 text-green-800";
      case "driving": return "bg-blue-100 text-blue-800";
      case "off_duty": return "bg-yellow-100 text-yellow-800";
      case "maintenance": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return "🟢";
      case "driving": return "🚛";
      case "off_duty": return "⏸️";
      case "maintenance": return "🔧";
      default: return "⚪";
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
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <p className="text-muted-foreground">Manage your driver fleet</p>
        </div>
        <Link href="/drivers/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
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
                <SelectItem value="driving">Driving</SelectItem>
                <SelectItem value="off_duty">Off Duty</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
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
              <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
                🚛
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Driving</p>
                <p className="text-2xl font-bold">
                  {drivers?.filter(d => d.status === 'driving').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full">
                ⏸️
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Off Duty</p>
                <p className="text-2xl font-bold">
                  {drivers?.filter(d => d.status === 'off_duty').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <Link key={driver.id} href={`/drivers/${driver.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{driver.name}</CardTitle>
                        <CardDescription>License: {driver.licenseNumber || 'N/A'}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(driver.status)}>
                        <span className="mr-1">{getStatusIcon(driver.status)}</span>
                        {driver.status}
                      </Badge>
                    </div>
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
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">License:</span>
                    <span className="text-sm font-medium">{driver.licenseNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="outline">{driver.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
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
            <Link href="/drivers/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}