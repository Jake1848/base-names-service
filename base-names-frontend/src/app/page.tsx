'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodePacked, encodeAbiParameters } from 'viem';
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

    setIsSearching(true);
    setHasSearched(true);

    try {
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

    if (!isSupportedChain(chain?.id || 0)) {
      toast.error('Please switch to Base Mainnet or Base Sepolia testnet');
      return;
    }

    try {
      const totalPrice = price[0] + price[1];
      const networkType = currentChainId === 84532 ? ' (FREE testnet)' : '';

      // Step 1: Make commitment
      if (!commitmentSecret) {
        // Generate secret for new registration
        const secret = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` as `0x${string}`;

        console.log('═══════════════════════════════════════════════════════');
        console.log('🔐 STEP 1: MAKING COMMITMENT');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Domain:', searchTerm);
        console.log('Owner:', address);
        console.log('Duration:', 365 * 24 * 60 * 60, 'seconds (1 year)');
        console.log('Secret:', secret);
        console.log('Resolver:', '0x0000000000000000000000000000000000000000 (ZERO ADDRESS - bypasses ENS approval issue)');
        console.log('Controller:', contracts.BaseController);
        console.log('Registrar:', contracts.BaseRegistrar);
        console.log('ENS Registry:', contracts.ENSRegistry);
        console.log('Network:', networkName, `(Chain ID: ${currentChainId})`);
        console.log('');
        console.log('💡 Strategy: Register without resolver to avoid ens.setRecord() call');
        console.log('   that requires ENS Registry approval.');

        toast.info(`Step 1/2: Making commitment...`);
        setRegistrationStep('committing');

        // Save the secret BEFORE making the transaction
        setCommitmentSecret(secret);
        console.log('');
        console.log('✅ Secret saved to state:', secret);
        console.log('✅ State updated, registration step: committing');

        // Compute commitment hash using abi.encode to match the contract
        // The contract does: keccak256(abi.encode(Registration struct))
        // Registration struct: (label, owner, duration, secret, resolver, data, reverseRecord, referrer)
        const encodedData = encodeAbiParameters(
            [
              { name: 'label', type: 'string' },
              { name: 'owner', type: 'address' },
              { name: 'duration', type: 'uint256' },
              { name: 'secret', type: 'bytes32' },
              { name: 'resolver', type: 'address' },
              { name: 'data', type: 'bytes[]' },
              { name: 'reverseRecord', type: 'uint256' }, // Contract uses uint256 (0 or 1)
              { name: 'referrer', type: 'bytes32' }
            ],
            [
              searchTerm,
              address,
              BigInt(365 * 24 * 60 * 60),
              secret,
              `0x${'0'.repeat(40)}` as `0x${string}`, // NO RESOLVER
              [],
              BigInt(0), // false = 0
              `0x${'0'.repeat(64)}` as `0x${string}` // zero referrer
            ]
          );

        const commitment = keccak256(encodedData);

        console.log('');
        console.log('📝 Commitment Calculation:');
        console.log('  - Method: keccak256(abi.encode(...))');
        console.log('  - Parameters encoded:');
        console.log('    [0] label:', searchTerm);
        console.log('    [1] owner:', address);
        console.log('    [2] duration:', 365 * 24 * 60 * 60);
        console.log('    [3] secret:', secret);
        console.log('    [4] resolver:', '0x0000000000000000000000000000000000000000');
        console.log('    [5] data:', '[]');
        console.log('    [6] reverseRecord:', 0);
        console.log('    [7] referrer:', '0x0000000000000000000000000000000000000000000000000000000000000000');
        console.log('  - Encoded data length:', encodedData.length, 'bytes');
        console.log('  - Encoded data:', encodedData);
        console.log('  - Commitment hash:', commitment);
        console.log('');
        console.log('📤 Sending commit() transaction...');
        console.log('  - To contract:', contracts.BaseController);
        console.log('  - Function: commit(bytes32)');
        console.log('  - Args: [', commitment, ']');

        writeContract({
          address: contracts.BaseController as `0x${string}`,
          abi: ABIS.BaseController,
          functionName: 'commit',
          args: [commitment],
        });

        console.log('');
        console.log('✅ commit() transaction sent to wallet for signing');
        console.log('⏳ Waiting for user to approve transaction in wallet...');
        console.log('═══════════════════════════════════════════════════════');

        toast.success('Commitment made! Wait 60 seconds then click Register again.');
        setRegistrationStep('waiting');
        setWaitTimeRemaining(60);

        // Start countdown
        const interval = setInterval(() => {
          setWaitTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setRegistrationStep('idle');
              toast.success('Ready! Click Register to complete.');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      // Step 2: Complete registration
      else if (commitmentSecret && waitTimeRemaining === 0) {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🚀 STEP 2: REGISTERING DOMAIN');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Domain:', searchTerm);
        console.log('Owner:', address);
        console.log('Duration:', 365 * 24 * 60 * 60, 'seconds (1 year)');
        console.log('Secret (from state):', commitmentSecret);
        console.log('Resolver:', '0x0000000000000000000000000000000000000000 (ZERO ADDRESS)');
        console.log('Controller:', contracts.BaseController);
        console.log('Registrar:', contracts.BaseRegistrar);
        console.log('ENS Registry:', contracts.ENSRegistry);
        console.log('Network:', networkName, `(Chain ID: ${currentChainId})`);
        console.log('');
        console.log('💡 Using zero address resolver to bypass ens.setRecord()');
        console.log('   This avoids the ENS Registry approval requirement.');
        console.log('');
        console.log('💰 Payment:');
        console.log('  - Base price:', price[0].toString(), 'wei');
        console.log('  - Base price (ETH):', Number(price[0]) / 1e18, 'ETH');
        console.log('  - Premium:', price[1].toString(), 'wei');
        console.log('  - Premium (ETH):', Number(price[1]) / 1e18, 'ETH');
        console.log('  - Total:', totalPrice.toString(), 'wei');
        console.log('  - Total (ETH):', Number(totalPrice) / 1e18, 'ETH');
        console.log('');

        // Recompute commitment to verify it matches
        const encodedData = encodeAbiParameters(
          [
            { name: 'label', type: 'string' },
            { name: 'owner', type: 'address' },
            { name: 'duration', type: 'uint256' },
            { name: 'secret', type: 'bytes32' },
            { name: 'resolver', type: 'address' },
            { name: 'data', type: 'bytes[]' },
            { name: 'reverseRecord', type: 'uint256' },
            { name: 'referrer', type: 'bytes32' }
          ],
          [
            searchTerm,
            address,
            BigInt(365 * 24 * 60 * 60),
            commitmentSecret,
            `0x${'0'.repeat(40)}` as `0x${string}`, // NO RESOLVER - avoids ens.setRecord() call
            [],
            BigInt(0),
            `0x${'0'.repeat(64)}` as `0x${string}`
          ]
        );
        const verifyCommitment = keccak256(encodedData);
        console.log('🔍 Commitment Verification:');
        console.log('  - Recomputed hash:', verifyCommitment);
        console.log('  - Encoded data:', encodedData);
        console.log('  - Parameters used:');
        console.log('    [0] label:', searchTerm);
        console.log('    [1] owner:', address);
        console.log('    [2] duration:', 365 * 24 * 60 * 60);
        console.log('    [3] secret:', commitmentSecret);
        console.log('    [4] resolver:', '0x0000000000000000000000000000000000000000');
        console.log('    [5] data:', '[]');
        console.log('    [6] reverseRecord:', 0);
        console.log('    [7] referrer:', '0x0000000000000000000000000000000000000000000000000000000000000000');
        console.log('  ✅ This hash MUST match the one from Step 1!');
        console.log('');

        toast.info(`Step 2/2: Completing registration on ${networkName}${networkType}...`);
        setRegistrationStep('registering');

        console.log('📝 register() Function Call Details:');
        console.log('  - Contract address:', contracts.BaseController);
        console.log('  - Function: register(string,address,uint256,bytes32,address,bytes[],bool,uint16)');
        console.log('  - Method ID: 0x74694a2b');
        console.log('');
        console.log('  Parameters:');
        console.log('  [0] name (string):', searchTerm);
        console.log('  [1] owner (address):', address);
        console.log('  [2] duration (uint256):', BigInt(365 * 24 * 60 * 60).toString());
        console.log('  [3] secret (bytes32):', commitmentSecret);
        console.log('  [4] resolver (address):', '0x0000000000000000000000000000000000000000');
        console.log('  [5] data (bytes[]):', '[]');
        console.log('  [6] reverseRecord (bool):', false);
        console.log('  [7] ownerControlledFuses (uint16):', 0);
        console.log('');
        console.log('  Payment (msg.value):', totalPrice.toString(), 'wei (', Number(totalPrice) / 1e18, 'ETH)');
        console.log('');
        console.log('📤 Sending register() transaction to wallet...');

        try {
          writeContract({
            address: contracts.BaseController as `0x${string}`,
            abi: ABIS.BaseController,
            functionName: 'register',
            args: [
              searchTerm,
              address,
              BigInt(365 * 24 * 60 * 60),
              commitmentSecret, // Use the saved secret
              `0x${'0'.repeat(40)}` as `0x${string}`, // NO RESOLVER - avoids ens.setRecord() call that's failing
              [],
              false, // reverseRecord: false
              0 // ownerControlledFuses
            ],
            value: totalPrice
          });
          console.log('');
          console.log('✅ register() transaction sent to wallet for signing');
          console.log('⏳ Waiting for user to approve transaction in wallet...');
          console.log('');
          console.log('🔬 What happens on-chain:');
          console.log('  1. User signs transaction in wallet');
          console.log('  2. Transaction broadcasts to Base Sepolia network');
          console.log('  3. Sequencer includes transaction in block');
          console.log('  4. Controller verifies:');
          console.log('     - Commitment exists');
          console.log('     - Commitment age >= 60 seconds');
          console.log('     - Commitment age <= 86400 seconds');
          console.log('     - Domain is available');
          console.log('     - Payment >= price');
          console.log('  5. Controller calls BaseRegistrar.register()');
          console.log('  6. BaseRegistrar mints NFT to owner');
          console.log('  7. BaseRegistrar calls ens.setSubnodeOwner()');
          console.log('  8. Since resolver = 0x0, ens.setRecord() is SKIPPED');
          console.log('  9. Transaction completes ✅');
        } catch (err) {
          console.error('');
          console.error('❌ Error calling writeContract:');
          console.error('  Error type:', err?.constructor?.name);
          console.error('  Error message:', err?.message);
          console.error('  Full error:', err);
          throw err;
        }
        console.log('');
        console.log('═══════════════════════════════════════════════════════');

        // Don't reset state here - wait for transaction confirmation
      } else if (waitTimeRemaining > 0) {
        console.log('⏳ Still waiting:', waitTimeRemaining, 'seconds');
        toast.info(`Please wait ${waitTimeRemaining} more seconds before completing registration...`);
      } else {
        console.log('❓ Unexpected state:', {
          hasSecret: !!commitmentSecret,
          waitTime: waitTimeRemaining,
          step: registrationStep
        });
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
      setRegistrationStep('idle');
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
              {/* Network Badge */}
              <div className="flex justify-center mt-3">
                <Badge
                  variant={currentChainId === 84532 ? "secondary" : "default"}
                  className="text-xs px-3 py-1"
                >
                  {currentChainId === 84532 && <Sparkles className="h-3 w-3 mr-1" />}
                  {networkName}
                  {currentChainId === 84532 && " - FREE Testing"}
                </Badge>
              </div>
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
                    <ConnectButton />
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

// Enhanced Premium Domain Card
function EnhancedPremiumDomainCard({ domain, index }: { domain: string; index: number }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const { chain } = useAccount();
  const currentChainId = chain?.id || 8453;
  const contracts = getContractsForChain(currentChainId);
  const tokenId = labelHash(domain);

  const { data: isAvailable, isLoading: isLoadingAvailability, error: availabilityError } = useReadContract({
    address: contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: [tokenId],
    query: { enabled: !!contracts.BaseRegistrar }
  });

  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    address: contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'ownerOf',
    args: [tokenId],
    query: { enabled: !isAvailable && !isLoadingAvailability && !!contracts.BaseRegistrar }
  });

  const { data: expires, isLoading: isLoadingExpires } = useReadContract({
    address: contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'nameExpires',
    args: [tokenId],
    query: { enabled: !isAvailable && !isLoadingAvailability && !!contracts.BaseRegistrar }
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
                    onClick={() => {
                      const explorerUrl = currentChainId === 84532
                        ? `https://sepolia.basescan.org/token/${contracts.BaseRegistrar}?a=${tokenId}`
                        : `https://basescan.org/token/${contracts.BaseRegistrar}?a=${tokenId}`;
                      window.open(explorerUrl, '_blank');
                    }}
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
export default function EnhancedHomePage() {
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
          
          <EnhancedDomainSearch />
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
              <EnhancedPremiumDomainCard key={domain} domain={domain} index={index} />
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
