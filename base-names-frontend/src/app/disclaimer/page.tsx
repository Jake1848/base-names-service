import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Info } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-8 w-8" />
          <span>Disclaimer</span>
        </h1>
        <p className="text-muted-foreground">
          Important disclaimers and risk warnings for Base Names Service users
        </p>
      </div>

      <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800 dark:text-red-200">
            <AlertTriangle className="h-5 w-5" />
            <span>Important Risk Warning</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300">
            Base Names Service involves interaction with experimental blockchain technology. Use at your own risk and never invest more than you can afford to lose.
          </p>
        </CardContent>
      </Card>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2>1. General Disclaimer</h2>
        <p>
          The information provided on this website and through the Base Names Service is for general informational purposes only. All information is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information.
        </p>

        <h2>2. Technology Risks</h2>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Blockchain Technology Risks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• <strong>Smart Contract Risk:</strong> Contracts may contain bugs or vulnerabilities</li>
              <li>• <strong>Network Risk:</strong> Base blockchain may experience downtime or congestion</li>
              <li>• <strong>Irreversibility:</strong> Blockchain transactions cannot be reversed</li>
              <li>• <strong>Gas Fees:</strong> Transaction costs are variable and unpredictable</li>
              <li>• <strong>Wallet Security:</strong> You are responsible for securing your private keys</li>
            </ul>
          </CardContent>
        </Card>

        <h2>3. Financial Disclaimers</h2>

        <h3>3.1 Not Financial Advice</h3>
        <p>
          Nothing on this website constitutes financial, investment, legal, or tax advice. You should consult with qualified professionals before making any financial decisions.
        </p>

        <h3>3.2 Value Volatility</h3>
        <p>
          Domain names and cryptocurrency values are highly volatile and may fluctuate significantly. Past performance does not indicate future results.
        </p>

        <h3>3.3 Investment Risk</h3>
        <p>
          Purchasing domain names is speculative and carries substantial risk. You may lose some or all of your investment.
        </p>

        <h2>4. Service Disclaimers</h2>

        <h3>4.1 Availability</h3>
        <p>
          We do not guarantee that the Service will be available at all times or operate without interruption. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
        </p>

        <h3>4.2 Third-Party Contracts</h3>
        <p>
          Base Names Service is a frontend interface to smart contracts operated by Base/Coinbase. We do not control these contracts and are not responsible for their operation or decisions made by their operators.
        </p>

        <h3>4.3 Data Accuracy</h3>
        <p>
          While we strive to provide accurate information, we cannot guarantee the accuracy of data displayed, including but not limited to:
        </p>
        <ul>
          <li>Domain availability status</li>
          <li>Pricing information</li>
          <li>Transaction histories</li>
          <li>Analytics and statistics</li>
        </ul>

        <h2>5. User Responsibilities</h2>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Your Responsibilities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• Verify all transaction details before confirmation</li>
              <li>• Understand the risks involved in blockchain transactions</li>
              <li>• Maintain security of your wallet and private keys</li>
              <li>• Comply with applicable laws and regulations</li>
              <li>• Conduct your own research before making decisions</li>
              <li>• Monitor domain expiration dates and renew as needed</li>
            </ul>
          </CardContent>
        </Card>

        <h2>6. Regulatory Compliance</h2>
        <p>
          The regulatory landscape for blockchain technology and digital assets is evolving. Users are responsible for:
        </p>
        <ul>
          <li>Understanding applicable laws in their jurisdiction</li>
          <li>Complying with tax obligations</li>
          <li>Obtaining necessary licenses or permissions</li>
          <li>Staying informed about regulatory changes</li>
        </ul>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
        </p>
        <ul>
          <li>Limit or exclude our or your liability for death or personal injury</li>
          <li>Limit or exclude our or your liability for fraud or fraudulent misrepresentation</li>
          <li>Limit any of our or your liabilities in any way that is not permitted under applicable law</li>
          <li>Exclude any of our or your liabilities that may not be excluded under applicable law</li>
        </ul>

        <h2>8. Third-Party Links</h2>
        <p>
          Our Service may contain links to third-party websites or services. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
        </p>

        <h2>9. Intellectual Property</h2>
        <p>
          Registering a domain name does not grant you any intellectual property rights beyond the domain name itself. You are responsible for ensuring your use of a domain name does not infringe on others&apos; intellectual property rights.
        </p>

        <h2>10. Force Majeure</h2>
        <p>
          We shall not be liable for any failure or delay in performance under this Service which is due to fire, flood, earthquake, elements of nature or acts of God, acts of war, terrorism, riots, civil disorders, rebellions or revolutions, or any other cause beyond our reasonable control.
        </p>

        <h2>11. Severability</h2>
        <p>
          If any provision of this disclaimer is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
        </p>

        <h2>12. Changes to This Disclaimer</h2>
        <p>
          We may update this disclaimer from time to time. Any changes will be effective immediately upon posting to our website.
        </p>

        <h2>13. Contact Information</h2>
        <p>
          If you have questions about this disclaimer, please contact us at:
        </p>
        <ul>
          <li>
            Email:{' '}
            <a href="mailto:legal@basenameservice.xyz" className="text-primary hover:underline">
              legal@basenameservice.xyz
            </a>
          </li>
          <li>
            Support:{' '}
            <a href="mailto:support@basenameservice.xyz" className="text-primary hover:underline">
              support@basenameservice.xyz
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}