import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Lock,
  Eye,
  Trash2,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComplianceRecord {
  id: string;
  type: 'gdpr' | 'ccpa' | 'audit';
  title: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'under-review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
}

interface DataSubjectRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  userId: string;
  userEmail: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  description: string;
}

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export default function ComplianceDashboardPage() {
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([
    {
      id: '1',
      type: 'gdpr',
      title: 'Data Retention Policy Review',
      description: 'Annual review of data retention policies for compliance',
      status: 'compliant',
      severity: 'medium',
      createdAt: new Date('2024-11-01'),
      resolvedAt: new Date('2024-11-15')
    },
    {
      id: '2',
      type: 'ccpa',
      title: 'Privacy Notice Update',
      description: 'Update privacy notice for CCPA compliance requirements',
      status: 'pending',
      severity: 'high',
      createdAt: new Date('2024-12-01')
    },
    {
      id: '3',
      type: 'audit',
      title: 'Security Assessment',
      description: 'Quarterly security assessment and vulnerability scan',
      status: 'in-progress',
      severity: 'high',
      createdAt: new Date('2024-12-10')
    }
  ]);

  const [dataRequests, setDataRequests] = useState<DataSubjectRequest[]>([
    {
      id: '1',
      type: 'access',
      userId: 'user_123',
      userEmail: 'john.doe@example.com',
      status: 'completed',
      requestedAt: new Date('2024-11-20'),
      completedAt: new Date('2024-11-25'),
      description: 'Request to access all personal data'
    },
    {
      id: '2',
      type: 'erasure',
      userId: 'user_456',
      userEmail: 'jane.smith@example.com',
      status: 'in-progress',
      requestedAt: new Date('2024-12-01'),
      description: 'Request to delete all personal data'
    },
    {
      id: '3',
      type: 'portability',
      userId: 'user_789',
      userEmail: 'bob.johnson@example.com',
      status: 'pending',
      requestedAt: new Date('2024-12-10'),
      description: 'Request for data portability'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      action: 'USER_LOGIN',
      userId: 'user_123',
      userEmail: 'john.doe@example.com',
      resource: 'authentication',
      timestamp: new Date('2024-12-15T10:30:00'),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      action: 'DATA_ACCESS',
      userId: 'user_456',
      userEmail: 'jane.smith@example.com',
      resource: 'user_profile',
      timestamp: new Date('2024-12-15T10:25:00'),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    },
    {
      id: '3',
      action: 'DATA_MODIFICATION',
      userId: 'admin_001',
      userEmail: 'admin@company.com',
      resource: 'user_settings',
      timestamp: new Date('2024-12-15T10:20:00'),
      ipAddress: '10.0.0.1',
      userAgent: 'Admin Console v2.1'
    }
  ]);

  const { toast } = useToast();

  const getStatusBadge = (status: string, type: 'compliance' | 'request' = 'compliance') => {
    const variants = {
      compliant: 'default',
      'non-compliant': 'destructive',
      pending: 'secondary',
      'under-review': 'outline',
      'in-progress': 'secondary',
      completed: 'default',
      rejected: 'destructive'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive'
    } as const;

    return <Badge variant={variants[severity as keyof typeof variants] || 'secondary'}>{severity}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gdpr': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'ccpa': return <Lock className="w-4 h-4 text-green-600" />;
      case 'audit': return <FileText className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const complianceStats = {
    totalRecords: complianceRecords.length,
    compliant: complianceRecords.filter(r => r.status === 'compliant').length,
    pending: complianceRecords.filter(r => r.status === 'pending').length,
    nonCompliant: complianceRecords.filter(r => r.status === 'non-compliant').length
  };

  const requestStats = {
    totalRequests: dataRequests.length,
    pending: dataRequests.filter(r => r.status === 'pending').length,
    inProgress: dataRequests.filter(r => r.status === 'in-progress').length,
    completed: dataRequests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground">GDPR, CCPA, and regulatory compliance management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Audit
          </Button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <Progress value={94.2} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.pending + complianceStats.nonCompliant}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {complianceStats.pending} pending, {complianceStats.nonCompliant} non-compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requestStats.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {requestStats.pending} pending, {requestStats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Records</CardTitle>
              <CardDescription>
                Track GDPR, CCPA, and other regulatory compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(record.type)}
                          <span className="uppercase text-xs font-medium">{record.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{record.title}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{getSeverityBadge(record.severity)}</TableCell>
                      <TableCell>{record.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Requests</CardTitle>
              <CardDescription>
                Manage GDPR and CCPA data subject access requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Badge variant="outline">{request.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.userEmail}</div>
                          <div className="text-sm text-muted-foreground">ID: {request.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status, 'request')}</TableCell>
                      <TableCell>{request.requestedAt.toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Process
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Comprehensive audit trail of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userEmail}</div>
                          <div className="text-sm text-muted-foreground">ID: {log.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">GDPR Compliance Report</h4>
                    <p className="text-sm text-muted-foreground">Monthly compliance assessment</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">CCPA Compliance Report</h4>
                    <p className="text-sm text-muted-foreground">California privacy compliance</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Security Audit Report</h4>
                    <p className="text-sm text-muted-foreground">Quarterly security assessment</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>GDPR Deadline Approaching</AlertTitle>
                  <AlertDescription>
                    Annual GDPR compliance review due in 7 days.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Data Retention Cleanup</AlertTitle>
                  <AlertDescription>
                    1,247 records scheduled for deletion in 30 days.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Privacy Policy Update</AlertTitle>
                  <AlertDescription>
                    Privacy policy requires update for new regulations.
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