import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Users, 
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Check,
  AlertCircle,
  Clock,
  Target
} from "lucide-react";

interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  completion: number;
  activeUsers: number;
  region: string;
  marketOpportunity: number;
  compliance: boolean;
}

interface RegionalMetrics {
  region: string;
  languages: string[];
  totalUsers: number;
  revenue: number;
  growth: number;
  compliance: string[];
}

interface TranslationProgress {
  module: string;
  totalStrings: number;
  translated: number;
  reviewed: number;
  approved: number;
}

export default function MultiLanguageDashboard() {
  const [languages, setLanguages] = useState<LanguageSupport[]>([]);
  const [regions, setRegions] = useState<RegionalMetrics[]>([]);
  const [translationProgress, setTranslationProgress] = useState<TranslationProgress[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    // Initialize language support data
    setLanguages([
      {
        code: "en",
        name: "English",
        nativeName: "English",
        flag: "🇺🇸",
        completion: 100,
        activeUsers: 2847,
        region: "North America",
        marketOpportunity: 278000,
        compliance: true
      },
      {
        code: "es",
        name: "Spanish",
        nativeName: "Español",
        flag: "🇪🇸",
        completion: 98,
        activeUsers: 1456,
        region: "Central America",
        marketOpportunity: 180000,
        compliance: true
      },
      {
        code: "pt",
        name: "Portuguese",
        nativeName: "Português",
        flag: "🇧🇷",
        completion: 94,
        activeUsers: 867,
        region: "South America",
        marketOpportunity: 145000,
        compliance: true
      },
      {
        code: "de",
        name: "German",
        nativeName: "Deutsch",
        flag: "🇩🇪",
        completion: 89,
        activeUsers: 534,
        region: "Europe",
        marketOpportunity: 420000,
        compliance: true
      },
      {
        code: "fr",
        name: "French",
        nativeName: "Français",
        flag: "🇫🇷",
        completion: 76,
        activeUsers: 298,
        region: "Europe",
        marketOpportunity: 295000,
        compliance: false
      },
      {
        code: "zh",
        name: "Chinese",
        nativeName: "中文",
        flag: "🇨🇳",
        completion: 45,
        activeUsers: 123,
        region: "Asia Pacific",
        marketOpportunity: 850000,
        compliance: false
      },
      {
        code: "ja",
        name: "Japanese",
        nativeName: "日本語",
        flag: "🇯🇵",
        completion: 32,
        activeUsers: 89,
        region: "Asia Pacific",
        marketOpportunity: 380000,
        compliance: false
      },
      {
        code: "ar",
        name: "Arabic",
        nativeName: "العربية",
        flag: "🇸🇦",
        completion: 12,
        activeUsers: 45,
        region: "Middle East",
        marketOpportunity: 210000,
        compliance: false
      }
    ]);

    setRegions([
      {
        region: "North America",
        languages: ["English"],
        totalUsers: 2847,
        revenue: 278000,
        growth: 12.5,
        compliance: ["FMCSA", "DOT", "PHMSA"]
      },
      {
        region: "Central America",
        languages: ["Spanish", "English"],
        totalUsers: 1456,
        revenue: 180000,
        growth: 34.7,
        compliance: ["SIECA", "Central America Transport"]
      },
      {
        region: "South America",
        languages: ["Portuguese", "Spanish"],
        totalUsers: 867,
        revenue: 145000,
        growth: 28.9,
        compliance: ["Mercosur", "ANTT"]
      },
      {
        region: "Europe",
        languages: ["German", "French", "English"],
        totalUsers: 832,
        revenue: 715000,
        growth: 19.3,
        compliance: ["EU Transport Regulation", "AETR", "ADR"]
      },
      {
        region: "Asia Pacific",
        languages: ["Chinese", "Japanese", "English"],
        totalUsers: 212,
        revenue: 95000,
        growth: 67.2,
        compliance: ["ASEAN Transport", "China GB Standards"]
      },
      {
        region: "Middle East",
        languages: ["Arabic", "English"],
        totalUsers: 45,
        revenue: 38000,
        growth: 89.4,
        compliance: ["GCC Transport Agreement"]
      }
    ]);

    setTranslationProgress([
      { module: "Dashboard", totalStrings: 247, translated: 247, reviewed: 247, approved: 247 },
      { module: "Load Management", totalStrings: 589, translated: 576, reviewed: 545, approved: 534 },
      { module: "Driver Portal", totalStrings: 423, translated: 398, reviewed: 367, approved: 356 },
      { module: "Customer Portal", totalStrings: 334, translated: 312, reviewed: 289, approved: 278 },
      { module: "Compliance", totalStrings: 456, translated: 423, reviewed: 389, approved: 367 },
      { module: "Mobile App", totalStrings: 678, translated: 634, reviewed: 589, approved: 556 },
      { module: "Voice Assistant", totalStrings: 234, translated: 198, reviewed: 167, approved: 145 },
      { module: "Analytics", totalStrings: 345, transferred: 312, reviewed: 289, approved: 267 }
    ]);
  }, []);

  const getCompletionColor = (completion: number) => {
    if (completion >= 95) return "text-green-600";
    if (completion >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplianceStatus = (compliance: boolean) => {
    return compliance ? 
      <Badge className="bg-green-100 text-green-800">Compliant</Badge> :
      <Badge className="bg-red-100 text-red-800">Pending</Badge>;
  };

  const getTotalMarketOpportunity = () => {
    return languages.reduce((total, lang) => total + lang.marketOpportunity, 0);
  };

  const getOverallCompletion = () => {
    return Math.round(languages.reduce((total, lang) => total + lang.completion, 0) / languages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Language Platform</h1>
            <p className="text-gray-600 mt-1">Global expansion with localized compliance and user experience</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800">
              <Globe className="h-3 w-3 mr-1" />
              {languages.length} Languages
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              ${getTotalMarketOpportunity().toLocaleString()}/month
            </Badge>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Languages Supported</p>
                <p className="text-2xl font-bold">{languages.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Global Users</p>
                <p className="text-2xl font-bold">{languages.reduce((total, lang) => total + lang.activeUsers, 0).toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Opportunity</p>
                <p className="text-2xl font-bold">${getTotalMarketOpportunity().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Completion</p>
                <p className="text-2xl font-bold text-blue-600">{getOverallCompletion()}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Support Tabs */}
      <Tabs defaultValue="languages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="languages">Language Support</TabsTrigger>
          <TabsTrigger value="regions">Regional Markets</TabsTrigger>
          <TabsTrigger value="translation">Translation Progress</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Language Support */}
        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language Support Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languages.map((language) => (
                  <div key={language.code} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{language.name}</h3>
                          <p className="text-sm text-gray-600">{language.nativeName} • {language.region}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getComplianceStatus(language.compliance)}
                        <Badge className={language.completion >= 95 ? "bg-green-100 text-green-800" : 
                                       language.completion >= 75 ? "bg-yellow-100 text-yellow-800" : 
                                       "bg-red-100 text-red-800"}>
                          {language.completion}% Complete
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-blue-600">{language.activeUsers.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Active Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-600">${language.marketOpportunity.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Market Opportunity</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-xl font-bold ${getCompletionColor(language.completion)}`}>
                          {language.completion}%
                        </p>
                        <p className="text-sm text-gray-600">Translation</p>
                      </div>
                      <div className="text-center">
                        <Progress value={language.completion} className="h-2 mt-2" />
                        <p className="text-sm text-gray-600 mt-1">Progress</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Markets */}
        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Regional Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regions.map((region, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{region.region}</h3>
                        <p className="text-sm text-gray-600">
                          Languages: {region.languages.join(", ")}
                        </p>
                      </div>
                      <Badge className={region.growth > 50 ? "bg-green-100 text-green-800" : 
                                     region.growth > 25 ? "bg-yellow-100 text-yellow-800" : 
                                     "bg-blue-100 text-blue-800"}>
                        +{region.growth}% Growth
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-xl font-bold text-blue-600">{region.totalUsers.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Users</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-600">${region.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-purple-600">{region.growth}%</p>
                        <p className="text-sm text-gray-600">Growth Rate</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Compliance Requirements:</p>
                      <div className="flex flex-wrap gap-2">
                        {region.compliance.map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Translation Progress */}
        <TabsContent value="translation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Translation Progress by Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {translationProgress.map((module, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{module.module}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {module.totalStrings} strings
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Translated</span>
                          <span>{Math.round((module.translated / module.totalStrings) * 100)}%</span>
                        </div>
                        <Progress value={(module.translated / module.totalStrings) * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Reviewed</span>
                          <span>{Math.round((module.reviewed / module.totalStrings) * 100)}%</span>
                        </div>
                        <Progress value={(module.reviewed / module.totalStrings) * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Approved</span>
                          <span>{Math.round((module.approved / module.totalStrings) * 100)}%</span>
                        </div>
                        <Progress value={(module.approved / module.totalStrings) * 100} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{module.totalStrings}</p>
                        <p className="text-gray-600">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-600">{module.translated}</p>
                        <p className="text-gray-600">Translated</p>
                      </div>
                      <div>
                        <p className="font-medium text-yellow-600">{module.reviewed}</p>
                        <p className="text-gray-600">Reviewed</p>
                      </div>
                      <div>
                        <p className="font-medium text-green-600">{module.approved}</p>
                        <p className="text-gray-600">Approved</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Regional Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regions.map((region, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{region.region}</h3>
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Compliant
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Required Certifications:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {region.compliance.map((cert, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Market Access:</p>
                          <p className="font-medium text-green-600">Full Access</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Compliance Score:</p>
                          <p className="font-medium text-green-600">100%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Benefits Summary */}
      <Alert className="mt-6">
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Multi-Language Benefits:</strong> Opens access to international markets worth $2.8M+ monthly, 
          increases addressable market by 300%, enables expansion into Central America and Europe, 
          and creates competitive advantage through localized compliance and user experience.
        </AlertDescription>
      </Alert>
    </div>
  );
}