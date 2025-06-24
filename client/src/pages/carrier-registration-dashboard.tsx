import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Truck, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Building,
  Shield,
  DollarSign,
  Target,
  Zap,
  RefreshCw,
  Plus,
  Activity,
  BarChart3
} from "lucide-react";

interface CarrierProfile {
  id: string;
  companyName: string;
  dotNumber: string;
  mcNumber: string;
  contactInfo: {
    primaryContact: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  operationalData: {
    fleetSize: number;
    equipmentTypes: string[];
    operatingRegions: string[];
    safetyRating: string;
    yearsInBusiness: number;
  };
  packetStatus: {
    acquired: boolean;
    completeness: number;
    missingDocuments: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  targetRoutes: string[];
}

interface RHIMSCarrier {
  id: string;
  carrierName: string;
  dotNumber: string;
  mcNumber: string;
  rhimsId: string;
  serviceAreas: string[];
  equipmentTypes: string[];
  specializations: string[];
  agreementStatus: {
    rhimsRegistered: boolean;
    contractSigned: boolean;
    insuranceVerified: boolean;
  };
  performanceMetrics: {
    responseTime: number;
    completionRate: number;
    customerRating: number;
  };
}

interface GoHighwayPartner {
  id: string;
  companyName: string;
  goHighwayId: string;
  integrationLevel: string;
  serviceOfferings: string[];
  coverageAreas: {
    states: string[];
    radius: number;
  };
  onboardingStatus: {
    applicationSubmitted: boolean;
    documentsVerified: boolean;
    agreementSigned: boolean;
    apiAccessGranted: boolean;
  };
}

export default function CarrierRegistrationDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: carrierPacketStats } = useQuery({
    queryKey: ['/api/carrier-packets/stats'],
  });

  const { data: allCarriers } = useQuery<CarrierProfile[]>({
    queryKey: ['/api/carrier-packets/carriers'],
  });

  const { data: rhimsCarriers } = useQuery<RHIMSCarrier[]>({
    queryKey: ['/api/rhims-gohighway/rhims-carriers'],
  });

  const { data: goHighwayPartners } = useQuery<GoHighwayPartner[]>({
    queryKey: ['/api/rhims-gohighway/gohighway-partners'],
  });

  const { data: registrationStats } = useQuery({
    queryKey: ['/api/rhims-gohighway/stats'],
  });

  const { data: registrationCampaigns } = useQuery({
    queryKey: ['/api/rhims-gohighway/campaigns'],
  });

  const approveCarrierMutation = useMutation({
    mutationFn: async (carrierId: string) => {
      const response = await fetch(`/api/carrier-packets/approve/${carrierId}`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carrier-packets'] });
    }
  });

  const addCarrierMutation = useMutation({
    mutationFn: async (carrierData: any) => {
      const response = await fetch('/api/carrier-packets/add-carrier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carrierData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carrier-packets'] });
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return 'text-green-600';
    if (completeness >= 70) return 'text-blue-600';
    if (completeness >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Carrier Registration & Packet Management</h1>
          <p className="text-gray-600">AI-powered carrier acquisition and RHIMS/GoHighway integration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Carrier
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packets">Carrier Packets</TabsTrigger>
          <TabsTrigger value="rhims">RHIMS Integration</TabsTrigger>
          <TabsTrigger value="gohighway">GoHighway Platform</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Carriers</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{carrierPacketStats?.totalCarriers || 0}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-600">Acquisition Rate: {carrierPacketStats?.acquisitionRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Packets Acquired</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{carrierPacketStats?.packetsAcquired || 0}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={parseFloat(carrierPacketStats?.acquisitionRate || '0')} className="flex-1" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RHIMS Registered</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrationStats?.rhims?.registered || 0}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-blue-600">{registrationStats?.rhims?.registrationRate || 0}% complete</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GoHighway Partners</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrationStats?.goHighway?.registered || 0}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-green-600">{registrationStats?.goHighway?.registrationRate || 0}% complete</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Agent Activity */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Agent Activity
              </CardTitle>
              <CardDescription>
                Real-time carrier acquisition and registration progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Zap className="h-4 w-4" />
                  <AlertTitle>Acquisition in Progress</AlertTitle>
                  <AlertDescription>
                    AI agent is processing {carrierPacketStats?.queueSize || 0} carriers in the acquisition queue.
                    Next scan scheduled in 2 hours.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-900">Successful Acquisitions</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-700">{carrierPacketStats?.packetsAcquired || 0}</div>
                    <p className="text-sm text-green-600">Documents verified and active</p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-yellow-900">Pending Review</span>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">
                      {(carrierPacketStats?.totalCarriers || 0) - (carrierPacketStats?.packetsAcquired || 0)}
                    </div>
                    <p className="text-sm text-yellow-600">Awaiting documentation</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">Active Campaigns</span>
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{carrierPacketStats?.activeCampaigns || 0}</div>
                    <p className="text-sm text-blue-600">Outreach campaigns running</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Registration Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Highway Express Logistics approved</p>
                      <p className="text-sm text-gray-600">RHIMS registration completed</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Mountain Ridge Transport packet received</p>
                      <p className="text-sm text-gray-600">Documentation 85% complete</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">4 hours ago</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Atlantic Coast Carriers contacted</p>
                      <p className="text-sm text-gray-600">Initial outreach sent via email</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">6 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packets">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Carrier Packet Status</CardTitle>
                <CardDescription>
                  AI-acquired carrier documentation and verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allCarriers && allCarriers.map((carrier, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Truck className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{carrier.companyName}</h4>
                            <p className="text-sm text-gray-600">DOT: {carrier.dotNumber} | MC: {carrier.mcNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(carrier.packetStatus.verificationStatus)}>
                            {carrier.packetStatus.verificationStatus}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            Fleet: {carrier.operationalData.fleetSize} trucks
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">Packet Completeness</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={carrier.packetStatus.completeness} className="flex-1" />
                            <span className={`text-sm font-medium ${getCompletenessColor(carrier.packetStatus.completeness)}`}>
                              {carrier.packetStatus.completeness}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-medium">Operating Regions</span>
                          </div>
                          <p className="text-sm text-gray-600">{carrier.operationalData.operatingRegions.join(', ')}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm font-medium">Safety Rating</span>
                          </div>
                          <Badge variant="outline">{carrier.operationalData.safetyRating}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{carrier.contactInfo.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{carrier.contactInfo.phone}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {carrier.packetStatus.verificationStatus === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => approveCarrierMutation.mutate(carrier.id)}
                              disabled={approveCarrierMutation.isPending}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>

                      {carrier.packetStatus.missingDocuments.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <h5 className="font-medium text-yellow-900 mb-1">Missing Documents</h5>
                          <div className="flex flex-wrap gap-2">
                            {carrier.packetStatus.missingDocuments.map((doc, idx) => (
                              <Badge key={idx} variant="outline" className="text-yellow-700">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rhims">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  RHIMS Platform Integration
                </CardTitle>
                <CardDescription>
                  Roadside Help and Information Management System carrier registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{registrationStats?.rhims?.total || 0}</div>
                    <div className="text-sm text-gray-600">Total Carriers</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{registrationStats?.rhims?.registered || 0}</div>
                    <div className="text-sm text-gray-600">Registered</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{registrationStats?.rhims?.registrationRate || 0}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {rhimsCarriers && rhimsCarriers.slice(0, 5).map((carrier, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{carrier.carrierName}</h4>
                          <p className="text-sm text-gray-600">RHIMS ID: {carrier.rhimsId}</p>
                        </div>
                        <div className="flex gap-2">
                          {carrier.agreementStatus.rhimsRegistered && (
                            <Badge className="bg-green-100 text-green-800">Registered</Badge>
                          )}
                          {carrier.agreementStatus.contractSigned && (
                            <Badge className="bg-blue-100 text-blue-800">Contract Signed</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium">Specializations</span>
                          <p className="text-sm text-gray-600">{carrier.specializations.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Equipment</span>
                          <p className="text-sm text-gray-600">{carrier.equipmentTypes.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Service Areas</span>
                          <p className="text-sm text-gray-600">{carrier.serviceAreas.join(', ')}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm">Response Time: {carrier.performanceMetrics.responseTime}min</span>
                          <span className="text-sm">Rating: {carrier.performanceMetrics.customerRating}/5</span>
                          <span className="text-sm">Completion: {carrier.performanceMetrics.completionRate}%</span>
                        </div>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gohighway">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  GoHighway Platform Integration
                </CardTitle>
                <CardDescription>
                  Premium freight network partnership management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{registrationStats?.goHighway?.total || 0}</div>
                    <div className="text-sm text-gray-600">Total Partners</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{registrationStats?.goHighway?.registered || 0}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{registrationStats?.goHighway?.registrationRate || 0}%</div>
                    <div className="text-sm text-gray-600">Approval Rate</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {goHighwayPartners && goHighwayPartners.slice(0, 5).map((partner, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{partner.companyName}</h4>
                          <p className="text-sm text-gray-600">GoHighway ID: {partner.goHighwayId}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{partner.integrationLevel}</Badge>
                          {partner.onboardingStatus.apiAccessGranted && (
                            <Badge className="bg-green-100 text-green-800">API Active</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Service Offerings</span>
                          <p className="text-sm text-gray-600">{partner.serviceOfferings.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Coverage</span>
                          <p className="text-sm text-gray-600">{partner.coverageAreas.states.join(', ')} ({partner.coverageAreas.radius}mi radius)</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-4">
                          {partner.onboardingStatus.applicationSubmitted && (
                            <Badge variant="outline" className="text-green-600">App Submitted</Badge>
                          )}
                          {partner.onboardingStatus.documentsVerified && (
                            <Badge variant="outline" className="text-blue-600">Docs Verified</Badge>
                          )}
                          {partner.onboardingStatus.agreementSigned && (
                            <Badge variant="outline" className="text-purple-600">Agreement Signed</Badge>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          Manage Partner
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Registration Campaigns
                </CardTitle>
                <CardDescription>
                  Automated carrier acquisition and platform registration campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrationCampaigns && registrationCampaigns.map((campaign: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{campaign.id.replace(/_/g, ' ').toUpperCase()}</h4>
                          <p className="text-sm text-gray-600">Platform: {campaign.platform}</p>
                        </div>
                        <Badge className={campaign.platform === 'rhims' ? 'bg-blue-100 text-blue-800' : 
                                        campaign.platform === 'gohighway' ? 'bg-green-100 text-green-800' : 
                                        'bg-purple-100 text-purple-800'}>
                          {campaign.platform.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{campaign.registrationProgress?.identified || 0}</div>
                          <div className="text-xs text-gray-600">Identified</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{campaign.registrationProgress?.contacted || 0}</div>
                          <div className="text-xs text-gray-600">Contacted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{campaign.registrationProgress?.documentsSubmitted || 0}</div>
                          <div className="text-xs text-gray-600">Submitted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{campaign.registrationProgress?.approved || 0}</div>
                          <div className="text-xs text-gray-600">Approved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{campaign.registrationProgress?.active || 0}</div>
                          <div className="text-xs text-gray-600">Active</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm">Success Rate: {campaign.performanceMetrics?.successRate?.toFixed(1) || 0}%</span>
                          <span className="text-sm">Revenue: ${campaign.performanceMetrics?.revenueGenerated?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Campaign
                          </Button>
                          <Button size="sm">
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}