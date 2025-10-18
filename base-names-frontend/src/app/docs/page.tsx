import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Code,
  Globe,
  Shield,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { CONTRACTS } from '@/lib/contracts';

export default function DocsPage() {
  // Get REAL contract addresses from deployed contracts (not mock data)
  const realContracts = CONTRACTS.BASE_MAINNET.contracts;

  const sections = [
    {
      title: "Getting Started",
      icon: FileText,
      cards: [
        {
          title: "What are Base Names?",
          description: "Learn about decentralized domain names on Base L2",
          content: `Base Names provide human-readable addresses for the Base blockchain. Instead of using complex addresses like 0x742d..., users can register domains like 'alice.base' for easier transactions and identity.`
        },
        {
          title: "System Requirements",
          description: "What you need to use Base Names",
          content: `• Web3 wallet (MetaMask, Coinbase Wallet, etc.)\n• ETH on Base network for gas fees\n• ETH for domain registration costs\n• Base network configured in your wallet (Chain ID: 8453)`
        }
      ]
    },
    {
      title: "Smart Contracts",
      icon: Code,
      cards: [
        {
          title: "Contract Addresses",
          description: "Official verified contracts on Base Mainnet",
          content: `BaseController: ${realContracts.BaseController}\nBaseRegistrar: ${realContracts.BaseRegistrar}\nENSRegistry: ${realContracts.ENSRegistry}\nPublicResolver: ${realContracts.PublicResolver}\nMarketplace: ${realContracts.DomainMarketplace}`
        },
        {
          title: "Registration Flow",
          description: "How domain registration works on-chain",
          content: `1. Check domain availability via BaseRegistrar.available()\n2. Get pricing via BaseController.rentPrice()\n3. Call BaseController.register() with payment\n4. Domain NFT minted to your address\n5. Resolver records can be set immediately`
        }
      ]
    },
    {
      title: "Integration Guide",
      icon: Globe,
      cards: [
        {
          title: "Web3 Integration",
          description: "Integrate Base Names into your application",
          content: `// Example: Check domain availability\nconst isAvailable = await baseRegistrar.available(labelHash('mydomain'));\n\n// Example: Resolve domain to address\nconst address = await publicResolver.resolve('mydomain.base');\n\n// Example: Get domain owner\nconst owner = await baseRegistrar.ownerOf(tokenId);`
        },
        {
          title: "Pricing Structure",
          description: "Current domain pricing on Base Names",
          content: `• 4+ characters: 0.01 ETH per year\n• 3 characters: 0.05 ETH per year\n• 1-2 characters: 0.1 ETH per year\n• Premium domains: Variable pricing\n• Gas fees: ~$1-3 depending on network congestion`
        }
      ]
    },
    {
      title: "Security",
      icon: Shield,
      cards: [
        {
          title: "Best Practices",
          description: "Keep your domains and wallet secure",
          content: `• Always verify contract addresses before interacting\n• Use hardware wallets for valuable domains\n• Enable 2FA on your wallet if available\n• Never share your private keys or seed phrase\n• Verify transactions before signing`
        },
        {
          title: "Contract Security",
          description: "Our security measures and audits",
          content: `• All contracts are verified on Basescan\n• Built on proven ENS architecture\n• Open source and auditable\n• Large TVL indicates community trust\n• Base/Coinbase backing provides additional assurance`
        }
      ]
    }
  ];

  // Use REAL deployed contract addresses (not mock data)
  const contractAddresses = [
    { name: 'BaseController', address: realContracts.BaseController, description: 'Main registration contract' },
    { name: 'BaseRegistrar', address: realContracts.BaseRegistrar, description: 'NFT contract for domains' },
    { name: 'ENSRegistry', address: realContracts.ENSRegistry, description: 'Name registry contract' },
    { name: 'PublicResolver', address: realContracts.PublicResolver, description: 'Address resolution contract' },
    { name: 'DomainMarketplace', address: realContracts.DomainMarketplace, description: 'Domain trading marketplace' },
  ];

  // Code examples with REAL contract addresses
  const codeExamples = [
    {
      title: "Check Domain Availability",
      language: "javascript",
      code: `import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http()
});

const isAvailable = await client.readContract({
  address: '${realContracts.BaseRegistrar}',
  abi: registrarAbi,
  functionName: 'available',
  args: [labelHash('mydomain')]
});`
    },
    {
      title: "Register Domain",
      language: "javascript",
      code: `const { request } = await client.simulateContract({
  address: '${realContracts.BaseController}',
  abi: controllerAbi,
  functionName: 'register',
  args: [
    'mydomain',                    // name
    '0x...',                      // owner
    BigInt(365 * 24 * 60 * 60),   // duration (1 year)
    '0x0000...',                  // secret
    '${realContracts.PublicResolver}', // resolver
    [],                           // data
    false,                        // reverseRecord
    '0x0000...',                  // referrer
    0                             // fuses
  ],
  value: parseEther('0.05')       // payment (0.05 ETH for standard domains)
});

await walletClient.writeContract(request);`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground dark:text-white">Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Complete technical documentation for integrating with Base Names Service.
        </p>
      </div>

      {/* Contract Addresses */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Verified Smart Contracts</span>
            <Badge variant="secondary">Base Mainnet</Badge>
          </CardTitle>
          <CardDescription>
            All contracts are verified on Basescan and open source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {contractAddresses.map((contract) => (
              <div key={contract.name} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div>
                  <p className="font-semibold text-foreground dark:text-white">{contract.name}</p>
                  <p className="text-sm text-muted-foreground">{contract.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground dark:text-white">
                    {contract.address}
                  </code>
                  <button className="p-1 hover:bg-muted rounded">
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={`https://basescan.org/address/${contract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-muted rounded"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation Sections */}
      <div className="space-y-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title}>
              <div className="flex items-center space-x-2 mb-6">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold text-foreground dark:text-white">{section.title}</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {section.cards.map((card, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-xl text-foreground dark:text-white">{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-line text-sm text-foreground dark:text-gray-300 leading-relaxed">
                        {card.content}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Code Examples */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center space-x-2 text-foreground dark:text-white">
          <Code className="h-6 w-6 text-primary" />
          <span>Code Examples</span>
        </h2>

        <div className="space-y-6">
          {codeExamples.map((example, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground dark:text-white">
                  <span>{example.title}</span>
                  <Badge variant="outline">{example.language}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm text-foreground dark:text-gray-300">
                  <code className="text-foreground dark:text-gray-300">{example.code}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>
            External links and tools for Base Names development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="https://docs.base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground dark:text-white">Base Documentation</p>
                <p className="text-sm text-muted-foreground">Official Base L2 docs</p>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a
              href="https://viem.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground dark:text-white">Viem Documentation</p>
                <p className="text-sm text-muted-foreground">TypeScript interface for Ethereum</p>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a
              href="https://wagmi.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground dark:text-white">Wagmi Documentation</p>
                <p className="text-sm text-muted-foreground">React hooks for Ethereum</p>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>

            <a
              href="/help"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground dark:text-white">Help Center</p>
                <p className="text-sm text-muted-foreground">FAQs and user guides</p>
              </div>
              <Info className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}