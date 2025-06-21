import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Truck, 
  Package, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Zap,
  MapPin,
  Weight,
  Gauge,
  Target,
  AlertTriangle,
  CheckCircle,
  Timer,
  Route
} from "lucide-react";

interface LoadOpportunity {
  id: string;
  vehicleClass: string;
  equipmentType: string;
  origin: string;
  destination: string;
  weight: number;
  dimensions: { length: number; width: number; height: number; pieces: number };
  commodity: string;
  rate: number;
  mileage: number;
  ratePerMile: number;
  urgency: string;
  loadSize: string;
  brokerageType: string;
  aiMatchScore: number;
  marketRate: number;
  profitMargin: number;
  source: string;
  pickupWindow: { start: string; end: string };
  deliveryWindow: { start: string; end: string };
  specialRequirements: string[];
}

interface MarketReport {
  summary: {
    totalOpportunities: number;
    averageRate: number;
    averageMargin: number;
    highUrgencyCount: number;
  };
  hotshots: {
    count: number;
    averageRate: number;
    topRate: number;
    urgentLoads: number;
  };
  boxTrucks: {
    count: number;
    averageRate: number;
    topRate: number;
    localDeliveries: number;
  };
  smallVehicles: {
    count: number;
    averageRate: number;
    topRate: number;
    sameDayLoads: number;
  };
  opportunities: LoadOpportunity[];
}

export default function MultiVehicleBrokerage() {
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  const { data: marketReport, isLoading: reportLoading } = useQuery<MarketReport>({
    queryKey: ["/api/brokerage/market-report"],
  });

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<LoadOpportunity[]>({
    queryKey: ["/api/brokerage/opportunities", selectedVehicleType, urgencyFilter],
    queryFn: async () => {
      let url = "/api/brokerage/opportunities";
      const params = new URLSearchParams();
      
      if (urgencyFilter !== "all") {
        params.append("urgency", urgencyFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      return response.json();
    },
  });

  const { data: hotshotOpportunities } = useQuery<LoadOpportunity[]>({
    queryKey: ["/api/brokerage/hotshot"],
  });

  const { data: boxTruckOpportunities } = useQuery<LoadOpportunity[]>({
    queryKey: ["/api/brokerage/box-trucks"],
  });

  const { data: smallVehicleOpportunities } = useQuery<LoadOpportunity[]>({
    queryKey: ["/api/brokerage/small-vehicles"],
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-500';
      case 'hotshot': return 'bg-orange-500';
      case 'same_day': return 'bg-yellow-500';
      case 'expedite': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'hotshot': return <Zap className="w-4 h-4" />;
      case 'same_day': return <Timer className="w-4 h-4" />;
      case 'expedite': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (reportLoading || opportunitiesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Multi-Vehicle Brokerage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered load matching for hotshot, box trucks, and small vehicles
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgencies</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="hotshot">Hotshot</SelectItem>
              <SelectItem value="same_day">Same Day</SelectItem>
              <SelectItem value="expedite">Expedite</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Market Overview Cards */}
      {marketReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="driver-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-secondary">
                Total Opportunities
              </CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold driver-text-emphasis">
                {marketReport.summary.totalOpportunities}
              </div>
              <p className="text-xs driver-text-secondary">
                {marketReport.summary.highUrgencyCount} high urgency
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-secondary">
                Average Rate
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold driver-text-emphasis">
                {formatCurrency(marketReport.summary.averageRate)}
              </div>
              <p className="text-xs driver-text-secondary">
                {marketReport.summary.averageMargin.toFixed(1)}% avg margin
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-secondary">
                Hotshot Loads
              </CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold driver-text-emphasis">
                {marketReport.hotshots.count}
              </div>
              <p className="text-xs driver-text-secondary">
                ${marketReport.hotshots.averageRate.toFixed(2)}/mile avg
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-secondary">
                Box Truck Loads
              </CardTitle>
              <Truck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold driver-text-emphasis">
                {marketReport.boxTrucks.count}
              </div>
              <p className="text-xs driver-text-secondary">
                {marketReport.boxTrucks.localDeliveries} local deliveries
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vehicle Type Tabs */}
      <Tabs value={selectedVehicleType} onValueChange={setSelectedVehicleType} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Vehicles</TabsTrigger>
          <TabsTrigger value="hotshot">Hotshot</TabsTrigger>
          <TabsTrigger value="box-truck">Box Trucks</TabsTrigger>
          <TabsTrigger value="small-vehicle">Small Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {opportunities?.slice(0, 10).map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hotshot" className="space-y-4">
          <div className="grid gap-4">
            {hotshotOpportunities?.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="box-truck" className="space-y-4">
          <div className="grid gap-4">
            {boxTruckOpportunities?.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="small-vehicle" className="space-y-4">
          <div className="grid gap-4">
            {smallVehicleOpportunities?.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: LoadOpportunity }) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'hotshot': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'same_day': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'expedite': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-200 bg-white dark:bg-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'hotshot': return <Zap className="w-4 h-4 text-orange-500" />;
      case 'same_day': return <Timer className="w-4 h-4 text-yellow-500" />;
      case 'expedite': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={`driver-card border-2 ${getUrgencyColor(opportunity.urgency)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getUrgencyIcon(opportunity.urgency)}
            <div>
              <CardTitle className="text-lg driver-text-emphasis">
                {opportunity.commodity}
              </CardTitle>
              <p className="text-sm driver-text-secondary">
                {opportunity.equipmentType} • {opportunity.vehicleClass}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(opportunity.rate)}
            </div>
            <p className="text-sm driver-text-secondary">
              ${opportunity.ratePerMile.toFixed(2)}/mile
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="driver-text-emphasis font-medium">
              {opportunity.origin}
            </span>
            <Route className="w-4 h-4 text-gray-400" />
            <span className="driver-text-emphasis font-medium">
              {opportunity.destination}
            </span>
          </div>
          <Badge variant="outline">
            {opportunity.mileage} miles
          </Badge>
        </div>

        {/* Load Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-gray-500" />
            <span className="driver-text-secondary">Weight:</span>
            <span className="driver-text-emphasis font-medium">
              {opportunity.weight.toLocaleString()} lbs
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="driver-text-secondary">Size:</span>
            <span className="driver-text-emphasis font-medium">
              {opportunity.loadSize}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="driver-text-secondary">AI Match:</span>
            <span className="driver-text-emphasis font-medium">
              {opportunity.aiMatchScore}%
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="driver-text-secondary">Margin:</span>
            <span className="text-green-600 font-medium">
              {opportunity.profitMargin}%
            </span>
          </div>
        </div>

        {/* Dimensions and Special Requirements */}
        <div className="flex items-center justify-between text-sm">
          <div className="driver-text-secondary">
            Dimensions: {opportunity.dimensions.length}' × {opportunity.dimensions.width}' × {opportunity.dimensions.height}'
            {opportunity.dimensions.pieces > 1 && ` • ${opportunity.dimensions.pieces} pieces`}
          </div>
          <div className="flex gap-2">
            {opportunity.specialRequirements.slice(0, 2).map((req, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {req.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-xs driver-text-secondary">
            <span>Source: {opportunity.source}</span>
            <span>Brokerage: {opportunity.brokerageType.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Accept Load
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}