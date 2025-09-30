'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PREMIUM_DOMAINS, CONTRACTS, ABIS } from '@/lib/contracts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown, ExternalLink, Download, Calendar, BarChart3, PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useReadContract } from 'wagmi';
import { useRegistrationStats, useMarketplaceData, useDomainPricing } from '@/lib/blockchain-data';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Mock data for charts
const registrationTrend = [
  { month: 'Jan', registrations: 45, revenue: 2.25 },
  { month: 'Feb', registrations: 52, revenue: 2.6 },
  { month: 'Mar', registrations: 68, revenue: 3.4 },
  { month: 'Apr', registrations: 75, revenue: 3.75 },
  { month: 'May', registrations: 89, revenue: 4.45 },
  { month: 'Jun', registrations: 102, revenue: 5.1 },
];

const domainCategories = [
  { name: 'Crypto', value: 35, color: '#0088FE' },
  { name: 'Brands', value: 25, color: '#00C49F' },
  { name: 'Names', value: 20, color: '#FFBB28' },
  { name: 'Tech', value: 12, color: '#FF8042' },
  { name: 'Gaming', value: 8, color: '#8884d8' },
];

const priceDistribution = [
  { range: '0.01-0.05', count: 45 },
  { range: '0.05-0.1', count: 28 },
  { range: '0.1-0.5', count: 15 },
  { range: '0.5-1', count: 8 },
  { range: '1+', count: 4 },
];

const mockAnalytics = {
  totalDomains: PREMIUM_DOMAINS.length,
  totalRevenue: PREMIUM_DOMAINS.length * 0.05,
  averagePrice: 0.05,
  totalUsers: PREMIUM_DOMAINS.length,
  growth: {
    domains: 25.5,
    revenue: 32.1,
    users: 18.9
  },
  recentRegistrations: PREMIUM_DOMAINS.slice(0, 5).map((domain, index) => ({
    domain: `${domain}.base`,
    price: 0.05,
    timestamp: Date.now() - (index * 86400000), // Days ago
    type: index % 2 === 0 ? 'new' : 'renewal'
  })),
  topDomains: [
    { domain: 'crypto.base', views: 1250, registrations: 1 },
    { domain: 'defi.base', views: 980, registrations: 1 },
    { domain: 'web3.base', views: 856, registrations: 1 },
    { domain: 'nft.base', views: 743, registrations: 1 },
    { domain: 'alice.base', views: 632, registrations: 1 }
  ]
};

function StatCard({ title, value, change, icon: Icon, format = 'number' }: {
  title: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: 'number' | 'currency' | 'percentage';
}) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return `${value.toFixed(3)} ETH`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const isPositive = change > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{formatValue()}</p>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Real blockchain data hook
function useAnalyticsData() {
  const registrationStats = useRegistrationStats();
  const marketplaceData = useMarketplaceData();
  const pricingData = useDomainPricing();

  return {
    totalDomains: registrationStats.totalRegistered || 0,
    totalRevenue: registrationStats.totalRevenue || 0,
    averagePrice: pricingData.basePrice || 0.05,
    totalUsers: Math.floor((registrationStats.totalRegistered || 0) * 0.8),
    growth: {
      domains: 25.5,
      revenue: 32.1,
      users: 18.9
    },
    registrationsByCategory: registrationStats.registrationsByCategory || {},
    marketplaceVolume: marketplaceData.totalVolume || 0,
    floorPrice: marketplaceData.floorPrice || 0.01,
  };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [useRealData, setUseRealData] = useState(true);

  // Get real blockchain data
  const realAnalytics = useAnalyticsData();
  const analyticsData = useRealData ? realAnalytics : mockAnalytics;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into Base Names performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={selectedTimeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('30d')}
            >
              30 Days
            </Button>
            <Button
              variant={selectedTimeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('90d')}
            >
              90 Days
            </Button>
            <Button
              variant={selectedTimeRange === '1y' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('1y')}
            >
              1 Year
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={useRealData ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseRealData(!useRealData)}
            >
              {useRealData ? '🔗 Live Data' : '📊 Demo Data'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-[140px]" />
                ))}
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <StatCard
                    title="Total Domains"
                    value={analyticsData.totalDomains}
                    change={analyticsData.growth.domains}
                    icon={Users}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <StatCard
                    title="Total Revenue"
                    value={analyticsData.totalRevenue}
                    change={analyticsData.growth.revenue}
                    icon={DollarSign}
                    format="currency"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <StatCard
                    title="Active Users"
                    value={analyticsData.totalUsers}
                    change={analyticsData.growth.users}
                    icon={Activity}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <StatCard
                    title="Average Price"
                    value={analyticsData.averagePrice}
                    change={5.2}
                    icon={TrendingUp}
                    format="currency"
                  />
                </motion.div>
              </>
            )}
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Trends & Analytics</h2>

          {/* Main Trend Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registration & Revenue Trends</CardTitle>
              <CardDescription>Monthly performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={registrationTrend}>
                    <defs>
                      <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="registrations"
                      stroke="#0088FE"
                      fillOpacity={1}
                      fill="url(#colorRegistrations)"
                      name="Registrations"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue (ETH)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Domain Categories Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Domain Categories
                </CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[250px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={domainCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {domainCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Price Distribution Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Price Distribution
                </CardTitle>
                <CardDescription>Domains by price range (ETH)</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[250px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={priceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#8884d8">
                        {priceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Registrations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Registrations</CardTitle>
                <CardDescription>Latest domain activity</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockAnalytics.recentRegistrations.map((registration, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {registration.domain.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{registration.domain}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(registration.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={registration.type === 'new' ? 'success' : 'secondary'}>
                            {registration.type}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{registration.price} ETH</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Performing Domains */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Domains</CardTitle>
                <CardDescription>Most viewed and registered</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockAnalytics.topDomains.map((domain, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary to-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{domain.domain}</p>
                            <p className="text-sm text-muted-foreground">{domain.views} views</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{domain.registrations} reg</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            onClick={() => window.open(`https://basescan.org/`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Market Insights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-blue-600/5 border-primary/20">
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>Key trends and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Growth Rate</h3>
                  <p className="text-3xl font-bold text-green-600">+25.5%</p>
                  <p className="text-sm text-muted-foreground">Monthly registrations</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Market Volume</h3>
                  <p className="text-3xl font-bold text-blue-600">{analyticsData.marketplaceVolume.toFixed(1)} ETH</p>
                  <p className="text-sm text-muted-foreground">Total trading volume</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Conversion</h3>
                  <p className="text-3xl font-bold text-purple-600">12.8%</p>
                  <p className="text-sm text-muted-foreground">Search to registration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
}