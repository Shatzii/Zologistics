import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import logoPath from "@assets/ChatGPT Image Jul 10, 2025, 07_30_44 AM_1752499822142.png";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import TwoFactorSetup from "@/components/two-factor-setup";
import TwoFactorVerification from "@/components/two-factor-verification";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { twoFactorSettings, completeTwoFactorSetup, verifyTwoFactor } = useAdminAuth();
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showTwoFactorVerification, setShowTwoFactorVerification] = useState(false);

  // Admin credentials - in production these would be hashed and stored securely
  const ADMIN_CREDENTIALS = {
    username: "zolo_admin",
    password: "Zologistics2025!"
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (
      credentials.username === ADMIN_CREDENTIALS.username && 
      credentials.password === ADMIN_CREDENTIALS.password
    ) {
      // Store admin session
      localStorage.setItem("zolo_admin_authenticated", "true");
      localStorage.setItem("zolo_admin_login_time", Date.now().toString());
      
      // Check if 2FA is enabled
      if (twoFactorSettings.enabled) {
        setShowTwoFactorVerification(true);
      } else {
        // Offer to set up 2FA
        setShowTwoFactorSetup(true);
      }
    } else {
      setError("Invalid username or password. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleTwoFactorSetup = (method: 'sms' | 'email' | 'totp', secret?: string) => {
    const contact = method === 'sms' ? '+1 (555) 123-4567' : method === 'email' ? 'admin@zologistics.com' : undefined;
    completeTwoFactorSetup(method, contact, secret);
    setShowTwoFactorSetup(false);
    setLocation("/platform");
  };

  const handleSkipTwoFactor = () => {
    setShowTwoFactorSetup(false);
    setLocation("/platform");
  };

  const handleTwoFactorVerification = () => {
    verifyTwoFactor();
    setShowTwoFactorVerification(false);
    setLocation("/platform");
  };

  const handleCancelTwoFactor = () => {
    setShowTwoFactorVerification(false);
    // Clear authentication since 2FA was cancelled
    localStorage.removeItem("zolo_admin_authenticated");
    localStorage.removeItem("zolo_admin_login_time");
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError(""); // Clear error when user types
  };

  // Show 2FA setup if requested
  if (showTwoFactorSetup) {
    return (
      <TwoFactorSetup
        onSetupComplete={handleTwoFactorSetup}
        onSkip={handleSkipTwoFactor}
      />
    );
  }

  // Show 2FA verification if required
  if (showTwoFactorVerification) {
    return (
      <TwoFactorVerification
        method={twoFactorSettings.method}
        contact={twoFactorSettings.contact}
        onSuccess={handleTwoFactorVerification}
        onCancel={handleCancelTwoFactor}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={logoPath} 
              alt="Zologistics Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Zologistics</h1>
          <p className="text-muted-foreground">Admin Portal Access</p>
        </div>

        {/* Login Card */}
        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <Shield className="h-6 w-6 mr-2 text-primary" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={credentials.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !credentials.username || !credentials.password}
              >
                {isLoading ? "Authenticating..." : "Login to Admin Portal"}
              </Button>
            </form>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Demo Admin Credentials:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Username: <code className="bg-background px-1 rounded">zolo_admin</code></div>
                <div>Password: <code className="bg-background px-1 rounded">Zologistics2025!</code></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Site */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            className="text-muted-foreground"
          >
            ← Back to Zologistics Home
          </Button>
        </div>
      </div>
    </div>
  );
}