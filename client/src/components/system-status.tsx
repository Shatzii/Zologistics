import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Globe, Brain, Shield, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function SystemStatus() {
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/system-status"],
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 15000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'enabled':
        return <CheckCircle className="w-4 h-4" />;
      case 'limited_gpu':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active': 
      case 'enabled':
        return 'bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20 text-green-800 dark:text-green-400';
      case 'limited_gpu':
        return 'bg-yellow-50 dark:bg-yellow-600/10 border-yellow-200 dark:border-yellow-600/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-50 dark:bg-gray-600/10 border-gray-200 dark:border-gray-600/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'active':
        return 'Active';
      case 'enabled':
        return 'Enabled';
      case 'limited_gpu':
        return 'Limited GPU';
      default:
        return status;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-600/10 border-yellow-200 dark:border-yellow-600/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-600/10 border-red-200 dark:border-red-600/20';
      default:
        return 'bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-600/20';
    }
  };

  const statusItems = [
    { icon: Database, label: "Replit DB", status: systemStatus?.replitDb || 'loading' },
    { icon: Globe, label: "Load Board Scraper", status: systemStatus?.loadBoardScraper || 'loading' },
    { icon: Brain, label: "AI Engine (GPT-4o)", status: systemStatus?.aiEngine || 'loading' },
    { icon: Shield, label: "Auto-Recovery", status: systemStatus?.autoRecovery || 'loading' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(item.status)}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(item.status)}
                  <span className="text-xs font-medium">
                    {getStatusText(item.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Alerts</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.slice(0, 3).map((alert: any) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs mt-1 opacity-80">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">No recent alerts</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
