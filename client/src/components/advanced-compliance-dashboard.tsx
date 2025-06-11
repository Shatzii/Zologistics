import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, AlertTriangle, CheckCircle, Clock, TrendingUp,
  FileText, Gavel, Leaf, DollarSign, Settings, Users,
  Download, Package, Eye, BarChart3, Calendar, Target,
  Database, Cpu, Link, Mic, Camera, Globe
} from "lucide-react";

interface ComplianceOptimization {
  id: string;
  category: 'safety' | 'environmental' | 'legal' | 'financial' | 'operational';
  priority: 'critical' | 'high' | 'medium' | 'low';
  regulation: string;
  requirement: string;
  currentStatus: 'compliant' | 'over_compliant' | 'non_compliant' | 'pending';
  recommendedActions: string[];
  automationLevel: 'fully_automated' | 'semi_automated' | 'manual';
  riskLevel: number;
  lastAuditDate: string;
  nextAuditDue: string;
  certifications: string[];
}

interface ComplianceAudit {
  id: string;
  auditType: 'internal' | 'external' | 'regulatory' | 'certification';
  auditor: string;
  scope: string[];
  findings: any[];
  overallScore: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  scheduledDate: string;
  completedDate?: string;
  recommendations: string[];
}

interface StandaloneTechnology {
  id: string;
  name: string;
  category: 'ai_engine' | 'blockchain' | 'voice_recognition' | 'computer_vision' | 'compliance' | 'localization';
  description: string;
  dependencies: string[];
  apis: Array<{
    endpoint: string;
    method: string;
    description: string;
    pricing: number;
  }>;
  revenue: {
    type: string;
    pricing: {
      base: number;
      tiers?: Array<{
        name: string;
        price: number;
        features: string[];
      }>;
    };
    targetMarket: string[];
  };
}

interface ComplianceReport {
  summary: {
    totalOptimizations: number;
    overCompliantCount: number;
    compliantCount: number;
    nonCompliantCount: number;
    averageRiskLevel: number;
  };
  byCategory: { [category: string]: number };
  upcomingAudits: number;
  actionItems: number;
}

export function AdvancedComplianceDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: optimizations, isLoading: optimizationsLoading } = useQuery<ComplianceOptimization[]>({
    queryKey: ['/api/compliance/optimizations'],
    retry: 1,
  });

  const { data: audits, isLoading: auditsLoading } = useQuery<ComplianceAudit[]>({
    queryKey: ['/api/compliance/audits'],
    retry: 1,
  });

  const { data: technologies, isLoading: technologiesLoading } = useQuery<StandaloneTechnology[]>({
    queryKey: ['/api/compliance/technologies'],
    retry: 1,
  });

  const { data: complianceReport } = useQuery<ComplianceReport>({
    queryKey: ['/api/compliance/report'],
    retry: 1,
  });

  const conductAuditMutation = useMutation({
    mutationFn: async (auditId: string) => {
      const response = await fetch(`/api/compliance/conduct-audit/${auditId}`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance'] });
    },
  });

  const exportTechnologyMutation = useMutation({
    mutationFn: async (technologyId: string) => {
      const response = await fetch(`/api/compliance/export-technology/${technologyId}`, {
        method: 'POST',
      });
      return response.json();
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'environmental': return <Leaf className="w-4 h-4 text-green-400" />;
      case 'legal': return <Gavel className="w-4 h-4 text-purple-400" />;
      case 'financial': return <DollarSign className="w-4 h-4 text-yellow-400" />;
      case 'operational': return <Settings className="w-4 h-4 text-orange-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTechnologyIcon = (category: string) => {
    switch (category) {
      case 'ai_engine': return <Cpu className="w-5 h-5 text-blue-500" />;
      case 'blockchain': return <Link className="w-5 h-5 text-purple-500" />;
      case 'voice_recognition': return <Mic className="w-5 h-5 text-green-500" />;
      case 'computer_vision': return <Camera className="w-5 h-5 text-red-500" />;
      case 'compliance': return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'localization': return <Globe className="w-5 h-5 text-cyan-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over_compliant': return 'bg-green-500';
      case 'compliant': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'non_compliant': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 border-red-600';
      case 'high': return 'text-orange-600 border-orange-600';
      case 'medium': return 'text-yellow-600 border-yellow-600';
      case 'low': return 'text-green-600 border-green-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  const filteredOptimizations = optimizations?.filter(opt => 
    selectedCategory === 'all' || opt.category === selectedCategory
  ) || [];

  if (optimizationsLoading || auditsLoading || technologiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background driver-theme">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold driver-text-critical flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            Advanced Compliance Suite
          </h1>
          <p className="driver-text-secondary">
            Over-compliance optimization, audit management, and standalone technology packaging
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Over-Compliant
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Target className="w-3 h-3 mr-1" />
            Zero Risk
          </Badge>
        </div>
      </div>

      {/* Compliance Overview */}
      {complianceReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="driver-card border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Over-Compliant</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {complianceReport.summary.overCompliantCount}
              </div>
              <p className="text-xs driver-text-secondary">
                {Math.round((complianceReport.summary.overCompliantCount / complianceReport.summary.totalOptimizations) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Compliant</CardTitle>
              <Shield className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {complianceReport.summary.compliantCount}
              </div>
              <p className="text-xs driver-text-secondary">
                Standard compliance level
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card border-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Risk Level</CardTitle>
              <BarChart3 className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {complianceReport.summary.averageRiskLevel.toFixed(1)}
              </div>
              <p className="text-xs driver-text-secondary">
                Average risk score (1-10)
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Audits Due</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {complianceReport.upcomingAudits}
              </div>
              <p className="text-xs driver-text-secondary">
                Next 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="driver-card border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium driver-text-emphasis">Action Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {complianceReport.actionItems}
              </div>
              <p className="text-xs driver-text-secondary">
                Pending completion
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="optimizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="optimizations">Compliance Optimizations</TabsTrigger>
          <TabsTrigger value="audits">Audit Management</TabsTrigger>
          <TabsTrigger value="technologies">Standalone Technologies</TabsTrigger>
          <TabsTrigger value="export">Technology Export</TabsTrigger>
          <TabsTrigger value="analytics">Compliance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizations" className="space-y-4">
          {/* Category Filter */}
          <Card className="driver-card">
            <CardHeader>
              <CardTitle className="driver-text-emphasis">Filter by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories
                </Button>
                {['safety', 'environmental', 'legal', 'financial', 'operational'].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {getCategoryIcon(category)}
                    <span className="ml-1">{category}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimization Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOptimizations.map((optimization) => (
              <Card key={optimization.id} className="driver-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="driver-text-emphasis text-sm flex items-center gap-2">
                      {getCategoryIcon(optimization.category)}
                      {optimization.category.charAt(0).toUpperCase() + optimization.category.slice(1)}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Badge variant="outline" className={getPriorityColor(optimization.priority)}>
                        {optimization.priority}
                      </Badge>
                      <Badge className={getStatusColor(optimization.currentStatus)}>
                        {optimization.currentStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-1">Regulation</p>
                    <p className="text-xs driver-text-secondary">{optimization.regulation}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-1">Requirement</p>
                    <p className="text-xs driver-text-secondary">{optimization.requirement}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="driver-text-secondary">Risk Level</span>
                      <span className="driver-text-emphasis">{optimization.riskLevel}/10</span>
                    </div>
                    <Progress value={optimization.riskLevel * 10} className="h-2" />
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-1">Automation Level</p>
                    <Badge variant="outline" className="text-xs">
                      {optimization.automationLevel.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-1">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {optimization.certifications.slice(0, 2).map((cert) => (
                        <Badge key={cert} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                      {optimization.certifications.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{optimization.certifications.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-1">Next Audit</p>
                    <p className="text-xs driver-text-secondary">
                      {new Date(optimization.nextAuditDue).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Scheduled Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {audits?.filter(audit => audit.status === 'scheduled').map((audit) => (
                      <div key={audit.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="font-medium driver-text-emphasis">{audit.auditType}</span>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {audit.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="driver-text-secondary">Auditor</p>
                            <p className="driver-text-emphasis">{audit.auditor}</p>
                          </div>
                          <div>
                            <p className="driver-text-secondary">Scheduled Date</p>
                            <p className="driver-text-emphasis">
                              {new Date(audit.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm driver-text-secondary mb-1">Scope</p>
                          <div className="flex flex-wrap gap-1">
                            {audit.scope.map((scope) => (
                              <Badge key={scope} variant="secondary" className="text-xs capitalize">
                                {scope}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => conductAuditMutation.mutate(audit.id)}
                          disabled={conductAuditMutation.isPending}
                          size="sm"
                          className="w-full"
                        >
                          {conductAuditMutation.isPending ? 'Conducting...' : 'Conduct Audit'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Completed Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {audits?.filter(audit => audit.status === 'completed').map((audit) => (
                      <div key={audit.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="font-medium driver-text-emphasis">{audit.auditType}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-400">{audit.overallScore}/100</div>
                            <div className="text-xs driver-text-secondary">Score</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="driver-text-secondary">Auditor</p>
                            <p className="driver-text-emphasis">{audit.auditor}</p>
                          </div>
                          <div>
                            <p className="driver-text-secondary">Completed</p>
                            <p className="driver-text-emphasis">
                              {audit.completedDate ? new Date(audit.completedDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm driver-text-secondary mb-1">Findings</p>
                          <p className="text-sm driver-text-emphasis">{audit.findings.length} items identified</p>
                        </div>

                        <div>
                          <p className="text-sm driver-text-secondary mb-1">Recommendations</p>
                          <p className="text-xs driver-text-emphasis">
                            {audit.recommendations.slice(0, 1).join(', ')}
                            {audit.recommendations.length > 1 && '...'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technologies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technologies?.map((technology) => (
              <Card key={technology.id} className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-emphasis flex items-center gap-2">
                    {getTechnologyIcon(technology.category)}
                    {technology.name}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit capitalize">
                    {technology.category.replace('_', ' ')}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm driver-text-secondary">{technology.description}</p>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-2">API Endpoints</p>
                    <div className="space-y-1">
                      {technology.apis.slice(0, 3).map((api, index) => (
                        <div key={index} className="text-xs driver-text-secondary flex justify-between">
                          <span>{api.method} {api.endpoint.split('/').pop()}</span>
                          <span>${api.pricing}</span>
                        </div>
                      ))}
                      {technology.apis.length > 3 && (
                        <p className="text-xs driver-text-secondary">+{technology.apis.length - 3} more endpoints</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-2">Pricing Model</p>
                    <div className="text-sm driver-text-secondary">
                      <p>Type: {technology.revenue.type}</p>
                      {technology.revenue.pricing.tiers ? (
                        <p>Starting at: ${technology.revenue.pricing.tiers[0].price}/month</p>
                      ) : (
                        <p>Base: ${technology.revenue.pricing.base}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-2">Target Market</p>
                    <div className="flex flex-wrap gap-1">
                      {technology.revenue.targetMarket.slice(0, 2).map((market) => (
                        <Badge key={market} variant="secondary" className="text-xs">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium driver-text-emphasis mb-2">Dependencies</p>
                    <p className="text-xs driver-text-secondary">
                      {technology.dependencies.length === 0 ? 'Completely standalone' : technology.dependencies.join(', ')}
                    </p>
                  </div>

                  <Button
                    onClick={() => setSelectedTechnology(technology.id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card className="driver-card">
            <CardHeader>
              <CardTitle className="driver-text-emphasis">Technology Export Center</CardTitle>
              <p className="driver-text-secondary">
                Package individual technologies for standalone deployment and licensing
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {technologies?.map((technology) => (
                  <div key={technology.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTechnologyIcon(technology.category)}
                        <span className="font-medium driver-text-emphasis">{technology.name}</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {technology.category.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-sm driver-text-secondary">{technology.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="driver-text-secondary">APIs</p>
                        <p className="driver-text-emphasis">{technology.apis.length} endpoints</p>
                      </div>
                      <div>
                        <p className="driver-text-secondary">Dependencies</p>
                        <p className="driver-text-emphasis">
                          {technology.dependencies.length === 0 ? 'None' : technology.dependencies.length}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => exportTechnologyMutation.mutate(technology.id)}
                      disabled={exportTechnologyMutation.isPending}
                      size="sm"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {exportTechnologyMutation.isPending ? 'Exporting...' : 'Export Package'}
                    </Button>
                  </div>
                ))}
              </div>

              {exportTechnologyMutation.data && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                  <Download className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Technology package exported successfully. Download includes documentation, deployment guides, and pricing information.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Compliance Score Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceReport && Object.entries(complianceReport.byCategory).map(([category, count]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="driver-text-secondary capitalize flex items-center gap-2">
                          {getCategoryIcon(category)}
                          {category}
                        </span>
                        <span className="driver-text-emphasis">{count} optimizations</span>
                      </div>
                      <Progress 
                        value={(count / complianceReport.summary.totalOptimizations) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      {complianceReport?.summary.averageRiskLevel.toFixed(1) || '0.0'}
                    </div>
                    <p className="driver-text-secondary">Average Risk Level</p>
                    <p className="text-xs driver-text-secondary mt-1">Target: ≤ 3.0 (Low Risk)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round((complianceReport?.summary.overCompliantCount || 0) / (complianceReport?.summary.totalOptimizations || 1) * 100)}%
                      </div>
                      <p className="text-xs driver-text-secondary">Over-Compliant</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.round((complianceReport?.summary.compliantCount || 0) / (complianceReport?.summary.totalOptimizations || 1) * 100)}%
                      </div>
                      <p className="text-xs driver-text-secondary">Standard Compliant</p>
                    </div>
                  </div>

                  <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Risk profile indicates excellent compliance posture with proactive risk management.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}