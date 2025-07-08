import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Smartphone, 
  Check, 
  Clock, 
  MapPin, 
  DollarSign, 
  Camera, 
  Mic, 
  Navigation,
  Truck,
  FileText,
  MessageCircle,
  Battery,
  Wifi,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Load {
  id: string;
  pickup: string;
  delivery: string;
  rate: number;
  miles: number;
  equipment: string;
  urgency: "urgent" | "high" | "medium" | "low";
  deadline: Date;
  status: "available" | "assigned" | "in_transit" | "delivered";
}

export default function MobileDriverApp() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [activeLoad, setActiveLoad] = useState<Load | null>(null);
  const [driverStatus, setDriverStatus] = useState("available");
  const [location, setLocation] = useState("Dallas, TX");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate real-time load updates
    const mockLoads: Load[] = [
      {
        id: "LD001",
        pickup: "Dallas, TX",
        delivery: "Houston, TX",
        rate: 2850,
        miles: 240,
        equipment: "Dry Van",
        urgency: "high",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "available"
      },
      {
        id: "LD002",
        pickup: "Austin, TX",
        delivery: "San Antonio, TX",
        rate: 1950,
        miles: 160,
        equipment: "Reefer",
        urgency: "urgent",
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
        status: "available"
      },
      {
        id: "LD003",
        pickup: "Fort Worth, TX",
        delivery: "El Paso, TX",
        rate: 3200,
        miles: 350,
        equipment: "Flatbed",
        urgency: "medium",
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: "available"
      }
    ];
    setLoads(mockLoads);
  }, []);

  const acceptLoad = (loadId: string) => {
    const load = loads.find(l => l.id === loadId);
    if (load) {
      setActiveLoad(load);
      setLoads(loads.map(l => 
        l.id === loadId ? { ...l, status: "assigned" } : l
      ));
      setDriverStatus("assigned");
      toast({
        title: "Load Accepted! 🚛",
        description: `Load ${loadId} accepted. Route optimization activated.`,
      });
    }
  };

  const startVoiceCommand = () => {
    setIsVoiceActive(true);
    toast({
      title: "Voice Command Active 🎤",
      description: "Say 'Accept load', 'Update status', or 'Navigation'",
    });
    
    // Simulate voice command recognition
    setTimeout(() => {
      setIsVoiceActive(false);
      toast({
        title: "Voice Command Processed",
        description: "Status updated to 'En Route'",
      });
    }, 3000);
  };

  const updateStatus = (status: string) => {
    setDriverStatus(status);
    toast({
      title: "Status Updated",
      description: `Status changed to: ${status}`,
    });
  };

  const captureDocument = () => {
    toast({
      title: "Document Captured 📸",
      description: "Bill of Lading uploaded and processed automatically",
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getRatePerMile = (rate: number, miles: number) => {
    return (rate / miles).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TruckFlow Driver</h1>
              <p className="text-sm text-gray-600">Unit #1247 • {location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            <Battery className="h-4 w-4 text-green-500" />
            <Badge variant={driverStatus === "available" ? "default" : "secondary"}>
              {driverStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Active Load Card */}
      {activeLoad && (
        <Card className="mb-4 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Active Load: {activeLoad.id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {activeLoad.pickup} → {activeLoad.delivery}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  ${activeLoad.rate.toLocaleString()}
                </span>
                <Badge className={getUrgencyColor(activeLoad.urgency)}>
                  {activeLoad.urgency}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => updateStatus("en_route")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Start Route
                </Button>
                <Button 
                  onClick={captureDocument}
                  variant="outline"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Scan BOL
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button 
          onClick={startVoiceCommand}
          className={`h-16 ${isVoiceActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          <Mic className="h-6 w-6 mr-2" />
          {isVoiceActive ? 'Listening...' : 'Voice Command'}
        </Button>
        <Button 
          onClick={() => toast({ title: "Messages", description: "No new messages" })}
          variant="outline"
          className="h-16"
        >
          <MessageCircle className="h-6 w-6 mr-2" />
          Messages
        </Button>
      </div>

      {/* Available Loads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Available Loads Near You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loads.filter(load => load.status === "available").map((load) => (
              <div 
                key={load.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{load.id}</h3>
                    <p className="text-sm text-gray-600">
                      {load.pickup} → {load.delivery}
                    </p>
                  </div>
                  <Badge className={getUrgencyColor(load.urgency)}>
                    {load.urgency}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">${load.rate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-blue-500" />
                    <span>{load.miles} miles</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{load.equipment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">${getRatePerMile(load.rate, load.miles)}/mile</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Due: {load.deadline.toLocaleDateString()} at {load.deadline.toLocaleTimeString()}
                  </span>
                </div>
                
                <Button 
                  onClick={() => acceptLoad(load.id)}
                  className="w-full mt-3 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept Load - One Tap
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Today's Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$8,450</div>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">847</div>
              <p className="text-sm text-gray-600">Miles</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <p className="text-sm text-gray-600">On-Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">4.9</div>
              <p className="text-sm text-gray-600">Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}