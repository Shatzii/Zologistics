import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Phone,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Key
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import TwoFactorSetup from "@/components/two-factor-setup";
import TwoFactorVerification from "@/components/two-factor-verification";

export default function AdminTwoFactorSettings() {
  const { twoFactorSettings, saveTwoFactorSettings, disableTwoFactor } = useAdminAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [backupCodes] = useState([
    'A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2', 'M3N4O5P6', 'Q7R8S9T0'
  ]);

  const handleEnableTwoFactor = () => {
    setShowSetup(true);
  };

  const handleDisableTwoFactor = async () => {
    setIsDisabling(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    disableTwoFactor();
    setIsDisabling(false);
  };

  const handleSetupComplete = (method: 'sms' | 'email' | 'totp', secret?: string) => {
    const contact = method === 'sms' ? '+1 205 434 8405' : method === 'email' ? 'admin@zologistics.com' : undefined;
    saveTwoFactorSettings({
      enabled: true,
      method,
      contact,
      secret
    });
    setShowSetup(false);
  };

  const handleVerificationSuccess = () => {
    setShowVerification(false);
  };

  const getMethodIcon = (method: 'sms' | 'email' | 'totp') => {
    switch (method) {
      case 'sms': return Phone;
      case 'email': return Mail;
      case 'totp': return Smartphone;
    }
  };

  const getMethodLabel = (method: 'sms' | 'email' | 'totp') => {
    switch (method) {
      case 'sms': return 'SMS Text Message';
      case 'email': return 'Email Verification';
      case 'totp': return 'Authenticator App';
    }
  };

  if (showSetup) {
    return (
      <TwoFactorSetup
        onSetupComplete={handleSetupComplete}
        onSkip={() => setShowSetup(false)}
      />
    );
  }

  if (showVerification) {
    return (
      <TwoFactorVerification
        method={twoFactorSettings.method}
        contact={twoFactorSettings.contact}
        onSuccess={handleVerificationSuccess}
        onCancel={() => setShowVerification(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Two-Factor Authentication Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security with two-factor authentication
          </p>
        </div>

        {/* Current Status */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {twoFactorSettings.enabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    Two-Factor Authentication is {twoFactorSettings.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                  {twoFactorSettings.enabled && (
                    <p className="text-sm text-muted-foreground">
                      Method: {getMethodLabel(twoFactorSettings.method)}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={twoFactorSettings.enabled ? "default" : "destructive"}>
                {twoFactorSettings.enabled ? 'Secure' : 'Vulnerable'}
              </Badge>
            </div>

            {!twoFactorSettings.enabled && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  Your admin account is not protected by two-factor authentication. 
                  Enable 2FA to add an extra layer of security.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Two-Factor Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Enable Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require a second form of authentication when signing in
                </p>
              </div>
              <Switch
                checked={twoFactorSettings.enabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleEnableTwoFactor();
                  } else {
                    handleDisableTwoFactor();
                  }
                }}
                disabled={isDisabling}
              />
            </div>

            {twoFactorSettings.enabled && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    Current Method
                  </h3>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const Icon = getMethodIcon(twoFactorSettings.method);
                        return <Icon className="h-5 w-5 text-muted-foreground" />;
                      })()}
                      <div>
                        <p className="font-medium">{getMethodLabel(twoFactorSettings.method)}</p>
                        {twoFactorSettings.contact && (
                          <p className="text-sm text-muted-foreground">
                            {twoFactorSettings.contact}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSetup(true)}
                    >
                      Change Method
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVerification(true)}
                    >
                      Test Current Method
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Backup Codes */}
        {twoFactorSettings.enabled && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Backup Recovery Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These backup codes can be used to access your account if you lose your primary 2FA device. 
                Store them securely and use each code only once.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <code className="bg-background px-2 py-1 rounded text-sm font-mono">
                        {code}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        {index < 2 ? 'Used' : 'Available'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  Generate New Codes
                </Button>
                <Button variant="outline" size="sm">
                  Download Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Timeline */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Security Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">2FA Setup Completed</p>
                  <p className="text-sm text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Admin Login Successful</p>
                  <p className="text-sm text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}