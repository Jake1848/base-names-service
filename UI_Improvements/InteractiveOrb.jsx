import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const InteractiveOrb = ({ size = 200, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const orbRef = useRef(null)
  
  // Motion values for smooth mouse tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Spring animations for smooth following
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 })
  
  // Transform mouse position to rotation
  const rotateX = useTransform(springY, [-300, 300], [30, -30])
  const rotateY = useTransform(springX, [-300, 300], [-30, 30])
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (orbRef.current) {
        const rect = orbRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const x = e.clientX - centerX
        const y = e.clientY - centerY
        
        mouseX.set(x)
        mouseY.set(y)
        setMousePosition({ x, y })
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])
  
  return (
    <div 
      ref={orbRef}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Orb */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          rotateX,
          rotateY,
        }}
        animate={{
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Outer Glow Ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #0052FF, #00D4FF, #00FF88, #8B5CF6, #F59E0B, #0052FF)',
            filter: 'blur(20px)',
            opacity: 0.6,
          }}
          animate={{
            rotate: 360,
            scale: isHovered ? 1.3 : 1.1,
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.3 }
          }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: 'conic-gradient(from 180deg, #00D4FF, #0052FF, #8B5CF6, #00D4FF)',
            filter: 'blur(10px)',
            opacity: 0.8,
          }}
          animate={{
            rotate: -360,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{
            rotate: { duration: 6, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.3 }
          }}
        />
        
        {/* Core Orb */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #00D4FF, #0052FF 60%, #0A1628 100%)',
            boxShadow: `
              inset 0 0 50px rgba(0, 212, 255, 0.5),
              0 0 100px rgba(0, 82, 255, 0.3),
              0 0 200px rgba(0, 212, 255, 0.2)
            `,
          }}
          animate={{
            boxShadow: isHovered 
              ? `
                inset 0 0 50px rgba(0, 212, 255, 0.8),
                0 0 150px rgba(0, 82, 255, 0.5),
                0 0 300px rgba(0, 212, 255, 0.4)
              `
              : `
                inset 0 0 50px rgba(0, 212, 255, 0.5),
                0 0 100px rgba(0, 82, 255, 0.3),
                0 0 200px rgba(0, 212, 255, 0.2)
              `
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Inner Sparkles */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          {/* Central Core */}
          <motion.div
            className="absolute inset-6 rounded-full"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.8), rgba(0, 212, 255, 0.6) 50%, transparent 70%)',
            }}
            animate={{
              scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        {/* Orbital Rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/20"
            style={{
              width: size + (i * 40),
              height: size + (i * 40),
              left: -(i * 20),
              top: -(i * 20),
            }}
            animate={{
              rotate: 360 * (i % 2 === 0 ? 1 : -1),
              opacity: isHovered ? 0.6 : 0.3,
            }}
            transition={{
              rotate: { 
                duration: 10 + (i * 5), 
                repeat: Infinity, 
                ease: "linear" 
              },
              opacity: { duration: 0.3 }
            }}
          >
            {/* Ring Particles */}
            <motion.div
              className="absolute w-2 h-2 bg-accent rounded-full"
              style={{
                left: '50%',
                top: '0%',
                marginLeft: '-4px',
                marginTop: '-4px',
              }}
              animate={{
                boxShadow: isHovered 
                  ? '0 0 20px rgba(0, 212, 255, 0.8)'
                  : '0 0 10px rgba(0, 212, 255, 0.5)'
              }}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Mouse Follower Particle */}
      <motion.div
        className="absolute w-3 h-3 bg-accent rounded-full pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          x: springX,
          y: springY,
          marginLeft: '-6px',
          marginTop: '-6px',
        }}
        animate={{
          scale: isHovered ? [1, 1.5, 1] : 0,
          opacity: isHovered ? 0.8 : 0,
        }}
        transition={{
          scale: { duration: 0.5, repeat: Infinity },
          opacity: { duration: 0.2 }
        }}
      />
    </div>
  )
}

export default InteractiveOrb
