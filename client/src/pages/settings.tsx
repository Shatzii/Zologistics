import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, Users, Shield, Bell, Database, Zap, 
  Globe, Truck, MapPin, DollarSign, Eye, Save,
  Key, Lock, Wifi, Smartphone, Cloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [companyInfo, setCompanyInfo] = useState({
    name: "Elite Trucking Solutions",
    address: "123 Logistics Blvd, Dallas, TX 75201",
    phone: "(555) 123-4567",
    email: "contact@elitetrucking.com",
    mcNumber: "MC-123456",
    dotNumber: "DOT-987654"
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    realTimeUpdates: true,
    darkMode: false,
    autoRefresh: 30,
    currency: "USD",
    timezone: "America/Chicago"
  });

  const [apiSettings, setApiSettings] = useState({
    openaiEnabled: true,
    weatherEnabled: true,
    routeOptimization: true,
    voiceCommands: false,
    blockchainIntegration: true
  });

  const { data: securityReport } = useQuery({
    queryKey: ["/api/security/report"]
  });

  const { data: complianceStatus } = useQuery({
    queryKey: ["/api/security/compliance"]
  });

  const { data: iotDevices } = useQuery({
    queryKey: ["/api/iot/devices"]
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate({
      companyInfo,
      preferences,
      apiSettings
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your trucking dispatch system configuration</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="devices">IoT Devices</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Update your company details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mcNumber">MC Number</Label>
                    <Input
                      id="mcNumber"
                      value={companyInfo.mcNumber}
                      onChange={(e) => setCompanyInfo({...companyInfo, mcNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dotNumber">DOT Number</Label>
                    <Input
                      id="dotNumber"
                      value={companyInfo.dotNumber}
                      onChange={(e) => setCompanyInfo({...companyInfo, dotNumber: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Preferences
                </CardTitle>
                <CardDescription>Configure your system preferences and display options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">Enable live data updates</p>
                  </div>
                  <Switch
                    checked={preferences.realTimeUpdates}
                    onCheckedChange={(checked) => setPreferences({...preferences, realTimeUpdates: checked})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoRefresh">Auto Refresh (seconds)</Label>
                  <Select value={preferences.autoRefresh.toString()} onValueChange={(value) => setPreferences({...preferences, autoRefresh: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => setPreferences({...preferences, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={preferences.currency} onValueChange={(value) => setPreferences({...preferences, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI & Automation
                </CardTitle>
                <CardDescription>Configure AI-powered features and automation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>OpenAI Integration</Label>
                    <p className="text-sm text-muted-foreground">AI-powered rate analysis and recommendations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={apiSettings.openaiEnabled ? "default" : "secondary"}>
                      {apiSettings.openaiEnabled ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={apiSettings.openaiEnabled}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, openaiEnabled: checked})}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Voice Commands</Label>
                    <p className="text-sm text-muted-foreground">Natural language voice control interface</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={apiSettings.voiceCommands ? "default" : "secondary"}>
                      {apiSettings.voiceCommands ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={apiSettings.voiceCommands}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, voiceCommands: checked})}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Route Optimization</Label>
                    <p className="text-sm text-muted-foreground">AI-powered route planning and optimization</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={apiSettings.routeOptimization ? "default" : "secondary"}>
                      {apiSettings.routeOptimization ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={apiSettings.routeOptimization}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, routeOptimization: checked})}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Blockchain Contracts</Label>
                    <p className="text-sm text-muted-foreground">Smart contract automation and payments</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={apiSettings.blockchainIntegration ? "default" : "secondary"}>
                      {apiSettings.blockchainIntegration ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={apiSettings.blockchainIntegration}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, blockchainIntegration: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  External Services
                </CardTitle>
                <CardDescription>Manage connections to third-party services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weather Intelligence</Label>
                    <p className="text-sm text-muted-foreground">Real-time weather data and route impact analysis</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={apiSettings.weatherEnabled ? "default" : "secondary"}>
                      {apiSettings.weatherEnabled ? "Connected" : "Disconnected"}
                    </Badge>
                    <Switch
                      checked={apiSettings.weatherEnabled}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, weatherEnabled: checked})}
                    />
                  </div>
                </div>
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    Some integrations may require API keys. Contact support for configuration assistance.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Load Board APIs</Label>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>DAT Integration</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Truckstop.com</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>123LoadBoard</span>
                        <Badge variant="secondary">Inactive</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fleet Management</Label>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Samsara</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Geotab</span>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Omnitracs</span>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
                <CardDescription>Current security status and threat monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Security Score</span>
                  <Badge variant="default">94/100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Threats</span>
                  <Badge variant={securityReport?.activeThreats?.length > 0 ? "destructive" : "default"}>
                    {securityReport?.activeThreats?.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Security Scan</span>
                  <span className="text-sm text-muted-foreground">2 minutes ago</span>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Compliance Status</h4>
                  {complianceStatus?.slice(0, 4).map((check, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{check.regulation}</span>
                      <Badge variant={check.status === 'compliant' ? "default" : "secondary"}>
                        {check.status}
                      </Badge>
                    </div>
                  )) || (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">FMCSA</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">DOT</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">GDPR</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Access Control
                </CardTitle>
                <CardDescription>Manage user permissions and data encryption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enhanced account security</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">AES-256 encryption for sensitive data</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Track all user activities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Push Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Real-time Alerts</Label>
                        <p className="text-sm text-muted-foreground">Load updates and driver status</p>
                      </div>
                      <Switch
                        checked={preferences.notifications}
                        onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Daily reports and summaries</p>
                      </div>
                      <Switch
                        checked={preferences.emailAlerts}
                        onCheckedChange={(checked) => setPreferences({...preferences, emailAlerts: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Alerts</Label>
                        <p className="text-sm text-muted-foreground">Critical alerts via text message</p>
                      </div>
                      <Switch
                        checked={preferences.smsAlerts}
                        onCheckedChange={(checked) => setPreferences({...preferences, smsAlerts: checked})}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Alert Types</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Load Status Changes", enabled: true },
                      { label: "Driver Availability", enabled: true },
                      { label: "Rate Negotiations", enabled: false },
                      { label: "Weather Alerts", enabled: true },
                      { label: "Security Events", enabled: true },
                      { label: "System Maintenance", enabled: false }
                    ].map((alert, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Label>{alert.label}</Label>
                        <Switch defaultChecked={alert.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                IoT Device Management
              </CardTitle>
              <CardDescription>Monitor and configure connected devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {iotDevices?.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium">{device.type.toUpperCase()} - {device.id}</p>
                        <p className="text-sm text-muted-foreground">
                          Driver ID: {device.driverId} | Last Update: {new Date(device.lastUpdate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={device.status === 'online' ? "default" : "destructive"}>
                        {device.status}
                      </Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground py-8">
                    <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No IoT devices connected</p>
                    <p className="text-sm">Connect devices to monitor real-time vehicle data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>Advanced data and system configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Retention Period</Label>
                  <Select defaultValue="365">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">3 months</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="1095">3 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Daily encrypted backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Data Collection</Label>
                    <p className="text-sm text-muted-foreground">Performance and usage analytics</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  System Monitoring
                </CardTitle>
                <CardDescription>Performance monitoring and debugging options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Detailed system logging</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Performance Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Track system performance metrics</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View System Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}