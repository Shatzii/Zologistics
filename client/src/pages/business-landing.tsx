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
import logoPath from "@assets/ChatGPT Image Jul 10, 2025, 07_30_44 AM_1752499822142.png";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card dark:bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img 
                src={logoPath} 
                alt="Zologistics Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Zologistics</h1>
                <p className="text-sm text-muted-foreground">Global AI-Powered Logistics Company</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/demo">
                <Button variant="outline">View Demo</Button>
              </Link>
              <Link href="/admin-login">
                <Button variant="outline">Admin Login</Button>
              </Link>
              <Link href="/platform">
                <Button>
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20">
            Currently Generating $60,000+ Monthly Revenue
          </Badge>
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Global AI-Powered Logistics Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Revolutionary platform serving dispatchers, truckers, and logistics companies with autonomous operations,
            AI optimization, and real-time revenue generation worldwide.
          </p>
          
          {/* Live Revenue Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-foreground">
                  ${revenueMetics.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-foreground">
                  {revenueMetics.activeUsers.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-6 text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold text-foreground">
                  {revenueMetics.loadProcessed.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Loads Processed</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-foreground">
                  ${revenueMetics.avgSavings.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Avg Monthly Savings</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center space-x-4">
            <Link href="/platform">
              <Button size="lg">
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
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Built for Every Role in Global Logistics
            </h3>
            <p className="text-lg text-muted-foreground">
              Specialized features for dispatchers, truckers, and logistics companies worldwide
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted rounded-lg p-1">
              {Object.entries(audiences).map(([key, audience]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === key
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
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
                <div className="bg-primary/10 p-3 rounded-lg mr-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">
                    {currentAudience.title}
                  </h4>
                  <p className="text-primary font-medium">
                    {currentAudience.benefits}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {currentAudience.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-foreground">
                  {currentAudience.pricing}
                </div>
                <Link href="/platform">
                  <Button>
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-8">
              <div className="text-center">
                <Play className="h-16 w-16 mx-auto text-primary mb-4" />
                <h5 className="text-xl font-semibold text-foreground mb-2">
                  Live Platform Demo
                </h5>
                <p className="text-muted-foreground mb-6">
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
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-4 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20">
              Global Investment Opportunity
            </Badge>
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Autonomous Revenue Generation Worldwide
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Zologistics operates 24/7 with autonomous sales agents, ghost load capture, and 
              multi-modal logistics optimization across global markets. Currently generating $60,000+ monthly with 
              projections to $180,000+ within 6 months.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/investor-overview">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
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
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={logoPath} 
                  alt="Zologistics Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold text-foreground">Zologistics</span>
              </div>
              <p className="text-muted-foreground">
                Global AI-powered logistics platform transforming freight operations worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/platform" className="hover:text-foreground">Member Portal</Link></li>
                <li><Link href="/demo" className="hover:text-foreground">Live Demo</Link></li>
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Business</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/investor-overview" className="hover:text-foreground">Investors</Link></li>
                <li><Link href="/acquisition-overview" className="hover:text-foreground">Acquisition</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Business: business@zologistics.ai</li>
                <li>Support: support@zologistics.ai</li>
                <li>Investors: investors@zologistics.ai</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Zologistics. Global AI-powered logistics platform generating autonomous revenue worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}