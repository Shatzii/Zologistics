import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Brain, 
  Heart, 
  Moon, 
  Activity, 
  Users, 
  Zap, 
  Shield, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Phone,
  Video,
  MessageCircle,
  HeadphonesIcon,
  PlayCircle
} from "lucide-react";

interface PersonalizedWellnessProfile {
  driverId: number;
  personalityType: 'analytical' | 'driver' | 'expressive' | 'amiable';
  stressThreshold: number;
  preferredCopingMechanisms: string[];
  mentalHealthHistory: {
    previousConditions: string[];
    medications: string[];
    triggers: string[];
    supportSystems: string[];
  };
  personalPreferences: {
    communicationStyle: 'direct' | 'supportive' | 'motivational';
    interventionTiming: 'proactive' | 'reactive' | 'scheduled';
    privacyLevel: 'open' | 'moderate' | 'private';
    preferredResources: string[];
  };
  wellnessGoals: any[];
  progressTracking: any;
}

interface MentalHealthResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'audio' | 'interactive_tool' | 'guided_meditation' | 'therapy_session' | 'support_group';
  category: 'stress_management' | 'anxiety_support' | 'depression_help' | 'sleep_hygiene' | 'mindfulness' | 'crisis_intervention';
  personalizedContent: {
    adaptedForPersonality: string;
    relevanceScore: number;
    culturallyAdapted: boolean;
    languageVersion: string;
  };
  accessMethod: 'self_paced' | 'scheduled' | 'on_demand' | 'live_session';
  estimatedTime: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  effectivenessRating: number;
}

interface WellnessAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  type: string;
  timestamp: Date;
  actionable: boolean;
  suggestedActions: string[];
}

export default function EnhancedWellnessDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const queryClient = useQueryClient();

  const { data: wellnessProfile } = useQuery<PersonalizedWellnessProfile>({
    queryKey: ['/api/enhanced-wellness/profile', 1],
  });

  const { data: personalizedResources } = useQuery<MentalHealthResource[]>({
    queryKey: ['/api/enhanced-wellness/personalized-resources', 1, selectedResourceType],
  });

  const { data: wellnessProgress } = useQuery({
    queryKey: ['/api/enhanced-wellness/progress', 1],
  });

  const { data: crisisSupport } = useQuery({
    queryKey: ['/api/enhanced-wellness/crisis-plan', 1],
  });

  const { data: wellnessAlerts } = useQuery<WellnessAlert[]>({
    queryKey: ['/api/enhanced-wellness/alerts', 1],
  });

  const { data: systemMetrics } = useQuery({
    queryKey: ['/api/enhanced-wellness/system-metrics'],
  });

  const conductAssessmentMutation = useMutation({
    mutationFn: async (assessmentType: string) => {
      const response = await fetch('/api/enhanced-wellness/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: 1, assessmentType })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-wellness'] });
    }
  });

  const accessResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await fetch('/api/enhanced-wellness/access-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: 1, resourceId })
      });
      return response.json();
    }
  });

  const getPersonalityTypeColor = (type: string) => {
    const colors = {
      analytical: 'bg-blue-100 text-blue-800',
      driver: 'bg-red-100 text-red-800',
      expressive: 'bg-yellow-100 text-yellow-800',
      amiable: 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getResourceIcon = (type: string) => {
    const icons = {
      article: BookOpen,
      video: Video,
      audio: HeadphonesIcon,
      interactive_tool: Activity,
      guided_meditation: Brain,
      therapy_session: MessageCircle,
      support_group: Users
    };
    const Icon = icons[type as keyof typeof icons] || PlayCircle;
    return <Icon className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'border-green-200 bg-green-50',
      medium: 'border-yellow-200 bg-yellow-50',
      high: 'border-orange-200 bg-orange-50',
      critical: 'border-red-200 bg-red-50'
    };
    return colors[severity as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  if (!wellnessProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading wellness profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Wellness & Mental Health</h1>
          <p className="text-gray-600">Personalized support for your mental wellbeing on the road</p>
        </div>
        <Badge className={getPersonalityTypeColor(wellnessProfile.personalityType)}>
          {wellnessProfile.personalityType.charAt(0).toUpperCase() + wellnessProfile.personalityType.slice(1)} Type
        </Badge>
      </div>

      {/* Critical Alerts */}
      {wellnessAlerts && wellnessAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wellness Alert</AlertTitle>
          <AlertDescription>
            {wellnessAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high')[0]?.message}
            <div className="mt-2">
              <Button size="sm" variant="outline" className="mr-2">
                <Phone className="h-4 w-4 mr-1" />
                Crisis Support
              </Button>
              <Button size="sm" variant="outline">
                View Resources
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="crisis">Crisis Support</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Stress Level</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.2/10</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={62} className="flex-1" />
                  <span className="text-sm text-gray-600">Moderate</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7.8/10</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={78} className="flex-1" />
                  <span className="text-sm text-green-600">Good</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wellness Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3/5</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={60} className="flex-1" />
                  <span className="text-sm text-blue-600">On Track</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Support Network</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5/10</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={85} className="flex-1" />
                  <span className="text-sm text-green-600">Strong</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personalized Recommendations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Today's Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Based on your {wellnessProfile.personalityType} personality type and current stress levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Immediate Actions</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• 5-minute breathing exercise before next load</li>
                    <li>• Listen to analytical stress management podcast</li>
                    <li>• Review performance data for confidence boost</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">This Week's Focus</h4>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Complete sleep optimization assessment</li>
                    <li>• Join virtual trucker support group session</li>
                    <li>• Practice progressive muscle relaxation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          {wellnessAlerts && wellnessAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Wellness Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wellnessAlerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      {alert.actionable && alert.suggestedActions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {alert.suggestedActions.slice(0, 2).map((action, idx) => (
                            <Button key={idx} size="sm" variant="outline">
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Personalized Mental Health Resources</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={selectedResourceType === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedResourceType('all')}
                >
                  All Resources
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedResourceType === 'stress_management' ? 'default' : 'outline'}
                  onClick={() => setSelectedResourceType('stress_management')}
                >
                  Stress Management
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedResourceType === 'mindfulness' ? 'default' : 'outline'}
                  onClick={() => setSelectedResourceType('mindfulness')}
                >
                  Mindfulness
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedResourceType === 'sleep_hygiene' ? 'default' : 'outline'}
                  onClick={() => setSelectedResourceType('sleep_hygiene')}
                >
                  Sleep Support
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalizedResources && personalizedResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <Badge variant="outline">{resource.type.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-yellow-600">★</span>
                        <span className="text-sm">{resource.effectivenessRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>
                      {resource.estimatedTime} • {resource.difficultyLevel}
                      <br />
                      Relevance: {resource.personalizedContent.relevanceScore}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={getPersonalityTypeColor(resource.personalizedContent.adaptedForPersonality)}>
                        Adapted for {resource.personalizedContent.adaptedForPersonality}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => accessResourceMutation.mutate(resource.id)}
                        disabled={accessResourceMutation.isPending}
                      >
                        Access Resource
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assessments">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mental Health Assessments</CardTitle>
                <CardDescription>
                  Regular assessments help us personalize your wellness journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Stress Level Assessment</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Evaluate your current stress levels and triggers
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last completed: 3 days ago</span>
                      <Button 
                        size="sm"
                        onClick={() => conductAssessmentMutation.mutate('stress_level')}
                        disabled={conductAssessmentMutation.isPending}
                      >
                        Take Assessment
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Sleep Quality Assessment</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Analyze your sleep patterns and quality
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last completed: 1 week ago</span>
                      <Button 
                        size="sm"
                        onClick={() => conductAssessmentMutation.mutate('sleep_quality')}
                        disabled={conductAssessmentMutation.isPending}
                      >
                        Take Assessment
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Anxiety & Depression Screening</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Comprehensive mental health screening
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last completed: 2 weeks ago</span>
                      <Button 
                        size="sm"
                        onClick={() => conductAssessmentMutation.mutate('mental_health')}
                        disabled={conductAssessmentMutation.isPending}
                      >
                        Take Assessment
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Work-Life Balance Assessment</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Evaluate your work-life balance and satisfaction
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last completed: 5 days ago</span>
                      <Button 
                        size="sm"
                        onClick={() => conductAssessmentMutation.mutate('work_life_balance')}
                        disabled={conductAssessmentMutation.isPending}
                      >
                        Take Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Wellness Progress Tracking
                </CardTitle>
                <CardDescription>
                  Your mental health journey over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Weekly Trends</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span>Sleep Quality</span>
                        <div className="flex items-center gap-2">
                          <Progress value={78} className="w-20" />
                          <span className="text-sm font-medium">+5%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span>Stress Management</span>
                        <div className="flex items-center gap-2">
                          <Progress value={65} className="w-20" />
                          <span className="text-sm font-medium">+12%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span>Energy Levels</span>
                        <div className="flex items-center gap-2">
                          <Progress value={72} className="w-20" />
                          <span className="text-sm font-medium">+3%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Goal Progress</h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Reduce Daily Stress</span>
                          <Badge variant="outline">75% Complete</Badge>
                        </div>
                        <Progress value={75} className="mb-2" />
                        <p className="text-sm text-gray-600">Target: 6.0/10 by month end</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Improve Sleep Routine</span>
                          <Badge variant="outline">60% Complete</Badge>
                        </div>
                        <Progress value={60} className="mb-2" />
                        <p className="text-sm text-gray-600">Target: 8+ hours nightly</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Mindfulness Practice</span>
                          <Badge variant="outline">90% Complete</Badge>
                        </div>
                        <Progress value={90} className="mb-2" />
                        <p className="text-sm text-gray-600">Target: Daily 10min meditation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crisis">
          <div className="space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4" />
              <AlertTitle>Crisis Support Available 24/7</AlertTitle>
              <AlertDescription>
                If you're experiencing a mental health crisis, immediate help is available.
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <Phone className="h-4 w-4 mr-1" />
                    Call Crisis Line: 988
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Text Crisis Support
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Your Personalized Crisis Intervention Plan</CardTitle>
                <CardDescription>
                  A tailored plan based on your triggers and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {crisisSupport ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Your Warning Signs</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-2">Emotional</h4>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Persistent sadness</li>
                            <li>• Increased irritability</li>
                            <li>• Feeling hopeless</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <h4 className="font-medium text-orange-900 mb-2">Behavioral</h4>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Social withdrawal</li>
                            <li>• Missed check-ins</li>
                            <li>• Erratic driving patterns</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Your Support Network</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 border rounded-lg text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <h4 className="font-medium">Family</h4>
                          <p className="text-sm text-gray-600">Spouse, Brother</p>
                          <Button size="sm" className="mt-2">
                            <Phone className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <h4 className="font-medium">Professional</h4>
                          <p className="text-sm text-gray-600">Dr. Sarah Johnson</p>
                          <Button size="sm" className="mt-2">
                            <Video className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <h4 className="font-medium">Peer Support</h4>
                          <p className="text-sm text-gray-600">Trucker Support Group</p>
                          <Button size="sm" className="mt-2">
                            <Users className="h-4 w-4 mr-1" />
                            Join Session
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Immediate Coping Strategies</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Quick Relief (5 min)</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Deep breathing exercise</li>
                            <li>• Call trusted support person</li>
                            <li>• Listen to calming music</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Extended Relief (15+ min)</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Guided meditation session</li>
                            <li>• Progressive muscle relaxation</li>
                            <li>• Video call with family</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Loading your personalized crisis support plan...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="community">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mental Health Community
                </CardTitle>
                <CardDescription>
                  Connect with fellow drivers for peer support and shared experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Upcoming Support Groups</h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Stress Management Circle</h4>
                          <Badge>Today 7PM</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Weekly discussion on managing road stress and anxiety
                        </p>
                        <Button size="sm">Join Session</Button>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">New Driver Mentorship</h4>
                          <Badge variant="outline">Tomorrow 2PM</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Support group for drivers new to long-haul trucking
                        </p>
                        <Button size="sm" variant="outline">Schedule</Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Community Resources</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Anonymous Chat</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          24/7 peer support chat room
                        </p>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Join Chat
                        </Button>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-1">Success Stories</h4>
                        <p className="text-sm text-green-800 mb-2">
                          Read inspiring recovery journeys
                        </p>
                        <Button size="sm" variant="outline">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Read Stories
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {systemMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{systemMetrics.totalDriversInProgram}</div>
                      <div className="text-sm text-gray-600">Drivers Supported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{systemMetrics.crisisPreventionSuccessRate}%</div>
                      <div className="text-sm text-gray-600">Crisis Prevention</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{systemMetrics.interventionsThisWeek}</div>
                      <div className="text-sm text-gray-600">Weekly Interventions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{systemMetrics.driverSatisfactionScore}/5</div>
                      <div className="text-sm text-gray-600">Satisfaction Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}