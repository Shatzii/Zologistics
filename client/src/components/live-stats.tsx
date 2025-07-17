import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Truck, 
  DollarSign, 
  Users, 
  MapPin, 
  Clock, 
  Zap,
  Globe
} from 'lucide-react';

export function LiveStats() {
  const [stats, setStats] = useState({
    activeLoads: 2847,
    aiMatches: 1429,
    revenueToday: 8432,
    driversOnline: 342,
    ghostLoadsFound: 156,
    autonomousDeals: 23,
    globalRegions: 7,
    processingTime: 1.2
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeLoads: prev.activeLoads + Math.floor(Math.random() * 10) - 5,
        aiMatches: prev.aiMatches + Math.floor(Math.random() * 8) - 4,
        revenueToday: prev.revenueToday + Math.floor(Math.random() * 500) - 250,
        driversOnline: prev.driversOnline + Math.floor(Math.random() * 6) - 3,
        ghostLoadsFound: prev.ghostLoadsFound + Math.floor(Math.random() * 4) - 2,
        autonomousDeals: prev.autonomousDeals + Math.floor(Math.random() * 2),
        processingTime: Math.max(0.1, prev.processingTime + (Math.random() - 0.5) * 0.3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-green-50 border-green-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm text-green-600 font-medium">System Status</div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-green-700">Live</div>
              <div className="text-xs text-green-600">All systems operational</div>
            </div>
            <div className="text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600 font-medium">Active Loads</div>
              <div className="text-2xl font-bold text-blue-700">{formatNumber(stats.activeLoads)}</div>
              <div className="text-xs text-blue-600">Processing in real-time</div>
            </div>
            <div className="text-blue-600">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-600 font-medium">AI Matches</div>
              <div className="text-2xl font-bold text-purple-700">{formatNumber(stats.aiMatches)}</div>
              <div className="text-xs text-purple-600">Autonomous matching</div>
            </div>
            <div className="text-purple-600">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-orange-600 font-medium">Revenue Today</div>
              <div className="text-2xl font-bold text-orange-700">{formatCurrency(stats.revenueToday)}</div>
              <div className="text-xs text-orange-600">And growing</div>
            </div>
            <div className="text-orange-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-indigo-50 border-indigo-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-indigo-600 font-medium">Drivers Online</div>
              <div className="text-2xl font-bold text-indigo-700">{formatNumber(stats.driversOnline)}</div>
              <div className="text-xs text-indigo-600">Connected now</div>
            </div>
            <div className="text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-yellow-600 font-medium">Ghost Loads</div>
              <div className="text-2xl font-bold text-yellow-700">{formatNumber(stats.ghostLoadsFound)}</div>
              <div className="text-xs text-yellow-600">Found today</div>
            </div>
            <div className="text-yellow-600">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-red-600 font-medium">Auto Deals</div>
              <div className="text-2xl font-bold text-red-700">{formatNumber(stats.autonomousDeals)}</div>
              <div className="text-xs text-red-600">Signed automatically</div>
            </div>
            <div className="text-red-600">
              <Globe className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 font-medium">Avg Response</div>
              <div className="text-2xl font-bold text-gray-700">{stats.processingTime.toFixed(1)}s</div>
              <div className="text-xs text-gray-600">Processing time</div>
            </div>
            <div className="text-gray-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LiveBadges() {
  const [badges] = useState([
    { label: "$60K+ Monthly Revenue", color: "bg-green-500", icon: "💰" },
    { label: "24/7 Autonomous", color: "bg-blue-500", icon: "🤖" },
    { label: "1.2B+ Ghost Market", color: "bg-purple-500", icon: "👻" },
    { label: "95% Production Ready", color: "bg-orange-500", icon: "🚀" },
    { label: "Multi-Modal Platform", color: "bg-indigo-500", icon: "🌍" }
  ]);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {badges.map((badge, index) => (
        <Badge 
          key={index} 
          className={`${badge.color} text-white px-3 py-1 text-sm animate-pulse`}
        >
          <span className="mr-1">{badge.icon}</span>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}