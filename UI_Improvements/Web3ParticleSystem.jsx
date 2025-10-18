import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const Web3ParticleSystem = ({ particleCount = 50, className = "" }) => {
  const [particles, setParticles] = useState([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 2 + 0.5,
      direction: Math.random() * 360,
      color: ['#0052FF', '#00D4FF', '#00FF88', '#8B5CF6', '#F59E0B'][Math.floor(Math.random() * 5)],
      opacity: Math.random() * 0.8 + 0.2,
      type: ['circle', 'triangle', 'square', 'diamond'][Math.floor(Math.random() * 4)],
      pulseSpeed: Math.random() * 3 + 1,
    }))
    setParticles(newParticles)
  }, [particleCount])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Particle shapes
  const getParticleShape = (particle) => {
    const baseClasses = "absolute transform -translate-x-1/2 -translate-y-1/2"
    
    switch (particle.type) {
      case 'triangle':
        return (
          <div
            className={baseClasses}
            style={{
              width: 0,
              height: 0,
              borderLeft: `${particle.size}px solid transparent`,
              borderRight: `${particle.size}px solid transparent`,
              borderBottom: `${particle.size * 1.5}px solid ${particle.color}`,
              filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
            }}
          />
        )
      case 'square':
        return (
          <div
            className={`${baseClasses} rotate-45`}
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        )
      case 'diamond':
        return (
          <div
            className={baseClasses}
            style={{
              width: particle.size,
              height: particle.size,
              background: `linear-gradient(45deg, ${particle.color}, transparent, ${particle.color})`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
            }}
          />
        )
      default: // circle
        return (
          <div
            className={`${baseClasses} rounded-full`}
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        )
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [
              0,
              Math.cos(particle.direction * Math.PI / 180) * 100,
              Math.cos((particle.direction + 90) * Math.PI / 180) * 50,
              0
            ],
            y: [
              0,
              Math.sin(particle.direction * Math.PI / 180) * 100,
              Math.sin((particle.direction + 90) * Math.PI / 180) * 50,
              0
            ],
            opacity: [particle.opacity, particle.opacity * 0.3, particle.opacity],
            scale: [1, 1.5, 0.8, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: particle.pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {getParticleShape(particle)}
          </motion.div>
          
          {/* Connection lines to mouse */}
          <motion.div
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: Math.sqrt(
                Math.pow(mousePosition.x - particle.x, 2) + 
                Math.pow(mousePosition.y - particle.y, 2)
              ) * 5,
              height: 1,
              background: `linear-gradient(to right, ${particle.color}40, transparent)`,
              transform: `rotate(${Math.atan2(
                mousePosition.y - particle.y,
                mousePosition.x - particle.x
              ) * 180 / Math.PI}deg)`,
            }}
            animate={{
              opacity: Math.sqrt(
                Math.pow(mousePosition.x - particle.x, 2) + 
                Math.pow(mousePosition.y - particle.y, 2)
              ) < 30 ? 0.6 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      ))}
      
      {/* Mouse cursor effect */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-accent/30 blur-sm" />
          <div className="absolute inset-2 w-4 h-4 rounded-full bg-accent" />
        </div>
      </motion.div>
    </div>
  )
}

export default Web3ParticleSystem
