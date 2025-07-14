import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

export default function BusinessLanding() {
  const [activeTab, setActiveTab] = useState<'dispatchers' | 'truckers' | 'logistics'>('dispatchers');

  const revenueMetics = {
    monthlyRevenue: 60000,
    activeUsers: 847,
    loadProcessed: 12500,
    avgSavings: 2800
  };

  const audiences = {
    dispatchers: {
      title: "Dispatch Operations",
      icon: Users,
      features: [
        "AI-powered load matching with 85% accuracy",
        "Real-time rate optimization and negotiation",
        "Automated customer acquisition system",
        "Live GPS tracking and route optimization"
      ],
      pricing: "$149/month",
      benefits: "Reduce dispatch time by 60%, increase margins by 23%"
    },
    truckers: {
      title: "Owner Operators & Drivers",
      icon: Truck,
      features: [
        "Smart load recommendations based on your preferences",
        "Voice-activated load acceptance and navigation",
        "Instant payment processing and factoring",
        "Driver wellness and performance analytics"
      ],
      pricing: "$79/month",
      benefits: "Increase weekly revenue by $800+, reduce deadhead by 25%"
    },
    logistics: {
      title: "Logistics Companies",
      icon: Building2,
      features: [
        "Multi-modal transport optimization (sea, air, truck)",
        "Autonomous broker agreements and smart contracts",
        "Global load board integration across 7 regions",
        "Enterprise-grade compliance and reporting"
      ],
      pricing: "Custom Enterprise",
      benefits: "Scale operations 3x, reduce costs by 40%"
    }
  };

  const currentAudience = audiences[activeTab];
  const Icon = currentAudience.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TruckFlow AI</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revolutionary Logistics Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/platform">
                <Button variant="outline">Member Login</Button>
              </Link>
              <Link href="/demo">
                <Button>Watch Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Currently Generating $60,000+ Monthly Revenue
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            AI-Powered Logistics Platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Revolutionary platform serving dispatchers, truckers, and logistics companies with autonomous operations,
            AI optimization, and real-time revenue generation.
          </p>
          
          {/* Live Revenue Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${revenueMetics.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {revenueMetics.activeUsers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {revenueMetics.loadProcessed.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loads Processed</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${revenueMetics.avgSavings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Savings</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center space-x-4">
            <Link href="/platform">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/investor-overview">
              <Button size="lg" variant="outline">
                Investor Overview
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Audience Tabs */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Every Role in Logistics
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Specialized features for dispatchers, truckers, and logistics companies
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {Object.entries(audiences).map(([key, audience]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === key
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {audience.title}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                  <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentAudience.title}
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    {currentAudience.benefits}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {currentAudience.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentAudience.pricing}
                </div>
                <Link href="/platform">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
              <div className="text-center">
                <Play className="h-16 w-16 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                <h5 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Live Platform Demo
                </h5>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  See {currentAudience.title.toLowerCase()} features in action
                </p>
                <Link href="/demo">
                  <Button variant="outline" className="w-full">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Opportunity */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Investment Opportunity
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Autonomous Revenue Generation
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Platform operates 24/7 with autonomous sales agents, ghost load capture, and 
              multi-modal logistics optimization. Currently generating $60,000+ monthly with 
              projections to $180,000+ within 6 months.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/investor-overview">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  View Investment Package
                </Button>
              </Link>
              <Link href="/acquisition-overview">
                <Button size="lg" variant="outline">
                  Acquisition Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">TruckFlow AI</span>
              </div>
              <p className="text-gray-400">
                Revolutionary AI-powered logistics platform transforming freight operations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/platform" className="hover:text-white">Member Portal</Link></li>
                <li><Link href="/demo" className="hover:text-white">Live Demo</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Business</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/investor-overview" className="hover:text-white">Investors</Link></li>
                <li><Link href="/acquisition-overview" className="hover:text-white">Acquisition</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Business: business@truckflow.ai</li>
                <li>Support: support@truckflow.ai</li>
                <li>Investors: investors@truckflow.ai</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TruckFlow AI. Revolutionary logistics platform generating autonomous revenue.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}