import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Phone,
  Clock,
  RefreshCw
} from "lucide-react";

interface TwoFactorVerificationProps {
  method: 'sms' | 'email' | 'totp';
  contact?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerification({ 
  method, 
  contact, 
  onSuccess, 
  onCancel 
}: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (method !== 'totp') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [method]);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError('');

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Demo verification codes
    const validCodes = {
      sms: '123456',
      email: '789012',
      totp: '123456'
    };

    if (verificationCode === validCodes[method]) {
      onSuccess();
    } else {
      setError('Invalid verification code. Please try again.');
    }
    
    setIsVerifying(false);
  };

  const handleResend = async () => {
    setError('');
    setCanResend(false);
    setTimeLeft(300);
    
    // Simulate resend
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMethodInfo = () => {
    switch (method) {
      case 'sms':
        return {
          icon: Phone,
          title: 'SMS Verification',
          description: `We've sent a 6-digit code to ${contact}`,
          badge: 'SMS'
        };
      case 'email':
        return {
          icon: Mail,
          title: 'Email Verification',
          description: `We've sent a 6-digit code to ${contact}`,
          badge: 'Email'
        };
      case 'totp':
        return {
          icon: Smartphone,
          title: 'Authenticator App',
          description: 'Enter the code from your authenticator app',
          badge: 'TOTP'
        };
    }
  };

  const methodInfo = getMethodInfo();
  const MethodIcon = methodInfo.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            Two-Factor Authentication
          </CardTitle>
          <Badge variant="outline" className="mx-auto">
            {methodInfo.badge}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-muted p-6 rounded-lg">
              <MethodIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{methodInfo.title}</h3>
              <p className="text-sm text-muted-foreground">
                {methodInfo.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification">Verification Code</Label>
              <Input
                id="verification"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg font-mono"
                autoComplete="one-time-code"
              />
            </div>

            {method !== 'totp' && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={!canResend}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Resend Code
                </Button>
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Demo codes display */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Demo Verification Codes:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>SMS: <code className="bg-background px-1 rounded">123456</code></div>
                <div>Email: <code className="bg-background px-1 rounded">789012</code></div>
                <div>TOTP: <code className="bg-background px-1 rounded">123456</code></div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleVerify}
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}