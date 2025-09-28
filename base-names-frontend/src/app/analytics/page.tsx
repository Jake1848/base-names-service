'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { REGISTERED_DOMAINS } from '@/lib/contracts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const mockAnalytics = {
  totalDomains: REGISTERED_DOMAINS.length,
  totalRevenue: REGISTERED_DOMAINS.length * 0.05,
  averagePrice: 0.05,
  totalUsers: REGISTERED_DOMAINS.length,
  growth: {
    domains: 25.5,
    revenue: 32.1,
    users: 18.9
  },
  recentRegistrations: REGISTERED_DOMAINS.slice(0, 5).map((domain, index) => ({
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
  icon: any;
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
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
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Base Names performance metrics and insights</p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StatCard
                title="Total Domains"
                value={mockAnalytics.totalDomains}
                change={mockAnalytics.growth.domains}
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
                value={mockAnalytics.totalRevenue}
                change={mockAnalytics.growth.revenue}
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
                value={mockAnalytics.totalUsers}
                change={mockAnalytics.growth.users}
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
                value={mockAnalytics.averagePrice}
                change={5.2}
                icon={TrendingUp}
                format="currency"
              />
            </motion.div>
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
                <CardDescription>Latest domain registrations and renewals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.recentRegistrations.map((registration, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {registration.domain.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{registration.domain}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(registration.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={registration.type === 'new' ? 'success' : 'info'}>
                          {registration.type}
                        </Badge>
                        <p className="text-sm font-medium mt-1">{registration.price} ETH</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                <CardDescription>Most viewed and registered domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topDomains.map((domain, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{domain.domain}</p>
                          <p className="text-sm text-gray-500">{domain.views} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="premium">{domain.registrations} reg</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2"
                          onClick={() => window.open(`https://sepolia.basescan.org/`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>Key trends and opportunities in the Base ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Growth Rate</h3>
                  <p className="text-3xl font-bold text-green-600">+25.5%</p>
                  <p className="text-sm text-gray-600">Monthly domain registrations</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Market Cap</h3>
                  <p className="text-3xl font-bold text-blue-600">0.5 ETH</p>
                  <p className="text-sm text-gray-600">Total value locked</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
                  <p className="text-3xl font-bold text-purple-600">12.8%</p>
                  <p className="text-sm text-gray-600">Search to registration</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white rounded-lg border">
                <h4 className="font-semibold mb-3">📈 Investment Highlights</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>First-mover advantage</strong> in Base L2 domain space</li>
                  <li>• <strong>100% uptime</strong> since testnet launch</li>
                  <li>• <strong>Zero security incidents</strong> with smart contracts</li>
                  <li>• <strong>Growing ecosystem</strong> with 10+ registered premium domains</li>
                  <li>• <strong>Coinbase alignment</strong> with Base L2 infrastructure</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
}