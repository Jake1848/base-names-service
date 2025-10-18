import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const HolographicCard = ({ 
  children, 
  className = "", 
  intensity = 0.3,
  glowColor = "#00D4FF",
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 300,
    damping: 30
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 300,
    damping: 30
  })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = (e.clientX - centerX) / (rect.width / 2)
    const y = (e.clientY - centerY) / (rect.height / 2)

    mouseX.set(x * intensity)
    mouseY.set(y * intensity)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Holographic background */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 50%, 
              transparent 0deg, 
              ${glowColor}20 45deg, 
              transparent 90deg, 
              ${glowColor}30 135deg, 
              transparent 180deg, 
              ${glowColor}20 225deg, 
              transparent 270deg, 
              ${glowColor}30 315deg, 
              transparent 360deg
            )
          `,
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0,
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          opacity: { duration: 0.3 },
          rotate: { duration: 4, repeat: Infinity, ease: "linear" }
        }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: `linear-gradient(
            135deg, 
            transparent 30%, 
            ${glowColor}40 50%, 
            transparent 70%
          )`,
        }}
        animate={{
          opacity: isHovered ? [0, 0.6, 0] : 0,
          x: isHovered ? ['-100%', '100%'] : '0%',
        }}
        transition={{
          opacity: { duration: 1.5, repeat: Infinity },
          x: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Prismatic edge glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(45deg, 
            ${glowColor}00, 
            ${glowColor}20, 
            ${glowColor}00, 
            ${glowColor}30, 
            ${glowColor}00
          )`,
          filter: 'blur(1px)',
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content container */}
      <div 
        className="relative z-10 w-full h-full"
        style={{ transform: "translateZ(50px)" }}
      >
        {children}
      </div>

      {/* Floating particles */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: glowColor,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -50],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent"
        style={{
          borderImage: `linear-gradient(45deg, 
            ${glowColor}00, 
            ${glowColor}80, 
            ${glowColor}00, 
            ${glowColor}80, 
            ${glowColor}00
          ) 1`,
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
          boxShadow: isHovered 
            ? `0 0 30px ${glowColor}60, inset 0 0 30px ${glowColor}20`
            : `0 0 0px ${glowColor}00, inset 0 0 0px ${glowColor}00`,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default HolographicCard
