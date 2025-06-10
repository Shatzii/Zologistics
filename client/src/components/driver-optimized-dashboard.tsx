import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, Navigation, Phone, MessageCircle, Clock, 
  MapPin, Fuel, AlertTriangle, CheckCircle, Mic,
  Volume2, Eye, Settings, Battery, Signal
} from "lucide-react";

interface DriverLoad {
  id: number;
  loadNumber: string;
  origin: string;
  destination: string;
  pickupTime: Date;
  deliveryTime: Date;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  miles: number;
  rate: number;
  urgency: 'normal' | 'urgent' | 'critical';
}

interface DriverStatus {
  id: number;
  name: string;
  status: 'available' | 'driving' | 'on_break' | 'off_duty';
  currentLocation: string;
  hoursRemaining: number;
  nextBreakDue: Date;
  earnings: {
    today: number;
    week: number;
    month: number;
  };
}

export function DriverOptimizedDashboard() {
  const [voiceActive, setVoiceActive] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Simulate driver data
  const driverStatus: DriverStatus = {
    id: 1,
    name: "John Smith",
    status: 'driving',
    currentLocation: "I-75 South, Mile Marker 245",
    hoursRemaining: 6.5,
    nextBreakDue: new Date(Date.now() + 2 * 60 * 60 * 1000),
    earnings: {
      today: 485,
      week: 2340,
      month: 8950
    }
  };

  const currentLoad: DriverLoad = {
    id: 1,
    loadNumber: "TF-2024-1789",
    origin: "Atlanta, GA",
    destination: "Miami, FL",
    pickupTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    deliveryTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    status: 'in_transit',
    miles: 662,
    rate: 2850,
    urgency: 'normal'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'driver-status-available';
      case 'driving': return 'driver-status-busy';
      case 'on_break': return 'driver-status-busy';
      case 'off_duty': return 'driver-status-offline';
      default: return 'driver-status-offline';
    }
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'driver-emergency';
      case 'urgent': return 'border-2 border-amber-400';
      default: return '';
    }
  };

  const handleVoiceCommand = () => {
    setVoiceActive(!voiceActive);
    // Voice command integration would go here
  };

  const handleEmergencyAlert = () => {
    setEmergencyMode(true);
    // Emergency alert system would trigger here
  };

  return (
    <div className="driver-theme min-h-screen p-4 space-y-6">
      {/* Emergency Alert Bar */}
      {emergencyMode && (
        <div className="driver-emergency p-4 rounded-lg text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <div className="driver-text-critical">EMERGENCY MODE ACTIVE</div>
          <Button 
            onClick={() => setEmergencyMode(false)}
            className="mt-2 bg-white text-red-600 font-bold"
          >
            Clear Emergency
          </Button>
        </div>
      )}

      {/* Driver Status Header */}
      <Card className="driver-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="driver-text-critical">Welcome Back, {driverStatus.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(driverStatus.status)} driver-text-emphasis`}>
                  {driverStatus.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-green-400">
                  <Signal className="w-4 h-4" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="driver-dashboard-metric">{driverStatus.hoursRemaining}h</div>
              <div className="driver-text-secondary">Hours Remaining</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="driver-text-emphasis">${driverStatus.earnings.today}</div>
              <div className="driver-text-secondary">Today</div>
            </div>
            <div className="text-center">
              <div className="driver-text-emphasis">${driverStatus.earnings.week}</div>
              <div className="driver-text-secondary">This Week</div>
            </div>
            <div className="text-center">
              <div className="driver-text-emphasis">${driverStatus.earnings.month}</div>
              <div className="driver-text-secondary">This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Load Information */}
      <Card className={`driver-card ${getUrgencyStyles(currentLoad.urgency)}`}>
        <CardHeader>
          <CardTitle className="driver-text-critical flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-400" />
            Current Load: {currentLoad.loadNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <div className="driver-text-emphasis">From: {currentLoad.origin}</div>
                <div className="driver-text-emphasis">To: {currentLoad.destination}</div>
              </div>
              <div className="text-right">
                <div className="driver-dashboard-metric">${currentLoad.rate.toLocaleString()}</div>
                <div className="driver-text-secondary">{currentLoad.miles} miles</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between driver-text-secondary">
              <span>Progress</span>
              <span>65% Complete</span>
            </div>
            <Progress value={65} className="h-3 bg-gray-700" />
          </div>

          {/* ETA Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="driver-text-emphasis">6h 15m</div>
              <div className="driver-text-secondary">ETA</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="driver-text-emphasis">245 mi</div>
              <div className="driver-text-secondary">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Large Touch Targets */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="driver-button h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-500"
          onClick={() => window.open('tel:dispatch', '_self')}
        >
          <Phone className="w-8 h-8" />
          <span className="driver-text-emphasis">Call Dispatch</span>
        </Button>
        
        <Button 
          className={`driver-button h-20 flex flex-col gap-2 ${voiceActive ? 'driver-voice-active bg-blue-600' : 'bg-purple-600 hover:bg-purple-500'}`}
          onClick={handleVoiceCommand}
        >
          <Mic className="w-8 h-8" />
          <span className="driver-text-emphasis">Voice Commands</span>
        </Button>

        <Button 
          className="driver-button h-20 flex flex-col gap-2 bg-green-600 hover:bg-green-500"
          onClick={() => window.open('/mobile/navigation', '_self')}
        >
          <Navigation className="w-8 h-8" />
          <span className="driver-text-emphasis">Navigation</span>
        </Button>

        <Button 
          className="driver-button h-20 flex flex-col gap-2 bg-red-600 hover:bg-red-500"
          onClick={handleEmergencyAlert}
        >
          <AlertTriangle className="w-8 h-8" />
          <span className="driver-text-emphasis">Emergency</span>
        </Button>
      </div>

      {/* HOS Compliance Monitor */}
      <Card className="driver-card">
        <CardHeader>
          <CardTitle className="driver-text-critical flex items-center gap-2">
            <Clock className="w-6 h-6 text-yellow-400" />
            Hours of Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="driver-text-emphasis">Driving Time</span>
              <span className="driver-text-emphasis">4h 30m / 11h</span>
            </div>
            <Progress value={41} className="h-3 bg-gray-700" />
            
            <div className="flex justify-between items-center">
              <span className="driver-text-emphasis">On Duty Time</span>
              <span className="driver-text-emphasis">7h 45m / 14h</span>
            </div>
            <Progress value={55} className="h-3 bg-gray-700" />

            <div className="p-3 bg-yellow-900 rounded-lg border border-yellow-600">
              <div className="driver-text-emphasis text-yellow-300">
                Next Required Break: 2h 15m
              </div>
              <div className="driver-text-secondary text-yellow-400">
                30-minute break required
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Status */}
      <Card className="driver-card">
        <CardHeader>
          <CardTitle className="driver-text-critical flex items-center gap-2">
            <Fuel className="w-6 h-6 text-green-400" />
            Vehicle Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="driver-dashboard-metric text-green-400">78%</div>
              <div className="driver-text-secondary">Fuel Level</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="driver-dashboard-metric text-blue-400">68°F</div>
              <div className="driver-text-secondary">Engine Temp</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="driver-text-secondary">Next Service</span>
              <span className="driver-text-emphasis">2,450 miles</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="driver-text-secondary">Tire Pressure</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      <Card className="driver-card">
        <CardHeader>
          <CardTitle className="driver-text-emphasis flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="driver-text-secondary">Screen Brightness</label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-center driver-text-secondary">{brightness}%</div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="driver-text-secondary">Voice Alerts</span>
              <Volume2 className="w-5 h-5 text-blue-400" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="driver-text-secondary">Blue Light Filter</span>
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Strip */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
        <div className="flex justify-center gap-4">
          <Button className="driver-button bg-red-600 hover:bg-red-500 flex-1">
            <Phone className="w-5 h-5 mr-2" />
            Emergency: 911
          </Button>
          <Button className="driver-button bg-blue-600 hover:bg-blue-500 flex-1">
            <MessageCircle className="w-5 h-5 mr-2" />
            Roadside Assist
          </Button>
        </div>
      </div>
    </div>
  );
}