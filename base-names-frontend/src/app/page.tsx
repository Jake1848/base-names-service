'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useSwitchChain } from 'wagmi';
import { Search, Globe, Shield, Zap, Users, TrendingUp, ExternalLink, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { CONTRACTS, ABIS, PREMIUM_DOMAINS, labelHash } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedModeToggle } from '@/components/enhanced-mode-toggle';
import { AnimatedBackground } from '@/components/animated-background';
import { cn, formatAddress, formatPrice, formatDate, getDaysUntilExpiry } from '@/lib/utils';

function PremiumDomainCard({ domain }: { domain: string }) {
  const [copied, setCopied] = useState(false);
  const tokenId = labelHash(domain);

  const { data: isAvailable } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: [tokenId],
  });

  const { data: owner } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'ownerOf',
    args: [tokenId],
    query: { enabled: !isAvailable }
  });

  const { data: expires } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'nameExpires',
    args: [tokenId],
    query: { enabled: !isAvailable }
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const daysLeft = expires ? getDaysUntilExpiry(Number(expires)) : 0;
  const isExpiringSoon = daysLeft <= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-primary group-hover:text-primary/80 transition-colors">
              {domain}.base
            </CardTitle>
            <Badge variant={isAvailable ? "success" : "info"}>
              {isAvailable ? 'Available' : 'Registered'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {!isAvailable && owner && expires ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Owner:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {formatAddress(owner as string)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(owner as string)}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Expires:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{formatDate(Number(expires))}</span>
                  {isExpiringSoon && (
                    <Badge variant="warning" className="text-xs">
                      {daysLeft} days left
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(`https://basescan.org/token/${CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar}?a=${tokenId}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  View on BaseScan
                </Button>
              </div>
            </div>
          ) : null}

          {isAvailable ? (
            <div className="text-center">
              <Badge variant="success" className="mb-3">
                Ready to Register
              </Badge>
              <p className="text-sm text-muted-foreground mb-3">
                This premium domain is available for registration
              </p>
              <Button variant="premium" size="sm" className="w-full">
                Register Now
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DomainSearchSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { isConnected, address, chain } = useAccount();
  const { writeContract } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const tokenId = searchTerm ? labelHash(searchTerm) : null;

  const { data: isAvailable, error: availabilityError, isLoading: isCheckingAvailability } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId && searchTerm.length > 0 }
  });

  const { data: price, error: priceError } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BasePriceOracle as `0x${string}`,
    abi: ABIS.BasePriceOracle,
    functionName: 'price',
    args: [searchTerm, BigInt(0), BigInt(365 * 24 * 60 * 60)], // 1 year
    query: { enabled: !!searchTerm && searchTerm.length > 0 && isAvailable === true }
  });

  // Debugging: Log contract call results
  console.log('Search Debug:', {
    searchTerm,
    tokenId: tokenId?.toString(),
    isAvailable,
    availabilityError: availabilityError?.message,
    price: price?.toString(),
    priceError: priceError?.message,
    isCheckingAvailability
  });

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsSearching(true);
    // Simulate search delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSearching(false);
  };

  const handleRegister = () => {
    if (!tokenId || !isConnected || !address) return;

    writeContract({
      address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
      abi: ABIS.BaseRegistrar,
      functionName: 'register',
      args: [tokenId, address, BigInt(365 * 24 * 60 * 60)],
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
          Own Your Digital Identity
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Register and manage .base domains on Base Layer 2. Fast, cheap, and decentralized.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-2 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Search & Register Domains</CardTitle>
            <CardDescription className="text-center">
              Find your perfect .base domain name
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  placeholder="Enter domain name"
                  className="w-full pl-10 pr-16 py-4 text-lg border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                  .base
                </span>
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                variant="premium"
                disabled={!searchTerm || isSearching}
                className="sm:w-auto w-full"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {searchTerm && searchTerm.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t pt-6"
              >
                {availabilityError ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                    <span className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                      ⚠️ Unable to check availability
                    </span>
                    <p className="text-yellow-600 dark:text-yellow-500 mt-2">
                      {chain?.id !== 8453 ?
                        'Please switch to Base network to check domain availability.' :
                        'Please make sure you&apos;re connected to Base network. Domain might be available for registration.'
                      }
                    </p>
                    {chain?.id !== 8453 && switchChain && (
                      <Button
                        onClick={() => switchChain({ chainId: 8453 })}
                        variant="outline"
                        className="mt-4"
                      >
                        Switch to Base Network
                      </Button>
                    )}
                    <p className="text-xs text-yellow-500 dark:text-yellow-600 mt-2">Debug: {availabilityError.message}</p>
                  </div>
                ) : isCheckingAvailability || isAvailable === undefined ? (
                  <div className="text-center py-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Checking availability...</p>
                  </div>
                ) : isAvailable ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <Check className="h-6 w-6 text-green-600 mr-2" />
                      <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                        {searchTerm}.base is available!
                      </span>
                    </div>

                    {price ? (
                      <div className="text-center mb-4">
                        <span className="text-2xl font-bold">
                          {formatPrice((price as [bigint, bigint])[0])} ETH
                        </span>
                        <span className="text-muted-foreground ml-2">/ year</span>
                      </div>
                    ) : null}

                    {isConnected ? (
                      <Button
                        onClick={handleRegister}
                        variant="premium"
                        size="xl"
                        className="w-full"
                      >
                        Register {searchTerm}.base
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">Connect your wallet to register this domain</p>
                        <ConnectButton />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <span className="text-lg font-semibold text-red-700 dark:text-red-400">
                      ❌ {searchTerm}.base is already registered
                    </span>
                    <p className="text-red-600 dark:text-red-400 mt-2">Try a different name or check our marketplace</p>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatsSection() {
  const stats = [
    { icon: Users, label: 'Available Premium Domains', value: PREMIUM_DOMAINS.length.toString(), color: 'text-primary' },
    { icon: Zap, label: 'Base Mainnet Chain', value: '8453', color: 'text-primary' },
    { icon: TrendingUp, label: 'Registration Price', value: '0.05 ETH', color: 'text-primary' },
    { icon: Globe, label: 'Network Status', value: 'Live', color: 'text-primary' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <stat.icon className={cn("h-8 w-8 mx-auto mb-3", stat.color)} />
              <div className={cn("text-3xl font-bold mb-1", stat.color)}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Decentralized',
      description: 'Your domains are secured by smart contracts on Base L2'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Register domains in seconds with Base L2 speed'
    },
    {
      icon: Globe,
      title: 'Web3 Compatible',
      description: 'Works with all major wallets and dApps'
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
        >
          <Card className="text-center h-full hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 pb-8">
              <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle className="mb-3">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg"></div>
              <div>
                <h1 className="text-2xl font-bold">Base Names</h1>
                <p className="text-sm text-muted-foreground">Decentralized domains on Base L2</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/analytics'}
                className="hidden sm:flex"
              >
                📊 Analytics
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/marketplace'}
                className="hidden sm:flex"
              >
                🏪 Marketplace
              </Button>
              <EnhancedModeToggle />
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-20">
          <DomainSearchSection />
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <StatsSection />
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Base Names?</h2>
            <p className="text-xl text-muted-foreground">Built for the future of web3</p>
          </div>
          <FeaturesSection />
        </section>

        {/* Premium Domains Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Premium .base Domains</h2>
            <p className="text-xl text-muted-foreground">Get these valuable domains before anyone else</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMIUM_DOMAINS.map((domain, index) => (
              <motion.div
                key={domain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PremiumDomainCard domain={domain} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contract Info */}
        <section className="py-16">
          <Card>
            <CardHeader>
              <CardTitle>Smart Contract Addresses (Base Mainnet)</CardTitle>
              <CardDescription>All contracts are verified and live on Base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CONTRACTS.BASE_MAINNET.contracts).map(([name, address]) => (
                  <div key={name} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">{name}:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        {formatAddress(address)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Base Names. Built for the Base ecosystem.</p>
            <p className="mt-2">Powered by Base L2 • Made with ❤️ for web3</p>
          </div>
        </div>
      </footer>
    </div>
  );
}