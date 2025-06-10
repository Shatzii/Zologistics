import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface WellnessProfile {
  id: string;
  driverId: number;
  mentalHealthScore: number; // 0-100
  stressLevel: number; // 0-10
  fatigueLevel: number; // 0-10
  sleepQuality: number; // 0-10
  personalGoals: WellnessGoal[];
  preferences: WellnessPreferences;
  riskFactors: RiskFactor[];
  lastAssessment: Date;
  emergencyContact: EmergencyContact;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WellnessGoal {
  id: string;
  type: 'stress_reduction' | 'sleep_improvement' | 'physical_activity' | 'mental_health' | 'work_life_balance';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  milestones: Milestone[];
  isActive: boolean;
}

export interface Milestone {
  id: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface WellnessPreferences {
  communicationStyle: 'encouraging' | 'direct' | 'gentle' | 'motivational';
  preferredContactTime: string[];
  reminderFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  privacyLevel: 'high' | 'medium' | 'low';
  supportTypes: string[];
  resourceFormats: string[];
}

export interface RiskFactor {
  type: 'depression' | 'anxiety' | 'substance_abuse' | 'isolation' | 'financial_stress' | 'family_issues';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  identified: Date;
  notes: string;
  interventions: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface MentalHealthAssessment {
  id: string;
  driverId: number;
  assessmentType: 'daily_checkin' | 'weekly_assessment' | 'crisis_screening' | 'annual_review';
  responses: AssessmentResponse[];
  totalScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: WellnessRecommendation[];
  followUpRequired: boolean;
  followUpDate?: Date;
  completedAt: Date;
}

export interface AssessmentResponse {
  questionId: string;
  question: string;
  response: string | number;
  weight: number;
}

export interface WellnessRecommendation {
  type: 'resource' | 'activity' | 'professional_help' | 'crisis_intervention';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedBenefit: number;
  timeToComplete: number;
  resourceId?: string;
}

export interface WellnessResource {
  id: string;
  title: string;
  category: 'stress_management' | 'sleep_hygiene' | 'mental_health' | 'physical_wellness' | 'family_support';
  type: 'article' | 'video' | 'audio' | 'exercise' | 'meditation' | 'workshop';
  content: ResourceContent;
  targetAudience: string[];
  effectiveness: number; // 0-10
  duration: number; // minutes
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceContent {
  summary: string;
  keyPoints: string[];
  instructions?: string[];
  audioUrl?: string;
  videoUrl?: string;
  transcript?: string;
  materials?: string[];
}

export interface WellnessPlan {
  id: string;
  driverId: number;
  planName: string;
  goals: WellnessGoal[];
  activities: PlannedActivity[];
  schedule: ActivitySchedule;
  duration: number; // days
  progress: PlanProgress;
  adaptations: PlanAdaptation[];
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export interface PlannedActivity {
  id: string;
  type: 'exercise' | 'meditation' | 'breathing' | 'stretching' | 'journaling' | 'social_connection';
  title: string;
  description: string;
  duration: number;
  frequency: string;
  instructions: string[];
  benefits: string[];
}

export interface ActivitySchedule {
  daily: ScheduledActivity[];
  weekly: ScheduledActivity[];
  monthly: ScheduledActivity[];
  flexible: ScheduledActivity[];
}

export interface ScheduledActivity {
  activityId: string;
  preferredTime: string;
  duration: number;
  reminders: boolean;
  adaptable: boolean;
}

export interface PlanProgress {
  overallCompletion: number; // 0-100
  goalProgress: { [goalId: string]: number };
  activityCompletion: { [activityId: string]: number };
  streaks: { [activityId: string]: number };
  lastActivity: Date;
}

export interface PlanAdaptation {
  date: Date;
  reason: string;
  changes: string[];
  effectiveness: number;
  driverFeedback?: string;
}

export interface CrisisSupport {
  id: string;
  driverId: number;
  triggerEvent: string;
  riskLevel: 'moderate' | 'high' | 'critical';
  interventionType: 'automated_checkin' | 'counselor_contact' | 'emergency_services';
  status: 'active' | 'resolved' | 'escalated';
  supportActions: SupportAction[];
  outcome?: string;
  followUpPlan?: FollowUpPlan;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface SupportAction {
  timestamp: Date;
  actionType: string;
  description: string;
  performer: string;
  result: string;
  nextSteps?: string[];
}

export interface FollowUpPlan {
  checkInSchedule: string[];
  resources: string[];
  professionalSupport: boolean;
  escalationTriggers: string[];
  supportTeam: string[];
}

export class PersonalizedWellnessSystem {
  private wellnessProfiles: Map<number, WellnessProfile> = new Map();
  private assessments: Map<string, MentalHealthAssessment> = new Map();
  private resources: Map<string, WellnessResource> = new Map();
  private wellnessPlans: Map<string, WellnessPlan> = new Map();
  private crisisSupport: Map<string, CrisisSupport> = new Map();

  constructor() {
    this.initializeWellnessSystem();
    this.startContinuousMonitoring();
  }

  private initializeWellnessSystem() {
    // Initialize comprehensive wellness resources
    this.createInitialResources();
    this.setupAssessmentTemplates();
  }

  private createInitialResources() {
    const stressManagementResource: WellnessResource = {
      id: "stress-001",
      title: "5-Minute Stress Relief for Drivers",
      category: "stress_management",
      type: "exercise",
      content: {
        summary: "Quick stress relief techniques designed specifically for truck drivers",
        keyPoints: [
          "Progressive muscle relaxation",
          "Deep breathing exercises",
          "Mindful observation techniques",
          "Quick meditation practices"
        ],
        instructions: [
          "Find a safe place to park",
          "Turn off engine and sit comfortably",
          "Close eyes and take 5 deep breaths",
          "Tense and release each muscle group",
          "Focus on positive affirmations"
        ]
      },
      targetAudience: ["all_drivers", "high_stress", "long_haul"],
      effectiveness: 8.5,
      duration: 5,
      tags: ["stress", "quick", "parking", "breathing"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sleepHygieneResource: WellnessResource = {
      id: "sleep-001",
      title: "Better Sleep in Your Cab",
      category: "sleep_hygiene",
      type: "article",
      content: {
        summary: "Comprehensive guide to improving sleep quality while on the road",
        keyPoints: [
          "Optimal cab temperature settings",
          "Light management techniques",
          "Pre-sleep routines for truckers",
          "Noise reduction strategies"
        ],
        instructions: [
          "Set cab temperature to 65-68°F",
          "Use blackout curtains or eye mask",
          "Avoid screens 1 hour before sleep",
          "Practice relaxation routine",
          "Keep consistent sleep schedule"
        ]
      },
      targetAudience: ["all_drivers", "sleep_issues", "irregular_schedule"],
      effectiveness: 9.2,
      duration: 15,
      tags: ["sleep", "cab", "routine", "temperature"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mentalHealthResource: WellnessResource = {
      id: "mental-001",
      title: "Mental Health Check-in for Road Warriors",
      category: "mental_health",
      type: "meditation",
      content: {
        summary: "Daily mental health practices for maintaining emotional well-being",
        keyPoints: [
          "Emotional awareness techniques",
          "Coping strategies for isolation",
          "Building resilience on the road",
          "When to seek professional help"
        ],
        instructions: [
          "Start with 2-minute daily check-ins",
          "Identify current emotions",
          "Practice self-compassion",
          "Connect with support network",
          "Use grounding techniques"
        ]
      },
      targetAudience: ["all_drivers", "mental_health_focus", "isolation_risk"],
      effectiveness: 8.8,
      duration: 10,
      tags: ["mental_health", "emotions", "coping", "resilience"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.resources.set(stressManagementResource.id, stressManagementResource);
    this.resources.set(sleepHygieneResource.id, sleepHygieneResource);
    this.resources.set(mentalHealthResource.id, mentalHealthResource);
  }

  private setupAssessmentTemplates() {
    // Assessment templates are configured for different check-in types
  }

  private startContinuousMonitoring() {
    // Monitor wellness metrics and trigger interventions
    setInterval(() => {
      this.checkWellnessAlerts();
      this.updateRiskAssessments();
      this.adaptWellnessPlans();
    }, 15 * 60 * 1000); // Every 15 minutes
  }

  private checkWellnessAlerts() {
    for (const profile of this.wellnessProfiles.values()) {
      if (profile.stressLevel >= 8 || profile.fatigueLevel >= 9) {
        this.triggerWellnessIntervention(profile.driverId, 'high_stress_fatigue');
      }
      
      if (profile.mentalHealthScore <= 30) {
        this.triggerWellnessIntervention(profile.driverId, 'low_mental_health');
      }
    }
  }

  private updateRiskAssessments() {
    // Update risk assessments based on recent data
  }

  private adaptWellnessPlans() {
    // AI-driven adaptation of wellness plans based on progress
  }

  async createWellnessProfile(driverId: number, initialData: Partial<WellnessProfile>): Promise<WellnessProfile> {
    const profile: WellnessProfile = {
      id: this.generateProfileId(),
      driverId,
      mentalHealthScore: initialData.mentalHealthScore || 70,
      stressLevel: initialData.stressLevel || 3,
      fatigueLevel: initialData.fatigueLevel || 3,
      sleepQuality: initialData.sleepQuality || 6,
      personalGoals: initialData.personalGoals || [],
      preferences: initialData.preferences || this.getDefaultPreferences(),
      riskFactors: initialData.riskFactors || [],
      lastAssessment: new Date(),
      emergencyContact: initialData.emergencyContact || this.getDefaultEmergencyContact(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.wellnessProfiles.set(driverId, profile);
    
    // Create initial wellness plan
    await this.createPersonalizedWellnessPlan(driverId);
    
    return profile;
  }

  async conductMentalHealthAssessment(driverId: number, assessmentType: MentalHealthAssessment['assessmentType']): Promise<MentalHealthAssessment> {
    const questions = this.getAssessmentQuestions(assessmentType);
    
    // Simulate assessment responses (in real implementation, these would come from user input)
    const responses: AssessmentResponse[] = questions.map(q => ({
      questionId: q.id,
      question: q.text,
      response: this.simulateResponse(q),
      weight: q.weight
    }));

    const totalScore = this.calculateAssessmentScore(responses);
    const riskLevel = this.determineRiskLevel(totalScore, assessmentType);
    const recommendations = await this.generateRecommendations(driverId, responses, riskLevel);

    const assessment: MentalHealthAssessment = {
      id: this.generateAssessmentId(),
      driverId,
      assessmentType,
      responses,
      totalScore,
      riskLevel,
      recommendations,
      followUpRequired: riskLevel === 'high' || riskLevel === 'critical',
      followUpDate: riskLevel === 'high' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
      completedAt: new Date()
    };

    this.assessments.set(assessment.id, assessment);

    // Update wellness profile
    const profile = this.wellnessProfiles.get(driverId);
    if (profile) {
      profile.mentalHealthScore = totalScore;
      profile.lastAssessment = new Date();
      profile.updatedAt = new Date();
    }

    // Trigger crisis support if needed
    if (riskLevel === 'critical') {
      await this.triggerCrisisSupport(driverId, 'critical_assessment_score');
    }

    return assessment;
  }

  async createPersonalizedWellnessPlan(driverId: number): Promise<WellnessPlan> {
    const profile = this.wellnessProfiles.get(driverId);
    if (!profile) {
      throw new Error('Wellness profile not found');
    }

    const aiGeneratedPlan = await this.generateAIWellnessPlan(profile);

    const plan: WellnessPlan = {
      id: this.generatePlanId(),
      driverId,
      planName: aiGeneratedPlan.name,
      goals: aiGeneratedPlan.goals,
      activities: aiGeneratedPlan.activities,
      schedule: aiGeneratedPlan.schedule,
      duration: aiGeneratedPlan.duration,
      progress: {
        overallCompletion: 0,
        goalProgress: {},
        activityCompletion: {},
        streaks: {},
        lastActivity: new Date()
      },
      adaptations: [],
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + aiGeneratedPlan.duration * 24 * 60 * 60 * 1000),
      lastUpdated: new Date()
    };

    this.wellnessPlans.set(plan.id, plan);
    return plan;
  }

  private async generateAIWellnessPlan(profile: WellnessProfile) {
    try {
      const prompt = `Create a personalized wellness plan for a truck driver with the following profile:
      - Mental Health Score: ${profile.mentalHealthScore}/100
      - Stress Level: ${profile.stressLevel}/10
      - Fatigue Level: ${profile.fatigueLevel}/10
      - Sleep Quality: ${profile.sleepQuality}/10
      - Risk Factors: ${profile.riskFactors.map(rf => rf.type).join(', ')}
      - Communication Style: ${profile.preferences.communicationStyle}
      
      Create a comprehensive 30-day wellness plan with specific goals, activities, and schedule. Format as JSON with name, goals, activities, schedule, and duration.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a wellness expert specializing in mental health support for truck drivers. Create practical, road-friendly wellness plans."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      // Fallback plan if AI generation fails
      return this.getDefaultWellnessPlan(profile);
    }
  }

  private getDefaultWellnessPlan(profile: WellnessProfile) {
    return {
      name: "Road Warrior Wellness Plan",
      duration: 30,
      goals: [
        {
          id: "goal-001",
          type: "stress_reduction",
          title: "Reduce Daily Stress",
          description: "Lower stress levels through daily mindfulness",
          targetValue: Math.max(1, profile.stressLevel - 2),
          currentValue: profile.stressLevel,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          priority: "high",
          milestones: [],
          isActive: true
        }
      ],
      activities: [
        {
          id: "activity-001",
          type: "breathing",
          title: "Daily Deep Breathing",
          description: "5-minute breathing exercise",
          duration: 5,
          frequency: "daily",
          instructions: ["Find safe parking", "Close eyes", "Breathe deeply"],
          benefits: ["Reduces stress", "Improves focus"]
        }
      ],
      schedule: {
        daily: [
          {
            activityId: "activity-001",
            preferredTime: "morning",
            duration: 5,
            reminders: true,
            adaptable: true
          }
        ],
        weekly: [],
        monthly: [],
        flexible: []
      }
    };
  }

  async triggerCrisisSupport(driverId: number, triggerEvent: string): Promise<CrisisSupport> {
    const profile = this.wellnessProfiles.get(driverId);
    if (!profile) {
      throw new Error('Wellness profile not found');
    }

    const riskLevel = this.assessCrisisRiskLevel(profile, triggerEvent);
    const interventionType = this.determineInterventionType(riskLevel);

    const crisis: CrisisSupport = {
      id: this.generateCrisisId(),
      driverId,
      triggerEvent,
      riskLevel,
      interventionType,
      status: 'active',
      supportActions: [
        {
          timestamp: new Date(),
          actionType: 'automated_detection',
          description: `Crisis support triggered by: ${triggerEvent}`,
          performer: 'system',
          result: 'Support initiated',
          nextSteps: ['Immediate check-in', 'Resource provision', 'Escalation if needed']
        }
      ],
      createdAt: new Date()
    };

    this.crisisSupport.set(crisis.id, crisis);

    // Execute immediate intervention
    await this.executeCrisisIntervention(crisis);

    return crisis;
  }

  private async executeCrisisIntervention(crisis: CrisisSupport) {
    switch (crisis.interventionType) {
      case 'automated_checkin':
        await this.performAutomatedCheckin(crisis.driverId);
        break;
      case 'counselor_contact':
        await this.contactCounselor(crisis.driverId);
        break;
      case 'emergency_services':
        await this.contactEmergencyServices(crisis.driverId);
        break;
    }
  }

  private async performAutomatedCheckin(driverId: number) {
    // Implement automated check-in logic
  }

  private async contactCounselor(driverId: number) {
    // Implement counselor contact logic
  }

  private async contactEmergencyServices(driverId: number) {
    // Implement emergency services contact logic
  }

  private triggerWellnessIntervention(driverId: number, reason: string) {
    // Trigger appropriate wellness intervention based on reason
  }

  private getAssessmentQuestions(type: string) {
    const questions = {
      daily_checkin: [
        { id: 'stress', text: 'How stressed do you feel today?', weight: 1 },
        { id: 'fatigue', text: 'How tired are you feeling?', weight: 1 },
        { id: 'mood', text: 'How would you rate your mood?', weight: 1 }
      ],
      weekly_assessment: [
        { id: 'stress', text: 'Average stress level this week?', weight: 2 },
        { id: 'sleep', text: 'How well have you been sleeping?', weight: 2 },
        { id: 'social', text: 'How connected do you feel to others?', weight: 1 }
      ]
    };
    return questions[type] || questions.daily_checkin;
  }

  private simulateResponse(question: any): number {
    // Simulate realistic responses based on question type
    return Math.floor(Math.random() * 10) + 1;
  }

  private calculateAssessmentScore(responses: AssessmentResponse[]): number {
    const totalWeight = responses.reduce((sum, r) => sum + r.weight, 0);
    const weightedSum = responses.reduce((sum, r) => sum + (Number(r.response) * r.weight), 0);
    return Math.round((weightedSum / totalWeight) * 10);
  }

  private determineRiskLevel(score: number, type: string): 'low' | 'moderate' | 'high' | 'critical' {
    if (score <= 3) return 'critical';
    if (score <= 5) return 'high';
    if (score <= 7) return 'moderate';
    return 'low';
  }

  private async generateRecommendations(driverId: number, responses: AssessmentResponse[], riskLevel: string): Promise<WellnessRecommendation[]> {
    const recommendations: WellnessRecommendation[] = [];

    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push({
        type: 'crisis_intervention',
        title: 'Immediate Support Available',
        description: 'Connect with mental health professional immediately',
        priority: 'urgent',
        estimatedBenefit: 95,
        timeToComplete: 30
      });
    }

    recommendations.push({
      type: 'resource',
      title: 'Stress Management Techniques',
      description: 'Quick stress relief exercises for drivers',
      priority: 'high',
      estimatedBenefit: 80,
      timeToComplete: 5,
      resourceId: 'stress-001'
    });

    return recommendations;
  }

  private assessCrisisRiskLevel(profile: WellnessProfile, trigger: string): 'moderate' | 'high' | 'critical' {
    if (profile.mentalHealthScore <= 20 || trigger.includes('critical')) return 'critical';
    if (profile.mentalHealthScore <= 40 || profile.stressLevel >= 9) return 'high';
    return 'moderate';
  }

  private determineInterventionType(riskLevel: string): CrisisSupport['interventionType'] {
    switch (riskLevel) {
      case 'critical': return 'emergency_services';
      case 'high': return 'counselor_contact';
      default: return 'automated_checkin';
    }
  }

  private getDefaultPreferences(): WellnessPreferences {
    return {
      communicationStyle: 'encouraging',
      preferredContactTime: ['morning', 'evening'],
      reminderFrequency: 'daily',
      privacyLevel: 'medium',
      supportTypes: ['self_help', 'peer_support'],
      resourceFormats: ['audio', 'text']
    };
  }

  private getDefaultEmergencyContact(): EmergencyContact {
    return {
      name: 'Family Member',
      relationship: 'spouse',
      phone: '555-0000',
      isPrimary: true
    };
  }

  private generateProfileId(): string {
    return `wellness-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAssessmentId(): string {
    return `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePlanId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCrisisId(): string {
    return `crisis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  getWellnessProfile(driverId: number): WellnessProfile | undefined {
    return this.wellnessProfiles.get(driverId);
  }

  getAllWellnessProfiles(): WellnessProfile[] {
    return Array.from(this.wellnessProfiles.values());
  }

  getAssessment(assessmentId: string): MentalHealthAssessment | undefined {
    return this.assessments.get(assessmentId);
  }

  getDriverAssessments(driverId: number): MentalHealthAssessment[] {
    return Array.from(this.assessments.values()).filter(a => a.driverId === driverId);
  }

  getWellnessResources(category?: string): WellnessResource[] {
    const resources = Array.from(this.resources.values()).filter(r => r.isActive);
    return category ? resources.filter(r => r.category === category) : resources;
  }

  getWellnessPlan(planId: string): WellnessPlan | undefined {
    return this.wellnessPlans.get(planId);
  }

  getDriverWellnessPlans(driverId: number): WellnessPlan[] {
    return Array.from(this.wellnessPlans.values()).filter(p => p.driverId === driverId && p.isActive);
  }

  getCrisisSupport(crisisId: string): CrisisSupport | undefined {
    return this.crisisSupport.get(crisisId);
  }

  getDriverCrisisHistory(driverId: number): CrisisSupport[] {
    return Array.from(this.crisisSupport.values()).filter(c => c.driverId === driverId);
  }
}

export const personalizedWellnessSystem = new PersonalizedWellnessSystem();