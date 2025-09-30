'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PREMIUM_DOMAINS, PREMIUM_DOMAINS_CATEGORIES, getDomainTier, DOMAIN_PRICING, CONTRACTS, ABIS, labelHash } from '@/lib/contracts';
import { useRegistrationEvents, useMarketplaceData, useDomainOwnership } from '@/lib/blockchain-data';
import { useReadContracts } from 'wagmi';
import { Search, Filter, Heart, ExternalLink, Zap, Crown, TrendingUp, ShoppingCart, Clock, DollarSign, Star, ArrowUpRight, ArrowDownRight, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Hook to get real marketplace data from blockchain
function useRealMarketplaceData() {
  const { events: registrationEvents } = useRegistrationEvents();
  const marketplaceData = useMarketplaceData();

  // Get availability status for all domains
  const domainChecks = PREMIUM_DOMAINS.slice(0, 50).map(domain => ({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: [labelHash(domain)],
  }));

  const { data: availabilityData } = useReadContracts({
    contracts: domainChecks,
  });

  // Generate real marketplace data from blockchain
  const realDomains = PREMIUM_DOMAINS.slice(0, 50).map((domain, index) => {
    const isAvailable = Boolean(availabilityData?.[index]?.result);
    const category = Object.keys(PREMIUM_DOMAINS_CATEGORIES)[Math.floor(index / 7)] || 'crypto';

    return {
      domain: `${domain}.base`,
      price: parseFloat(DOMAIN_PRICING[getDomainTier(domain) as keyof typeof DOMAIN_PRICING]),
      previousPrice: parseFloat(DOMAIN_PRICING[getDomainTier(domain) as keyof typeof DOMAIN_PRICING]) * 0.9,
      category,
      isListed: !isAvailable, // If not available, it's registered (could be listed)
      isAvailable,
      isNew: false,
      isTrending: registrationEvents.some(e => e.domain === `${domain}.base`),
      views: 100 + index * 10, // Deterministic based on position
      likes: 5 + index * 2,
      lastSale: Date.now() - (index * 24 * 60 * 60 * 1000),
      seller: '0x0000...0000',
      tier: getDomainTier(domain),
    };
  });

  return {
    domains: realDomains,
    recentSales: marketplaceData.recentSales || [],
    totalVolume: marketplaceData.totalVolume || 0,
    floorPrice: marketplaceData.floorPrice || 0.01,
    loading: marketplaceData.loading,
  };
}

// Convert blockchain events to activity format
function formatRecentActivity(events: any[], sales: any[]) {
  const activity: any[] = [];

  // Safety check for events array
  if (!events || !Array.isArray(events)) {
    return activity;
  }

  // Add recent registrations as listings
  events.slice(0, 3).forEach(event => {
    if (event.domain) {
      activity.push({
        type: 'registration',
        domain: event.domain,
        price: 0.05,
        to: event.owner,
        time: new Date(event.timestamp).toLocaleDateString(),
      });
    }
  });

  // Add recent sales
  if (sales && Array.isArray(sales)) {
    sales.slice(0, 2).forEach(sale => {
    activity.push({
      type: 'sale',
      domain: sale.domain,
      price: sale.price,
      from: sale.from,
      to: sale.to,
      time: new Date(sale.timestamp).toLocaleDateString(),
    });
  });
  }

  return activity.slice(0, 5);
}

function MarketplaceDomainCard({
  domain,
  viewMode = 'grid'
}: {
  domain: any;
  viewMode?: 'grid' | 'list';
}) {
  // All hooks must be called before any early returns
  const [isLiked, setIsLiked] = useState(false);

  console.log('🔍 MarketplaceDomainCard received domain:', domain);

  // Safety check for domain object
  if (!domain) {
    console.error('❌ MarketplaceDomainCard received null/undefined domain');
    return null;
  }

  if (typeof domain !== 'object') {
    console.error('❌ MarketplaceDomainCard received non-object domain:', typeof domain, domain);
    return null;
  }

  // Safety check for price calculations
  const safePrice = typeof domain.price === 'number' ? domain.price : 0;
  const safePreviousPrice = typeof domain.previousPrice === 'number' ? domain.previousPrice : safePrice;
  const priceChange = safePreviousPrice > 0 ? ((safePrice - safePreviousPrice) / safePreviousPrice * 100).toFixed(2) : '0';
  const isPositive = parseFloat(priceChange) > 0;

  const handleBuyNow = () => {
    toast.success(`Purchase initiated for ${domain?.domain || 'domain'}`, {
      description: 'Redirecting to checkout...',
    });
  };

  const handleMakeOffer = () => {
    toast.info(`Make an offer for ${domain?.domain || 'domain'}`, {
      description: 'Opening offer modal...',
    });
  };

  const tierColors = {
    premium: 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
    rare: 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
    standard: 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full"
      >
        <Card className={cn(
          "hover:shadow-lg transition-all duration-300 border-2",
          tierColors[domain.tier as keyof typeof tierColors]
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                  {domain?.domain ? domain.domain.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{domain?.domain || 'Unknown'}</h3>
                    {domain.isNew && <Badge variant="success" className="text-xs">NEW</Badge>}
                    {domain.isTrending && <Badge variant="default" className="text-xs">🔥 HOT</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{domain.category}</Badge>
                    <span className="text-xs text-muted-foreground">{domain.views} views</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{domain.likes} likes</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-2xl font-bold">{domain.price} ETH</p>
                  <div className="flex items-center justify-end mt-1">
                    {isPositive ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {Math.abs(parseFloat(priceChange))}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-2"
                    aria-label="Add to favorites"
                  >
                    <Heart className={cn(
                      "h-4 w-4",
                      isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleMakeOffer}>
                    Make Offer
                  </Button>
                  <Button size="sm" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
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
              aria-label="Add to favorites"
            >
              <Heart className={cn(
                "h-4 w-4",
                isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )} />
            </Button>
          </div>
          <div className="mt-2">
            <CardTitle className="text-xl font-bold">{domain?.domain || 'Unknown'}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {domain.isNew && <Badge variant="success" className="text-xs">NEW</Badge>}
              {domain.isTrending && <Badge variant="default" className="text-xs">🔥 TRENDING</Badge>}
              <Badge variant="secondary" className="text-xs">{domain.category}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold">{domain.price} ETH</p>
                <div className="flex items-center">
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {Math.abs(parseFloat(priceChange))}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ ${(domain.price * 2500).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Listed 2d ago</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{domain.likes} likes</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleMakeOffer}
              >
                Offer
              </Button>
              <Button
                size="sm"
                className="w-full"
                onClick={handleBuyNow}
              >
                Buy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-green-600" />;
      case 'registration':
        return <Crown className="h-4 w-4 text-blue-600" />;
      case 'listing':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'offer':
        return <Zap className="h-4 w-4 text-purple-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityText = () => {
    switch (activity.type) {
      case 'sale':
        return `Sold to ${activity.to?.slice(0, 6)}...${activity.to?.slice(-4)}`;
      case 'registration':
        return `Registered by ${activity.to?.slice(0, 6)}...${activity.to?.slice(-4)}`;
      case 'listing':
        return `Listed by ${activity.seller?.slice(0, 6)}...${activity.seller?.slice(-4)}`;
      case 'offer':
        return `Offer from ${activity.from?.slice(0, 6)}...${activity.from?.slice(-4)}`;
      default:
        return 'Activity';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          {getActivityIcon()}
        </div>
        <div>
          <p className="font-medium text-sm">{activity.domain}</p>
          <p className="text-xs text-muted-foreground">{getActivityText()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-sm">{activity.price} ETH</p>
        <p className="text-xs text-muted-foreground">{activity.time}</p>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredDomains, setFilteredDomains] = useState<any[]>([]);

  // Get real marketplace data
  const marketplaceData = useRealMarketplaceData() || { domains: [], recentSales: [], totalVolume: 0, floorPrice: 0.01, loading: true };
  const { events: registrationEvents = [] } = useRegistrationEvents() || {};
  const loading = marketplaceData?.loading || false;

  // Debug logging
  console.log('🔍 MarketplacePage - marketplaceData:', marketplaceData);
  console.log('🔍 MarketplacePage - registrationEvents:', registrationEvents);
  console.log('🔍 MarketplacePage - filteredDomains length:', filteredDomains?.length);

  // Get recent activity from real events
  const recentActivity = formatRecentActivity(registrationEvents || [], marketplaceData?.recentSales || []);
  console.log('🔍 MarketplacePage - recentActivity:', recentActivity);

  useEffect(() => {
    // Ensure domains is an array before filtering
    if (!marketplaceData.domains || !Array.isArray(marketplaceData.domains)) {
      setFilteredDomains([]);
      return;
    }

    let filtered = [...marketplaceData.domains];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(d =>
      d.price >= priceRange.min && d.price <= priceRange.max
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'trending':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
        filtered.sort((a, b) => b.lastSale - a.lastSale);
        break;
    }

    setFilteredDomains(filtered);
  }, [selectedCategory, searchTerm, sortBy, priceRange, marketplaceData.domains]);

  const categories = ['all', ...Object.keys(PREMIUM_DOMAINS_CATEGORIES)];
  console.log('🔍 MarketplacePage - categories:', categories);

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
              <p className="text-2xl font-bold">{marketplaceData.floorPrice.toFixed(3)} ETH</p>
              <p className="text-xs text-green-600">Real-time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">{marketplaceData.totalVolume.toFixed(1)} ETH</p>
              <p className="text-xs text-green-600">From blockchain</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Registered</p>
              <p className="text-2xl font-bold">{filteredDomains.filter(d => !d.isAvailable).length}</p>
              <p className="text-xs text-muted-foreground">domains</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold">{filteredDomains.filter(d => d.isAvailable).length}</p>
              <p className="text-xs text-green-600">Ready to mint</p>
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
                aria-label="Search domains"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="newest">Recently Listed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => {
              console.log('🔍 Rendering category button:', index, category, typeof category);
              if (typeof category !== 'string') {
                console.error('❌ Invalid category:', category);
                return null;
              }
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Domains Grid/List */}
            {loading ? (
              <div className={cn(
                viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              )}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[280px]" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {filteredDomains.length > 0 ? (
                  <div className={cn(
                    viewMode === 'grid'
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  )}>
                    {filteredDomains.slice(0, 12).map((domain, index) => {
                      console.log('🔍 Rendering domain:', index, domain);
                      if (!domain || !domain.domain) {
                        console.error('❌ Invalid domain object:', domain);
                        return null;
                      }
                      return (
                        <MarketplaceDomainCard
                          key={domain.domain}
                          domain={domain}
                          viewMode={viewMode}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <div className="max-w-sm mx-auto">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No domains found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters or search terms
                      </p>
                    </div>
                  </Card>
                )}
              </AnimatePresence>
            )}

            {/* Pagination */}
            {filteredDomains.length > 12 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" className="mr-2">Previous</Button>
                <Button variant="outline">Next</Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest marketplace transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {recentActivity && Array.isArray(recentActivity) && recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <ActivityItem key={index} activity={activity} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Domain Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Domain Categories</CardTitle>
                <CardDescription>Browse by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(PREMIUM_DOMAINS_CATEGORIES).map(([category, domains], index) => {
                    console.log('🔍 Rendering category stats:', index, category, domains);
                    if (!category || typeof category !== 'string') {
                      console.error('❌ Invalid category:', category);
                      return null;
                    }
                    if (!Array.isArray(filteredDomains)) {
                      console.error('❌ filteredDomains is not an array:', filteredDomains);
                      return null;
                    }

                    const count = filteredDomains.filter(d => d && d.category === category).length;
                    const available = filteredDomains.filter(d => d && d.category === category && d.isAvailable).length;

                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-sm capitalize">
                              {category.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">{category}</p>
                            <p className="text-xs text-muted-foreground">{count} domains</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {available} available
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-blue-600/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">List Your Domain</CardTitle>
                <CardDescription>Join thousands of sellers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Start earning by listing your premium .base domains on our marketplace.
                </p>
                <Button className="w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  Start Selling
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}