import { motion } from 'framer-motion'

const CyberGrid = ({ 
  gridSize = 50, 
  glowColor = "#00D4FF", 
  className = "",
  animated = true 
}) => {
  const gridLines = []
  
  // Create vertical lines
  for (let i = 0; i <= 100; i += gridSize / 10) {
    gridLines.push({
      type: 'vertical',
      position: i,
      id: `v-${i}`,
      delay: Math.random() * 2,
    })
  }
  
  // Create horizontal lines
  for (let i = 0; i <= 100; i += gridSize / 10) {
    gridLines.push({
      type: 'horizontal',
      position: i,
      id: `h-${i}`,
      delay: Math.random() * 2,
    })
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          {/* Gradient for grid lines */}
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0" />
            <stop offset="50%" stopColor={glowColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Pulse gradient */}
          <linearGradient id="pulseGradient">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0">
              <animate attributeName="stop-opacity" 
                values="0;0.8;0" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor={glowColor} stopOpacity="0.6">
              <animate attributeName="stop-opacity" 
                values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor={glowColor} stopOpacity="0">
              <animate attributeName="stop-opacity" 
                values="0;0.8;0" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((line) => {
          if (line.type === 'vertical') {
            return (
              <motion.line
                key={line.id}
                x1={`${line.position}%`}
                y1="0%"
                x2={`${line.position}%`}
                y2="100%"
                stroke="url(#gridGradient)"
                strokeWidth="1"
                filter="url(#glow)"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: animated ? [0, 0.6, 0] : 0.3,
                }}
                transition={{
                  duration: 4,
                  repeat: animated ? Infinity : 0,
                  delay: line.delay,
                  ease: "easeInOut"
                }}
              />
            )
          } else {
            return (
              <motion.line
                key={line.id}
                x1="0%"
                y1={`${line.position}%`}
                x2="100%"
                y2={`${line.position}%`}
                stroke="url(#gridGradient)"
                strokeWidth="1"
                filter="url(#glow)"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: animated ? [0, 0.6, 0] : 0.3,
                }}
                transition={{
                  duration: 4,
                  repeat: animated ? Infinity : 0,
                  delay: line.delay,
                  ease: "easeInOut"
                }}
              />
            )
          }
        })}

        {/* Scanning lines */}
        {animated && (
          <>
            <motion.line
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              stroke={glowColor}
              strokeWidth="2"
              filter="url(#glow)"
              animate={{
                y1: ["0%", "100%", "0%"],
                y2: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <motion.line
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
              stroke={glowColor}
              strokeWidth="2"
              filter="url(#glow)"
              animate={{
                x1: ["0%", "100%", "0%"],
                x2: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </>
        )}

        {/* Corner accents */}
        <g stroke={glowColor} strokeWidth="3" fill="none" filter="url(#glow)">
          {/* Top-left corner */}
          <motion.path
            d="M 5 25 L 5 5 L 25 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
          
          {/* Top-right corner */}
          <motion.path
            d="M 95 5 L 95 25"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
          <motion.path
            d="M 75 5 L 95 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
          
          {/* Bottom-left corner */}
          <motion.path
            d="M 5 75 L 5 95 L 25 95"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          />
          
          {/* Bottom-right corner */}
          <motion.path
            d="M 95 95 L 75 95"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 2 }}
          />
          <motion.path
            d="M 95 95 L 95 75"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 2 }}
          />
        </g>

        {/* Center crosshair */}
        <g stroke={glowColor} strokeWidth="2" filter="url(#glow)">
          <motion.circle
            cx="50%"
            cy="50%"
            r="30"
            fill="none"
            strokeDasharray="5,5"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          
          <motion.circle
            cx="50%"
            cy="50%"
            r="20"
            fill="none"
            strokeDasharray="3,3"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          <motion.line
            x1="45%"
            y1="50%"
            x2="55%"
            y2="50%"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <motion.line
            x1="50%"
            y1="45%"
            x2="50%"
            y2="55%"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      </svg>

      {/* Overlay gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, rgba(10, 22, 40, 0.8) 100%)`,
        }}
      />
    </div>
  )
}

export default CyberGrid
