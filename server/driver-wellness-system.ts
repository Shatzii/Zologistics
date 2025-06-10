// Driver Wellness & Mental Health Support System
export interface WellnessProfile {
  driverId: number;
  personalInfo: {
    age: number;
    yearsExperience: number;
    familyStatus: 'single' | 'married' | 'divorced' | 'widowed';
    dependents: number;
    healthConditions: string[];
  };
  mentalHealthMetrics: {
    stressLevel: number; // 1-10 scale
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
    drivingStressIndicators: Array<{
      timestamp: Date;
      indicator: 'harsh_braking' | 'rapid_acceleration' | 'long_idle' | 'late_delivery_stress';
      severity: number;
      location: string;
    }>;
    sleepPatterns: Array<{
      date: Date;
      sleepDuration: number;
      sleepQuality: number;
      restLocation: string;
    }>;
    socialInteraction: {
      familyContactFrequency: number;
      peerInteractionLevel: number;
      isolationRisk: number;
    };
  };
  riskFactors: {
    highRiskCategories: string[];
    interventionHistory: Array<{
      date: Date;
      type: string;
      effectiveness: number;
    }>;
    emergencyContacts: Array<{
      name: string;
      relationship: string;
      phone: string;
      priority: number;
    }>;
  };
}

export interface WellnessIntervention {
  id: string;
  driverId: number;
  triggerEvent: string;
  interventionType: 'breathing_exercise' | 'guided_meditation' | 'peer_support' | 'professional_counseling' | 'family_call' | 'emergency_support';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  content: {
    title: string;
    description: string;
    duration: number; // minutes
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

export interface MentalHealthResource {
  id: string;
  category: 'crisis_support' | 'stress_management' | 'sleep_improvement' | 'family_relationships' | 'financial_stress' | 'career_development';
  title: string;
  description: string;
  accessMethod: 'phone' | 'app' | 'video_call' | 'in_person' | 'online';
  availability: '24/7' | 'business_hours' | 'scheduled' | 'on_demand';
  cost: 'free' | 'covered' | 'copay' | 'premium';
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

export interface WellnessGoal {
  id: string;
  driverId: number;
  category: 'physical' | 'mental' | 'social' | 'professional';
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

export interface StressAlert {
  id: string;
  driverId: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: Array<{
    type: 'biometric' | 'behavioral' | 'environmental' | 'self_reported';
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

export class DriverWellnessSystem {
  private wellnessProfiles: Map<number, WellnessProfile> = new Map();
  private interventions: Map<string, WellnessIntervention> = new Map();
  private resources: Map<string, MentalHealthResource> = new Map();
  private goals: Map<string, WellnessGoal> = new Map();
  private stressAlerts: Map<string, StressAlert> = new Map();

  constructor() {
    this.initializeWellnessSystem();
    this.startContinuousMonitoring();
  }

  private initializeWellnessSystem() {
    this.createSampleWellnessProfile();
    this.initializeMentalHealthResources();
    this.createPersonalizedGoals();
  }

  private createSampleWellnessProfile() {
    const profile: WellnessProfile = {
      driverId: 1,
      personalInfo: {
        age: 42,
        yearsExperience: 18,
        familyStatus: 'married',
        dependents: 2,
        healthConditions: ['hypertension', 'sleep_apnea']
      },
      mentalHealthMetrics: {
        stressLevel: 6,
        anxietyLevel: 4,
        depressionRisk: 3,
        burnoutIndicators: 5,
        sleepQuality: 6,
        jobSatisfaction: 7,
        lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      physicalHealthMetrics: {
        bmi: 28.5,
        bloodPressure: { systolic: 140, diastolic: 90 },
        heartRate: 78,
        stepCount: 4200,
        exerciseMinutes: 15,
        lastPhysical: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      },
      behavioralPatterns: {
        drivingStressIndicators: [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            indicator: 'harsh_braking',
            severity: 7,
            location: 'I-75 Atlanta Traffic'
          }
        ],
        sleepPatterns: [
          {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            sleepDuration: 6.5,
            sleepQuality: 6,
            restLocation: 'Flying J - Exit 245'
          }
        ],
        socialInteraction: {
          familyContactFrequency: 8,
          peerInteractionLevel: 5,
          isolationRisk: 4
        }
      },
      riskFactors: {
        highRiskCategories: ['cardiovascular', 'sleep_disorders', 'family_stress'],
        interventionHistory: [],
        emergencyContacts: [
          {
            name: 'Sarah Johnson (Wife)',
            relationship: 'spouse',
            phone: '+1-555-0123',
            priority: 1
          },
          {
            name: 'Dr. Michael Chen',
            relationship: 'primary_physician',
            phone: '+1-555-0456',
            priority: 2
          }
        ]
      }
    };

    this.wellnessProfiles.set(1, profile);
  }

  private initializeMentalHealthResources() {
    const resources: MentalHealthResource[] = [
      {
        id: 'crisis_hotline_001',
        category: 'crisis_support',
        title: '24/7 Crisis Support Hotline',
        description: 'Immediate support for mental health emergencies and suicidal thoughts',
        accessMethod: 'phone',
        availability: '24/7',
        cost: 'free',
        providerInfo: {
          name: 'National Suicide Prevention Lifeline',
          credentials: 'Licensed Mental Health Professionals',
          specialization: ['crisis_intervention', 'suicide_prevention', 'emergency_support'],
          rating: 9.8
        },
        contactInfo: {
          phone: '988',
          website: 'suicidepreventionlifeline.org'
        }
      },
      {
        id: 'trucker_therapy_001',
        category: 'stress_management',
        title: 'Trucker-Specialized Therapy',
        description: 'Mental health professionals who understand the unique challenges of trucking',
        accessMethod: 'video_call',
        availability: 'scheduled',
        cost: 'covered',
        providerInfo: {
          name: 'Dr. Lisa Rodriguez, LCSW',
          credentials: 'Licensed Clinical Social Worker',
          specialization: ['trucker_mental_health', 'stress_management', 'family_therapy'],
          rating: 9.5
        },
        contactInfo: {
          phone: '+1-555-THERAPY',
          website: 'truckertherapy.com',
          app: 'TruckerWellness'
        }
      },
      {
        id: 'meditation_app_001',
        category: 'stress_management',
        title: 'Driver-Focused Meditation App',
        description: 'Guided meditations designed for truck cab environments and driver schedules',
        accessMethod: 'app',
        availability: 'on_demand',
        cost: 'free',
        providerInfo: {
          name: 'RoadZen Meditation',
          credentials: 'Certified Meditation Instructors',
          specialization: ['driving_meditation', 'stress_relief', 'sleep_improvement'],
          rating: 9.2
        },
        contactInfo: {
          app: 'RoadZen',
          website: 'roadzen.app'
        }
      },
      {
        id: 'family_counseling_001',
        category: 'family_relationships',
        title: 'Family Relationship Counseling',
        description: 'Specialized counseling for trucking families dealing with separation stress',
        accessMethod: 'video_call',
        availability: 'scheduled',
        cost: 'covered',
        providerInfo: {
          name: 'Family Bridge Counseling',
          credentials: 'Licensed Marriage & Family Therapists',
          specialization: ['trucker_families', 'relationship_counseling', 'communication_skills'],
          rating: 9.4
        },
        contactInfo: {
          phone: '+1-555-FAMILY',
          website: 'familybridgecounseling.com'
        }
      },
      {
        id: 'financial_stress_001',
        category: 'financial_stress',
        title: 'Financial Stress Management',
        description: 'Financial counseling and stress management for economic pressures',
        accessMethod: 'phone',
        availability: 'business_hours',
        cost: 'free',
        providerInfo: {
          name: 'TruckFlow Financial Wellness Team',
          credentials: 'Certified Financial Counselors',
          specialization: ['financial_planning', 'debt_management', 'stress_reduction'],
          rating: 9.1
        },
        contactInfo: {
          phone: '+1-555-FINANCE',
          website: 'truckflow.ai/financial-wellness'
        }
      }
    ];

    resources.forEach(resource => this.resources.set(resource.id, resource));
  }

  private createPersonalizedGoals() {
    const goals: WellnessGoal[] = [
      {
        id: 'stress_reduction_001',
        driverId: 1,
        category: 'mental',
        title: 'Reduce Daily Stress Level',
        description: 'Lower daily stress from 6/10 to 4/10 through mindfulness and breathing exercises',
        targetValue: 4,
        currentValue: 6,
        unit: 'stress_level',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        milestones: [
          { value: 5.5, achievedAt: null, reward: '$50 wellness bonus' },
          { value: 5.0, achievedAt: null, reward: 'Premium meditation app access' },
          { value: 4.5, achievedAt: null, reward: 'Spa day for spouse' },
          { value: 4.0, achievedAt: null, reward: '$200 wellness achievement bonus' }
        ],
        personalizedPlan: {
          dailyActions: [
            '5-minute breathing exercise before starting drive',
            'Call family during mandatory break',
            'Use meditation app during 30-minute rest'
          ],
          weeklyCheckpoints: [
            'Complete stress assessment survey',
            'Review driving stress incidents',
            'Schedule family video call'
          ],
          supportResources: [
            'RoadZen meditation app',
            'Family counseling sessions',
            '24/7 crisis support hotline'
          ]
        }
      },
      {
        id: 'sleep_improvement_001',
        driverId: 1,
        category: 'physical',
        title: 'Improve Sleep Quality',
        description: 'Increase sleep quality score from 6/10 to 8/10',
        targetValue: 8,
        currentValue: 6,
        unit: 'sleep_quality',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        milestones: [
          { value: 6.5, achievedAt: null, reward: 'Premium pillow' },
          { value: 7.0, achievedAt: null, reward: 'Sleep tracking device' },
          { value: 7.5, achievedAt: null, reward: 'Blackout curtains' },
          { value: 8.0, achievedAt: null, reward: '$150 sleep achievement bonus' }
        ],
        personalizedPlan: {
          dailyActions: [
            'No caffeine 6 hours before sleep',
            'Use sleep meditation app',
            'Maintain consistent sleep schedule'
          ],
          weeklyCheckpoints: [
            'Review sleep pattern data',
            'Adjust sleep environment',
            'Consult with sleep specialist if needed'
          ],
          supportResources: [
            'Sleep specialist consultation',
            'Sleep hygiene education',
            'Environmental optimization guide'
          ]
        }
      }
    ];

    goals.forEach(goal => this.goals.set(goal.id, goal));
  }

  private startContinuousMonitoring() {
    setInterval(() => {
      this.monitorStressIndicators();
      this.updateWellnessMetrics();
      this.checkGoalProgress();
      this.triggerPersonalizedInterventions();
    }, 60000); // Every minute
  }

  private monitorStressIndicators() {
    for (const [driverId, profile] of this.wellnessProfiles) {
      // Simulate stress monitoring from various sources
      const currentStress = this.calculateCurrentStressLevel(profile);
      
      if (currentStress >= 8) {
        this.createStressAlert(driverId, currentStress, 'critical');
      } else if (currentStress >= 6) {
        this.createStressAlert(driverId, currentStress, 'high');
      }
    }
  }

  private calculateCurrentStressLevel(profile: WellnessProfile): number {
    // Complex algorithm considering multiple factors
    let stressLevel = profile.mentalHealthMetrics.stressLevel;
    
    // Recent driving stress indicators
    const recentStress = profile.behavioralPatterns.drivingStressIndicators
      .filter(indicator => Date.now() - indicator.timestamp.getTime() < 2 * 60 * 60 * 1000)
      .reduce((sum, indicator) => sum + indicator.severity, 0);
    
    // Sleep quality impact
    const sleepImpact = (10 - profile.mentalHealthMetrics.sleepQuality) * 0.3;
    
    // Social isolation impact
    const isolationImpact = profile.behavioralPatterns.socialInteraction.isolationRisk * 0.2;
    
    return Math.min(10, stressLevel + (recentStress * 0.1) + sleepImpact + isolationImpact);
  }

  private createStressAlert(driverId: number, stressLevel: number, severity: 'low' | 'medium' | 'high' | 'critical') {
    const alert: StressAlert = {
      id: `alert_${Date.now()}_${driverId}`,
      driverId,
      timestamp: new Date(),
      severity,
      indicators: [
        {
          type: 'behavioral',
          metric: 'driving_stress',
          value: stressLevel,
          threshold: severity === 'critical' ? 8 : 6
        }
      ],
      location: {
        lat: 39.7392,
        lng: -104.9903,
        address: 'Current Location'
      },
      automatedResponse: {
        interventionTriggered: true,
        supportNotified: severity === 'critical',
        safetyMeasures: severity === 'critical' ? ['Suggest immediate rest', 'Notify emergency contact'] : ['Breathing exercise reminder']
      },
      resolution: {
        resolvedAt: null,
        method: null,
        effectiveness: null
      }
    };

    this.stressAlerts.set(alert.id, alert);
    this.triggerStressIntervention(driverId, stressLevel, severity);
  }

  private triggerStressIntervention(driverId: number, stressLevel: number, severity: string) {
    const intervention: WellnessIntervention = {
      id: `intervention_${Date.now()}`,
      driverId,
      triggerEvent: `High stress detected: ${stressLevel}/10`,
      interventionType: severity === 'critical' ? 'emergency_support' : 'breathing_exercise',
      urgency: severity as any,
      content: this.getPersonalizedInterventionContent(driverId, stressLevel, severity),
      personalizedFactors: {
        currentLocation: 'Highway rest area',
        timeOfDay: new Date().toLocaleTimeString(),
        drivingStatus: 'on_duty',
        stressIndicators: ['traffic_congestion', 'delivery_pressure']
      },
      effectiveness: null,
      completedAt: null,
      feedback: null
    };

    this.interventions.set(intervention.id, intervention);
  }

  private getPersonalizedInterventionContent(driverId: number, stressLevel: number, severity: string) {
    const profile = this.wellnessProfiles.get(driverId);
    
    if (severity === 'critical') {
      return {
        title: 'Critical Stress Alert - Immediate Support',
        description: 'High stress levels detected. Your safety and wellbeing are our priority.',
        duration: 0,
        instructions: [
          'Pull over safely when possible',
          'Contact emergency support immediately',
          'Reach out to your emergency contact',
          'Remember: This feeling will pass, and help is available'
        ],
        resources: [
          'Crisis hotline: 988',
          'TruckFlow emergency support: 1-800-SUPPORT',
          `Emergency contact: ${profile?.riskFactors.emergencyContacts[0]?.name} - ${profile?.riskFactors.emergencyContacts[0]?.phone}`
        ]
      };
    }

    return {
      title: '5-Minute Stress Relief Exercise',
      description: 'Quick breathing exercise designed for your current situation',
      duration: 5,
      instructions: [
        'Find a comfortable position in your cab',
        'Close your eyes or soften your gaze',
        'Breathe in slowly for 4 counts',
        'Hold for 4 counts',
        'Exhale slowly for 6 counts',
        'Repeat 5 times'
      ],
      resources: [
        'RoadZen meditation app for guided sessions',
        'Family support hotline available 24/7',
        'Schedule counseling session if stress continues'
      ]
    };
  }

  private updateWellnessMetrics() {
    for (const [driverId, profile] of this.wellnessProfiles) {
      // Simulate metric updates based on interventions and activities
      const interventionEffects = this.calculateInterventionEffects(driverId);
      
      profile.mentalHealthMetrics.stressLevel = Math.max(1, 
        profile.mentalHealthMetrics.stressLevel - interventionEffects.stressReduction
      );
      
      profile.mentalHealthMetrics.sleepQuality = Math.min(10,
        profile.mentalHealthMetrics.sleepQuality + interventionEffects.sleepImprovement
      );
    }
  }

  private calculateInterventionEffects(driverId: number) {
    const completedInterventions = Array.from(this.interventions.values())
      .filter(intervention => 
        intervention.driverId === driverId && 
        intervention.completedAt &&
        Date.now() - intervention.completedAt.getTime() < 24 * 60 * 60 * 1000
      );

    return {
      stressReduction: completedInterventions.length * 0.2,
      sleepImprovement: completedInterventions.filter(i => 
        i.interventionType === 'guided_meditation'
      ).length * 0.1
    };
  }

  private checkGoalProgress() {
    for (const [goalId, goal] of this.goals) {
      const profile = this.wellnessProfiles.get(goal.driverId);
      if (!profile) continue;

      let currentValue = goal.currentValue;
      
      // Update current value based on goal category
      if (goal.category === 'mental' && goal.title.includes('Stress')) {
        currentValue = profile.mentalHealthMetrics.stressLevel;
      } else if (goal.category === 'physical' && goal.title.includes('Sleep')) {
        currentValue = profile.mentalHealthMetrics.sleepQuality;
      }

      goal.currentValue = currentValue;

      // Check milestone achievements
      goal.milestones.forEach(milestone => {
        if (!milestone.achievedAt) {
          const achieved = goal.title.includes('Reduce') ? 
            currentValue <= milestone.value : 
            currentValue >= milestone.value;
          
          if (achieved) {
            milestone.achievedAt = new Date();
            this.awardMilestoneReward(goal.driverId, milestone.reward);
          }
        }
      });
    }
  }

  private awardMilestoneReward(driverId: number, reward: string) {
    // Implementation for awarding milestone rewards
    console.log(`Driver ${driverId} earned reward: ${reward}`);
  }

  private triggerPersonalizedInterventions() {
    // Check for scheduled interventions based on time, location, and patterns
    for (const [driverId, profile] of this.wellnessProfiles) {
      const currentHour = new Date().getHours();
      
      // Morning wellness check
      if (currentHour === 6 && !this.hasRecentIntervention(driverId, 'morning_check')) {
        this.createMorningWellnessCheck(driverId);
      }
      
      // Evening family connection reminder
      if (currentHour === 19 && !this.hasRecentIntervention(driverId, 'family_call')) {
        this.createFamilyConnectionReminder(driverId);
      }
    }
  }

  private hasRecentIntervention(driverId: number, type: string): boolean {
    return Array.from(this.interventions.values()).some(intervention =>
      intervention.driverId === driverId &&
      intervention.triggerEvent.includes(type) &&
      Date.now() - new Date(intervention.triggerEvent).getTime() < 24 * 60 * 60 * 1000
    );
  }

  private createMorningWellnessCheck(driverId: number) {
    const intervention: WellnessIntervention = {
      id: `morning_check_${Date.now()}`,
      driverId,
      triggerEvent: 'morning_wellness_check',
      interventionType: 'guided_meditation',
      urgency: 'low',
      content: {
        title: 'Good Morning Wellness Check',
        description: 'Start your day with intention and mindfulness',
        duration: 3,
        instructions: [
          'Take 3 deep breaths',
          'Set a positive intention for the day',
          'Visualize a successful, safe journey',
          'Connect with your family before starting'
        ],
        resources: [
          'Morning meditation playlist',
          'Daily affirmations for drivers',
          'Weather and route safety check'
        ]
      },
      personalizedFactors: {
        currentLocation: 'Rest area',
        timeOfDay: 'morning',
        drivingStatus: 'pre_trip',
        stressIndicators: []
      },
      effectiveness: null,
      completedAt: null,
      feedback: null
    };

    this.interventions.set(intervention.id, intervention);
  }

  private createFamilyConnectionReminder(driverId: number) {
    const profile = this.wellnessProfiles.get(driverId);
    if (!profile) return;

    const intervention: WellnessIntervention = {
      id: `family_call_${Date.now()}`,
      driverId,
      triggerEvent: 'evening_family_connection',
      interventionType: 'family_call',
      urgency: 'medium',
      content: {
        title: 'Family Connection Time',
        description: 'Your family is thinking of you. Take time to connect.',
        duration: 15,
        instructions: [
          'Find a quiet, comfortable spot',
          'Call your family using hands-free device',
          'Share highlights from your day',
          'Listen actively to their experiences',
          'Express your love and appreciation'
        ],
        resources: [
          `Primary contact: ${profile.riskFactors.emergencyContacts[0]?.name}`,
          'Video call app for better connection',
          'Family activity suggestions for when you return'
        ]
      },
      personalizedFactors: {
        currentLocation: 'Truck stop',
        timeOfDay: 'evening',
        drivingStatus: 'off_duty',
        stressIndicators: ['family_separation']
      },
      effectiveness: null,
      completedAt: null,
      feedback: null
    };

    this.interventions.set(intervention.id, intervention);
  }

  // Public API methods
  async getWellnessProfile(driverId: number): Promise<WellnessProfile | null> {
    return this.wellnessProfiles.get(driverId) || null;
  }

  async getActiveInterventions(driverId: number): Promise<WellnessIntervention[]> {
    return Array.from(this.interventions.values())
      .filter(intervention => 
        intervention.driverId === driverId && 
        !intervention.completedAt
      )
      .sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      });
  }

  async getMentalHealthResources(category?: string): Promise<MentalHealthResource[]> {
    const resources = Array.from(this.resources.values());
    return category ? 
      resources.filter(resource => resource.category === category) : 
      resources;
  }

  async getWellnessGoals(driverId: number): Promise<WellnessGoal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.driverId === driverId);
  }

  async completeIntervention(
    interventionId: string, 
    effectiveness: number, 
    feedback?: string
  ): Promise<boolean> {
    const intervention = this.interventions.get(interventionId);
    if (intervention) {
      intervention.completedAt = new Date();
      intervention.effectiveness = effectiveness;
      intervention.feedback = feedback || null;
      return true;
    }
    return false;
  }

  async getStressAlerts(driverId?: number): Promise<StressAlert[]> {
    const alerts = Array.from(this.stressAlerts.values());
    return driverId ? 
      alerts.filter(alert => alert.driverId === driverId) :
      alerts;
  }

  async updateWellnessMetrics(
    driverId: number, 
    metrics: Partial<WellnessProfile['mentalHealthMetrics']>
  ): Promise<boolean> {
    const profile = this.wellnessProfiles.get(driverId);
    if (profile) {
      Object.assign(profile.mentalHealthMetrics, metrics);
      profile.mentalHealthMetrics.lastAssessment = new Date();
      return true;
    }
    return false;
  }

  async createCustomIntervention(
    driverId: number,
    interventionData: Partial<WellnessIntervention>
  ): Promise<WellnessIntervention> {
    const intervention: WellnessIntervention = {
      id: `custom_${Date.now()}`,
      driverId,
      triggerEvent: interventionData.triggerEvent || 'custom_request',
      interventionType: interventionData.interventionType || 'breathing_exercise',
      urgency: interventionData.urgency || 'medium',
      content: interventionData.content || {
        title: 'Custom Wellness Intervention',
        description: 'Personalized wellness support',
        duration: 5,
        instructions: ['Follow personalized guidance'],
        resources: []
      },
      personalizedFactors: interventionData.personalizedFactors || {
        currentLocation: 'Unknown',
        timeOfDay: new Date().toLocaleTimeString(),
        drivingStatus: 'unknown',
        stressIndicators: []
      },
      effectiveness: null,
      completedAt: null,
      feedback: null
    };

    this.interventions.set(intervention.id, intervention);
    return intervention;
  }

  getWellnessSystemMetrics(): {
    totalDriversMonitored: number;
    activeInterventions: number;
    averageStressReduction: number;
    goalCompletionRate: number;
    resourceUtilization: number;
    criticalAlertsLast24h: number;
  } {
    const totalDrivers = this.wellnessProfiles.size;
    const activeInterventions = Array.from(this.interventions.values())
      .filter(i => !i.completedAt).length;
    
    const completedInterventions = Array.from(this.interventions.values())
      .filter(i => i.completedAt && i.effectiveness !== null);
    
    const averageStressReduction = completedInterventions.length > 0 ?
      completedInterventions.reduce((sum, i) => sum + (i.effectiveness || 0), 0) / completedInterventions.length :
      0;

    const goals = Array.from(this.goals.values());
    const completedGoals = goals.filter(goal => 
      goal.milestones.some(milestone => milestone.achievedAt)
    ).length;
    
    const goalCompletionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

    const criticalAlerts = Array.from(this.stressAlerts.values())
      .filter(alert => 
        alert.severity === 'critical' &&
        Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000
      ).length;

    return {
      totalDriversMonitored: totalDrivers,
      activeInterventions,
      averageStressReduction,
      goalCompletionRate,
      resourceUtilization: 85.2, // Simulated metric
      criticalAlertsLast24h: criticalAlerts
    };
  }
}

export const driverWellnessSystem = new DriverWellnessSystem();