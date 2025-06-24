import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  DollarSign, 
  Fuel, 
  Users, 
  FileText, 
  Wrench, 
  Shield, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Zap,
  Calculator,
  HandHeart,
  Award,
  BarChart3,
  Package,
  CreditCard
} from "lucide-react";

interface CarrierPainPoint {
  id: string;
  category: string;
  problem: string;
  impact: {
    costPerMonth: number;
    timeWastedHours: number;
    stressLevel: number;
    frequencyPerWeek: number;
  };
  ourSolution: {
    name: string;
    description: string;
    costSavings: number;
    timeServices: number;
    automationLevel: number;
    implementationTime: string;
  };
  urgency: string;
}

interface CarrierSolution {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string[];
  pricing: {
    setupFee: number;
    monthlyFee: number;
    perTransactionFee: number;
    savingsGuarantee: string;
  };
  roi: {
    paybackPeriod: string;
    annualSavings: number;
    efficiencyGains: string;
  };
  competitiveAdvantage: string[];
}

export default function CarrierSolutionsDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [carrierSize, setCarrierSize] = useState(10);
  const queryClient = useQueryClient();

  const { data: painPoints } = useQuery<CarrierPainPoint[]>({
    queryKey: ['/api/carrier-solutions/pain-points'],
  });

  const { data: urgentPainPoints } = useQuery<CarrierPainPoint[]>({
    queryKey: ['/api/carrier-solutions/pain-points/urgent'],
  });

  const { data: solutions } = useQuery<CarrierSolution[]>({
    queryKey: ['/api/carrier-solutions/solutions'],
  });

  const { data: incentives } = useQuery({
    queryKey: ['/api/carrier-solutions/incentives'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/carrier-solutions/stats'],
  });

  const { data: savingsCalculation } = useQuery({
    queryKey: ['/api/carrier-solutions/calculate-savings', carrierSize],
    queryFn: async () => {
      const response = await fetch('/api/carrier-solutions/calculate-savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrierSize })
      });
      return response.json();
    }
  });

  const generateProposalMutation = useMutation({
    mutationFn: async (carrierInfo: any) => {
      const response = await fetch('/api/carrier-solutions/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carrierInfo)
      });
      return response.json();
    }
  });

  const getCategoryIcon = (category: string) => {
    const icons = {
      'financial': <DollarSign className="h-5 w-5 text-green-600" />,
      'operational': <Wrench className="h-5 w-5 text-blue-600" />,
      'compliance': <Shield className="h-5 w-5 text-purple-600" />,
      'technology': <Zap className="h-5 w-5 text-yellow-600" />,
      'administrative': <FileText className="h-5 w-5 text-gray-600" />
    };
    return icons[category as keyof typeof icons] || <Package className="h-5 w-5 text-gray-600" />;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[urgency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Carrier Solutions & Agreement Strategies</h1>
          <p className="text-gray-600">Beyond dispatch: solving carriers' biggest pain points to secure partnerships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calculator className="h-4 w-4 mr-1" />
            ROI Calculator
          </Button>
          <Button>
            <HandHeart className="h-4 w-4 mr-1" />
            Generate Proposal
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pain Points Identified</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPainPoints || 0}</div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-red-600">{urgentPainPoints?.length || 0} critical</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solutions Available</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSolutions || 0}</div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-green-600">Ready to deploy</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Opportunity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalMarketOpportunity?.toLocaleString() || '0'}</div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-gray-600">Annual per carrier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Payback Period</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averagePaybackPeriod || 'N/A'}</div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-blue-600">Industry leading</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pain-points">Pain Points</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
          <TabsTrigger value="calculator">ROI Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Urgent Pain Points Alert */}
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Carrier Pain Points Identified</AlertTitle>
            <AlertDescription>
              Carriers are losing $25,000+ monthly on average across fuel costs, driver turnover, and payment delays.
              Our solutions can capture 80% of these losses as revenue opportunities.
            </AlertDescription>
          </Alert>

          {/* Top Urgent Pain Points */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top 5 Critical Pain Points
              </CardTitle>
              <CardDescription>
                Highest impact problems we can solve for immediate agreement value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urgentPainPoints && urgentPainPoints.slice(0, 5).map((painPoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(painPoint.category)}
                        <div>
                          <h4 className="font-semibold">{painPoint.problem}</h4>
                          <p className="text-sm text-gray-600">{painPoint.ourSolution.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getUrgencyColor(painPoint.urgency)}>
                          {painPoint.urgency}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">
                          ${painPoint.impact.costPerMonth.toLocaleString()}/month loss
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-700">
                          ${painPoint.impact.costPerMonth.toLocaleString()}
                        </div>
                        <div className="text-sm text-red-600">Monthly Cost</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">
                          ${painPoint.ourSolution.costSavings.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Our Savings</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">
                          {painPoint.ourSolution.automationLevel}%
                        </div>
                        <div className="text-sm text-blue-600">Automation</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Our Solution:</strong> {painPoint.ourSolution.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Implementation:</strong> {painPoint.ourSolution.implementationTime}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Solution Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Solution Categories</CardTitle>
              <CardDescription>
                Comprehensive services beyond dispatch to solve all carrier challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Fuel className="h-6 w-6 text-green-600" />
                    <h3 className="font-semibold">Fuel Management</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Complete fuel cost optimization with 15-20% guaranteed savings
                  </p>
                  <Badge className="bg-green-100 text-green-800">$15,300/year savings</Badge>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold">Driver Retention</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Reduce turnover by 75% with personalized matching and wellness
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">$38,400/year savings</Badge>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                    <h3 className="font-semibold">Instant Payments</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Same-day payment processing with lowest factoring rates
                  </p>
                  <Badge className="bg-purple-100 text-purple-800">$21,600/year savings</Badge>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-6 w-6 text-orange-600" />
                    <h3 className="font-semibold">Compliance Automation</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    95% reduction in compliance paperwork and zero violations
                  </p>
                  <Badge className="bg-orange-100 text-orange-800">$19,440/year savings</Badge>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Wrench className="h-6 w-6 text-red-600" />
                    <h3 className="font-semibold">Predictive Maintenance</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    50% reduction in unexpected breakdowns with AI prediction
                  </p>
                  <Badge className="bg-red-100 text-red-800">$19,200/year savings</Badge>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-6 w-6 text-cyan-600" />
                    <h3 className="font-semibold">Route Optimization</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    AI-powered routing with 80% deadhead reduction
                  </p>
                  <Badge className="bg-cyan-100 text-cyan-800">Real-time optimization</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pain-points">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Carrier Pain Point Analysis</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of carrier challenges and our solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {painPoints && painPoints.map((painPoint, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(painPoint.category)}
                          <div>
                            <h3 className="font-semibold text-lg">{painPoint.problem}</h3>
                            <p className="text-gray-600">{painPoint.category.charAt(0).toUpperCase() + painPoint.category.slice(1)}</p>
                          </div>
                        </div>
                        <Badge className={getUrgencyColor(painPoint.urgency)}>
                          {painPoint.urgency}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-xl font-bold text-red-600">
                            ${painPoint.impact.costPerMonth.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Monthly Cost</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">
                            {painPoint.impact.timeWastedHours}h
                          </div>
                          <div className="text-sm text-gray-600">Time Wasted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-yellow-600">
                            {painPoint.impact.stressLevel}/10
                          </div>
                          <div className="text-sm text-gray-600">Stress Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {painPoint.impact.frequencyPerWeek}x
                          </div>
                          <div className="text-sm text-gray-600">Per Week</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-2">Our Solution</h4>
                          <h5 className="font-medium text-green-800">{painPoint.ourSolution.name}</h5>
                          <p className="text-sm text-green-700 mb-3">{painPoint.ourSolution.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <strong>Savings:</strong> ${painPoint.ourSolution.costSavings.toLocaleString()}/month
                            </div>
                            <div>
                              <strong>Time Saved:</strong> {painPoint.ourSolution.timeServices || 0}h/month
                            </div>
                            <div>
                              <strong>Automation:</strong> {painPoint.ourSolution.automationLevel}%
                            </div>
                            <div>
                              <strong>Setup:</strong> {painPoint.ourSolution.implementationTime}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">Competitive Landscape</h4>
                          <div className="space-y-2">
                            {painPoint.competitorSolutions?.map((competitor, idx) => (
                              <div key={idx} className="text-sm">
                                <div className="font-medium text-blue-800">{competitor.name}</div>
                                <div className="text-blue-700">
                                  ${competitor.monthlyCost}/month - {competitor.limitations.join(', ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="solutions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Solution Portfolio</CardTitle>
                <CardDescription>
                  All-in-one carrier services beyond traditional dispatch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {solutions && solutions.map((solution, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{solution.name}</h3>
                          <p className="text-gray-600">{solution.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${solution.roi.annualSavings.toLocaleString()}/year
                          </div>
                          <div className="text-sm text-gray-600">Savings</div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{solution.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">Key Benefits</h4>
                          <ul className="text-sm space-y-1">
                            {solution.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Pricing</h4>
                          <div className="text-sm space-y-1">
                            <div><strong>Setup:</strong> ${solution.pricing.setupFee}</div>
                            <div><strong>Monthly:</strong> ${solution.pricing.monthlyFee}</div>
                            <div><strong>Transaction:</strong> {solution.pricing.perTransactionFee}%</div>
                            <div className="text-green-600 font-medium">{solution.pricing.savingsGuarantee}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">ROI Metrics</h4>
                          <div className="text-sm space-y-1">
                            <div><strong>Payback:</strong> {solution.roi.paybackPeriod}</div>
                            <div><strong>Annual Savings:</strong> ${solution.roi.annualSavings.toLocaleString()}</div>
                            <div><strong>Efficiency:</strong> {solution.roi.efficiencyGains}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-1">Competitive Advantages</h5>
                        <div className="flex flex-wrap gap-2">
                          {solution.competitiveAdvantage.map((advantage, idx) => (
                            <Badge key={idx} variant="outline" className="text-blue-700">
                              {advantage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incentives">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Agreement Incentives & Deal Sweeteners
                </CardTitle>
                <CardDescription>
                  Compelling offers to secure carrier partnerships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {incentives && incentives.map((incentive: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{incentive.description}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          {incentive.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="text-2xl font-bold text-green-600">
                          {incentive.type === 'revenue_share' ? `${incentive.value}%` : `$${incentive.value.toLocaleString()}`}
                        </div>
                        <div className="text-sm text-gray-600">Value</div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Duration:</strong> {incentive.duration}
                        </div>
                        <div>
                          <strong>Conditions:</strong>
                          <ul className="mt-1 ml-4 list-disc text-gray-600">
                            {incentive.conditions.map((condition: string, idx: number) => (
                              <li key={idx}>{condition}</li>
                            ))}
                          </ul>
                        </div>
                        {incentive.exclusivity && (
                          <Badge variant="outline" className="text-purple-600">
                            Exclusive Partnership
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculator">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  ROI Calculator for Carriers
                </CardTitle>
                <CardDescription>
                  Calculate potential savings based on carrier fleet size
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fleet Size (Number of Trucks)</label>
                    <input
                      type="number"
                      value={carrierSize}
                      onChange={(e) => setCarrierSize(parseInt(e.target.value) || 1)}
                      className="w-full p-2 border rounded-lg"
                      min="1"
                      max="1000"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Enter the number of trucks in the carrier's fleet
                    </p>
                  </div>

                  {savingsCalculation && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-700">
                            ${savingsCalculation.totalAnnualSavings?.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-600">Annual Savings</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-700">
                            ${Math.round(savingsCalculation.totalMonthlyCost)?.toLocaleString()}
                          </div>
                          <div className="text-sm text-blue-600">Monthly Cost</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-700">
                            {savingsCalculation.roi}%
                          </div>
                          <div className="text-sm text-purple-600">ROI</div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg text-center">
                          <div className="text-2xl font-bold text-orange-700">
                            {savingsCalculation.paybackPeriod}
                          </div>
                          <div className="text-sm text-orange-600">Payback Period</div>
                        </div>
                      </div>

                      {savingsCalculation.volumeDiscount > 0 && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Volume Discount Applied!</AlertTitle>
                          <AlertDescription>
                            {savingsCalculation.volumeDiscount}% discount for fleet of {carrierSize} trucks
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">What's Included in Our Solution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Cost Optimization:</strong>
                      <ul className="mt-1 ml-4 list-disc text-gray-600">
                        <li>Fuel management (15-20% savings)</li>
                        <li>Insurance optimization (20% savings)</li>
                        <li>Maintenance prediction (50% breakdown reduction)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Operational Excellence:</strong>
                      <ul className="mt-1 ml-4 list-disc text-gray-600">
                        <li>Driver retention (75% turnover reduction)</li>
                        <li>Compliance automation (95% paperwork reduction)</li>
                        <li>Route optimization (80% deadhead reduction)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={() => generateProposalMutation.mutate({
                    name: 'Sample Carrier',
                    fleetSize: carrierSize,
                    id: Date.now()
                  })}
                  disabled={generateProposalMutation.isPending}
                >
                  Generate Detailed Proposal
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}