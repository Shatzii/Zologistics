import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, DollarSign, Truck, Clock, MapPin } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsPage() {
  const { data: metrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  const { data: loads } = useQuery({
    queryKey: ["/api/loads"],
  });

  // Sample analytics data - in production, this would come from your analytics API
  const revenueData = [
    { month: 'Jan', revenue: 45000, costs: 32000 },
    { month: 'Feb', revenue: 52000, costs: 35000 },
    { month: 'Mar', revenue: 48000, costs: 33000 },
    { month: 'Apr', revenue: 61000, costs: 42000 },
    { month: 'May', revenue: 55000, costs: 38000 },
    { month: 'Jun', revenue: 67000, costs: 45000 },
  ];

  const routePerformance = [
    { route: 'LA-NY', loads: 45, avgRate: 3200, profit: 28000 },
    { route: 'CHI-MIA', loads: 38, avgRate: 2800, profit: 22000 },
    { route: 'DAL-SEA', loads: 32, avgRate: 3500, profit: 31000 },
    { route: 'ATL-DEN', loads: 28, avgRate: 2900, profit: 19000 },
  ];

  const equipmentUtilization = [
    { name: 'Dry Van', value: 65, color: '#8884d8' },
    { name: 'Reefer', value: 25, color: '#82ca9d' },
    { name: 'Flatbed', value: 10, color: '#ffc658' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Performance insights and data visualization</p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">$67,000</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fleet Utilization</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-blue-600">+5% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Delivery Time</p>
                <p className="text-2xl font-bold">2.3 days</p>
                <p className="text-xs text-green-600">-0.2 days improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">32.8%</p>
                <p className="text-xs text-green-600">+2.1% improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue & Costs</TabsTrigger>
          <TabsTrigger value="routes">Route Performance</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Analysis</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Costs Trend</CardTitle>
              <CardDescription>Monthly comparison of revenue and operational costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costs" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Costs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Routes Performance</CardTitle>
              <CardDescription>Analysis of most profitable routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Bar dataKey="profit" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routePerformance.map((route) => (
              <Card key={route.route}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {route.route}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Loads:</span>
                      <span className="font-medium">{route.loads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Rate:</span>
                      <span className="font-medium">${route.avgRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Profit:</span>
                      <span className="font-medium text-green-600">${route.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Type Distribution</CardTitle>
                <CardDescription>Fleet composition by equipment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={equipmentUtilization}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {equipmentUtilization.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Utilization</CardTitle>
                <CardDescription>Current utilization rates by equipment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipmentUtilization.map((equipment) => (
                    <div key={equipment.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{equipment.name}</span>
                        <span className="text-sm text-muted-foreground">{equipment.value}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${equipment.value}%`, 
                            backgroundColor: equipment.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends Analysis</CardTitle>
              <CardDescription>Industry insights and market predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Fuel Price Impact</h4>
                    <p className="text-sm text-muted-foreground">
                      Current fuel prices are 8% higher than last quarter, affecting route profitability. 
                      Consider optimizing longer routes and implementing fuel surcharges.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Seasonal Demand</h4>
                    <p className="text-sm text-muted-foreground">
                      Peak season approaching with 15% increase in load volume expected. 
                      Recommend expanding reefer capacity for produce season.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Rate Trends</h4>
                    <p className="text-sm text-muted-foreground">
                      Average rates increased 12% year-over-year. Market conditions favor 
                      carriers with strong negotiation capabilities.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Technology Adoption</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-powered optimization shows 23% improvement in load matching efficiency. 
                      Continue investing in automated systems.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}