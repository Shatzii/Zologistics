import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { 
  Truck, 
  Package, 
  DollarSign, 
  Clock, 
  MapPin, 
  Users, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
  Fuel,
  Thermometer,
  Shield,
  Leaf,
  Bot,
  Globe,
  Camera,
  Link,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface DashboardData {
  metrics: {
    activeLoads: number;
    availableDrivers: number;
    avgLoadValue: number;
    completedToday: number;
    totalRevenue: number;
    fuelEfficiency: number;
    sustainabilityScore: number;
    securityScore: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error';
  }>;
  performanceData: Array<{
    date: string;
    loads: number;
    revenue: number;
    efficiency: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
}

export function ComprehensiveDashboard() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard/comprehensive'],
    refetchInterval: 30000,
  });

  const { data: iotDevices = [] } = useQuery({
    queryKey: ['/api/iot/devices'],
    refetchInterval: 10000,
  });

  const { data: autonomousVehicles = [] } = useQuery({
    queryKey: ['/api/autonomous/vehicles'],
    refetchInterval: 15000,
  });

  const { data: blockchainContracts = [] } = useQuery({
    queryKey: ['/api/blockchain/contracts'],
    refetchInterval: 20000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = dashboardData?.performanceData || [];
  const pieData = [
    { name: 'Active', value: dashboardData?.metrics.activeLoads || 0, color: '#3b82f6' },
    { name: 'Completed', value: dashboardData?.metrics.completedToday || 0, color: '#10b981' },
    { name: 'Pending', value: 5, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold driver-text-critical">
            Comprehensive Dashboard
          </h1>
          <p className="driver-text-secondary">
            Complete overview of your trucking operations
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            Live Updates
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.metrics.activeLoads || 0}</div>
            <p className="text-xs opacity-80">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.metrics.availableDrivers || 0}</div>
            <p className="text-xs opacity-80">85% utilization</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dashboardData?.metrics.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs opacity-80">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.metrics.fuelEfficiency || 0}%</div>
            <p className="text-xs opacity-80">Above industry avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              IoT & Real-Time Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Connected Devices</span>
              <Badge variant="secondary">{iotDevices.length}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>GPS Trackers</span>
                <span className="text-green-600">12 Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fuel Sensors</span>
                <span className="text-green-600">8 Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Temperature Monitors</span>
                <span className="text-green-600">5 Online</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              Autonomous Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Fleet Status</span>
              <Badge variant="secondary">{autonomousVehicles.length} Vehicles</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level 4 Autonomous</span>
                <span className="text-blue-600">3 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Assisted Driving</span>
                <span className="text-orange-600">7 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Manual Override</span>
                <span className="text-gray-600">2 Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-green-600" />
              Blockchain Contracts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Smart Contracts</span>
              <Badge variant="secondary">{blockchainContracts.length}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Contracts</span>
                <span className="text-green-600">15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending Signature</span>
                <span className="text-orange-600">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed Today</span>
                <span className="text-blue-600">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sustainability & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Sustainability Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Carbon Footprint Reduction</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fuel Efficiency</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Route Optimization</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Carbon Neutral Certification Achieved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>System Security</span>
                  <span className="font-medium">96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Data Encryption</span>
                  <span className="font-medium">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Access Control</span>
                  <span className="font-medium">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Type II Compliant</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="loads" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Load Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentActivity?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.alerts?.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'critical' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => window.location.href = '/loads'}
            >
              <Package className="h-6 w-6" />
              <span>New Load</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => window.location.href = '/drivers'}
            >
              <Users className="h-6 w-6" />
              <span>Add Driver</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => window.location.href = '/analytics'}
            >
              <Navigation className="h-6 w-6" />
              <span>Route Plan</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => {
                // Demo document scanning functionality
                alert('Document scanning feature activated! This would open camera/file picker in a production environment.');
              }}
            >
              <Camera className="h-6 w-6" />
              <span>Scan Document</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}