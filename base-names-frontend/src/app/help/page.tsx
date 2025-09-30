import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  Search,
  Wallet,
  CreditCard,
  Shield,
  MessageCircle,
  Mail,
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      category: "Getting Started",
      icon: HelpCircle,
      questions: [
        {
          q: "What are Base Names?",
          a: "Base Names are human-readable domain names built on Base L2 blockchain. Instead of using complex wallet addresses like 0x1234..., you can use simple names like 'alice.base' for transactions and identification."
        },
        {
          q: "How do I register a domain?",
          a: "Connect your wallet, search for an available domain, check the price, and complete the registration transaction. The domain will be minted as an NFT to your wallet."
        },
        {
          q: "What wallets are supported?",
          a: "We support all major Ethereum wallets including MetaMask, Coinbase Wallet, WalletConnect, and others through our RainbowKit integration."
        }
      ]
    },
    {
      category: "Registration",
      icon: CreditCard,
      questions: [
        {
          q: "How much does registration cost?",
          a: "4+ character domains cost 0.01 ETH (~$25), 3-character domains cost 0.05 ETH (~$125), and premium 1-2 character domains cost 0.1 ETH (~$250) per year."
        },
        {
          q: "How long do registrations last?",
          a: "All registrations are for 1 year. You'll need to renew your domain before it expires to maintain ownership."
        },
        {
          q: "Can I register multiple domains?",
          a: "Yes! You can register as many domains as you want. Each domain is a separate NFT that you own."
        }
      ]
    },
    {
      category: "Technical",
      icon: Shield,
      questions: [
        {
          q: "What network should I use?",
          a: "Base Names run on Base Mainnet (Chain ID: 8453). Make sure your wallet is connected to the correct network before registering."
        },
        {
          q: "Are the contracts verified?",
          a: "Yes, all contracts are verified on Basescan. You can view them at the addresses listed in our footer."
        },
        {
          q: "Can I transfer my domain?",
          a: "Yes, domains are NFTs and can be transferred like any other NFT through your wallet or NFT marketplaces."
        }
      ]
    },
    {
      category: "Troubleshooting",
      icon: AlertTriangle,
      questions: [
        {
          q: "Transaction failed - what happened?",
          a: "Common causes: insufficient ETH for gas fees, domain already taken, or network congestion. Check your wallet and try again with higher gas."
        },
        {
          q: "Domain not showing in my wallet?",
          a: "NFTs may take a few minutes to appear. Make sure you're on Base network and refresh your wallet. The domain ownership is recorded on-chain immediately."
        },
        {
          q: "Can't connect my wallet?",
          a: "Clear your browser cache, disable ad blockers, and ensure your wallet extension is updated. Try switching to a different browser if issues persist."
        }
      ]
    }
  ];

  const resources = [
    {
      title: "Smart Contracts",
      description: "View verified contracts on Basescan",
      href: "https://basescan.org/address/0xca7FD90f4C76FbCdbdBB3427804374b16058F55e",
      icon: ExternalLink
    },
    {
      title: "Discord Community",
      description: "Join our community for support and updates",
      href: "https://discord.gg/basenameservice",
      icon: MessageCircle
    },
    {
      title: "Documentation",
      description: "Technical documentation and guides",
      href: "/docs",
      icon: HelpCircle
    },
    {
      title: "Contact Support",
      description: "Email us for direct assistance",
      href: "mailto:support@basenameservice.xyz",
      icon: Mail
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions and get support for Base Names registration and management.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Card key={resource.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                <a
                  href={resource.href}
                  target={resource.href.startsWith('http') ? '_blank' : undefined}
                  rel={resource.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Learn More →
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQs */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>

        {faqs.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.category}>
              <div className="flex items-center space-x-2 mb-6">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">{category.category}</h3>
                <Badge variant="outline">{category.questions.length} questions</Badge>
              </div>

              <div className="grid gap-4">
                {category.questions.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start space-x-2">
                        <span className="text-primary text-xl">Q:</span>
                        <span>{item.q}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-600 text-xl font-semibold">A:</span>
                        <p className="text-muted-foreground">{item.a}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <Card className="mt-12 bg-primary/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Still Need Help?</CardTitle>
          <CardDescription className="text-lg">
            Our support team is here to assist you with any questions or issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@basenameservice.xyz"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </a>
            <a
              href="https://discord.gg/basenameservice"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Join Discord
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}