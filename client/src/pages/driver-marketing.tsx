import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  DollarSign, 
  TrendingUp,
  Phone,
  Mail,
  MessageSquare,
  Target,
  Zap,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  Eye,
  MousePointer,
  UserPlus
} from "lucide-react";

interface DriverLead {
  id: string;
  source: string;
  driverProfile: {
    name: string;
    experience: string;
    homeBase: string;
    painPoints: string[];
  };
  conversionProbability: number;
  estimatedValue: number;
  status: string;
  assignedAI: string;
  createdAt: string;
}

interface MarketingCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  content: {
    headline: string;
    description: string;
    benefits: string[];
    urgencyFactor: string;
  };
  platforms: string[];
  metrics: {
    reach: number;
    clicks: number;
    leads: number;
    conversions: number;
  };
}

interface RevenueOpportunity {
  id: string;
  type: string;
  name: string;
  description: string;
  targetMarket: string;
  monthlyPotential: number;
  implementationTime: string;
  launchReady: boolean;
  competitorPricing: {
    average: number;
  };
  differentiators: string[];
}

interface AcquisitionMetrics {
  totalLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  signedUpDrivers: number;
  conversionRate: number;
  estimatedMonthlyRevenue: number;
  averageConversionProbability: number;
}

export default function DriverMarketing() {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const { data: leads, isLoading: leadsLoading } = useQuery<DriverLead[]>({
    queryKey: ["/api/driver-acquisition/leads"],
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/driver-acquisition/campaigns"],
  });

  const { data: revenueOpportunities, isLoading: revenueLoading } = useQuery<RevenueOpportunity[]>({
    queryKey: ["/api/driver-acquisition/revenue-opportunities"],
  });

  const { data: immediateRevenue, isLoading: immediateLoading } = useQuery<RevenueOpportunity[]>({
    queryKey: ["/api/driver-acquisition/immediate-revenue"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<AcquisitionMetrics>({
    queryKey: ["/api/driver-acquisition/metrics"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed_up': return 'default';
      case 'interested': return 'secondary';
      case 'contacted': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const simulateResponse = async (leadId: string, response: 'positive' | 'negative' | 'neutral') => {
    try {
      await fetch(`/api/driver-acquisition/leads/${leadId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error simulating response:', error);
    }
  };

  if (leadsLoading || campaignsLoading || revenueLoading || metricsLoading) {
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
            Driver Marketing & Revenue
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered driver acquisition and immediate revenue opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          <span className="text-green-600 font-medium">
            {metrics?.conversionRate.toFixed(1)}% Conversion Rate
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Total Leads
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {metrics?.totalLeads || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              AI-generated prospects
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Active Drivers
            </CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {metrics?.signedUpDrivers || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              Signed up & active
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {formatCurrency(metrics?.estimatedMonthlyRevenue || 0)}
            </div>
            <p className="text-xs driver-text-secondary">
              Current projections
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {(metrics?.conversionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs driver-text-secondary">
              Lead to driver
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Immediate Revenue Alert */}
      {immediateRevenue && immediateRevenue.length > 0 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <Zap className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Ready to Launch:</strong> {immediateRevenue.length} revenue streams can be activated immediately. 
            Potential: {formatCurrency(immediateRevenue.reduce((sum, opp) => sum + opp.monthlyPotential, 0))}/month
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Now</TabsTrigger>
          <TabsTrigger value="campaigns">AI Marketing</TabsTrigger>
          <TabsTrigger value="leads">Driver Leads</TabsTrigger>
          <TabsTrigger value="strategy">Growth Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Immediate Revenue Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {immediateRevenue?.map((opportunity) => (
                    <div key={opportunity.id} className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-bold driver-text-emphasis">{opportunity.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(opportunity.monthlyPotential)}/mo
                          </div>
                          <Badge variant="default">Ready Now</Badge>
                        </div>
                      </div>
                      
                      <p className="driver-text-secondary mb-3">{opportunity.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {opportunity.differentiators.slice(0, 3).map((diff) => (
                          <Badge key={diff} variant="outline" className="text-xs">
                            {diff}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm driver-text-secondary">
                          Market rate: {formatCurrency(opportunity.competitorPricing.average)}
                        </span>
                        <Button variant="default" size="sm">
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Launch Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {revenueOpportunities?.filter(opp => !opp.launchReady).map((opportunity) => (
                <Card key={opportunity.id} className="driver-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg driver-text-emphasis">
                        {opportunity.name}
                      </CardTitle>
                      <Badge variant={opportunity.implementationTime === 'within_week' ? 'default' : 'secondary'}>
                        {opportunity.implementationTime.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="driver-text-secondary mb-3">{opportunity.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="driver-text-secondary">Monthly Potential:</span>
                      <span className="font-bold text-green-600">
                        {opportunity.monthlyPotential > 0 
                          ? formatCurrency(opportunity.monthlyPotential)
                          : "Variable"
                        }
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {opportunity.differentiators.slice(0, 2).map((diff) => (
                        <Badge key={diff} variant="outline" className="text-xs">
                          {diff}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {campaigns?.map((campaign) => (
              <Card key={campaign.id} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg driver-text-emphasis">
                        {campaign.name}
                      </CardTitle>
                      <p className="text-sm driver-text-secondary">
                        {campaign.platforms.join(" • ")}
                      </p>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium driver-text-emphasis mb-2">
                        {campaign.content.headline}
                      </h4>
                      <p className="text-sm driver-text-secondary">
                        {campaign.content.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="driver-text-secondary">Reach:</span>
                        <div className="font-medium driver-text-emphasis">
                          {campaign.metrics.reach.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="driver-text-secondary">Clicks:</span>
                        <div className="font-medium driver-text-emphasis">
                          {campaign.metrics.clicks}
                        </div>
                      </div>
                      <div>
                        <span className="driver-text-secondary">Leads:</span>
                        <div className="font-medium driver-text-emphasis">
                          {campaign.metrics.leads}
                        </div>
                      </div>
                      <div>
                        <span className="driver-text-secondary">Conversions:</span>
                        <div className="font-medium driver-text-emphasis">
                          {campaign.metrics.conversions}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {campaign.content.benefits.slice(0, 3).map((benefit) => (
                        <Badge key={benefit} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>

                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Urgency:</strong> {campaign.content.urgencyFactor}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-4">
            {leads?.map((lead) => (
              <Card key={lead.id} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg driver-text-emphasis">
                        {lead.driverProfile.name}
                      </CardTitle>
                      <p className="text-sm driver-text-secondary">
                        {lead.driverProfile.experience} • {lead.driverProfile.homeBase}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(lead.status)}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-bold driver-text-emphasis">
                          {lead.conversionProbability.toFixed(0)}%
                        </div>
                        <div className="text-xs driver-text-secondary">conversion</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="driver-text-secondary">Monthly Value:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(lead.estimatedValue)}
                      </span>
                    </div>

                    <Progress value={lead.conversionProbability} className="h-2" />

                    <div className="flex flex-wrap gap-2">
                      {lead.driverProfile.painPoints.map((painPoint) => (
                        <Badge key={painPoint} variant="outline" className="text-xs">
                          {painPoint.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>

                    {lead.status === 'contacted' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => simulateResponse(lead.id, 'positive')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Positive
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => simulateResponse(lead.id, 'neutral')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Neutral
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => simulateResponse(lead.id, 'negative')}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Negative
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <div className="grid gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Driver Acquisition Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium driver-text-emphasis">Immediate Actions (0-7 days)</h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded bg-green-50 dark:bg-green-900/20">
                        <div className="font-medium text-green-600">Launch AI Load Matching ($99/mo)</div>
                        <div className="text-sm driver-text-secondary">Ready to activate immediately</div>
                      </div>
                      <div className="p-3 rounded bg-green-50 dark:bg-green-900/20">
                        <div className="font-medium text-green-600">AI Rate Negotiation (10% commission)</div>
                        <div className="text-sm driver-text-secondary">Success-based pricing</div>
                      </div>
                      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20">
                        <div className="font-medium text-blue-600">Social Media Campaigns</div>
                        <div className="text-sm driver-text-secondary">Target experienced drivers</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium driver-text-emphasis">Short Term (1-4 weeks)</h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="font-medium text-yellow-600">Instant Payment Service</div>
                        <div className="text-sm driver-text-secondary">2.5% fee vs 30-day wait</div>
                      </div>
                      <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="font-medium text-yellow-600">Premium Load Access</div>
                        <div className="text-sm driver-text-secondary">Requires API keys</div>
                      </div>
                      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20">
                        <div className="font-medium text-blue-600">Job Board Campaigns</div>
                        <div className="text-sm driver-text-secondary">Target new drivers</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium driver-text-emphasis">Long Term (1-3 months)</h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded bg-purple-50 dark:bg-purple-900/20">
                        <div className="font-medium text-purple-600">White-Label Licensing</div>
                        <div className="text-sm driver-text-secondary">$2,500/mo per client</div>
                      </div>
                      <div className="p-3 rounded bg-purple-50 dark:bg-purple-900/20">
                        <div className="font-medium text-purple-600">Enterprise Partnerships</div>
                        <div className="text-sm driver-text-secondary">Fleet owner collaborations</div>
                      </div>
                      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20">
                        <div className="font-medium text-blue-600">Content Marketing</div>
                        <div className="text-sm driver-text-secondary">AI-generated content</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommended Start:</strong> Launch AI Load Matching subscription immediately. 
                    With just 50 drivers at $99/month, you generate $4,950 monthly recurring revenue 
                    while building your driver base for higher-value services.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}