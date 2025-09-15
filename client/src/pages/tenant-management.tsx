import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Users, Database, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  userCount: number;
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
  plan: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  status: 'active' | 'inactive';
  lastLogin: Date;
}

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    setTenants([
      {
        id: '1',
        name: 'Acme Logistics',
        domain: 'acme-logistics.com',
        status: 'active',
        userCount: 25,
        storageUsed: 2.5,
        storageLimit: 10,
        createdAt: new Date('2024-01-15'),
        plan: 'Enterprise'
      },
      {
        id: '2',
        name: 'Global Transport Inc',
        domain: 'global-transport.com',
        status: 'active',
        userCount: 45,
        storageUsed: 7.2,
        storageLimit: 20,
        createdAt: new Date('2024-02-01'),
        plan: 'Professional'
      },
      {
        id: '3',
        name: 'Speedy Delivery',
        domain: 'speedy-delivery.com',
        status: 'inactive',
        userCount: 12,
        storageUsed: 1.8,
        storageLimit: 5,
        createdAt: new Date('2024-01-20'),
        plan: 'Basic'
      }
    ]);

    setUsers([
      {
        id: '1',
        email: 'john.doe@acme-logistics.com',
        name: 'John Doe',
        role: 'Admin',
        tenantId: '1',
        status: 'active',
        lastLogin: new Date('2024-12-10')
      },
      {
        id: '2',
        email: 'jane.smith@global-transport.com',
        name: 'Jane Smith',
        role: 'Manager',
        tenantId: '2',
        status: 'active',
        lastLogin: new Date('2024-12-09')
      }
    ]);
  }, []);

  const handleCreateTenant = (tenantData: Partial<Tenant>) => {
    const newTenant: Tenant = {
      id: Date.now().toString(),
      name: tenantData.name || '',
      domain: tenantData.domain || '',
      status: 'active',
      userCount: 0,
      storageUsed: 0,
      storageLimit: tenantData.storageLimit || 10,
      createdAt: new Date(),
      plan: tenantData.plan || 'Basic'
    };

    setTenants([...tenants, newTenant]);
    setIsCreateDialogOpen(false);
    toast({
      title: 'Tenant Created',
      description: `Tenant ${newTenant.name} has been created successfully.`
    });
  };

  const handleUpdateTenant = (tenantData: Partial<Tenant>) => {
    if (!selectedTenant) return;

    const updatedTenants = tenants.map(tenant =>
      tenant.id === selectedTenant.id
        ? { ...tenant, ...tenantData }
        : tenant
    );

    setTenants(updatedTenants);
    setIsEditDialogOpen(false);
    setSelectedTenant(null);
    toast({
      title: 'Tenant Updated',
      description: `Tenant ${tenantData.name} has been updated successfully.`
    });
  };

  const handleDeleteTenant = (tenantId: string) => {
    setTenants(tenants.filter(tenant => tenant.id !== tenantId));
    toast({
      title: 'Tenant Deleted',
      description: 'Tenant has been deleted successfully.'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-muted-foreground">Manage multi-tenant organizations and their users</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new tenant organization to the platform
              </DialogDescription>
            </DialogHeader>
            <TenantForm onSubmit={handleCreateTenant} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenants.length}</div>
                <p className="text-xs text-muted-foreground">
                  {tenants.filter(t => t.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenants.reduce((sum, tenant) => sum + tenant.userCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all tenants
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenants.reduce((sum, tenant) => sum + tenant.storageUsed, 0).toFixed(1)} GB
                </div>
                <p className="text-xs text-muted-foreground">
                  Total allocated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Users/Tenant</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenants.length > 0 ? Math.round(tenants.reduce((sum, tenant) => sum + tenant.userCount, 0) / tenants.length) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per organization
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tenant Organizations</CardTitle>
              <CardDescription>
                Manage tenant organizations and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.domain}</TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell>{tenant.userCount}</TableCell>
                      <TableCell>{tenant.storageUsed} / {tenant.storageLimit} GB</TableCell>
                      <TableCell>{tenant.plan}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTenant(tenant.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users across all tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {tenants.find(t => t.id === user.tenantId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.lastLogin.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics charts would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Resource usage charts would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Tenant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant organization details
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <TenantForm
              initialData={selectedTenant}
              onSubmit={handleUpdateTenant}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TenantFormProps {
  initialData?: Partial<Tenant>;
  onSubmit: (data: Partial<Tenant>) => void;
}

function TenantForm({ initialData, onSubmit }: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    domain: initialData?.domain || '',
    storageLimit: initialData?.storageLimit || 10,
    plan: initialData?.plan || 'Basic'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tenant Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          type="url"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storageLimit">Storage Limit (GB)</Label>
        <Input
          id="storageLimit"
          type="number"
          value={formData.storageLimit}
          onChange={(e) => setFormData({ ...formData, storageLimit: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan">Plan</Label>
        <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Professional">Professional</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? 'Update Tenant' : 'Create Tenant'}
      </Button>
    </form>
  );
}