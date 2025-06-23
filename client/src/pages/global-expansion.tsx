import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Globe, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle,
  ArrowRight,
  BarChart3,
  Zap
} from "lucide-react";

export default function GlobalExpansion() {
  const { t, formatCurrency, formatNumber } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['/api/onboarding/regions'],
    retry: false,
  });

  const { data: marketStrategy, isLoading: strategyLoading } = useQuery({
    queryKey: ['/api/onboarding/market-expansion'],
    retry: false,
  });

  const regionalData = [
    {
      id: 'north_america',
      name: 'North America',
      flag: '🇺🇸',
      language: 'English',
      marketSize: 875000,
      ghostLoadOpportunity: 1200,
      status: 'active',
      competitorCount: 15000,
      entryBarriers: 'high',
      timeToMarket: 0,
      investment: 0
    },
    {
      id: 'central_america',
      name: 'Central America',
      flag: '🇬🇹',
      language: 'Español',
      marketSize: 45000,
      ghostLoadOpportunity: 180,
      status: 'ready',
      competitorCount: 800,
      entryBarriers: 'medium',
      timeToMarket: 3,
      investment: 250000
    },
    {
      id: 'european_union',
      name: 'European Union',
      flag: '🇩🇪',
      language: 'Deutsch',
      marketSize: 420000,
      ghostLoadOpportunity: 420,
      status: 'planning',
      competitorCount: 12000,
      entryBarriers: 'high',
      timeToMarket: 6,
      investment: 500000
    },
    {
      id: 'brazil',
      name: 'Brazil',
      flag: '🇧🇷',
      language: 'Português',
      marketSize: 85000,
      ghostLoadOpportunity: 95,
      status: 'evaluation',
      competitorCount: 2500,
      entryBarriers: 'medium',
      timeToMarket: 4,
      investment: 180000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'ready': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      case 'evaluation': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active Operations';
      case 'ready': return 'Ready to Launch';
      case 'planning': return 'In Planning';
      case 'evaluation': return 'Under Evaluation';
      default: return 'Unknown';
    }
  };

  const totalMarketOpportunity = regionalData.reduce((total, region) => total + region.ghostLoadOpportunity, 0);
  const totalInvestmentRequired = regionalData.reduce((total, region) => total + region.investment, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Global Market Expansion
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Multilingual onboarding and international market penetration strategy
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Market Analysis</span>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Launch Expansion</span>
            </Button>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span>Total Market Opportunity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(totalMarketOpportunity * 1000000)}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Annual ghost load market value
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Active Markets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {regionalData.filter(r => r.status === 'active').length} / {regionalData.length}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Operational regions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Languages Supported</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                4
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                English, Spanish, Portuguese, German
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>Investment Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(totalInvestmentRequired)}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Total expansion capital
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Regional Markets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {regionalData.map((region) => (
            <Card 
              key={region.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRegion === region.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedRegion(region.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{region.flag}</span>
                    <div>
                      <CardTitle className="text-xl">{region.name}</CardTitle>
                      <CardDescription>Primary Language: {region.language}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(region.status)} text-white`}>
                    {getStatusText(region.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Market Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Market Size</p>
                    <p className="text-lg font-semibold">{formatCurrency(region.marketSize * 1000000)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ghost Load Opportunity</p>
                    <p className="text-lg font-semibold text-purple-600">{formatCurrency(region.ghostLoadOpportunity * 1000000)}</p>
                  </div>
                </div>

                {/* Competitive Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Competitors</p>
                    <p className="text-lg font-semibold">{formatNumber(region.competitorCount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Entry Barriers</p>
                    <Badge variant={region.entryBarriers === 'high' ? 'destructive' : region.entryBarriers === 'medium' ? 'default' : 'secondary'}>
                      {region.entryBarriers}
                    </Badge>
                  </div>
                </div>

                {/* Timeline and Investment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Time to Market</p>
                    <p className="text-lg font-semibold flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {region.timeToMarket === 0 ? 'Active' : `${region.timeToMarket} months`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Investment Required</p>
                    <p className="text-lg font-semibold">
                      {region.investment === 0 ? 'Complete' : formatCurrency(region.investment)}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {region.status === 'active' ? (
                    <Button variant="outline" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      View Operations
                    </Button>
                  ) : region.status === 'ready' ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Launch Market
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Multilingual Features Showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2">
              <Globe className="h-6 w-6 text-blue-600" />
              <span>Multilingual Platform Features</span>
            </CardTitle>
            <CardDescription>
              Comprehensive language support for global market penetration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="onboarding" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="onboarding">Driver Onboarding</TabsTrigger>
                <TabsTrigger value="compliance">Regulatory Compliance</TabsTrigger>
                <TabsTrigger value="operations">Daily Operations</TabsTrigger>
                <TabsTrigger value="support">Customer Support</TabsTrigger>
              </TabsList>
              
              <TabsContent value="onboarding" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Automated Onboarding Flow</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Region-specific document requirements</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Local compliance verification</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Multi-language form validation</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Cultural adaptation features</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Onboarding Time Reduction</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Central America</span>
                        <span className="text-sm font-semibold text-green-600">-75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <div className="flex justify-between">
                        <span className="text-sm">European Union</span>
                        <span className="text-sm font-semibold text-green-600">-68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                      <div className="flex justify-between">
                        <span className="text-sm">Brazil</span>
                        <span className="text-sm font-semibold text-green-600">-72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Central America</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• SIECA Transport Permits</li>
                        <li>• Guatemala Transit Authorization</li>
                        <li>• Regional Insurance Requirements</li>
                        <li>• Cross-border Documentation</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">European Union</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• EU Transport License</li>
                        <li>• Digital Tachograph Compliance</li>
                        <li>• Mobility Package Requirements</li>
                        <li>• Working Time Directive</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Brazil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• ANTT Registration</li>
                        <li>• CNH Digital Requirements</li>
                        <li>• MDFe System Integration</li>
                        <li>• Local Tax Compliance</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="operations" className="space-y-4">
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Real-time Language Switching</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Seamless language toggle across all platform features for international operations
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="outline">🇺🇸 English</Badge>
                    <Badge variant="outline">🇪🇸 Español</Badge>
                    <Badge variant="outline">🇧🇷 Português</Badge>
                    <Badge variant="outline">🇩🇪 Deutsch</Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="support" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">24/7 Multilingual Support</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Native language customer service</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Cultural context understanding</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Regional business hours coverage</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Local regulatory expertise</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Support Response Times</h5>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>English</span>
                          <span>&lt; 2 minutes</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Spanish</span>
                          <span>&lt; 3 minutes</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Portuguese</span>
                          <span>&lt; 5 minutes</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>German</span>
                          <span>&lt; 4 minutes</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}