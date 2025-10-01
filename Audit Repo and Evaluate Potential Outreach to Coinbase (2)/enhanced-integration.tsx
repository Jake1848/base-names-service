'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useSwitchChain } from 'wagmi';
import { Search, Globe, Shield, Zap, Users, TrendingUp, ExternalLink, Copy, Check, AlertCircle, RefreshCw, Sparkles, Star, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CONTRACTS, ABIS, PREMIUM_DOMAINS, PREMIUM_DOMAINS_CATEGORIES, getDomainTier, DOMAIN_PRICING, labelHash } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EnhancedAnimatedBackground } from '@/components/enhanced-animated-background';
import { EnhancedDomainSearch } from '@/components/enhanced-search';
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

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
      />
    </div>
  );
}

// Enhanced Premium Domain Card
function EnhancedPremiumDomainCard({ domain, index }: { domain: string; index: number }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
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
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-xl"
      tabIndex={0}
      role="article"
      aria-label={`Premium domain ${domain}.base`}
    >
      <Card className="group relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-background via-background to-primary/5 transition-all duration-500">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100"
          animate={{
            background: isHovered 
              ? "linear-gradient(135deg, rgba(0, 82, 255, 0.1), rgba(0, 212, 255, 0.05), transparent)"
              : "linear-gradient(135deg, transparent, transparent, transparent)"
          }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 30}%`,
                top: `${50 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <CardTitle
                className="text-xl font-bold bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent"
                id={`domain-title-${domain}`}
              >
                <motion.span
                  animate={{
                    backgroundPosition: isHovered ? "200% center" : "0% center",
                  }}
                  transition={{ duration: 1 }}
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                >
                  {domain}.base
                </motion.span>
              </CardTitle>
            </motion.div>
            
            {isLoading ? (
              <Skeleton className="w-20 h-6" />
            ) : availabilityError ? (
              <Badge variant="destructive" className="font-semibold">
                Error
              </Badge>
            ) : (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={isAvailable ? "default" : "secondary"}
                  className={cn(
                    "font-semibold transition-all duration-300",
                    isAvailable 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25" 
                      : "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
                  )}
                  aria-label={isAvailable ? 'Domain available for registration' : 'Domain already registered'}
                >
                  {isAvailable ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Available
                    </motion.span>
                  ) : (
                    <span className="flex items-center gap-1">
                      🔒 Registered
                    </span>
                  )}
                </Badge>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          {availabilityError ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center"
            >
              <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">Failed to load domain status</p>
            </motion.div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : !isAvailable && owner && expires ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Owner:</span>
                <div className="flex items-center gap-2">
                  <code
                    className="text-xs bg-muted px-2 py-1 rounded"
                    aria-label={`Domain owner address: ${owner}`}
                  >
                    {formatAddress(owner as string)}
                  </code>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(owner as string)}
                      className="h-6 w-6 p-0 focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Copy owner address to clipboard"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={copied ? 'check' : 'copy'}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ duration: 0.2 }}
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Expires:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm" aria-label={`Expires on ${formatDate(Number(expires))}`}>
                    {formatDate(Number(expires))}
                  </span>
                  {isExpiringSoon && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Badge variant="destructive" className="text-xs">
                        {daysLeft} days left
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full focus-visible:ring-2 focus-visible:ring-primary group"
                    onClick={() => window.open(`https://basescan.org/token/${CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar}?a=${tokenId}`, '_blank')}
                    aria-label={`View ${domain}.base on BaseScan blockchain explorer`}
                  >
                    <ExternalLink className="h-3 w-3 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                    View on BaseScan
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : isAvailable ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0)",
                    "0 0 0 10px rgba(34, 197, 94, 0.1)",
                    "0 0 0 20px rgba(34, 197, 94, 0)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge variant="default" className="mb-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  Ready to Register
                </Badge>
              </motion.div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Premium domain • High value
                </p>
                <motion.p 
                  className="text-lg font-bold text-primary"
                  whileHover={{ scale: 1.05 }}
                >
                  0.05 ETH<span className="text-sm text-muted-foreground ml-1">/year</span>
                </motion.p>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="default"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 font-semibold text-white shadow-lg hover:shadow-xl transition-all focus-visible:ring-2 focus-visible:ring-primary group"
                  onClick={handleRegisterClick}
                  aria-label={`Register ${domain}.base domain now`}
                >
                  <motion.span
                    className="flex items-center gap-2"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    🚀 Register Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Hero Section
function EnhancedHeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  return (
    <motion.div
      style={{ y, opacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{
              background: "linear-gradient(90deg, #0052ff, #00d4ff, #0052ff, #00d4ff, #0052ff)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Own Your Digital Identity
          </motion.h1>
          
          <motion.p 
            className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Register and manage .base domains on Base Layer 2. Fast, cheap, and decentralized.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all group"
                onClick={() => {
                  document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="flex items-center gap-2">
                  Start Searching
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary/50 hover:border-primary text-primary hover:bg-primary/10 font-semibold px-8 py-4 text-lg transition-all"
                onClick={() => {
                  document.getElementById('premium-domains')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Premium Domains
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-muted-foreground"
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Main Enhanced Page Component
export default function EnhancedIntegratedHomePage() {
  return (
    <div className="relative">
      <EnhancedAnimatedBackground />
      
      {/* Hero Section */}
      <EnhancedHeroSection />
      
      {/* Search Section */}
      <section id="search-section" className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Search & Register Domains</h2>
            <p className="text-muted-foreground mb-8">Find your perfect .base domain name</p>
          </motion.div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <EnhancedDomainSearch />
          </Suspense>
        </div>
      </section>
      
      {/* Premium Domains Section */}
      <section id="premium-domains" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Premium Domains</h2>
            <p className="text-muted-foreground">High-value domains for your brand</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMIUM_DOMAINS.slice(0, 6).map((domain, index) => (
              <Suspense key={domain} fallback={<LoadingSpinner />}>
                <EnhancedPremiumDomainCard domain={domain} index={index} />
              </Suspense>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose Base Names?</h2>
            <p className="text-muted-foreground">The premier decentralized naming service for Base L2</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Lightning Fast", description: "Instant transactions on Base L2" },
              { icon: Shield, title: "Secure", description: "Decentralized and trustless" },
              { icon: Globe, title: "Universal", description: "Works across all web3 apps" },
              { icon: Users, title: "Community", description: "Join the Base ecosystem" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-background to-muted/20 border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4"
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
