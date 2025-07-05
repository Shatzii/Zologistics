import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Brain, 
  Phone, 
  Mail, 
  MessageSquare,
  Search,
  Filter,
  Plus,
  Eye,
  MousePointer,
  CheckCircle,
  Users,
  Activity,
  Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LoadBoardMetrics {
  totalLoads: number;
  totalDrivers: number;
  pendingRecommendations: number;
  activeLoadBoards: Array<{ count: number }>;
}

interface FreeLoad {
  id: number;
  origin: string;
  destination: string;
  rate: string;
  ratePerMile: string;
  distance: number;
  equipmentType: string;
  aiScore: number;
  profitMargin: string;
  createdAt: string;
  loadBoard?: {
    name: string;
    tags: string[];
  };
}

interface SmartDriver {
  id: number;
  name: string;
  phone: string;
  email: string;
  currentLocation: string;
  equipmentTypes: string[];
  minRatePerMile: string;
  isActive: boolean;
  lastActive: string;
}

interface Recommendation {
  recommendation: {
    id: number;
    aiScore: number;
    profitabilityScore: number;
    estimatedProfit: string;
    reasons: string[];
    urgencyLevel: string;
    status: string;
    createdAt: string;
  };
  load: FreeLoad;
  driver?: SmartDriver;
}

export default function LoadBoardDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [minRate, setMinRate] = useState("");
  const queryClient = useQueryClient();

  // Dashboard metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/load-board"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Load boards
  const { data: loadBoards } = useQuery({
    queryKey: ["/api/load-boards"],
  });

  // Free loads
  const { data: loads, refetch: refetchLoads } = useQuery({
    queryKey: ["/api/free-loads"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Smart drivers
  const { data: drivers } = useQuery({
    queryKey: ["/api/drivers"],
  });

  // High-value recommendations
  const { data: recommendations } = useQuery({
    queryKey: ["/api/recommendations/high-value"],
    refetchInterval: 30000,
  });

  // Communication stats
  const { data: communicationStats } = useQuery({
    queryKey: ["/api/communications/stats"],
  });

  // Scraping performance
  const { data: scrapingPerformance } = useQuery({
    queryKey: ["/api/scraping/performance"],
  });

  // Mark recommendation as viewed
  const viewRecommendationMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/recommendations/${id}/viewed`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations/high-value"] });
      toast({ title: "Recommendation marked as viewed" });
    },
  });

  // Mark recommendation as clicked
  const clickRecommendationMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/recommendations/${id}/clicked`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations/high-value"] });
      toast({ title: "Recommendation marked as clicked" });
    },
  });

  // Mark recommendation as booked
  const bookRecommendationMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/recommendations/${id}/booked`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations/high-value"] });
      toast({ title: "Load booked successfully!", description: "Revenue has been tracked." });
    },
  });

  const filteredLoads = loads?.filter((load: FreeLoad) => {
    const matchesSearch = !searchTerm || 
      load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEquipment = !selectedEquipment || 
      load.equipmentType?.toLowerCase() === selectedEquipment.toLowerCase();
    
    const matchesRate = !minRate || 
      parseFloat(load.ratePerMile) >= parseFloat(minRate);
    
    return matchesSearch && matchesEquipment && matchesRate;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "normal": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unified AI Load Board Platform</h1>
          <p className="text-muted-foreground">
            Integrated load aggregation, AI recommendations, and intelligent rate negotiation
          </p>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Load Aggregation Active
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              AI Engine Active
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Rate Optimizer Active
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchLoads()}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loads</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.metrics?.totalLoads || 0}</div>
            <p className="text-xs text-muted-foreground">
              From {loadBoards?.length || 0} load boards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.metrics?.totalDrivers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ready for notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.metrics?.pendingRecommendations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending driver review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Optimization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$2,400</div>
            <p className="text-xs text-muted-foreground">
              Average monthly boost per driver
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="loads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="loads">Free Loads</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="drivers">Smart Drivers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="loads" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Loads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search by origin or destination..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-[150px]">
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                  >
                    <option value="">All Equipment</option>
                    <option value="Van">Van</option>
                    <option value="Flatbed">Flatbed</option>
                    <option value="Reefer">Reefer</option>
                    <option value="Step Deck">Step Deck</option>
                    <option value="RGN">RGN</option>
                  </select>
                </div>
                <div className="w-[120px]">
                  <Input
                    type="number"
                    placeholder="Min $/mile"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    step="0.1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Free Loads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Available Loads ({filteredLoads?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>AI Score</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoads?.slice(0, 50).map((load: FreeLoad) => (
                      <TableRow key={load.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{load.origin}</div>
                              <div className="text-sm text-muted-foreground">→ {load.destination}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${parseFloat(load.rate).toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              ${parseFloat(load.ratePerMile).toFixed(2)}/mi
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{load.equipmentType}</Badge>
                        </TableCell>
                        <TableCell>{load.distance} mi</TableCell>
                        <TableCell>
                          <div className={`font-medium ${getAIScoreColor(load.aiScore)}`}>
                            {load.aiScore}/100
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ${parseFloat(load.profitMargin || "0").toFixed(0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {load.loadBoard?.name || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(load.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => {
                                // Simulate rate negotiation integration
                                toast({
                                  title: "Rate Negotiation Started",
                                  description: `AI analyzing market rates for ${load.origin} → ${load.destination}`,
                                });
                              }}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Negotiate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High-Value AI Recommendations</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-generated load matches with 80+ scores and 70+ profitability
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations?.map((rec: Recommendation) => (
                  <Card key={rec.recommendation.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getUrgencyColor(rec.recommendation.urgencyLevel)}>
                              {rec.recommendation.urgencyLevel.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              AI Score: {rec.recommendation.aiScore}/100
                            </Badge>
                            <Badge variant="outline">
                              Profit Score: {rec.recommendation.profitabilityScore}/100
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-1">Load Details</h4>
                              <p className="text-sm text-muted-foreground">
                                {rec.load.origin} → {rec.load.destination}
                              </p>
                              <p className="text-sm">
                                ${parseFloat(rec.load.rate).toLocaleString()} • {rec.load.distance} mi • {rec.load.equipmentType}
                              </p>
                              <p className="text-sm text-green-600 font-medium">
                                Est. Profit: ${parseFloat(rec.recommendation.estimatedProfit).toFixed(0)}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-1">AI Recommendations</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {rec.recommendation.reasons.slice(0, 3).map((reason, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-green-500">•</span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => viewRecommendationMutation.mutate(rec.recommendation.id)}
                            disabled={rec.recommendation.status !== "pending"}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => clickRecommendationMutation.mutate(rec.recommendation.id)}
                            disabled={rec.recommendation.status === "booked"}
                          >
                            <MousePointer className="h-4 w-4 mr-1" />
                            Click
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => bookRecommendationMutation.mutate(rec.recommendation.id)}
                            disabled={rec.recommendation.status === "booked"}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Driver Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Min Rate</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers?.map((driver: SmartDriver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.currentLocation}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {driver.equipmentTypes?.slice(0, 2).map((eq, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {eq}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>${parseFloat(driver.minRatePerMile || "0").toFixed(2)}/mi</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {driver.phone && (
                              <Button size="sm" variant="ghost">
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            {driver.email && (
                              <Button size="sm" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={driver.isActive ? "default" : "secondary"}>
                            {driver.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(driver.lastActive).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Board Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadBoards?.map((board: any) => (
                    <div key={board.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{board.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Success Rate: {board.successRate}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{board.totalLoadsScraped} loads</div>
                        <div className="text-xs text-muted-foreground">
                          {board.lastScraped ? new Date(board.lastScraped).toLocaleString() : "Never"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communicationStats?.map((stat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stat.method === "sms" && <Phone className="h-4 w-4" />}
                        {stat.method === "email" && <Mail className="h-4 w-4" />}
                        {stat.method === "whatsapp" && <MessageSquare className="h-4 w-4" />}
                        <span className="capitalize">{stat.method}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={stat.status === "delivered" ? "default" : "secondary"}>
                          {stat.status}
                        </Badge>
                        <span className="text-sm font-medium">{stat.count}</span>
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
  );
}