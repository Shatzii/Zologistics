import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Eye,
  Share2,
  Copy,
  Zap,
  Target,
  Truck,
  Filter,
  RefreshCw
} from "lucide-react";

interface AggregatedLoad {
  id: string;
  source: string;
  priority: string;
  origin: { city: string; state: string };
  destination: { city: string; state: string };
  equipment: string;
  weight: number;
  commodity: string;
  rate: number;
  ratePerMile: number;
  mileage: number;
  pickupDate: string;
  aiEnhancements: {
    rateOptimization: {
      suggestedRate: number;
      marketComparison: string;
      negotiationTips: string[];
    };
    routeOptimization: {
      fuelCost: number;
      estimatedTime: number;
    };
    profitabilityScore: number;
    riskAssessment: {
      brokerRating: number;
      paymentHistory: string;
      loadComplexity: string;
    };
  };
  broker: {
    name: string;
    contact: string;
    mcNumber?: string;
    rating?: number;
    paymentTerms: string;
  };
}

interface DriverSubscription {
  plan: string;
  monthlyFee: number;
  status: string;
  usage: {
    loadsViewedToday: number;
    loadsViewedMonth: number;
  };
}

interface AggregationMetrics {
  totalLoadsAggregated: number;
  uniqueLoadsAfterDeduplication: number;
  businessMetrics: {
    totalSubscriptions: number;
    monthlyRevenue: number;
    monthlyCosts: number;
    netProfit: number;
    driverSavings: number;
  };
}

interface SubscriptionPlan {
  name: string;
  price: number;
  features: string[];
  savings: string;
  popular?: boolean;
}

export default function DriverLoadsDashboard() {
  const [selectedDriver] = useState(1); // Simulating logged-in driver
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: loads, isLoading: loadsLoading, refetch: refetchLoads } = useQuery<AggregatedLoad[]>({
    queryKey: [`/api/aggregated-loads/${selectedDriver}`],
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<DriverSubscription>({
    queryKey: [`/api/subscription/${selectedDriver}`],
  });

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<AggregationMetrics>({
    queryKey: ["/api/aggregation/metrics"],
  });

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
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getSourceBadgeColor = (source: string) => {
    const colors = {
      'DAT LoadBoard': 'bg-blue-100 text-blue-800',
      'Truckstop.com': 'bg-green-100 text-green-800',
      'CH Robinson': 'bg-purple-100 text-purple-800',
      'Convoy': 'bg-orange-100 text-orange-800'
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredLoads = loads?.filter(load => 
    filterEquipment === 'all' || load.equipment === filterEquipment
  ) || [];

  const equipmentTypes = [...new Set(loads?.map(load => load.equipment) || [])];

  if (loadsLoading || subscriptionLoading || plansLoading || metricsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
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
            Driver Loads Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Access all major load boards through one subscription
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchLoads()}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setShowShareModal(true)}
          >
            <Share2 className="w-4 h-4 mr-1" />
            Refer Driver
          </Button>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <Alert className={subscription.plan === 'free' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
          <Star className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}</strong>
            {subscription.plan === 'free' ? (
              <span> - {10 - subscription.usage.loadsViewedToday} free loads remaining today. Upgrade for unlimited access!</span>
            ) : (
              <span> - Unlimited access to all premium loads from DAT, Truckstop, CH Robinson, and Convoy.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Available Loads
            </CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {filteredLoads.length}
            </div>
            <p className="text-xs driver-text-secondary">
              From 4 major sources
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Your Savings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {formatCurrency(577 - (subscription?.monthlyFee || 0))}
            </div>
            <p className="text-xs driver-text-secondary">
              vs individual subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Today's Usage
            </CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {subscription?.usage.loadsViewedToday || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              Loads viewed today
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Network Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {metrics?.totalLoadsAggregated || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              Loads aggregated daily
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="loads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loads">Available Loads</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="savings">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="loads" className="space-y-4">
          {/* Filter Controls */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={filterEquipment}
              onChange={(e) => setFilterEquipment(e.target.value)}
              className="px-3 py-1 rounded border bg-white dark:bg-gray-700"
            >
              <option value="all">All Equipment</option>
              {equipmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredLoads.length} loads
            </span>
          </div>

          {/* Loads Grid */}
          <div className="grid gap-4">
            {filteredLoads.map((load) => (
              <Card key={load.id} className="driver-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="font-bold driver-text-emphasis">
                            {load.origin.city}, {load.origin.state} → {load.destination.city}, {load.destination.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSourceBadgeColor(load.source)}>
                            {load.source}
                          </Badge>
                          {load.priority === 'premium' && (
                            <Badge variant="default">Premium</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(load.rate)}
                      </div>
                      <div className="text-sm driver-text-secondary">
                        {formatCurrency(load.ratePerMile)}/mile
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm driver-text-secondary">Equipment:</span>
                      <div className="font-medium driver-text-emphasis">{load.equipment}</div>
                    </div>
                    <div>
                      <span className="text-sm driver-text-secondary">Weight:</span>
                      <div className="font-medium driver-text-emphasis">{load.weight.toLocaleString()} lbs</div>
                    </div>
                    <div>
                      <span className="text-sm driver-text-secondary">Distance:</span>
                      <div className="font-medium driver-text-emphasis">{load.mileage} miles</div>
                    </div>
                    <div>
                      <span className="text-sm driver-text-secondary">Pickup:</span>
                      <div className="font-medium driver-text-emphasis">{formatDate(load.pickupDate)}</div>
                    </div>
                  </div>

                  {/* AI Enhancements */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">AI Analysis</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">Suggested Rate:</span>
                        <div className="font-bold text-green-600">
                          {formatCurrency(load.aiEnhancements.rateOptimization.suggestedRate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">Profit Score:</span>
                        <div className="font-bold">{load.aiEnhancements.profitabilityScore}/100</div>
                      </div>
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">Fuel Cost:</span>
                        <div className="font-bold">{formatCurrency(load.aiEnhancements.routeOptimization.fuelCost)}</div>
                      </div>
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">Est. Time:</span>
                        <div className="font-bold">{load.aiEnhancements.routeOptimization.estimatedTime}h</div>
                      </div>
                    </div>
                  </div>

                  {/* Broker Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm driver-text-secondary">Broker:</span>
                        <div className="font-medium driver-text-emphasis">{load.broker.name}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(load.broker.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm driver-text-secondary ml-1">
                          ({load.aiEnhancements.riskAssessment.paymentHistory})
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      <Button variant="default" size="sm">
                        <Truck className="w-4 h-4 mr-1" />
                        Book Load
                      </Button>
                    </div>
                  </div>

                  {/* Negotiation Tips */}
                  {load.aiEnhancements.rateOptimization.negotiationTips.length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Negotiation Tips:</span>
                      </div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        {load.aiEnhancements.rateOptimization.negotiationTips.join(' • ')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Card key={plan.name} className={`driver-card ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl driver-text-emphasis">{plan.name}</CardTitle>
                    {plan.popular && (
                      <Badge variant="default">Most Popular</Badge>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                    {plan.price > 0 && <span className="text-sm font-normal driver-text-secondary">/month</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-green-600">{plan.savings}</p>
                    
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm driver-text-emphasis">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant={plan.popular ? "default" : "outline"} 
                      className="w-full mt-4"
                      disabled={subscription?.plan === plan.name.toLowerCase()}
                    >
                      {subscription?.plan === plan.name.toLowerCase() ? 'Current Plan' : `Choose ${plan.name}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>What you get:</strong> Instead of paying DAT ($149), Truckstop ($129), CH Robinson ($299) separately, 
              access all their loads through our Premium plan for just $79/month. That's $498 in savings every month!
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Individual Subscriptions Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>DAT LoadBoard:</span>
                    <span className="font-bold">{formatCurrency(149)}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Truckstop.com:</span>
                    <span className="font-bold">{formatCurrency(129)}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CH Robinson:</span>
                    <span className="font-bold">{formatCurrency(299)}/month</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-bold">Total Cost:</span>
                      <span className="font-bold text-red-600">{formatCurrency(577)}/month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  TruckFlow AI Premium
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>All Load Boards Access:</span>
                    <span className="font-bold text-green-600">{formatCurrency(79)}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Optimization:</span>
                    <span className="font-bold text-green-600">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate Negotiation:</span>
                    <span className="font-bold text-green-600">Included</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-bold">Your Savings:</span>
                      <span className="font-bold text-green-600">{formatCurrency(498)}/month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Annual Savings: {formatCurrency(498 * 12)}</strong> - That's enough to cover truck payments, 
              fuel costs, or insurance premiums. Plus you get AI optimization that can increase your rates by $2,400+ monthly.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}