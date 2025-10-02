'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowRight, CheckCircle, AlertCircle, Loader2, Info, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface SupportedChain {
  chainId: number;
  name: string;
  icon: string;
  bridgeFee: string;
  estimatedTime: string;
  active: boolean;
}

const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    icon: '⟠',
    bridgeFee: '0.001',
    estimatedTime: '10-15 min',
    active: true
  },
  {
    chainId: 10,
    name: 'Optimism',
    icon: '🔴',
    bridgeFee: '0.0005',
    estimatedTime: '5-10 min',
    active: true
  },
  {
    chainId: 42161,
    name: 'Arbitrum One',
    icon: '🔵',
    bridgeFee: '0.0005',
    estimatedTime: '5-10 min',
    active: true
  },
  {
    chainId: 137,
    name: 'Polygon',
    icon: '🟣',
    bridgeFee: '0.0003',
    estimatedTime: '3-5 min',
    active: false
  }
];

export default function BridgePage() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [domainName, setDomainName] = useState('');
  const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null);
  const [bridging, setBridging] = useState(false);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleBridge = async () => {
    if (!domainName || !selectedChain) {
      toast.error('Please enter domain and select target chain');
      return;
    }

    if (!selectedChain.active) {
      toast.error('Selected chain is not yet active');
      return;
    }

    setBridging(true);
    try {
      toast.info(`Initiating bridge to ${selectedChain.name}...`);

      // In production, would call actual CrossChainBridge contract
      // const tokenId = nameToTokenId(domainName);
      // writeContract({
      //   address: BRIDGE_CONTRACT_ADDRESS,
      //   abi: BRIDGE_ABI,
      //   functionName: 'initiateBridge',
      //   args: [tokenId, selectedChain.chainId],
      //   value: parseEther(selectedChain.bridgeFee),
      // });

      // Simulated success
      setTimeout(() => {
        toast.success('Bridge request initiated!');
        setBridging(false);
      }, 2000);
    } catch (error) {
      console.error('Bridge error:', error);
      toast.error('Failed to initiate bridge');
      setBridging(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to bridge domains across chains
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Cross-Chain Bridge</h1>
            <p className="text-muted-foreground">Bridge your .base domains to other L2 chains</p>
          </div>

          {/* Info Banner */}
          <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">How Cross-Chain Bridging Works</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Your domain is locked on Base and minted on the target chain</li>
                    <li>• Bridge fees cover validator costs and cross-chain messaging</li>
                    <li>• Domains can be bridged back to Base at any time</li>
                    <li>• All domain data (records, expiry) is preserved during bridge</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bridge Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <Card>
              <CardHeader>
                <CardTitle>Bridge Your Domain</CardTitle>
                <CardDescription>Select domain and destination chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Domain Name</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="myname"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex items-center px-3 bg-muted rounded-md text-muted-foreground">.base</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Destination Chain</label>
                  <div className="grid grid-cols-1 gap-3">
                    {SUPPORTED_CHAINS.map((chain) => (
                      <button
                        key={chain.chainId}
                        onClick={() => setSelectedChain(chain)}
                        disabled={!chain.active}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedChain?.chainId === chain.chainId
                            ? 'border-primary bg-primary/10'
                            : chain.active
                            ? 'border-border hover:border-primary/50'
                            : 'border-border opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{chain.icon}</span>
                            <div>
                              <p className="font-semibold">{chain.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Fee: {chain.bridgeFee} ETH • {chain.estimatedTime}
                              </p>
                            </div>
                          </div>
                          {!chain.active && <Badge variant="secondary">Coming Soon</Badge>}
                          {chain.active && selectedChain?.chainId === chain.chainId && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleBridge}
                  disabled={!domainName || !selectedChain || bridging || !selectedChain?.active}
                  className="w-full"
                  size="lg"
                >
                  {bridging ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Initiating Bridge...
                    </>
                  ) : (
                    <>
                      Bridge Domain
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right: Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Bridge Summary</CardTitle>
                <CardDescription>Review before bridging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Domain</span>
                    <span className="font-medium">
                      {domainName || '—'}.base
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Source Chain</span>
                    <span className="font-medium">Base</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Destination Chain</span>
                    <span className="font-medium">
                      {selectedChain?.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Bridge Fee</span>
                    <span className="font-medium">
                      {selectedChain?.bridgeFee || '—'} ETH
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Estimated Time</span>
                    <span className="font-medium">
                      {selectedChain?.estimatedTime || '—'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Bridge operations are irreversible. Ensure you select the correct destination chain.
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Your domain will be locked on Base and minted on the destination chain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bridge History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bridge Activity</CardTitle>
              <CardDescription>Your domain bridge history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No bridge history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Bridge your first domain to see activity here
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Supported Chains Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Networks</CardTitle>
              <CardDescription>Base Names is available on multiple L2 chains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUPPORTED_CHAINS.map((chain) => (
                  <div
                    key={chain.chainId}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{chain.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{chain.name}</p>
                        {chain.active ? (
                          <Badge className="bg-green-600 text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Bridge Fee: {chain.bridgeFee} ETH</p>
                      <p>Est. Time: {chain.estimatedTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
