import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, TrendingUp, Users, Truck, DollarSign, Target, Zap, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AutonomousDashboard() {
  const { data: autonomousStatus } = useQuery({
    queryKey: ['/api/autonomous/status'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: recentDecisions } = useQuery({
    queryKey: ['/api/autonomous/decisions?limit=10'],
    refetchInterval: 10000
  });

  const { data: managedDrivers } = useQuery({
    queryKey: ['/api/autonomous/drivers'],
    refetchInterval: 30000
  });

  const { data: prospects } = useQuery({
    queryKey: ['/api/customers/prospects?limit=5'],
    refetchInterval: 30000
  });

  const { data: revenueStreams } = useQuery({
    queryKey: ['/api/customers/revenue-streams'],
    refetchInterval: 60000
  });

  if (!autonomousStatus) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium mb-2">Loading Autonomous Systems</h3>
          <p className="text-muted-foreground">Connecting to AI dispatch engines...</p>
        </div>
      </div>
    );
  }

  const { dispatch, customerAcquisition, overallAutomation } = autonomousStatus;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              Autonomous Operations
            </h1>
            <p className="text-muted-foreground mt-2">
              Fully automated trucking dispatch and customer acquisition
            </p>
          </div>
          <Badge variant="default" className="bg-green-600">
            <Activity className="h-4 w-4 mr-1" />
            Fully Autonomous
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${overallAutomation.monthlyRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +{overallAutomation.growthRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Systems</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAutomation.systemsActive}</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAcquisition.activeCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {customerAcquisition.conversionRate?.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dispatch.profitProgress?.percentage?.toFixed(0) || 0}%
            </div>
            <Progress 
              value={dispatch.profitProgress?.percentage || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dispatch" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dispatch">AI Dispatch</TabsTrigger>
          <TabsTrigger value="customers">Customer Acquisition</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Streams</TabsTrigger>
          <TabsTrigger value="decisions">AI Decisions</TabsTrigger>
        </TabsList>

        <TabsContent value="dispatch" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Performance</CardTitle>
                <CardDescription>
                  Real-time autonomous dispatch metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Loads</span>
                    <Badge variant="secondary">
                      {dispatch.operationsCount?.activeLoads || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Managed Drivers</span>
                    <Badge variant="secondary">
                      {dispatch.operationsCount?.managedDrivers || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AI Decisions</span>
                    <Badge variant="secondary">
                      {dispatch.operationsCount?.decisionsExecuted || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Driver Efficiency</span>
                    <Badge variant="default">
                      {dispatch.performanceMetrics?.averageDriverEfficiency?.toFixed(1) || 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Driver Management</CardTitle>
                <CardDescription>
                  Autonomous driver optimization and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {managedDrivers && managedDrivers.length > 0 ? (
                  <div className="space-y-3">
                    {managedDrivers.slice(0, 3).map((driver: any) => (
                      <div key={driver.driverId} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Driver {driver.driverId}</span>
                          <Badge variant={driver.automationLevel === 'full_autonomous' ? 'default' : 'secondary'}>
                            {driver.automationLevel.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>On-time: {driver.performanceMetrics.onTimeDelivery?.toFixed(1)}%</div>
                          <div>Efficiency: {driver.performanceMetrics.fuelEfficiency?.toFixed(1)}%</div>
                          <div>Revenue: ${driver.performanceMetrics.profitGenerated?.toLocaleString()}</div>
                          <div>Utilization: {driver.performanceMetrics.hoursUtilization?.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No managed drivers data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>
                  Automated prospect generation and conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Prospects</span>
                    <Badge variant="secondary">
                      {customerAcquisition.totalProspects || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <Badge variant="default">
                      {customerAcquisition.conversionRate?.toFixed(1) || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pipeline Value</span>
                    <Badge variant="default">
                      ${customerAcquisition.pipelineValue?.toLocaleString() || '0'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Campaigns</span>
                    <Badge variant="secondary">
                      {customerAcquisition.activeCampaigns || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Prospects</CardTitle>
                <CardDescription>
                  AI-qualified high-value prospects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {prospects && prospects.length > 0 ? (
                  <div className="space-y-3">
                    {prospects.map((prospect: any) => (
                      <div key={prospect.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">{prospect.companyName}</span>
                          <Badge variant={prospect.relationshipStage === 'active' ? 'default' : 'secondary'}>
                            {prospect.relationshipStage}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Expected: ${prospect.expectedRevenue?.toLocaleString()}</div>
                          <div>Probability: {(prospect.conversionProbability * 100)?.toFixed(0)}%</div>
                          <div>Volume: {prospect.businessProfile?.annualVolume} loads/yr</div>
                          <div>Type: {prospect.customerType}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No prospects data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Streams</CardTitle>
              <CardDescription>
                Automated revenue generation across multiple channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueStreams && revenueStreams.length > 0 ? (
                <div className="space-y-4">
                  {revenueStreams.map((stream: any) => (
                    <div key={stream.streamId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">{stream.type.replace('_', ' ').toUpperCase()}</h4>
                        <Badge variant={stream.automationLevel === 'fully_automated' ? 'default' : 'secondary'}>
                          {stream.automationLevel.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{stream.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">${stream.currentRevenue?.toLocaleString()}</div>
                          <div className="text-muted-foreground">Monthly Revenue</div>
                        </div>
                        <div>
                          <div className="font-medium">{(stream.projectedGrowth * 100)?.toFixed(0)}%</div>
                          <div className="text-muted-foreground">Growth Rate</div>
                        </div>
                        <div>
                          <div className="font-medium">{(stream.profitMargin * 100)?.toFixed(0)}%</div>
                          <div className="text-muted-foreground">Profit Margin</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No revenue streams data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Decisions</CardTitle>
              <CardDescription>
                Real-time autonomous decision making and execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentDecisions && recentDecisions.length > 0 ? (
                <div className="space-y-4">
                  {recentDecisions.map((decision: any) => (
                    <div key={decision.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{decision.decisionType.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={decision.riskAssessment === 'low' ? 'default' : 
                                         decision.riskAssessment === 'medium' ? 'secondary' : 'destructive'}>
                            {decision.riskAssessment} risk
                          </Badge>
                          <Badge variant={decision.autoExecuted ? 'default' : 'outline'}>
                            {decision.autoExecuted ? 'Auto-executed' : 'Manual review'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{decision.reasoning}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span>Expected Profit: ${decision.expectedProfit?.toLocaleString()}</span>
                        <span>Confidence: {decision.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent decisions available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}