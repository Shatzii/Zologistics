// Personalized Load Matching & Adventure Load System
export interface DriverPreferences {
  driverId: number;
  homeLocation: { lat: number; lng: number; address: string };
  familyLocations: Array<{
    name: string;
    relationship: string;
    location: { lat: number; lng: number; address: string };
    priority: number;
  }>;
  interests: {
    photography: boolean;
    fishing: boolean;
    hiking: boolean;
    history: boolean;
    music: boolean;
    sports: boolean;
  };
  workPreferences: {
    maxDaysOut: number;
    preferredRegions: string[];
    avoidRegions: string[];
    scenicRoutesPreferred: boolean;
    weekendHomeRequired: boolean;
  };
  importantDates: Array<{
    date: Date;
    description: string;
    type: 'family_event' | 'holiday' | 'anniversary' | 'birthday';
    blockRadius: number; // days to block around this date
  }>;
}

export interface AdventureLoad {
  id: string;
  loadId: number;
  category: 'national_park' | 'festival' | 'sports_event' | 'historical_site' | 'scenic_route' | 'family_circuit';
  title: string;
  description: string;
  destination: string;
  specialFeatures: string[];
  bonusPayment: number;
  experienceRating: number;
  photographyOpportunity: boolean;
  familyFriendly: boolean;
  seasonalOptimal: string[];
  coordinates: { lat: number; lng: number };
  nearbyAttractions: string[];
  estimatedExtraTime: number; // hours for sightseeing
  requiredEquipment?: string[];
}

export interface PersonalizedRoute {
  routeId: string;
  driverId: number;
  loadIds: number[];
  familyVisits: Array<{
    familyMemberId: string;
    estimatedVisitTime: Date;
    duration: number; // hours
  }>;
  adventureStops: Array<{
    adventureLoadId: string;
    location: string;
    activity: string;
    recommendedDuration: number;
  }>;
  scenicHighlights: string[];
  totalPersonalizationScore: number;
  estimatedHappinessBonus: number;
}

export interface LifestyleLoad {
  id: string;
  type: 'education' | 'volunteer' | 'hobby_event' | 'cultural' | 'wellness';
  title: string;
  location: string;
  opportunity: string;
  timeCommitment: number;
  personalGrowthValue: number;
  networkingPotential: number;
  skillDevelopment: string[];
  certificationAvailable: boolean;
}

export class PersonalizedLoadSystem {
  private driverPreferences: Map<number, DriverPreferences> = new Map();
  private adventureLoads: Map<string, AdventureLoad> = new Map();
  private personalizedRoutes: Map<string, PersonalizedRoute> = new Map();
  private lifestyleLoads: Map<string, LifestyleLoad> = new Map();

  constructor() {
    this.initializeAdventureLoads();
    this.initializeDriverPreferences();
    this.startPersonalizationEngine();
  }

  private initializeAdventureLoads() {
    const adventureLoads: AdventureLoad[] = [
      {
        id: 'adv_yellowstone_001',
        loadId: 1001,
        category: 'national_park',
        title: 'Yellowstone National Park Delivery',
        description: 'Deliver supplies to Yellowstone visitor center with 2-day park access included',
        destination: 'Yellowstone National Park, WY',
        specialFeatures: ['Geyser viewing', 'Wildlife photography', 'Hot springs access'],
        bonusPayment: 500,
        experienceRating: 9.8,
        photographyOpportunity: true,
        familyFriendly: true,
        seasonalOptimal: ['spring', 'summer', 'fall'],
        coordinates: { lat: 44.4280, lng: -110.5885 },
        nearbyAttractions: ['Old Faithful', 'Grand Prismatic Spring', 'Mammoth Hot Springs'],
        estimatedExtraTime: 16,
        requiredEquipment: ['Camera mount', 'Bear spray']
      },
      {
        id: 'adv_coachella_001',
        loadId: 1002,
        category: 'festival',
        title: 'Coachella Music Festival Logistics',
        description: 'Stage equipment delivery with VIP festival access for driver',
        destination: 'Indio, CA',
        specialFeatures: ['VIP festival access', 'Artist meet & greet', 'Premium camping'],
        bonusPayment: 800,
        experienceRating: 9.5,
        photographyOpportunity: true,
        familyFriendly: false,
        seasonalOptimal: ['spring'],
        coordinates: { lat: 33.6803, lng: -116.2378 },
        nearbyAttractions: ['Palm Springs', 'Joshua Tree National Park', 'Salton Sea'],
        estimatedExtraTime: 48
      },
      {
        id: 'adv_superbowl_001',
        loadId: 1003,
        category: 'sports_event',
        title: 'Super Bowl Equipment Transport',
        description: 'Official NFL equipment delivery with game tickets included',
        destination: 'Las Vegas, NV',
        specialFeatures: ['Game tickets', 'Player autograph session', 'Stadium tour'],
        bonusPayment: 1200,
        experienceRating: 10.0,
        photographyOpportunity: true,
        familyFriendly: true,
        seasonalOptimal: ['winter'],
        coordinates: { lat: 36.0909, lng: -115.1761 },
        nearbyAttractions: ['Las Vegas Strip', 'Hoover Dam', 'Red Rock Canyon'],
        estimatedExtraTime: 24
      },
      {
        id: 'adv_civil_rights_001',
        loadId: 1004,
        category: 'historical_site',
        title: 'Civil Rights Museum Delivery',
        description: 'Historical artifact transport with museum curator-led private tour',
        destination: 'Birmingham, AL',
        specialFeatures: ['Private museum tour', 'Historical education', 'Curator meeting'],
        bonusPayment: 300,
        experienceRating: 8.7,
        photographyOpportunity: true,
        familyFriendly: true,
        seasonalOptimal: ['all'],
        coordinates: { lat: 33.5186, lng: -86.8104 },
        nearbyAttractions: ['16th Street Baptist Church', 'Kelly Ingram Park', 'Vulcan Park'],
        estimatedExtraTime: 8
      }
    ];

    adventureLoads.forEach(load => this.adventureLoads.set(load.id, load));

    // Initialize lifestyle loads
    const lifestyleLoads: LifestyleLoad[] = [
      {
        id: 'life_university_001',
        type: 'education',
        title: 'University Delivery with Audit Opportunity',
        location: 'Stanford University, CA',
        opportunity: 'Audit business management course during delivery window',
        timeCommitment: 6,
        personalGrowthValue: 9,
        networkingPotential: 8,
        skillDevelopment: ['Business Management', 'Leadership', 'Strategic Planning'],
        certificationAvailable: true
      },
      {
        id: 'life_habitat_001',
        type: 'volunteer',
        title: 'Habitat for Humanity Build',
        location: 'Austin, TX',
        opportunity: 'Join home construction project during 34-hour reset',
        timeCommitment: 16,
        personalGrowthValue: 8,
        networkingPotential: 7,
        skillDevelopment: ['Construction', 'Teamwork', 'Community Service'],
        certificationAvailable: false
      }
    ];

    lifestyleLoads.forEach(load => this.lifestyleLoads.set(load.id, load));
  }

  private initializeDriverPreferences() {
    const samplePrefs: DriverPreferences = {
      driverId: 1,
      homeLocation: {
        lat: 39.7392,
        lng: -104.9903,
        address: 'Denver, CO'
      },
      familyLocations: [
        {
          name: 'Sarah (Wife)',
          relationship: 'spouse',
          location: { lat: 39.7392, lng: -104.9903, address: 'Denver, CO' },
          priority: 10
        },
        {
          name: 'Mom & Dad',
          relationship: 'parents',
          location: { lat: 41.2524, lng: -95.9980, address: 'Omaha, NE' },
          priority: 8
        },
        {
          name: 'Brother Mike',
          relationship: 'sibling',
          location: { lat: 47.0379, lng: -122.9007, address: 'Olympia, WA' },
          priority: 6
        }
      ],
      interests: {
        photography: true,
        fishing: true,
        hiking: true,
        history: false,
        music: true,
        sports: true
      },
      workPreferences: {
        maxDaysOut: 14,
        preferredRegions: ['West Coast', 'Mountain States', 'Southwest'],
        avoidRegions: ['Northeast Winter', 'Hurricane Zones'],
        scenicRoutesPreferred: true,
        weekendHomeRequired: true
      },
      importantDates: [
        {
          date: new Date('2024-07-15'),
          description: 'Anniversary',
          type: 'anniversary',
          blockRadius: 3
        },
        {
          date: new Date('2024-09-22'),
          description: 'Son\'s Birthday',
          type: 'birthday',
          blockRadius: 2
        },
        {
          date: new Date('2024-12-25'),
          description: 'Christmas',
          type: 'holiday',
          blockRadius: 5
        }
      ]
    };

    this.driverPreferences.set(1, samplePrefs);
  }

  private startPersonalizationEngine() {
    setInterval(() => {
      this.generatePersonalizedRoutes();
      this.updateAdventureOpportunities();
    }, 60000); // Every minute
  }

  private generatePersonalizedRoutes() {
    for (const [driverId, prefs] of this.driverPreferences) {
      const route = this.createOptimalPersonalizedRoute(driverId, prefs);
      if (route) {
        this.personalizedRoutes.set(route.routeId, route);
      }
    }
  }

  private createOptimalPersonalizedRoute(driverId: number, prefs: DriverPreferences): PersonalizedRoute {
    // Calculate family visit opportunities
    const familyVisits = prefs.familyLocations
      .filter(family => family.priority >= 7)
      .map(family => ({
        familyMemberId: family.name,
        estimatedVisitTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        duration: family.priority >= 9 ? 8 : 4
      }));

    // Find matching adventure stops
    const adventureStops = Array.from(this.adventureLoads.values())
      .filter(load => this.matchesDriverInterests(load, prefs))
      .slice(0, 2)
      .map(load => ({
        adventureLoadId: load.id,
        location: load.destination,
        activity: load.title,
        recommendedDuration: load.estimatedExtraTime
      }));

    const route: PersonalizedRoute = {
      routeId: `route_${Date.now()}_${driverId}`,
      driverId,
      loadIds: [1001, 1002, 1003],
      familyVisits,
      adventureStops,
      scenicHighlights: prefs.workPreferences.scenicRoutesPreferred ? 
        ['Rocky Mountain National Park', 'Pacific Coast Highway', 'Blue Ridge Parkway'] : [],
      totalPersonalizationScore: this.calculatePersonalizationScore(familyVisits, adventureStops, prefs),
      estimatedHappinessBonus: familyVisits.length * 20 + adventureStops.length * 30
    };

    return route;
  }

  private matchesDriverInterests(load: AdventureLoad, prefs: DriverPreferences): boolean {
    if (load.category === 'national_park' && (prefs.interests.photography || prefs.interests.hiking)) return true;
    if (load.category === 'festival' && prefs.interests.music) return true;
    if (load.category === 'sports_event' && prefs.interests.sports) return true;
    if (load.category === 'historical_site' && prefs.interests.history) return true;
    return false;
  }

  private calculatePersonalizationScore(
    familyVisits: PersonalizedRoute['familyVisits'],
    adventureStops: PersonalizedRoute['adventureStops'],
    prefs: DriverPreferences
  ): number {
    let score = 0;
    score += familyVisits.length * 25;
    score += adventureStops.length * 20;
    score += prefs.workPreferences.scenicRoutesPreferred ? 15 : 0;
    return Math.min(score, 100);
  }

  private updateAdventureOpportunities() {
    // Simulate real-time adventure load updates
    const currentSeason = this.getCurrentSeason();
    for (const [id, load] of this.adventureLoads) {
      if (load.seasonalOptimal.includes(currentSeason) || load.seasonalOptimal.includes('all')) {
        load.bonusPayment *= 1.1; // 10% seasonal bonus
      }
    }
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  async getPersonalizedLoads(driverId: number): Promise<{
    adventureLoads: AdventureLoad[];
    personalizedRoute: PersonalizedRoute | null;
    lifestyleOpportunities: LifestyleLoad[];
    familyVisitScore: number;
  }> {
    const prefs = this.driverPreferences.get(driverId);
    if (!prefs) {
      return {
        adventureLoads: [],
        personalizedRoute: null,
        lifestyleOpportunities: [],
        familyVisitScore: 0
      };
    }

    const matchingAdventures = Array.from(this.adventureLoads.values())
      .filter(load => this.matchesDriverInterests(load, prefs))
      .sort((a, b) => b.experienceRating - a.experienceRating);

    const currentRoute = Array.from(this.personalizedRoutes.values())
      .find(route => route.driverId === driverId);

    const lifestyleOpportunities = Array.from(this.lifestyleLoads.values())
      .slice(0, 3);

    const familyVisitScore = prefs.familyLocations
      .reduce((score, family) => score + family.priority, 0);

    return {
      adventureLoads: matchingAdventures,
      personalizedRoute: currentRoute || null,
      lifestyleOpportunities,
      familyVisitScore
    };
  }

  async updateDriverPreferences(driverId: number, newPrefs: Partial<DriverPreferences>): Promise<boolean> {
    const existing = this.driverPreferences.get(driverId);
    if (existing) {
      Object.assign(existing, newPrefs);
      this.generatePersonalizedRoutes(); // Regenerate routes with new preferences
      return true;
    }
    return false;
  }

  async getAdventureLoad(adventureId: string): Promise<AdventureLoad | null> {
    return this.adventureLoads.get(adventureId) || null;
  }

  async getAvailableAdventureLoads(): Promise<AdventureLoad[]> {
    return Array.from(this.adventureLoads.values())
      .sort((a, b) => b.experienceRating - a.experienceRating);
  }

  async calculateRoutePersonalization(routeId: string): Promise<{
    personalizationScore: number;
    familyBenefits: string[];
    adventureBenefits: string[];
    lifestyleBenefits: string[];
    estimatedSatisfaction: number;
  }> {
    const route = this.personalizedRoutes.get(routeId);
    if (!route) {
      return {
        personalizationScore: 0,
        familyBenefits: [],
        adventureBenefits: [],
        lifestyleBenefits: [],
        estimatedSatisfaction: 0
      };
    }

    const familyBenefits = route.familyVisits.map(visit => 
      `Visit ${visit.familyMemberId} for ${visit.duration} hours`
    );

    const adventureBenefits = route.adventureStops.map(stop => 
      `Experience ${stop.activity} at ${stop.location}`
    );

    const lifestyleBenefits = [
      'Scenic route photography opportunities',
      'Local culture exploration',
      'Personal time for hobbies'
    ];

    return {
      personalizationScore: route.totalPersonalizationScore,
      familyBenefits,
      adventureBenefits,
      lifestyleBenefits,
      estimatedSatisfaction: Math.min(route.estimatedHappinessBonus, 100)
    };
  }
}

export const personalizedLoadSystem = new PersonalizedLoadSystem();