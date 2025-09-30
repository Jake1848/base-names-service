import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
