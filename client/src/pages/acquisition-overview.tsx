import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  DollarSign, 
  Shield, 
  Globe,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Download
} from "lucide-react";
import { Link } from "wouter";
import logoPath from "@assets/ChatGPT Image Jul 10, 2025, 07_30_44 AM_1752499822142.png";

export default function AcquisitionOverview() {
  const acquisitionData = {
    asking: 4800000000,
    technology: 12000000,
    revenue: 720000000,
    market: 246000000000,
    timeframe: "3-6 months",
    completion: "Q2 2025"
  };

  const buyerProfiles = [
    {
      name: "UPS",
      fit: "95%",
      synergies: "$2.4B",
      reasoning: "Global logistics network, existing tech infrastructure"
    },
    {
      name: "FedEx",
      fit: "92%",
      synergies: "$2.1B",
      reasoning: "Last-mile delivery optimization, international presence"
    },
    {
      name: "Amazon Logistics",
      fit: "88%",
      synergies: "$3.2B",
      reasoning: "AWS integration, autonomous vehicle fleet"
    },
    {
      name: "DHL",
      fit: "85%",
      synergies: "$1.8B",
      reasoning: "European market presence, B2B focus"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="Zologistics Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Strategic Acquisition Opportunity
                </h1>
                <p className="text-muted-foreground">
                  Complete platform acquisition - Zologistics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">Back to Platform</Button>
              </Link>
              <Button className="bg-green-600 hover:bg-green-700">
                Download Acquisition Package
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
              Strategic Acquisition
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Platform Acquisition
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Acquire the world's first autonomous logistics platform with proven revenue generation,
              proprietary AI technology, and global market presence.
            </p>
          </div>

          {/* Acquisition Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ${(acquisitionData.asking / 1000000000).toFixed(1)}B
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acquisition Price</p>
                <div className="text-green-600 text-sm font-medium mt-2">
                  50-100% Premium Value
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ${(acquisitionData.revenue / 1000000).toFixed(0)}M
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Annual Revenue</p>
                <div className="text-blue-600 text-sm font-medium mt-2">
                  Autonomous Generation
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {acquisitionData.timeframe}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completion Timeline</p>
                <div className="text-purple-600 text-sm font-medium mt-2">
                  {acquisitionData.completion}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Platform Acquisition Includes
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Full ownership of all technology, operations, and revenue streams
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-green-600" />
                  Technology Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">5 Self-Hosted AI Models</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Complete AI infrastructure with industry-specific training
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">50+ Integrated Features</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Complete platform with load boards, AI optimization, analytics
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Proprietary Algorithms</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Ghost load capture, route optimization, predictive analytics
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Global Infrastructure</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Multi-region deployment, compliance frameworks
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-6 w-6 mr-2 text-blue-600" />
                  Operations & Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Autonomous Sales Agents</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        24/7 customer acquisition generating $40K+ monthly
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Ghost Load Operations</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Capturing $1.2B+ annual opportunity across 7 regions
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Multi-Modal Logistics</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Sea freight ($5.7B), air freight ($3.65B) platforms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Active User Base</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        847 active users with 94% retention rate
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ideal Buyer Profiles */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Strategic Buyer Analysis
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ideal acquisition targets with maximum synergy potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {buyerProfiles.map((buyer, index) => (
              <Card key={index} className="bg-white dark:bg-gray-900">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{buyer.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {buyer.fit} Fit
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Synergies Value</span>
                      <span className="font-semibold text-green-600">{buyer.synergies}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Strategic Reasoning
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {buyer.reasoning}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Acquisition Process */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Acquisition Process
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Streamlined process for qualified strategic buyers
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="font-semibold mb-2">Initial Contact</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  NDA signing and preliminary discussions
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="font-semibold mb-2">Due Diligence</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Complete technology and financial review
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="font-semibold mb-2">Valuation</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Final pricing and terms negotiation
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="font-semibold mb-2">Closing</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Asset transfer and integration planning
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Begin Acquisition Process?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Complete platform acquisition with proven autonomous revenue generation.
            Ideal for strategic buyers seeking logistics technology leadership.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Contact for Acquisition
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Download Due Diligence Package
              <Download className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}