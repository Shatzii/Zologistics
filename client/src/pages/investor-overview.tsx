import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Globe, 
  Shield,
  Zap,
  BarChart3,
  Target,
  ArrowRight,
  Download
} from "lucide-react";
import { Link } from "wouter";

export default function InvestorOverview() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'valuation' | 'technology'>('revenue');

  const revenueData = {
    current: {
      monthly: 60000,
      autonomous: 40000,
      ghostLoads: 15000,
      multiModal: 5000
    },
    projected: {
      month6: 180000,
      month12: 350000,
      year2: 850000
    },
    metrics: {
      users: 847,
      growth: 127,
      retention: 94,
      margins: 86
    }
  };

  const valuationData = {
    technology: 12000000,
    revenue: 18000000,
    market: 246000000000,
    acquisition: 4800000000
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                TruckFlow AI - Investor Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Autonomous logistics platform generating $60K+ monthly revenue
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">Back to Platform</Button>
              </Link>
              <Button className="bg-green-600 hover:bg-green-700">
                Download Investment Package
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Investment Opportunity
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Autonomous Revenue Generation
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Revolutionary AI-powered logistics platform operating autonomously with 
              proven revenue generation, proprietary technology, and global market opportunity.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ${revenueData.current.monthly.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <div className="text-green-600 text-sm font-medium mt-2">
                  +{revenueData.metrics.growth}% Growth
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {revenueData.metrics.users}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <div className="text-blue-600 text-sm font-medium mt-2">
                  {revenueData.metrics.retention}% Retention
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ${(valuationData.market / 1000000000).toFixed(0)}B
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Market Opportunity</p>
                <div className="text-purple-600 text-sm font-medium mt-2">
                  Global Logistics
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {revenueData.metrics.margins}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margins</p>
                <div className="text-orange-600 text-sm font-medium mt-2">
                  Autonomous Operations
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Analysis Tabs */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'revenue'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Revenue Analysis
              </button>
              <button
                onClick={() => setActiveTab('valuation')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'valuation'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Valuation Model
              </button>
              <button
                onClick={() => setActiveTab('technology')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'technology'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Technology Assets
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'revenue' && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                    Current Revenue Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Autonomous Sales</span>
                      <span className="font-semibold">${revenueData.current.autonomous.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Ghost Load Capture</span>
                      <span className="font-semibold">${revenueData.current.ghostLoads.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Multi-Modal Logistics</span>
                      <span className="font-semibold">${revenueData.current.multiModal.toLocaleString()}/mo</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Monthly Revenue</span>
                        <span className="text-green-600">${revenueData.current.monthly.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-6 w-6 mr-2 text-blue-600" />
                    Growth Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">6 Months</span>
                      <span className="font-semibold">${revenueData.projected.month6.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">12 Months</span>
                      <span className="font-semibold">${revenueData.projected.month12.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">24 Months</span>
                      <span className="font-semibold">${revenueData.projected.year2.toLocaleString()}/mo</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Annual ARR (Year 2)</span>
                        <span className="text-blue-600">${(revenueData.projected.year2 * 12).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'valuation' && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-6 w-6 mr-2 text-purple-600" />
                    Valuation Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Technology Assets</span>
                      <span className="font-semibold">${(valuationData.technology / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Revenue Multiple (12x)</span>
                      <span className="font-semibold">${(valuationData.revenue / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Market Position</span>
                      <span className="font-semibold">${(valuationData.market / 1000000000).toFixed(0)}B TAM</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Acquisition Value</span>
                        <span className="text-purple-600">${(valuationData.acquisition / 1000000000).toFixed(1)}B</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                        <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium">Autonomous Operations</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          24/7 revenue generation with minimal human oversight
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">Global Market Access</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Multi-modal logistics across 7 regions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                        <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium">Proprietary Technology</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Self-hosted AI with industry-specific models
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'technology' && (
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI & Machine Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>• 5 Self-hosted AI models</div>
                    <div>• Real-time load optimization</div>
                    <div>• Predictive analytics engine</div>
                    <div>• Natural language processing</div>
                    <div>• Computer vision integration</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Technology</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>• 50+ integrated features</div>
                    <div>• Real-time WebSocket system</div>
                    <div>• Multi-language support</div>
                    <div>• Mobile-first architecture</div>
                    <div>• Blockchain smart contracts</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Operational Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>• Autonomous sales agents</div>
                    <div>• Ghost load capture engine</div>
                    <div>• Multi-modal logistics</div>
                    <div>• Global compliance framework</div>
                    <div>• Enterprise-grade security</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Discuss Investment?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join the autonomous logistics revolution. Platform generating proven revenue 
            with massive scaling potential.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Schedule Meeting
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Download Full Package
              <Download className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}