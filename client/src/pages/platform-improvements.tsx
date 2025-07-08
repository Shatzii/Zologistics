import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Smartphone, 
  Users, 
  Brain, 
  CreditCard, 
  Route, 
  Mic, 
  Wrench, 
  Shield, 
  BarChart3, 
  Globe,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  Star
} from "lucide-react";

interface Improvement {
  id: number;
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  timeframe: string;
  revenueIncrease: string;
  status: "Not Started" | "In Progress" | "Completed";
  priority: number;
  icon: any;
  details: string[];
  benefits: string[];
}

export default function PlatformImprovements() {
  const [selectedImprovement, setSelectedImprovement] = useState<Improvement | null>(null);

  const improvements: Improvement[] = [
    {
      id: 1,
      title: "One-Click Driver Mobile App",
      description: "Streamlined mobile app with one-tap load acceptance, instant photo uploads for documents, and voice-activated status updates.",
      impact: "High",
      effort: "Medium",
      timeframe: "2-3 weeks",
      revenueIncrease: "$25,000/month",
      status: "Completed",
      priority: 1,
      icon: Smartphone,
      details: [
        "One-tap load acceptance with instant confirmation",
        "Voice-activated status updates for hands-free operation",
        "Instant photo capture for BOL and delivery documents",
        "Offline functionality for areas with poor connectivity",
        "GPS-integrated route optimization with fuel stops"
      ],
      benefits: [
        "Reduces driver training time from hours to minutes",
        "Increases load acceptance rate by 40%",
        "Improves driver satisfaction and retention",
        "Reduces documentation errors by 80%",
        "Enhances safety with hands-free operation"
      ]
    },
    {
      id: 2,
      title: "Real-Time Customer Portal",
      description: "Self-service portal where shippers can track loads in real-time, receive automated ETA updates, and access delivery confirmations instantly.",
      impact: "High",
      effort: "Medium",
      timeframe: "3-4 weeks",
      revenueIncrease: "$35,000/month",
      status: "Completed",
      priority: 2,
      icon: Users,
      details: [
        "Live GPS tracking with real-time location updates",
        "Automated ETA notifications via email and SMS",
        "Instant access to delivery confirmations and PODs",
        "Self-service load booking and management",
        "Customizable alerts and notification preferences"
      ],
      benefits: [
        "Reduces customer service calls by 70%",
        "Increases customer satisfaction scores by 45%",
        "Enables premium pricing for transparency",
        "Reduces dispute resolution time by 60%",
        "Improves customer retention by 35%"
      ]
    },
    {
      id: 3,
      title: "Advanced Load Matching AI",
      description: "Machine learning that analyzes driver preferences, historical performance, and route efficiency to suggest loads with 95%+ match accuracy.",
      impact: "High",
      effort: "High",
      timeframe: "4-6 weeks",
      revenueIncrease: "$40,000/month",
      status: "Not Started",
      priority: 3,
      icon: Brain,
      details: [
        "Analyzes 50+ data points for optimal load matching",
        "Learns from driver preferences and behavior patterns",
        "Considers equipment type, route history, and profitability",
        "Integrates weather, traffic, and market conditions",
        "Provides confidence scores for each recommendation"
      ],
      benefits: [
        "Increases driver profitability by 30%",
        "Reduces deadhead miles by 25%",
        "Improves load acceptance rate to 85%",
        "Optimizes driver utilization and satisfaction",
        "Enables predictive load planning"
      ]
    },
    {
      id: 4,
      title: "Integrated Payment Processing",
      description: "Instant payment processing with factoring integration, fuel card management, and automated driver settlements.",
      impact: "High",
      effort: "Medium",
      timeframe: "3-4 weeks",
      revenueIncrease: "$30,000/month",
      status: "Completed",
      priority: 4,
      icon: CreditCard,
      details: [
        "Same-day payment processing with multiple factoring partners",
        "Automated fuel card programs with expense tracking",
        "Driver settlement automation with detailed breakdowns",
        "Integration with QuickBooks and major accounting systems",
        "Real-time payment status tracking and notifications"
      ],
      benefits: [
        "Reduces payment delays from days to hours",
        "Increases driver cash flow and satisfaction",
        "Reduces administrative overhead by 50%",
        "Enables competitive advantage through fast payments",
        "Improves driver retention by 40%"
      ]
    },
    {
      id: 5,
      title: "Smart Route Optimization Dashboard",
      description: "Dynamic routing that adjusts for traffic, weather, fuel prices, and HOS compliance in real-time.",
      impact: "High",
      effort: "Medium",
      timeframe: "3-4 weeks",
      revenueIncrease: "$28,000/month",
      status: "Completed",
      priority: 5,
      icon: Route,
      details: [
        "Real-time traffic and weather integration",
        "HOS compliance monitoring and optimization",
        "Fuel price optimization and stop recommendations",
        "Multi-stop route planning and optimization",
        "Emergency re-routing capabilities"
      ],
      benefits: [
        "Reduces fuel costs by 15-20%",
        "Decreases delivery times by 25%",
        "Improves on-time delivery rate to 98%",
        "Reduces HOS violations by 90%",
        "Increases revenue per mile by 18%"
      ]
    },
    {
      id: 6,
      title: "Voice-Activated Command Center",
      description: "Voice commands for dispatchers and drivers to update loads, send messages, and check status hands-free.",
      impact: "Medium",
      effort: "Medium",
      timeframe: "2-3 weeks",
      revenueIncrease: "$15,000/month",
      status: "Not Started",
      priority: 6,
      icon: Mic,
      details: [
        "Natural language processing for voice commands",
        "Hands-free load updates and status changes",
        "Voice-to-text messaging between drivers and dispatch",
        "Audio alerts and notifications",
        "Integration with existing dashboard and mobile app"
      ],
      benefits: [
        "Improves safety with hands-free operation",
        "Increases productivity by 40%",
        "Reduces data entry errors by 75%",
        "Enhances driver experience and satisfaction",
        "Enables compliance with hands-free regulations"
      ]
    },
    {
      id: 7,
      title: "Predictive Maintenance Integration",
      description: "Connect with vehicle diagnostics to predict maintenance needs, schedule services automatically, and prevent breakdowns.",
      impact: "Medium",
      effort: "High",
      timeframe: "4-5 weeks",
      revenueIncrease: "$22,000/month",
      status: "Completed",
      priority: 7,
      icon: Wrench,
      details: [
        "Integration with major ELD and telematics providers",
        "Predictive analytics for maintenance scheduling",
        "Automated service appointment booking",
        "Cost tracking and maintenance history management",
        "Emergency breakdown assistance coordination"
      ],
      benefits: [
        "Reduces vehicle downtime by 35%",
        "Prevents costly emergency repairs",
        "Optimizes maintenance costs by 25%",
        "Improves fleet reliability and safety",
        "Extends vehicle lifespan and resale value"
      ]
    },
    {
      id: 8,
      title: "Automated Compliance Monitoring",
      description: "Automated FMCSA compliance monitoring that tracks HOS, drug testing, inspections, and certifications.",
      impact: "High",
      effort: "Medium",
      timeframe: "3-4 weeks",
      revenueIncrease: "$20,000/month",
      status: "Completed",
      priority: 8,
      icon: Shield,
      details: [
        "Automated HOS monitoring and violation prevention",
        "Drug testing schedule management and tracking",
        "Vehicle inspection reminders and documentation",
        "Driver certification and license renewal alerts",
        "FMCSA reporting automation and submission"
      ],
      benefits: [
        "Eliminates compliance violations and fines",
        "Reduces compliance administrative time by 80%",
        "Improves safety scores and insurance rates",
        "Prevents license suspensions and shutdowns",
        "Enables better customer confidence and rates"
      ]
    },
    {
      id: 9,
      title: "Enhanced Analytics Dashboard",
      description: "Comprehensive analytics showing profitability by lane, driver performance metrics, customer analysis, and market trends.",
      impact: "Medium",
      effort: "Medium",
      timeframe: "2-3 weeks",
      revenueIncrease: "$18,000/month",
      status: "Completed",
      priority: 9,
      icon: BarChart3,
      details: [
        "Profitability analysis by lane, customer, and driver",
        "Predictive analytics for market trends and pricing",
        "Driver performance scorecards and improvement plans",
        "Customer profitability and retention analysis",
        "Operational efficiency metrics and benchmarking"
      ],
      benefits: [
        "Identifies most profitable opportunities",
        "Optimizes pricing strategies and negotiations",
        "Improves driver performance through data insights",
        "Enables data-driven business decisions",
        "Increases overall profitability by 25%"
      ]
    },
    {
      id: 10,
      title: "Multi-Language Support",
      description: "Spanish, Portuguese, and other languages for international expansion, with region-specific compliance workflows.",
      impact: "Medium",
      effort: "Low",
      timeframe: "2-3 weeks",
      revenueIncrease: "$45,000/month",
      status: "Completed",
      priority: 10,
      icon: Globe,
      details: [
        "Full Spanish and Portuguese translation",
        "Region-specific compliance workflows",
        "Local payment methods and currency support",
        "Culturally adapted user interfaces",
        "Multilingual customer support integration"
      ],
      benefits: [
        "Opens access to international markets",
        "Increases addressable market by 300%",
        "Enables expansion into Central America and Europe",
        "Improves driver diversity and retention",
        "Creates competitive advantage in global markets"
      ]
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Not Started": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenueIncrease = improvements.reduce((total, improvement) => {
    const amount = parseInt(improvement.revenueIncrease.replace(/[^0-9]/g, ''));
    return total + amount;
  }, 0);

  const completedCount = improvements.filter(i => i.status === "Completed").length;
  const inProgressCount = improvements.filter(i => i.status === "In Progress").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Improvements Roadmap</h1>
            <p className="text-gray-600 mt-1">10 strategic improvements to transform your logistics platform</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">${totalRevenueIncrease.toLocaleString()}/month</div>
            <p className="text-sm text-gray-600">Total Revenue Potential</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Improvements</p>
                <p className="text-2xl font-bold">{improvements.length}</p>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Boost</p>
                <p className="text-2xl font-bold text-green-600">+250%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Implementation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Overall Progress</span>
              <span className="text-sm text-gray-600">
                {completedCount + inProgressCount} of {improvements.length} started
              </span>
            </div>
            <Progress value={(completedCount + inProgressCount) / improvements.length * 100} className="w-full" />
            <p className="text-sm text-gray-600">
              {Math.round((completedCount + inProgressCount) / improvements.length * 100)}% of improvements initiated
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Improvements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {improvements.map((improvement) => {
          const IconComponent = improvement.icon;
          return (
            <Card 
              key={improvement.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
              onClick={() => setSelectedImprovement(improvement)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">#{improvement.priority}</span>
                      <span>{improvement.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(improvement.status)}>
                        {improvement.status}
                      </Badge>
                      <Badge className={getImpactColor(improvement.impact)}>
                        {improvement.impact} Impact
                      </Badge>
                      <Badge className={getEffortColor(improvement.effort)}>
                        {improvement.effort} Effort
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{improvement.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Timeline</p>
                    <p className="font-medium">{improvement.timeframe}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenue Increase</p>
                    <p className="font-medium text-green-600">{improvement.revenueIncrease}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View Modal */}
      {selectedImprovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <selectedImprovement.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">#{selectedImprovement.priority} - {selectedImprovement.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(selectedImprovement.status)}>
                        {selectedImprovement.status}
                      </Badge>
                      <Badge className={getImpactColor(selectedImprovement.impact)}>
                        {selectedImprovement.impact} Impact
                      </Badge>
                      <Badge className={getEffortColor(selectedImprovement.effort)}>
                        {selectedImprovement.effort} Effort
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelectedImprovement(null)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Implementation Details</h3>
                  <div className="space-y-2">
                    {selectedImprovement.details.map((detail, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Project Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Timeline</p>
                        <p className="font-medium">{selectedImprovement.timeframe}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue Increase</p>
                        <p className="font-medium text-green-600">{selectedImprovement.revenueIncrease}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Business Benefits</h3>
                  <div className="space-y-2">
                    {selectedImprovement.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Alert className="mt-6">
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      This improvement is expected to generate <strong>{selectedImprovement.revenueIncrease}</strong> in additional monthly revenue while significantly enhancing operational efficiency and customer satisfaction.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}