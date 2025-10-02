'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Users, Shield, BarChart3, Settings, Download, Plus, Search, Filter, Calendar, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface EnterpriseAccount {
  id: string;
  companyName: string;
  adminAddress: string;
  domains: EnterpriseDomain[];
  users: EnterpriseUser[];
  billing: BillingInfo;
  settings: EnterpriseSettings;
}

interface EnterpriseDomain {
  name: string;
  owner: string;
  assignedTo: string;
  department: string;
  expiryDate: Date;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'pending';
}

interface EnterpriseUser {
  address: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  permissions: string[];
  lastActive: Date;
}

interface BillingInfo {
  plan: 'starter' | 'professional' | 'enterprise';
  monthlyFee: number;
  domainsIncluded: number;
  additionalDomainFee: number;
  nextBillingDate: Date;
  paymentMethod: string;
}

interface EnterpriseSettings {
  autoRenewal: boolean;
  bulkOperations: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  ssoEnabled: boolean;
  auditLogging: boolean;
}

export default function EnterprisePage() {
  const { address, isConnected } = useAccount();
  const [account, setAccount] = useState<EnterpriseAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [bulkDomains, setBulkDomains] = useState('');

  const loadEnterpriseAccount = async () => {
    setLoading(true);
    try {
      // Mock enterprise account data - would fetch from API
      const accountData: EnterpriseAccount = {
        id: 'ent_123456',
        companyName: 'Your Company',
        adminAddress: address || '',
        domains: [
          {
            name: 'company',
            owner: address || '',
            assignedTo: 'admin@company.com',
            department: 'IT',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            autoRenew: true,
            status: 'active'
          },
          {
            name: 'company-dev',
            owner: address || '',
            assignedTo: 'dev@company.com',
            department: 'Engineering',
            expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
            autoRenew: true,
            status: 'active'
          },
          {
            name: 'company-staging',
            owner: address || '',
            assignedTo: 'dev@company.com',
            department: 'Engineering',
            expiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
            autoRenew: false,
            status: 'active'
          }
        ],
        users: [
          {
            address: address || '',
            email: 'admin@company.com',
            role: 'admin',
            department: 'IT',
            permissions: ['manage_domains', 'manage_users', 'billing', 'settings'],
            lastActive: new Date()
          },
          {
            address: '0x1234567890123456789012345678901234567890',
            email: 'manager@company.com',
            role: 'manager',
            department: 'Marketing',
            permissions: ['manage_domains', 'view_analytics'],
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ],
        billing: {
          plan: 'professional',
          monthlyFee: 500,
          domainsIncluded: 10,
          additionalDomainFee: 25,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentMethod: '**** 1234'
        },
        settings: {
          autoRenewal: true,
          bulkOperations: true,
          apiAccess: true,
          customBranding: false,
          ssoEnabled: false,
          auditLogging: true
        }
      };
      setAccount(accountData);
    } catch (error) {
      console.error('Error loading enterprise account:', error);
      toast.error('Failed to load enterprise account');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadEnterpriseAccount();
    }
  }, [isConnected]);

  const handleBulkRegister = async () => {
    const domains = bulkDomains.split('\n').filter(d => d.trim());
    if (domains.length === 0) {
      toast.error('Please enter at least one domain');
      return;
    }

    toast.info(`Bulk registering ${domains.length} domains...`);
    // Would call bulk registration contract
    setBulkDomains('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-600">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-600">Manager</Badge>;
      case 'user':
        return <Badge variant="secondary">User</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to access Enterprise Portal
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Enterprise Portal</h1>
              <p className="text-muted-foreground">Manage your organization's .base domains</p>
            </div>
            <Button size="lg">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Total Domains
                </CardDescription>
                <CardTitle className="text-3xl">{account?.domains.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Members
                </CardDescription>
                <CardTitle className="text-3xl">{account?.users.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expiring Soon
                </CardDescription>
                <CardTitle className="text-3xl text-orange-600">
                  {account?.domains.filter(d => {
                    const daysUntilExpiry = Math.floor((d.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry < 90;
                  }).length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Plan
                </CardDescription>
                <CardTitle className="text-2xl capitalize">{account?.billing.plan || 'N/A'}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="domains">Domains</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common enterprise operations</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Plus className="w-6 h-6" />
                    Register New Domain
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Users className="w-6 h-6" />
                    Invite Team Member
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bulk Domain Registration</CardTitle>
                  <CardDescription>Register multiple domains at once</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    className="w-full min-h-[120px] p-3 border rounded-md bg-background"
                    placeholder="Enter domain names (one per line)&#10;example1&#10;example2&#10;example3"
                    value={bulkDomains}
                    onChange={(e) => setBulkDomains(e.target.value)}
                  />
                  <Button onClick={handleBulkRegister} disabled={!bulkDomains.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Register Domains
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Domains Tab */}
            <TabsContent value="domains" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Domain Portfolio</CardTitle>
                      <CardDescription>All domains owned by your organization</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Auto Renew</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account?.domains.map((domain, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{domain.name}.base</TableCell>
                          <TableCell>{domain.assignedTo}</TableCell>
                          <TableCell>{domain.department}</TableCell>
                          <TableCell>{domain.expiryDate.toLocaleDateString()}</TableCell>
                          <TableCell>{domain.autoRenew ? <CheckCircle className="w-4 h-4 text-green-600" /> : '-'}</TableCell>
                          <TableCell>{getStatusBadge(domain.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Manage access and permissions</CardDescription>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Invite User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account?.users.map((user, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {user.permissions.length} permissions
                            </span>
                          </TableCell>
                          <TableCell>{user.lastActive.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Manage your subscription and payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <p className="text-2xl font-bold capitalize">{account?.billing.plan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Fee</p>
                      <p className="text-2xl font-bold">${account?.billing.monthlyFee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Domains Included</p>
                      <p className="text-2xl font-bold">{account?.billing.domainsIncluded}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Billing Date</p>
                      <p className="text-2xl font-bold">{account?.billing.nextBillingDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="outline">Upgrade Plan</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise Settings</CardTitle>
                  <CardDescription>Configure your organization's preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {account && Object.entries(account.settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm text-muted-foreground">
                          {key === 'autoRenewal' && 'Automatically renew domains before expiry'}
                          {key === 'bulkOperations' && 'Enable bulk domain management'}
                          {key === 'apiAccess' && 'API access for integrations'}
                          {key === 'customBranding' && 'Custom branding for your portal'}
                          {key === 'ssoEnabled' && 'Single Sign-On integration'}
                          {key === 'auditLogging' && 'Detailed activity logging'}
                        </p>
                      </div>
                      <Badge variant={value ? 'default' : 'secondary'}>
                        {value ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
