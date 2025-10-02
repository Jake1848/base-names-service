'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, TrendingUp, Coins, Lock, Unlock, Info, ArrowUp, Clock, Percent } from 'lucide-react';
import { toast } from 'sonner';

interface StakedDomain {
  tokenId: string;
  name: string;
  stakedAt: Date;
  rewards: string;
  apr: string;
  lockPeriod: string;
}

export default function DeFiPage() {
  const { address, isConnected } = useAccount();
  const [selectedTab, setSelectedTab] = useState('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');

  // Mock staked domains
  const stakedDomains: StakedDomain[] = [];

  const totalStaked = stakedDomains.length;
  const totalRewards = stakedDomains.reduce((sum, d) => sum + parseFloat(d.rewards), 0);

  const handleStake = () => {
    if (!selectedDomain) {
      toast.error('Please select a domain to stake');
      return;
    }
    toast.success(`Staking ${selectedDomain}.base...`);
  };

  const handleUnstake = (domain: StakedDomain) => {
    toast.success(`Unstaking ${domain.name}.base...`);
  };

  const handleClaimRewards = () => {
    if (totalRewards === 0) {
      toast.error('No rewards to claim');
      return;
    }
    toast.success(`Claiming ${totalRewards.toFixed(4)} ETH rewards...`);
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
                Connect your wallet to access DeFi features
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
            <h1 className="text-4xl font-bold mb-2">DeFi Suite</h1>
            <p className="text-muted-foreground">Stake domains, earn rewards, and access DeFi features</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Total Staked
                </CardDescription>
                <CardTitle className="text-3xl">{totalStaked}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Rewards Earned
                </CardDescription>
                <CardTitle className="text-3xl">{totalRewards.toFixed(4)} ETH</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Current APR
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">12.5%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  TVL
                </CardDescription>
                <CardTitle className="text-3xl">$1.2M</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stake">Stake Domains</TabsTrigger>
              <TabsTrigger value="rewards">My Rewards</TabsTrigger>
              <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
            </TabsList>

            {/* Stake Tab */}
            <TabsContent value="stake" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stake Interface */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stake Your Domains</CardTitle>
                    <CardDescription>Earn rewards by staking .base domains</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Domain</label>
                      <Input
                        placeholder="Enter domain name"
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                      />
                    </div>

                    <div className="p-4 rounded-lg bg-muted space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Staking APR</span>
                        <span className="font-semibold text-green-600">12.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lock Period</span>
                        <span className="font-semibold">7 days minimum</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bonus (90+ days)</span>
                        <span className="font-semibold text-blue-600">+50%</span>
                      </div>
                    </div>

                    <Button onClick={handleStake} className="w-full" disabled={!selectedDomain}>
                      <Lock className="w-4 h-4 mr-2" />
                      Stake Domain
                    </Button>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle>Staking Benefits</CardTitle>
                    <CardDescription>Why stake your domains?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                          <Coins className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Earn Passive Rewards</p>
                          <p className="text-sm text-muted-foreground">
                            Earn ETH rewards automatically while your domains are staked
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Long-Term Bonuses</p>
                          <p className="text-sm text-muted-foreground">
                            Stake for 90+ days to earn 50% bonus rewards
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Domain Security</p>
                          <p className="text-sm text-muted-foreground">
                            Your domains remain secure in the staking contract
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Flexible Unstaking</p>
                          <p className="text-sm text-muted-foreground">
                            Unstake anytime after the minimum 7-day period
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Staked Domains */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Staked Domains</CardTitle>
                  <CardDescription>Manage your staked domains</CardDescription>
                </CardHeader>
                <CardContent>
                  {stakedDomains.length === 0 ? (
                    <div className="text-center py-12">
                      <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No domains staked yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Stake your first domain to start earning rewards
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stakedDomains.map((domain, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg border bg-card flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold">{domain.name}.base</p>
                            <p className="text-sm text-muted-foreground">
                              Staked {domain.stakedAt.toLocaleDateString()} • {domain.lockPeriod}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{domain.rewards} ETH</p>
                            <p className="text-sm text-green-600">{domain.apr} APR</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleUnstake(domain)}>
                            <Unlock className="w-4 h-4 mr-2" />
                            Unstake
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Rewards Summary</CardTitle>
                      <CardDescription>Your accumulated staking rewards</CardDescription>
                    </div>
                    <Button onClick={handleClaimRewards} disabled={totalRewards === 0}>
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Claim All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-6 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground mb-1">Available to Claim</p>
                      <p className="text-3xl font-bold">{totalRewards.toFixed(4)} ETH</p>
                    </div>
                    <div className="p-6 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground mb-1">Total Claimed</p>
                      <p className="text-3xl font-bold">0.0000 ETH</p>
                    </div>
                    <div className="p-6 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground mb-1">Lifetime Earnings</p>
                      <p className="text-3xl font-bold">{totalRewards.toFixed(4)} ETH</p>
                    </div>
                  </div>

                  {totalRewards === 0 && (
                    <div className="text-center py-12">
                      <Coins className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No rewards yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Stake domains to start earning rewards
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pools Tab */}
            <TabsContent value="pools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liquidity Pools</CardTitle>
                  <CardDescription>Provide liquidity and earn fees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Info className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Liquidity pools coming soon</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Earn trading fees by providing liquidity to domain markets
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Info Banner */}
          <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">DeFi Protocol Information</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Rewards are distributed every block based on staking duration</li>
                    <li>• Long-term stakers (90+ days) receive 50% bonus rewards</li>
                    <li>• Minimum staking period is 7 days to prevent gaming</li>
                    <li>• All contracts are audited and use battle-tested security patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
