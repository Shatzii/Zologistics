export interface DriverPerformanceMetrics {
  driverId: number;
  period: {
    start: Date;
    end: Date;
    type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  earnings: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    averageRatePerMile: number;
    bestLoad: {
      rate: number;
      rpm: number;
      route: string;
      date: Date;
    };
    worstLoad: {
      rate: number;
      rpm: number;
      route: string;
      date: Date;
    };
  };
  efficiency: {
    totalMiles: number;
    loadedMiles: number;
    deadheadMiles: number;
    deadheadPercentage: number;
    milesPerDay: number;
    loadsCompleted: number;
    averageLoadSize: number;
    utilizationRate: number;
  };
  marketPerformance: {
    vsMarketAverage: {
      percentage: number;
      dollarDifference: number;
    };
    ranking: string;
    improvementOpportunity: number;
    bestPerformingRoutes: Array<{
      route: string;
      performanceVsMarket: number;
      frequency: number;
    }>;
  };
  trends: {
    revenueGrowth: number;
    efficiencyImprovement: number;
    rateImprovement: number;
    monthlyComparison: Array<{
      month: string;
      revenue: number;
      efficiency: number;
      growth: number;
    }>;
  };
  recommendations: Array<{
    category: 'revenue' | 'efficiency' | 'routes' | 'timing';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    potentialImpact: string;
    actionItems: string[];
  }>;
  goals: {
    current: Array<{
      type: 'revenue' | 'efficiency' | 'rate';
      target: number;
      current: number;
      progress: number;
      deadline: Date;
    }>;
    suggested: Array<{
      type: string;
      target: number;
      timeframe: string;
      difficulty: 'easy' | 'medium' | 'challenging';
    }>;
  };
}

export class DriverPerformanceAnalytics {
  private performanceData: Map<number, DriverPerformanceMetrics[]> = new Map();
  private benchmarkData: Map<string, any> = new Map();

  constructor() {
    this.initializeAnalytics();
  }

  private initializeAnalytics() {
    this.generateSamplePerformanceData();
    this.generateBenchmarkData();
    
    // Update analytics every 6 hours
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 6 * 60 * 60 * 1000);

    console.log('📊 Driver performance analytics initialized');
  }

  private generateSamplePerformanceData() {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1);

    // Generate 3 months of data for driver 1
    const months = [twoMonthsAgo, lastMonth, currentMonth];
    const performanceHistory: DriverPerformanceMetrics[] = [];

    months.forEach((month, index) => {
      const baseRevenue = 18000 + (index * 2000) + (Math.random() * 3000); // Growing revenue
      const totalMiles = 8000 + (Math.random() * 2000);
      const deadheadPercentage = 15 - (index * 2) + (Math.random() * 5); // Improving efficiency

      const metrics: DriverPerformanceMetrics = {
        driverId: 1,
        period: {
          start: new Date(month.getFullYear(), month.getMonth(), 1),
          end: new Date(month.getFullYear(), month.getMonth() + 1, 0),
          type: 'monthly'
        },
        earnings: {
          totalRevenue: Math.round(baseRevenue),
          totalExpenses: Math.round(baseRevenue * 0.35),
          netProfit: Math.round(baseRevenue * 0.65),
          profitMargin: 65,
          averageRatePerMile: baseRevenue / totalMiles,
          bestLoad: {
            rate: Math.round(baseRevenue * 0.15),
            rpm: 3.20 + (Math.random() * 0.50),
            route: 'Denver, CO → Los Angeles, CA',
            date: new Date(month.getFullYear(), month.getMonth(), 15)
          },
          worstLoad: {
            rate: Math.round(baseRevenue * 0.08),
            rpm: 1.80 + (Math.random() * 0.30),
            route: 'Phoenix, AZ → Albuquerque, NM',
            date: new Date(month.getFullYear(), month.getMonth(), 22)
          }
        },
        efficiency: {
          totalMiles: Math.round(totalMiles),
          loadedMiles: Math.round(totalMiles * (1 - deadheadPercentage / 100)),
          deadheadMiles: Math.round(totalMiles * (deadheadPercentage / 100)),
          deadheadPercentage: Math.round(deadheadPercentage * 10) / 10,
          milesPerDay: Math.round((totalMiles / 30) * 10) / 10,
          loadsCompleted: 15 + Math.floor(Math.random() * 8),
          averageLoadSize: Math.round(totalMiles / (15 + Math.floor(Math.random() * 8))),
          utilizationRate: Math.round((85 + index * 3 + Math.random() * 5) * 10) / 10
        },
        marketPerformance: {
          vsMarketAverage: {
            percentage: Math.round((5 + index * 3 + Math.random() * 5) * 10) / 10,
            dollarDifference: Math.round(baseRevenue * 0.08)
          },
          ranking: index === 0 ? 'Above Average' : index === 1 ? 'Top 25%' : 'Top 15%',
          improvementOpportunity: Math.round((3000 - index * 500) + Math.random() * 1000),
          bestPerformingRoutes: [
            {
              route: 'Denver → Phoenix',
              performanceVsMarket: 15 + index * 5,
              frequency: 4
            },
            {
              route: 'Salt Lake City → Los Angeles',
              performanceVsMarket: 12 + index * 3,
              frequency: 3
            }
          ]
        },
        trends: {
          revenueGrowth: index === 0 ? 0 : Math.round(((baseRevenue - (18000 + ((index-1) * 2000))) / (18000 + ((index-1) * 2000))) * 100 * 10) / 10,
          efficiencyImprovement: index === 0 ? 0 : Math.round((2 + Math.random() * 3) * 10) / 10,
          rateImprovement: index === 0 ? 0 : Math.round((5 + Math.random() * 5) * 10) / 10,
          monthlyComparison: this.generateMonthlyComparison(month, baseRevenue)
        },
        recommendations: this.generateRecommendations(baseRevenue, deadheadPercentage, index),
        goals: this.generateGoals(baseRevenue, deadheadPercentage)
      };

      performanceHistory.push(metrics);
    });

    this.performanceData.set(1, performanceHistory);
  }

  private generateMonthlyComparison(baseMonth: Date, baseRevenue: number) {
    const comparison = [];
    for (let i = 3; i >= 0; i--) {
      const month = new Date(baseMonth.getFullYear(), baseMonth.getMonth() - i, 1);
      const revenue = baseRevenue - (i * 1500) + (Math.random() * 1000);
      const efficiency = 85 + (3 - i) * 2 + (Math.random() * 3);
      const growth = i === 3 ? 0 : Math.round(((revenue - (baseRevenue - ((i+1) * 1500))) / (baseRevenue - ((i+1) * 1500))) * 100);

      comparison.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.round(revenue),
        efficiency: Math.round(efficiency * 10) / 10,
        growth: growth
      });
    }
    return comparison;
  }

  private generateRecommendations(revenue: number, deadhead: number, progressIndex: number): DriverPerformanceMetrics['recommendations'] {
    const recommendations = [];

    if (deadhead > 12) {
      recommendations.push({
        category: 'efficiency',
        priority: 'high',
        title: 'Reduce Deadhead Miles',
        description: `Your deadhead percentage is ${deadhead.toFixed(1)}%, which is above the optimal 10-12% range.`,
        potentialImpact: `Could save $${Math.round(deadhead * 50)} monthly in fuel costs`,
        actionItems: [
          'Plan return loads before delivery',
          'Use load boards with backhaul optimization',
          'Consider team driving for continuous movement',
          'Negotiate round-trip loads with current brokers'
        ]
      });
    }

    if (revenue < 20000) {
      recommendations.push({
        category: 'revenue',
        priority: 'high',
        title: 'Increase Monthly Revenue',
        description: 'Your monthly revenue has potential for growth through rate optimization.',
        potentialImpact: `Target $25,000 monthly revenue (+$${25000 - revenue})`,
        actionItems: [
          'Focus on lanes with RPM above $2.50',
          'Negotiate rates with existing brokers',
          'Target high-value freight corridors',
          'Consider specialized equipment for premium rates'
        ]
      });
    }

    recommendations.push({
      category: 'routes',
      priority: 'medium',
      title: 'Optimize Route Selection',
      description: 'Certain routes consistently outperform market average.',
      potentialImpact: 'Increase average RPM by $0.15-0.25',
      actionItems: [
        'Focus on Denver → Phoenix corridor (15% above market)',
        'Develop relationships with West Coast brokers',
        'Avoid short-haul loads under 500 miles',
        'Target reefer loads for premium rates'
      ]
    });

    if (progressIndex < 2) {
      recommendations.push({
        category: 'timing',
        priority: 'medium',
        title: 'Improve Load Timing',
        description: 'Optimize pickup and delivery scheduling for maximum efficiency.',
        potentialImpact: 'Reduce waiting time by 4-6 hours weekly',
        actionItems: [
          'Book loads with flexible pickup windows',
          'Communicate proactively with brokers',
          'Use ELD data to optimize driving hours',
          'Plan routes around traffic patterns'
        ]
      });
    }

    return recommendations;
  }

  private generateGoals(revenue: number, deadhead: number): DriverPerformanceMetrics['goals'] {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      current: [
        {
          type: 'revenue',
          target: 25000,
          current: revenue,
          progress: Math.round((revenue / 25000) * 100),
          deadline: nextMonth
        },
        {
          type: 'efficiency',
          target: 10,
          current: deadhead,
          progress: Math.round((1 - (deadhead - 10) / 10) * 100),
          deadline: nextMonth
        },
        {
          type: 'rate',
          target: 2.75,
          current: revenue / 8000,
          progress: Math.round(((revenue / 8000) / 2.75) * 100),
          deadline: nextMonth
        }
      ],
      suggested: [
        {
          type: 'Weekly Revenue',
          target: 6250,
          timeframe: '4 weeks',
          difficulty: 'medium'
        },
        {
          type: 'Deadhead Reduction',
          target: 8,
          timeframe: '6 weeks',
          difficulty: 'challenging'
        },
        {
          type: 'Load Frequency',
          target: 25,
          timeframe: '30 days',
          difficulty: 'easy'
        }
      ]
    };
  }

  private generateBenchmarkData() {
    this.benchmarkData.set('industry_averages', {
      monthlyRevenue: 18500,
      deadheadPercentage: 14.2,
      averageRPM: 2.35,
      utilizationRate: 82.5,
      profitMargin: 58.3
    });

    this.benchmarkData.set('top_performers', {
      monthlyRevenue: 28000,
      deadheadPercentage: 8.5,
      averageRPM: 2.85,
      utilizationRate: 92.1,
      profitMargin: 71.2
    });
  }

  private updatePerformanceMetrics() {
    // Simulate real-time updates to current month data
    for (const [driverId, metrics] of this.performanceData) {
      const currentMonth = metrics[metrics.length - 1];
      if (currentMonth && this.isCurrentMonth(currentMonth.period.start)) {
        // Update current month with slight variations
        currentMonth.earnings.totalRevenue += Math.round((Math.random() - 0.5) * 500);
        currentMonth.efficiency.deadheadPercentage = Math.max(5, currentMonth.efficiency.deadheadPercentage + (Math.random() - 0.5) * 2);
        currentMonth.trends.revenueGrowth += (Math.random() - 0.5) * 1;
      }
    }
  }

  private isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  public getDriverAnalytics(driverId: number, period?: 'weekly' | 'monthly' | 'quarterly'): DriverPerformanceMetrics[] {
    const data = this.performanceData.get(driverId) || [];
    if (period) {
      return data.filter(d => d.period.type === period);
    }
    return data;
  }

  public getCurrentMonthAnalytics(driverId: number): DriverPerformanceMetrics | null {
    const data = this.performanceData.get(driverId) || [];
    return data.find(d => this.isCurrentMonth(d.period.start)) || null;
  }

  public getPerformanceSummary(driverId: number): any {
    const data = this.performanceData.get(driverId) || [];
    if (data.length === 0) return null;

    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;

    return {
      currentMonth: latest,
      growth: previous ? {
        revenue: ((latest.earnings.totalRevenue - previous.earnings.totalRevenue) / previous.earnings.totalRevenue) * 100,
        efficiency: latest.efficiency.utilizationRate - previous.efficiency.utilizationRate,
        deadhead: previous.efficiency.deadheadPercentage - latest.efficiency.deadheadPercentage
      } : null,
      yearToDate: {
        totalRevenue: data.reduce((sum, d) => sum + d.earnings.totalRevenue, 0),
        totalMiles: data.reduce((sum, d) => sum + d.efficiency.totalMiles, 0),
        averageRPM: data.reduce((sum, d) => sum + d.earnings.averageRatePerMile, 0) / data.length
      },
      rankings: {
        vsIndustry: latest.marketPerformance.ranking,
        improvementPotential: latest.marketPerformance.improvementOpportunity
      }
    };
  }

  public getBenchmarkComparison(driverId: number): any {
    const current = this.getCurrentMonthAnalytics(driverId);
    if (!current) return null;

    const industryAvg = this.benchmarkData.get('industry_averages');
    const topPerformers = this.benchmarkData.get('top_performers');

    return {
      vsIndustryAverage: {
        revenue: {
          driver: current.earnings.totalRevenue,
          industry: industryAvg.monthlyRevenue,
          difference: current.earnings.totalRevenue - industryAvg.monthlyRevenue,
          percentage: ((current.earnings.totalRevenue - industryAvg.monthlyRevenue) / industryAvg.monthlyRevenue) * 100
        },
        efficiency: {
          driver: current.efficiency.deadheadPercentage,
          industry: industryAvg.deadheadPercentage,
          difference: industryAvg.deadheadPercentage - current.efficiency.deadheadPercentage,
          betterBy: industryAvg.deadheadPercentage > current.efficiency.deadheadPercentage
        },
        rpm: {
          driver: current.earnings.averageRatePerMile,
          industry: industryAvg.averageRPM,
          difference: current.earnings.averageRatePerMile - industryAvg.averageRPM,
          percentage: ((current.earnings.averageRatePerMile - industryAvg.averageRPM) / industryAvg.averageRPM) * 100
        }
      },
      vsTopPerformers: {
        revenueGap: topPerformers.monthlyRevenue - current.earnings.totalRevenue,
        efficiencyGap: current.efficiency.deadheadPercentage - topPerformers.deadheadPercentage,
        rpmGap: topPerformers.averageRPM - current.earnings.averageRatePerMile,
        utilizationGap: topPerformers.utilizationRate - current.efficiency.utilizationRate
      }
    };
  }

  public generateInsights(driverId: number): string[] {
    const summary = this.getPerformanceSummary(driverId);
    const comparison = this.getBenchmarkComparison(driverId);
    
    if (!summary || !comparison) return [];

    const insights: string[] = [];

    // Revenue insights
    if (comparison.vsIndustryAverage.revenue.percentage > 10) {
      insights.push(`Outstanding performance: ${comparison.vsIndustryAverage.revenue.percentage.toFixed(1)}% above industry average revenue`);
    } else if (comparison.vsIndustryAverage.revenue.percentage < -5) {
      insights.push(`Revenue opportunity: $${Math.abs(comparison.vsIndustryAverage.revenue.difference).toLocaleString()} below industry average`);
    }

    // Efficiency insights
    if (comparison.vsIndustryAverage.efficiency.betterBy && comparison.vsIndustryAverage.efficiency.difference > 3) {
      insights.push(`Excellent efficiency: ${comparison.vsIndustryAverage.efficiency.difference.toFixed(1)}% less deadhead than industry average`);
    }

    // Growth insights
    if (summary.growth && summary.growth.revenue > 15) {
      insights.push(`Strong growth trajectory: ${summary.growth.revenue.toFixed(1)}% revenue increase month-over-month`);
    }

    // Opportunity insights
    if (comparison.vsTopPerformers.revenueGap > 5000) {
      insights.push(`Revenue potential: Top performers earn $${comparison.vsTopPerformers.revenueGap.toLocaleString()} more monthly`);
    }

    return insights;
  }

  public getStatus(): any {
    return {
      driversTracked: this.performanceData.size,
      totalMetrics: Array.from(this.performanceData.values()).flat().length,
      benchmarksAvailable: this.benchmarkData.size
    };
  }
}

export const performanceAnalytics = new DriverPerformanceAnalytics();