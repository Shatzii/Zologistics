import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveStats, LiveBadges } from '@/components/live-stats';
import { 
  Truck, 
  Bot, 
  Globe, 
  Shield, 
  DollarSign, 
  Zap, 
  Users, 
  ChartLine,
  MapPin,
  Clock,
  Phone,
  Mail,
  Star,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zologistics</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">AI-Powered Global Logistics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/demo">
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Live Demo
                </Button>
              </Link>
              <Link href="/admin-login">
                <Button size="sm">Admin Access</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <LiveBadges />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              The World's Most Advanced
              <span className="text-blue-600"> AI-Powered Logistics Platform</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Revolutionize your freight operations with autonomous dispatch, ghost load optimization, 
              and global multi-modal logistics. Powered by cutting-edge AI and generating immediate revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Play className="w-5 h-5 mr-2" />
                  Experience Live Demo
                </Button>
              </Link>
              <Link href="/investor-overview">
                <Button size="lg" variant="outline">
                  <ChartLine className="w-5 h-5 mr-2" />
                  View Revenue Model
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Status */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Live System Performance
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time operations and metrics updating every few seconds
            </p>
          </div>
          <LiveStats />
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Revolutionary Platform Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to dominate the logistics industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Dispatch */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>AI-Powered Dispatch</CardTitle>
                <CardDescription>
                  Autonomous load matching and route optimization with 85% average match scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Real-time load matching</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Predictive route optimization</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Automated customer acquisition</li>
                </ul>
                <Link href="/dashboard">
                  <Button className="w-full mt-4" variant="outline">
                    Explore AI Dispatch <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Ghost Load Engine */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Ghost Load Engine</CardTitle>
                <CardDescription>
                  Capture the $1.2B+ ghost load market with advanced optimization algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />800+ daily ghost loads detected</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />25% deadhead mile reduction</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Real-time market scanning</li>
                </ul>
                <Link href="/ghost-loads">
                  <Button className="w-full mt-4" variant="outline">
                    View Ghost Loads <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Multi-Modal Logistics */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Multi-Modal Logistics</CardTitle>
                <CardDescription>
                  Trucking, sea freight, and air freight unified in one platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />$29.85B total market access</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Global load board integration</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Cross-modal optimization</li>
                </ul>
                <Link href="/multi-modal-logistics">
                  <Button className="w-full mt-4" variant="outline">
                    Explore Multi-Modal <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Advanced Security */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Two-factor authentication and enterprise-grade protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />SMS/Email/TOTP 2FA</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Session management</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Rate limiting & DDoS protection</li>
                </ul>
                <Link href="/admin-login">
                  <Button className="w-full mt-4" variant="outline">
                    Secure Admin Access <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Revenue Optimization */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle>Revenue Optimization</CardTitle>
                <CardDescription>
                  Autonomous contract generation and dynamic pricing engine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Auto-signed agreements</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Market rate optimization</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Instant payment processing</li>
                </ul>
                <Link href="/payments">
                  <Button className="w-full mt-4" variant="outline">
                    View Revenue Model <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Driver Network */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Driver Network</CardTitle>
                <CardDescription>
                  Cross-company collaboration and comprehensive driver solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Wellness monitoring</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Personalized load matching</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Collaborative partnerships</li>
                </ul>
                <Link href="/drivers">
                  <Button className="w-full mt-4" variant="outline">
                    Driver Solutions <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* Feature Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Platform Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Explore all the powerful tools at your disposal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Real-Time Analytics", icon: ChartLine, href: "/analytics", desc: "Advanced performance tracking and insights" },
              { title: "Live GPS Tracking", icon: MapPin, href: "/live-tracking-dashboard", desc: "Real-time fleet and load monitoring" },
              { title: "Voice Assistant", icon: Bot, href: "/voice-assistant", desc: "Hands-free operations with AI voice control" },
              { title: "Mobile Driver App", icon: Phone, href: "/mobile-driver-app", desc: "Complete mobile solution for drivers" },
              { title: "Customer Portal", icon: Users, href: "/customer-portal", desc: "Self-service tracking and communication" },
              { title: "Compliance Suite", icon: Shield, href: "/compliance-monitoring-dashboard", desc: "Automated regulatory compliance" },
              { title: "Load Board Integration", icon: Globe, href: "/load-board-management", desc: "15+ major load board connections" },
              { title: "Payment Processing", icon: DollarSign, href: "/payment-processing-dashboard", desc: "Instant payments and factoring" },
              { title: "Wellness Monitoring", icon: Users, href: "/wellness", desc: "Driver health and safety tracking" }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                    </div>
                  </div>
                  <Link href={feature.href}>
                    <Button className="w-full mt-4" variant="outline" size="sm">
                      Explore <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Logistics Operations?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the revolution in AI-powered logistics. Start generating immediate revenue 
            with our fully operational platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Play className="w-5 h-5 mr-2" />
                Start Free Demo
              </Button>
            </Link>
            <Link href="/investor-overview">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <ChartLine className="w-5 h-5 mr-2" />
                View Business Model
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Zologistics</span>
              </div>
              <p className="text-gray-400">
                The world's most advanced AI-powered logistics platform
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/loads" className="hover:text-white">Load Management</Link></li>
                <li><Link href="/drivers" className="hover:text-white">Driver Network</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/ghost-loads" className="hover:text-white">Ghost Load Engine</Link></li>
                <li><Link href="/multi-modal-logistics" className="hover:text-white">Multi-Modal Logistics</Link></li>
                <li><Link href="/voice-assistant" className="hover:text-white">Voice Assistant</Link></li>
                <li><Link href="/mobile-driver-app" className="hover:text-white">Mobile App</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Business</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/investor-overview" className="hover:text-white">Investor Overview</Link></li>
                <li><Link href="/acquisition-overview" className="hover:text-white">Acquisition</Link></li>
                <li><Link href="/demo" className="hover:text-white">Live Demo</Link></li>
                <li><Link href="/admin-login" className="hover:text-white">Admin Access</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Zologistics. All rights reserved. | Advanced AI-Powered Global Logistics Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}