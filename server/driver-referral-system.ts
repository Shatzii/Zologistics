export interface DriverReferral {
  id: string;
  referrerId: number; // Referring driver ID
  referrerName: string;
  refereeEmail: string;
  refereePhone?: string;
  refereeName?: string;
  referralCode: string;
  shareMethod: 'text' | 'email' | 'social' | 'qr_code' | 'direct_link';
  status: 'pending' | 'clicked' | 'signed_up' | 'active' | 'qualified' | 'rewarded';
  rewards: {
    referrerReward: number;
    refereeReward: number;
    milestone: string;
    qualificationPeriod: number; // days
  };
  tracking: {
    sharedAt: Date;
    clickedAt?: Date;
    signedUpAt?: Date;
    activatedAt?: Date;
    qualifiedAt?: Date;
    rewardedAt?: Date;
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    source?: string;
    campaign?: string;
  };
}

export interface ReferralReward {
  id: string;
  driverId: number;
  type: 'referral_bonus' | 'milestone_bonus' | 'loyalty_bonus';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'paid' | 'failed';
  referralId?: string;
  createdAt: Date;
  paidAt?: Date;
  paymentMethod: 'platform_credit' | 'direct_deposit' | 'check' | 'fuel_card';
}

export interface ReferralTier {
  name: string;
  minReferrals: number;
  bonusMultiplier: number;
  additionalRewards: string[];
  badgeColor: string;
}

export interface ShareableContent {
  type: 'text' | 'email' | 'social' | 'whatsapp';
  subject?: string;
  message: string;
  cta: string;
  hashtags?: string[];
  imageUrl?: string;
}

export class DriverReferralSystem {
  private referrals: Map<string, DriverReferral> = new Map();
  private rewards: Map<string, ReferralReward> = new Map();
  private referralCodes: Map<string, number> = new Map(); // code -> driverId
  private driverStats: Map<number, any> = new Map();

  private readonly referralTiers: ReferralTier[] = [
    {
      name: 'Rookie Recruiter',
      minReferrals: 1,
      bonusMultiplier: 1.0,
      additionalRewards: ['Digital badge'],
      badgeColor: '#22c55e'
    },
    {
      name: 'Driver Advocate',
      minReferrals: 5,
      bonusMultiplier: 1.2,
      additionalRewards: ['Premium features for 3 months', 'Priority support'],
      badgeColor: '#3b82f6'
    },
    {
      name: 'Network Builder',
      minReferrals: 15,
      bonusMultiplier: 1.5,
      additionalRewards: ['Annual platform subscription', 'Exclusive merchandise'],
      badgeColor: '#8b5cf6'
    },
    {
      name: 'Super Ambassador',
      minReferrals: 30,
      bonusMultiplier: 2.0,
      additionalRewards: ['Revenue sharing program', 'Co-marketing opportunities'],
      badgeColor: '#f59e0b'
    }
  ];

  constructor() {
    this.initializeReferralSystem();
    this.startRewardProcessing();
  }

  private initializeReferralSystem() {
    // Generate initial referral codes for existing drivers
    for (let i = 1; i <= 10; i++) {
      const code = this.generateReferralCode(`Driver${i}`);
      this.referralCodes.set(code, i);
      this.driverStats.set(i, {
        totalReferrals: 0,
        qualifiedReferrals: 0,
        totalRewards: 0,
        currentTier: this.referralTiers[0],
        joinDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      });
    }

    // Create some sample referrals for demonstration
    this.createSampleReferrals();
  }

  private createSampleReferrals() {
    const sampleReferrals = [
      {
        referrerId: 1,
        referrerName: 'Mike Johnson',
        refereeEmail: 'sarah.newdriver@email.com',
        refereeName: 'Sarah Thompson',
        shareMethod: 'text' as const,
        status: 'qualified' as const
      },
      {
        referrerId: 1,
        referrerName: 'Mike Johnson', 
        refereeEmail: 'david.experienced@email.com',
        refereeName: 'David Rodriguez',
        shareMethod: 'email' as const,
        status: 'active' as const
      },
      {
        referrerId: 2,
        referrerName: 'Lisa Brown',
        refereeEmail: 'robert.owner@email.com',
        refereeName: 'Robert Wilson',
        shareMethod: 'social' as const,
        status: 'signed_up' as const
      }
    ];

    sampleReferrals.forEach(data => {
      const referral = this.createReferral(
        data.referrerId,
        data.referrerName,
        data.refereeEmail,
        data.refereeName,
        data.shareMethod
      );
      
      // Simulate progression
      if (data.status === 'qualified' || data.status === 'active') {
        referral.status = 'signed_up';
        referral.tracking.signedUpAt = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
        referral.tracking.activatedAt = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
        
        if (data.status === 'qualified') {
          referral.status = 'qualified';
          referral.tracking.qualifiedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
          this.processReward(referral);
        }
      }
    });
  }

  private generateReferralCode(driverName: string): string {
    const cleanName = driverName.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanName.substring(0, 4)}${random}`;
  }

  private startRewardProcessing() {
    setInterval(() => {
      this.processQualificationChecks();
    }, 60000); // Check every minute for demo
  }

  private processQualificationChecks() {
    for (const [id, referral] of this.referrals) {
      if (referral.status === 'active' && !referral.tracking.qualifiedAt) {
        const daysSinceActivation = referral.tracking.activatedAt 
          ? Math.floor((Date.now() - referral.tracking.activatedAt.getTime()) / (24 * 60 * 60 * 1000))
          : 0;

        if (daysSinceActivation >= referral.rewards.qualificationPeriod) {
          referral.status = 'qualified';
          referral.tracking.qualifiedAt = new Date();
          this.processReward(referral);
          console.log(`🎉 Referral ${id} qualified for rewards!`);
        }
      }
    }
  }

  private processReward(referral: DriverReferral) {
    // Create referrer reward
    const referrerReward: ReferralReward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      driverId: referral.referrerId,
      type: 'referral_bonus',
      amount: referral.rewards.referrerReward,
      description: `Referral bonus for bringing in ${referral.refereeName || referral.refereeEmail}`,
      status: 'approved',
      referralId: referral.id,
      createdAt: new Date(),
      paidAt: new Date(),
      paymentMethod: 'platform_credit'
    };

    this.rewards.set(referrerReward.id, referrerReward);

    // Update driver stats
    const stats = this.driverStats.get(referral.referrerId);
    if (stats) {
      stats.qualifiedReferrals += 1;
      stats.totalRewards += referral.rewards.referrerReward;
      stats.currentTier = this.calculateTier(stats.qualifiedReferrals);
    }

    referral.status = 'rewarded';
    referral.tracking.rewardedAt = new Date();

    console.log(`💰 Paid $${referral.rewards.referrerReward} to driver ${referral.referrerId} for referral`);
  }

  private calculateTier(referralCount: number): ReferralTier {
    for (let i = this.referralTiers.length - 1; i >= 0; i--) {
      if (referralCount >= this.referralTiers[i].minReferrals) {
        return this.referralTiers[i];
      }
    }
    return this.referralTiers[0];
  }

  // Public API methods
  public createReferral(
    referrerId: number,
    referrerName: string,
    refereeEmail: string,
    refereeName: string | undefined,
    shareMethod: 'text' | 'email' | 'social' | 'qr_code' | 'direct_link'
  ): DriverReferral {
    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const referralCode = Array.from(this.referralCodes.keys()).find(code => 
      this.referralCodes.get(code) === referrerId
    ) || this.generateReferralCode(referrerName);

    if (!this.referralCodes.has(referralCode)) {
      this.referralCodes.set(referralCode, referrerId);
    }

    const referral: DriverReferral = {
      id: referralId,
      referrerId,
      referrerName,
      refereeEmail,
      refereeName,
      referralCode,
      shareMethod,
      status: 'pending',
      rewards: {
        referrerReward: 500, // $500 for qualified referral
        refereeReward: 250,  // $250 signup bonus for referee
        milestone: '90 days active',
        qualificationPeriod: 7 // 7 days for demo (normally 90)
      },
      tracking: {
        sharedAt: new Date()
      },
      metadata: {}
    };

    this.referrals.set(referralId, referral);

    // Update referrer stats
    const stats = this.driverStats.get(referrerId);
    if (stats) {
      stats.totalReferrals += 1;
    }

    return referral;
  }

  public generateShareableContent(
    referralCode: string,
    type: 'text' | 'email' | 'social' | 'whatsapp'
  ): ShareableContent {
    const referralLink = `https://truckflow.ai/join?ref=${referralCode}`;
    
    const contentTemplates = {
      text: {
        message: `💰 Ready to earn more as a trucker? I'm using TruckFlow AI and making $2,400+ more per month with smart load matching! Join with my link and we both get paid: ${referralLink}`,
        cta: 'Tap to join and claim your $250 bonus!'
      },
      email: {
        subject: 'Boost Your Trucking Income with AI - $250 Signup Bonus Inside!',
        message: `Hey there!\n\nI wanted to share something that's been a game-changer for my trucking business. I've been using TruckFlow AI for load matching and route optimization, and I'm consistently making $2,400+ more per month.\n\nThe platform uses AI to:\n• Find the highest-paying loads in real-time\n• Optimize routes to reduce empty miles\n• Negotiate better rates automatically\n• Handle paperwork and payments\n\nIf you sign up with my referral link, you'll get a $250 signup bonus, and I'll get a referral reward too. It's a win-win!\n\nCheck it out: ${referralLink}\n\nLet me know if you have any questions. This technology is seriously changing how drivers make money.\n\nSafe travels!`,
        cta: 'Join TruckFlow AI - Claim $250 Bonus'
      },
      social: {
        message: `🚛💰 Fellow truckers! I'm making $2,400+ more per month with TruckFlow AI's smart load matching. The AI finds better loads, optimizes my routes, and handles the paperwork. Join with my link for a $250 bonus! ${referralLink} #TruckingLife #AITech #MoreMoney`,
        cta: 'Tap to earn more 💪',
        hashtags: ['#TruckingLife', '#AITech', '#MoreMoney', '#SmartTrucking']
      },
      whatsapp: {
        message: `🚛 Hey! You know how we're always talking about finding better loads and making more money trucking? I found this AI platform that's boosted my income by $2,400+ per month!\n\nTruckFlow AI finds the best loads, optimizes routes, and even negotiates rates. If you join with my link, you get $250 bonus and I get a referral reward.\n\nDefinitely worth checking out: ${referralLink}`,
        cta: 'Join for $250 bonus! 💰'
      }
    };

    return {
      type,
      ...contentTemplates[type]
    };
  }

  public trackReferralClick(referralCode: string, metadata: any): void {
    const referral = Array.from(this.referrals.values()).find(r => r.referralCode === referralCode);
    if (referral && referral.status === 'pending') {
      referral.status = 'clicked';
      referral.tracking.clickedAt = new Date();
      referral.metadata = { ...referral.metadata, ...metadata };
    }
  }

  public processReferralSignup(referralCode: string, newDriverId: number): void {
    const referral = Array.from(this.referrals.values()).find(r => r.referralCode === referralCode);
    if (referral && ['pending', 'clicked'].includes(referral.status)) {
      referral.status = 'signed_up';
      referral.tracking.signedUpAt = new Date();
      
      // Create referee reward
      const refereeReward: ReferralReward = {
        id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        driverId: newDriverId,
        type: 'referral_bonus',
        amount: referral.rewards.refereeReward,
        description: 'Signup bonus for joining through referral',
        status: 'approved',
        referralId: referral.id,
        createdAt: new Date(),
        paidAt: new Date(),
        paymentMethod: 'platform_credit'
      };

      this.rewards.set(refereeReward.id, refereeReward);
    }
  }

  public processDriverActivation(driverId: number): void {
    const referral = Array.from(this.referrals.values()).find(r => 
      r.status === 'signed_up' && !r.tracking.activatedAt
    );
    if (referral) {
      referral.status = 'active';
      referral.tracking.activatedAt = new Date();
    }
  }

  // API methods for frontend
  public getReferralsByDriver(driverId: number): DriverReferral[] {
    const referrals: DriverReferral[] = [];
    this.referrals.forEach(referral => {
      if (referral.referrerId === driverId) {
        referrals.push(referral);
      }
    });
    return referrals;
  }

  public getDriverStats(driverId: number): any {
    const stats = this.driverStats.get(driverId);
    const referrals = this.getReferralsByDriver(driverId);
    const rewards: ReferralReward[] = [];
    this.rewards.forEach(reward => {
      if (reward.driverId === driverId) {
        rewards.push(reward);
      }
    });

    return {
      ...stats,
      referrals,
      rewards,
      referralCode: Array.from(this.referralCodes.keys()).find(code => 
        this.referralCodes.get(code) === driverId
      )
    };
  }

  public getAllReferrals(): DriverReferral[] {
    const referrals: DriverReferral[] = [];
    this.referrals.forEach(referral => referrals.push(referral));
    return referrals;
  }

  public getReferralMetrics(): any {
    const allReferrals = this.getAllReferrals();
    const totalRewards = Array.from(this.rewards.values())
      .reduce((sum, reward) => sum + reward.amount, 0);

    return {
      totalReferrals: allReferrals.length,
      qualifiedReferrals: allReferrals.filter(r => r.status === 'qualified' || r.status === 'rewarded').length,
      pendingReferrals: allReferrals.filter(r => ['pending', 'clicked', 'signed_up', 'active'].includes(r.status)).length,
      totalRewardsPaid: totalRewards,
      averageTimeToQualification: this.calculateAverageQualificationTime(),
      topReferrers: this.getTopReferrers(),
      conversionRate: this.calculateConversionRate()
    };
  }

  private calculateAverageQualificationTime(): number {
    const qualifiedReferrals = Array.from(this.referrals.values())
      .filter(r => r.tracking.qualifiedAt && r.tracking.sharedAt);
    
    if (qualifiedReferrals.length === 0) return 0;

    const totalTime = qualifiedReferrals.reduce((sum, r) => {
      return sum + (r.tracking.qualifiedAt!.getTime() - r.tracking.sharedAt.getTime());
    }, 0);

    return Math.floor(totalTime / qualifiedReferrals.length / (24 * 60 * 60 * 1000)); // days
  }

  private getTopReferrers(): any[] {
    const referrerStats = new Map<number, any>();
    
    this.driverStats.forEach((stats, driverId) => {
      if (stats.qualifiedReferrals > 0) {
        referrerStats.set(driverId, {
          driverId,
          qualifiedReferrals: stats.qualifiedReferrals,
          totalRewards: stats.totalRewards,
          tier: stats.currentTier.name
        });
      }
    });

    return Array.from(referrerStats.values())
      .sort((a, b) => b.qualifiedReferrals - a.qualifiedReferrals)
      .slice(0, 10);
  }

  private calculateConversionRate(): number {
    const allReferrals = this.getAllReferrals();
    if (allReferrals.length === 0) return 0;

    const convertedReferrals = allReferrals.filter(r => 
      ['signed_up', 'active', 'qualified', 'rewarded'].includes(r.status)
    ).length;

    return Math.round((convertedReferrals / allReferrals.length) * 100);
  }

  public getReferralTiers(): ReferralTier[] {
    return this.referralTiers;
  }
}

export const driverReferralSystem = new DriverReferralSystem();