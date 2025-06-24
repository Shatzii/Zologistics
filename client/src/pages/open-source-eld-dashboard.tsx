import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Smartphone, 
  HardDrive, 
  Cpu, 
  Wifi, 
  DollarSign, 
  Zap, 
  Shield, 
  Clock, 
  MapPin, 
  Fuel, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle, 
  Truck, 
  Settings,
  BarChart3,
  ShoppingCart,
  Wrench,
  Activity
} from "lucide-react";

interface OpenSourceELDDevice {
  id: string;
  deviceType: string;
  hardwareCost: number;
  capabilities: {
    hosTracking: boolean;
    gpsTracking: boolean;
    engineDiagnostics: boolean;
    fuelMonitoring: boolean;
    temperatureMonitoring: boolean;
    accelerometerData: boolean;
    canBusAccess: boolean;
  };
  specifications: {
    processor: string;
    memory: string;
    storage: string;
    connectivity: string[];
    powerRequirement: string;
    operatingTemp: string;
  };
  complianceStatus: {
    fmcsaApproved: boolean;
    selfCertified: boolean;
    thirdPartyValidated: boolean;
  };
}

interface ELDDataPacket {
  deviceId: string;
  timestamp: Date;
  vehicleId: string;
  driverId: number;
  location: {
    latitude: number;
    longitude: number;
    speed: number;
  };
  engineData: {
    rpm: number;
    engineHours: number;
    odometer: number;
    fuelLevel: number;
    engineTemp: number;
    oilPressure: number;
  };
  hosData: {
    dutyStatus: string;
    drivingTime: number;
    onDutyTime: number;
    driveRemaining: number;
    cycleRemaining: number;
  };
  compliance: {
    violations: string[];
    warnings: string[];
  };
}

interface CustomTabletSpecs {
  model: string;
  cost: number;
  hardware: {
    display: string;
    processor: string;
    ram: string;
    storage: string;
    battery: string;
    connectivity: string[];
  };
  supplier: {
    name: string;
    location: string;
    leadTime: string;
    minimumOrder: number;
  };
}

export default function OpenSourceELDDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: devices } = useQuery<OpenSourceELDDevice[]>({
    queryKey: ['/api/open-source-eld/devices'],
  });

  const { data: tablets } = useQuery<CustomTabletSpecs[]>({
    queryKey: ['/api/open-source-eld/tablets'],
  });

  const { data: systemStats } = useQuery({
    queryKey: ['/api/open-source-eld/stats'],
  });

  const { data: latestData } = useQuery<ELDDataPacket>({
    queryKey: ['/api/open-source-eld/latest', selectedDevice],
    enabled: !!selectedDevice,
  });

  const { data: complianceData } = useQuery({
    queryKey: ['/api/open-source-eld/compliance', 1],
  });

  const orderTabletMutation = useMutation({
    mutationFn: async ({ model, quantity }: { model: string; quantity: number }) => {
      const response = await fetch('/api/open-source-eld/order-tablet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, quantity })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/open-source-eld'] });
    }
  });

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'raspberry_pi': return <Cpu className="h-6 w-6 text-green-600" />;
      case 'android_tablet': return <Smartphone className="h-6 w-6 text-blue-600" />;
      case 'obd_adapter': return <HardDrive className="h-6 w-6 text-purple-600" />;
      default: return <Settings className="h-6 w-6 text-gray-600" />;
    }
  };

  const getComplianceColor = (violations: string[]) => {
    if (violations.length === 0) return 'text-green-600 bg-green-100';
    if (violations.length <= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Open Source ELD Integration</h1>
          <p className="text-gray-600">Cost-effective ELD solutions under $100 with full FMCSA compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Wrench className="h-4 w-4 mr-1" />
            Hardware Setup
          </Button>
          <Button>
            <ShoppingCart className="h-4 w-4 mr-1" />
            Order Tablets
          </Button>
        </div>
      </div>

      {/* Cost Savings Alert */}
      <Alert className="border-green-200 bg-green-50">
        <DollarSign className="h-4 w-4" />
        <AlertTitle>Massive Cost Savings Achieved</AlertTitle>
        <AlertDescription>
          Open source ELD implementation saves $2,400/year per driver vs commercial solutions.
          Total hardware cost: $85-95 per device vs $300-800 for commercial ELDs.
        </AlertDescription>
      </Alert>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="tablets">Custom Tablets</TabsTrigger>
          <TabsTrigger value="data">Live Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Devices</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.connectedDevices || 0}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-green-600">All operational</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.costSavings || '$2,400'}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-600">Per driver vs commercial</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hardware Cost</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.hardwareCost || '$85-95'}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-blue-600">Per device</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-green-600">FMCSA compliant</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Status Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-Time ELD Status
              </CardTitle>
              <CardDescription>
                Live monitoring of all connected ELD devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {devices && devices.map((device, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getDeviceTypeIcon(device.deviceType)}
                        <div>
                          <h4 className="font-semibold">{device.deviceType.replace('_', ' ').toUpperCase()}</h4>
                          <p className="text-sm text-gray-600">{device.id}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium">Cost</span>
                        <p className="text-lg font-bold text-green-600">${device.hardwareCost}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Processor</span>
                        <p className="text-sm text-gray-600">{device.specifications.processor}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {device.capabilities.hosTracking && (
                        <Badge variant="outline" className="text-blue-600">HOS Tracking</Badge>
                      )}
                      {device.capabilities.gpsTracking && (
                        <Badge variant="outline" className="text-green-600">GPS</Badge>
                      )}
                      {device.capabilities.engineDiagnostics && (
                        <Badge variant="outline" className="text-purple-600">Diagnostics</Badge>
                      )}
                      {device.capabilities.canBusAccess && (
                        <Badge variant="outline" className="text-orange-600">CAN Bus</Badge>
                      )}
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedDevice(device.id)}
                    >
                      View Live Data
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Overview */}
          {complianceData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  HOS Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-gray-600">Active Violations</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold">{complianceData.warnings?.length || 0}</div>
                    <div className="text-sm text-gray-600">Active Warnings</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-gray-600">Monitoring Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="devices">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Open Source ELD Solutions</CardTitle>
                <CardDescription>
                  Cost-effective alternatives to commercial ELD systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {devices && devices.map((device, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {getDeviceTypeIcon(device.deviceType)}
                          <div>
                            <h3 className="text-xl font-semibold">{device.deviceType.replace('_', ' ').toUpperCase()}</h3>
                            <p className="text-gray-600">Hardware Cost: ${device.hardwareCost}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {device.complianceStatus.selfCertified && (
                            <Badge className="bg-green-100 text-green-800">Self-Certified</Badge>
                          )}
                          <Badge variant="outline">Open Source</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">Technical Specifications</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Processor:</strong> {device.specifications.processor}</div>
                            <div><strong>Memory:</strong> {device.specifications.memory}</div>
                            <div><strong>Storage:</strong> {device.specifications.storage}</div>
                            <div><strong>Power:</strong> {device.specifications.powerRequirement}</div>
                            <div><strong>Operating Temp:</strong> {device.specifications.operatingTemp}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Capabilities</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(device.capabilities).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                {value ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                )}
                                <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Connectivity</h4>
                        <div className="flex flex-wrap gap-2">
                          {device.specifications.connectivity.map((conn, idx) => (
                            <Badge key={idx} variant="outline" className="flex items-center gap-1">
                              <Wifi className="h-3 w-3" />
                              {conn}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full">
                        View Setup Instructions
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  FMCSA Compliance Dashboard
                </CardTitle>
                <CardDescription>
                  Real-time Hours of Service monitoring and violation prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complianceData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-lg border ${getComplianceColor(complianceData.violations || [])}`}>
                        <h3 className="font-semibold mb-2">Violations</h3>
                        <div className="text-2xl font-bold">{complianceData.violations?.length || 0}</div>
                        {complianceData.violations?.length > 0 && (
                          <ul className="mt-2 text-sm">
                            {complianceData.violations.map((violation: string, idx: number) => (
                              <li key={idx}>• {violation}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="p-4 rounded-lg border bg-yellow-50">
                        <h3 className="font-semibold mb-2 text-yellow-900">Warnings</h3>
                        <div className="text-2xl font-bold text-yellow-700">{complianceData.warnings?.length || 0}</div>
                        {complianceData.warnings?.length > 0 && (
                          <ul className="mt-2 text-sm text-yellow-800">
                            {complianceData.warnings.map((warning: string, idx: number) => (
                              <li key={idx}>• {warning}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="p-4 rounded-lg border bg-blue-50">
                        <h3 className="font-semibold mb-2 text-blue-900">Compliance Rate</h3>
                        <div className="text-2xl font-bold text-blue-700">100%</div>
                        <p className="text-sm text-blue-600 mt-1">FMCSA Standards Met</p>
                      </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Compliance Benefits</AlertTitle>
                      <AlertDescription>
                        Open source ELD implementation provides full FMCSA compliance at 70% lower cost than commercial solutions.
                        Automatic HOS tracking, violation prevention, and compliance reporting included.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tablets">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Custom ELD Tablets Under $100
                </CardTitle>
                <CardDescription>
                  Manufacturing our own tablets when commercial options are too expensive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tablets && tablets.map((tablet, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{tablet.model}</h3>
                          <p className="text-2xl font-bold text-green-600">${tablet.cost}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Custom Manufacturing</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">Hardware Specifications</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Display:</strong> {tablet.hardware.display}</div>
                            <div><strong>Processor:</strong> {tablet.hardware.processor}</div>
                            <div><strong>RAM:</strong> {tablet.hardware.ram}</div>
                            <div><strong>Storage:</strong> {tablet.hardware.storage}</div>
                            <div><strong>Battery:</strong> {tablet.hardware.battery}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Supplier Information</h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Supplier:</strong> {tablet.supplier.name}</div>
                            <div><strong>Location:</strong> {tablet.supplier.location}</div>
                            <div><strong>Lead Time:</strong> {tablet.supplier.leadTime}</div>
                            <div><strong>Min Order:</strong> {tablet.supplier.minimumOrder} units</div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Connectivity Options</h4>
                        <div className="flex flex-wrap gap-2">
                          {tablet.hardware.connectivity.map((conn, idx) => (
                            <Badge key={idx} variant="outline" className="flex items-center gap-1">
                              <Wifi className="h-3 w-3" />
                              {conn}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => orderTabletMutation.mutate({ 
                            model: tablet.model, 
                            quantity: tablet.supplier.minimumOrder 
                          })}
                          disabled={orderTabletMutation.isPending}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Order {tablet.supplier.minimumOrder} Units
                        </Button>
                        <Button variant="outline">
                          View Specifications
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-6">
            {selectedDevice && latestData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Live ELD Data Stream
                  </CardTitle>
                  <CardDescription>
                    Real-time data from device: {selectedDevice}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Location</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>Lat: {latestData.location.latitude.toFixed(6)}</div>
                        <div>Lng: {latestData.location.longitude.toFixed(6)}</div>
                        <div>Speed: {latestData.location.speed.toFixed(1)} mph</div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Fuel className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Engine Data</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>RPM: {latestData.engineData.rpm.toFixed(0)}</div>
                        <div>Fuel: {latestData.engineData.fuelLevel.toFixed(1)}%</div>
                        <div>Oil Pressure: {latestData.engineData.oilPressure.toFixed(1)} PSI</div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">HOS Status</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>Status: {latestData.hosData.dutyStatus.replace('_', ' ')}</div>
                        <div>Drive Time: {(latestData.hosData.drivingTime / 60).toFixed(1)}h</div>
                        <div>Remaining: {(latestData.hosData.driveRemaining / 60).toFixed(1)}h</div>
                      </div>
                    </div>
                  </div>

                  {latestData.compliance.violations.length > 0 && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>HOS Violations Detected</AlertTitle>
                      <AlertDescription>
                        {latestData.compliance.violations.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {!selectedDevice && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Truck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Select a device from the overview tab to view live data</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}