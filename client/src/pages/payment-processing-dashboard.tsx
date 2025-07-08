import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Fuel,
  Calculator,
  Zap
} from "lucide-react";

interface PaymentStats {
  totalProcessed: number;
  avgProcessingTime: string;
  successRate: number;
  pendingPayments: number;
  factoringSavings: number;
  driverSatisfaction: number;
}

interface Transaction {
  id: string;
  driverId: number;
  driverName: string;
  amount: number;
  type: 'settlement' | 'fuel_advance' | 'load_payment' | 'factoring';
  status: 'completed' | 'processing' | 'pending' | 'failed';
  timestamp: Date;
  processingTime: number;
  method: string;
}

export default function PaymentProcessingDashboard() {
  const [stats, setStats] = useState<PaymentStats>({
    totalProcessed: 2847392,
    avgProcessingTime: "18 minutes",
    successRate: 99.4,
    pendingPayments: 23,
    factoringSavings: 127500,
    driverSatisfaction: 94.2
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Generate realistic transaction data
    const sampleTransactions: Transaction[] = [
      {
        id: "pay-001",
        driverId: 1,
        driverName: "Jake Thompson",
        amount: 4250.00,
        type: "load_payment",
        status: "completed",
        timestamp: new Date(Date.now() - 15 * 60000),
        processingTime: 12,
        method: "Direct Deposit"
      },
      {
        id: "pay-002", 
        driverId: 2,
        driverName: "Maria Gonzalez",
        amount: 3875.50,
        type: "settlement",
        status: "processing",
        timestamp: new Date(Date.now() - 8 * 60000),
        processingTime: 8,
        method: "Factoring Partner"
      },
      {
        id: "pay-003",
        driverId: 3,
        driverName: "Bob Miller",
        amount: 500.00,
        type: "fuel_advance",
        status: "completed",
        timestamp: new Date(Date.now() - 45 * 60000),
        processingTime: 3,
        method: "Fuel Card"
      },
      {
        id: "pay-004",
        driverId: 4,
        driverName: "Sarah Davis",
        amount: 5120.75,
        type: "load_payment",
        status: "pending",
        timestamp: new Date(Date.now() - 5 * 60000),
        processingTime: 0,
        method: "ACH Transfer"
      },
      {
        id: "pay-005",
        driverId: 5,
        driverName: "Mike Wilson",
        amount: 2890.25,
        type: "factoring",
        status: "completed",
        timestamp: new Date(Date.now() - 32 * 60000),
        processingTime: 22,
        method: "RTS Financial"
      }
    ];
    setTransactions(sampleTransactions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing": return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "load_payment": return <DollarSign className="h-4 w-4" />;
      case "settlement": return <Calculator className="h-4 w-4" />;
      case "fuel_advance": return <Fuel className="h-4 w-4" />;
      case "factoring": return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const processInstantPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 3250,
        pendingPayments: prev.pendingPayments - 1
      }));
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Processing Center</h1>
            <p className="text-gray-600 mt-1">Instant payments, factoring integration, and automated settlements</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Real-Time Processing
            </Badge>
            <Button onClick={processInstantPayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Process Instant Payment"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Processed</p>
                <p className="text-2xl font-bold">${stats.totalProcessed.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Processing</p>
                <p className="text-2xl font-bold">{stats.avgProcessingTime}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Factoring Savings</p>
                <p className="text-2xl font-bold">${stats.factoringSavings.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Driver Satisfaction</p>
                <p className="text-2xl font-bold">{stats.driverSatisfaction}%</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Same-Day ACH</p>
                    <p className="text-sm text-gray-600">Average 18 minutes</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Factoring Partners</p>
                    <p className="text-sm text-gray-600">RTS, OTR Capital, Apex</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">3 Partners</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Fuel Card Integration</p>
                    <p className="text-sm text-gray-600">Instant fuel advances</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Live</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Automated Settlements</p>
                    <p className="text-sm text-gray-600">Weekly/bi-weekly/custom</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Automated</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Payment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Same-Day Payments</span>
                  <span>94.2%</span>
                </div>
                <Progress value={94.2} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Driver Satisfaction</span>
                  <span>96.8%</span>
                </div>
                <Progress value={96.8} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Cost Savings vs Traditional</span>
                  <span>73%</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Processing Efficiency</span>
                  <span>89.1%</span>
                </div>
                <Progress value={89.1} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.driverName}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {transaction.type.replace('_', ' ')} via {transaction.method}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-lg">${transaction.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.processingTime > 0 ? `${transaction.processingTime} min` : 'Processing...'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {transaction.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Summary */}
      <Alert className="mt-6">
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          <strong>Payment Processing Benefits:</strong> Same-day payments increase driver retention by 40%, 
          factoring integration saves $127,500 annually, and automated settlements reduce administrative 
          overhead by 60% while improving cash flow for drivers.
        </AlertDescription>
      </Alert>
    </div>
  );
}