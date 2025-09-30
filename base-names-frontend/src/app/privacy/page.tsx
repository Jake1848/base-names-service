import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Database, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8" />
          <span>Privacy Policy</span>
        </h1>
        <p className="text-muted-foreground">
          Last updated: September 30, 2025
        </p>
      </div>

      <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
            <Lock className="h-5 w-5" />
            <span>Privacy First</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 dark:text-green-300">
            We are committed to protecting your privacy. As a decentralized application, we minimize data collection and prioritize user privacy and security.
          </p>
        </CardContent>
      </Card>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2>1. Information We Collect</h2>

        <h3>1.1 Wallet Information</h3>
        <p>
          When you connect your wallet to our Service, we may access:
        </p>
        <ul>
          <li>Your wallet address (public information)</li>
          <li>Domain names you own</li>
          <li>Transaction history related to domain operations</li>
        </ul>
        <p>
          We never access or store your private keys or seed phrases.
        </p>

        <h3>1.2 Usage Analytics</h3>
        <p>
          We may collect anonymous usage data to improve our Service:
        </p>
        <ul>
          <li>Pages visited and features used</li>
          <li>Browser type and device information</li>
          <li>Geographic location (country/region only)</li>
          <li>Performance metrics and error reports</li>
        </ul>

        <h3>1.3 Blockchain Data</h3>
        <p>
          All domain registrations and transfers are recorded on the Base blockchain, which is public and immutable. This includes:
        </p>
        <ul>
          <li>Domain ownership records</li>
          <li>Transaction timestamps and amounts</li>
          <li>Resolver settings and records</li>
        </ul>

        <h2>2. How We Use Information</h2>
        <p>
          We use collected information to:
        </p>
        <ul>
          <li>Provide and improve our Service</li>
          <li>Display your owned domains and transaction history</li>
          <li>Generate analytics and marketplace data</li>
          <li>Troubleshoot technical issues</li>
          <li>Comply with legal requirements</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>
          We do not sell, rent, or share your personal information with third parties, except:
        </p>
        <ul>
          <li>When required by law or legal process</li>
          <li>To protect our rights and safety</li>
          <li>With your explicit consent</li>
          <li>With service providers who assist our operations (under strict confidentiality)</li>
        </ul>

        <h2>4. Third-Party Services</h2>

        <h3>4.1 Wallet Providers</h3>
        <p>
          We integrate with wallet providers like MetaMask and Coinbase Wallet. These services have their own privacy policies that govern your interactions with them.
        </p>

        <h3>4.2 Analytics Services</h3>
        <p>
          We may use privacy-focused analytics services to understand Service usage. These services are configured to minimize data collection and protect user privacy.
        </p>

        <h3>4.3 Infrastructure Providers</h3>
        <p>
          Our Service relies on various infrastructure providers for hosting, content delivery, and blockchain access. We select providers with strong privacy and security practices.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your information:
        </p>
        <ul>
          <li>Encryption in transit and at rest</li>
          <li>Regular security audits and updates</li>
          <li>Limited access to personal data</li>
          <li>Secure development practices</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>
          We retain information only as long as necessary to provide our Service and comply with legal obligations. Anonymous analytics data may be retained indefinitely to improve our Service.
        </p>

        <h2>7. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access information we have about you</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data (where legally permissible)</li>
          <li>Opt out of certain data collection</li>
          <li>Data portability</li>
        </ul>

        <h2>8. Children&apos;s Privacy</h2>
        <p>
          Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.
        </p>

        <h2>9. International Users</h2>
        <p>
          Our Service is accessible globally. If you are located outside [Primary Jurisdiction], please be aware that your information may be transferred to and processed in countries with different privacy laws.
        </p>

        <h2>10. Cookies and Tracking</h2>
        <p>
          We use minimal cookies and tracking technologies:
        </p>
        <ul>
          <li>Essential cookies for Service functionality</li>
          <li>Analytics cookies (with your consent)</li>
          <li>Preference cookies to remember your settings</li>
        </ul>
        <p>
          You can control cookie settings through your browser preferences.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our Service and updating the "Last updated" date.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <ul>
          <li>
            Email:{' '}
            <a href="mailto:privacy@basenameservice.xyz" className="text-primary hover:underline">
              privacy@basenameservice.xyz
            </a>
          </li>
          <li>
            General inquiries:{' '}
            <a href="mailto:support@basenameservice.xyz" className="text-primary hover:underline">
              support@basenameservice.xyz
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}