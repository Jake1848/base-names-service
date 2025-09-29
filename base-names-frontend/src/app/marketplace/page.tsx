'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { REGISTERED_DOMAINS } from '@/lib/contracts';
import { Search, Filter, Heart, ExternalLink, Zap, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const mockMarketplace = {
  featuredDomains: [
    { domain: 'base.base', price: 10.0, category: 'Premium', isNew: true, views: 2500 },
    { domain: 'coinbase.base', price: 25.0, category: 'Brand', isNew: false, views: 1800 },
    { domain: 'ethereum.base', price: 5.0, category: 'Crypto', isNew: true, views: 1200 },
    { domain: 'wallet.base', price: 3.5, category: 'Tech', isNew: false, views: 950 }
  ],
  recentSales: [
    { domain: 'crypto.base', price: 0.05, buyer: '0x1234...5678', timestamp: Date.now() - 86400000 },
    { domain: 'defi.base', price: 0.05, buyer: '0x2345...6789', timestamp: Date.now() - 172800000 },
    { domain: 'web3.base', price: 0.05, buyer: '0x3456...7890', timestamp: Date.now() - 259200000 }
  ],
  categories: ['All', 'Premium', 'Brand', 'Crypto', 'Tech', 'DeFi', 'NFT', 'Gaming']
};

function MarketplaceDomainCard({ domain }: {
  domain: { domain: string; price: number; category: string; isNew: boolean; views: number; }
}) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-xl font-bold text-blue-600 group-hover:text-blue-700">
                {domain.domain}
              </CardTitle>
              {domain.isNew && <Badge variant="success">New</Badge>}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className="p-2"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{domain.category}</Badge>
            <span className="text-sm text-gray-500">{domain.views} views</span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="text-2xl font-bold">{domain.price} ETH</p>
                <p className="text-sm text-gray-500">${(domain.price * 2500).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15%
                </div>
                <p className="text-xs text-gray-500">7d change</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="premium" className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecentSaleCard({ sale }: {
  sale: { domain: string; price: number; buyer: string; timestamp: number; }
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium">{sale.domain}</p>
          <p className="text-sm text-gray-500">
            Sold to {sale.buyer.slice(0, 6)}...{sale.buyer.slice(-4)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{sale.price} ETH</p>
        <p className="text-sm text-gray-500">
          {new Date(sale.timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Domain Marketplace</h1>
              <p className="text-gray-600">Buy and sell premium .base domains</p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search domains..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {mockMarketplace.categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* Featured Domains */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Domains</h2>
            <Badge variant="premium" className="px-3 py-1">
              🔥 Hot
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockMarketplace.featuredDomains.map((domain, index) => (
              <motion.div
                key={domain.domain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <MarketplaceDomainCard domain={domain} />
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Marketplace */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Domains</CardTitle>
                <CardDescription>
                  Premium .base domains ready for purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Marketplace Coming Soon
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We&apos;re building a premium marketplace for .base domains. Join our waitlist to be notified when it launches.
                  </p>
                  <div className="space-y-3">
                    <Button variant="premium" size="lg">
                      Join Waitlist
                    </Button>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">1,247</span> people already signed up
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Latest domain transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMarketplace.recentSales.map((sale, index) => (
                    <RecentSaleCard key={index} sale={sale} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Stats */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor Price</span>
                    <span className="font-bold">0.05 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Volume</span>
                    <span className="font-bold">0.5 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales</span>
                    <span className="font-bold">{REGISTERED_DOMAINS.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">24h Change</span>
                    <span className="font-bold text-green-600">+12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Opportunity */}
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Investment Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Early investors in premium .base domains are seeing significant returns as the Base ecosystem grows.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average ROI</span>
                      <span className="font-bold text-green-600">+245%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best Performer</span>
                      <span className="font-bold">crypto.base</span>
                    </div>
                  </div>
                  <Button variant="premium" size="sm" className="w-full">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}