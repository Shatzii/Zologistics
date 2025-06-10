import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, Heart, Shield, Truck, Award, TrendingUp,
  Star, Clock, Users, Target, Gift, CheckCircle,
  Calculator, Trophy, Zap, Home
} from "lucide-react";

interface DriverValueData {
  monthlyBenefitValue: number;
  annualBenefitValue: number;
  lifetimeValue: number;
  competitorComparison: number;
}

interface DriverRewards {
  driverId: number;
  totalEarnings: {
    thisWeek: number;
    thisMonth: number;
    yearToDate: number;
    allTime: number;
  };
  bonuses: {
    onTimeDelivery: number;
    safetyRecord: number;
    fuelEfficiency: number;
    customerRating: number;
  };
  benefits: {
    healthInsurance: boolean;
    instantPay: boolean;
    fuelNetwork: boolean;
    familySupport: boolean;
  };
  milestones: {
    milesClean: number;
    consecutiveOnTime: number;
    yearsOfService: number;
    customerSatisfaction: number;
  };
}

interface DriverBenefit {
  id: string;
  type: string;
  value: number;
  description: string;
  status: string;
  metadata: any;
}

export function DriverValueCalculator() {
  const [selectedDriver] = useState(1);
  const [comparisonMode, setComparisonMode] = useState(false);

  const { data: valueData } = useQuery<DriverValueData>({
    queryKey: ['/api/driver/value-calculator', selectedDriver],
  });

  const { data: rewards } = useQuery<DriverRewards>({
    queryKey: ['/api/driver/rewards', selectedDriver],
  });

  const { data: benefits } = useQuery<DriverBenefit[]>({
    queryKey: ['/api/driver/benefits', selectedDriver],
  });

  // Competitor comparison data
  const competitorData = {
    swift: {
      name: "Swift Transportation",
      weeklyPay: 1200,
      healthInsurance: 450,
      instantPay: 15,
      homeTime: "14 days out",
      benefits: 2
    },
    werner: {
      name: "Werner Enterprises",
      weeklyPay: 1150,
      healthInsurance: 380,
      instantPay: 20,
      homeTime: "No guarantee",
      benefits: 1
    },
    schneider: {
      name: "Schneider",
      weeklyPay: 1300,
      healthInsurance: 420,
      instantPay: 12,
      homeTime: "Regional only",
      benefits: 3
    }
  };

  const truckflowAdvantages = [
    {
      title: "Same-Day Payment",
      description: "Zero fees, 4-hour processing",
      value: "$0 fees vs $15-20 industry average",
      icon: <Zap className="w-6 h-6 text-green-400" />
    },
    {
      title: "100% Health Coverage",
      description: "Full family coverage included",
      value: "$1,200/month value",
      icon: <Heart className="w-6 h-6 text-red-400" />
    },
    {
      title: "Home Time Guarantee",
      description: "48 hours every 14 days minimum",
      value: "Industry-leading policy",
      icon: <Home className="w-6 h-6 text-blue-400" />
    },
    {
      title: "AI Route Optimization",
      description: "Save 2+ hours per route",
      value: "$150+ daily savings",
      icon: <Target className="w-6 h-6 text-purple-400" />
    },
    {
      title: "Performance Bonuses",
      description: "Multiple bonus categories",
      value: "$5,500+ annual potential",
      icon: <Award className="w-6 h-6 text-yellow-400" />
    },
    {
      title: "Driver Wellness Program",
      description: "Health, fitness, mental support",
      value: "$200/month gym + counseling",
      icon: <Shield className="w-6 h-6 text-green-400" />
    }
  ];

  if (!valueData || !rewards || !benefits) {
    return (
      <div className="driver-theme min-h-screen p-6 flex items-center justify-center">
        <div className="driver-text-emphasis">Loading driver value calculator...</div>
      </div>
    );
  }

  return (
    <div className="driver-theme min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="driver-text-critical text-4xl font-bold">
            TruckFlow AI Driver Value Calculator
          </h1>
          <p className="driver-text-emphasis text-xl">
            See why TruckFlow AI offers the industry's best driver benefits package
          </p>
          <Badge className="driver-status-available text-lg px-6 py-2">
            #1 Driver-First Platform
          </Badge>
        </div>

        {/* Value Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="driver-card text-center">
            <CardContent className="p-6">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <div className="driver-dashboard-metric text-green-400">
                ${valueData.monthlyBenefitValue.toLocaleString()}
              </div>
              <div className="driver-text-secondary">Monthly Benefits Value</div>
            </CardContent>
          </Card>

          <Card className="driver-card text-center">
            <CardContent className="p-6">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <div className="driver-dashboard-metric text-blue-400">
                ${valueData.annualBenefitValue.toLocaleString()}
              </div>
              <div className="driver-text-secondary">Annual Benefits Value</div>
            </CardContent>
          </Card>

          <Card className="driver-card text-center">
            <CardContent className="p-6">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <div className="driver-dashboard-metric text-yellow-400">
                ${valueData.competitorComparison.toLocaleString()}
              </div>
              <div className="driver-text-secondary">Advantage vs Competitors</div>
            </CardContent>
          </Card>

          <Card className="driver-card text-center">
            <CardContent className="p-6">
              <Star className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <div className="driver-dashboard-metric text-purple-400">
                {rewards.milestones.customerSatisfaction}
              </div>
              <div className="driver-text-secondary">Customer Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="benefits" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="benefits" className="driver-text-emphasis">Benefits Package</TabsTrigger>
            <TabsTrigger value="comparison" className="driver-text-emphasis">vs Competitors</TabsTrigger>
            <TabsTrigger value="earnings" className="driver-text-emphasis">Earnings Breakdown</TabsTrigger>
            <TabsTrigger value="milestones" className="driver-text-emphasis">Achievement Tracker</TabsTrigger>
          </TabsList>

          {/* Benefits Package Tab */}
          <TabsContent value="benefits" className="space-y-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-critical flex items-center gap-2">
                  <Gift className="w-6 h-6 text-green-400" />
                  Complete Benefits Package
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {truckflowAdvantages.map((advantage, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                      <div className="flex items-center gap-3 mb-3">
                        {advantage.icon}
                        <h3 className="driver-text-emphasis font-semibold">{advantage.title}</h3>
                      </div>
                      <p className="driver-text-secondary mb-2">{advantage.description}</p>
                      <div className="driver-text-emphasis text-green-400 font-semibold">
                        {advantage.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Benefits */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-critical">Your Active Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <div className="driver-text-emphasis font-semibold">{benefit.description}</div>
                        <div className="driver-text-secondary">
                          {benefit.type.replace('_', ' ').toUpperCase()} • Status: {benefit.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="driver-text-emphasis text-green-400">
                          ${benefit.value > 0 ? benefit.value.toLocaleString() : 'Included'}
                        </div>
                        {benefit.status === 'pending' && (
                          <Button className="driver-button mt-2 bg-green-600 hover:bg-green-500">
                            Claim Benefit
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitor Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-critical">Industry Comparison</CardTitle>
                <p className="driver-text-secondary">See how TruckFlow AI stacks up against major carriers</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left p-4 driver-text-emphasis">Feature</th>
                        <th className="text-center p-4 driver-text-emphasis">TruckFlow AI</th>
                        <th className="text-center p-4 driver-text-secondary">Swift</th>
                        <th className="text-center p-4 driver-text-secondary">Werner</th>
                        <th className="text-center p-4 driver-text-secondary">Schneider</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="p-4 driver-text-emphasis">Weekly Pay Average</td>
                        <td className="p-4 text-center text-green-400 font-bold">${(rewards.totalEarnings.thisWeek)}</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.swift.weeklyPay}</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.werner.weeklyPay}</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.schneider.weeklyPay}</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="p-4 driver-text-emphasis">Health Insurance</td>
                        <td className="p-4 text-center text-green-400 font-bold">100% Covered</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.swift.healthInsurance}/mo</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.werner.healthInsurance}/mo</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.schneider.healthInsurance}/mo</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="p-4 driver-text-emphasis">Instant Pay Fees</td>
                        <td className="p-4 text-center text-green-400 font-bold">$0</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.swift.instantPay}</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.werner.instantPay}</td>
                        <td className="p-4 text-center driver-text-secondary">${competitorData.schneider.instantPay}</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="p-4 driver-text-emphasis">Home Time Guarantee</td>
                        <td className="p-4 text-center text-green-400 font-bold">48hrs/14 days</td>
                        <td className="p-4 text-center driver-text-secondary">{competitorData.swift.homeTime}</td>
                        <td className="p-4 text-center driver-text-secondary">{competitorData.werner.homeTime}</td>
                        <td className="p-4 text-center driver-text-secondary">{competitorData.schneider.homeTime}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Annual Savings Calculator */}
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-critical">Annual Savings vs Competition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-800 rounded-lg">
                    <div className="driver-dashboard-metric text-green-400">$14,400</div>
                    <div className="driver-text-secondary">Health Insurance Savings</div>
                  </div>
                  <div className="text-center p-6 bg-gray-800 rounded-lg">
                    <div className="driver-dashboard-metric text-green-400">$780</div>
                    <div className="driver-text-secondary">Instant Pay Fee Savings</div>
                  </div>
                  <div className="text-center p-6 bg-gray-800 rounded-lg">
                    <div className="driver-dashboard-metric text-green-400">$8,500</div>
                    <div className="driver-text-secondary">Total Annual Advantage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Breakdown Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Earnings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">This Week</span>
                      <span className="driver-text-emphasis">${rewards.totalEarnings.thisWeek.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">This Month</span>
                      <span className="driver-text-emphasis">${rewards.totalEarnings.thisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Year to Date</span>
                      <span className="driver-text-emphasis">${rewards.totalEarnings.yearToDate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-600 pt-4">
                      <span className="driver-text-emphasis font-semibold">All Time</span>
                      <span className="driver-text-emphasis font-semibold text-green-400">
                        ${rewards.totalEarnings.allTime.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-critical">Performance Bonuses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">On-Time Delivery</span>
                      <span className="driver-text-emphasis text-green-400">${rewards.bonuses.onTimeDelivery}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Safety Record</span>
                      <span className="driver-text-emphasis text-green-400">${rewards.bonuses.safetyRecord}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Fuel Efficiency</span>
                      <span className="driver-text-emphasis text-green-400">${rewards.bonuses.fuelEfficiency}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Customer Rating</span>
                      <span className="driver-text-emphasis text-green-400">${rewards.bonuses.customerRating}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-600 pt-4">
                      <span className="driver-text-emphasis font-semibold">Total Bonuses</span>
                      <span className="driver-text-emphasis font-semibold text-green-400">
                        ${Object.values(rewards.bonuses).reduce((sum, bonus) => sum + bonus, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-critical">Achievement Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="driver-text-emphasis">Safe Miles</span>
                        <span className="driver-text-emphasis">{rewards.milestones.milesClean.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min((rewards.milestones.milesClean / 1000000) * 100, 100)} className="h-3" />
                      <div className="driver-text-secondary text-sm mt-1">Next milestone: 1M miles</div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="driver-text-emphasis">On-Time Streak</span>
                        <span className="driver-text-emphasis">{rewards.milestones.consecutiveOnTime} loads</span>
                      </div>
                      <Progress value={Math.min((rewards.milestones.consecutiveOnTime / 100) * 100, 100)} className="h-3" />
                      <div className="driver-text-secondary text-sm mt-1">Next bonus at 50 loads</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="driver-text-emphasis">Years of Service</span>
                        <span className="driver-text-emphasis">{rewards.milestones.yearsOfService} years</span>
                      </div>
                      <Progress value={Math.min((rewards.milestones.yearsOfService / 10) * 100, 100)} className="h-3" />
                      <div className="driver-text-secondary text-sm mt-1">Next milestone: 5 years</div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="driver-text-emphasis">Customer Rating</span>
                        <span className="driver-text-emphasis">{rewards.milestones.customerSatisfaction}/5.0</span>
                      </div>
                      <Progress value={(rewards.milestones.customerSatisfaction / 5) * 100} className="h-3" />
                      <div className="driver-text-secondary text-sm mt-1">Excellent performance!</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="driver-card text-center">
          <CardContent className="p-8">
            <h2 className="driver-text-critical text-2xl mb-4">Ready to Join the Best?</h2>
            <p className="driver-text-secondary mb-6">
              Experience the industry's most comprehensive driver benefits package
            </p>
            <div className="flex justify-center gap-4">
              <Button className="driver-button bg-green-600 hover:bg-green-500 text-lg px-8 py-3">
                Apply Now
              </Button>
              <Button className="driver-button bg-blue-600 hover:bg-blue-500 text-lg px-8 py-3">
                Schedule Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}