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
import { EnhancedModeToggle } from '@/components/enhanced-mode-toggle';
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
                  class
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)