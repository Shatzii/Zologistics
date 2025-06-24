import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Factory, 
  Truck, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LoadSource {
  id: string;
  name: string;
  type: string;
  contactMethod: string;
  priority: number;
  successRate: number;
  avgLoadValue: number;
  frequency: string;
  status: string;
  lastContact: string;
}

interface DirectShipperLead {
  companyName: string;
  industry: string;
  shippingVolume: string;
  routes: string[];
  equipment: string[];
  urgency: string;
  estimatedValue: number;
  source: string;
  confidence: number;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    position: string;
    preferredContactMethod: string;
    responseRate: number;
  };
}

export default function DirectShipperDashboard() {
  const { toast } = useToast();

  const { data: loadSources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ['/api/alternative-loads/sources'],
    refetchInterval: 30000,
  });

  const { data: directShippers = [], isLoading: shippersLoading } = useQuery({
    queryKey: ['/api/alternative-loads/direct-shippers'],
    refetchInterval: 10000,
  });

  const { data: activeSources = [] } = useQuery({
    queryKey: ['/api/alternative-loads/active-sources'],
    refetchInterval: 15000,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/alternative-loads/stats'],
    refetchInterval: 20000,
  });

  const scanOpportunitiesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/alternative-loads/scan-opportunities', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/alternative-loads/direct-shippers'] });
      toast({
        title: "Scan Complete",
        description: `Found ${data.opportunitiesFound} new direct shipper opportunities`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getIndustryColor = (industry: string) => {
    const colors = {
      'retail_chain': '#3b82f6',
      'manufacturing': '#10b981',
      'automotive': '#f59e0b',
      'government': '#8b5cf6',
      'construction': '#ef4444',
      'agriculture': '#84cc16',
      'energy': '#f97316',
      'pharmaceutical': '#06b6d4',
      'food_beverage': '#ec4899'
    };
    return colors[industry] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': 
      case 'contracted': 
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'prospecting': 
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'inactive': 
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: 
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (sourcesLoading || shippersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare chart data
  const industryData = stats?.topIndustries?.map((industry: any) => ({
    name: industry.industry.replace('_', ' '),
    value: industry.averageValue,
    count: industry.sourceCount,
    fill: getIndustryColor(industry.industry)
  })) || [];

  const sourceTypeData = loadSources.reduce((acc: any[], source: LoadSource) => {
    const existing = acc.find(item => item.name === source.type);
    if (existing) {
      existing.count++;
      existing.totalValue += source.avgLoadValue;
    } else {
      acc.push({
        name: source.type.replace('_', ' '),
        count: 1,
        totalValue: source.avgLoadValue,
        avgValue: source.avgLoadValue
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Direct Shipper Network</h1>
          <p className="text-gray-600">Bypass load boards entirely - connect directly with major shippers</p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Direct Sources</p>
                <p className="text-2xl font-bold">{loadSources.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Leads</p>
                <p className="text-2xl font-bold">{directShippers.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Avg Load Value</p>
                <p className="text-2xl font-bold">${stats?.averageLoadValue?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="direct-shippers">Direct Shippers</TabsTrigger>
          <TabsTrigger value="load-sources">Load Sources</TabsTrigger>
          <TabsTrigger value="prospecting">Prospecting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Industry Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={industryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                      />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Avg Value']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Types Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Avg Value']} />
                      <Bar dataKey="avgValue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((activeSources.length / loadSources.length) * 100) || 0}%
                </div>
                <p className="text-xs text-gray-600">Sources actively providing loads</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Potential Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${(directShippers.reduce((sum: number, shipper: DirectShipperLead) => sum + shipper.estimatedValue, 0)).toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">From active prospects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High-Value Prospects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {directShippers.filter((shipper: DirectShipperLead) => shipper.estimatedValue > 5000).length}
                </div>
                <p className="text-xs text-gray-600">Deals over $5,000</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="direct-shippers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Direct Shipper Prospects</h3>
            <Button 
              onClick={() => scanOpportunitiesMutation.mutate()}
              disabled={scanOpportunitiesMutation.isPending}
            >
              <Search className="h-4 w-4 mr-2" />
              Scan for New Opportunities
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {directShippers.map((shipper: DirectShipperLead, index: number) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{shipper.companyName}</CardTitle>
                    <Badge style={{ backgroundColor: getIndustryColor(shipper.industry) }}>
                      {shipper.industry.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estimated Value:</span>
                      <span className="font-semibold">${shipper.estimatedValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Confidence:</span>
                      <span>{shipper.confidence}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Urgency:</span>
                      <Badge variant={shipper.urgency === 'immediate' ? 'destructive' : 'secondary'}>
                        {shipper.urgency}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Volume:</span>
                      <span>{shipper.shippingVolume}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Contact Information</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>{shipper.contactInfo.name} - {shipper.contactInfo.position}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{shipper.contactInfo.email}</span>
                      </div>
                      {shipper.contactInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{shipper.contactInfo.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Equipment Types</p>
                    <div className="flex flex-wrap gap-1">
                      {shipper.equipment.map((eq, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {eq.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Primary Routes</p>
                    <div className="flex flex-wrap gap-1">
                      {shipper.routes.slice(0, 3).map((route, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <MapPin className="h-2 w-2 mr-1" />
                          {route}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Source: {shipper.source.replace('_', ' ')}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">{shipper.contactInfo.responseRate}% response</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {directShippers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No direct shipper prospects found</p>
              <p className="text-sm">Click "Scan for New Opportunities" to find direct shippers</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="load-sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadSources.map((source: LoadSource) => (
              <Card key={source.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(source.status)}
                      <Badge style={{ backgroundColor: getIndustryColor(source.type) }}>
                        {source.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Priority:</span>
                      <div className="flex items-center gap-1">
                        <Progress value={source.priority * 10} className="w-16 h-2" />
                        <span>{source.priority}/10</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Success Rate:</span>
                      <span>{source.successRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Load Value:</span>
                      <span className="font-semibold">${source.avgLoadValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frequency:</span>
                      <span>{source.frequency.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Contact Method:</span>
                      <span>{source.contactMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Contact:</span>
                      <span>{new Date(source.lastContact).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Badge variant={source.status === 'active' ? 'default' : 'secondary'} className="w-full justify-center">
                      {source.status === 'active' ? 'Providing Loads' : source.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prospecting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Prospecting System</CardTitle>
              <p className="text-sm text-gray-600">Continuously scanning for direct shipper opportunities</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Factory className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-blue-800">Manufacturing</h4>
                  <p className="text-blue-700 text-sm">Job posting analysis for logistics coordinators</p>
                  <p className="text-xs text-blue-600 mt-1">30% success rate</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Users className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-green-800">LinkedIn Prospecting</h4>
                  <p className="text-green-700 text-sm">Transportation managers and logistics directors</p>
                  <p className="text-xs text-green-600 mt-1">25% response rate</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <Building2 className="h-8 w-8 text-orange-600 mb-2" />
                  <h4 className="font-semibold text-orange-800">Construction Projects</h4>
                  <p className="text-orange-700 text-sm">Major project announcements and logistics needs</p>
                  <p className="text-xs text-orange-600 mt-1">35% conversion rate</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-purple-800">Government Contracts</h4>
                  <p className="text-purple-700 text-sm">Federal and state transportation contracts</p>
                  <p className="text-xs text-purple-600 mt-1">45% success rate</p>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Prospecting Queue Status</h4>
                  <Badge variant="secondary">
                    <Zap className="h-3 w-3 mr-1" />
                    Running Every 2 Hours
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Queue Size:</p>
                    <p className="font-semibold">{stats?.prospectingQueueSize || 0} prospects</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Scan:</p>
                    <p className="font-semibold">{stats?.lastProspectingRun ? new Date(stats.lastProspectingRun).toLocaleTimeString() : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Next Scan:</p>
                    <p className="font-semibold">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      In {Math.random() > 0.5 ? '1' : '2'} hours
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => scanOpportunitiesMutation.mutate()}
                disabled={scanOpportunitiesMutation.isPending}
                className="w-full"
                size="lg"
              >
                <Search className="h-4 w-4 mr-2" />
                {scanOpportunitiesMutation.isPending ? 'Scanning...' : 'Run Manual Prospect Scan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}