import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, Shield, Globe, TrendingUp, Users, DollarSign, Activity, Star, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Import our new Web3 components
import InteractiveOrb from './components/InteractiveOrb.jsx'
import Web3ParticleSystem from './components/Web3ParticleSystem.jsx'
import BlockchainNetwork from './components/BlockchainNetwork.jsx'
import HolographicCard from './components/HolographicCard.jsx'
import CyberGrid from './components/CyberGrid.jsx'
import { MatrixRain, BinaryRain, DataPackets, GlitchText } from './components/DataStream.jsx'

import './App.css'

// Sample data for charts
const registrationData = [
  { month: 'Jan', registrations: 120, revenue: 6 },
  { month: 'Feb', registrations: 190, revenue: 9.5 },
  { month: 'Mar', registrations: 300, revenue: 15 },
  { month: 'Apr', registrations: 450, revenue: 22.5 },
  { month: 'May', registrations: 680, revenue: 34 },
  { month: 'Jun', registrations: 920, revenue: 46 },
]

const domainStatusData = [
  { name: 'Available', value: 65, color: '#00FF88' },
  { name: 'Premium', value: 20, color: '#F59E0B' },
  { name: 'Taken', value: 15, color: '#FF6B35' },
]

const premiumDomains = [
  { name: 'crypto.base', price: '50 ETH', status: 'premium', trend: '+15%' },
  { name: 'defi.base', price: '25 ETH', status: 'premium', trend: '+8%' },
  { name: 'nft.base', price: '30 ETH', status: 'premium', trend: '+12%' },
  { name: 'web3.base', price: '40 ETH', status: 'premium', trend: '+20%' },
  { name: 'dao.base', price: '15 ETH', status: 'available', trend: 'New' },
  { name: 'metaverse.base', price: '35 ETH', status: 'premium', trend: '+5%' },
]

const recentRegistrations = [
  { domain: 'alice.base', time: '2 min ago', price: '0.05 ETH' },
  { domain: 'bob.base', time: '5 min ago', price: '0.05 ETH' },
  { domain: 'charlie.base', time: '8 min ago', price: '0.05 ETH' },
  { domain: 'diana.base', time: '12 min ago', price: '0.05 ETH' },
]

// Enhanced search component
const DomainSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        { domain: `${searchTerm}.base`, available: true, price: '0.05 ETH' },
        { domain: `${searchTerm}app.base`, available: true, price: '0.05 ETH' },
        { domain: `${searchTerm}dao.base`, available: false, price: 'N/A' },
        { domain: `${searchTerm}nft.base`, available: true, price: '0.08 ETH' },
      ]
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 1500)
  }

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10">
      <HolographicCard className="glass-dark p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search for your perfect .base domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-2 border-accent/30 text-white placeholder:text-white/60 text-lg py-6 pr-12 focus:border-accent focus:ring-accent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent w-6 h-6" />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="btn-primary px-8 py-6 text-lg font-semibold"
          >
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </HolographicCard>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {searchResults.map((result, index) => (
              <motion.div
                key={result.domain}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <HolographicCard 
                  className={`glass-dark p-4 flex items-center justify-between hover-lift ${
                    result.available ? 'status-available' : 'status-taken'
                  }`}
                  glowColor={result.available ? '#00FF88' : '#FF6B35'}
                >
                  <div className="flex items-center gap-3">
                    {result.available ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{result.domain}</h3>
                      <p className="text-white/60">
                        {result.available ? 'Available for registration' : 'Already taken'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-accent font-bold text-lg">{result.price}</span>
                    {result.available && (
                      <Button className="btn-primary">Register</Button>
                    )}
                  </div>
                </HolographicCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Analytics dashboard component
const AnalyticsDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
      <HolographicCard className="glass-dark border-accent/20 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Total Registrations</CardTitle>
          <Users className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">2,680</div>
          <p className="text-xs text-green-400">+20.1% from last month</p>
        </CardContent>
      </HolographicCard>

      <HolographicCard className="glass-dark border-accent/20 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">134 ETH</div>
          <p className="text-xs text-green-400">+15.3% from last month</p>
        </CardContent>
      </HolographicCard>

      <HolographicCard className="glass-dark border-accent/20 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Active Domains</CardTitle>
          <Activity className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">2,543</div>
          <p className="text-xs text-green-400">+18.7% from last month</p>
        </CardContent>
      </HolographicCard>

      <HolographicCard className="glass-dark border-accent/20 hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Premium Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">47</div>
          <p className="text-xs text-green-400">+25.4% from last month</p>
        </CardContent>
      </HolographicCard>
    </div>
  )
}

// Main App component
function App() {
  const [activeTab, setActiveTab] = useState('search')

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <CyberGrid className="opacity-30" />
      <Web3ParticleSystem particleCount={30} className="opacity-60" />
      <BinaryRain className="opacity-20" />
      <DataPackets packetCount={8} className="opacity-40" />
      
      {/* Header */}
      <header className="glass-dark border-b border-accent/20 sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <InteractiveOrb size={40} className="animate-float" />
              <GlitchText className="text-2xl font-bold text-gradient">
                Base Names
              </GlitchText>
            </motion.div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-white/80 hover:text-accent transition-colors">Domains</a>
              <a href="#" className="text-white/80 hover:text-accent transition-colors">Analytics</a>
              <a href="#" className="text-white/80 hover:text-accent transition-colors">Marketplace</a>
              <a href="#" className="text-white/80 hover:text-accent transition-colors">Docs</a>
            </nav>
            
            <Button className="btn-primary">Connect Wallet</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <GlitchText className="text-gradient typewriter">
                Own Your Digital Identity
              </GlitchText>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
              Register and manage .base domains on Base Layer 2. Fast, cheap, and decentralized.
            </p>
          </motion.div>
          
          {/* Hero Orb */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
            <InteractiveOrb size={300} className="opacity-30" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <DomainSearch />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <HolographicCard className="glass-dark p-8 hover-lift text-center h-full" glowColor="#00FF88">
                <div className="w-16 h-16 rounded-2xl gradient-success flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Secure & Decentralized</h3>
                <p className="text-white/70">Your domains are secured by smart contracts on Base L2</p>
              </HolographicCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <HolographicCard className="glass-dark p-8 hover-lift text-center h-full" glowColor="#0052FF">
                <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
                <p className="text-white/70">Register domains in seconds with Base L2 speed</p>
              </HolographicCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <HolographicCard className="glass-dark p-8 hover-lift text-center h-full" glowColor="#8B5CF6">
                <div className="w-16 h-16 rounded-2xl gradient-premium flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Web3 Compatible</h3>
                <p className="text-white/70">Works with all major wallets and dApps</p>
              </HolographicCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-dark border border-accent/20 mb-8">
              <TabsTrigger value="search" className="data-[state=active]:bg-accent data-[state=active]:text-background">
                Search Domains
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-accent data-[state=active]:text-background">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-accent data-[state=active]:text-background">
                Marketplace
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Find Your Perfect Domain</h2>
                <p className="text-white/70 text-lg">Search and register .base domains instantly</p>
              </div>
              <DomainSearch />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Platform Analytics</h2>
                <p className="text-white/70 text-lg">Real-time insights and performance metrics</p>
              </div>
              
              <AnalyticsDashboard />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <HolographicCard className="glass-dark border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-white">Registration Trends</CardTitle>
                    <CardDescription className="text-white/60">Monthly domain registrations and revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={registrationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="#ffffff60" />
                        <YAxis stroke="#ffffff60" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(26, 32, 44, 0.9)', 
                            border: '1px solid #00D4FF',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="registrations" 
                          stroke="#00D4FF" 
                          fill="url(#gradient1)" 
                        />
                        <defs>
                          <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </HolographicCard>

                <HolographicCard className="glass-dark border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-white">Blockchain Network</CardTitle>
                    <CardDescription className="text-white/60">Live network visualization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <BlockchainNetwork nodeCount={6} />
                    </div>
                  </CardContent>
                </HolographicCard>
              </div>

              <HolographicCard className="glass-dark border-accent/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Registrations</CardTitle>
                  <CardDescription className="text-white/60">Latest domain registrations on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRegistrations.map((reg, index) => (
                      <motion.div
                        key={reg.domain}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-white font-medium">{reg.domain}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-white/60">{reg.time}</span>
                          <span className="text-accent font-semibold">{reg.price}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </HolographicCard>
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Premium Marketplace</h2>
                <p className="text-white/70 text-lg">Discover and trade premium .base domains</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumDomains.map((domain, index) => (
                  <motion.div
                    key={domain.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <HolographicCard 
                      className={`glass-dark p-6 hover-lift ${
                        domain.status === 'premium' ? 'status-premium' : 'status-available'
                      }`}
                      glowColor={domain.status === 'premium' ? '#F59E0B' : '#00FF88'}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant={domain.status === 'premium' ? 'default' : 'secondary'}
                          className={domain.status === 'premium' ? 'gradient-premium text-white' : 'bg-green-500 text-white'}
                        >
                          {domain.status === 'premium' ? 'Premium' : 'Available'}
                        </Badge>
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          {domain.trend}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">{domain.name}</h3>
                      <p className="text-3xl font-bold text-gradient-premium mb-6">{domain.price}</p>
                      
                      <div className="flex gap-3">
                        <Button className="btn-primary flex-1">
                          {domain.status === 'premium' ? 'Make Offer' : 'Register'}
                        </Button>
                        <Button variant="outline" className="btn-secondary">
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                    </HolographicCard>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-dark border-t border-accent/20 py-12 px-6 mt-20 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <InteractiveOrb size={40} />
                <h3 className="text-xl font-bold text-gradient">Base Names</h3>
              </div>
              <p className="text-white/60">Own your digital identity on Base Layer 2</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-accent transition-colors">Search Domains</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Premium Domains</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Marketplace</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-accent transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Smart Contracts</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-accent transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60">
            <p>&copy; 2024 Base Names. All rights reserved. Built on Base Layer 2.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
