import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Clock, 
  Truck, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Navigation,
  Phone,
  MessageSquare,
  Download,
  Eye,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Shipment {
  id: string;
  customerRef: string;
  pickup: {
    location: string;
    date: Date;
    contact: string;
    phone: string;
  };
  delivery: {
    location: string;
    date: Date;
    contact: string;
    phone: string;
  };
  status: "pending" | "assigned" | "picked_up" | "in_transit" | "delivered";
  driver: {
    name: string;
    phone: string;
    truck: string;
  };
  currentLocation: string;
  estimatedDelivery: Date;
  progress: number;
  alerts: string[];
}

export default function CustomerPortal() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    // Simulate real-time shipment data
    const mockShipments: Shipment[] = [
      {
        id: "SH001",
        customerRef: "PO-2025-001",
        pickup: {
          location: "Dallas, TX",
          date: new Date("2025-01-08T08:00:00"),
          contact: "John Smith",
          phone: "(555) 123-4567"
        },
        delivery: {
          location: "Houston, TX",
          date: new Date("2025-01-08T14:00:00"),
          contact: "Sarah Johnson",
          phone: "(555) 987-6543"
        },
        status: "in_transit",
        driver: {
          name: "Mike Rodriguez",
          phone: "(555) 444-7777",
          truck: "Unit #1247"
        },
        currentLocation: "Huntsville, TX",
        estimatedDelivery: new Date("2025-01-08T13:45:00"),
        progress: 65,
        alerts: ["On schedule", "Driver contacted customer"]
      },
      {
        id: "SH002",
        customerRef: "PO-2025-002",
        pickup: {
          location: "Austin, TX",
          date: new Date("2025-01-08T10:00:00"),
          contact: "Lisa Anderson",
          phone: "(555) 222-8888"
        },
        delivery: {
          location: "San Antonio, TX",
          date: new Date("2025-01-08T15:30:00"),
          contact: "David Brown",
          phone: "(555) 333-9999"
        },
        status: "assigned",
        driver: {
          name: "Carlos Martinez",
          phone: "(555) 555-1111",
          truck: "Unit #1389"
        },
        currentLocation: "Austin, TX",
        estimatedDelivery: new Date("2025-01-08T15:30:00"),
        progress: 10,
        alerts: ["Pickup scheduled", "Driver assigned"]
      },
      {
        id: "SH003",
        customerRef: "PO-2025-003",
        pickup: {
          location: "Fort Worth, TX",
          date: new Date("2025-01-07T16:00:00"),
          contact: "Robert Wilson",
          phone: "(555) 666-2222"
        },
        delivery: {
          location: "El Paso, TX",
          date: new Date("2025-01-08T08:00:00"),
          contact: "Jennifer Garcia",
          phone: "(555) 777-3333"
        },
        status: "delivered",
        driver: {
          name: "Tony Johnson",
          phone: "(555) 888-4444",
          truck: "Unit #1456"
        },
        currentLocation: "El Paso, TX",
        estimatedDelivery: new Date("2025-01-08T08:00:00"),
        progress: 100,
        alerts: ["Delivered on time", "POD available"]
      }
    ];
    setShipments(mockShipments);
  }, []);

  const refreshData = () => {
    setLastUpdated(new Date());
    toast({
      title: "Data Refreshed",
      description: "Latest shipment information loaded",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "assigned": return "bg-blue-500";
      case "picked_up": return "bg-orange-500";
      case "in_transit": return "bg-green-500";
      case "delivered": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "assigned": return <Truck className="h-4 w-4" />;
      case "picked_up": return <Package className="h-4 w-4" />;
      case "in_transit": return <Navigation className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const contactDriver = (shipment: Shipment) => {
    toast({
      title: "Contacting Driver",
      description: `Connecting you with ${shipment.driver.name}`,
    });
  };

  const downloadPOD = (shipmentId: string) => {
    toast({
      title: "Downloading POD",
      description: `Proof of Delivery for ${shipmentId} downloaded`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Portal</h1>
            <p className="text-gray-600 mt-1">Real-time shipment tracking and management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold">{shipments.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-green-600">
                  {shipments.filter(s => s.status === "in_transit").length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-600">
                  {shipments.filter(s => s.status === "delivered").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Time Rate</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div 
                key={shipment.id}
                className="border rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedShipment(shipment)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{shipment.customerRef}</h3>
                    <p className="text-sm text-gray-600">Shipment ID: {shipment.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(shipment.status)}>
                      {getStatusIcon(shipment.status)}
                      <span className="ml-1 capitalize">{shipment.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Pickup</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{shipment.pickup.location}</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      {shipment.pickup.date.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{shipment.delivery.location}</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      {shipment.delivery.date.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {shipment.status === "in_transit" && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{shipment.progress}%</span>
                    </div>
                    <Progress value={shipment.progress} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">
                      Current location: {shipment.currentLocation}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Driver: {shipment.driver.name}</p>
                    <p className="text-sm text-gray-500">{shipment.driver.truck}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        contactDriver(shipment);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    {shipment.status === "delivered" && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPOD(shipment.id);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        POD
                      </Button>
                    )}
                  </div>
                </div>
                
                {shipment.alerts.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Recent Updates:</p>
                    <div className="flex flex-wrap gap-2">
                      {shipment.alerts.map((alert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {alert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Shipment Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Shipment Details</h2>
                <Button 
                  onClick={() => setSelectedShipment(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Shipment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer Reference</p>
                      <p className="font-medium">{selectedShipment.customerRef}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Shipment ID</p>
                      <p className="font-medium">{selectedShipment.id}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Route Information</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="font-medium">Pickup Location</p>
                      <p className="text-gray-600">{selectedShipment.pickup.location}</p>
                      <p className="text-sm text-gray-500">{selectedShipment.pickup.date.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        Contact: {selectedShipment.pickup.contact} ({selectedShipment.pickup.phone})
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="font-medium">Delivery Location</p>
                      <p className="text-gray-600">{selectedShipment.delivery.location}</p>
                      <p className="text-sm text-gray-500">{selectedShipment.delivery.date.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        Contact: {selectedShipment.delivery.contact} ({selectedShipment.delivery.phone})
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Driver Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedShipment.driver.name}</p>
                    <p className="text-sm text-gray-600">{selectedShipment.driver.truck}</p>
                    <p className="text-sm text-gray-600">{selectedShipment.driver.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => contactDriver(selectedShipment)}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call Driver
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
                
                {selectedShipment.status === "in_transit" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Live Tracking</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Navigation className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Current Location: {selectedShipment.currentLocation}</span>
                      </div>
                      <Progress value={selectedShipment.progress} className="mb-2" />
                      <p className="text-sm text-gray-600">
                        Estimated Delivery: {selectedShipment.estimatedDelivery.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}