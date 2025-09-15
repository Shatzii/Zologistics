import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  Server,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkTraffic: number;
  activeUsers: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
}

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
}

export default function MonitoringDashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkTraffic: 120,
    activeUsers: 1250,
    responseTime: 245,
    errorRate: 0.8,
    uptime: 99.9
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      description: 'Memory usage has exceeded 80% for the last 5 minutes',
      timestamp: new Date(Date.now() - 300000),
      resolved: false
    },
    {
      id: '2',
      type: 'error',
      title: 'Database Connection Timeout',
      description: 'Failed to connect to PostgreSQL database on port 5432',
      timestamp: new Date(Date.now() - 600000),
      resolved: true
    },
    {
      id: '3',
      type: 'info',
      title: 'Scheduled Maintenance',
      description: 'System maintenance scheduled for tonight at 2 AM EST',
      timestamp: new Date(Date.now() - 1800000),
      resolved: false
    }
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 45,
      lastChecked: new Date()
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: 99.8,
      responseTime: 12,
      lastChecked: new Date()
    },
    {
      name: 'Cache Service',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 89,
      lastChecked: new Date()
    },
    {
      name: 'Load Balancer',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 23,
      lastChecked: new Date()
    },
    {
      name: 'File Storage',
      status: 'healthy',
      uptime: 99.7,
      responseTime: 156,
      lastChecked: new Date()
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 50)),
        responseTime: Math.max(0, prev.responseTime + (Math.random() - 0.5) * 20)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time monitoring and observability dashboard</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpuUsage.toFixed(1)}%</div>
            <Progress value={metrics.cpuUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              4 cores active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
            <Progress value={metrics.memoryUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              8GB / 16GB used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              +12% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. response time
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
              <CardDescription>
                Real-time status of all system services and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="font-medium">{service.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div>
                        <div className="font-medium text-foreground">{service.uptime}%</div>
                        <div>Uptime</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{service.responseTime}ms</div>
                        <div>Response</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {service.lastChecked.toLocaleTimeString()}
                        </div>
                        <div>Last Check</div>
                      </div>
                      <Badge variant={service.status === 'healthy' ? 'default' : service.status === 'degraded' ? 'secondary' : 'destructive'}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Recent alerts and notifications from the monitoring system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      {alert.title}
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </span>
                      </div>
                    </AlertTitle>
                    <AlertDescription>
                      {alert.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>{metrics.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.cpuUsage} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span>{metrics.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.memoryUsage} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Disk Usage</span>
                    <span>{metrics.diskUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.diskUsage} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Network Traffic</span>
                    <span>{metrics.networkTraffic} MB/s</span>
                  </div>
                  <Progress value={(metrics.networkTraffic / 200) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Uptime</span>
                  <span className="font-medium">{metrics.uptime}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Error Rate</span>
                  <span className="font-medium">{metrics.errorRate}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Sessions</span>
                  <span className="font-medium">1,247</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Connections</span>
                  <span className="font-medium">23/50</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                Recent system logs and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-96 overflow-y-auto">
                <div className="text-green-600">[INFO] 2024-12-15 10:30:15 - API Gateway started successfully</div>
                <div className="text-blue-600">[DEBUG] 2024-12-15 10:30:14 - Database connection pool initialized</div>
                <div className="text-yellow-600">[WARN] 2024-12-15 10:30:12 - High memory usage detected: 78%</div>
                <div className="text-green-600">[INFO] 2024-12-15 10:30:10 - User authentication successful: user_12345</div>
                <div className="text-red-600">[ERROR] 2024-12-15 10:30:08 - Failed to connect to external service</div>
                <div className="text-blue-600">[DEBUG] 2024-12-15 10:30:05 - Cache hit rate: 94.2%</div>
                <div className="text-green-600">[INFO] 2024-12-15 10:30:03 - Load balancer health check passed</div>
                <div className="text-yellow-600">[WARN] 2024-12-15 10:30:01 - Slow query detected: 2.3s execution time</div>
                <div className="text-green-600">[INFO] 2024-12-15 10:29:58 - Background job completed: load_optimization_456</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}