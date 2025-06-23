import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageSquare, 
  QrCode,
  Trophy,
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Gift,
  Star,
  Zap,
  Phone,
  Link,
  Crown,
  Award,
  Sparkles
} from "lucide-react";

export default function ReferralDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, formatCurrency, formatNumber } = useLanguage();
  const [selectedShareMethod, setSelectedShareMethod] = useState<string>('link');
  const [shareContact, setShareContact] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  
  // Mock driver ID - in production, get from auth context
  const driverId = 1;

  const { data: referralStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/referrals/stats', driverId],
    retry: false,
  });

  const { data: referralLink, isLoading: linkLoading } = useQuery({
    queryKey: ['/api/referrals/generate-link', driverId],
    retry: false,
  });

  const { data: tierSystem } = useQuery({
    queryKey: ['/api/referrals/tiers'],
    retry: false,
  });

  const shareReferralMutation = useMutation({
    mutationFn: async (data: { method: string; contact?: string; message?: string }) => {
      const response = await fetch('/api/referrals/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          method: data.method,
          contact: data.contact,
          customMessage: data.message
        }),
      });
      if (!response.ok) throw new Error('Failed to share referral');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Referral Shared Successfully!",
        description: data.message || "Your referral has been shared.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Share Failed",
        description: "Failed to share referral. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (selectedShareMethod === 'link') {
      copyToClipboard(referralLink?.landingPageUrl || '');
      return;
    }

    if ((selectedShareMethod === 'sms' || selectedShareMethod === 'email') && !shareContact) {
      toast({
        title: "Contact Required",
        description: `Please enter a ${selectedShareMethod === 'sms' ? 'phone number' : 'email address'}.`,
        variant: "destructive",
      });
      return;
    }

    shareReferralMutation.mutate({
      method: selectedShareMethod,
      contact: shareContact,
      message: customMessage
    });
  };

  const openSocialShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp') => {
    if (!referralLink) return;

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink.landingPageUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(referralLink.shareableContent.socialMediaPosts.twitter)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink.landingPageUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(referralLink.shareableContent.message)}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-600';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-purple-600';
      default: return 'bg-gray-400';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return Award;
      case 'silver': return Star;
      case 'gold': return Trophy;
      case 'platinum': return Crown;
      default: return Award;
    }
  };

  if (statsLoading || linkLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Share2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Driver Referral Program
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Earn instant rewards by referring new drivers
              </p>
            </div>
          </div>
          
          {/* Current Tier Badge */}
          {referralStats && (
            <div className="flex items-center space-x-2">
              <Badge className={`${getTierColor(referralStats.currentTier)} text-white px-4 py-2`}>
                {React.createElement(getTierIcon(referralStats.currentTier), { className: "h-4 w-4 mr-2" })}
                {referralStats.currentTier.toUpperCase()} TIER
              </Badge>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Total Earnings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(referralStats?.totalEarnings || 0)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                From referrals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Referrals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(referralStats?.totalReferrals || 0)}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Successful signups
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span>Tier Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {Math.round(referralStats?.nextTierProgress || 0)}%
              </div>
              <Progress value={referralStats?.nextTierProgress || 0} className="mt-2" />
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                To next tier
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Gift className="h-5 w-5 text-orange-600" />
                <span>Recent Rewards</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {referralStats?.recentRewards?.length || 0}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="share">One-Click Share</TabsTrigger>
            <TabsTrigger value="rewards">Instant Rewards</TabsTrigger>
            <TabsTrigger value="tiers">Tier System</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
          </TabsList>
          
          {/* One-Click Share Tab */}
          <TabsContent value="share" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Share Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span>One-Click Sharing</span>
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred sharing method and reach more drivers instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Share Method Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedShareMethod === 'link' ? 'default' : 'outline'}
                      onClick={() => setSelectedShareMethod('link')}
                      className="flex items-center space-x-2"
                    >
                      <Link className="h-4 w-4" />
                      <span>Copy Link</span>
                    </Button>
                    
                    <Button
                      variant={selectedShareMethod === 'sms' ? 'default' : 'outline'}
                      onClick={() => setSelectedShareMethod('sms')}
                      className="flex items-center space-x-2"
                    >
                      <Phone className="h-4 w-4" />
                      <span>SMS</span>
                    </Button>
                    
                    <Button
                      variant={selectedShareMethod === 'email' ? 'default' : 'outline'}
                      onClick={() => setSelectedShareMethod('email')}
                      className="flex items-center space-x-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Button>
                    
                    <Button
                      variant={selectedShareMethod === 'whatsapp' ? 'default' : 'outline'}
                      onClick={() => setSelectedShareMethod('whatsapp')}
                      className="flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </Button>
                  </div>

                  {/* Contact Input for SMS/Email */}
                  {(selectedShareMethod === 'sms' || selectedShareMethod === 'email') && (
                    <div className="space-y-2">
                      <Label htmlFor="contact">
                        {selectedShareMethod === 'sms' ? 'Phone Number' : 'Email Address'}
                      </Label>
                      <Input
                        id="contact"
                        type={selectedShareMethod === 'email' ? 'email' : 'tel'}
                        placeholder={selectedShareMethod === 'sms' ? '+1 (555) 123-4567' : 'driver@example.com'}
                        value={shareContact}
                        onChange={(e) => setShareContact(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Custom Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Custom Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a personal touch to your referral..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Share Button */}
                  <Button 
                    onClick={handleShare}
                    disabled={shareReferralMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {shareReferralMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sharing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Share2 className="h-4 w-4" />
                        <span>Share Now</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Social Media Quick Share */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span>Social Media Blast</span>
                  </CardTitle>
                  <CardDescription>
                    Share across all your social platforms with one click
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Social Platform Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => openSocialShare('facebook')}
                      className="flex items-center space-x-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <span>📘</span>
                      <span>Facebook</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => openSocialShare('twitter')}
                      className="flex items-center space-x-2 border-sky-500 text-sky-500 hover:bg-sky-50"
                    >
                      <span>🐦</span>
                      <span>Twitter</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => openSocialShare('linkedin')}
                      className="flex items-center space-x-2 border-blue-700 text-blue-700 hover:bg-blue-50"
                    >
                      <span>💼</span>
                      <span>LinkedIn</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => openSocialShare('whatsapp')}
                      className="flex items-center space-x-2 border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <span>💬</span>
                      <span>WhatsApp</span>
                    </Button>
                  </div>

                  {/* QR Code Option */}
                  <div className="border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() => window.open(referralLink?.qrCodeUrl, '_blank')}
                      className="w-full flex items-center space-x-2"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Generate QR Code</span>
                    </Button>
                  </div>

                  {/* Referral Link Display */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Your Referral Link</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={referralLink?.landingPageUrl || ''}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(referralLink?.landingPageUrl || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Instant Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Rewards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <span>Recent Rewards</span>
                  </CardTitle>
                  <CardDescription>
                    Your latest instant reward payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralStats?.recentRewards?.slice(0, 5).map((reward: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{reward.description}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(reward.triggeredAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+{formatCurrency(reward.amount)}</p>
                          <Badge variant={reward.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                            {reward.status}
                          </Badge>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No rewards yet. Start referring drivers to earn!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reward Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Reward Structure</span>
                  </CardTitle>
                  <CardDescription>
                    How you earn with each action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Share2 className="h-5 w-5 text-blue-500" />
                        <span>Share Referral Link</span>
                      </div>
                      <span className="font-bold text-blue-600">+$5</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-orange-500" />
                        <span>Link Click</span>
                      </div>
                      <span className="font-bold text-orange-600">+$2</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-green-500" />
                        <span>Successful Signup</span>
                      </div>
                      <span className="font-bold text-green-600">+$250</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-5 w-5 text-purple-500" />
                        <span>Milestone Bonuses</span>
                      </div>
                      <span className="font-bold text-purple-600">+$200-$1,500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tier System Tab */}
          <TabsContent value="tiers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tierSystem?.map((tier: any) => (
                <Card 
                  key={tier.name} 
                  className={`${tier.name === referralStats?.currentTier ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full ${getTierColor(tier.name)} flex items-center justify-center mb-2`}>
                      {React.createElement(getTierIcon(tier.name), { className: "h-8 w-8 text-white" })}
                    </div>
                    <CardTitle className="capitalize">{tier.name}</CardTitle>
                    {tier.name === referralStats?.currentTier && (
                      <Badge className="bg-blue-100 text-blue-800">Current Tier</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Base Bonus</p>
                      <p className="font-bold">{formatCurrency(tier.rewards.baseBonus)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Per Referral</p>
                      <p className="font-bold">{formatCurrency(tier.rewards.perReferralBonus)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Commission Multiplier</p>
                      <p className="font-bold">{tier.rewards.commissionMultiplier}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Requirements</p>
                      <p className="text-xs">{tier.requirements.minReferrals} referrals</p>
                    </div>
                  </CardContent>
                </Card>
              )) || []}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Share Performance</CardTitle>
                  <CardDescription>Your top performing sharing methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralStats?.topPerformingShares?.map((share: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{share.method}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{share.conversions} conversions</span>
                          <span className="font-bold">{Math.round(share.conversionRate)}%</span>
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-gray-500 py-4">No data yet. Start sharing to see analytics!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress</CardTitle>
                  <CardDescription>Track your referral journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>This Month</span>
                      <span className="font-bold">{formatCurrency(referralStats?.totalEarnings || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Referrals</span>
                      <span className="font-bold">{referralStats?.totalReferrals || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Next Tier</span>
                      <span className="font-bold">{Math.round(referralStats?.nextTierProgress || 0)}%</span>
                    </div>
                    <Progress value={referralStats?.nextTierProgress || 0} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}