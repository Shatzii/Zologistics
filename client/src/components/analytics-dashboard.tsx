import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Truck, Target, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  rateOptimization: {
    totalNegotiations: number;
    successRate: number;
    avgIncrease: number;
    savedAmount: number;
  };
  loadBoardPerformance: {
    scrapedLoads: number;
    activeLoads: number;
    assignedLoads: number;
    completedLoads: number;
  };
  driverMetrics: {
    totalDrivers: number;
    activeDrivers: number;
    avgUtilization: number;
    topPerformers: Array<{ name: string; loadsCompleted: number; revenue: number }>;
  };
  marketTrends: Array<{
    date: string;
    avgRate: number;
    fuelPrice: number;
    demandLevel: number;
  }>;
  negotiationResults: Array<{
    loadId: string;
    originalRate: number;
    finalRate: number;
    increase: number;
    status: 'success' | 'failed' | 'pending';
  }>;
}

export function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics', timeframe],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Sample data for demonstration
  const sampleAnalytics: AnalyticsData = {
    rateOptimization: {
      totalNegotiations: 156,
      successRate: 73.2,
      avgIncrease: 8.5,
      savedAmount: 47580
    },
    loadBoardPerformance: {
      scrapedLoads: 2847,
      activeLoads: 423,
      assignedLoads: 89,
      completedLoads: 234
    },
    driverMetrics: {
      totalDrivers: 45,
      activeDrivers: 38,
      avgUtilization: 84.3,
      topPerformers: [
        { name: "Mike Johnson", loadsCompleted: 23, revenue: 45600 },
        { name: "Sarah Williams", loadsCompleted: 21, revenue: 42300 },
        { name: "Carlos Rodriguez", loadsCompleted: 19, revenue: 38900 }
      ]
    },
    marketTrends: [
      { date: "2024-01-01", avgRate: 2.45, fuelPrice: 3.42, demandLevel: 75 },
      { date: "2024-01-02", avgRate: 2.52, fuelPrice: 3.38, demandLevel: 82 },
      { date: "2024-01-03", avgRate: 2.61, fuelPrice: 3.45, demandLevel: 89 },
      { date: "2024-01-04", avgRate: 2.58, fuelPrice: 3.41, demandLevel: 85 },
      { date: "2024-01-05", avgRate: 2.67, fuelPrice: 3.39, demandLevel: 92 }
    ],
    negotiationResults: [
      { loadId: "DAT-12345", originalRate: 2400, finalRate: 2650, increase: 10.4, status: 'success' },
      { loadId: "TS-67890", originalRate: 1800, finalRate: 1950, increase: 8.3, status: 'success' },
      { loadId: "123-54321", originalRate: 3200, finalRate: 3200, increase: 0, status: 'failed' },
      { loadId: "DAT-98765", originalRate: 2100, finalRate: 2280, increase: 8.6, status: 'success' }
    ]
  };

  const data = analytics || sampleAnalytics;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const pieData = [
    { name: 'Scraped', value: data.loadBoardPerformance.scrapedLoads, color: COLORS[0] },
    { name: 'Active', value: data.loadBoardPerformance.activeLoads, color: COLORS[1] },
    { name: 'Assigned', value: data.loadBoardPerformance.assignedLoads, color: COLORS[2] },
    { name: 'Completed', value: data.loadBoardPerformance.completedLoads, color: COLORS[3] }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">AI-powered trucking dispatch analytics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Rate Success</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.rateOptimization.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Increase</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.rateOptimization.avgIncrease}%</div>
            <p className="text-xs text-muted-foreground">
              Average per successful negotiation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.driverMetrics.activeDrivers}</div>
            <p className="text-xs text-muted-foreground">
              {data.driverMetrics.avgUtilization}% utilization rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.rateOptimization.savedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Generated through AI optimization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Market Rate Trends</CardTitle>
            <CardDescription>Average rates per mile over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.marketTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgRate" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Rate ($/mile)"
                />
                <Line 
                  type="monotone" 
                  dataKey="fuelPrice" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Fuel Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Load Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Load Distribution</CardTitle>
            <CardDescription>Current load status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-4 gap-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Drivers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Drivers</CardTitle>
            <CardDescription>Performance leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.driverMetrics.topPerformers.map((driver, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {driver.loadsCompleted} loads completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${driver.revenue.toLocaleString()}</p>
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Negotiations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent AI Negotiations</CardTitle>
            <CardDescription>Latest rate optimization results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.negotiationResults.map((negotiation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      negotiation.status === 'success' ? 'bg-green-500' :
                      negotiation.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{negotiation.loadId}</p>
                      <p className="text-sm text-muted-foreground">
                        ${negotiation.originalRate} → ${negotiation.finalRate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      negotiation.status === 'success' ? 'default' :
                      negotiation.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {negotiation.increase > 0 ? `+${negotiation.increase}%` : 'No change'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Real-time Alerts & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Market Opportunity</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                California to Texas routes showing 15% above average rates
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <h4 className="font-medium text-green-900 dark:text-green-100">AI Success</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                3 loads optimized in the last hour, +$1,240 revenue
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Fuel Alert</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Diesel prices up 3% this week - adjust rate calculations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}