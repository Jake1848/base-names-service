'use client';

/**
 * Send to Domain Component
 *
 * Allows users to send ETH to a .base domain
 * Resolves domain to address and executes transaction
 *
 * This works TODAY without wallet provider support!
 */

import { useState } from 'react';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther, type Address } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { DomainResolver } from '@/sdk/DomainResolver';

const resolver = new DomainResolver();

export function SendToDomain() {
  const { address: connectedAddress } = useAccount();
  const { sendTransaction, isPending, isSuccess, isError } = useSendTransaction();

  const [domain, setDomain] = useState('');
  const [amount, setAmount] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<Address | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [profile, setProfile] = useState<{
    name: string;
    address: Address;
    avatar?: string;
    twitter?: string;
  } | null>(null);

  // Resolve domain to address
  const handleResolve = async () => {
    if (!domain) {
      toast.error('Please enter a .base domain');
      return;
    }

    setIsResolving(true);
    setResolvedAddress(null);
    setProfile(null);

    try {
      // Resolve with full profile
      const result = await resolver.resolveWithProfile(domain);

      if (!result || !result.address) {
        toast.error(`Domain "${domain}" not found or not configured`);
        setIsResolving(false);
        return;
      }

      setResolvedAddress(result.address);
      setProfile(result);

      toast.success(
        <div>
          <div className="font-semibold">{domain} resolved!</div>
          <div className="text-xs mt-1">{result.address.slice(0, 10)}...{result.address.slice(-8)}</div>
        </div>
      );

    } catch (error) {
      console.error('Resolution error:', error);
      toast.error('Failed to resolve domain');
    } finally {
      setIsResolving(false);
    }
  };

  // Send transaction
  const handleSend = async () => {
    if (!resolvedAddress) {
      toast.error('Resolve domain first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (!connectedAddress) {
      toast.error('Connect your wallet first');
      return;
    }

    try {
      const valueInWei = parseEther(amount);

      sendTransaction({
        to: resolvedAddress,
        value: valueInWei,
      });

      toast.success(
        <div>
          <div className="font-semibold">Transaction sent!</div>
          <div className="text-xs mt-1">Sending {amount} ETH to {domain}</div>
        </div>
      );

    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send transaction');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send to .base Domain
        </CardTitle>
        <CardDescription>
          Send ETH to a human-readable .base domain instead of a long hex address
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Domain Resolution */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Recipient Domain
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="alice.base"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleResolve();
                }}
                disabled={isResolving}
              />
              <Button
                onClick={handleResolve}
                disabled={isResolving || !domain}
                variant="outline"
                size="icon"
              >
                {isResolving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Resolved Address Display */}
          {resolvedAddress && (
            <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Domain Resolved</span>
              </div>

              <div className="text-sm">
                <div className="text-muted-foreground">Address:</div>
                <div className="font-mono text-xs break-all">{resolvedAddress}</div>
              </div>

              {/* Profile info if available */}
              {profile && (
                <div className="pt-2 border-t space-y-1">
                  {profile.avatar && (
                    <div className="text-xs text-muted-foreground">
                      Has avatar set
                    </div>
                  )}
                  {profile.twitter && (
                    <div className="text-xs text-muted-foreground">
                      Twitter: @{profile.twitter}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error state */}
          {!isResolving && domain && !resolvedAddress && (
            <div className="p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Domain not found</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Amount (ETH)
          </label>
          <Input
            type="number"
            step="0.0001"
            placeholder="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!resolvedAddress}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!resolvedAddress || !amount || isPending || !connectedAddress}
          className="w-full"
          size="lg"
        >
          {!connectedAddress ? (
            'Connect Wallet First'
          ) : isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send {amount || '0'} ETH to {domain || 'domain'}
            </>
          )}
        </Button>

        {/* Status */}
        {isSuccess && (
          <div className="p-4 bg-green-500/10 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Transaction successful!</span>
            </div>
          </div>
        )}

        {isError && (
          <div className="p-4 bg-destructive/10 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm">Transaction failed</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p className="font-medium">How it works:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Domain is resolved to wallet address via smart contract</li>
            <li>Transaction is sent directly to the resolved address</li>
            <li>Works on any Base-compatible wallet</li>
            <li>No intermediaries - peer-to-peer transfer</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
