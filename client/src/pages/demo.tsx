import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  Monitor,
  Smartphone,
  Truck,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import logoPath from "@assets/ChatGPT Image Jul 10, 2025, 07_30_44 AM_1752499822142.png";

export default function Demo() {
  const [activeDemo, setActiveDemo] = useState<'dispatchers' | 'truckers' | 'logistics'>('dispatchers');
  const [isPlaying, setIsPlaying] = useState(false);

  const demoContent = {
    dispatchers: {
      title: "Dispatch Operations Demo",
      description: "See how AI transforms traditional dispatch operations",
      features: [
        "AI-powered load matching with 85% accuracy",
        "Real-time rate optimization and negotiation",
        "Automated customer acquisition system",
        "Live GPS tracking and route optimization"
      ],
      videoUrl: "/demo-dispatchers.mp4",
      screenshots: [
        { title: "Load Board Integration", desc: "17+ load boards in one view" },
        { title: "AI Rate Optimization", desc: "Automatic market analysis" },
        { title: "Driver Management", desc: "Real-time fleet overview" }
      ]
    },
    truckers: {
      title: "Driver Experience Demo",
      description: "Mobile-first platform designed for drivers",
      features: [
        "Voice-activated load search and booking",
        "Smart load recommendations based on preferences",
        "Instant payment processing and factoring",
        "Driver wellness and performance analytics"
      ],
      videoUrl: "/demo-truckers.mp4",
      screenshots: [
        { title: "Mobile Load Search", desc: "Voice-activated commands" },
        { title: "Route Optimization", desc: "GPS-integrated navigation" },
        { title: "Earnings Dashboard", desc: "Real-time revenue tracking" }
      ]
    },
    logistics: {
      title: "Enterprise Logistics Demo",
      description: "Complete multi-modal transportation management",
      features: [
        "Multi-modal transport optimization (sea, air, truck)",
        "Autonomous broker agreements and smart contracts",
        "Global load board integration across 7 regions",
        "Enterprise-grade compliance and reporting"
      ],
      videoUrl: "/demo-logistics.mp4",
      screenshots: [
        { title: "Multi-Modal Dashboard", desc: "Sea, air, and truck integration" },
        { title: "Global Operations", desc: "7-region load board coverage" },
        { title: "Analytics Suite", desc: "Enterprise reporting tools" }
      ]
    }
  };

  const currentDemo = demoContent[activeDemo];

  const liveMetrics = {
    activeUsers: 847,
    monthlyRevenue: 60000,
    loadsProcessed: 12500,
    avgSavings: 2800
  };

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
                  Zologistics - Live Demo
                </h1>
                <p className="text-muted-foreground">
                  Experience the global AI-powered logistics platform in action
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
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

      {/* Live Metrics Banner */}
      <section className="py-8 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <Badge className="mb-2 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20">
              Live Platform Metrics
            </Badge>
            <p className="text-lg text-muted-foreground">
              Real-time data from our active global platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-foreground">
                  {liveMetrics.activeUsers}
                </div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${liveMetrics.monthlyRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-4 text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {liveMetrics.loadsProcessed.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Loads Processed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${liveMetrics.avgSavings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Savings</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Selection */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Demo Experience
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See how TruckFlow AI transforms each role in logistics
            </p>
          </div>

          {/* Demo Type Selection */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveDemo('dispatchers')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeDemo === 'dispatchers'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Dispatchers
              </button>
              <button
                onClick={() => setActiveDemo('truckers')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeDemo === 'truckers'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Truckers
              </button>
              <button
                onClick={() => setActiveDemo('logistics')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeDemo === 'logistics'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Logistics Companies
              </button>
            </div>
          </div>

          {/* Demo Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Video Player */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="h-6 w-6 mr-2 text-blue-600" />
                    {currentDemo.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                        <p className="text-lg font-medium">Interactive Demo Video</p>
                        <p className="text-sm opacity-75">Click to start demonstration</p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Volume2 className="h-4 w-4" />
                        <span className="text-sm">5:32</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <Smartphone className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {currentDemo.description}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Link href="/platform">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Try It Live
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline">
                      Full Screen
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features & Screenshots */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Features Demonstrated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentDemo.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-1 mr-3 mt-0.5">
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Screenshots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {currentDemo.screenshots.map((screenshot, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {screenshot.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {screenshot.desc}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Operations?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join 847 users already generating $60,000+ monthly revenue with autonomous logistics operations.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/platform">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/investor-overview">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Investment Details
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}