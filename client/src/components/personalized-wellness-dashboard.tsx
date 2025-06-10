import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, Brain, Target, AlertTriangle, Phone, CheckCircle,
  Activity, Clock, Star, Shield, Zap, Moon, Calendar,
  BookOpen, Play, Pause, SkipForward, Volume2, Headphones,
  Users, MessageCircle, ThumbsUp, TrendingUp, Award
} from "lucide-react";

interface WellnessProfile {
  id: string;
  driverId: number;
  mentalHealthScore: number;
  stressLevel: number;
  fatigueLevel: number;
  sleepQuality: number;
  personalGoals: WellnessGoal[];
  riskFactors: RiskFactor[];
  lastAssessment: Date;
  emergencyContact: EmergencyContact;
}

interface WellnessGoal {
  id: string;
  type: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
}

interface RiskFactor {
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  identified: Date;
  notes: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

interface WellnessResource {
  id: string;
  title: string;
  category: string;
  type: string;
  duration: number;
  effectiveness: number;
  description: string;
}

interface WellnessAnalytics {
  mentalHealthTrend: {
    current: number;
    trend: string;
    change: number;
  };
  stressLevels: {
    current: number;
    average: number;
    peak: number;
    recommendation: string;
  };
  wellnessGoals: {
    active: number;
    completed: number;
    progress: number;
  };
  riskAssessment: {
    level: string;
    factors: number;
    lastScreening: Date;
  };
  interventionHistory: {
    total: number;
    successful: number;
    effectiveness: number;
  };
}

export function PersonalizedWellnessDashboard() {
  const [selectedDriverId, setSelectedDriverId] = useState<number>(1);
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [checkInResponses, setCheckInResponses] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const { data: wellnessProfile, isLoading: profileLoading } = useQuery<WellnessProfile>({
    queryKey: ['/api/wellness/profile', selectedDriverId],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: wellnessResources, isLoading: resourcesLoading } = useQuery<WellnessResource[]>({
    queryKey: ['/api/wellness/resources'],
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });

  const { data: wellnessAnalytics, isLoading: analyticsLoading } = useQuery<WellnessAnalytics>({
    queryKey: ['/api/wellness/analytics', selectedDriverId],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: wellnessPlans } = useQuery({
    queryKey: ['/api/wellness/plans', selectedDriverId],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const conductAssessmentMutation = useMutation({
    mutationFn: async (data: { driverId: number; assessmentType: string }) => {
      const response = await fetch('/api/wellness/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/profile', selectedDriverId] });
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/analytics', selectedDriverId] });
    },
  });

  const createWellnessPlanMutation = useMutation({
    mutationFn: async (driverId: number) => {
      const response = await fetch('/api/wellness/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/plans', selectedDriverId] });
    },
  });

  const dailyCheckInMutation = useMutation({
    mutationFn: async (responses: Record<string, number>) => {
      const response = await fetch('/api/wellness/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId, responses }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness/profile', selectedDriverId] });
      setCheckInResponses({});
    },
  });

  const emergencyContactMutation = useMutation({
    mutationFn: async (contactType: string) => {
      const response = await fetch('/api/wellness/emergency-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId, contactType }),
      });
      return response.json();
    },
  });

  const handleAssessment = (type: string) => {
    conductAssessmentMutation.mutate({ driverId: selectedDriverId, assessmentType: type });
  };

  const handleCreatePlan = () => {
    createWellnessPlanMutation.mutate(selectedDriverId);
  };

  const handleDailyCheckIn = () => {
    dailyCheckInMutation.mutate(checkInResponses);
  };

  const handleEmergencyContact = (type: string) => {
    emergencyContactMutation.mutate(type);
  };

  const getScoreColor = (score: number, reverse: boolean = false) => {
    if (reverse) {
      if (score <= 3) return "text-green-400";
      if (score <= 6) return "text-yellow-400";
      return "text-red-400";
    }
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (profileLoading || resourcesLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background driver-theme">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold driver-text-critical">
            Personalized Wellness & Mental Health Support
          </h1>
          <p className="driver-text-secondary">
            Comprehensive mental health monitoring and personalized support resources
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleEmergencyContact('crisis_hotline')}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Emergency Support
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Heart className="w-3 h-3 mr-1" />
            24/7 Support Available
          </Badge>
        </div>
      </div>

      {/* Wellness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Mental Health Score</CardTitle>
            <Brain className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(wellnessProfile?.mentalHealthScore || 0)}`}>
              {wellnessProfile?.mentalHealthScore || 0}/100
            </div>
            <Progress 
              value={wellnessProfile?.mentalHealthScore || 0} 
              className="mt-2" 
            />
            <p className="text-xs driver-text-secondary mt-1">
              {wellnessAnalytics?.mentalHealthTrend.trend === 'improving' ? '+' : ''}
              {wellnessAnalytics?.mentalHealthTrend.change || 0} from last week
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Stress Level</CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(wellnessProfile?.stressLevel || 0, true)}`}>
              {wellnessProfile?.stressLevel || 0}/10
            </div>
            <Progress 
              value={(wellnessProfile?.stressLevel || 0) * 10} 
              className="mt-2" 
            />
            <p className="text-xs driver-text-secondary mt-1">
              Average: {wellnessAnalytics?.stressLevels.average || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Sleep Quality</CardTitle>
            <Moon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(wellnessProfile?.sleepQuality || 0)}`}>
              {wellnessProfile?.sleepQuality || 0}/10
            </div>
            <Progress 
              value={(wellnessProfile?.sleepQuality || 0) * 10} 
              className="mt-2" 
            />
            <p className="text-xs driver-text-secondary mt-1">
              Last 7 days average
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Risk Assessment</CardTitle>
            <Shield className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={getRiskBadgeColor(wellnessAnalytics?.riskAssessment.level || 'low')}>
                {wellnessAnalytics?.riskAssessment.level || 'Low'}
              </Badge>
            </div>
            <p className="text-xs driver-text-secondary mt-1">
              {wellnessAnalytics?.riskAssessment.factors || 0} risk factors identified
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="checkin">Daily Check-in</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="goals">Goals & Plans</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wellness Trends */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Wellness Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Mental Health</span>
                    <div className="flex items-center gap-2">
                      <span className="driver-text-emphasis">{wellnessProfile?.mentalHealthScore}/100</span>
                      <Badge variant="outline" className="text-green-600">Stable</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Stress Management</span>
                    <div className="flex items-center gap-2">
                      <span className="driver-text-emphasis">{10 - (wellnessProfile?.stressLevel || 0)}/10</span>
                      <Badge variant="outline" className="text-yellow-600">Improving</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="driver-text-secondary">Sleep Quality</span>
                    <div className="flex items-center gap-2">
                      <span className="driver-text-emphasis">{wellnessProfile?.sleepQuality}/10</span>
                      <Badge variant="outline" className="text-blue-600">Good</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active Wellness Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-3">
                    {wellnessProfile?.personalGoals?.filter(g => g.isActive).map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="driver-text-emphasis text-sm">{goal.title}</span>
                          <Badge variant="outline" className={
                            goal.priority === 'high' ? 'text-red-600' :
                            goal.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }>
                            {goal.priority}
                          </Badge>
                        </div>
                        <Progress 
                          value={(goal.currentValue / goal.targetValue) * 100} 
                          className="h-2" 
                        />
                        <p className="text-xs driver-text-secondary">
                          {goal.currentValue}/{goal.targetValue} - Due {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Risk Factors Alert */}
          {wellnessProfile?.riskFactors && wellnessProfile.riskFactors.length > 0 && (
            <Card className="driver-card border-orange-500">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Risk Factor Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wellnessProfile.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div>
                        <p className="font-medium driver-text-emphasis capitalize">{risk.type.replace('_', ' ')}</p>
                        <p className="text-xs driver-text-secondary">{risk.notes}</p>
                      </div>
                      <Badge className={getRiskBadgeColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checkin" className="space-y-4">
          <Card className="driver-card">
            <CardHeader>
              <CardTitle className="driver-text-emphasis">Daily Wellness Check-in</CardTitle>
              <p className="driver-text-secondary">How are you feeling today? Your responses help us provide better support.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="driver-text-emphasis block text-sm font-medium mb-2">
                      Stress Level (1-10)
                    </label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button
                          key={num}
                          onClick={() => setCheckInResponses(prev => ({...prev, stress: num}))}
                          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                            checkInResponses.stress === num 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 driver-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="driver-text-emphasis block text-sm font-medium mb-2">
                      Fatigue Level (1-10)
                    </label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button
                          key={num}
                          onClick={() => setCheckInResponses(prev => ({...prev, fatigue: num}))}
                          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                            checkInResponses.fatigue === num 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 driver-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="driver-text-emphasis block text-sm font-medium mb-2">
                      Mood Rating (1-10)
                    </label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button
                          key={num}
                          onClick={() => setCheckInResponses(prev => ({...prev, mood: num}))}
                          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                            checkInResponses.mood === num 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 driver-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="driver-text-emphasis block text-sm font-medium mb-2">
                      Sleep Quality Last Night (1-10)
                    </label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button
                          key={num}
                          onClick={() => setCheckInResponses(prev => ({...prev, sleep: num}))}
                          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                            checkInResponses.sleep === num 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 driver-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleDailyCheckIn}
                disabled={Object.keys(checkInResponses).length < 4 || dailyCheckInMutation.isPending}
                className="w-full"
              >
                {dailyCheckInMutation.isPending ? 'Submitting...' : 'Submit Check-in'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wellnessResources?.map((resource) => (
              <Card key={resource.id} className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-emphasis text-sm flex items-center gap-2">
                    {resource.type === 'video' && <Play className="w-4 h-4" />}
                    {resource.type === 'audio' && <Headphones className="w-4 h-4" />}
                    {resource.type === 'article' && <BookOpen className="w-4 h-4" />}
                    {resource.type === 'exercise' && <Activity className="w-4 h-4" />}
                    {resource.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{resource.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs driver-text-secondary">{resource.duration}min</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm driver-text-secondary mb-4">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm driver-text-emphasis">{resource.effectiveness}/10</span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setActiveResource(resource.id)}
                      variant={activeResource === resource.id ? "secondary" : "default"}
                    >
                      {activeResource === resource.id ? 'Active' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="driver-text-emphasis text-lg font-semibold">Wellness Goals & Plans</h3>
            <Button onClick={handleCreatePlan} disabled={createWellnessPlanMutation.isPending}>
              {createWellnessPlanMutation.isPending ? 'Creating...' : 'Create New Plan'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Personal Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wellnessProfile?.personalGoals?.map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="driver-text-emphasis font-medium">{goal.title}</h4>
                        <Badge variant="outline" className={
                          goal.priority === 'high' ? 'text-red-600' : 
                          goal.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }>
                          {goal.priority}
                        </Badge>
                      </div>
                      <p className="driver-text-secondary text-sm mb-3">{goal.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="driver-text-secondary">Progress</span>
                          <span className="driver-text-emphasis">{goal.currentValue}/{goal.targetValue}</span>
                        </div>
                        <Progress value={(goal.currentValue / goal.targetValue) * 100} />
                        <p className="text-xs driver-text-secondary">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Wellness Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wellnessPlans?.map((plan: any) => (
                    <div key={plan.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="driver-text-emphasis font-medium">{plan.planName}</h4>
                        <Badge variant="outline" className="text-blue-600">
                          {plan.duration} days
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="driver-text-secondary">Overall Progress</span>
                          <span className="driver-text-emphasis">{plan.progress?.overallCompletion || 0}%</span>
                        </div>
                        <Progress value={plan.progress?.overallCompletion || 0} />
                        <p className="text-xs driver-text-secondary">
                          Started: {new Date(plan.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Mental Health Assessments</CardTitle>
                <p className="driver-text-secondary">Regular assessments help track your mental health progress</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleAssessment('daily_checkin')}
                  disabled={conductAssessmentMutation.isPending}
                  className="w-full justify-start"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Daily Mental Health Check-in
                </Button>
                <Button 
                  onClick={() => handleAssessment('weekly_assessment')}
                  disabled={conductAssessmentMutation.isPending}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Weekly Comprehensive Assessment
                </Button>
                <Button 
                  onClick={() => handleAssessment('crisis_screening')}
                  disabled={conductAssessmentMutation.isPending}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Crisis Risk Screening
                </Button>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Assessment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="driver-text-emphasis font-medium">Weekly Assessment</p>
                      <p className="text-xs driver-text-secondary">Completed 2 days ago</p>
                    </div>
                    <Badge className="bg-green-500">Score: 78/100</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="driver-text-emphasis font-medium">Daily Check-in</p>
                      <p className="text-xs driver-text-secondary">Completed today</p>
                    </div>
                    <Badge className="bg-blue-500">Score: 82/100</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergency Support
                </CardTitle>
                <p className="driver-text-secondary">Immediate help when you need it most</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleEmergencyContact('crisis_hotline')}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={emergencyContactMutation.isPending}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Crisis Hotline - Call Now
                </Button>
                <Button 
                  onClick={() => handleEmergencyContact('counselor')}
                  className="w-full"
                  variant="outline"
                  disabled={emergencyContactMutation.isPending}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Connect with Counselor
                </Button>
                <Button 
                  onClick={() => handleEmergencyContact('peer_support')}
                  className="w-full"
                  variant="outline"
                  disabled={emergencyContactMutation.isPending}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Peer Support Group
                </Button>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                {wellnessProfile?.emergencyContact && (
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="driver-text-emphasis font-medium">{wellnessProfile.emergencyContact.name}</h4>
                      <p className="driver-text-secondary capitalize">{wellnessProfile.emergencyContact.relationship}</p>
                      <p className="driver-text-emphasis font-mono">{wellnessProfile.emergencyContact.phone}</p>
                      {wellnessProfile.emergencyContact.isPrimary && (
                        <Badge className="bg-blue-500 mt-2">Primary Contact</Badge>
                      )}
                    </div>
                    <Button className="w-full" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Emergency Contact
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="driver-card">
            <CardHeader>
              <CardTitle className="driver-text-emphasis">Support Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Phone className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <h4 className="driver-text-emphasis font-medium">24/7 Hotline</h4>
                  <p className="driver-text-secondary text-sm">1-800-SUPPORT</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <h4 className="driver-text-emphasis font-medium">Live Chat</h4>
                  <p className="driver-text-secondary text-sm">Available 24/7</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <h4 className="driver-text-emphasis font-medium">Support Groups</h4>
                  <p className="driver-text-secondary text-sm">Driver community</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}