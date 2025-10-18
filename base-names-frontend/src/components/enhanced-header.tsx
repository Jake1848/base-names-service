'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X, Globe, TrendingUp, ShoppingBag, Sun, Moon, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function EnhancedHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Globe },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-500',
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl border-b shadow-lg shadow-primary/5'
            : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
        )}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5 opacity-50" />
        
        {/* Mouse follower effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 82, 255, 0.05), transparent 40%)`,
          }}
        />

        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                href="/"
                className="flex items-center space-x-3 text-xl font-bold group"
                aria-label="Base Names Home"
              >
                <motion.div
                  className="relative"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-lg opacity-0 group-hover:opacity-100"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(0, 82, 255, 0)",
                        "0 0 0 10px rgba(0, 82, 255, 0.1)",
                        "0 0 0 20px rgba(0, 82, 255, 0)",
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-primary transition-all duration-300">
                  Base Names
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'relative flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 group',
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary shadow-lg shadow-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </motion.div>
                      <span className="relative">
                        {item.name}
                        {isActive(item.href) && (
                          <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full"
                            layoutId="activeTab"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </span>
                      
                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              {mounted && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    className="hidden md:inline-flex relative overflow-hidden group"
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-md opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Button>
                </motion.div>
              )}

              {/* Wallet Connect */}
              <motion.div 
                className="hidden md:block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ConnectButton />
              </motion.div>

              {/* Mobile menu button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden relative overflow-hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle navigation menu"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isMobileMenuOpen ? 'close' : 'open'}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isMobileMenuOpen ? (
                        <X className="h-6 w-6" />
                      ) : (
                        <Menu className="h-6 w-6" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden border-t border-border/50 overflow-hidden"
              >
                <div className="py-4 space-y-2">
                  {navigation.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 group',
                            isActive(item.href)
                              ? 'bg-primary/10 text-primary shadow-lg shadow-primary/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-current={isActive(item.href) ? 'page' : undefined}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </motion.div>
                          <span>{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Theme Toggle - Mobile */}
                  {mounted && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navigation.length * 0.1, duration: 0.3 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-4 py-3 text-base font-medium rounded-xl"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                      >
                        <motion.div
                          className="mr-3"
                          animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                          ) : (
                            <Moon className="h-5 w-5" />
                          )}
                        </motion.div>
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                      </Button>
                    </motion.div>
                  )}

                  {/* Wallet Connect - Mobile */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navigation.length + 1) * 0.1, duration: 0.3 }}
                    className="pt-4 border-t border-border/50"
                  >
                    <ConnectButton />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>
    </>
  );
}
