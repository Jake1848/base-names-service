'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Settings, RefreshCw, Wallet, AlertCircle, ExternalLink, DollarSign, Tag } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useDomainOwnership } from '@/hooks/useDomainOwnership';
import { useMarketplace, useDomainListing } from '@/hooks/useMarketplace';
import { CONTRACTS } from '@/lib/contracts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function ListDomainDialog({ domain }: { domain: any }) {
  const [price, setPrice] = useState('');
  const [isListingdialogopen, setIsListingDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isListing, setIsListing] = useState(false);

  const { approveMarketplace, listDomain, cancelListing } = useMarketplace();
  const { isListed, price: currentPrice, refetch } = useDomainListing(domain.tokenId);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleList = async () => {
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      // Step 1: Approve marketplace
      setIsApproving(true);
      await approveMarketplace(domain.tokenId);
      setIsApproving(false);

      // Step 2: List domain
      setIsListing(true);
      await listDomain(domain.tokenId, price);
      setIsListing(false);

      setIsListingDialogOpen(false);
      setPrice('');

      toast.success('Domain listed on marketplace!');
      refetch(); // Refresh listing status
    } catch (error) {
      setIsApproving(false);
      setIsListing(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelListing(domain.tokenId);
      toast.success('Listing cancelled successfully!');
      refetch(); // Refresh listing status
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsCancelling(false);
    }
  };

  if (isListed) {
    return (
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-full justify-center">
          <Tag className="w-3 h-3 mr-1" />
          Listed for {currentPrice ? (Number(currentPrice) / 1e18).toFixed(3) : '...'} ETH
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isCancelling}
          className="w-full"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Listing'}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isListingdialogopen} onOpenChange={setIsListingDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="flex-1">
          <DollarSign className="w-3 h-3 mr-1" />
          List for Sale
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>List {domain.name}.base for Sale</DialogTitle>
          <DialogDescription>
            Set your price and list your domain on the marketplace
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Price (ETH)</label>
            <Input
              type="number"
              step="0.001"
              placeholder="0.1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Marketplace fee: 2.5% • You'll receive {price ? (parseFloat(price) * 0.975).toFixed(4) : '0'} ETH
            </p>
          </div>
          <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
            <p><strong>Step 1:</strong> Approve marketplace contract</p>
            <p><strong>Step 2:</strong> Create listing</p>
          </div>
          <Button
            onClick={handleList}
            className="w-full"
            disabled={isApproving || isListing || !price}
          >
            {isApproving ? 'Approving...' : isListing ? 'Listing...' : 'List Domain'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const { address, isConnected, chainId } = useAccount();
  const { domains, loading } = useDomainOwnership();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to view and manage your .base domains
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Domains</h1>
              <p className="text-muted-foreground">Manage your .base domain portfolio</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Domains</CardDescription>
                <CardTitle className="text-3xl">{domains.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Expiring Soon</CardDescription>
                <CardTitle className="text-3xl text-orange-600">
                  {domains.filter(d => d.isExpiringSoon).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Domains</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {domains.filter(d => !d.isExpiringSoon).length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Domain List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-6 bg-muted rounded mb-3"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : domains.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Domains Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You don't own any .base domains yet. Register your first domain to get started!
                </p>
                <Link href="/">
                  <Button size="lg">
                    Register Your First Domain
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domains.map((domain) => (
                <Card
                  key={domain.tokenId.toString()}
                  className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/40"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{domain.name}.base</CardTitle>
                      {domain.isExpiringSoon && (
                        <Badge variant="destructive">
                          {domain.daysUntilExpiry}d left
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Expires: {new Date(Number(domain.expires) * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{domain.daysUntilExpiry} days remaining</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        Token ID: {domain.tokenId.toString().slice(0, 16)}...
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <ListDomainDialog domain={domain} />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={`https://${chainId === 84532 ? 'sepolia.' : ''}basescan.org/token/${chainId === 8453 ? CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar : CONTRACTS.BASE_SEPOLIA.contracts.BaseRegistrar}/${domain.tokenId.toString()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          BaseScan
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Information Panel */}
          <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Domain Management Features Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                We're building advanced domain management features including:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>DNS Record Management (A, AAAA, CNAME, TXT, MX records)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Automated Renewal & Expiry Notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Domain Transfer with Safety Checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Batch Operations for Multiple Domains</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Subdomain Management</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                For now, you can register new domains on the{' '}
                <Link href="/" className="text-primary hover:underline">home page</Link>
                {' '}and view the{' '}
                <Link href="/marketplace" className="text-primary hover:underline">marketplace</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
