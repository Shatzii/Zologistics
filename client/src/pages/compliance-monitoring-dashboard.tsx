import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Target
} from "lucide-react";

interface ComplianceAlert {
  id: string;
  driverId: number;
  driverName: string;
  type: 'hos_violation' | 'license_expiry' | 'drug_test' | 'inspection_due' | 'training_required';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  dueDate: Date;
  autoResolved: boolean;
}

interface DriverCompliance {
  driverId: number;
  driverName: string;
  overallScore: number;
  hosStatus: 'compliant' | 'warning' | 'violation';
  licenseExpiry: Date;
  lastDrugTest: Date;
  nextInspection: Date;
  trainingCompletion: number;
  violations: number;
}

interface ComplianceStats {
  totalDrivers: number;
  compliantDrivers: number;
  complianceRate: number;
  violationsThisMonth: number;
  automatedReports: number;
  costSavings: number;
  timeReduction: number;
}

export default function ComplianceMonitoringDashboard() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [driverCompliance, setDriverCompliance] = useState<DriverCompliance[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    totalDrivers: 47,
    compliantDrivers: 43,
    complianceRate: 91.5,
    violationsThisMonth: 4,
    automatedReports: 287,
    costSavings: 42300,
    timeReduction: 80
  });

  useEffect(() => {
    // Generate compliance monitoring data
    setAlerts([
      {
        id: "alert-001",
        driverId: 3,
        driverName: "Bob Miller",
        type: "hos_violation",
        severity: "critical",
        message: "HOS violation detected - exceeded 11-hour driving limit",
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        autoResolved: false
      },
      {
        id: "alert-002",
        driverId: 7,
        driverName: "Mike Wilson",
        type: "license_expiry",
        severity: "warning",
        message: "CDL expires in 30 days - renewal required",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoResolved: false
      },
      {
        id: "alert-003",
        driverId: 12,
        driverName: "Sarah Davis",
        type: "drug_test",
        severity: "info",
        message: "Scheduled for random drug test - next available slot",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        autoResolved: true
      },
      {
        id: "alert-004",
        driverId: 8,
        driverName: "Jennifer Garcia",
        type: "inspection_due",
        severity: "warning",
        message: "Vehicle inspection due within 15 days",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        autoResolved: false
      }
    ]);

    setDriverCompliance([
      {
        driverId: 1,
        driverName: "Jake Thompson",
        overallScore: 95,
        hosStatus: "compliant",
        licenseExpiry: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000),
        lastDrugTest: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trainingCompletion: 100,
        violations: 0
      },
      {
        driverId: 2,
        driverName: "Maria Gonzalez",
        overallScore: 92,
        hosStatus: "compliant",
        licenseExpiry: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000),
        lastDrugTest: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        trainingCompletion: 95,
        violations: 1
      },
      {
        driverId: 3,
        driverName: "Bob Miller",
        overallScore: 73,
        hosStatus: "violation",
        licenseExpiry: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
        lastDrugTest: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        trainingCompletion: 78,
        violations: 3
      },
      {
        driverId: 4,
        driverName: "Sarah Davis",
        overallScore: 88,
        hosStatus: "compliant",
        licenseExpiry: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000),
        lastDrugTest: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        trainingCompletion: 89,
        violations: 0
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

  const getHOSStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "violation": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, autoResolved: true } : alert
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance Monitoring Center</h1>
            <p className="text-gray-600 mt-1">Automated FMCSA compliance tracking and violation prevention</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Real-Time Monitoring
            </Badge>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
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
                <p className="text-sm text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold">{stats.totalDrivers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{stats.compliantDrivers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.complianceRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Violations</p>
                <p className="text-2xl font-bold text-red-600">{stats.violationsThisMonth}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost Savings</p>
                <p className="text-2xl font-bold">${stats.costSavings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold">{stats.timeReduction}%</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="drivers">Driver Compliance</TabsTrigger>
          <TabsTrigger value="reports">Automated Reports</TabsTrigger>
        </TabsList>

        {/* Active Alerts */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Alerts
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
                          <h3 className="font-semibold">{alert.driverName}</h3>
                          <p className="text-sm text-gray-600 capitalize">{alert.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.autoResolved && (
                          <Badge className="bg-green-100 text-green-800">Auto-Resolved</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm">{alert.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Due: <span className="font-medium">
                              {alert.dueDate.toLocaleDateString()} {alert.dueDate.toLocaleTimeString()}
                            </span>
                          </span>
                        </div>
                        {!alert.autoResolved && (
                          <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Compliance */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Driver Compliance Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {driverCompliance.map((driver) => (
                  <div key={driver.driverId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{driver.driverName}</h3>
                        <p className="text-sm text-gray-600">Driver ID: {driver.driverId}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getComplianceScoreColor(driver.overallScore)}`}>
                          {driver.overallScore}%
                        </p>
                        <p className="text-sm text-gray-600">Compliance Score</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className={`font-medium ${getHOSStatusColor(driver.hosStatus)}`}>
                          {driver.hosStatus.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">HOS Status</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">
                          {Math.ceil((driver.licenseExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </p>
                        <p className="text-sm text-gray-600">License Expiry</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-green-600">{driver.trainingCompletion}%</p>
                        <p className="text-sm text-gray-600">Training</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${driver.violations === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {driver.violations}
                        </p>
                        <p className="text-sm text-gray-600">Violations</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Compliance</span>
                        <span>{driver.overallScore}%</span>
                      </div>
                      <Progress value={driver.overallScore} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automated Reports */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  FMCSA Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Monthly Safety Report</p>
                      <p className="text-sm text-gray-600">Auto-generated for FMCSA</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Generated</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">HOS Compliance Summary</p>
                      <p className="text-sm text-gray-600">Weekly compliance report</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">Drug Test Results</p>
                      <p className="text-sm text-gray-600">Quarterly summary</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Compliance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>HOS Compliance</span>
                      <span>94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>License Validity</span>
                      <span>98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Training Completion</span>
                      <span>89.1%</span>
                    </div>
                    <Progress value={89.1} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Drug Test Compliance</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Benefits Summary */}
      <Alert className="mt-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Compliance Monitoring Benefits:</strong> Automated FMCSA tracking reduces violations by 75%, 
          prevents costly fines averaging $15,000 per incident, saves 80% administrative time on compliance reporting, 
          and ensures 24/7 HOS monitoring with real-time violation prevention.
        </AlertDescription>
      </Alert>
    </div>
  );
}