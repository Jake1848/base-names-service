import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DataStream = ({ 
  streamCount = 5, 
  speed = 2, 
  className = "",
  characters = "01" 
}) => {
  const [streams, setStreams] = useState([])

  useEffect(() => {
    const newStreams = Array.from({ length: streamCount }, (_, i) => ({
      id: i,
      x: (i * (100 / streamCount)) + Math.random() * (100 / streamCount),
      characters: generateRandomString(20 + Math.random() * 30),
      speed: speed + Math.random() * 2,
      color: ['#00D4FF', '#00FF88', '#8B5CF6', '#F59E0B'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 3,
    }))
    setStreams(newStreams)
  }, [streamCount, speed])

  const generateRandomString = (length) => {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)]
    }
    return result
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {streams.map((stream) => (
        <motion.div
          key={stream.id}
          className="absolute top-0 font-mono text-sm font-bold select-none"
          style={{
            left: `${stream.x}%`,
            color: stream.color,
            textShadow: `0 0 10px ${stream.color}`,
          }}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{
            y: '100vh',
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: stream.speed * 3,
            repeat: Infinity,
            delay: stream.delay,
            ease: "linear",
            opacity: {
              times: [0, 0.1, 0.9, 1],
            }
          }}
        >
          {stream.characters.split('').map((char, index) => (
            <motion.div
              key={index}
              className="block leading-tight"
              style={{
                opacity: Math.max(0.1, 1 - (index * 0.05)),
              }}
              animate={{
                opacity: [
                  Math.max(0.1, 1 - (index * 0.05)),
                  Math.max(0.1, 1 - (index * 0.05)) * 0.5,
                  Math.max(0.1, 1 - (index * 0.05)),
                ],
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                delay: index * 0.1,
              }}
            >
              {char}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  )
}

const MatrixRain = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <DataStream 
        streamCount={15} 
        speed={1.5} 
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
      />
    </div>
  )
}

const BinaryRain = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <DataStream 
        streamCount={20} 
        speed={2} 
        characters="01"
      />
    </div>
  )
}

const HexRain = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <DataStream 
        streamCount={12} 
        speed={1.8} 
        characters="0123456789ABCDEF"
      />
    </div>
  )
}

// Floating data packets
const DataPackets = ({ packetCount = 10, className = "" }) => {
  const [packets, setPackets] = useState([])

  useEffect(() => {
    const newPackets = Array.from({ length: packetCount }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: ['#00D4FF', '#00FF88', '#8B5CF6', '#F59E0B'][Math.floor(Math.random() * 4)],
      data: Math.random().toString(36).substring(2, 8).toUpperCase(),
      speed: Math.random() * 3 + 2,
    }))
    setPackets(newPackets)
  }, [packetCount])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {packets.map((packet) => (
        <motion.div
          key={packet.id}
          className="absolute flex items-center gap-2 px-2 py-1 rounded-lg border font-mono text-xs"
          style={{
            backgroundColor: `${packet.color}20`,
            borderColor: packet.color,
            color: packet.color,
            boxShadow: `0 0 10px ${packet.color}40`,
          }}
          initial={{
            x: `${packet.startX}%`,
            y: `${packet.startY}%`,
            opacity: 0,
          }}
          animate={{
            x: [`${packet.startX}%`, `${packet.endX}%`, `${packet.startX}%`],
            y: [`${packet.startY}%`, `${packet.endY}%`, `${packet.startY}%`],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: packet.speed * 4,
            repeat: Infinity,
            ease: "linear",
            opacity: {
              times: [0, 0.1, 0.9, 1],
            }
          }}
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: packet.color }}
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
          <span>{packet.data}</span>
        </motion.div>
      ))}
    </div>
  )
}

// Glitch text effect
const GlitchText = ({ 
  children, 
  className = "", 
  glitchIntensity = 0.1,
  colors = ['#00D4FF', '#FF6B35', '#00FF88'] 
}) => {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < glitchIntensity) {
        setIsGlitching(true)
        setTimeout(() => setIsGlitching(false), 100 + Math.random() * 200)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [glitchIntensity])

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      
      <AnimatePresence>
        {isGlitching && (
          <>
            {colors.map((color, index) => (
              <motion.span
                key={index}
                className="absolute top-0 left-0"
                style={{ color }}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  x: [0, Math.random() * 4 - 2, 0],
                  y: [0, Math.random() * 2 - 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.15,
                  times: [0, 0.5, 1],
                }}
              >
                {children}
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export { DataStream, MatrixRain, BinaryRain, HexRain, DataPackets, GlitchText }
export default DataStream
