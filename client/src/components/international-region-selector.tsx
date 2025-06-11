import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, MapPin, Flag, Truck, Scale, Languages,
  CheckCircle, AlertTriangle, Clock, Building2,
  FileText, Shield, DollarSign, Users
} from "lucide-react";

interface RegionInfo {
  id: string;
  name: string;
  flag: string;
  currency: string;
  language: string;
  timezone: string;
  regulations: string[];
  compliance: {
    status: 'compliant' | 'partial' | 'non_compliant';
    score: number;
    lastAudit: string;
  };
  operations: {
    activeRoutes: number;
    drivers: number;
    vehicles: number;
    revenue: number;
  };
  requirements: {
    permits: string[];
    certifications: string[];
    insurance: string[];
    documentation: string[];
  };
}

const regions: RegionInfo[] = [
  {
    id: 'eastern_europe',
    name: 'Eastern Europe',
    flag: '🇪🇺',
    currency: 'EUR',
    language: 'Multiple (EN/DE/PL/CS)',
    timezone: 'CET/EET',
    regulations: ['EU Mobility Package', 'ADR Transport', 'Cabotage Rules', 'Digital Tachograph'],
    compliance: {
      status: 'compliant',
      score: 96,
      lastAudit: '2024-11-15'
    },
    operations: {
      activeRoutes: 847,
      drivers: 2341,
      vehicles: 1876,
      revenue: 89500000
    },
    requirements: {
      permits: ['ECMT Permit', 'Bilateral Permits', 'Transit Permits'],
      certifications: ['Euro 6 Emission', 'Digital Tachograph', 'Professional Competence'],
      insurance: ['CMR Insurance', 'Motor Insurance', 'Cargo Insurance'],
      documentation: ['CMR Waybill', 'T1/T2 Forms', 'Invoice & Packing List']
    }
  },
  {
    id: 'central_mexico',
    name: 'Central Mexico',
    flag: '🇲🇽',
    currency: 'MXN',
    language: 'Spanish',
    timezone: 'CST',
    regulations: ['NOM-087', 'SCT Regulations', 'COFEPRIS', 'Environmental Standards'],
    compliance: {
      status: 'compliant',
      score: 94,
      lastAudit: '2024-12-01'
    },
    operations: {
      activeRoutes: 623,
      drivers: 1789,
      vehicles: 1423,
      revenue: 67800000
    },
    requirements: {
      permits: ['Federal Transport Permit', 'Environmental Permit', 'Dangerous Goods Permit'],
      certifications: ['NOM-087 Compliance', 'Driver License Type E', 'Vehicle Verification'],
      insurance: ['Federal Liability', 'Cargo Insurance', 'Environmental Coverage'],
      documentation: ['Carta Porte', 'Customs Declaration', 'Environmental Manifest']
    }
  },
  {
    id: 'united_states',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    language: 'English',
    timezone: 'Multiple',
    regulations: ['FMCSA', 'DOT', 'EPA', 'OSHA'],
    compliance: {
      status: 'compliant',
      score: 98,
      lastAudit: '2024-12-10'
    },
    operations: {
      activeRoutes: 1456,
      drivers: 3892,
      vehicles: 2967,
      revenue: 156700000
    },
    requirements: {
      permits: ['Operating Authority', 'Oversize/Overweight', 'Hazmat Endorsement'],
      certifications: ['CDL License', 'Medical Certificate', 'Safety Rating'],
      insurance: ['Primary Liability', 'Cargo Insurance', 'General Liability'],
      documentation: ['Bill of Lading', 'Inspection Reports', 'Driver Logs']
    }
  },
  {
    id: 'germany',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    language: 'German',
    timezone: 'CET',
    regulations: ['StVZO', 'FZV', 'GüKG', 'EU Driver Rules'],
    compliance: {
      status: 'compliant',
      score: 97,
      lastAudit: '2024-11-28'
    },
    operations: {
      activeRoutes: 756,
      drivers: 2156,
      vehicles: 1834,
      revenue: 94300000
    },
    requirements: {
      permits: ['Community License', 'Cabotage Authorization', 'Special Transport'],
      certifications: ['CE Driver License', 'CPC Certificate', 'Vehicle Registration'],
      insurance: ['Liability Insurance', 'Goods in Transit', 'Professional Indemnity'],
      documentation: ['Frachtbrief', 'Customs Documents', 'Technical Inspection']
    }
  },
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    language: 'French',
    timezone: 'CET',
    regulations: ['Code des Transports', 'DREAL', 'Chronotachygraphe', 'Loi Macron'],
    compliance: {
      status: 'compliant',
      score: 95,
      lastAudit: '2024-11-20'
    },
    operations: {
      activeRoutes: 634,
      drivers: 1923,
      vehicles: 1567,
      revenue: 78900000
    },
    requirements: {
      permits: ['Licence de Transport', 'Autorisation de Cabotage', 'Transport Exceptionnel'],
      certifications: ['Permis C/CE', 'FIMO/FCO', 'Contrôle Technique'],
      insurance: ['RC Transporteur', 'Assurance Marchandises', 'Protection Juridique'],
      documentation: ['Lettre de Voiture', 'DAU/SAD', 'Bon de Livraison']
    }
  },
  {
    id: 'spain',
    name: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    language: 'Spanish',
    timezone: 'CET',
    regulations: ['LOTT', 'ROTT', 'ADR España', 'Transporte Mercancías'],
    compliance: {
      status: 'compliant',
      score: 93,
      lastAudit: '2024-11-25'
    },
    operations: {
      activeRoutes: 578,
      drivers: 1687,
      vehicles: 1398,
      revenue: 72400000
    },
    requirements: {
      permits: ['Autorización Transporte', 'MDL/MDP', 'Transporte Especial'],
      certifications: ['Permiso C/C+E', 'CAP Transportista', 'ITV Vigente'],
      insurance: ['Seguro RC', 'Seguro Mercancías', 'Responsabilidad Civil'],
      documentation: ['Carta de Porte', 'DUA/SAD', 'Albarán de Entrega']
    }
  },
  {
    id: 'poland',
    name: 'Poland',
    flag: '🇵🇱',
    currency: 'PLN',
    language: 'Polish',
    timezone: 'CET',
    regulations: ['Ustawa o Transporcie', 'KDT', 'SENT', 'Package Mobility'],
    compliance: {
      status: 'compliant',
      score: 92,
      lastAudit: '2024-12-03'
    },
    operations: {
      activeRoutes: 923,
      drivers: 2734,
      vehicles: 2156,
      revenue: 83600000
    },
    requirements: {
      permits: ['Licencja Transportowa', 'Zezwolenie CEMT', 'Przewozy Kabotażowe'],
      certifications: ['Prawo Jazdy C/CE', 'Kwalifikacja Wstępna', 'Przegląd Techniczny'],
      insurance: ['OC Przewoźnika', 'Ubezpieczenie Ładunku', 'OC/AC Pojazdu'],
      documentation: ['List Przewozowy', 'SAD/T1', 'Faktura VAT']
    }
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR',
    language: 'Dutch',
    timezone: 'CET',
    regulations: ['Wet Wegvervoer Goederen', 'ADN Transport', 'Arbeids- en Rusttijden'],
    compliance: {
      status: 'compliant',
      score: 98,
      lastAudit: '2024-12-05'
    },
    operations: {
      activeRoutes: 432,
      drivers: 1234,
      vehicles: 987,
      revenue: 65700000
    },
    requirements: {
      permits: ['Communautaire Vergunning', 'Cabotagevergunning', 'Bijzonder Transport'],
      certifications: ['Rijbewijs C/CE', 'Getuigschrift Vakbekwaamheid', 'APK-keuring'],
      insurance: ['Aansprakelijkheidsverzekering', 'Goederenverzekering', 'Rechtsbijstand'],
      documentation: ['Vrachtbrief', 'Douanedocumenten', 'Afleverbon']
    }
  }
];

export function InternationalRegionSelector() {
  const [selectedRegion, setSelectedRegion] = useState<string>('eastern_europe');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const queryClient = useQueryClient();

  const { data: complianceData, isLoading } = useQuery({
    queryKey: ['/api/international-compliance/status', selectedRegion],
    retry: 1,
  });

  const switchRegionMutation = useMutation({
    mutationFn: async (regionId: string) => {
      const response = await fetch(`/api/international-compliance/switch-region/${regionId}`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/international-compliance'] });
    },
  });

  const currentRegion = regions.find(r => r.id === selectedRegion) || regions[0];

  const handleRegionSwitch = (regionId: string) => {
    setSelectedRegion(regionId);
    switchRegionMutation.mutate(regionId);
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100 border-green-200';
      case 'partial': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'non_compliant': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'non_compliant': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 bg-background driver-theme">
      {/* Header with Region Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold driver-text-critical flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            International Operations
          </h1>
          <p className="driver-text-secondary">
            Multi-region compliance management and operational oversight
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm driver-text-secondary">Current Region:</span>
          </div>
          
          <Select value={selectedRegion} onValueChange={handleRegionSwitch}>
            <SelectTrigger className="w-64">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentRegion.flag}</span>
                  <span className="font-medium">{currentRegion.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{region.flag}</span>
                    <span>{region.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Region Navigation Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {regions.map((region) => (
          <Button
            key={region.id}
            variant={selectedRegion === region.id ? "default" : "outline"}
            onClick={() => handleRegionSwitch(region.id)}
            className="flex flex-col items-center gap-1 h-auto py-3"
            size="sm"
          >
            <span className="text-xl">{region.flag}</span>
            <span className="text-xs font-medium">{region.name.split(' ')[0]}</span>
          </Button>
        ))}
      </div>

      {/* Region Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="driver-card border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Compliance Status</CardTitle>
            {getComplianceIcon(currentRegion.compliance.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {currentRegion.compliance.score}%
            </div>
            <Badge className={`text-xs mt-1 ${getComplianceStatusColor(currentRegion.compliance.status)}`}>
              {currentRegion.compliance.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card className="driver-card border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Active Routes</CardTitle>
            <Truck className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {currentRegion.operations.activeRoutes.toLocaleString()}
            </div>
            <p className="text-xs driver-text-secondary">
              Operational routes
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Drivers</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {currentRegion.operations.drivers.toLocaleString()}
            </div>
            <p className="text-xs driver-text-secondary">
              Certified drivers
            </p>
          </CardContent>
        </Card>

        <Card className="driver-card border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium driver-text-emphasis">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {(currentRegion.operations.revenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs driver-text-secondary">
              {currentRegion.currency} Monthly
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Region Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  Region Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium driver-text-emphasis">Currency</p>
                    <p className="driver-text-secondary">{currentRegion.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium driver-text-emphasis">Language</p>
                    <p className="driver-text-secondary">{currentRegion.language}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium driver-text-emphasis">Timezone</p>
                    <p className="driver-text-secondary">{currentRegion.timezone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium driver-text-emphasis">Last Audit</p>
                    <p className="driver-text-secondary">{currentRegion.compliance.lastAudit}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Key Regulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRegion.regulations.map((regulation, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {regulation}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card className="driver-card">
            <CardHeader>
              <CardTitle className="driver-text-emphasis flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium driver-text-emphasis">Overall Compliance Score</p>
                  <p className="text-2xl font-bold text-green-400">{currentRegion.compliance.score}%</p>
                </div>
                <Badge className={getComplianceStatusColor(currentRegion.compliance.status)}>
                  {getComplianceIcon(currentRegion.compliance.status)}
                  <span className="ml-1">{currentRegion.compliance.status.replace('_', ' ').toUpperCase()}</span>
                </Badge>
              </div>

              <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  All regulatory requirements are met for {currentRegion.name}. Last audit completed on {currentRegion.compliance.lastAudit}.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permits" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Required Permits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRegion.requirements.permits.map((permit, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="driver-text-emphasis">{permit}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRegion.requirements.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="driver-text-emphasis">{cert}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis text-sm">Active Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {currentRegion.operations.activeRoutes.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis text-sm">Drivers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {currentRegion.operations.drivers.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis text-sm">Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {currentRegion.operations.vehicles.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis text-sm">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400">
                  {(currentRegion.operations.revenue / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs driver-text-secondary">{currentRegion.currency}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Required Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRegion.requirements.documentation.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="driver-text-emphasis">{doc}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="driver-card">
              <CardHeader>
                <CardTitle className="driver-text-emphasis">Insurance Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRegion.requirements.insurance.map((insurance, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="driver-text-emphasis">{insurance}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {switchRegionMutation.isPending && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Switching to {currentRegion.name} operations. Updating compliance data and regional settings...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}