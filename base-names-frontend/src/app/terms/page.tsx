import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-2">
          <FileText className="h-8 w-8" />
          <span>Terms of Service</span>
        </h1>
        <p className="text-muted-foreground">
          Last updated: September 30, 2025
        </p>
      </div>

      <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5" />
            <span>Important Notice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 dark:text-yellow-300">
            By using Base Names Service, you acknowledge that this is experimental software interacting with smart contracts on the Base blockchain. You are responsible for understanding the risks involved in cryptocurrency transactions.
          </p>
        </CardContent>
      </Card>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Base Names Service (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Base Names Service is a decentralized application (dApp) that provides a user interface for interacting with Base Names smart contracts on the Base blockchain. The Service allows users to:
        </p>
        <ul>
          <li>Register .base domain names as NFTs</li>
          <li>Manage domain ownership and settings</li>
          <li>View marketplace and analytics data</li>
          <li>Transfer domains between wallets</li>
        </ul>

        <h2>3. Smart Contract Interaction</h2>
        <p>
          The Service is a frontend interface to smart contracts deployed on the Base blockchain. We do not control these contracts and are not responsible for their operation. All transactions are:
        </p>
        <ul>
          <li>Immutable once confirmed on the blockchain</li>
          <li>Subject to network fees (gas costs)</li>
          <li>Final and non-reversible</li>
        </ul>

        <h2>4. User Responsibilities</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the security of your wallet and private keys</li>
          <li>Verifying transaction details before confirmation</li>
          <li>Understanding the costs and risks of blockchain transactions</li>
          <li>Complying with applicable laws and regulations</li>
          <li>Renewing domain registrations before expiration</li>
        </ul>

        <h2>5. Risks and Disclaimers</h2>
        <p>
          You acknowledge and accept the following risks:
        </p>
        <ul>
          <li>Smart contracts may contain bugs or vulnerabilities</li>
          <li>Blockchain networks may experience congestion or downtime</li>
          <li>Cryptocurrency values are volatile</li>
          <li>Regulatory changes may affect service availability</li>
          <li>Domain names may lose value or utility</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          Domain names registered through the Service are owned by the registrant as NFTs. We do not claim ownership of registered domains. The Service interface and our original content remain our intellectual property.
        </p>

        <h2>7. Service Availability</h2>
        <p>
          We strive to maintain service availability but cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to:
        </p>
        <ul>
          <li>Maintenance and updates</li>
          <li>Technical difficulties</li>
          <li>Blockchain network issues</li>
          <li>Force majeure events</li>
        </ul>

        <h2>8. Privacy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Service. Continued use constitutes acceptance of modified Terms.
        </p>

        <h2>13. Contact Information</h2>
        <p>
          If you have questions about these Terms, please contact us at{' '}
          <a href="mailto:legal@basenameservice.xyz" className="text-primary hover:underline">
            legal@basenameservice.xyz
          </a>
        </p>
      </div>
    </div>
  );
}