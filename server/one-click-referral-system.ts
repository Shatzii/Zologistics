export interface OneClickReferral {
  id: string;
  referrerId: number;
  referrerName: string;
  referralCode: string;
  shareMethod: 'sms' | 'email' | 'whatsapp' | 'social' | 'qr_code' | 'direct_link';
  sharedAt: Date;
  clicks: number;
  conversions: number;
  signups: number;
  status: 'active' | 'paused' | 'expired' | 'completed';
  rewardTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  instantRewards: InstantReward[];
  shareableContent: ShareableContent;
  trackingMetrics: TrackingMetrics;
  expiresAt: Date;
}

export interface InstantReward {
  id: string;
  type: 'cash_bonus' | 'fuel_credit' | 'load_priority' | 'commission_boost' | 'equipment_discount';
  amount: number;
  currency: 'USD' | 'points';
  triggeredBy: 'click' | 'signup' | 'first_load' | 'milestone' | 'share_action';
  triggeredAt: Date;
  status: 'pending' | 'approved' | 'paid' | 'expired';
  paymentMethod: 'instant_pay' | 'fuel_card' | 'direct_deposit' | 'platform_credit';
  description: string;
}

export interface ShareableContent {
  title: string;
  message: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaText: string;
  landingPageUrl: string;
  qrCodeUrl: string;
  socialMediaPosts: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  emailTemplate: string;
  smsTemplate: string;
}

export interface TrackingMetrics {
  totalShares: number;
  totalClicks: number;
  totalSignups: number;
  totalCompletedLoads: number;
  conversionRate: number;
  clickThroughRate: number;
  averageTimeToSignup: number; // hours
  topPerformingChannels: string[];
  revenueGenerated: number;
  costPerAcquisition: number;
}

export interface ReferralTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirements: {
    minReferrals: number;
    minRevenue: number;
    timeframe: number; // days
  };
  rewards: {
    baseBonus: number;
    perReferralBonus: number;
    commissionMultiplier: number;
    exclusivePerks: string[];
  };
  shareTools: {
    customBranding: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    automatedFollowUp: boolean;
  };
}

export interface ReferralCampaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetAudience: string[];
  incentiveStructure: {
    referrerReward: number;
    refereeReward: number;
    bonusThresholds: { count: number; bonus: number }[];
  };
  shareableAssets: ShareableContent;
  performanceGoals: {
    targetReferrals: number;
    targetRevenue: number;
    maxBudget: number;
  };
  currentMetrics: TrackingMetrics;
  status: 'draft' | 'active' | 'paused' | 'completed';
}

export class OneClickReferralSystem {
  private referrals: Map<string, OneClickReferral> = new Map();
  private campaigns: Map<string, ReferralCampaign> = new Map();
  private tierSystem: Map<string, ReferralTier> = new Map();
  private rewardQueue: InstantReward[] = [];

  constructor() {
    this.initializeTierSystem();
    this.initializeCampaigns();
    this.startRewardProcessing();
  }

  private initializeTierSystem() {
    const tiers: ReferralTier[] = [
      {
        name: 'bronze',
        requirements: { minReferrals: 0, minRevenue: 0, timeframe: 30 },
        rewards: {
          baseBonus: 100,
          perReferralBonus: 50,
          commissionMultiplier: 1.0,
          exclusivePerks: ['Basic sharing tools', 'Monthly reports']
        },
        shareTools: {
          customBranding: false,
          advancedAnalytics: false,
          prioritySupport: false,
          automatedFollowUp: false
        }
      },
      {
        name: 'silver',
        requirements: { minReferrals: 5, minRevenue: 5000, timeframe: 30 },
        rewards: {
          baseBonus: 200,
          perReferralBonus: 75,
          commissionMultiplier: 1.1,
          exclusivePerks: ['Custom referral codes', 'Weekly reports', 'Email templates']
        },
        shareTools: {
          customBranding: true,
          advancedAnalytics: false,
          prioritySupport: false,
          automatedFollowUp: true
        }
      },
      {
        name: 'gold',
        requirements: { minReferrals: 15, minRevenue: 15000, timeframe: 30 },
        rewards: {
          baseBonus: 500,
          perReferralBonus: 100,
          commissionMultiplier: 1.25,
          exclusivePerks: ['Priority load matching', 'Dedicated support', 'Advanced analytics', 'Custom landing pages']
        },
        shareTools: {
          customBranding: true,
          advancedAnalytics: true,
          prioritySupport: true,
          automatedFollowUp: true
        }
      },
      {
        name: 'platinum',
        requirements: { minReferrals: 30, minRevenue: 50000, timeframe: 30 },
        rewards: {
          baseBonus: 1000,
          perReferralBonus: 150,
          commissionMultiplier: 1.5,
          exclusivePerks: ['VIP load access', 'Personal account manager', 'Custom campaigns', 'Revenue sharing']
        },
        shareTools: {
          customBranding: true,
          advancedAnalytics: true,
          prioritySupport: true,
          automatedFollowUp: true
        }
      }
    ];

    tiers.forEach(tier => {
      this.tierSystem.set(tier.name, tier);
    });
  }

  private initializeCampaigns() {
    const defaultCampaign: ReferralCampaign = {
      id: 'winter-2025-growth',
      name: 'Winter Growth Accelerator',
      description: 'Special winter campaign with enhanced rewards for driver referrals',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      targetAudience: ['experienced_drivers', 'owner_operators', 'fleet_drivers'],
      incentiveStructure: {
        referrerReward: 250,
        refereeReward: 150,
        bonusThresholds: [
          { count: 3, bonus: 200 },
          { count: 5, bonus: 500 },
          { count: 10, bonus: 1500 }
        ]
      },
      shareableAssets: this.generateShareableContent('winter-2025-growth'),
      performanceGoals: {
        targetReferrals: 1000,
        targetRevenue: 500000,
        maxBudget: 75000
      },
      currentMetrics: {
        totalShares: 0,
        totalClicks: 0,
        totalSignups: 0,
        totalCompletedLoads: 0,
        conversionRate: 0,
        clickThroughRate: 0,
        averageTimeToSignup: 0,
        topPerformingChannels: [],
        revenueGenerated: 0,
        costPerAcquisition: 0
      },
      status: 'active'
    };

    this.campaigns.set(defaultCampaign.id, defaultCampaign);
  }

  public generateReferralLink(driverId: number): OneClickReferral {
    const referralCode = this.generateUniqueCode(driverId);
    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const referral: OneClickReferral = {
      id: referralId,
      referrerId: driverId,
      referrerName: `Driver ${driverId}`,
      referralCode,
      shareMethod: 'direct_link',
      sharedAt: new Date(),
      clicks: 0,
      conversions: 0,
      signups: 0,
      status: 'active',
      rewardTier: this.getDriverTier(driverId),
      instantRewards: [],
      shareableContent: this.generateShareableContent(referralCode),
      trackingMetrics: {
        totalShares: 0,
        totalClicks: 0,
        totalSignups: 0,
        totalCompletedLoads: 0,
        conversionRate: 0,
        clickThroughRate: 0,
        averageTimeToSignup: 0,
        topPerformingChannels: [],
        revenueGenerated: 0,
        costPerAcquisition: 0
      },
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };

    this.referrals.set(referralId, referral);
    return referral;
  }

  private generateUniqueCode(driverId: number): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    return `DRIVE${driverId}${timestamp}${random}`.toUpperCase();
  }

  private getDriverTier(driverId: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    // In a real implementation, this would check driver's referral history
    const mockReferralCount = Math.floor(Math.random() * 40);
    
    if (mockReferralCount >= 30) return 'platinum';
    if (mockReferralCount >= 15) return 'gold';
    if (mockReferralCount >= 5) return 'silver';
    return 'bronze';
  }

  private generateShareableContent(code: string): ShareableContent {
    const baseUrl = process.env.BASE_URL || 'https://truckflow.ai';
    const landingPageUrl = `${baseUrl}/join?ref=${code}`;
    
    return {
      title: 'Join TruckFlow AI - The Future of Trucking',
      message: `🚛 Ready to maximize your earnings? Join TruckFlow AI using my referral code ${code} and get $150 bonus + AI-powered load matching! Start earning more today.`,
      imageUrl: `${baseUrl}/assets/referral-banner.jpg`,
      videoUrl: `${baseUrl}/assets/referral-video.mp4`,
      ctaText: 'Join Now & Get $150 Bonus',
      landingPageUrl,
      qrCodeUrl: `${baseUrl}/api/qr/${code}`,
      socialMediaPosts: {
        facebook: `🚛 Attention truckers! I'm earning more with TruckFlow AI's smart dispatch system. Join using my code ${code} and get $150 bonus plus AI load matching! ${landingPageUrl}`,
        twitter: `🚛 Truckers: Get $150 bonus + AI load matching with TruckFlow! Use code ${code} ${landingPageUrl} #TruckingLife #AI #EarnMore`,
        linkedin: `Professional drivers: Maximize your earnings with TruckFlow AI's intelligent dispatch platform. $150 signup bonus with referral code ${code}. ${landingPageUrl}`,
        instagram: `🚛✨ Level up your trucking game! $150 bonus + smart load matching awaits. Code: ${code} Link in bio! #TruckingLife #AI #SmartDispatch`
      },
      emailTemplate: `Subject: Earn More as a Trucker - $150 Bonus Inside!

Hi there!

I wanted to share something that's been a game-changer for my trucking business. TruckFlow AI uses artificial intelligence to find the best loads and optimize routes, and I've been earning significantly more since I joined.

Here's what you get:
• $150 signup bonus (using my code ${code})
• AI-powered load matching
• Route optimization
• Instant payment options
• 24/7 support

Ready to boost your earnings? Join here: ${landingPageUrl}

Safe travels!`,
      smsTemplate: `🚛 Hey! TruckFlow AI boosted my earnings with AI load matching. Get $150 bonus with my code ${code}: ${landingPageUrl} Reply STOP to opt out.`
    };
  }

  public shareReferral(referralId: string, method: 'sms' | 'email' | 'whatsapp' | 'social' | 'qr_code', contact?: string): {
    success: boolean;
    shareUrl?: string;
    message?: string;
  } {
    const referral = this.referrals.get(referralId);
    if (!referral) {
      return { success: false, message: 'Referral not found' };
    }

    // Update tracking
    referral.trackingMetrics.totalShares++;
    referral.shareMethod = method;
    
    // Track instant reward for sharing
    this.triggerInstantReward(referral, 'share_action', 5);

    switch (method) {
      case 'sms':
        return this.sendSMS(contact!, referral.shareableContent.smsTemplate);
      case 'email':
        return this.sendEmail(contact!, referral.shareableContent);
      case 'whatsapp':
        return this.shareWhatsApp(referral.shareableContent);
      case 'social':
        return this.generateSocialShare(referral.shareableContent);
      case 'qr_code':
        return { success: true, shareUrl: referral.shareableContent.qrCodeUrl };
      default:
        return { success: false, message: 'Invalid share method' };
    }
  }

  private sendSMS(phoneNumber: string, message: string): { success: boolean; message?: string } {
    // In production, integrate with Twilio or similar SMS service
    console.log(`📱 SMS sent to ${phoneNumber}: ${message}`);
    return { success: true, message: 'SMS sent successfully' };
  }

  private sendEmail(email: string, content: ShareableContent): { success: boolean; message?: string } {
    // In production, integrate with SendGrid or similar email service
    console.log(`📧 Email sent to ${email}: ${content.title}`);
    return { success: true, message: 'Email sent successfully' };
  }

  private shareWhatsApp(content: ShareableContent): { success: boolean; shareUrl: string } {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(content.message)}`;
    return { success: true, shareUrl: whatsappUrl };
  }

  private generateSocialShare(content: ShareableContent): { success: boolean; shareUrl: string } {
    // Generate URLs for different social platforms
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.landingPageUrl)}&quote=${encodeURIComponent(content.socialMediaPosts.facebook)}`;
    return { success: true, shareUrl: facebookUrl };
  }

  public trackClick(referralCode: string): void {
    const referral = Array.from(this.referrals.values()).find(r => r.referralCode === referralCode);
    if (referral) {
      referral.clicks++;
      referral.trackingMetrics.totalClicks++;
      
      // Trigger click reward
      this.triggerInstantReward(referral, 'click', 2);
      
      // Update click-through rate
      if (referral.trackingMetrics.totalShares > 0) {
        referral.trackingMetrics.clickThroughRate = (referral.trackingMetrics.totalClicks / referral.trackingMetrics.totalShares) * 100;
      }
    }
  }

  public trackSignup(referralCode: string, newDriverId: number): InstantReward[] {
    const referral = Array.from(this.referrals.values()).find(r => r.referralCode === referralCode);
    if (!referral) return [];

    referral.signups++;
    referral.trackingMetrics.totalSignups++;
    
    // Calculate conversion rate
    if (referral.trackingMetrics.totalClicks > 0) {
      referral.trackingMetrics.conversionRate = (referral.trackingMetrics.totalSignups / referral.trackingMetrics.totalClicks) * 100;
    }

    // Trigger signup rewards
    const rewards: InstantReward[] = [];
    
    // Referrer reward
    const referrerReward = this.triggerInstantReward(referral, 'signup', 250);
    if (referrerReward) rewards.push(referrerReward);
    
    // Check for milestone bonuses
    const milestoneReward = this.checkMilestoneRewards(referral);
    if (milestoneReward) rewards.push(milestoneReward);

    // Process tier advancement
    this.checkTierAdvancement(referral.referrerId);

    return rewards;
  }

  private triggerInstantReward(referral: OneClickReferral, trigger: 'click' | 'signup' | 'share_action' | 'first_load' | 'milestone', amount: number): InstantReward | null {
    const tier = this.tierSystem.get(referral.rewardTier);
    if (!tier) return null;

    const rewardAmount = trigger === 'signup' ? amount * tier.rewards.commissionMultiplier : amount;
    
    const reward: InstantReward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'cash_bonus',
      amount: rewardAmount,
      currency: 'USD',
      triggeredBy: trigger,
      triggeredAt: new Date(),
      status: 'pending',
      paymentMethod: 'instant_pay',
      description: `${trigger === 'signup' ? 'Referral signup' : trigger === 'click' ? 'Referral click' : 'Share action'} reward`
    };

    referral.instantRewards.push(reward);
    this.rewardQueue.push(reward);
    
    return reward;
  }

  private checkMilestoneRewards(referral: OneClickReferral): InstantReward | null {
    const campaign = Array.from(this.campaigns.values()).find(c => c.status === 'active');
    if (!campaign) return null;

    for (const threshold of campaign.incentiveStructure.bonusThresholds) {
      if (referral.signups === threshold.count) {
        const milestoneReward: InstantReward = {
          id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'cash_bonus',
          amount: threshold.bonus,
          currency: 'USD',
          triggeredBy: 'milestone',
          triggeredAt: new Date(),
          status: 'pending',
          paymentMethod: 'instant_pay',
          description: `Milestone bonus for ${threshold.count} referrals`
        };

        referral.instantRewards.push(milestoneReward);
        this.rewardQueue.push(milestoneReward);
        return milestoneReward;
      }
    }

    return null;
  }

  private checkTierAdvancement(driverId: number): void {
    // In production, check actual driver referral metrics
    const currentTier = this.getDriverTier(driverId);
    // Logic to check if driver qualifies for tier advancement
    console.log(`🏆 Checking tier advancement for driver ${driverId}, current tier: ${currentTier}`);
  }

  private startRewardProcessing(): void {
    setInterval(() => {
      this.processRewardQueue();
    }, 5000); // Process rewards every 5 seconds
  }

  private processRewardQueue(): void {
    const pendingRewards = this.rewardQueue.filter(r => r.status === 'pending');
    
    for (const reward of pendingRewards) {
      // Simulate instant payment processing
      reward.status = 'approved';
      console.log(`💰 Instant reward processed: $${reward.amount} for ${reward.description}`);
    }
  }

  public getDriverReferrals(driverId: number): OneClickReferral[] {
    return Array.from(this.referrals.values()).filter((r: OneClickReferral) => r.referrerId === driverId);
  }

  public getReferralStats(driverId: number): {
    totalReferrals: number;
    totalEarnings: number;
    currentTier: string;
    nextTierProgress: number;
    recentRewards: InstantReward[];
    topPerformingShares: any[];
  } {
    const driverReferrals = this.getDriverReferrals(driverId);
    const totalReferrals = driverReferrals.reduce((sum, r) => sum + r.signups, 0);
    const totalEarnings = driverReferrals.reduce((sum, r) => 
      sum + r.instantRewards.filter(reward => reward.status === 'approved').reduce((rewardSum, reward) => rewardSum + reward.amount, 0), 0
    );
    
    const currentTier = this.getDriverTier(driverId);
    const tierData = this.tierSystem.get(currentTier);
    
    const recentRewards = driverReferrals
      .flatMap(r => r.instantRewards)
      .filter(r => r.status === 'approved')
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, 10);

    return {
      totalReferrals,
      totalEarnings,
      currentTier,
      nextTierProgress: this.calculateTierProgress(driverId, currentTier),
      recentRewards,
      topPerformingShares: this.getTopPerformingShares(driverReferrals)
    };
  }

  private calculateTierProgress(driverId: number, currentTier: string): number {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    
    if (currentIndex === tiers.length - 1) return 100; // Already at highest tier
    
    const nextTier = tiers[currentIndex + 1];
    const nextTierData = this.tierSystem.get(nextTier as any);
    const currentReferrals = this.getDriverReferrals(driverId).reduce((sum, r) => sum + r.signups, 0);
    
    if (nextTierData) {
      return Math.min((currentReferrals / nextTierData.requirements.minReferrals) * 100, 100);
    }
    
    return 0;
  }

  private getTopPerformingShares(referrals: OneClickReferral[]): any[] {
    return referrals
      .map(r => ({
        method: r.shareMethod,
        clicks: r.clicks,
        conversions: r.signups,
        conversionRate: r.clicks > 0 ? (r.signups / r.clicks) * 100 : 0
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);
  }

  public getAllCampaigns(): ReferralCampaign[] {
    return Array.from(this.campaigns.values());
  }

  public getTierSystem(): ReferralTier[] {
    return Array.from(this.tierSystem.values());
  }

  public getSystemMetrics(): {
    totalActiveReferrals: number;
    totalRewardsDistributed: number;
    averageConversionRate: number;
    topPerformers: any[];
  } {
    const activeReferrals = Array.from(this.referrals.values()).filter(r => r.status === 'active');
    const totalRewards = activeReferrals
      .flatMap(r => r.instantRewards)
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const avgConversionRate = activeReferrals.length > 0 
      ? activeReferrals.reduce((sum, r) => sum + r.trackingMetrics.conversionRate, 0) / activeReferrals.length 
      : 0;

    return {
      totalActiveReferrals: activeReferrals.length,
      totalRewardsDistributed: totalRewards,
      averageConversionRate: avgConversionRate,
      topPerformers: this.getTopPerformers()
    };
  }

  private getTopPerformers(): any[] {
    const referralsByDriver = new Map<number, { signups: number; earnings: number }>();
    
    for (const referral of this.referrals.values()) {
      const existing = referralsByDriver.get(referral.referrerId) || { signups: 0, earnings: 0 };
      existing.signups += referral.signups;
      existing.earnings += referral.instantRewards
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.amount, 0);
      referralsByDriver.set(referral.referrerId, existing);
    }

    return Array.from(referralsByDriver.entries())
      .map(([driverId, stats]) => ({ driverId, ...stats }))
      .sort((a, b) => b.signups - a.signups)
      .slice(0, 10);
  }
}

export const oneClickReferralSystem = new OneClickReferralSystem();