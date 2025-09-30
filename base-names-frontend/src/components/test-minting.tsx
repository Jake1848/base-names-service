'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { testMintingProcess, analyzeRevenueFlow } from '@/lib/test-minting';
import { AlertTriangle, CheckCircle, XCircle, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function TestMinting() {
  const [testDomain, setTestDomain] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [revenueAnalysis, setRevenueAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  const runMintingTest = async () => {
    if (!testDomain || !address) {
      toast.error('Please enter a domain name and connect your wallet');
      return;
    }

    setLoading(true);
    try {
      toast.info('Testing minting process...');

      const [mintResult, revenueResult] = await Promise.all([
        testMintingProcess(testDomain, address),
        analyzeRevenueFlow()
      ]);

      setTestResults(mintResult);
      setRevenueAnalysis(revenueResult);

      if (mintResult.success) {
        toast.success('Minting test completed successfully!');
      } else {
        toast.error(`Test failed: ${mintResult.error}`);
      }
    } catch (error: any) {
      toast.error(`Test error: ${error.message}`);
      console.error('Minting test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Minting Process Tester
            <Badge variant="outline">Safe Testing</Badge>
          </CardTitle>
          <CardDescription>
            Test domain registration without spending real ETH. This only simulates the process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter domain name (without .base)"
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value.toLowerCase())}
                className="flex-1"
              />
              <Button
                onClick={runMintingTest}
                disabled={loading || !address}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Minting'
                )}
              </Button>
            </div>
            {!address && (
              <p className="text-sm text-muted-foreground">
                Connect your wallet to test with your address
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Test Results: {testDomain}.base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.success ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Domain Status</h4>
                    <Badge variant="success">Available for Registration</Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Your Balance</h4>
                    <p className="text-lg font-mono">{testResults.userBalance} ETH</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Pricing Breakdown</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span className="font-mono">{testResults.pricing.basePrice} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium:</span>
                      <span className="font-mono">{testResults.pricing.premium} ETH</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="font-mono">{testResults.pricing.total} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>USD Estimate:</span>
                      <span>${testResults.pricing.usdEstimate}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Funds Check</h4>
                  <Badge variant={testResults.sufficientFunds ? "success" : "destructive"}>
                    {testResults.sufficientFunds ? "✅ Sufficient Funds" : "❌ Insufficient Funds"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Contract Details</h4>
                  <code className="block bg-muted p-2 rounded text-sm break-all">
                    {testResults.contractAddress}
                  </code>
                </div>
              </>
            ) : (
              <div className="text-red-600">
                <p className="font-semibold">Test Failed</p>
                <p>{testResults.error}</p>
                {testResults.available === false && (
                  <Badge variant="secondary" className="mt-2">Domain Already Registered</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Revenue Analysis */}
      {revenueAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Important: Revenue Destination
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                      Registration fees go to the BaseController contract, which appears to be operated by Base/Coinbase.
                      You are building a frontend for their existing contracts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Contract Information</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Revenue Recipient:</span>
                    <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                      {revenueAnalysis.contractAddress}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Current Balance:</span>
                    <span className="ml-2 font-mono">{revenueAnalysis.balance} ETH</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Business Model Impact:</strong> Since you don&apos;t own these contracts,
                  consider focusing on secondary marketplace features, premium services, or
                  partnering with Base rather than competing directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Testing Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold">Before Real Purchase:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Test with Base Sepolia testnet first (free)</li>
              <li>Start with a 4+ character domain (cheaper: 0.01 ETH)</li>
              <li>Ensure you have extra ETH for gas fees (~0.001-0.002 ETH)</li>
              <li>Double-check you&apos;re on Base mainnet (Chain ID: 8453)</li>
              <li>Verify contract addresses match exactly</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Business Considerations:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Registration revenue goes to Base/Coinbase, not you</li>
              <li>Consider secondary marketplace or service fees</li>
              <li>Explore partnership opportunities with Base</li>
              <li>Focus on UX improvements over official interface</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}