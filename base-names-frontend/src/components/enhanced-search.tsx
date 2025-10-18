'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Search, Loader2, CheckCircle, XCircle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CONTRACTS, ABIS, labelHash } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

export function EnhancedDomainSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isConnected, address, chain } = useAccount();
  const { writeContract, isPending: isRegistering } = useWriteContract();

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

  const { data: price, isLoading: isLoadingPrice } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`,
    abi: ABIS.BaseController,
    functionName: 'rentPrice',
    args: [searchTerm, BigInt(365 * 24 * 60 * 60)], // 1 year
    query: { enabled: !!searchTerm && searchTerm.length > 0 && isAvailable === true && !validationError }
  });

  // Real-time validation with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        const error = validateDomainName(searchTerm);
        setValidationError(error);
        if (!error && searchTerm.length >= MIN_DOMAIN_LENGTH) {
          setHasSearched(true);
        }
      } else {
        setValidationError(null);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSearchTerm(value);
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
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Searched for "${searchTerm}.base"`);
    } catch {
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
      const secret = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` as `0x${string}`;
      const totalPrice = price[0] + price[1];

      toast.info('Initiating domain registration...');

      writeContract({
        address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`,
        abi: ABIS.BaseController,
        functionName: 'register',
        args: [
          searchTerm,
          address,
          BigInt(365 * 24 * 60 * 60),
          secret,
          CONTRACTS.BASE_MAINNET.contracts.PublicResolver as `0x${string}`,
          [],
          false,
          `0x${'0'.repeat(64)}` as `0x${string}`, // referrer: zero bytes32
          BigInt(0) // fuses: 0
        ],
        value: totalPrice
      });
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusIcon = () => {
    if (isCheckingAvailability || isSearching) {
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }
    if (availabilityError) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (hasSearched && !validationError) {
      if (isAvailable) {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      } else {
        return <XCircle className="h-5 w-5 text-orange-500" />;
      }
    }
    return null;
  };

  const getStatusMessage = () => {
    if (validationError) {
      return { message: validationError.message, type: 'error' };
    }
    if (availabilityError) {
      return { message: 'Failed to check availability', type: 'error' };
    }
    if (hasSearched && !isCheckingAvailability) {
      if (isAvailable) {
        return { message: 'Domain is available for registration!', type: 'success' };
      } else {
        return { message: 'Domain is already registered', type: 'warning' };
      }
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl">
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/5 to-transparent opacity-0"
            animate={{ opacity: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          <CardHeader className="text-center relative z-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Search & Register Domains
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Find your perfect .base domain name
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            {/* Search Input */}
            <div className="relative">
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter domain name"
                  className={cn(
                    "w-full pl-12 pr-20 py-4 text-lg rounded-xl border-2 transition-all duration-300 bg-background/50 backdrop-blur-sm",
                    isFocused 
                      ? "border-primary shadow-lg shadow-primary/20" 
                      : "border-border hover:border-primary/50",
                    validationError && "border-destructive"
                  )}
                  aria-label="Domain name search"
                  aria-describedby="search-status"
                />
                
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={getStatusIcon()?.key || 'empty'}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      {getStatusIcon()}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  .base
                </div>
              </motion.div>
              
              {/* Real-time character count */}
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>
                  {searchTerm.length}/{MAX_DOMAIN_LENGTH} characters
                </span>
                {searchTerm.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "font-medium",
                      searchTerm.length >= MIN_DOMAIN_LENGTH ? "text-green-500" : "text-orange-500"
                    )}
                  >
                    {searchTerm.length >= MIN_DOMAIN_LENGTH ? "Valid length" : "Too short"}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Status Message */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  id="search-status"
                  className={cn(
                    "p-4 rounded-lg border flex items-center gap-3",
                    statusMessage.type === 'success' && "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
                    statusMessage.type === 'error' && "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
                    statusMessage.type === 'warning' && "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200"
                  )}
                >
                  {statusMessage.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
                  {statusMessage.type === 'error' && <XCircle className="h-5 w-5 flex-shrink-0" />}
                  {statusMessage.type === 'warning' && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                  <span className="font-medium">{statusMessage.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price Display */}
            <AnimatePresence>
              {isAvailable && price && !isLoadingPrice && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-6 border border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Registration Price</h3>
                      <p className="text-sm text-muted-foreground">1 year registration</p>
                    </div>
                    <div className="text-right">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-2xl font-bold text-primary"
                      >
                        0.05 ETH
                      </motion.div>
                      <p className="text-sm text-muted-foreground">≈ $125 USD</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSearch}
                  disabled={!searchTerm || !!validationError || isSearching}
                  size="lg"
                  variant="outline"
                  className="w-full font-semibold border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  {isSearching ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4" />
                      Searching...
                    </motion.span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search Domain
                    </span>
                  )}
                </Button>
              </motion.div>

              <AnimatePresence>
                {isAvailable && isConnected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering || !price}
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {isRegistering ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="h-4 w-4" />
                          Registering...
                        </motion.span>
                      ) : (
                        <motion.span
                          className="flex items-center gap-2"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Sparkles className="h-4 w-4" />
                          Register Now
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Connection prompt */}
            <AnimatePresence>
              {isAvailable && !isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center p-4 bg-muted/50 rounded-lg border border-border/50"
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect your wallet to register this domain
                  </p>
                  <div className="flex justify-center">
                    {/* ConnectButton would go here */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
