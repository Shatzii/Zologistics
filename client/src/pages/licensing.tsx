import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertTriangle, FileText, DollarSign, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LicenseApplication {
  id: string;
  applicationType: string;
  status: string;
  submittedDate?: string;
  approvalDate?: string;
  licenseNumber?: string;
  applicationData: {
    legalBusinessName: string;
    businessStructure: string;
    einNumber: string;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    primaryContact: {
      name: string;
      title: string;
      phone: string;
      email: string;
    };
    bondAmount: number;
    insuranceAmount: number;
    operatingStates: string[];
    equipmentTypes: string[];
    estimatedAnnualRevenue: number;
    officers: Array<{
      name: string;
      title: string;
      ownershipPercentage: number;
      backgroundCheck: boolean;
    }>;
  };
  requirements: Array<{
    id: string;
    requirement: string;
    description: string;
    mandatory: boolean;
    completed: boolean;
    estimatedCost?: number;
    helpText: string;
  }>;
  fees: {
    applicationFee: number;
    bondCost: number;
    insuranceCost: number;
    total: number;
  };
  timeline: {
    estimatedProcessingTime: string;
    milestones: Array<{
      step: string;
      description: string;
      completed: boolean;
      completedDate?: string;
    }>;
  };
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const EQUIPMENT_TYPES = [
  'Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Lowboy', 'Tanker', 'Auto Hauler', 'Container'
];

export default function LicensingPage() {
  const [selectedLicenseType, setSelectedLicenseType] = useState('broker_authority');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: applications = [] } = useQuery({
    queryKey: ['/api/licensing/applications/1'], // Company ID 1
    refetchInterval: 30000
  });

  const { data: currentApplication } = useQuery({
    queryKey: ['/api/licensing/application', applicationId],
    enabled: !!applicationId
  });

  const createApplicationMutation = useMutation({
    mutationFn: (licenseType: string) => 
      apiRequest(`/api/licensing/create`, {
        method: 'POST',
        body: { companyId: 1, licenseType }
      }),
    onSuccess: (data) => {
      setApplicationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/licensing/applications/1'] });
    }
  });

  const updateApplicationMutation = useMutation({
    mutationFn: (updates: any) =>
      apiRequest(`/api/licensing/update/${applicationId}`, {
        method: 'PUT',
        body: updates
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/licensing/application', applicationId] });
    }
  });

  const submitApplicationMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/licensing/submit/${applicationId}`, {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/licensing/applications/1'] });
    }
  });

  useEffect(() => {
    if (applications.length > 0 && !applicationId) {
      const draftApp = applications.find((app: any) => app.status === 'draft');
      if (draftApp) {
        setApplicationId(draftApp.id);
      }
    }
  }, [applications, applicationId]);

  const handleCreateApplication = () => {
    createApplicationMutation.mutate(selectedLicenseType);
  };

  const handleUpdateField = (field: string, value: any) => {
    const updates = { [field]: value };
    updateApplicationMutation.mutate(updates);
  };

  const handleSubmitApplication = () => {
    submitApplicationMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'submitted':
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'draft':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProgressPercentage = (app: LicenseApplication) => {
    if (!app.requirements) return 0;
    const completed = app.requirements.filter(req => req.completed).length;
    return Math.round((completed / app.requirements.length) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Licensing Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your transportation authority applications and licensing requirements
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-xs text-muted-foreground">
                  {applications.filter((app: any) => app.status === 'submitted').length} submitted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Costs</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(applications.reduce((sum: number, app: any) => sum + (app.fees?.total || 0), 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total application costs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3-4 weeks</div>
                <p className="text-xs text-muted-foreground">
                  Average approval time
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Applications</CardTitle>
              <CardDescription>
                Track the status of your licensing applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first licensing application to begin dispatching operations
                  </p>
                  <div className="space-y-3">
                    <Select value={selectedLicenseType} onValueChange={setSelectedLicenseType}>
                      <SelectTrigger className="w-full max-w-xs mx-auto">
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="broker_authority">Broker Authority (MC Number)</SelectItem>
                        <SelectItem value="motor_carrier">Motor Carrier Authority</SelectItem>
                        <SelectItem value="freight_forwarder">Freight Forwarder</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateApplication} disabled={createApplicationMutation.isPending}>
                      {createApplicationMutation.isPending ? 'Creating...' : 'Start Application'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app: any) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(app.status)}
                          <div>
                            <h4 className="font-medium capitalize">
                              {app.applicationType.replace('_', ' ')}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Application {app.id}
                            </p>
                          </div>
                        </div>
                        <Badge variant={app.status === 'approved' ? 'default' : 'secondary'}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{getProgressPercentage(app)}%</span>
                          </div>
                          <Progress value={getProgressPercentage(app)} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {app.fees && `Total Cost: ${formatCurrency(app.fees.total)}`}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setApplicationId(app.id)}
                          >
                            {app.status === 'draft' ? 'Continue' : 'View Details'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-6">
          {currentApplication ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(currentApplication.status)}
                    <span>
                      {currentApplication.applicationType.replace('_', ' ').toUpperCase()} Application
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Complete all required fields to submit your application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Business Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Legal Business Name *</Label>
                        <Input
                          id="businessName"
                          value={currentApplication.applicationData.legalBusinessName || ''}
                          onChange={(e) => handleUpdateField('legalBusinessName', e.target.value)}
                          placeholder="Enter legal business name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="businessStructure">Business Structure *</Label>
                        <Select 
                          value={currentApplication.applicationData.businessStructure}
                          onValueChange={(value) => handleUpdateField('businessStructure', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select business structure" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="llc">LLC</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="einNumber">EIN Number *</Label>
                        <Input
                          id="einNumber"
                          value={currentApplication.applicationData.einNumber || ''}
                          onChange={(e) => handleUpdateField('einNumber', e.target.value)}
                          placeholder="XX-XXXXXXX"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="annualRevenue">Estimated Annual Revenue</Label>
                        <Input
                          id="annualRevenue"
                          type="number"
                          value={currentApplication.applicationData.estimatedAnnualRevenue || ''}
                          onChange={(e) => handleUpdateField('estimatedAnnualRevenue', parseInt(e.target.value))}
                          placeholder="1000000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Business Address</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          value={currentApplication.applicationData.businessAddress.street || ''}
                          onChange={(e) => handleUpdateField('businessAddress', {
                            ...currentApplication.applicationData.businessAddress,
                            street: e.target.value
                          })}
                          placeholder="123 Main Street"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={currentApplication.applicationData.businessAddress.city || ''}
                          onChange={(e) => handleUpdateField('businessAddress', {
                            ...currentApplication.applicationData.businessAddress,
                            city: e.target.value
                          })}
                          placeholder="Denver"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Select 
                          value={currentApplication.applicationData.businessAddress.state}
                          onValueChange={(value) => handleUpdateField('businessAddress', {
                            ...currentApplication.applicationData.businessAddress,
                            state: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={currentApplication.applicationData.businessAddress.zipCode || ''}
                          onChange={(e) => handleUpdateField('businessAddress', {
                            ...currentApplication.applicationData.businessAddress,
                            zipCode: e.target.value
                          })}
                          placeholder="80202"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Primary Contact */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Primary Contact</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name *</Label>
                        <Input
                          id="contactName"
                          value={currentApplication.applicationData.primaryContact.name || ''}
                          onChange={(e) => handleUpdateField('primaryContact', {
                            ...currentApplication.applicationData.primaryContact,
                            name: e.target.value
                          })}
                          placeholder="John Smith"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactTitle">Title *</Label>
                        <Input
                          id="contactTitle"
                          value={currentApplication.applicationData.primaryContact.title || ''}
                          onChange={(e) => handleUpdateField('primaryContact', {
                            ...currentApplication.applicationData.primaryContact,
                            title: e.target.value
                          })}
                          placeholder="Owner/President"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone Number *</Label>
                        <Input
                          id="contactPhone"
                          value={currentApplication.applicationData.primaryContact.phone || ''}
                          onChange={(e) => handleUpdateField('primaryContact', {
                            ...currentApplication.applicationData.primaryContact,
                            phone: e.target.value
                          })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email Address *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={currentApplication.applicationData.primaryContact.email || ''}
                          onChange={(e) => handleUpdateField('primaryContact', {
                            ...currentApplication.applicationData.primaryContact,
                            email: e.target.value
                          })}
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operating Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Operating Information</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Operating States</Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                          {US_STATES.map(state => (
                            <label key={state} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={currentApplication.applicationData.operatingStates.includes(state)}
                                onChange={(e) => {
                                  const states = e.target.checked
                                    ? [...currentApplication.applicationData.operatingStates, state]
                                    : currentApplication.applicationData.operatingStates.filter(s => s !== state);
                                  handleUpdateField('operatingStates', states);
                                }}
                                className="rounded"
                              />
                              <span>{state}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Equipment Types</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {EQUIPMENT_TYPES.map(equipment => (
                            <label key={equipment} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={currentApplication.applicationData.equipmentTypes.includes(equipment)}
                                onChange={(e) => {
                                  const types = e.target.checked
                                    ? [...currentApplication.applicationData.equipmentTypes, equipment]
                                    : currentApplication.applicationData.equipmentTypes.filter(t => t !== equipment);
                                  handleUpdateField('equipmentTypes', types);
                                }}
                                className="rounded"
                              />
                              <span>{equipment}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button variant="outline">Save Draft</Button>
                    <Button 
                      onClick={handleSubmitApplication}
                      disabled={submitApplicationMutation.isPending || getProgressPercentage(currentApplication) < 100}
                    >
                      {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Application Selected</h3>
                  <p className="text-muted-foreground">
                    Please select an application from the overview tab or create a new one
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          {currentApplication && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements Checklist</CardTitle>
                <CardDescription>
                  Complete all mandatory requirements to submit your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentApplication.requirements.map((req: any) => (
                    <div key={req.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="pt-1">
                          {req.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{req.requirement}</h4>
                            <div className="flex items-center space-x-2">
                              {req.mandatory && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {req.estimatedCost && (
                                <Badge variant="secondary" className="text-xs">
                                  {formatCurrency(req.estimatedCost)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {req.description}
                          </p>
                          <details className="text-sm">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              View help information
                            </summary>
                            <div className="mt-2 p-3 bg-blue-50 rounded border">
                              {req.helpText}
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          {currentApplication && (
            <Card>
              <CardHeader>
                <CardTitle>Application Status & Timeline</CardTitle>
                <CardDescription>
                  Track your application progress through the approval process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{getProgressPercentage(currentApplication)}%</div>
                      <p className="text-sm text-muted-foreground">Complete</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(currentApplication.fees.total)}</div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentApplication.timeline.estimatedProcessingTime}</div>
                      <p className="text-sm text-muted-foreground">Processing Time</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Processing Timeline</h4>
                    {currentApplication.timeline.milestones.map((milestone: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="pt-1">
                          {milestone.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{milestone.step}</h5>
                            {milestone.completedDate && (
                              <span className="text-sm text-muted-foreground">
                                {new Date(milestone.completedDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}