import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, DollarSign, Truck, Route, Handshake, TrendingUp,
  MapPin, Clock, Fuel, Leaf, Star, MessageCircle,
  CheckCircle, AlertTriangle, Eye, Link2, Share, Settings
} from "lucide-react";

interface CollaborationParticipant {
  id: string;
  companyName: string;
  driverId: string;
  driverName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    country: string;
  };
  currentRoute?: {
    origin: { address: string };
    destination: { address: string };
    distance: number;
    estimatedDuration: number;
  };
  availableCapacity: {
    weightCapacity: number;
    volumeCapacity: number;
    backhaul: boolean;
  };
  trustScore: number;
  costSavingsAchieved: number;
  revenueGenerated: number;
  sustainabilityContribution: {
    carbonSaved: number;
    fuelSaved: number;
    emissionReduction: number;
  };
}

interface SavingsOpportunity {
  id: string;
  type: 'fuel_cost_reduction' | 'toll_sharing' | 'maintenance_splitting' | 'deadhead_elimination' | 'load_consolidation';
  participants: string[];
  estimatedSavings: {
    totalSavings: number;
    savingsPerParticipant: { [key: string]: number };
    confidenceLevel: number;
  };
  implementation: {
    timeToImplement: number;
    coordinationRequired: 'low' | 'moderate' | 'high';
  };
  aiConfidence: number;
  environmentalBenefit: {
    carbonReduction: number;
    fuelSavings: number;
    sustainabilityScore: number;
  };
}

interface DriverPartnership {
  id: string;
  primaryDriver: string;
  secondaryDriver: string;
  partnershipType: string;
  savings: {
    totalSavings: number;
    fuelSavings: number;
    timeSavings: number;
  };
  status: 'proposed' | 'accepted' | 'active' | 'completed' | 'cancelled';
  trustLevel: number;
}

interface NetworkMetrics {
  totalParticipants: number;
  activePartnerships: number;
  totalSavingsGenerated: number;
  averageTrustScore: number;
  sustainabilityImpact: {
    carbonSaved: number;
    fuelSaved: number;
  };
}

export function CollaborativeDriverNetworkDashboard() {
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: participants, isLoading: participantsLoading } = useQuery<CollaborationParticipant[]>({
    queryKey: ['/api/collaboration/participants'],
    retry: 1,
  });

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery<SavingsOpportunity[]>({
    queryKey: ['/api/collaboration/opportunities'],
    retry: 1,
  });

  const { data: partnerships, isLoading: partnershipsLoading } = useQuery<DriverPartnership[]>({
    queryKey: ['/api/collaboration/partnerships'],
    retry: 1,
  });

  const { data: networkMetrics } = useQuery<NetworkMetrics>({
    queryKey: ['/api/collaboration/metrics'],
    retry: 1,
  });

  const findOpportunitiesMutation = useMutation({
    mutationFn: async (driverId: string) => {
      const response = await fetch(`/api/collaboration/find-opportunities/${driverId}`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/opportunities'] });
    },
  });

  const createPartnershipMutation = useMutation({
    mutationFn: async (data: { opportunityId: string; participants: string[] }) => {
      const response = await fetch('/api/collaboration/create-partnership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration'] });
    },
  });

  const getOpportunityTypeIcon = (type: string) => {
    switch (type) {
      case 'fuel_cost_reduction': return <Fuel className="w-4 h-4 text-green-400" />;
      case 'load_consolidation': return <Truck className="w-4 h-4 text-blue-400" />;
      case 'toll_sharing': return <Route className="w-4 h-4 text-purple-400" />;
      case 'maintenance_splitting': return <Settings className="w-4 h-4 text-orange-400" />;
      case 'deadhead_elimination': return <TrendingUp className="w-4 h-4 text-red-400" />;
      default: return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'proposed': return 'bg-yellow-500';
      case 'accepted': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleFindOpportunities = (driverId: string) => {
    setSelectedDriver(driverId);
    findOpportunitiesMutation.mutate(driverId);
  };

  const handleCreatePartnership = (opportunityId: string, participants: string[]) => {
    createPartnershipMutation.mutate({ opportunityId, participants });
  };

  if (participantsLoading || opportunitiesLoading || partnershipsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background driver-theme">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold driver-text-critical flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            Collaborative Driver Network
          </h1>
          <p className="driver-text-secondary">
            AI-powered driver pairing for shared routes, cost savings, and collaborative efficiency
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Handshake className="w-3 h-3 mr-1" />
            Collaborative Savings
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Share className="w-3 h-3 mr-1" />
            Cross-Company Network
          </Badge>
        </div>
      </div>

      {/* Network Overview */}
      {networkMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="driver-card border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Network Drivers</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {networkMetrics.totalParticipants}
              </div>
              <p className="text-xs driver-text-secondary">
                Active participants
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Active Partnerships</CardTitle>
              <Handshake className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {networkMetrics.activePartnerships}
              </div>
              <p className="text-xs driver-text-secondary">
                Collaborative routes
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card border-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                ${networkMetrics.totalSavingsGenerated.toLocaleString()}
              </div>
              <p className="text-xs driver-text-secondary">
                Network-wide savings
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Trust Score</CardTitle>
              <Star className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {networkMetrics.averageTrustScore.toFixed(1)}
              </div>
              <p className="text-xs driver-text-secondary">
                Average network trust
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Carbon Saved</CardTitle>
              <Leaf className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {networkMetrics.sustainabilityImpact.carbonSaved.toFixed(1)}
              </div>
              <p className="text-xs driver-text-secondary">
                Tons CO2 reduced
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="participants">Network Drivers</TabsTrigger>
          <TabsTrigger value="opportunities">Savings Opportunities</TabsTrigger>
          <TabsTrigger value="partnerships">Active Partnerships</TabsTrigger>
          <TabsTrigger value="matching">AI Matching Engine</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants?.map((participant) => (
              <Card key={participant.id} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="driver-text-emphasis text-sm">
                      {participant.driverName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className={`text-sm font-medium ${getTrustColor(participant.trustScore)}`}>
                        {participant.trustScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs driver-text-secondary">{participant.companyName}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-1">Current Location</p>
                    <p className="text-xs driver-text-secondary flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {participant.location.address}
                    </p>
                  </div>

                  {participant.currentRoute && (
                    <div>
                      <p className="text-sm font-medium driver-text-emphasis mb-1">Current Route</p>
                      <div className="text-xs driver-text-secondary space-y-1">
                        <p>From: {participant.currentRoute.origin.address}</p>
                        <p>To: {participant.currentRoute.destination.address}</p>
                        <div className="flex justify-between">
                          <span>{participant.currentRoute.distance} miles</span>
                          <span>{participant.currentRoute.estimatedDuration}h</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-1">Available Capacity</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="driver-text-secondary">Weight</p>
                        <p className="driver-text-emphasis">{participant.availableCapacity.weightCapacity.toLocaleString()} lbs</p>
                      </div>
                      <div>
                        <p className="driver-text-secondary">Volume</p>
                        <p className="driver-text-emphasis">{participant.availableCapacity.volumeCapacity} ft³</p>
                      </div>
                    </div>
                    {participant.availableCapacity.backhaul && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Backhaul Available
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        ${participant.costSavingsAchieved.toLocaleString()}
                      </div>
                      <div className="text-xs driver-text-secondary">Savings Achieved</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">
                        {participant.sustainabilityContribution.carbonSaved.toFixed(1)}
                      </div>
                      <div className="text-xs driver-text-secondary">Tons CO2 Saved</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleFindOpportunities(participant.id)}
                    disabled={findOpportunitiesMutation.isPending}
                    size="sm"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {findOpportunitiesMutation.isPending && selectedDriver === participant.id ? 'Finding...' : 'Find Opportunities'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {opportunities?.map((opportunity) => (
              <Card key={opportunity.id} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="driver-text-emphasis text-sm flex items-center gap-2">
                      {getOpportunityTypeIcon(opportunity.type)}
                      {opportunity.type.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(opportunity.aiConfidence * 100)}% Confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        ${opportunity.estimatedSavings.totalSavings.toLocaleString()}
                      </div>
                      <div className="text-xs driver-text-secondary">Total Savings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {opportunity.implementation.timeToImplement}h
                      </div>
                      <div className="text-xs driver-text-secondary">Setup Time</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-2">Savings Per Driver</p>
                    <div className="space-y-1">
                      {Object.entries(opportunity.estimatedSavings.savingsPerParticipant).map(([participantId, savings]) => {
                        const participant = participants?.find(p => p.id === participantId);
                        return (
                          <div key={participantId} className="flex justify-between text-xs">
                            <span className="driver-text-secondary">
                              {participant?.driverName || participantId}
                            </span>
                            <span className="driver-text-emphasis font-medium">
                              ${savings.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-2">Environmental Impact</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div>
                        <p className="text-green-400 font-medium">{opportunity.environmentalBenefit.carbonReduction.toFixed(1)}</p>
                        <p className="driver-text-secondary">Tons CO2</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-medium">{opportunity.environmentalBenefit.fuelSavings.toFixed(0)}</p>
                        <p className="driver-text-secondary">Gallons</p>
                      </div>
                      <div>
                        <p className="text-purple-400 font-medium">{opportunity.environmentalBenefit.sustainabilityScore.toFixed(1)}</p>
                        <p className="driver-text-secondary">Eco Score</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-1">Implementation</p>
                    <div className="flex justify-between text-xs">
                      <span className="driver-text-secondary">Coordination:</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          opportunity.implementation.coordinationRequired === 'low' ? 'bg-green-100' :
                          opportunity.implementation.coordinationRequired === 'moderate' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}
                      >
                        {opportunity.implementation.coordinationRequired}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCreatePartnership(opportunity.id, opportunity.participants)}
                    disabled={createPartnershipMutation.isPending}
                    size="sm"
                    className="w-full"
                  >
                    <Handshake className="w-4 h-4 mr-2" />
                    {createPartnershipMutation.isPending ? 'Creating...' : 'Create Partnership'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {findOpportunitiesMutation.data && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Found {findOpportunitiesMutation.data.length} new collaboration opportunities with potential savings of $
                {findOpportunitiesMutation.data.reduce((sum: number, opp: any) => sum + opp.estimatedSavings.totalSavings, 0).toLocaleString()}.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {partnerships?.map((partnership) => {
              const primaryDriver = participants?.find(p => p.id === partnership.primaryDriver);
              const secondaryDriver = participants?.find(p => p.id === partnership.secondaryDriver);
              
              return (
                <Card key={partnership.id} className="driver-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="driver-text-emphasis text-sm">
                        {partnership.partnershipType.replace('_', ' ').toUpperCase()}
                      </CardTitle>
                      <Badge className={getStatusColor(partnership.status)}>
                        {partnership.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium driver-text-emphasis mb-2">Partnership Details</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="driver-text-secondary">Primary Driver:</span>
                          <span className="driver-text-emphasis">{primaryDriver?.driverName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="driver-text-secondary">Secondary Driver:</span>
                          <span className="driver-text-emphasis">{secondaryDriver?.driverName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="driver-text-secondary">Trust Level:</span>
                          <span className={`font-medium ${getTrustColor(partnership.trustLevel * 100)}`}>
                            {Math.round(partnership.trustLevel * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium driver-text-emphasis mb-2">Savings Breakdown</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-400">
                            ${partnership.savings.totalSavings.toLocaleString()}
                          </div>
                          <div className="text-xs driver-text-secondary">Total</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-400">
                            ${partnership.savings.fuelSavings.toLocaleString()}
                          </div>
                          <div className="text-xs driver-text-secondary">Fuel</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-400">
                            {partnership.savings.timeSavings.toFixed(1)}h
                          </div>
                          <div className="text-xs driver-text-secondary">Time</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        Track
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <Card className="driver-card">
            <CardHeader>
              <CardTitle className="driver-text-emphasis">AI Matching Engine Performance</CardTitle>
              <p className="driver-text-secondary">
                Real-time AI optimization for collaborative driver pairing and cost savings
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">87.5%</div>
                  <p className="driver-text-secondary">Success Rate</p>
                  <p className="text-xs driver-text-secondary mt-1">Successful partnerships</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">$1,850</div>
                  <p className="driver-text-secondary">Average Savings</p>
                  <p className="text-xs driver-text-secondary mt-1">Per partnership</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">250ms</div>
                  <p className="driver-text-secondary">Processing Time</p>
                  <p className="text-xs driver-text-secondary mt-1">AI matching speed</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium driver-text-emphasis mb-3">Matching Factors & Weights</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="driver-text-secondary">Route Compatibility</span>
                      <span className="driver-text-emphasis">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="driver-text-secondary">Timing Synchronization</span>
                      <span className="driver-text-emphasis">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="driver-text-secondary">Cost-Benefit Ratio</span>
                      <span className="driver-text-emphasis">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="driver-text-secondary">Trust Compatibility</span>
                      <span className="driver-text-emphasis">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="driver-text-secondary">Sustainability Alignment</span>
                      <span className="driver-text-emphasis">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </div>

              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  The AI matching engine continuously learns from successful partnerships to improve future recommendations and maximize cost savings across the network.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}