import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, Brain, Target, Phone, MessageCircle, 
  AlertTriangle, CheckCircle, TrendingUp, Users,
  Bed, Activity, Smile, Shield, Zap, Clock,
  PhoneCall, Video, PlayCircle, BookOpen, Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WellnessProfile {
  driverId: number;
  personalInfo: {
    age: number;
    yearsExperience: number;
    familyStatus: string;
    dependents: number;
    healthConditions: string[];
  };
  mentalHealthMetrics: {
    stressLevel: number;
    anxietyLevel: number;
    depressionRisk: number;
    burnoutIndicators: number;
    sleepQuality: number;
    jobSatisfaction: number;
    lastAssessment: Date;
  };
  physicalHealthMetrics: {
    bmi: number;
    bloodPressure: { systolic: number; diastolic: number };
    heartRate: number;
    stepCount: number;
    exerciseMinutes: number;
    lastPhysical: Date;
  };
  behavioralPatterns: {
    socialInteraction: {
      familyContactFrequency: number;
      peerInteractionLevel: number;
      isolationRisk: number;
    };
  };
  riskFactors: {
    highRiskCategories: string[];
    emergencyContacts: Array<{
      name: string;
      relationship: string;
      phone: string;
      priority: number;
    }>;
  };
}

interface WellnessIntervention {
  id: string;
  driverId: number;
  triggerEvent: string;
  interventionType: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  content: {
    title: string;
    description: string;
    duration: number;
    instructions: string[];
    resources: string[];
  };
  personalizedFactors: {
    currentLocation: string;
    timeOfDay: string;
    drivingStatus: string;
    stressIndicators: string[];
  };
  effectiveness: number | null;
  completedAt: Date | null;
  feedback: string | null;
}

interface MentalHealthResource {
  id: string;
  category: string;
  title: string;
  description: string;
  accessMethod: string;
  availability: string;
  cost: string;
  providerInfo: {
    name: string;
    credentials: string;
    specialization: string[];
    rating: number;
  };
  contactInfo: {
    phone?: string;
    website?: string;
    app?: string;
    location?: string;
  };
}

interface WellnessGoal {
  id: string;
  driverId: number;
  category: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  milestones: Array<{
    value: number;
    achievedAt: Date | null;
    reward: string;
  }>;
  personalizedPlan: {
    dailyActions: string[];
    weeklyCheckpoints: string[];
    supportResources: string[];
  };
}

interface StressAlert {
  id: string;
  driverId: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: Array<{
    type: string;
    metric: string;
    value: number;
    threshold: number;
  }>;
  location: { lat: number; lng: number; address: string };
  automatedResponse: {
    interventionTriggered: boolean;
    supportNotified: boolean;
    safetyMeasures: string[];
  };
  resolution: {
    resolvedAt: Date | null;
    method: string | null;
    effectiveness: number | null;
  };
}

export function DriverWellnessDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [interventionFeedback, setInterventionFeedback] = useState('');
  const queryClient = useQueryClient();

  const { data: wellnessProfile } = useQuery<WellnessProfile>({
    queryKey: ['/api/wellness/profile', 1],
  });

  const { data: activeInterventions } = useQuery<WellnessIntervention[]>({
    queryKey: ['/api/wellness/interventions', 1],
  });

  const { data: mentalHealthResources } = useQuery<MentalHealthResource[]>({
    queryKey: ['/api/wellness/resources'],
  });

  const { data: wellnessGoals } = useQuery<WellnessGoal[]>({
    queryKey: ['/api/wellness/goals', 1],
  });

  const { data: stressAlerts } = useQuery<StressAlert[]>({
    queryKey: ['/api/wellness/stress-alerts', 1],
  });

  const completeInterventionMutation = useMutation({
    mutationFn: async ({ interventionId, effectiveness, feedback }: {
      interventionId: string;
      effectiveness: number;
      feedback?: string;
    }) => {
      return apiRequest('/api/wellness/complete-intervention', 'POST', {
        interventionId,
        effectiveness,
        feedback
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/interventions', 1] });
      setInterventionFeedback('');
    }
  });

  const updateMetricsMutation = useMutation({
    mutationFn: async (metrics: any) => {
      return apiRequest(`/api/wellness/update-metrics/1`, 'POST', metrics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/profile', 1] });
    }
  });

  const handleCompleteIntervention = (interventionId: string, effectiveness: number) => {
    completeInterventionMutation.mutate({
      interventionId,
      effectiveness,
      feedback: interventionFeedback
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-black';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStressLevelColor = (level: number) => {
    if (level >= 8) return 'text-red-400';
    if (level >= 6) return 'text-orange-400';
    if (level >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getAccessMethodIcon = (method: string) => {
    switch (method) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'video_call': return <Video className="w-4 h-4" />;
      case 'app': return <PlayCircle className="w-4 h-4" />;
      case 'online': return <BookOpen className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (!wellnessProfile || !activeInterventions || !mentalHealthResources || !wellnessGoals || !stressAlerts) {
    return (
      <div className="driver-theme min-h-screen p-6 flex items-center justify-center">
        <div className="driver-text-emphasis">Loading wellness dashboard...</div>
      </div>
    );
  }

  return (
    <div className="driver-theme min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="driver-text-critical text-4xl font-bold">
            Driver Wellness & Mental Health Center
          </h1>
          <p className="driver-text-emphasis text-xl">
            Your comprehensive support system for mental and physical wellbeing
          </p>
          {activeInterventions.length > 0 && (
            <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
              {activeInterventions.length} Active Support Intervention{activeInterventions.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Critical Alerts */}
        {activeInterventions.filter(i => i.urgency === 'critical').length > 0 && (
          <Card className="driver-card border-red-500 bg-red-900/20">
            <CardHeader>
              <CardTitle className="driver-text-critical flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                Critical Support Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeInterventions
                .filter(i => i.urgency === 'critical')
                .map((intervention) => (
                  <div key={intervention.id} className="p-4 bg-red-800/30 rounded-lg">
                    <h3 className="driver-text-emphasis font-semibold text-red-300 mb-2">
                      {intervention.content.title}
                    </h3>
                    <p className="driver-text-secondary mb-3">{intervention.content.description}</p>
                    <div className="space-y-2">
                      {intervention.content.resources.map((resource, index) => (
                        <div key={index} className="driver-text-emphasis text-red-300">
                          📞 {resource}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        className="bg-red-600 hover:bg-red-500"
                        onClick={() => window.open('tel:988', '_self')}
                      >
                        Call Crisis Hotline: 988
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-500"
                        onClick={() => handleCompleteIntervention(intervention.id, 8)}
                      >
                        I'm Safe Now
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Wellness Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="driver-card">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <div className={`driver-dashboard-metric ${getStressLevelColor(wellnessProfile.mentalHealthMetrics.stressLevel)}`}>
                {wellnessProfile.mentalHealthMetrics.stressLevel}/10
              </div>
              <div className="driver-text-secondary">Current Stress Level</div>
            </CardContent>
          </Card>

          <Card className="driver-card">
            <CardContent className="p-6 text-center">
              <Bed className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <div className="driver-dashboard-metric text-purple-400">
                {wellnessProfile.mentalHealthMetrics.sleepQuality}/10
              </div>
              <div className="driver-text-secondary">Sleep Quality</div>
            </CardContent>
          </Card>

          <Card className="driver-card">
            <CardContent className="p-6 text-center">
              <Smile className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <div className="driver-dashboard-metric text-green-400">
                {wellnessProfile.mentalHealthMetrics.jobSatisfaction}/10
              </div>
              <div className="driver-text-secondary">Job Satisfaction</div>
            </CardContent>
          </Card>

          <Card className="driver-card">
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <div className="driver-dashboard-metric text-red-400">
                {wellnessProfile.physicalHealthMetrics.heartRate}
              </div>
              <div className="driver-text-secondary">Heart Rate (BPM)</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="overview" className="driver-text-emphasis">Overview</TabsTrigger>
            <TabsTrigger value="interventions" className="driver-text-emphasis">Active Support</TabsTrigger>
            <TabsTrigger value="resources" className="driver-text-emphasis">Resources</TabsTrigger>
            <TabsTrigger value="goals" className="driver-text-emphasis">Wellness Goals</TabsTrigger>
            <TabsTrigger value="monitoring" className="driver-text-emphasis">Health Monitoring</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Mental Health Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="driver-text-secondary">Stress Level</span>
                        <span className={`driver-text-emphasis ${getStressLevelColor(wellnessProfile.mentalHealthMetrics.stressLevel)}`}>
                          {wellnessProfile.mentalHealthMetrics.stressLevel}/10
                        </span>
                      </div>
                      <Progress 
                        value={(wellnessProfile.mentalHealthMetrics.stressLevel / 10) * 100} 
                        className="h-3" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="driver-text-secondary">Anxiety Level</span>
                        <span className="driver-text-emphasis">{wellnessProfile.mentalHealthMetrics.anxietyLevel}/10</span>
                      </div>
                      <Progress 
                        value={(wellnessProfile.mentalHealthMetrics.anxietyLevel / 10) * 100} 
                        className="h-3" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="driver-text-secondary">Burnout Risk</span>
                        <span className="driver-text-emphasis">{wellnessProfile.mentalHealthMetrics.burnoutIndicators}/10</span>
                      </div>
                      <Progress 
                        value={(wellnessProfile.mentalHealthMetrics.burnoutIndicators / 10) * 100} 
                        className="h-3" 
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-600">
                      <div className="driver-text-secondary text-sm">
                        Last Assessment: {new Date(wellnessProfile.mentalHealthMetrics.lastAssessment).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Social Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Family Contact Frequency</span>
                      <span className="driver-text-emphasis text-green-400">
                        {wellnessProfile.behavioralPatterns.socialInteraction.familyContactFrequency}/10
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Peer Interaction Level</span>
                      <span className="driver-text-emphasis">
                        {wellnessProfile.behavioralPatterns.socialInteraction.peerInteractionLevel}/10
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Isolation Risk</span>
                      <span className={`driver-text-emphasis ${wellnessProfile.behavioralPatterns.socialInteraction.isolationRisk >= 6 ? 'text-red-400' : 'text-green-400'}`}>
                        {wellnessProfile.behavioralPatterns.socialInteraction.isolationRisk}/10
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-600">
                      <h4 className="driver-text-emphasis font-semibold mb-2">Emergency Contacts</h4>
                      {wellnessProfile.riskFactors.emergencyContacts.slice(0, 2).map((contact, index) => (
                        <div key={index} className="flex justify-between items-center mb-2">
                          <span className="driver-text-secondary">{contact.name}</span>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-500"
                            onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Physical Health Summary */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-critical">Physical Health Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="driver-text-emphasis">{wellnessProfile.physicalHealthMetrics.stepCount.toLocaleString()}</div>
                    <div className="driver-text-secondary text-sm">Daily Steps</div>
                  </div>

                  <div className="text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <div className="driver-text-emphasis">{wellnessProfile.physicalHealthMetrics.exerciseMinutes} min</div>
                    <div className="driver-text-secondary text-sm">Exercise Today</div>
                  </div>

                  <div className="text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    <div className="driver-text-emphasis">
                      {wellnessProfile.physicalHealthMetrics.bloodPressure.systolic}/
                      {wellnessProfile.physicalHealthMetrics.bloodPressure.diastolic}
                    </div>
                    <div className="driver-text-secondary text-sm">Blood Pressure</div>
                  </div>

                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <div className="driver-text-emphasis">{wellnessProfile.physicalHealthMetrics.bmi.toFixed(1)}</div>
                    <div className="driver-text-secondary text-sm">BMI</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Interventions Tab */}
          <TabsContent value="interventions" className="space-y-6">
            {activeInterventions.length === 0 ? (
              <Card className="driver-card text-center">
                <CardContent className="p-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <h3 className="driver-text-critical text-xl mb-2">All Good!</h3>
                  <p className="driver-text-secondary">No active wellness interventions needed right now.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeInterventions.map((intervention) => (
                  <Card key={intervention.id} className="driver-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="driver-text-critical">{intervention.content.title}</CardTitle>
                        <Badge className={getUrgencyColor(intervention.urgency)}>
                          {intervention.urgency.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="driver-text-secondary">{intervention.content.description}</p>
                        
                        <div>
                          <h4 className="driver-text-emphasis font-semibold mb-2">Instructions:</h4>
                          <ol className="space-y-1">
                            {intervention.content.instructions.map((instruction, index) => (
                              <li key={index} className="driver-text-secondary">
                                {index + 1}. {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {intervention.content.resources.length > 0 && (
                          <div>
                            <h4 className="driver-text-emphasis font-semibold mb-2">Support Resources:</h4>
                            <ul className="space-y-1">
                              {intervention.content.resources.map((resource, index) => (
                                <li key={index} className="driver-text-secondary">
                                  • {resource}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="driver-text-secondary">Location: </span>
                            <span className="driver-text-emphasis">{intervention.personalizedFactors.currentLocation}</span>
                          </div>
                          <div>
                            <span className="driver-text-secondary">Duration: </span>
                            <span className="driver-text-emphasis">{intervention.content.duration} minutes</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Textarea
                            placeholder="How are you feeling? Any feedback on this intervention?"
                            value={interventionFeedback}
                            onChange={(e) => setInterventionFeedback(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                          
                          <div className="flex gap-2">
                            <Button 
                              className="bg-green-600 hover:bg-green-500"
                              onClick={() => handleCompleteIntervention(intervention.id, 8)}
                            >
                              Helpful (8/10)
                            </Button>
                            <Button 
                              className="bg-yellow-600 hover:bg-yellow-500"
                              onClick={() => handleCompleteIntervention(intervention.id, 5)}
                            >
                              Somewhat (5/10)
                            </Button>
                            <Button 
                              className="bg-red-600 hover:bg-red-500"
                              onClick={() => handleCompleteIntervention(intervention.id, 2)}
                            >
                              Not Helpful (2/10)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Mental Health Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentalHealthResources.map((resource) => (
                <Card key={resource.id} className="driver-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="driver-text-critical">{resource.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getAccessMethodIcon(resource.accessMethod)}
                        <Badge className="bg-blue-600">{resource.availability}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="driver-text-secondary">{resource.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="driver-text-secondary">Provider: </span>
                          <span className="driver-text-emphasis">{resource.providerInfo.name}</span>
                        </div>
                        <div>
                          <span className="driver-text-secondary">Cost: </span>
                          <span className={`driver-text-emphasis ${resource.cost === 'free' || resource.cost === 'covered' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {resource.cost === 'covered' ? 'Fully Covered' : resource.cost}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(resource.providerInfo.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <span className="driver-text-emphasis">{resource.providerInfo.rating}/5.0</span>
                      </div>

                      <div className="flex gap-2">
                        {resource.contactInfo.phone && (
                          <Button 
                            className="bg-green-600 hover:bg-green-500"
                            onClick={() => window.open(`tel:${resource.contactInfo.phone}`, '_self')}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call Now
                          </Button>
                        )}
                        {resource.contactInfo.website && (
                          <Button 
                            className="bg-blue-600 hover:bg-blue-500"
                            onClick={() => window.open(resource.contactInfo.website, '_blank')}
                          >
                            Visit Website
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Wellness Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="space-y-6">
              {wellnessGoals.map((goal) => (
                <Card key={goal.id} className="driver-card">
                  <CardHeader>
                    <CardTitle className="driver-text-critical">{goal.title}</CardTitle>
                    <p className="driver-text-secondary">{goal.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="driver-text-secondary">Progress</span>
                          <span className="driver-text-emphasis">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((goal.currentValue / goal.targetValue) * 100, 100)} 
                          className="h-3" 
                        />
                      </div>

                      <div>
                        <h4 className="driver-text-emphasis font-semibold mb-2">Milestones</h4>
                        <div className="space-y-2">
                          {goal.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                              <span className="driver-text-secondary">
                                {milestone.achievedAt ? '✅' : '⏳'} {milestone.value} {goal.unit}
                              </span>
                              <span className="driver-text-emphasis text-green-400">{milestone.reward}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="driver-text-emphasis font-semibold mb-2">Daily Actions</h4>
                        <ul className="space-y-1">
                          {goal.personalizedPlan.dailyActions.map((action, index) => (
                            <li key={index} className="driver-text-secondary">
                              • {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-sm driver-text-secondary">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Health Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Recent Stress Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  {stressAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-green-400" />
                      <p className="driver-text-secondary">No stress alerts in the last 24 hours</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stressAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getUrgencyColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="driver-text-secondary text-sm">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="driver-text-secondary text-sm">{alert.location.address}</p>
                          {alert.resolution.resolvedAt && (
                            <div className="mt-2 text-green-400 text-sm">
                              ✅ Resolved: {alert.resolution.method}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Health Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="driver-text-emphasis font-semibold mb-2">High Risk Categories</h4>
                      <div className="space-y-1">
                        {wellnessProfile.riskFactors.highRiskCategories.map((category, index) => (
                          <Badge key={index} className="bg-orange-600 mr-2">
                            {category.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="driver-text-emphasis font-semibold mb-2">Health Conditions</h4>
                      <div className="space-y-1">
                        {wellnessProfile.personalInfo.healthConditions.map((condition, index) => (
                          <div key={index} className="driver-text-secondary">
                            • {condition.replace('_', ' ')}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-600">
                      <Button className="w-full bg-blue-600 hover:bg-blue-500">
                        Schedule Health Assessment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Emergency Support Strip */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
          <div className="max-w-7xl mx-auto flex justify-center gap-4">
            <Button 
              className="driver-button bg-red-600 hover:bg-red-500 flex-1 max-w-xs"
              onClick={() => window.open('tel:988', '_self')}
            >
              <Phone className="w-5 h-5 mr-2" />
              Crisis Hotline: 988
            </Button>
            <Button 
              className="driver-button bg-blue-600 hover:bg-blue-500 flex-1 max-w-xs"
              onClick={() => window.open('tel:+1-555-SUPPORT', '_self')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              TruckFlow Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}