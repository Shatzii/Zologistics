import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Target,
  MapPin,
  Zap
} from "lucide-react";

interface ComprehensiveLoadSource {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  integrationComplexity: 'simple' | 'moderate' | 'complex';
  loadVolume: number;
  specialization: string[];
  dataQuality: number;
  costStructure: {
    subscriptionRequired: boolean;
    monthlyFee?: number;
    perLoadFee?: number;
    enterpriseOnly: boolean;
  };
  technicalRequirements: {
    webhooksSupported: boolean;
    realTimeUpdates: boolean;
    bulkDownload: boolean;
    apiVersion: string;
  };
  coverage: {
    regions: string[];
    equipmentTypes: string[];
    loadTypes: string[];
  };
}

interface LoadSourcesData {
  totalSources: number;
  activeSources: number;
  totalLoadVolume: number;
  sources: ComprehensiveLoadSource[];
}

interface RoadmapPhase {
  phase: string;
  sources: ComprehensiveLoadSource[];
  timeline: string;
  expectedLoadIncrease: number;
}

interface SourceAnalysis {
  costAnalysis: {
    totalMonthlyCost: number;
    costPerLoad: number;
    roiProjection: number;
  };
  breakdown: {
    critical: number;
    high: number;
    specialized: number;
    total: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    specialized: string[];
  };
}

export default function LoadSourcesIntegration() {
  const [selectedPhase, setSelectedPhase] = useState<string>("Phase 1");

  const { data: sourcesData, isLoading: sourcesLoading } = useQuery<LoadSourcesData>({
    queryKey: ["/api/load-sources/comprehensive"],
  });

  const { data: roadmapData, isLoading: roadmapLoading } = useQuery<RoadmapPhase[]>({
    queryKey: ["/api/load-sources/roadmap"],
  });

  const { data: analysisData, isLoading: analysisLoading } = useQuery<SourceAnalysis>({
    queryKey: ["/api/load-sources/analysis"],
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'moderate': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'complex': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (sourcesLoading || roadmapLoading || analysisLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Load Sources Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive integration with {sourcesData?.totalSources || 0} load sources across all markets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          <span className="text-blue-600 font-medium">
            {sourcesData?.activeSources || 0} Active Sources
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Total Sources
            </CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {sourcesData?.totalSources || 0}
            </div>
            <p className="text-xs driver-text-secondary">
              Configured integrations
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Daily Load Volume
            </CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {formatNumber(sourcesData?.totalLoadVolume || 0)}
            </div>
            <p className="text-xs driver-text-secondary">
              Available loads daily
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              Monthly Cost
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {formatCurrency(analysisData?.costAnalysis.totalMonthlyCost || 0)}
            </div>
            <p className="text-xs driver-text-secondary">
              All active sources
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-secondary">
              ROI Projection
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold driver-text-emphasis">
              {(analysisData?.costAnalysis.roiProjection || 0).toFixed(1)}x
            </div>
            <p className="text-xs driver-text-secondary">
              Return on investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sources" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">All Sources</TabsTrigger>
          <TabsTrigger value="roadmap">Implementation</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Quick Start</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4">
            {sourcesData?.sources.map((source) => (
              <Card key={source.id} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getComplexityIcon(source.integrationComplexity)}
                        <div>
                          <CardTitle className="text-lg driver-text-emphasis">
                            {source.name}
                          </CardTitle>
                          <p className="text-sm driver-text-secondary">
                            {source.specialization.slice(0, 2).join(" • ")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(source.priority)}>
                        {source.priority}
                      </Badge>
                      <Badge variant={source.isActive ? "default" : "secondary"}>
                        {source.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="driver-text-secondary">Daily Volume:</span>
                      <div className="font-medium driver-text-emphasis">
                        {formatNumber(source.loadVolume)}
                      </div>
                    </div>
                    <div>
                      <span className="driver-text-secondary">Data Quality:</span>
                      <div className="font-medium driver-text-emphasis">
                        {source.dataQuality}%
                      </div>
                    </div>
                    <div>
                      <span className="driver-text-secondary">Regions:</span>
                      <div className="font-medium driver-text-emphasis">
                        {source.coverage.regions.length}
                      </div>
                    </div>
                    <div>
                      <span className="driver-text-secondary">Cost:</span>
                      <div className="font-medium driver-text-emphasis">
                        {source.costStructure.monthlyFee 
                          ? formatCurrency(source.costStructure.monthlyFee) + "/mo"
                          : source.costStructure.perLoadFee 
                          ? formatCurrency(source.costStructure.perLoadFee) + "/load"
                          : "Variable"
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {source.coverage.regions.slice(0, 3).map((region) => (
                      <Badge key={region} variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {region}
                      </Badge>
                    ))}
                    {source.coverage.regions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{source.coverage.regions.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs driver-text-secondary">
                      {source.technicalRequirements.realTimeUpdates && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Real-time
                        </Badge>
                      )}
                      {source.technicalRequirements.webhooksSupported && (
                        <Badge variant="outline" className="text-xs">
                          Webhooks
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs driver-text-secondary">
                      API {source.technicalRequirements.apiVersion}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          <div className="grid gap-6">
            {roadmapData?.map((phase, index) => (
              <Card key={phase.phase} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg driver-text-emphasis">
                          {phase.phase}
                        </CardTitle>
                        <p className="text-sm driver-text-secondary">
                          {phase.timeline}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        +{formatNumber(phase.expectedLoadIncrease)}
                      </div>
                      <p className="text-sm driver-text-secondary">
                        Expected loads
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.sources.map((source) => (
                        <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-2">
                            {getComplexityIcon(source.integrationComplexity)}
                            <span className="font-medium driver-text-emphasis">
                              {source.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(source.priority)} className="text-xs">
                              {source.priority}
                            </Badge>
                            <span className="text-sm driver-text-secondary">
                              {formatNumber(source.loadVolume)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="driver-text-secondary">Monthly Cost:</span>
                    <div className="text-lg font-bold driver-text-emphasis">
                      {formatCurrency(analysisData?.costAnalysis.totalMonthlyCost || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="driver-text-secondary">Cost per Load:</span>
                    <div className="text-lg font-bold driver-text-emphasis">
                      {formatCurrency(analysisData?.costAnalysis.costPerLoad || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="driver-text-secondary">ROI Multiple:</span>
                    <div className="text-lg font-bold text-green-600">
                      {(analysisData?.costAnalysis.roiProjection || 0).toFixed(1)}x
                    </div>
                  </div>
                  <div>
                    <span className="driver-text-secondary">Break-even:</span>
                    <div className="text-lg font-bold driver-text-emphasis">
                      {Math.ceil((analysisData?.costAnalysis.totalMonthlyCost || 0) / 50)} loads/mo
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Source Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Critical Priority:</span>
                    <span className="font-bold driver-text-emphasis">
                      {analysisData?.breakdown.critical || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">High Priority:</span>
                    <span className="font-bold driver-text-emphasis">
                      {analysisData?.breakdown.high || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Specialized:</span>
                    <span className="font-bold driver-text-emphasis">
                      {analysisData?.breakdown.specialized || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium driver-text-emphasis">Total Sources:</span>
                    <span className="font-bold driver-text-emphasis">
                      {analysisData?.breakdown.total || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Quick Start Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium driver-text-emphasis mb-3 flex items-center gap-2">
                      <Badge variant="destructive">Immediate</Badge>
                      Critical Sources
                    </h4>
                    <div className="space-y-2">
                      {analysisData?.recommendations.immediate.map((source) => (
                        <div key={source} className="p-2 rounded bg-red-50 dark:bg-red-900/20 text-sm driver-text-emphasis">
                          {source}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium driver-text-emphasis mb-3 flex items-center gap-2">
                      <Badge variant="default">Short Term</Badge>
                      High Priority
                    </h4>
                    <div className="space-y-2">
                      {analysisData?.recommendations.shortTerm.map((source) => (
                        <div key={source} className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-sm driver-text-emphasis">
                          {source}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium driver-text-emphasis mb-3 flex items-center gap-2">
                      <Badge variant="secondary">Specialized</Badge>
                      Niche Markets
                    </h4>
                    <div className="space-y-2">
                      {analysisData?.recommendations.specialized.map((source) => (
                        <div key={source} className="p-2 rounded bg-green-50 dark:bg-green-900/20 text-sm driver-text-emphasis">
                          {source}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Start with the 3 critical sources for maximum impact. This will give you access to 1M+ daily loads 
                    and establish a solid foundation for growth. Add specialized sources based on your fleet composition.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}