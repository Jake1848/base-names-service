
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
