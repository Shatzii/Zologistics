import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, KeyRound as Key, Shield, Copy, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SecretConfig {
  key: string;
  name: string;
  description: string;
  placeholder: string;
  required: boolean;
  category: string;
  helpUrl?: string;
}

const secretConfigs: SecretConfig[] = [
  {
    key: "VITE_STRIPE_PUBLIC_KEY",
    name: "Stripe Publishable Key",
    description: "Your Stripe publishable key (safe for frontend)",
    placeholder: "pk_test_... or pk_live_...",
    required: true,
    category: "Payment Processing",
    helpUrl: "https://dashboard.stripe.com/apikeys"
  },
  {
    key: "STRIPE_SECRET_KEY",
    name: "Stripe Secret Key",
    description: "Your Stripe secret key (backend only)",
    placeholder: "sk_test_... or sk_live_...",
    required: true,
    category: "Payment Processing",
    helpUrl: "https://dashboard.stripe.com/apikeys"
  },
  {
    key: "DAT_API_KEY",
    name: "DAT Load Board API Key",
    description: "Premium DAT access for live load data",
    placeholder: "Enter your DAT API key",
    required: false,
    category: "Load Boards",
    helpUrl: "https://www.dat.com/industry-solutions/api"
  },
  {
    key: "TRUCKSTOP_API_KEY",
    name: "Truckstop.com API Key",
    description: "Premium Truckstop access for live load data",
    placeholder: "Enter your Truckstop API key",
    required: false,
    category: "Load Boards"
  },
  {
    key: "SENDGRID_API_KEY",
    name: "SendGrid API Key",
    description: "Email notifications and marketing",
    placeholder: "SG.xxxxx",
    required: false,
    category: "Communications"
  },
  {
    key: "ANTHROPIC_API_KEY",
    name: "Anthropic API Key",
    description: "Claude AI for advanced analysis",
    placeholder: "sk-ant-xxxxx",
    required: false,
    category: "AI Services"
  }
];

export default function SecretsConfig() {
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSecretChange = (key: string, value: string) => {
    setSecrets(prev => ({ ...prev, [key]: value }));
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSecrets = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/admin/secrets", { secrets });
      toast({
        title: "Success",
        description: "Secrets saved successfully. Restart required to take effect.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save secrets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const groupedConfigs = secretConfigs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, SecretConfig[]>);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Keys & Secrets Configuration</h1>
        <p className="text-muted-foreground">
          Configure your API keys to unlock premium features and live data integration.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedConfigs).map(([category, configs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {category}
                <Badge variant="outline">
                  {configs.filter(c => c.required).length} required
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {configs.map((config) => (
                <div key={config.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={config.key} className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      {config.name}
                      {config.required && <Badge variant="destructive" className="h-5 text-xs">Required</Badge>}
                    </Label>
                    {config.helpUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(config.helpUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Get Key
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  
                  <div className="relative">
                    {config.key.includes('SECRET') ? (
                      <Textarea
                        id={config.key}
                        placeholder={config.placeholder}
                        value={secrets[config.key] || ''}
                        onChange={(e) => handleSecretChange(config.key, e.target.value)}
                        className="min-h-[100px] font-mono text-sm"
                        style={{ 
                          filter: showSecrets[config.key] ? 'none' : 'blur(4px)',
                          transition: 'filter 0.2s'
                        }}
                      />
                    ) : (
                      <Input
                        id={config.key}
                        type={showSecrets[config.key] ? 'text' : 'password'}
                        placeholder={config.placeholder}
                        value={secrets[config.key] || ''}
                        onChange={(e) => handleSecretChange(config.key, e.target.value)}
                        className="font-mono"
                      />
                    )}
                    
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleShowSecret(config.key)}
                        className="h-8 w-8 p-0"
                      >
                        {showSecrets[config.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      
                      {secrets[config.key] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(secrets[config.key])}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <p>• Secrets are encrypted and stored securely</p>
          <p>• Restart the application after saving to apply changes</p>
          <p>• Use test keys for development, live keys for production</p>
        </div>
        
        <Button 
          onClick={handleSaveSecrets}
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Saving...' : 'Save All Secrets'}
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🔥 Immediate Setup (Required)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Stripe keys - Enable payment processing</li>
                <li>• Start with test keys for development</li>
                <li>• Switch to live keys for production</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">⚡ Premium Features (Optional)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• DAT API - Live load data ($149/month)</li>
                <li>• Truckstop API - Premium loads ($129/month)</li>
                <li>• SendGrid - Email automation</li>
                <li>• Anthropic - Advanced AI analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}