import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Building, Key, Bell, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDirty, setIsDirty] = useState(false);

  const saveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
    setIsDirty(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences</p>
        </div>
        {isDirty && (
          <Button onClick={saveSettings}>
            Save Changes
          </Button>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Profile
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" onChange={() => setIsDirty(true)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" onChange={() => setIsDirty(true)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@company.com" onChange={() => setIsDirty(true)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 123-4567" onChange={() => setIsDirty(true)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select onValueChange={() => setIsDirty(true)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Standard Time</SelectItem>
                    <SelectItem value="mst">Mountain Standard Time</SelectItem>
                    <SelectItem value="cst">Central Standard Time</SelectItem>
                    <SelectItem value="est">Eastern Standard Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" onChange={() => setIsDirty(true)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" onChange={() => setIsDirty(true)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" onChange={() => setIsDirty(true)} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="twoFactor" onCheckedChange={() => setIsDirty(true)} />
                <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Acme Trucking Co." onChange={() => setIsDirty(true)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mcNumber">MC Number</Label>
                <Input id="mcNumber" placeholder="MC-123456" onChange={() => setIsDirty(true)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dotNumber">DOT Number</Label>
                <Input id="dotNumber" placeholder="12345678" onChange={() => setIsDirty(true)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea id="address" placeholder="123 Main St, City, State 12345" onChange={() => setIsDirty(true)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ein">EIN</Label>
                  <Input id="ein" placeholder="12-3456789" onChange={() => setIsDirty(true)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://company.com" onChange={() => setIsDirty(true)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating Preferences</CardTitle>
              <CardDescription>Configure operational settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultFuelSurcharge">Default Fuel Surcharge (%)</Label>
                <Input id="defaultFuelSurcharge" type="number" placeholder="15" onChange={() => setIsDirty(true)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultMargin">Default Profit Margin (%)</Label>
                <Input id="defaultMargin" type="number" placeholder="20" onChange={() => setIsDirty(true)} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="autoNegotiation" onCheckedChange={() => setIsDirty(true)} />
                <Label htmlFor="autoNegotiation">Enable Automatic Rate Negotiation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="loadMatching" onCheckedChange={() => setIsDirty(true)} />
                <Label htmlFor="loadMatching">Enable AI Load Matching</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Configuration
              </CardTitle>
              <CardDescription>Manage external service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">OpenAI API</h4>
                    <p className="text-sm text-muted-foreground">For AI-powered rate optimization</p>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datApiKey">DAT Load Board API Key</Label>
                  <Input 
                    id="datApiKey" 
                    type="password" 
                    placeholder="Enter DAT API key" 
                    onChange={() => setIsDirty(true)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="truckstopUsername">Truckstop.com Username</Label>
                  <Input 
                    id="truckstopUsername" 
                    placeholder="Username" 
                    onChange={() => setIsDirty(true)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="truckstopPassword">Truckstop.com Password</Label>
                  <Input 
                    id="truckstopPassword" 
                    type="password" 
                    placeholder="Password" 
                    onChange={() => setIsDirty(true)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loadBoard123Token">123LoadBoard API Token</Label>
                  <Input 
                    id="loadBoard123Token" 
                    type="password" 
                    placeholder="API Token" 
                    onChange={() => setIsDirty(true)} 
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Test All Connections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Control when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Load Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get notified of new available loads</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => setIsDirty(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Rate Negotiation Updates</h4>
                    <p className="text-sm text-muted-foreground">Updates on AI negotiation progress</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => setIsDirty(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Driver Status Changes</h4>
                    <p className="text-sm text-muted-foreground">When drivers update their status</p>
                  </div>
                  <Switch onCheckedChange={() => setIsDirty(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Alerts</h4>
                    <p className="text-sm text-muted-foreground">Important system notifications</p>
                  </div>
                  <Switch defaultChecked onCheckedChange={() => setIsDirty(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-muted-foreground">Automated weekly performance reports</p>
                  </div>
                  <Switch onCheckedChange={() => setIsDirty(true)} />
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <h4 className="font-medium">Notification Methods</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="emailNotif" defaultChecked />
                    <Label htmlFor="emailNotif">Email notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="smsNotif" />
                    <Label htmlFor="smsNotif">SMS notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="pushNotif" defaultChecked />
                    <Label htmlFor="pushNotif">Browser push notifications</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select onValueChange={() => setIsDirty(true)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <Select onValueChange={() => setIsDirty(true)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select onValueChange={() => setIsDirty(true)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reduced Motion</h4>
                    <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <Switch onCheckedChange={() => setIsDirty(true)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">High Contrast</h4>
                    <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch onCheckedChange={() => setIsDirty(true)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}