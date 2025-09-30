'use client';

import Link from 'next/link';
import { Github, Twitter, MessageCircle, FileText, Shield, HelpCircle, ExternalLink, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Register Domain', href: '/', icon: null },
      { name: 'Marketplace', href: '/marketplace', icon: null },
      { name: 'Analytics', href: '/analytics', icon: null },
      { name: 'Pricing', href: '#pricing', icon: null },
    ],
    resources: [
      { name: 'Documentation', href: '/docs', icon: FileText },
      { name: 'Help Center', href: '/help', icon: HelpCircle },
      { name: 'API Reference', href: '/api', icon: null },
      { name: 'Status', href: 'https://status.basenameservice.xyz', icon: ExternalLink },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms', icon: FileText },
      { name: 'Privacy Policy', href: '/privacy', icon: Shield },
      { name: 'Cookie Policy', href: '/cookies', icon: null },
      { name: 'Disclaimer', href: '/disclaimer', icon: null },
    ],
    social: [
      { name: 'GitHub', href: 'https://github.com/Jake1848/base-names-service', icon: Github },
      { name: 'Twitter', href: 'https://twitter.com/basenameservice', icon: Twitter },
      { name: 'Discord', href: 'https://discord.gg/basenameservice', icon: MessageCircle },
      { name: 'Email', href: 'mailto:support@basenameservice.xyz', icon: Mail },
    ],
  };

  const contractAddresses = [
    { name: 'ENSRegistry', address: '0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E' },
    { name: 'BaseController', address: '0xca7FD90f4C76FbCdbdBB3427804374b16058F55e' },
  ];

  return (
    <footer className="mt-auto bg-muted/50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Base Names
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              The premier decentralized domain service on Base L2. Register, manage, and trade .base domains with ease.
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((item) => {
                const Icon = item.icon;
                return Icon ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`Visit our ${item.name}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ) : null;
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm inline-flex items-center"
                  >
                    {item.name}
                    {item.icon === ExternalLink && (
                      <ExternalLink className="h-3 w-3 ml-1" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contract Addresses */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold mb-4 text-sm">Smart Contract Addresses (Base Mainnet)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contractAddresses.map((contract) => (
              <div
                key={contract.name}
                className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs"
              >
                <span className="font-medium text-muted-foreground">{contract.name}:</span>
                <code className="font-mono text-muted-foreground break-all">{contract.address}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Base Names Service. All rights reserved.
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>on</span>
            <Link
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Base L2
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-xs text-muted-foreground text-center">
          <p>
            This service is provided as-is. Always verify contract addresses and transactions before proceeding.
            Not affiliated with Coinbase or Base.
          </p>
        </div>
      </div>
    </footer>
  );
}