import type { Express } from "express";
import { storage } from "./storage";
import { insertDriverSchema, insertNotificationSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Mobile authentication middleware
export const authenticateDriver = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const driver = await storage.getDriverByUserId(decoded.userId);
    
    if (!driver) {
      return res.status(401).json({ error: 'Driver not found' });
    }

    req.driver = driver;
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export function registerMobileRoutes(app: Express) {
  
  // Driver Authentication
  app.post('/api/mobile/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== 'driver') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const driver = await storage.getDriverByUserId(user.id);
      if (!driver) {
        return res.status(401).json({ error: 'Driver profile not found' });
      }

      const token = jwt.sign({ userId: user.id, driverId: driver.id }, JWT_SECRET, { expiresIn: '30d' });
      
      await storage.updateUserLastLogin(user.id);

      res.json({
        token,
        driver: {
          id: driver.id,
          name: driver.name,
          initials: driver.initials,
          status: driver.status,
          currentLocation: driver.currentLocation,
          email: driver.email,
          phoneNumber: driver.phoneNumber
        }
      });
    } catch (error) {
      console.error('Mobile login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Driver Registration
  app.post('/api/mobile/auth/register', async (req, res) => {
    try {
      const { name, email, password, phoneNumber, licenseNumber } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user account
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username: email,
        email,
        password: hashedPassword,
        name,
        role: 'driver'
      });

      // Create driver profile
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      const driver = await storage.createDriver({
        userId: user.id,
        name,
        initials,
        currentLocation: 'Unknown',
        status: 'off_duty',
        phoneNumber,
        email,
        licenseNumber
      });

      const token = jwt.sign({ userId: user.id, driverId: driver.id }, JWT_SECRET, { expiresIn: '30d' });

      res.json({
        token,
        driver: {
          id: driver.id,
          name: driver.name,
          initials: driver.initials,
          status: driver.status,
          email: driver.email,
          phoneNumber: driver.phoneNumber
        }
      });
    } catch (error) {
      console.error('Mobile registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Driver Profile
  app.get('/api/mobile/driver/profile', authenticateDriver, async (req: any, res) => {
    try {
      const driver = req.driver;
      res.json({
        id: driver.id,
        name: driver.name,
        initials: driver.initials,
        status: driver.status,
        currentLocation: driver.currentLocation,
        email: driver.email,
        phoneNumber: driver.phoneNumber,
        licenseNumber: driver.licenseNumber,
        licenseExpiry: driver.licenseExpiry,
        preferences: driver.preferences,
        gpsCoordinates: driver.gpsCoordinates,
        lastActive: driver.lastActive
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Update Driver Status
  app.patch('/api/mobile/driver/status', authenticateDriver, async (req: any, res) => {
    try {
      const { status, location } = req.body;
      const driver = req.driver;

      const updatedDriver = await storage.updateDriverStatus(driver.id, status, location);
      if (!updatedDriver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      res.json({
        status: updatedDriver.status,
        currentLocation: updatedDriver.currentLocation,
        lastActive: updatedDriver.lastActive
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // Update GPS Location
  app.post('/api/mobile/driver/location', authenticateDriver, async (req: any, res) => {
    try {
      const { latitude, longitude } = req.body;
      const driver = req.driver;

      const coordinates = { lat: latitude, lng: longitude };
      const updatedDriver = await storage.updateDriverLocation(driver.id, coordinates);
      
      if (!updatedDriver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      res.json({
        success: true,
        coordinates: updatedDriver.gpsCoordinates,
        timestamp: updatedDriver.lastActive
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update location' });
    }
  });

  // Update Device Token for Push Notifications
  app.post('/api/mobile/driver/device-token', authenticateDriver, async (req: any, res) => {
    try {
      const { deviceToken } = req.body;
      const driver = req.driver;

      const updatedDriver = await storage.updateDriverDeviceToken(driver.id, deviceToken);
      if (!updatedDriver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update device token' });
    }
  });

  // Get Available Loads for Driver
  app.get('/api/mobile/loads/available', authenticateDriver, async (req: any, res) => {
    try {
      const driver = req.driver;
      const { radius = 50, equipmentType } = req.query;

      // Get loads filtered by driver preferences and location
      const filters: any = { status: 'available' };
      if (equipmentType) filters.equipmentType = equipmentType;

      const allLoads = await storage.getLoads(driver.companyId, filters);
      
      // Filter by radius if GPS coordinates available
      let nearbyLoads = allLoads;
      if (driver.gpsCoordinates && driver.gpsCoordinates.lat && driver.gpsCoordinates.lng) {
        nearbyLoads = allLoads.filter(load => {
          if (!load.originCoords || !load.originCoords.lat) return true;
          const distance = calculateDistance(
            driver.gpsCoordinates.lat,
            driver.gpsCoordinates.lng,
            load.originCoords.lat,
            load.originCoords.lng
          );
          return distance <= parseInt(radius as string);
        });
      }

      // Sort by match score and rate
      const sortedLoads = nearbyLoads
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 20); // Limit to 20 loads for mobile

      res.json(sortedLoads.map(load => ({
        id: load.id,
        externalId: load.externalId,
        origin: load.origin,
        destination: load.destination,
        miles: load.miles,
        rate: load.rate,
        ratePerMile: load.ratePerMile,
        marketRate: load.marketRate,
        pickupTime: load.pickupTime,
        deliveryTime: load.deliveryTime,
        equipmentType: load.equipmentType,
        weight: load.weight,
        commodity: load.commodity,
        matchScore: load.matchScore,
        source: load.source,
        isHotLoad: load.isHotLoad
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch available loads' });
    }
  });

  // Accept Load Assignment
  app.post('/api/mobile/loads/:loadId/accept', authenticateDriver, async (req: any, res) => {
    try {
      const { loadId } = req.params;
      const driver = req.driver;

      const load = await storage.getLoad(parseInt(loadId));
      if (!load) {
        return res.status(404).json({ error: 'Load not found' });
      }

      if (load.status !== 'available') {
        return res.status(400).json({ error: 'Load is no longer available' });
      }

      const assignedLoad = await storage.assignLoadToDriver(parseInt(loadId), driver.id);
      if (!assignedLoad) {
        return res.status(400).json({ error: 'Failed to assign load' });
      }

      // Update driver status
      await storage.updateDriverStatus(driver.id, 'en_route');

      // Create notification for dispatcher
      await storage.createNotification({
        userId: assignedLoad.dispatcherId || 1, // Default to admin
        type: 'assignment',
        title: 'Load Accepted',
        message: `${driver.name} accepted load ${assignedLoad.externalId}`,
        data: { loadId: assignedLoad.id, driverId: driver.id }
      });

      res.json({
        success: true,
        load: {
          id: assignedLoad.id,
          externalId: assignedLoad.externalId,
          origin: assignedLoad.origin,
          destination: assignedLoad.destination,
          rate: assignedLoad.rate,
          status: assignedLoad.status
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to accept load' });
    }
  });

  // Get Driver's Assigned Loads
  app.get('/api/mobile/loads/assigned', authenticateDriver, async (req: any, res) => {
    try {
      const driver = req.driver;
      const loads = await storage.getLoads(driver.companyId, { assignedDriverId: driver.id });

      res.json(loads.map(load => ({
        id: load.id,
        externalId: load.externalId,
        origin: load.origin,
        destination: load.destination,
        miles: load.miles,
        rate: load.rate,
        ratePerMile: load.ratePerMile,
        pickupTime: load.pickupTime,
        deliveryTime: load.deliveryTime,
        status: load.status,
        equipmentType: load.equipmentType,
        weight: load.weight,
        commodity: load.commodity,
        brokerInfo: load.brokerInfo
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch assigned loads' });
    }
  });

  // Update Load Status (pickup, delivery, etc.)
  app.patch('/api/mobile/loads/:loadId/status', authenticateDriver, async (req: any, res) => {
    try {
      const { loadId } = req.params;
      const { status } = req.body;
      const driver = req.driver;

      const load = await storage.getLoad(parseInt(loadId));
      if (!load || load.assignedDriverId !== driver.id) {
        return res.status(404).json({ error: 'Load not found or not assigned to you' });
      }

      const updatedLoad = await storage.updateLoadStatus(parseInt(loadId), status);
      if (!updatedLoad) {
        return res.status(400).json({ error: 'Failed to update load status' });
      }

      // Update driver status based on load status
      if (status === 'delivered') {
        await storage.updateDriverStatus(driver.id, 'available');
      }

      // Create notification for dispatcher
      await storage.createNotification({
        userId: updatedLoad.dispatcherId || 1,
        type: 'status_update',
        title: 'Load Status Updated',
        message: `Load ${updatedLoad.externalId} marked as ${status} by ${driver.name}`,
        data: { loadId: updatedLoad.id, status, driverId: driver.id }
      });

      res.json({
        success: true,
        load: {
          id: updatedLoad.id,
          status: updatedLoad.status,
          updatedAt: updatedLoad.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update load status' });
    }
  });

  // Get Driver Notifications
  app.get('/api/mobile/notifications', authenticateDriver, async (req: any, res) => {
    try {
      const { unreadOnly = false } = req.query;
      const user = req.user;

      const notifications = await storage.getUserNotifications(
        user.id, 
        unreadOnly === 'true'
      );

      res.json(notifications.slice(0, 50)); // Limit to 50 for mobile
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Mark Notification as Read
  app.patch('/api/mobile/notifications/:notificationId/read', authenticateDriver, async (req: any, res) => {
    try {
      const { notificationId } = req.params;

      const notification = await storage.markNotificationRead(parseInt(notificationId));
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });
}

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.756; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}