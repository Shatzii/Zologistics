import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertTriangle, Mic, Camera, Zap, DollarSign } from 'lucide-react';

interface FeatureStatus {
  name: string;
  status: 'complete' | 'partial' | 'broken' | 'missing';
  description: string;
  apiEndpoint?: string;
  requirements: string[];
  progress: number;
}

export default function FeatureCompletionDashboard() {
  const [features, setFeatures] = useState<FeatureStatus[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeFeatureStatuses();
    testAllFeatures();
  }, []);

  const initializeFeatureStatuses = () => {
    const featureList: FeatureStatus[] = [
      {
        name: 'Voice Assistant',
        status: 'complete',
        description: 'Real-time voice command processing with OpenAI Whisper integration',
        apiEndpoint: '/api/voice/process-command',
        requirements: ['OpenAI API Key (optional for enhanced features)', 'Audio processing capabilities'],
        progress: 100
      },
      {
        name: 'Computer Vision',
        status: 'complete',
        description: 'Document analysis and cargo inspection with AI-powered OCR',
        apiEndpoint: '/api/vision/analyze-document',
        requirements: ['OpenAI API Key (optional for enhanced analysis)', 'Image processing'],
        progress: 100
      },
      {
        name: 'Autonomous Operations',
        status: 'complete',
        description: 'Customer acquisition and broker agreement automation',
        apiEndpoint: '/api/autonomous/customer-acquisition',
        requirements: ['Email system integration', 'Customer data sources'],
        progress: 100
      },
      {
        name: 'Production Email System',
        status: 'complete',
        description: 'Multi-provider email delivery with queue management',
        apiEndpoint: '/api/email/queue-stats',
        requirements: ['SMTP credentials or email service API keys'],
        progress: 100
      },
      {
        name: 'Load Board Integration',
        status: 'partial',
        description: 'Framework ready for real load board connections',
        apiEndpoint: '/api/load-boards/loads',
        requirements: ['DAT API Key', 'Truckstop API Key', '123LoadBoard API Key'],
        progress: 60
      },
      {
        name: 'Weather Intelligence',
        status: 'partial',
        description: 'Route weather analysis framework implemented',
        apiEndpoint: '/api/weather/route-conditions/Atlanta/Phoenix',
        requirements: ['Weather API Key (OpenWeatherMap or AccuWeather)'],
        progress: 60
      },
      {
        name: 'Payment Processing',
        status: 'partial',
        description: 'Payment framework with processor integration ready',
        apiEndpoint: '/api/payments/process',
        requirements: ['Stripe API Key or payment processor credentials'],
        progress: 60
      },
      {
        name: 'Carrier Solutions Suite',
        status: 'complete',
        description: 'Comprehensive carrier management and optimization tools',
        apiEndpoint: '/api/carrier-solutions/stats',
        requirements: ['No additional requirements - fully operational'],
        progress: 100
      },
      {
        name: 'Open Source ELD Integration',
        status: 'complete',
        description: 'Custom ELD hardware integration with Raspberry Pi solutions',
        apiEndpoint: '/api/open-source-eld/devices',
        requirements: ['Hardware setup (Raspberry Pi + GPS + sensors)'],
        progress: 100
      }
    ];

    setFeatures(featureList);
  };

  const testAllFeatures = async () => {
    setLoading(true);
    const results: Record<string, any> = {};

    for (const feature of features) {
      if (feature.apiEndpoint) {
        try {
          const result = await testFeature(feature.apiEndpoint);
          results[feature.name] = { success: true, data: result };
        } catch (error) {
          results[feature.name] = { success: false, error: error.message };
        }
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const testFeature = async (endpoint: string) => {
    if (endpoint.includes('/process-command')) {
      return await apiRequest(endpoint, {
        method: 'POST',
        body: { driverId: 1, text: 'Test voice command' }
      });
    } else if (endpoint.includes('/analyze-document')) {
      return await apiRequest(endpoint, {
        method: 'POST',
        body: { 
          imageUrl: 'https://example.com/test-document.jpg', 
          documentType: 'bill_of_lading' 
        }
      });
    } else if (endpoint.includes('/payments/process')) {
      return await apiRequest(endpoint, {
        method: 'POST',
        body: { amount: 100, driverId: 1, method: 'test' }
      });
    } else {
      return await apiRequest(endpoint);
    }
  };

  const testVoiceCommand = async () => {
    try {
      const result = await apiRequest('/api/voice/process-command', {
        method: 'POST',
        body: { 
          driverId: 1, 
          text: 'Accept load 2001'
        }
      });
      
      toast({
        title: "Voice Command Test Successful",
        description: `Response: ${result.response}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Voice Command Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const testDocumentAnalysis = async () => {
    try {
      const result = await apiRequest('/api/vision/analyze-document', {
        method: 'POST',
        body: { 
          imageUrl: 'https://example.com/sample-bol.jpg', 
          documentType: 'bill_of_lading' 
        }
      });
      
      toast({
        title: "Document Analysis Test Successful",
        description: `Analysis completed with ${(result.confidence * 100).toFixed(1)}% confidence`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Document Analysis Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: FeatureStatus['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'broken':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'missing':
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: FeatureStatus['status']) => {
    const variants = {
      complete: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      broken: 'bg-red-100 text-red-800',
      missing: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const completedFeatures = features.filter(f => f.status === 'complete').length;
  const totalFeatures = features.length;
  const overallProgress = (completedFeatures / totalFeatures) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Completion Dashboard</h1>
          <p className="text-gray-600">Track implementation status of all platform features</p>
        </div>
        <Button onClick={testAllFeatures} disabled={loading}>
          {loading ? 'Testing...' : 'Test All Features'}
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Platform Completion Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{completedFeatures}/{totalFeatures} Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{features.filter(f => f.status === 'complete').length}</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{features.filter(f => f.status === 'partial').length}</div>
                <div className="text-sm text-gray-600">Partial</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{features.filter(f => f.status === 'broken').length}</div>
                <div className="text-sm text-gray-600">Broken</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{features.filter(f => f.status === 'missing').length}</div>
                <div className="text-sm text-gray-600">Missing</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Testing Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Assistant Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Test voice command processing</p>
            <Button onClick={testVoiceCommand} className="w-full">
              Test Voice Command
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Computer Vision Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Test document analysis capabilities</p>
            <Button onClick={testDocumentAnalysis} className="w-full">
              Test Document Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Details */}
      <div className="grid grid-cols-1 gap-4">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(feature.status)}
                  {feature.name}
                </CardTitle>
                {getStatusBadge(feature.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">{feature.description}</p>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Implementation Progress</span>
                    <span className="text-sm text-gray-600">{feature.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        feature.progress === 100 ? 'bg-green-500' : 
                        feature.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {feature.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {testResults[feature.name] && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Last Test Result</h4>
                    {testResults[feature.name].success ? (
                      <div className="text-green-600 text-sm">✅ Test Passed</div>
                    ) : (
                      <div className="text-red-600 text-sm">❌ {testResults[feature.name].error}</div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}