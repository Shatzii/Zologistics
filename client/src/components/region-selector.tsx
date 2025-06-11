import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, Shield, FileText, Clock, DollarSign, 
  AlertTriangle, CheckCircle, Settings, Users,
  MapPin, Calendar, Truck, Scale
} from "lucide-react";

interface ComplianceRegion {
  code: string;
  name: string;
  currency: string;
  language: string;
  timezone: string;
  regulations: {
    drivingHours: {
      dailyLimit: number;
      weeklyLimit: number;
      mandatoryBreaks: Array<{
        afterHours: number;
        duration: number;
        type: string;
      }>;
    };
    documentation: {
      required: string[];
      digitalFormats: string[];
      retention: number;
    };
    crossBorder: {
      allowed: boolean;
      cabotageLimit?: number;
      permits: string[];
    };
  };
  taxRules: {
    vatRate: number;
    fuelTax: number;
    roadTax: number;
    invoiceFormat: string;
    digitalInvoicing: boolean;
  };
  dataPrivacy: {
    gdprCompliant: boolean;
    dataRetention: number;
    consentRequired: boolean;
    rightToForgotten: boolean;
    dataLocalization: boolean;
  };
}

interface ComplianceStatus {
  compliant: boolean;
  violations: string[];
  recommendations: string[];
}

export function RegionSelector() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: regions, isLoading: regionsLoading } = useQuery<ComplianceRegion[]>({
    queryKey: ['/api/compliance/regions'],
    retry: 1,
  });

  const { data: currentRegion } = useQuery<ComplianceRegion>({
    queryKey: ['/api/compliance/current-region'],
    retry: 1,
  });

  const { data: complianceStatus } = useQuery<ComplianceStatus>({
    queryKey: ['/api/compliance/status'],
    retry: 1,
  });

  const setRegionMutation = useMutation({
    mutationFn: async (regionCode: string) => {
      const response = await fetch('/api/compliance/set-region', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionCode }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance'] });
    },
  });

  const handleRegionChange = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setRegionMutation.mutate(regionCode);
  };

  const getRegionFlag = (code: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'MX': '🇲🇽', 
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'ES': '🇪🇸',
      'PL': '🇵🇱',
      'NL': '🇳🇱'
    };
    return flags[code] || '🌍';
  };

  const getComplianceColor = (compliant: boolean) => {
    return compliant ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600';
  };

  if (regionsLoading) {
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
            <Globe className="w-8 h-8 text-blue-400" />
            International Compliance
          </h1>
          <p className="driver-text-secondary">
            Configure regional compliance, regulations, and localization settings
          </p>
        </div>
        <div className="flex gap-2">
          {currentRegion && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <MapPin className="w-3 h-3 mr-1" />
              {getRegionFlag(currentRegion.code)} {currentRegion.name}
            </Badge>
          )}
          {complianceStatus && (
            <Badge variant="outline" className={getComplianceColor(complianceStatus.compliant)}>
              {complianceStatus.compliant ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {complianceStatus.compliant ? 'Compliant' : 'Violations Found'}
            </Badge>
          )}
        </div>
      </div>

      {/* Region Selection */}
      <Card className="driver-card">
        <CardHeader>
          <CardTitle className="driver-text-emphasis flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Operating Region Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="driver-text-emphasis block text-sm font-medium mb-2">
                Select Operating Region
              </label>
              <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your operating region..." />
                </SelectTrigger>
                <SelectContent>
                  {regions?.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getRegionFlag(region.code)}</span>
                        <span>{region.name}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {region.currency}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentRegion && (
              <div className="space-y-2">
                <p className="text-sm font-medium driver-text-emphasis">Current Settings</p>
                <div className="space-y-1 text-sm driver-text-secondary">
                  <p><strong>Language:</strong> {currentRegion.language}</p>
                  <p><strong>Currency:</strong> {currentRegion.currency}</p>
                  <p><strong>Timezone:</strong> {currentRegion.timezone}</p>
                  <p><strong>GDPR:</strong> {currentRegion.dataPrivacy.gdprCompliant ? 'Required' : 'Not Required'}</p>
                </div>
              </div>
            )}
          </div>

          {setRegionMutation.isPending && (
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Updating regional compliance settings...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Compliance Status */}
      {complianceStatus && (
        <Card className="driver-card">
          <CardHeader>
            <CardTitle className="driver-text-emphasis flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {complianceStatus.compliant ? (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  All operations are compliant with current regional regulations.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {complianceStatus.violations.length} compliance violation(s) detected.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium driver-text-emphasis">Violations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm driver-text-secondary">
                    {complianceStatus.violations.map((violation, index) => (
                      <li key={index} className="text-red-600">{violation}</li>
                    ))}
                  </ul>
                </div>

                {complianceStatus.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium driver-text-emphasis">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm driver-text-secondary">
                      {complianceStatus.recommendations.map((rec, index) => (
                        <li key={index} className="text-yellow-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Regional Details */}
      {currentRegion && (
        <Tabs defaultValue="regulations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="regulations">Regulations</TabsTrigger>
            <TabsTrigger value="taxation">Taxation</TabsTrigger>
            <TabsTrigger value="privacy">Data Privacy</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="regulations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-emphasis text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Driving Hours Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Daily Limit:</span>
                    <span className="driver-text-emphasis">{currentRegion.regulations.drivingHours.dailyLimit} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Weekly Limit:</span>
                    <span className="driver-text-emphasis">{currentRegion.regulations.drivingHours.weeklyLimit} hours</span>
                  </div>
                  <div>
                    <p className="text-sm driver-text-secondary mb-1">Mandatory Breaks:</p>
                    <div className="space-y-1">
                      {currentRegion.regulations.drivingHours.mandatoryBreaks.map((breakRule, index) => (
                        <p key={index} className="text-xs driver-text-emphasis">
                          {breakRule.duration} min {breakRule.type} after {breakRule.afterHours}h
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-emphasis text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Cross-Border Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Allowed:</span>
                    <Badge className={currentRegion.regulations.crossBorder.allowed ? 'bg-green-500' : 'bg-red-500'}>
                      {currentRegion.regulations.crossBorder.allowed ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {currentRegion.regulations.crossBorder.cabotageLimit && (
                    <div className="flex justify-between">
                      <span className="driver-text-secondary">Cabotage Limit:</span>
                      <span className="driver-text-emphasis">{currentRegion.regulations.crossBorder.cabotageLimit} operations</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm driver-text-secondary mb-1">Required Permits:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentRegion.regulations.crossBorder.permits.map((permit, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="taxation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-emphasis text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Tax Rates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">VAT/Sales Tax:</span>
                    <span className="driver-text-emphasis">{currentRegion.taxRules.vatRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Fuel Tax:</span>
                    <span className="driver-text-emphasis">{currentRegion.taxRules.fuelTax} {currentRegion.currency}/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Road Tax:</span>
                    <span className="driver-text-emphasis">{currentRegion.taxRules.roadTax} {currentRegion.currency}/km</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="driver-card">
                <CardHeader>
                  <CardTitle className="driver-text-emphasis text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Invoice Format
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Format:</span>
                    <Badge variant="outline">{currentRegion.taxRules.invoiceFormat}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="driver-text-secondary">Digital Invoicing:</span>
                    <Badge className={currentRegion.taxRules.digitalInvoicing ? 'bg-green-500' : 'bg-gray-500'}>
                      {currentRegion.taxRules.digitalInvoicing ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data Privacy Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">GDPR Compliant:</span>
                      <Badge className={currentRegion.dataPrivacy.gdprCompliant ? 'bg-green-500' : 'bg-gray-500'}>
                        {currentRegion.dataPrivacy.gdprCompliant ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Consent Required:</span>
                      <Badge className={currentRegion.dataPrivacy.consentRequired ? 'bg-blue-500' : 'bg-gray-500'}>
                        {currentRegion.dataPrivacy.consentRequired ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Right to be Forgotten:</span>
                      <Badge className={currentRegion.dataPrivacy.rightToForgotten ? 'bg-purple-500' : 'bg-gray-500'}>
                        {currentRegion.dataPrivacy.rightToForgotten ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="driver-text-secondary">Data Retention:</span>
                      <span className="driver-text-emphasis">{currentRegion.dataPrivacy.dataRetention} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="driver-text-secondary">Data Localization:</span>
                      <Badge className={currentRegion.dataPrivacy.dataLocalization ? 'bg-orange-500' : 'bg-gray-500'}>
                        {currentRegion.dataPrivacy.dataLocalization ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-4">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Required Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium driver-text-emphasis mb-2">Required Documents:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentRegion.regulations.documentation.required.map((doc, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium driver-text-emphasis mb-2">Digital Formats:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentRegion.regulations.documentation.digitalFormats.map((format, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="driver-text-secondary">Retention Period:</span>
                  <span className="driver-text-emphasis">{currentRegion.regulations.documentation.retention} days</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}