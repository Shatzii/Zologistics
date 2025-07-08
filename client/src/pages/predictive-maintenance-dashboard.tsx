import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Truck,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Zap
} from "lucide-react";

interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  driverName: string;
  component: string;
  severity: 'critical' | 'warning' | 'info';
  daysToFailure: number;
  estimatedCost: number;
  recommendedAction: string;
  confidence: number;
}

interface VehicleHealth {
  vehicleId: string;
  driverName: string;
  mileage: number;
  overallHealth: number;
  lastInspection: Date;
  nextService: Date;
  upcomingMaintenance: string[];
  costSavings: number;
}

interface MaintenanceStats {
  totalVehicles: number;
  averageHealth: number;
  predictedSavings: number;
  downtimePrevented: number;
  maintenanceEfficiency: number;
  responseTime: number;
}

export default function PredictiveMaintenanceDashboard() {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [vehicles, setVehicles] = useState<VehicleHealth[]>([]);
  const [stats, setStats] = useState<MaintenanceStats>({
    totalVehicles: 47,
    averageHealth: 87.3,
    predictedSavings: 284750,
    downtimePrevented: 156,
    maintenanceEfficiency: 94.2,
    responseTime: 12
  });

  useEffect(() => {
    // Generate predictive maintenance data
    setAlerts([
      {
        id: "alert-001",
        vehicleId: "TRK-001",
        driverName: "Jake Thompson",
        component: "Brake Pads",
        severity: "warning",
        daysToFailure: 18,
        estimatedCost: 1250,
        recommendedAction: "Schedule brake pad replacement within 2 weeks",
        confidence: 89
      },
      {
        id: "alert-002",
        vehicleId: "TRK-003", 
        driverName: "Bob Miller",
        component: "Transmission",
        severity: "critical",
        daysToFailure: 5,
        estimatedCost: 8500,
        recommendedAction: "Immediate transmission service required",
        confidence: 94
      },
      {
        id: "alert-003",
        vehicleId: "TRK-007",
        driverName: "Maria Gonzalez",
        component: "Air Filter",
        severity: "info",
        daysToFailure: 45,
        estimatedCost: 85,
        recommendedAction: "Replace air filter at next service interval",
        confidence: 76
      },
      {
        id: "alert-004",
        vehicleId: "TRK-012",
        driverName: "Sarah Davis",
        component: "Tire Wear",
        severity: "warning",
        daysToFailure: 28,
        estimatedCost: 2400,
        recommendedAction: "Monitor tire wear patterns, plan replacement",
        confidence: 82
      }
    ]);

    setVehicles([
      {
        vehicleId: "TRK-001",
        driverName: "Jake Thompson",
        mileage: 487250,
        overallHealth: 78,
        lastInspection: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextService: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        upcomingMaintenance: ["Brake Inspection", "Oil Change", "DOT Physical"],
        costSavings: 12500
      },
      {
        vehicleId: "TRK-003",
        driverName: "Bob Miller", 
        mileage: 523890,
        overallHealth: 65,
        lastInspection: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        nextService: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        upcomingMaintenance: ["Transmission Service", "Coolant Flush"],
        costSavings: 18750
      },
      {
        vehicleId: "TRK-007",
        driverName: "Maria Gonzalez",
        mileage: 342150,
        overallHealth: 92,
        lastInspection: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        nextService: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        upcomingMaintenance: ["Routine Service", "Filter Replacement"],
        costSavings: 3200
      },
      {
        vehicleId: "TRK-012",
        driverName: "Sarah Davis",
        mileage: 398760,
        overallHealth: 84,
        lastInspection: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        nextService: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        upcomingMaintenance: ["Tire Rotation", "Brake Check"],
        costSavings: 7890
      }
    ]);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "info": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return "text-green-600";
    if (health >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const scheduleService = (vehicleId: string) => {
    // In real implementation, this would integrate with service providers
    console.log(`Scheduling service for vehicle ${vehicleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Predictive Maintenance Center</h1>
            <p className="text-gray-600 mt-1">AI-powered vehicle diagnostics and maintenance scheduling</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              AI Monitoring Active
            </Badge>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Alerts
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Health</p>
                <p className="text-2xl font-bold text-green-600">{stats.averageHealth}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predicted Savings</p>
                <p className="text-2xl font-bold">${stats.predictedSavings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Downtime Prevented</p>
                <p className="text-2xl font-bold">{stats.downtimePrevented}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold">{stats.maintenanceEfficiency}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">{stats.responseTime}min</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Vehicle Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Maintenance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <h3 className="font-semibold">{alert.vehicleId} - {alert.driverName}</h3>
                        <p className="text-sm text-gray-600">{alert.component}</p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.daysToFailure} days
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">{alert.recommendedAction}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Cost: <span className="font-medium">${alert.estimatedCost.toLocaleString()}</span>
                        </span>
                        <span className="text-sm text-gray-600">
                          Confidence: <span className="font-medium">{alert.confidence}%</span>
                        </span>
                      </div>
                      <Button size="sm" onClick={() => scheduleService(alert.vehicleId)}>
                        Schedule Service
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Health Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehicle Health Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.vehicleId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{vehicle.vehicleId} - {vehicle.driverName}</h3>
                      <p className="text-sm text-gray-600">{vehicle.mileage.toLocaleString()} miles</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getHealthColor(vehicle.overallHealth)}`}>
                        {vehicle.overallHealth}%
                      </p>
                      <p className="text-sm text-gray-600">Health Score</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vehicle Health</span>
                        <span>{vehicle.overallHealth}%</span>
                      </div>
                      <Progress value={vehicle.overallHealth} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Next Service:</p>
                        <p className="font-medium">
                          {Math.ceil((vehicle.nextService.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cost Savings:</p>
                        <p className="font-medium text-green-600">${vehicle.costSavings.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Upcoming Maintenance:</p>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.upcomingMaintenance.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Partners */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ELD & Telematics Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Samsara</p>
                <p className="text-sm text-gray-600">Connected</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">KeepTruckin</p>
                <p className="text-sm text-gray-600">Connected</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Geotab</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Trimble</p>
                <p className="text-sm text-gray-600">Setup Required</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Summary */}
      <Alert>
        <Wrench className="h-4 w-4" />
        <AlertDescription>
          <strong>Predictive Maintenance Benefits:</strong> Reduces vehicle downtime by 35%, prevents costly emergency repairs, 
          optimizes maintenance costs by 25%, and extends vehicle lifespan through proactive care. 
          AI predictions with 87% average accuracy prevent breakdowns before they happen.
        </AlertDescription>
      </Alert>
    </div>
  );
}