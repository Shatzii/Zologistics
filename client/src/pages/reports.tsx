import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Calendar as CalendarIcon, Filter, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [reportType, setReportType] = useState("financial");

  const { data: loads } = useQuery({
    queryKey: ["/api/loads"],
  });

  const { data: drivers } = useQuery({
    queryKey: ["/api/drivers"],
  });

  const { data: negotiations } = useQuery({
    queryKey: ["/api/negotiations"],
  });

  const reportTypes = [
    { value: "financial", label: "Financial Summary", icon: "💰" },
    { value: "operational", label: "Operational Performance", icon: "📊" },
    { value: "driver", label: "Driver Performance", icon: "👥" },
    { value: "route", label: "Route Analysis", icon: "🗺️" },
    { value: "compliance", label: "Compliance Report", icon: "📋" },
  ];

  const generateReport = () => {
    // Implementation would generate and download the selected report
    console.log(`Generating ${reportType} report for ${format(dateRange.from, 'PPP')} to ${format(dateRange.to, 'PPP')}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate comprehensive business reports</p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>Select report type and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => range && setDateRange(range)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Report Preview</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {reportTypes.find(t => t.value === reportType)?.label} Preview
              </CardTitle>
              <CardDescription>
                Preview of {reportTypes.find(t => t.value === reportType)?.label.toLowerCase()} 
                for {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportType === "financial" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">$67,000</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">$45,000</p>
                      <p className="text-sm text-muted-foreground">Total Costs</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">$22,000</p>
                      <p className="text-sm text-muted-foreground">Net Profit</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">32.8%</p>
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Revenue Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-muted rounded">
                        <span>Dry Van Loads</span>
                        <span className="font-medium">$43,000</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded">
                        <span>Reefer Loads</span>
                        <span className="font-medium">$18,000</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded">
                        <span>Flatbed Loads</span>
                        <span className="font-medium">$6,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportType === "operational" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{loads?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Loads</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">87%</p>
                      <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">2.3</p>
                      <p className="text-sm text-muted-foreground">Avg Days Transit</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">94%</p>
                      <p className="text-sm text-muted-foreground">Fleet Utilization</p>
                    </div>
                  </div>
                </div>
              )}

              {reportType === "driver" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{drivers?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Active Drivers</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">4.7/5</p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">12%</p>
                      <p className="text-sm text-muted-foreground">Turnover Rate</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">156</p>
                      <p className="text-sm text-muted-foreground">Avg Miles/Week</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((template) => (
              <Card key={template.value} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    {template.label}
                  </CardTitle>
                  <CardDescription>
                    Generate detailed {template.label.toLowerCase()} with comprehensive metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">Template</Badge>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automated report generation and delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Weekly Financial Summary</h4>
                    <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Active</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Monthly Operations Report</h4>
                    <p className="text-sm text-muted-foreground">First of every month</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Active</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Quarterly Driver Performance</h4>
                    <p className="text-sm text-muted-foreground">Every quarter end</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Paused</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Scheduled Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}