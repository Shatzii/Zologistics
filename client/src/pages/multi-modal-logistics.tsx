import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Ship, Plane, Truck, Globe, DollarSign, TrendingUp, MapPin, Clock } from 'lucide-react';

export default function MultiModalLogistics() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch sea freight data
  const { data: seaFreightShipments } = useQuery({
    queryKey: ['/api/sea-freight/shipments'],
  });

  const { data: seaPorts } = useQuery({
    queryKey: ['/api/sea-freight/ports'],
  });

  const { data: seaCarriers } = useQuery({
    queryKey: ['/api/sea-freight/carriers'],
  });

  const { data: seaAnalytics } = useQuery({
    queryKey: ['/api/sea-freight/analytics'],
  });

  // Fetch air freight data
  const { data: airFreightShipments } = useQuery({
    queryKey: ['/api/air-freight/shipments'],
  });

  const { data: airports } = useQuery({
    queryKey: ['/api/air-freight/airports'],
  });

  const { data: airCarriers } = useQuery({
    queryKey: ['/api/air-freight/carriers'],
  });

  const { data: airAnalytics } = useQuery({
    queryKey: ['/api/air-freight/analytics'],
  });

  const marketOpportunities = {
    trucking: {
      value: '20.5B',
      growth: '+12%',
      margin: '8-15%'
    },
    seaFreight: {
      value: '5.7B',
      growth: '+18%',
      margin: '12-25%'
    },
    airFreight: {
      value: '3.65B',
      growth: '+22%',
      margin: '15-35%'
    }
  };

  const totalMarket = '29.85B';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Modal Logistics Platform</h1>
          <p className="text-gray-600">Unified trucking, sea freight, and air freight operations</p>
        </div>
        <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
          ${totalMarket} Market Opportunity
        </Badge>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              Trucking Platform
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marketOpportunities.trucking.value}</div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Growth: {marketOpportunities.trucking.growth}</span>
              <span>Margin: {marketOpportunities.trucking.margin}</span>
            </div>
            <div className="mt-2">
              <Badge variant="outline">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ship className="h-4 w-4 text-teal-600" />
              Sea Freight Platform
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marketOpportunities.seaFreight.value}</div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Growth: {marketOpportunities.seaFreight.growth}</span>
              <span>Margin: {marketOpportunities.seaFreight.margin}</span>
            </div>
            <div className="mt-2">
              <Badge className="bg-teal-100 text-teal-800">No Licensing Required</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plane className="h-4 w-4 text-purple-600" />
              Air Freight Platform
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marketOpportunities.airFreight.value}</div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Growth: {marketOpportunities.airFreight.growth}</span>
              <span>Margin: {marketOpportunities.airFreight.margin}</span>
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-100 text-purple-800">Pure Tech Aggregation</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Modal Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sea-freight">Sea Freight</TabsTrigger>
          <TabsTrigger value="air-freight">Air Freight</TabsTrigger>
          <TabsTrigger value="optimization">Route Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Revenue Streams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Platform Fees</span>
                    <span className="font-semibold">5-8% of shipment value</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rate Arbitrage</span>
                    <span className="font-semibold">8-15% margin</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Premium Services</span>
                    <span className="font-semibold">15-25% markup</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Real-time Tracking</span>
                    <span className="font-semibold">$50-200/shipment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Competitive Advantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">No freight forwarder licensing required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Pure technology platform model</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">AI-powered route optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Real-time visibility across all modes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Automated compliance monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sea-freight" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Active Shipments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {seaFreightShipments?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Ocean freight shipments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Global Ports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {seaPorts?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Connected ports worldwide</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ocean Carriers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {seaCarriers?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Partner shipping lines</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sea Freight Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Container Services</h4>
                  <ul className="text-sm space-y-1">
                    <li>• FCL (Full Container Load)</li>
                    <li>• LCL (Less than Container Load)</li>
                    <li>• Reefer containers</li>
                    <li>• Hazmat shipping</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Value-Added Services</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Real-time vessel tracking</li>
                    <li>• Port optimization</li>
                    <li>• Customs clearance</li>
                    <li>• Insurance coverage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="air-freight" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Active Flights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {airFreightShipments?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Air cargo shipments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Global Airports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {airports?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Connected airports worldwide</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Air Carriers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {airCarriers?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Partner airlines</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Air Freight Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Express Services</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Same-day delivery</li>
                    <li>• Next-flight-out</li>
                    <li>• Time-critical shipments</li>
                    <li>• AOG (Aircraft on Ground)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Specialized Cargo</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Temperature-controlled</li>
                    <li>• Pharmaceutical shipping</li>
                    <li>• High-value cargo</li>
                    <li>• Dangerous goods</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Modal Route Optimization</CardTitle>
              <p className="text-sm text-gray-600">
                AI-powered optimization across trucking, sea freight, and air freight
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Optimization Factors</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Cost Efficiency</span>
                      <Badge variant="outline">Primary</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Transit Time</span>
                      <Badge variant="outline">Critical</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbon Footprint</span>
                      <Badge variant="outline">Tracked</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Management</span>
                      <Badge variant="outline">Automated</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Typical Combinations</h4>
                  <div className="space-y-2 text-sm">
                    <div>Truck → Port → Sea Freight → Port → Truck</div>
                    <div>Truck → Airport → Air Freight → Airport → Truck</div>
                    <div>Sea Freight → Rail → Truck (Last Mile)</div>
                    <div>Air Freight → Cross-dock → Regional Delivery</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}