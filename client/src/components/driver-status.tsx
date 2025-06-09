import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Driver } from "@shared/schema";

export function DriverStatus() {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ["/api/drivers"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'en_route':
        return 'status-en-route';
      case 'off_duty':
        return 'status-off-duty';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available', color: 'text-green-600 dark:text-green-400' };
      case 'en_route':
        return { text: 'En Route', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'off_duty':
        return { text: 'Off Duty', color: 'text-red-600 dark:text-red-400' };
      default:
        return { text: 'Unknown', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Driver Status</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {drivers?.map((driver: Driver) => {
          const statusInfo = getStatusText(driver.status);
          
          return (
            <div
              key={driver.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {driver.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {driver.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {driver.currentLocation}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(driver.status)}`}></span>
                <span className={`text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
          );
        })}
        {(!drivers || drivers.length === 0) && (
          <div className="text-center py-8">
            <div className="text-gray-500">No drivers available</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
