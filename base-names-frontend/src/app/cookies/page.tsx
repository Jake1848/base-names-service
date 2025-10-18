import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Settings, Eye, Shield } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-2">
          <Cookie className="h-8 w-8" />
          <span>Cookie Policy</span>
        </h1>
        <p className="text-muted-foreground">
          Last updated: September 30, 2025
        </p>
      </div>

      <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
            <Settings className="h-5 w-5" />
            <span>Cookie Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 dark:text-blue-300">
            We use minimal cookies to provide essential functionality and improve your experience. You have full control over cookie preferences.
          </p>
        </CardContent>
      </Card>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2>1. What Are Cookies</h2>
        <p>
          Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our Service.
        </p>

        <h2>2. Types of Cookies We Use</h2>

        <div className="grid gap-6 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Essential Cookies</span>
                <span className="text-sm font-normal text-muted-foreground">(Always Active)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                These cookies are necessary for the website to function properly and cannot be disabled.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Wallet connection state</li>
                <li>• Security tokens for form submissions</li>
                <li>• Language and accessibility preferences</li>
                <li>• Theme preferences (dark/light mode)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span>Analytics Cookies</span>
                <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Help us understand how visitors interact with our website to improve the user experience.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Page views and user flows</li>
                <li>• Feature usage patterns</li>
                <li>• Performance metrics</li>
                <li>• Error tracking and debugging</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span>Preference Cookies</span>
                <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Remember your choices and provide enhanced, personalized features.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Domain search preferences</li>
                <li>• Marketplace filter settings</li>
                <li>• Notification preferences</li>
                <li>• Interface customizations</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <h2>3. Third-Party Cookies</h2>
        <p>
          Some cookies are set by third-party services we use:
        </p>

        <h3>3.1 Wallet Providers</h3>
        <p>
          When you connect your wallet (MetaMask, Coinbase Wallet, etc.), these providers may set their own cookies to maintain your connection state and preferences.
        </p>

        <h3>3.2 Analytics Services</h3>
        <p>
          We may use privacy-focused analytics services that set cookies to track website usage. These services are configured to respect your privacy and comply with applicable regulations.
        </p>

        <h3>3.3 Content Delivery Networks</h3>
        <p>
          Our website uses CDNs to deliver content efficiently. These services may set cookies for performance optimization and security purposes.
        </p>

        <h2>4. Cookie Duration</h2>
        <p>
          Cookies have different lifespans:
        </p>
        <ul>
          <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
          <li><strong>Persistent Cookies:</strong> Remain until they expire or you delete them</li>
          <li><strong>Essential Cookies:</strong> Typically last for the duration of your session</li>
          <li><strong>Analytics Cookies:</strong> Usually expire after 1-2 years</li>
          <li><strong>Preference Cookies:</strong> May last up to 1 year</li>
        </ul>

        <h2>5. Managing Your Cookie Preferences</h2>

        <h3>5.1 Browser Settings</h3>
        <p>
          You can control cookies through your browser settings:
        </p>
        <ul>
          <li>Block all cookies (may affect website functionality)</li>
          <li>Block third-party cookies only</li>
          <li>Delete existing cookies</li>
          <li>Set notifications for when cookies are set</li>
        </ul>

        <h3>5.2 Website Cookie Preferences</h3>
        <p>
          We provide cookie preference controls on our website where you can:
        </p>
        <ul>
          <li>Accept or reject non-essential cookies</li>
          <li>Manage specific cookie categories</li>
          <li>Update your preferences at any time</li>
        </ul>

        <h3>5.3 Opting Out of Analytics</h3>
        <p>
          You can opt out of analytics cookies through:
        </p>
        <ul>
          <li>Our cookie preference center</li>
          <li>Browser Do Not Track settings</li>
          <li>Analytics provider opt-out tools</li>
        </ul>

        <h2>6. Impact of Disabling Cookies</h2>
        <p>
          Disabling cookies may affect your experience:
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> Website may not function properly</li>
          <li><strong>Analytics Cookies:</strong> We cannot improve the service based on usage data</li>
          <li><strong>Preference Cookies:</strong> Your settings will not be remembered</li>
        </ul>

        <h2>7. Updates to Cookie Policy</h2>
        <p>
          We may update this Cookie Policy to reflect changes in our practices or applicable laws. We will notify you of significant changes and update the &quot;Last updated&quot; date.
        </p>

        <h2>8. Contact Information</h2>
        <p>
          If you have questions about our use of cookies, please contact us:
        </p>
        <ul>
          <li>
            Email:{' '}
            <a href="mailto:privacy@basenameservice.xyz" className="text-primary hover:underline">
              privacy@basenameservice.xyz
            </a>
          </li>
          <li>
            Support:{' '}
            <a href="mailto:support@basenameservice.xyz" className="text-primary hover:underline">
              support@basenameservice.xyz
            </a>
          </li>
        </ul>

        <h2>9. Additional Resources</h2>
        <p>
          Learn more about cookies and privacy:
        </p>
        <ul>
          <li>
            <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              All About Cookies
            </a>
          </li>
          <li>
            <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Your Online Choices
            </a>
          </li>
          <li>
            <a href="/privacy" className="text-primary hover:underline">
              Our Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}