'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gavel, Clock, TrendingUp, Trophy, AlertCircle, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { formatEther, parseEther, Address } from 'viem';
import { CONTRACTS } from '@/lib/contracts';
import Link from 'next/link';

// Import marketplace ABI (placeholder - need actual ABI)
const MARKETPLACE_ABI = [
  {
    name: 'getAuction',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'seller', type: 'address' },
      { name: 'startPrice', type: 'uint256' },
      { name: 'currentBid', type: 'uint256' },
      { name: 'highestBidder', type: 'address' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'active', type: 'bool' },
      { name: 'settled', type: 'bool' }
    ]
  },
  {
    name: 'placeBid',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'settleAuction',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'createAuction',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'startPrice', type: 'uint256' },
      { name: 'duration', type: 'uint256' }
    ],
    outputs: []
  }
] as const;

interface AuctionData {
  tokenId: bigint;
  domainName: string;
  seller: Address;
  startPrice: bigint;
  currentBid: bigint;
  highestBidder: Address;
  startTime: bigint;
  endTime: bigint;
  active: boolean;
  settled: boolean;
  timeRemaining: string;
  isEnding: boolean;
}

export default function AuctionsPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<AuctionData | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'ending' | 'my-bids'>('all');

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate time remaining
  const getTimeRemaining = (endTime: bigint): string => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (endTime <= now) return 'Ended';

    const remaining = Number(endTime - now);
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remaining % (60 * 60)) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Check if auction is ending soon (< 1 hour remaining)
  const isAuctionEnding = (endTime: bigint): boolean => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const remaining = Number(endTime - now);
    return remaining > 0 && remaining < 3600; // 1 hour
  };

  // Load active auctions (placeholder - would query blockchain events)
  useEffect(() => {
    async function loadAuctions() {
      setLoading(true);
      try {
        // In production, this would:
        // 1. Query AuctionCreated events from marketplace contract
        // 2. Filter for active auctions
        // 3. Fetch current bid data for each

        // Placeholder: Empty for now
        setAuctions([]);
      } catch (error) {
        console.error('Error loading auctions:', error);
        toast.error('Failed to load auctions');
      } finally {
        setLoading(false);
      }
    }

    loadAuctions();

    // Refresh every 30 seconds
    const interval = setInterval(loadAuctions, 30000);
    return () => clearInterval(interval);
  }, [publicClient]);

  // Place bid on auction
  const handlePlaceBid = async (auction: AuctionData) => {
    if (!address || !bidAmount) {
      toast.error('Please enter a bid amount');
      return;
    }

    try {
      const bidValue = parseEther(bidAmount);

      // Verify bid is higher than current bid
      if (bidValue <= auction.currentBid) {
        toast.error('Bid must be higher than current bid');
        return;
      }

      // Note: Marketplace contract address would need to be deployed
      const marketplaceAddress = '0x...' as Address; // Placeholder

      writeContract({
        address: marketplaceAddress,
        abi: MARKETPLACE_ABI,
        functionName: 'placeBid',
        args: [auction.tokenId],
        value: bidValue,
      });

      toast.success('Placing bid...');
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid');
    }
  };

  // Settle auction after it ends
  const handleSettleAuction = async (auction: AuctionData) => {
    try {
      const marketplaceAddress = '0x...' as Address; // Placeholder

      writeContract({
        address: marketplaceAddress,
        abi: MARKETPLACE_ABI,
        functionName: 'settleAuction',
        args: [auction.tokenId],
      });

      toast.success('Settling auction...');
    } catch (error) {
      console.error('Error settling auction:', error);
      toast.error('Failed to settle auction');
    }
  };

  // Filter auctions based on selected filter
  const filteredAuctions = auctions.filter(auction => {
    switch (filter) {
      case 'active':
        return auction.active && !isAuctionEnding(auction.endTime);
      case 'ending':
        return auction.active && isAuctionEnding(auction.endTime);
      case 'my-bids':
        return auction.highestBidder.toLowerCase() === address?.toLowerCase();
      default:
        return auction.active;
    }
  });

  // Transaction confirmed
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Transaction confirmed!');
      setBidAmount('');
      setSelectedAuction(null);
      // Reload auctions
      setTimeout(() => window.location.reload(), 2000);
    }
  }, [isConfirmed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Domain Auctions</h1>
            <p className="text-muted-foreground">Bid on premium .base domains</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Auctions</CardDescription>
                <CardTitle className="text-3xl">{auctions.filter(a => a.active).length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Ending Soon</CardDescription>
                <CardTitle className="text-3xl text-orange-600">
                  {auctions.filter(a => isAuctionEnding(a.endTime)).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>My Active Bids</CardDescription>
                <CardTitle className="text-3xl text-primary">
                  {auctions.filter(a => a.highestBidder.toLowerCase() === address?.toLowerCase()).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Volume</CardDescription>
                <CardTitle className="text-3xl">
                  {formatEther(auctions.reduce((sum, a) => sum + a.currentBid, BigInt(0)))} ETH
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Auctions
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'ending' ? 'default' : 'outline'}
              onClick={() => setFilter('ending')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Ending Soon
            </Button>
            <Button
              variant={filter === 'my-bids' ? 'default' : 'outline'}
              onClick={() => setFilter('my-bids')}
              disabled={!isConnected}
            >
              <Trophy className="w-4 h-4 mr-2" />
              My Bids
            </Button>
          </div>

          {/* Auction Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAuctions.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Gavel className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Auctions Found</h3>
                <p className="text-muted-foreground mb-6">
                  {filter === 'my-bids'
                    ? "You haven't placed any bids yet"
                    : 'No active auctions at the moment'}
                </p>
                <Link href="/marketplace">
                  <Button>Browse Marketplace</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.map((auction) => (
                <Card
                  key={auction.tokenId.toString()}
                  className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/40"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{auction.domainName}.base</CardTitle>
                      {isAuctionEnding(auction.endTime) && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          Ending Soon
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current Bid */}
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                        <div className="text-2xl font-bold text-primary">
                          {auction.currentBid > 0
                            ? `${formatEther(auction.currentBid)} ETH`
                            : `${formatEther(auction.startPrice)} ETH (Starting)`
                          }
                        </div>
                      </div>

                      {/* Time Remaining */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Time Left:</span>
                        <span className={`font-semibold ${isAuctionEnding(auction.endTime) ? 'text-orange-600' : ''}`}>
                          {getTimeRemaining(auction.endTime)}
                        </span>
                      </div>

                      {/* Highest Bidder */}
                      {auction.currentBid > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Leading: {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                          {auction.highestBidder.toLowerCase() === address?.toLowerCase() && (
                            <Badge variant="default" className="ml-2 text-xs">You</Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedAuction(auction)}
                          disabled={!isConnected || getTimeRemaining(auction.endTime) === 'Ended'}
                        >
                          <Gavel className="w-3 h-3 mr-1" />
                          Place Bid
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={`https://basescan.org/token/${CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar}/${auction.tokenId.toString()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>

                      {/* Settle button if auction ended */}
                      {getTimeRemaining(auction.endTime) === 'Ended' && !auction.settled && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={() => handleSettleAuction(auction)}
                          disabled={isWritePending || isConfirming}
                        >
                          Settle Auction
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bid Modal */}
          {selectedAuction && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Place Bid on {selectedAuction.domainName}.base</CardTitle>
                  <CardDescription>
                    Current bid: {formatEther(selectedAuction.currentBid > 0 ? selectedAuction.currentBid : selectedAuction.startPrice)} ETH
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Your Bid (ETH)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum bid: {formatEther(selectedAuction.currentBid > 0
                          ? selectedAuction.currentBid * BigInt(105) / BigInt(100)
                          : selectedAuction.startPrice
                        )} ETH
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePlaceBid(selectedAuction)}
                        disabled={!bidAmount || isWritePending || isConfirming}
                        className="flex-1"
                      >
                        {isWritePending || isConfirming ? 'Processing...' : 'Place Bid'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAuction(null);
                          setBidAmount('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Info Panel */}
          <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                How Auctions Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Auctions run for a set duration with automatic extensions if bids are placed near the end</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Each bid must be at least 5% higher than the previous bid</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>When you're outbid, your funds are automatically returned to your wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>After an auction ends, anyone can settle it to transfer the domain to the winner</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>A 2.5% marketplace fee is deducted from the final sale price</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
