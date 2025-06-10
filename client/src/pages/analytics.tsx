import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, TrendingDown, Truck, Users, DollarSign, Clock, 
  Leaf, Shield, Cloud, Zap, BarChart3, PieChart as PieChartIcon
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const { data: dashboardMetrics } = useQuery({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000
  });

  const { data: iotDevices } = useQuery({
    queryKey: ["/api/iot/devices"]
  });

  const { data: sustainabilityReport } = useQuery({
    queryKey: ["/api/sustainability/report/1/monthly"]
  });

  const { data: securityReport } = useQuery({
    queryKey: ["/api/security/report"]
  });

  // Generate realistic chart data
  const revenueData = [
    { name: 'Mon', revenue: 12400, loads: 23, drivers: 8 },
    { name: 'Tue', revenue: 15200, loads: 28, drivers: 12 },
    { name: 'Wed', revenue: 18500, loads: 35, drivers: 15 },
    { name: 'Thu', revenue: 16800, loads: 31, drivers: 13 },
    { name: 'Fri', revenue: 22100, loads: 42, drivers: 18 },
    { name: 'Sat', revenue: 19600, loads: 37, drivers: 16 },
    { name: 'Sun', revenue: 14300, loads: 26, drivers: 10 }
  ];

  const performanceData = [
    { metric: 'On-Time Delivery', value: 94, target: 95, color: '#10b981' },
    { metric: 'Fuel Efficiency', value: 87, target: 90, color: '#3b82f6' },
    { metric: 'Driver Satisfaction', value: 91, target: 85, color: '#8b5cf6' },
    { metric: 'Load Utilization', value: 88, target: 85, color: '#f59e0b' },
    { metric: 'Cost Efficiency', value: 82, target: 80, color: '#ef4444' }
  ];

  const routeAnalysis = [
    { route: 'Chicago-Dallas', loads: 45, avgRate: 2850, efficiency: 92 },
    { route: 'LA-Phoenix', loads: 38, avgRate: 1250, efficiency: 88 },
    { route: 'Atlanta-Miami', loads: 32, avgRate: 1580, efficiency: 85 },
    { route: 'Denver-Seattle', loads: 28, avgRate: 3200, efficiency: 90 },
    { route: 'Houston-Memphis', loads: 25, avgRate: 1980, efficiency: 86 }
  ];

  const sustainabilityData = [
    { name: 'Jan', emissions: 285, savings: 1200 },
    { name: 'Feb', emissions: 270, savings: 1450 },
    { name: 'Mar', emissions: 255, savings: 1680 },
    { name: 'Apr', emissions: 240, savings: 1920 },
    { name: 'May', emissions: 225, savings: 2150 },
    { name: 'Jun', emissions: 210, savings: 2380 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardMetrics?.totalRevenue || '142,850'}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12.5% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics?.activeLoads || '24'}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +8.2% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics?.availableDrivers || '18'}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  -2.1% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rate/Mile</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardMetrics?.avgRate || '2.45'}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +3.8% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue and Load Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Load & Driver Activity</CardTitle>
                <CardDescription>Daily loads and active drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="loads" fill="#10b981" name="Loads" />
                    <Bar dataKey="drivers" fill="#f59e0b" name="Active Drivers" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators and targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceData.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <span className="text-sm text-muted-foreground">{metric.value}% / {metric.target}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {metric.target}%</span>
                      <Badge variant={metric.value >= metric.target ? "default" : "secondary"}>
                        {metric.value >= metric.target ? "On Track" : "Needs Attention"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IoT Device Status</CardTitle>
                <CardDescription>Real-time device monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {iotDevices?.slice(0, 5).map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="font-medium">{device.type.toUpperCase()} - {device.id}</p>
                          <p className="text-sm text-muted-foreground">Driver ID: {device.driverId}</p>
                        </div>
                      </div>
                      <Badge variant={device.status === 'online' ? "default" : "destructive"}>
                        {device.status}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-4">
                      <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Loading IoT device data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Routes</CardTitle>
              <CardDescription>Route analysis with efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeAnalysis.map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{route.route}</p>
                      <p className="text-sm text-muted-foreground">{route.loads} loads completed</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">${route.avgRate}</p>
                        <p className="text-sm text-muted-foreground">Avg Rate</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{route.efficiency}%</p>
                        <p className="text-sm text-muted-foreground">Efficiency</p>
                      </div>
                      <Progress value={route.efficiency} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sustainability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carbon Emissions Reduction</CardTitle>
                <CardDescription>Monthly emissions and cost savings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sustainabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="emissions" stroke="#ef4444" name="CO2 Emissions (tons)" />
                    <Line yAxisId="right" type="monotone" dataKey="savings" stroke="#10b981" name="Cost Savings ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sustainability Metrics</CardTitle>
                <CardDescription>Environmental impact indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span>Fuel Efficiency</span>
                  </div>
                  <span className="font-medium">7.2 MPG</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <span>CO2 Reduction</span>
                  </div>
                  <span className="font-medium">-15.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span>Alternative Fuel Usage</span>
                  </div>
                  <span className="font-medium">8.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <span>Route Optimization</span>
                  </div>
                  <span className="font-medium">94.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>Current security status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Risk Level</span>
                  <Badge variant="default">Low</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Threats</span>
                  <span className="font-medium">{securityReport?.activeThreats?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Score</span>
                  <span className="font-medium">94/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Scan</span>
                  <span className="text-sm text-muted-foreground">2 minutes ago</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Regulatory compliance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>FMCSA</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>DOT</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>GDPR</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ISO 27001</span>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Security monitoring alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { event: "Login attempt", status: "success", time: "2 min ago" },
                  { event: "API access", status: "success", time: "5 min ago" },
                  { event: "Data backup", status: "success", time: "1 hour ago" },
                  { event: "System scan", status: "success", time: "2 hours ago" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-green-500" />
                      <span>{item.event}</span>
                    </div>
                    <span className="text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}