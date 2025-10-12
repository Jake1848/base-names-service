'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodePacked, encodeAbiParameters, createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { Search, Globe, Shield, Zap, Users, TrendingUp, ExternalLink, Copy, Check, AlertCircle, RefreshCw, Sparkles, Star, ArrowRight, ChevronDown, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CONTRACTS, ABIS, PREMIUM_DOMAINS, PREMIUM_DOMAINS_CATEGORIES, getDomainTier, DOMAIN_PRICING, labelHash, getContractsForChain, isSupportedChain, getNetworkName } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

// Enhanced Animated Background Component
function EnhancedAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const createParticles = () => {
      particles.length = 0;
      const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          color: Math.random() > 0.5 ? '#0052ff' : '#00d4ff'
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;
        
        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Draw connections
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(0, 82, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
    };

    let animationId: number;
    const animate = () => {
      drawParticles();
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Animated Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-60"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              rotate: 0,
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              rotate: 360,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className={`w-4 h-4 border border-primary/20 ${
                i % 2 === 0 ? 'rounded-full' : 'rounded-lg rotate-45'
              }`}
              style={{
                background: `linear-gradient(45deg, rgba(0, 82, 255, 0.1), rgba(0, 212, 255, 0.1))`,
              }}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 82, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 82, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/50" />
    </div>
  );
}

// Enhanced Domain Search Component
function EnhancedDomainSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'idle' | 'committing' | 'waiting' | 'registering'>('idle');
  const [commitmentSecret, setCommitmentSecret] = useState<`0x${string}` | null>(null);
  const [waitTimeRemaining, setWaitTimeRemaining] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isConnected, address, chain } = useAccount();
  const { writeContract, isPending: isRegistering, data: txHash, error: txError } = useWriteContract();
  const { switchChain } = useSwitchChain();

  // Log transaction results
  useEffect(() => {
    if (txHash) {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📝 TRANSACTION HASH RECEIVED');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Transaction hash:', txHash);
      console.log('Short hash:', txHash.slice(0, 10) + '...');
      console.log('');
      console.log('✅ User signed the transaction!');
      console.log('✅ Transaction broadcast to Base Sepolia network');
      console.log('⏳ Waiting for transaction to be included in a block...');
      console.log('');
      console.log('View on BaseScan:');
      console.log(`https://sepolia.basescan.org/tx/${txHash}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      toast.info(`Transaction submitted: ${txHash.slice(0, 10)}...`);
    }
  }, [txHash]);

  useEffect(() => {
    if (txError) {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.error('❌ TRANSACTION ERROR (User Rejected or Wallet Error)');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Timestamp:', new Date().toISOString());
      console.error('Error type:', txError?.constructor?.name);
      console.error('Error name:', txError?.name);
      console.error('Error message:', txError?.message);
      console.error('');
      console.error('Common causes:');
      console.error('  - User rejected transaction in wallet');
      console.error('  - Insufficient ETH for gas');
      console.error('  - Network connection issue');
      console.error('  - Wallet locked or disconnected');
      console.error('');
      console.error('Full error object:', txError);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      toast.error(`Transaction failed: ${txError.message}`);
      setRegistrationStep('idle');
    }
  }, [txError]);

  // Wait for transaction receipt
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (receipt) {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📜 TRANSACTION RECEIPT RECEIVED');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Transaction hash:', receipt.transactionHash);
      console.log('Block number:', receipt.blockNumber?.toString());
      console.log('Block hash:', receipt.blockHash);
      console.log('From:', receipt.from);
      console.log('To:', receipt.to);
      console.log('Gas used:', receipt.gasUsed?.toString());
      console.log('Effective gas price:', receipt.effectiveGasPrice?.toString());
      console.log('Status:', receipt.status);
      console.log('');

      if (receipt.status === 'success') {
        console.log('🎉 Transaction SUCCEEDED!');
        console.log('');
        console.log('Receipt details:');
        console.log('  - Contract address:', receipt.contractAddress || 'N/A');
        console.log('  - Cumulative gas used:', receipt.cumulativeGasUsed?.toString());
        console.log('  - Logs count:', receipt.logs?.length || 0);
        if (receipt.logs && receipt.logs.length > 0) {
          console.log('');
          console.log('📋 Event logs:');
          receipt.logs.forEach((log, index) => {
            console.log(`  Log ${index}:`, {
              address: log.address,
              topics: log.topics,
              data: log.data
            });
          });
        }
        console.log('');

        toast.success('Transaction confirmed!');
        if (registrationStep === 'registering') {
          console.log('✅✅✅ DOMAIN SUCCESSFULLY REGISTERED! ✅✅✅');
          console.log(`Domain: ${searchTerm}.base`);
          console.log('Owner:', receipt.from);
          toast.success(`Successfully registered ${searchTerm}.base!`);
          setRegistrationStep('idle');
          setCommitmentSecret(null);
          setWaitTimeRemaining(0);
        } else if (registrationStep === 'committing') {
          console.log('✅ COMMITMENT SAVED ON-CHAIN');
          console.log('Wait 60 seconds before completing registration');
        }
      } else {
        console.log('❌❌❌ TRANSACTION REVERTED! ❌❌❌');
        console.log('');
        console.log('This means the contract rejected the transaction.');
        console.log('Possible reasons:');
        console.log('  - Commitment not found (hash mismatch)');
        console.log('  - Commitment too new (< 60 seconds)');
        console.log('  - Commitment too old (> 24 hours)');
        console.log('  - Domain not available');
        console.log('  - Insufficient payment');
        console.log('  - Rate limit exceeded');
        console.log('');
        console.log('Check the transaction on BaseScan for details:');
        console.log(`https://sepolia.basescan.org/tx/${receipt.transactionHash}`);
        toast.error('Transaction failed - it was reverted by the contract');
        setRegistrationStep('idle');
      }
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    }
  }, [receipt, registrationStep, searchTerm]);

  // Get contracts for current chain
  const currentChainId = chain?.id || 8453; // Default to Base Mainnet
  const contracts = getContractsForChain(currentChainId);
  const networkName = getNetworkName(currentChainId);

  const tokenId = searchTerm && !validationError ? labelHash(searchTerm) : null;

  const { data: isAvailable, error: availabilityError, isLoading: isCheckingAvailability } = useReadContract({
    address: contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId && searchTerm.length > 0 && !validationError && !!contracts.BaseRegistrar
    }
  });

  const { data: price, error: priceError, isLoading: isLoadingPrice } = useReadContract({
    address: contracts.BaseController as `0x${string}`,
    abi: ABIS.BaseController,
    functionName: 'rentPrice',
    args: [searchTerm, BigInt(365 * 24 * 60 * 60)], // 1 year
    query: { enabled: !!searchTerm && searchTerm.length > 0 && isAvailable === true && !validationError && !!contracts.BaseController }
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

    
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)