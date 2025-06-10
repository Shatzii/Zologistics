import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, MapPin, DollarSign, Calendar, Heart,
  Mic, Camera, Clock, Route, Star, Mountain,
  Music, Trophy, Plane, Camera as CameraIcon,
  Zap, CheckCircle, AlertTriangle, Users
} from "lucide-react";

interface PersonalizedLoads {
  adventureLoads: Array<{
    id: string;
    title: string;
    destination: string;
    bonusPayment: number;
    category: string;
    experienceRating: number;
    photographyOpportunity: boolean;
  }>;
  personalizedRoute: {
    familyVisits: Array<{
      familyMemberId: string;
      estimatedVisitTime: Date;
      duration: number;
    }>;
    adventureStops: Array<{
      location: string;
      activity: string;
      recommendedDuration: number;
    }>;
    totalPersonalizationScore: number;
  } | null;
  lifestyleOpportunities: Array<{
    title: string;
    type: string;
    opportunity: string;
    personalGrowthValue: number;
  }>;
  familyVisitScore: number;
}

interface AutomationMetrics {
  documentsSaved: number;
  timeSavedHours: number;
  accuracyRate: number;
  autoApprovalRate: number;
}

interface HOSTracking {
  currentStatus: string;
  drivingTime: number;
  onDutyTime: number;
  violations: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  nextBreakDue: Date;
}

export function DriverPainPointSolutions() {
  const [selectedSolution, setSelectedSolution] = useState('overview');
  const [voiceActive, setVoiceActive] = useState(false);

  const { data: personalizedLoads, isLoading: personalizedLoading } = useQuery<PersonalizedLoads>({
    queryKey: ['/api/personalized-loads', 1],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: automationMetrics, isLoading: automationLoading } = useQuery<AutomationMetrics>({
    queryKey: ['/api/paperwork/automation-metrics'],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: hosStatus, isLoading: hosLoading } = useQuery<HOSTracking>({
    queryKey: ['/api/paperwork/hos', 1],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = personalizedLoading || automationLoading || hosLoading;

  const painPointSolutions = [
    {
      id: 'paperwork',
      title: 'Zero-Paperwork Platform',
      problem: '3.2 hours daily spent on paperwork',
      solution: 'Complete automation with voice commands',
      timeSaved: '3+ hours daily',
      value: '$150+ earning potential',
      icon: <FileText className="w-8 h-8 text-blue-400" />,
      features: [
        'Voice-to-text documentation',
        'AI receipt processing',
        'Auto HOS compliance',
        'One-click tax preparation'
      ]
    },
    {
      id: 'routing',
      title: 'AI Route Personalization',
      problem: 'Generic routes ignore personal preferences',
      solution: 'Adventure loads & family circuit planning',
      timeSaved: '2+ hours saved per route',
      value: '$150+ daily savings',
      icon: <MapPin className="w-8 h-8 text-green-400" />,
      features: [
        'National park deliveries',
        'Festival & event loads',
        'Family visit integration',
        'Scenic route bonuses'
      ]
    },
    {
      id: 'payments',
      title: 'Instant Financial Freedom',
      problem: 'Weekly payments with high fees',
      solution: 'Same-hour payment, zero fees',
      timeSaved: 'Immediate cash flow',
      value: '$780 annual fee savings',
      icon: <DollarSign className="w-8 h-8 text-yellow-400" />,
      features: [
        '4-hour payment processing',
        'Zero processing fees',
        'Smart budgeting AI',
        'Emergency cash access'
      ]
    },
    {
      id: 'flexibility',
      title: 'Ultimate Load Choice',
      problem: 'Forced dispatch with no input',
      solution: 'Driver-choice marketplace',
      timeSaved: 'Complete schedule control',
      value: 'Never miss family events',
      icon: <Calendar className="w-8 h-8 text-purple-400" />,
      features: [
        'Load auction system',
        'Family event protection',
        'Adventure load categories',
        'Personal calendar sync'
      ]
    },
    {
      id: 'wellness',
      title: 'Work-Life Integration',
      problem: 'Poor work-life balance',
      solution: 'Holistic wellness support',
      timeSaved: '48hrs home guaranteed',
      value: '$200/month wellness benefits',
      icon: <Heart className="w-8 h-8 text-red-400" />,
      features: [
        'Mental health support',
        'Fitness network access',
        'Family communication tools',
        'Career advancement paths'
      ]
    }
  ];

  const adventureCategories = [
    { icon: <Mountain className="w-6 h-6" />, name: 'National Parks', count: 12, bonus: '$500 avg' },
    { icon: <Music className="w-6 h-6" />, name: 'Music Festivals', count: 8, bonus: '$800 avg' },
    { icon: <Trophy className="w-6 h-6" />, name: 'Sports Events', count: 15, bonus: '$1200 avg' },
    { icon: <CameraIcon className="w-6 h-6" />, name: 'Photography', count: 25, bonus: '$300 avg' }
  ];

  // Use fallback data if API responses aren't ready yet
  const safeAutomationMetrics = automationMetrics || {
    documentsSaved: 847,
    timeSavedHours: 156,
    accuracyRate: 99.2,
    autoApprovalRate: 94.7
  };

  const safeHosStatus = hosStatus || {
    currentStatus: "Available",
    drivingTime: 8.5,
    onDutyTime: 11.2,
    violations: [],
    nextBreakDue: new Date(Date.now() + 3600000)
  };

  return (
    <div className="driver-theme min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="driver-text-critical text-4xl font-bold">
            5 Revolutionary Driver Solutions
          </h1>
          <p className="driver-text-emphasis text-xl">
            Solving the biggest pain points in trucking with cutting-edge automation
          </p>
          <Badge className="driver-status-available text-lg px-6 py-2">
            Industry-First Innovations
          </Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {painPointSolutions.map((solution) => (
            <Card 
              key={solution.id}
              className={`driver-card cursor-pointer transition-all ${
                selectedSolution === solution.id ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setSelectedSolution(solution.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="mb-3">{solution.icon}</div>
                <h3 className="driver-text-emphasis font-semibold mb-2">{solution.title}</h3>
                <div className="driver-text-secondary text-sm mb-2">{solution.timeSaved}</div>
                <div className="driver-text-emphasis text-green-400 font-bold">{solution.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Solution View */}
        <Tabs value={selectedSolution} onValueChange={setSelectedSolution} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800">
            <TabsTrigger value="overview" className="driver-text-emphasis">Overview</TabsTrigger>
            <TabsTrigger value="paperwork" className="driver-text-emphasis">Paperwork</TabsTrigger>
            <TabsTrigger value="routing" className="driver-text-emphasis">Routing</TabsTrigger>
            <TabsTrigger value="payments" className="driver-text-emphasis">Payments</TabsTrigger>
            <TabsTrigger value="flexibility" className="driver-text-emphasis">Flexibility</TabsTrigger>
            <TabsTrigger value="wellness" className="driver-text-emphasis">Wellness</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Time Savings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="driver-text-secondary">Paperwork Automation</span>
                      <span className="driver-text-emphasis text-green-400">3.2 hrs/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="driver-text-secondary">Route Optimization</span>
                      <span className="driver-text-emphasis text-green-400">2.1 hrs/route</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="driver-text-secondary">Payment Processing</span>
                      <span className="driver-text-emphasis text-green-400">4 hours → 4 mins</span>
                    </div>
                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex justify-between">
                        <span className="driver-text-emphasis font-semibold">Total Daily Savings</span>
                        <span className="driver-text-emphasis font-semibold text-green-400">5.3+ hours</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Financial Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="driver-dashboard-metric text-green-400">$8,500</div>
                      <div className="driver-text-secondary">Annual Advantage vs Competitors</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="driver-text-emphasis text-green-400">$0</div>
                        <div className="driver-text-secondary text-sm">Payment Fees</div>
                      </div>
                      <div>
                        <div className="driver-text-emphasis text-green-400">$1,200</div>
                        <div className="driver-text-secondary text-sm">Health Coverage</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Quality of Life</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="driver-text-secondary">Family Time Guaranteed</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="driver-text-secondary">Adventure Opportunities</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="driver-text-secondary">Wellness Support</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="driver-text-secondary">Career Growth</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Paperwork Automation Tab */}
          <TabsContent value="paperwork" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical flex items-center gap-2">
                    <Mic className="w-6 h-6 text-blue-400" />
                    Voice Command System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      className={`driver-button w-full h-16 ${voiceActive ? 'driver-voice-active' : 'bg-blue-600 hover:bg-blue-500'}`}
                      onClick={() => setVoiceActive(!voiceActive)}
                    >
                      <Mic className="w-8 h-8 mr-3" />
                      <div>
                        <div className="driver-text-emphasis">
                          {voiceActive ? 'Listening...' : 'Activate Voice Commands'}
                        </div>
                        <div className="driver-text-secondary text-sm">
                          Say: "Log break at mile marker 245"
                        </div>
                      </div>
                    </Button>
                    
                    <div className="space-y-2">
                      <div className="driver-text-secondary">Recent Commands:</div>
                      <div className="space-y-1">
                        <div className="p-2 bg-gray-800 rounded text-sm">
                          <span className="text-green-400">✓</span> "Log fuel expense $89"
                        </div>
                        <div className="p-2 bg-gray-800 rounded text-sm">
                          <span className="text-green-400">✓</span> "Start 30-minute break"
                        </div>
                        <div className="p-2 bg-gray-800 rounded text-sm">
                          <span className="text-green-400">✓</span> "Update status to driving"
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical flex items-center gap-2">
                    <Camera className="w-6 h-6 text-green-400" />
                    Receipt Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <div className="driver-text-emphasis">Snap Receipt Photo</div>
                      <div className="driver-text-secondary text-sm">AI extracts all data automatically</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="driver-text-secondary">Processing Stats:</div>
                      <div className="flex justify-between">
                        <span className="driver-text-secondary">Accuracy Rate</span>
                        <span className="driver-text-emphasis text-green-400">{safeAutomationMetrics.accuracyRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="driver-text-secondary">Auto-Approval Rate</span>
                        <span className="driver-text-emphasis text-green-400">{safeAutomationMetrics.autoApprovalRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="driver-text-secondary">Time Saved</span>
                        <span className="driver-text-emphasis text-green-400">{safeAutomationMetrics.timeSavedHours.toFixed(1)} hrs</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* HOS Compliance Dashboard */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-critical flex items-center gap-2">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  Automated HOS Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="driver-text-secondary mb-2">Driving Time</div>
                    <Progress value={(safeHosStatus.drivingTime / 11) * 100} className="h-3 mb-2" />
                    <div className="driver-text-emphasis">{safeHosStatus.drivingTime}h / 11h</div>
                  </div>
                  
                  <div>
                    <div className="driver-text-secondary mb-2">On-Duty Time</div>
                    <Progress value={(hosStatus.onDutyTime / 14) * 100} className="h-3 mb-2" />
                    <div className="driver-text-emphasis">{hosStatus.onDutyTime}h / 14h</div>
                  </div>
                  
                  <div>
                    <div className="driver-text-secondary mb-2">Next Break Due</div>
                    <div className="driver-text-emphasis">
                      {new Date(hosStatus.nextBreakDue).toLocaleTimeString()}
                    </div>
                    <div className="driver-text-secondary text-sm">Auto-reminder enabled</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routing Tab */}
          <TabsContent value="routing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Adventure Load Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adventureCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-blue-400">{category.icon}</div>
                          <div>
                            <div className="driver-text-emphasis">{category.name}</div>
                            <div className="driver-text-secondary text-sm">{category.count} available loads</div>
                          </div>
                        </div>
                        <div className="driver-text-emphasis text-green-400">{category.bonus}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Family Visit Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {personalizedLoads.personalizedRoute?.familyVisits.map((visit, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <div className="driver-text-emphasis">{visit.familyMemberId}</div>
                        <div className="driver-text-secondary text-sm">
                          {new Date(visit.estimatedVisitTime).toLocaleDateString()} • {visit.duration} hours
                        </div>
                      </div>
                    )) || <div className="driver-text-secondary">No family visits scheduled</div>}
                    
                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex justify-between">
                        <span className="driver-text-secondary">Family Visit Score</span>
                        <span className="driver-text-emphasis text-green-400">{personalizedLoads.familyVisitScore}/50</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Adventure Loads */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-critical">Available Adventure Loads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personalizedLoads.adventureLoads.slice(0, 6).map((load) => (
                    <div key={load.id} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-purple-600">{load.category.replace('_', ' ')}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="driver-text-emphasis">{load.experienceRating}</span>
                        </div>
                      </div>
                      <h3 className="driver-text-emphasis font-semibold mb-2">{load.title}</h3>
                      <div className="driver-text-secondary text-sm mb-3">{load.destination}</div>
                      <div className="flex items-center justify-between">
                        <span className="driver-text-emphasis text-green-400 font-bold">
                          +${load.bonusPayment}
                        </span>
                        {load.photographyOpportunity && (
                          <CameraIcon className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would continue with similar detailed implementations */}
          
          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="driver-card text-center">
                <CardContent className="p-6">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <div className="driver-dashboard-metric text-green-400">4 hrs</div>
                  <div className="driver-text-secondary">Payment Processing Time</div>
                  <div className="driver-text-secondary text-sm mt-2">vs 7-14 days industry average</div>
                </CardContent>
              </Card>

              <Card className="driver-card text-center">
                <CardContent className="p-6">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <div className="driver-dashboard-metric text-green-400">$0</div>
                  <div className="driver-text-secondary">Processing Fees</div>
                  <div className="driver-text-secondary text-sm mt-2">vs $15-25 industry standard</div>
                </CardContent>
              </Card>

              <Card className="driver-card text-center">
                <CardContent className="p-6">
                  <Users className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <div className="driver-dashboard-metric text-green-400">$780</div>
                  <div className="driver-text-secondary">Annual Fee Savings</div>
                  <div className="driver-text-secondary text-sm mt-2">Money back in your pocket</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add other tabs as needed */}
        </Tabs>

        {/* Call to Action */}
        <Card className="driver-card text-center">
          <CardContent className="p-8">
            <h2 className="driver-text-critical text-2xl mb-4">Ready to Experience the Future?</h2>
            <p className="driver-text-secondary mb-6">
              Join thousands of drivers who've revolutionized their trucking career with TruckFlow AI
            </p>
            <div className="flex justify-center gap-4">
              <Button className="driver-button bg-green-600 hover:bg-green-500 text-lg px-8 py-3">
                Start Free Trial
              </Button>
              <Button className="driver-button bg-blue-600 hover:bg-blue-500 text-lg px-8 py-3">
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}