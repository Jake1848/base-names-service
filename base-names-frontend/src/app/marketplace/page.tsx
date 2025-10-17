'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, ShoppingBag, TrendingUp, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';

// Simplified marketplace data - no heavy RPC calls
const DEMO_DOMAINS = [
  { domain: 'demo123test.base', price: 0.001, category: 'demo', tier: 'standard', isListed: true },
  { domain: 'jake.base', price: 0.005, category: 'names', tier: 'rare', isListed: false },
  { domain: 'crypto.base', price: 0.1, category: 'crypto', tier: 'premium', isListed: false },
  { domain: 'web3.base', price: 0.08, category: 'web3', tier: 'premium', isListed: false },
  { domain: 'nft.base', price: 0.06, category: 'web3', tier: 'rare', isListed: false },
  { domain: 'defi.base', price: 0.07, category: 'crypto', tier: 'premium', isListed: false },
];

function MarketplaceDomainCard({ domain }: { domain: typeof DEMO_DOMAINS[0] }) {
  const [isLiked, setIsLiked] = useState(false);
  const { isConnected } = useAccount();

  const handleBuyNow = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (domain.isListed) {
      toast.success(`Ready to buy ${domain.domain}!`, {
        description: 'Buy functionality will execute on-chain transaction'
      });
    } else {
      toast.info(`${domain.domain} is not currently for sale`);
    }
  };

  const tierColors = {
    premium: 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
    rare: 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
    standard: 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className={cn(
        "group hover:shadow-xl transition-all duration-300 border-2 h-full flex flex-col",
        tierColors[domain.tier as keyof typeof tierColors]
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className={cn(
                "h-5 w-5",
                domain.tier === 'premium' ? "text-yellow-600" :
                domain.tier === 'rare' ? "text-purple-600" : "text-blue-600"
              )} />
              <Badge variant="outline" className="text-xs capitalize">{domain.tier}</Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className="p-1"
            >
              <Heart className={cn(
                "h-4 w-4",
                isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )} />
            </Button>
          </div>
          <div className="mt-2">
            <CardTitle className="text-xl font-bold">{domain.domain}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {domain.isListed && <Badge variant="success" className="text-xs">LISTED</Badge>}
              <Badge variant="secondary" className="text-xs capitalize">{domain.category}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {domain.isListed ? 'Listed Price' : 'Estimated Value'}
              </p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold">{domain.price} ETH</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ ${(domain.price * 2500).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => toast.info('Make offer feature coming soon!')}
              >
                Offer
              </Button>
              <Button
                size="sm"
                className="w-full"
                onClick={handleBuyNow}
                disabled={!domain.isListed}
              >
                {domain.isListed ? 'Buy Now' : 'Not Listed'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredDomains = DEMO_DOMAINS.filter(domain => {
    const matchesSearch = domain.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || domain.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'demo', 'names', 'crypto', 'web3'];
  const listedCount = DEMO_DOMAINS.filter(d => d.isListed).length;
  const totalVolume = DEMO_DOMAINS.filter(d => d.isListed).reduce((sum, d) => sum + d.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Domain Marketplace</h1>
          <p className="text-muted-foreground">Buy, sell, and trade premium .base domains</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Floor Price</p>
              <p className="text-2xl font-bold">0.001 ETH</p>
              <p className="text-xs text-green-600">Live</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">{totalVolume.toFixed(3)} ETH</p>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Listed</p>
              <p className="text-2xl font-bold">{listedCount}</p>
              <p className="text-xs text-muted-foreground">domains</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Owners</p>
              <p className="text-2xl font-bold">{DEMO_DOMAINS.length}</p>
              <p className="text-xs text-muted-foreground">unique</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search domains..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Domains' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Domains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains.length > 0 ? (
            filteredDomains.map((domain) => (
              <MarketplaceDomainCard
                key={domain.domain}
                domain={domain}
              />
            ))
          ) : (
            <Card className="col-span-full p-12 text-center">
              <div className="max-w-sm mx-auto">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No domains found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Info Banner */}
        <Card className="mt-8 bg-gradient-to-br from-primary/10 to-blue-600/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Live Marketplace on Base Mainnet
            </CardTitle>
            <CardDescription>
              Real transactions • Secure escrow • 2.5% marketplace fee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm mb-2">
                  <strong>demo123test.base</strong> is currently listed for 0.001 ETH
                </p>
                <p className="text-xs text-muted-foreground">
                  View all transactions on{' '}
                  <a
                    href="https://basescan.org/address/0x96F308aC9AAf5416733dFc92188320D24409D4D1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    BaseScan
                  </a>
                </p>
              </div>
              <Button asChild>
                <a
                  href="/dashboard"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  List Your Domain
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
