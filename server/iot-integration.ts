import { WebSocket } from 'ws';
import { storage } from './storage';

export interface IoTDevice {
  id: string;
  driverId: number;
  type: 'eld' | 'gps' | 'fuel' | 'temperature' | 'weight';
  status: 'online' | 'offline' | 'error';
  lastUpdate: Date;
  data: any;
}

export interface RealTimeData {
  deviceId: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
  speed?: number;
  fuelLevel?: number;
  engineHours?: number;
  temperature?: number;
  weight?: number;
  hosStatus?: 'available' | 'driving' | 'sleeper' | 'off_duty';
}

export class IoTIntegrationService {
  private devices: Map<string, IoTDevice> = new Map();
  private wsConnections: Set<WebSocket> = new Set();

  constructor() {
    this.initializeMockDevices();
    this.startDataSimulation();
  }

  private initializeMockDevices() {
    // Initialize with demo IoT devices
    const mockDevices: IoTDevice[] = [
      {
        id: 'eld-001',
        driverId: 1,
        type: 'eld',
        status: 'online',
        lastUpdate: new Date(),
        data: { hosStatus: 'available', drivingHours: 8.5, remainingHours: 2.5 }
      },
      {
        id: 'gps-001',
        driverId: 1,
        type: 'gps',
        status: 'online',
        lastUpdate: new Date(),
        data: { lat: 40.7128, lng: -74.0060, speed: 65, heading: 180 }
      },
      {
        id: 'fuel-001',
        driverId: 1,
        type: 'fuel',
        status: 'online',
        lastUpdate: new Date(),
        data: { level: 75, consumption: 6.8, efficiency: 7.2 }
      }
    ];

    mockDevices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  private startDataSimulation() {
    setInterval(() => {
      this.devices.forEach((device, deviceId) => {
        const updatedData = this.generateRealisticData(device);
        device.data = updatedData;
        device.lastUpdate = new Date();
        
        this.broadcastUpdate({
          deviceId,
          timestamp: new Date(),
          ...updatedData
        });
      });
    }, 5000); // Update every 5 seconds
  }

  private generateRealisticData(device: IoTDevice): any {
    switch (device.type) {
      case 'gps':
        return {
          lat: device.data.lat + (Math.random() - 0.5) * 0.01,
          lng: device.data.lng + (Math.random() - 0.5) * 0.01,
          speed: Math.max(0, device.data.speed + (Math.random() - 0.5) * 10),
          heading: (device.data.heading + (Math.random() - 0.5) * 20) % 360
        };
      case 'fuel':
        return {
          level: Math.max(0, Math.min(100, device.data.level - Math.random() * 0.5)),
          consumption: device.data.consumption + (Math.random() - 0.5) * 0.2,
          efficiency: device.data.efficiency + (Math.random() - 0.5) * 0.1
        };
      case 'eld':
        return {
          hosStatus: device.data.hosStatus,
          drivingHours: Math.min(11, device.data.drivingHours + Math.random() * 0.1),
          remainingHours: Math.max(0, device.data.remainingHours - Math.random() * 0.1)
        };
      default:
        return device.data;
    }
  }

  private broadcastUpdate(data: RealTimeData) {
    const message = JSON.stringify({
      type: 'iot_update',
      data
    });

    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  addWebSocketConnection(ws: WebSocket) {
    this.wsConnections.add(ws);
    
    ws.on('close', () => {
      this.wsConnections.delete(ws);
    });

    // Send current device status
    ws.send(JSON.stringify({
      type: 'device_status',
      devices: Array.from(this.devices.values())
    }));
  }

  getDeviceData(deviceId: string): IoTDevice | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): IoTDevice[] {
    return Array.from(this.devices.values());
  }

  async updateDriverLocation(driverId: number, location: { lat: number; lng: number }) {
    await storage.updateDriverLocation(driverId, location);
    
    // Broadcast to connected clients
    this.broadcastUpdate({
      deviceId: `gps-${driverId}`,
      timestamp: new Date(),
      location
    });
  }
}

export const iotService = new IoTIntegrationService();