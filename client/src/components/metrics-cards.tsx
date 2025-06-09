import { Card, CardContent } from "@/components/ui/card";
import { Truck, UserCheck, DollarSign, Bot, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: "Active Loads",
      value: metrics?.activeLoads || 0,
      icon: Truck,
      color: "bg-blue-100 dark:bg-blue-600/20 text-blue-600",
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Available Drivers", 
      value: metrics?.availableDrivers || 0,
      icon: UserCheck,
      color: "bg-green-100 dark:bg-green-600/20 text-green-600",
      trend: { value: 5, isPositive: true },
    },
    {
      title: "Avg Rate/Mile",
      value: `$${metrics?.avgRate?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: "bg-orange-100 dark:bg-orange-600/20 text-orange-600",
      trend: { value: 3, isPositive: false },
    },
    {
      title: "AI Matches",
      value: metrics?.aiMatches || 0,
      icon: Bot,
      color: "bg-yellow-100 dark:bg-yellow-600/20 text-yellow-600",
      trend: { value: 28, isPositive: true },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend.isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={metric.title} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {metric.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`flex items-center ${
                  metric.trend.isPositive 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  {metric.trend.value}%
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  from last week
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
