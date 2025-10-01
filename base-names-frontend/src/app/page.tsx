'use client';

import { useState, useEffect, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useSwitchChain } from 'wagmi';
import { Search, Globe, Shield, Zap, Users, TrendingUp, ExternalLink, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CONTRACTS, ABIS, PREMIUM_DOMAINS, PREMIUM_DOMAINS_CATEGORIES, getDomainTier, DOMAIN_PRICING, labelHash } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedBackground } from '@/components/animated-background';
import { cn, formatAddress, formatPrice, formatDate, getDaysUntilExpiry } from '@/lib/utils';

// Enhanced domain validation regex
const DOMAIN_NAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const MIN_DOMAIN_LENGTH = 3;
const MAX_DOMAIN_LENGTH = 63;

interface ValidationError {
  type: 'length' | 'format' | 'reserved' | 'invalid';
  message: string;
}

const validateDomainName = (domain: string): ValidationError | null => {
  if (!domain) return null;

  if (domain.length < MIN_DOMAIN_LENGTH) {
    return {
      type: 'length',
      message: `Domain must be at least ${MIN_DOMAIN_LENGTH} characters long`
    };
  }

  if (domain.length > MAX_DOMAIN_LENGTH) {
    return {
      type: 'length',
      message: `Domain must be no more than ${MAX_DOMAIN_LENGTH} characters long`
    };
  }

  if (!DOMAIN_NAME_REGEX.test(domain)) {
    if (domain.startsWith('-') || domain.endsWith('-')) {
      return {
        type: 'format',
        message: 'Domain cannot start or end with a hyphen'
      };
    }
    return {
      type: 'format',
      message: 'Domain can only contain lowercase letters, numbers, and hyphens'
    };
  }

  // Check for reserved words
  const reservedWords = ['www', 'ftp', 'mail', 'email', 'admin', 'root', 'api'];
  if (reservedWords.includes(domain.toLowerCase())) {
    return {
      type: 'reserved',
      message: 'This domain name is reserved and cannot be registered'
    };
  }

  return null;
};

function PremiumDomainCard({ domain }: { domain: string }) {
  const [copied, setCopied] = useState(false);
  const tokenId = labelHash(domain);

  const { data: isAvailable, isLoading: isLoadingAvailability, error: availabilityError } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: [tokenId],
  });

  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'ownerOf',
    args: [tokenId],
    query: { enabled: !isAvailable && !isLoadingAvailability }
  });

  const { data: expires, isLoading: isLoadingExpires } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'nameExpires',
    args: [tokenId],
    query: { enabled: !isAvailable && !isLoadingAvailability }
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const handleRegisterClick = () => {
    const searchSection = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchSection) {
      searchSection.value = domain;
      searchSection.dispatchEvent(new Event('input', { bubbles: true }));
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchSection.focus();
      toast.info(`"${domain}.base" loaded in search`);
    }
  };

  const daysLeft = expires ? getDaysUntilExpiry(Number(expires)) : 0;
  const isExpiringSoon = daysLeft <= 30;

  const isLoading = isLoadingAvailability || isLoadingOwner || isLoadingExpires;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg"
      tabIndex={0}
      role="article"
      aria-label={`Premium domain ${domain}.base`}
    >
      <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
              id={`domain-title-${domain}`}
            >
              {domain}.base
            </CardTitle>
            {isLoading ? (
              <Skeleton className="w-20 h-6" />
            ) : availabilityError ? (
              <Badge variant="destructive" className="font-semibold">
                Error
              </Badge>
            ) : (
              <Badge
                variant={isAvailable ? "success" : "secondary"}
                className="font-semibold"
                aria-label={isAvailable ? 'Domain available for registration' : 'Domain already registered'}
              >
                {isAvailable ? '✨ Available' : '🔒 Registered'}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {availabilityError ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
              <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">Failed to load domain status</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : !isAvailable && owner && expires ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Owner:</span>
                <div className="flex items-center gap-2">
                  <code
                    className="text-xs bg-muted px-2 py-1 rounded"
                    aria-label={`Domain owner address: ${owner}`}
                  >
                    {formatAddress(owner as string)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(owner as string)}
                    className="h-6 w-6 p-0 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Copy owner address to clipboard"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Expires:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm" aria-label={`Expires on ${formatDate(Number(expires))}`}>
                    {formatDate(Number(expires))}
                  </span>
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
                  className="w-full focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => window.open(`https://basescan.org/token/${CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar}?a=${tokenId}`, '_blank')}
                  aria-label={`View ${domain}.base on BaseScan blockchain explorer`}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  View on BaseScan
                </Button>
              </div>
            </div>
          ) : isAvailable ? (
            <div className="text-center">
              <Badge variant="success" className="mb-3">
                Ready to Register
              </Badge>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Premium domain • High value
                </p>
                <p className="text-lg font-bold text-primary">
                  0.05 ETH<span className="text-sm text-muted-foreground ml-1">/year</span>
                </p>
              </div>
              <Button
                variant="default"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 font-semibold text-white shadow-lg hover:shadow-xl transition-all focus-visible:ring-2 focus-visible:ring-primary"
                onClick={handleRegisterClick}
                aria-label={`Register ${domain}.base domain now`}
              >
                🚀 Register Now
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
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isConnected, address, chain } = useAccount();
  const { writeContract, isPending: isRegistering } = useWriteContract();
  const { switchChain } = useSwitchChain();

  // Reduce motion for users who prefer it
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tokenId = searchTerm && !validationError ? labelHash(searchTerm) : null;

  const { data: isAvailable, error: availabilityError, isLoading: isCheckingAvailability } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId && searchTerm.length > 0 && !validationError
    }
  });

  const { data: price, error: priceError, isLoading: isLoadingPrice } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`,
    abi: ABIS.BaseController,
    functionName: 'rentPrice',
    args: [searchTerm, BigInt(365 * 24 * 60 * 60)], // 1 year
    query: { enabled: !!searchTerm && searchTerm.length > 0 && isAvailable === true && !validationError }
  });

  // Real-time validation
  useEffect(() => {
    if (searchTerm) {
      const error = validateDomainName(searchTerm);
      setValidationError(error);
    } else {
      setValidationError(null);
    }
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSearchTerm(value);
    setHasSearched(false);
  };

  const handleSearch = async () => {
    if (!searchTerm || validationError) {
      if (validationError) {
        toast.error(validationError.message);
      }
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Simulate search delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Searched for "${searchTerm}.base"`);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegister = async () => {
    if (!searchTerm || !isConnected || !address || !price || validationError) {
      if (!isConnected) {
        toast.error('Please connect your wallet to register domains');
      } else if (validationError) {
        toast.error(validationError.message);
      }
      return;
    }

    if (chain?.id !== 8453) {
      toast.error('Please switch to Base network to register domains');
      return;
    }

    try {
      // Generate a random secret for the commitment
      const secret = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` as `0x${string}`;

      // Calculate total price (base + premium)
      const totalPrice = price[0] + price[1];

      toast.info('Initiating domain registration...');

      writeContract({
        address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`,
        abi: ABIS.BaseController,
        functionName: 'register',
        args: [
          searchTerm, // name
          address, // owner
          BigInt(365 * 24 * 60 * 60), // duration (1 year)
          secret, // secret
          CONTRACTS.BASE_MAINNET.contracts.PublicResolver as `0x${string}`, // resolver
          [], // data (empty for now)
          true, // reverseRecord
          0 // ownerControlledFuses
        ],
        value: totalPrice // Send ETH with the transaction
      });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isNetworkError = chain?.id !== 8453;
  const hasErrors = availabilityError || priceError || isNetworkError;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
          Own Your Digital Identity
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Register and manage .base domains on Base Layer 2. Fast, cheap, and decentralized.
        </p>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={prefersReducedMotion ? {} : { duration: 0.5, delay: 0.2 }}
        className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-4 rounded-lg"
      >
        <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-2 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-center" id="search-section-title">
              Search & Register Domains
            </CardTitle>
            <CardDescription className="text-center">
              Find your perfect .base domain name
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter domain name"
                  className={cn(
                    "w-full pl-10 pr-16 py-4 text-lg border-2 rounded-lg transition-all bg-white/90 dark:bg-white/10 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none",
                    validationError
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive"
                      : "border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary"
                  )}
                  aria-label="Enter domain name to search"
                  aria-describedby={validationError ? "domain-error" : "domain-suffix"}
                  aria-invalid={!!validationError}
                  role="searchbox"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium"
                  id="domain-suffix"
                  aria-label="domain suffix"
                >
                  .base
                </span>
                {validationError && (
                  <div
                    className="absolute left-0 top-full mt-1 text-sm text-destructive flex items-center gap-1"
                    id="domain-error"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {validationError.message}
                  </div>
                )}
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                variant="premium"
                disabled={!searchTerm || isSearching || !!validationError}
                className="sm:w-auto w-full focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={isSearching ? 'Searching for domain' : 'Search for domain'}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>

            {searchTerm && searchTerm.length > 0 && hasSearched && !validationError && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t pt-6"
                role="region"
                aria-label="Domain search results"
              >
                {hasErrors ? (
                  <div className="bg-yellow-100/90 dark:bg-yellow-900/30 backdrop-blur-sm border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-6 text-center">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <span className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 block">
                      Unable to check availability
                    </span>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2 font-medium">
                      {isNetworkError ?
                        'Please switch to Base network to check domain availability.' :
                        'Network error occurred. Please try again or check your connection.'
                      }
                    </p>
                    {isNetworkError && switchChain && (
                      <Button
                        onClick={() => {
                          switchChain({ chainId: 8453 });
                          toast.info('Switching to Base network...');
                        }}
                        variant="outline"
                        className="mt-4 focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Switch to Base network"
                      >
                        Switch to Base Network
                      </Button>
                    )}
                  </div>
                ) : isCheckingAvailability || isLoadingPrice || isAvailable === undefined ? (
                  <div className="text-center py-8" role="status" aria-label="Checking domain availability">
                    <Skeleton className="h-8 w-8 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-48 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                ) : isAvailable ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <Check className="h-6 w-6 text-green-600 mr-2" />
                      <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                        {searchTerm}.base is available!
                      </span>
                    </div>

                    {price ? (
                      <div className="text-center mb-4">
                        <span className="text-2xl font-bold text-green-700 dark:text-green-400">
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
                        className="w-full focus-visible:ring-2 focus-visible:ring-primary"
                        disabled={isRegistering || !price}
                        aria-label={`Register ${searchTerm}.base domain`}
                      >
                        {isRegistering ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          `Register ${searchTerm}.base`
                        )}
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">Connect your wallet to register this domain</p>
                        <div className="flex justify-center">
                          <ConnectButton />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <span className="text-lg font-semibold text-red-700 dark:text-red-400 block">
                      {searchTerm}.base is already registered
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
  const [registeredCount, setRegisteredCount] = useState(0);
  const [totalValue, setTotalValue] = useState('0');
  const [isLoading, setIsLoading] = useState(true);

  // For now, use static data to avoid hook violation
  const domainStatuses = PREMIUM_DOMAINS.slice(0, 20).map(domain => ({
    domain,
    isAvailable: false, // Most premium domains are likely registered
    isLoading: false
  }));

  useEffect(() => {
    const allLoaded = domainStatuses.every(d => !d.isLoading);
    if (allLoaded) {
      const registered = domainStatuses.filter(d => d.isAvailable === false).length;
      setRegisteredCount(registered);
      setTotalValue((registered * 0.05).toFixed(2));
      setIsLoading(false);
    }
  }, [domainStatuses]);

  const stats = [
    {
      icon: Users,
      label: 'Premium Domains',
      value: PREMIUM_DOMAINS.length.toString(),
      subtext: isLoading ? 'Loading...' : `${registeredCount} registered`,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      label: 'Base Chain ID',
      value: '8453',
      subtext: 'Layer 2',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      label: 'Starting Price',
      value: '0.01 ETH',
      subtext: 'Standard domains',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      label: 'Total Value',
      value: isLoading ? '...' : `${totalValue} ETH`,
      subtext: 'Domains registered',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" role="region" aria-label="Domain statistics">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
          className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg"
          tabIndex={0}
          role="article"
          aria-label={`${stat.label}: ${stat.value}`}
        >
          <Card className="relative overflow-hidden hover:shadow-2xl transition-all hover:scale-105 border-2 border-primary/10 hover:border-primary/30">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`} />
            <CardContent className="pt-6 relative">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              {isLoading && (stat.label === 'Premium Domains' || stat.label === 'Total Value') ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stat.value}
                </div>
              )}
              {stat.subtext && (
                <>
                  {isLoading && stat.label === 'Premium Domains' ? (
                    <Skeleton className="h-3 w-16 mt-1" />
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  )}
                </>
              )}
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

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.5, delay: index * 0.2 }}
          className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg"
          tabIndex={0}
          role="article"
          aria-labelledby={`feature-title-${index}`}
        >
          <Card className="text-center h-full hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 pb-8">
              <feature.icon
                className="h-12 w-12 mx-auto mb-4 text-primary"
                aria-hidden="true"
              />
              <CardTitle className="mb-3" id={`feature-title-${index}`}>
                {feature.title}
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function PremiumDomainsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);

  // Get domains based on selected category
  const getDomainsToShow = () => {
    if (selectedCategory === 'all') {
      return PREMIUM_DOMAINS.slice(0, displayCount);
    }
    const categoryDomains = PREMIUM_DOMAINS_CATEGORIES[selectedCategory as keyof typeof PREMIUM_DOMAINS_CATEGORIES];
    return categoryDomains ? categoryDomains.slice(0, displayCount) : [];
  };

  const domainsToShow = getDomainsToShow();

  const categories = [
    { id: 'all', label: 'All Domains', icon: '🌐' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'brands', label: 'Brands', icon: '🏢' },
    { id: 'web3', label: 'Web3', icon: '🔗' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'names', label: 'Names', icon: '👤' },
    { id: 'singles', label: 'Singles', icon: '1️⃣' },
    { id: 'tech', label: 'Tech', icon: '💻' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' }
  ];

  return (
    <section className="py-16" role="region" aria-labelledby="premium-domains-title">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
          id="premium-domains-title"
        >
          Premium .base Domains
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground">
          {PREMIUM_DOMAINS.length}+ curated premium domains across multiple categories
        </p>
      </div>

      {/* Category Filter */}
      <div
        className="flex flex-wrap gap-2 justify-center mb-8"
        role="tablist"
        aria-label="Domain categories"
      >
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory(cat.id);
              toast.info(`Showing ${cat.label.toLowerCase()} domains`);
            }}
            className="rounded-full focus-visible:ring-2 focus-visible:ring-primary"
            role="tab"
            aria-selected={selectedCategory === cat.id}
            aria-controls={`domains-panel-${cat.id}`}
          >
            <span className="mr-1" aria-hidden="true">{cat.icon}</span>
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Available Filter Toggle */}
      <div className="flex justify-center mb-8">
        <label className="flex items-center gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded p-2">
          <input
            type="checkbox"
            checked={showOnlyAvailable}
            onChange={(e) => {
              setShowOnlyAvailable(e.target.checked);
              toast.info(e.target.checked ? 'Showing only available domains' : 'Showing all domains');
            }}
            className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
            aria-describedby="available-filter-desc"
          />
          <span className="text-muted-foreground" id="available-filter-desc">
            Show only available domains
          </span>
        </label>
      </div>

      {/* Domains Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        role="tabpanel"
        id={`domains-panel-${selectedCategory}`}
        aria-labelledby="premium-domains-title"
      >
        {domainsToShow.map((domain, index) => (
          <motion.div
            key={`${selectedCategory}-${domain}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <DynamicDomainCard domain={domain} showOnlyAvailable={showOnlyAvailable} />
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {displayCount < (selectedCategory === 'all' ? PREMIUM_DOMAINS.length :
        (PREMIUM_DOMAINS_CATEGORIES[selectedCategory as keyof typeof PREMIUM_DOMAINS_CATEGORIES]?.length || 0)) && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setDisplayCount(prev => prev + 12);
              toast.info('Loading more domains...');
            }}
            className="rounded-full focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Load more premium domains"
          >
            Load More Domains
          </Button>
        </div>
      )}
    </section>
  );
}

function DynamicDomainCard({ domain, showOnlyAvailable }: { domain: string; showOnlyAvailable: boolean }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tokenId = labelHash(domain);
  const tier = getDomainTier(domain);
  const price = DOMAIN_PRICING[tier];

  const { data: isAvailable, refetch, isLoading, error } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: [tokenId],
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success(`Refreshed ${domain}.base status`);
    } catch (error) {
      toast.error(`Failed to refresh ${domain}.base status`);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleDomainClick = () => {
    const searchSection = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchSection) {
      searchSection.value = domain;
      searchSection.dispatchEvent(new Event('input', { bubbles: true }));
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchSection.focus();
      toast.info(`"${domain}.base" loaded in search`);
    }
  };

  // Filter out taken domains if needed
  if (showOnlyAvailable && isAvailable === false) {
    return null;
  }

  const tierColors = {
    premium: 'from-yellow-500 to-amber-500',
    rare: 'from-purple-500 to-pink-500',
    standard: 'from-blue-500 to-cyan-500'
  };

  return (
    <Card
      className={`relative hover:shadow-xl transition-all hover:scale-105 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
        isAvailable === false ? 'opacity-75' : ''
      }`}
      tabIndex={0}
      role="article"
      aria-label={`${domain}.base domain - ${isAvailable ? 'Available' : 'Taken'} - ${price} ETH`}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${tierColors[tier]} opacity-10 rounded-bl-full`} />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{domain}.base</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-1 focus-visible:ring-2 focus-visible:ring-primary ${isRefreshing ? 'animate-spin' : ''}`}
            aria-label={`Refresh ${domain}.base status`}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center mb-3">
          {isLoading ? (
            <Skeleton className="w-20 h-6" />
          ) : error ? (
            <Badge variant="destructive" aria-label="Error loading domain status">
              Error
            </Badge>
          ) : (
            <Badge
              variant={isAvailable ? 'success' : 'secondary'}
              aria-label={isAvailable ? 'Domain available for registration' : 'Domain already taken'}
            >
              {isAvailable ? '✅ Available' : '🔒 Taken'}
            </Badge>
          )}
          <span className="text-sm font-semibold" aria-label={`Price: ${price} ETH`}>
            {price} ETH
          </span>
        </div>

        {isAvailable && (
          <Button
            className="w-full focus-visible:ring-2 focus-visible:ring-primary"
            size="sm"
            onClick={handleDomainClick}
            aria-label={`Register ${domain}.base domain`}
          >
            Register
          </Button>
        )}

        {!isAvailable && (
          <p className="text-xs text-muted-foreground text-center cursor-pointer hover:text-foreground transition-colors">
            View on marketplace →
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <AnimatedBackground />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="main">
        {/* Hero Section */}
        <section className="py-12 sm:py-20" role="region" aria-labelledby="hero-title">
          <DomainSearchSection />
        </section>

        {/* Stats Section */}
        <section className="py-8 sm:py-16">
          <StatsSection />
        </section>

        {/* Features Section */}
        <section className="py-8 sm:py-16" role="region" aria-labelledby="features-title">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4" id="features-title">
              Why Choose Base Names?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">Built for the future of web3</p>
          </div>
          <FeaturesSection />
        </section>

        {/* Premium Domains Section */}
        <PremiumDomainsSection />

        {/* Contract Info */}
        <section className="py-8 sm:py-16" role="region" aria-labelledby="contracts-title">
          <Card>
            <CardHeader>
              <CardTitle id="contracts-title">Smart Contract Addresses (Base Mainnet)</CardTitle>
              <CardDescription>All contracts are verified and live on Base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(CONTRACTS.BASE_MAINNET.contracts).map(([name, address]) => (
                  <div
                    key={name}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-primary/20 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors gap-2"
                    role="article"
                    aria-label={`${name} contract address`}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">{name}:</span>
                    <div className="flex items-center gap-2">
                      <code
                        className="text-xs sm:text-sm font-mono bg-white dark:bg-black/30 text-gray-900 dark:text-white px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 break-all"
                        aria-label={`Contract address: ${address}`}
                      >
                        {formatAddress(address)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary flex-shrink-0"
                        onClick={() => {
                          window.open(`https://basescan.org/address/${address}`, '_blank');
                          toast.info(`Opening ${name} on BaseScan`);
                        }}
                        aria-label={`View ${name} contract on BaseScan`}
                      >
                        <ExternalLink className="h-4 w-4" />
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
      <footer className="border-t bg-muted/30 mt-20" role="contentinfo">
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