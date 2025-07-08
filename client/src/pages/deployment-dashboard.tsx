import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, Rocket, Database, Key, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeploymentStatus {
  demo_data_cleared: boolean;
  api_keys_configured: boolean;
  live_systems_active: boolean;
  revenue_ready: boolean;
  api_validation: {
    valid: boolean;
    missing: string[];
  };
  timestamp: string;
}

export default function DeploymentDashboard() {
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/deploy/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching deployment status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deployment status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deployLive = async () => {
    setDeploying(true);
    try {
      const response = await fetch('/api/deploy/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Deployment Successful! 🚀",
          description: result.message,
        });
        fetchStatus(); // Refresh status
      } else {
        toast({
          title: "Deployment Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Deployment Error",
        description: "Failed to activate live deployment",
        variant: "destructive"
      });
    } finally {
      setDeploying(false);
    }
  };

  const clearDemoData = async () => {
    try {
      const response = await fetch('/api/deploy/clear-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Demo Data Cleared",
          description: "All demo data has been removed",
        });
        fetchStatus();
      } else {
        toast({
          title: "Clear Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Clear Error",
        description: "Failed to clear demo data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading deployment status...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getOverallProgress = () => {
    if (!status) return 0;
    let completed = 0;
    if (status.demo_data_cleared) completed += 25;
    if (status.api_keys_configured) completed += 35;
    if (status.live_systems_active) completed += 25;
    if (status.revenue_ready) completed += 15;
    return completed;
  };

  const isReadyForDeployment = status?.api_keys_configured && !status?.live_systems_active;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Deployment Dashboard</h1>
          <p className="text-muted-foreground">Activate your platform for real revenue generation</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={clearDemoData} 
            variant="outline"
            disabled={deploying || status?.demo_data_cleared}
          >
            <Database className="h-4 w-4 mr-2" />
            Clear Demo Data
          </Button>
          <Button 
            onClick={deployLive} 
            disabled={!isReadyForDeployment || deploying}
            className="bg-green-600 hover:bg-green-700"
          >
            <Rocket className="h-4 w-4 mr-2" />
            {deploying ? "Deploying..." : "Deploy Live"}
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Deployment Progress
          </CardTitle>
          <CardDescription>
            Overall progress towards live deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getOverallProgress()} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {getOverallProgress()}% Complete
            </p>
            {status?.revenue_ready && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  🎉 Platform is live and ready for revenue generation!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Keys Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys Configuration
          </CardTitle>
          <CardDescription>
            Required API keys for full functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Overall API Keys Status</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.api_keys_configured || false)}
                <Badge variant={status?.api_keys_configured ? "default" : "destructive"}>
                  {status?.api_keys_configured ? "Configured" : "Missing Keys"}
                </Badge>
              </div>
            </div>
            
            {status?.api_validation?.missing && status.api_validation.missing.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  Missing API Keys: {status.api_validation.missing.join(', ')}
                  <br />
                  Please configure these keys to enable full functionality.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Checklist */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deployment Checklist</CardTitle>
            <CardDescription>
              Current status of deployment requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Demo Data Cleared</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.demo_data_cleared || false)}
                <Badge variant={status?.demo_data_cleared ? "default" : "secondary"}>
                  {status?.demo_data_cleared ? "Cleared" : "Active"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>API Keys Configured</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.api_keys_configured || false)}
                <Badge variant={status?.api_keys_configured ? "default" : "destructive"}>
                  {status?.api_keys_configured ? "Ready" : "Missing"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Live Systems Active</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.live_systems_active || false)}
                <Badge variant={status?.live_systems_active ? "default" : "secondary"}>
                  {status?.live_systems_active ? "Active" : "Pending"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Revenue Ready</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status?.revenue_ready || false)}
                <Badge variant={status?.revenue_ready ? "default" : "secondary"}>
                  {status?.revenue_ready ? "Ready" : "Pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Potential</CardTitle>
            <CardDescription>
              Expected monthly revenue after deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">$60,000+</div>
              <p className="text-sm text-muted-foreground">Monthly Autonomous Revenue</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Load Optimization</span>
                <span className="text-sm font-medium">$35,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Customer Acquisition</span>
                <span className="text-sm font-medium">$15,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Platform Fees</span>
                <span className="text-sm font-medium">$10,000</span>
              </div>
            </div>
            
            {status?.revenue_ready && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800 text-center">
                  Revenue generation is now active!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      {status?.timestamp && (
        <div className="text-sm text-muted-foreground text-center">
          Last updated: {new Date(status.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}