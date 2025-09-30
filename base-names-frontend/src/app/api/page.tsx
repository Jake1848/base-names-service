import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, ExternalLink, AlertTriangle, Info } from 'lucide-react';

export default function APIPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">API Reference</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          REST API and GraphQL endpoints for Base Names Service integration.
        </p>
      </div>

      {/* Notice */}
      <Card className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5" />
            <span>API Coming Soon</span>
            <Badge variant="outline">In Development</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 dark:text-yellow-300">
            Our REST API and GraphQL endpoints are currently in development. For now, please interact directly with the smart contracts using web3 libraries like Viem or ethers.js.
          </p>
        </CardContent>
      </Card>

      {/* Smart Contract Interface */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Smart Contract Interface</span>
          </CardTitle>
          <CardDescription>
            Use these contract methods to interact with Base Names directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">BaseRegistrar.available(uint256 id)</h4>
              <p className="text-sm text-muted-foreground mb-2">Check if a domain is available for registration</p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`// Returns: bool
const isAvailable = await contract.read.available([labelHash('mydomain')]);`}
              </pre>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">BaseController.rentPrice(string name, uint256 duration)</h4>
              <p className="text-sm text-muted-foreground mb-2">Get the cost to register a domain for specified duration</p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`// Returns: [basePrice, premium]
const [basePrice, premium] = await contract.read.rentPrice(['mydomain', duration]);`}
              </pre>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">BaseController.register(...)</h4>
              <p className="text-sm text-muted-foreground mb-2">Register a new domain (payable function)</p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`// Parameters: name, owner, duration, secret, resolver, data, reverseRecord, ownerControlledFuses
await contract.write.register([
  'mydomain',
  '0x...',
  duration,
  '0x0000...',
  resolverAddress,
  [],
  true,
  0
], { value: totalPrice });`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planned Endpoints */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Planned API Endpoints</CardTitle>
          <CardDescription>
            These endpoints will be available when our API launches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg opacity-60">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">GET /api/domains/&#123;name&#125;</h4>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Get domain information including availability, owner, and resolver records</p>
            </div>

            <div className="p-4 border rounded-lg opacity-60">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">GET /api/domains/search</h4>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Search for available domains with filters and sorting</p>
            </div>

            <div className="p-4 border rounded-lg opacity-60">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">GET /api/address/&#123;address&#125;/domains</h4>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Get all domains owned by a specific address</p>
            </div>

            <div className="p-4 border rounded-lg opacity-60">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">GET /api/analytics</h4>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Get registration statistics and marketplace data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GraphQL */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>GraphQL Endpoint</CardTitle>
          <CardDescription>
            Flexible query interface for complex data requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg opacity-60">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">POST /graphql</h4>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              GraphQL endpoint for complex queries across domains, owners, and analytics data.
            </p>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`query GetDomainInfo($name: String!) {
  domain(name: $name) {
    name
    owner
    available
    expiryDate
    resolver {
      address
      contentHash
    }
    records {
      key
      value
    }
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Current Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Current Integration Methods</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Direct Contract Interaction</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use web3 libraries to interact directly with our verified smart contracts:
              </p>
              <div className="grid gap-2">
                <a
                  href="https://viem.sh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 border rounded hover:bg-muted text-sm"
                >
                  <span>Viem (TypeScript)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://docs.ethers.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 border rounded hover:bg-muted text-sm"
                >
                  <span>Ethers.js</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://web3js.readthedocs.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 border rounded hover:bg-muted text-sm"
                >
                  <span>Web3.js</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Documentation</h4>
              <p className="text-sm text-muted-foreground">
                For detailed integration guides and examples, visit our{' '}
                <a href="/docs" className="text-primary hover:underline">
                  documentation page
                </a>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}