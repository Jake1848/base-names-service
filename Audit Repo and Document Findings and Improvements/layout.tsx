import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { EnhancedHeader } from "@/components/enhanced-header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Base Names - Decentralized Domain Service",
  description: "Register and manage .base domains on Base L2. The premier decentralized naming service for the Base ecosystem.",
  keywords: "base, domains, blockchain, web3, ENS, naming service, decentralized, Base L2",
  authors: [{ name: "Base Names Service" }],
  creator: "Base Names Service",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://basenameservice.xyz',
    title: 'Base Names - Decentralized Domain Service',
    description: 'Register and manage .base domains on Base L2',
    siteName: 'Base Names Service',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base Names - Decentralized Domain Service',
    description: 'Register and manage .base domains on Base L2',
    creator: '@basenameservice',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function EnhancedRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0052ff" />
        <meta name="msapplication-TileColor" content="#0052ff" />

        {/* Prevent zoom on iOS */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col overflow-x-hidden`}>
        <Providers>
          {/* Skip to main content for screen readers */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50 focus:z-[9999]"
          >
            Skip to main content
          </a>
          
          <EnhancedHeader />
          
          <main 
            id="main-content" 
            className="flex-1 relative"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
          
          <Footer />
          
          {/* Toast notifications */}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
          
          {/* Accessibility announcements */}
          <div 
            id="announcements" 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
          />
        </Providers>
      </body>
    </html>
  );
}
