import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const BlockchainNetwork = ({ nodeCount = 8, className = "" }) => {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [activeNode, setActiveNode] = useState(null)

  useEffect(() => {
    // Generate nodes in a circular pattern
    const newNodes = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * 2 * Math.PI
      const radius = 35 // percentage from center
      return {
        id: i,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        size: Math.random() * 20 + 15,
        activity: Math.random(),
        type: ['validator', 'node', 'bridge'][Math.floor(Math.random() * 3)],
        status: ['active', 'syncing', 'pending'][Math.floor(Math.random() * 3)],
      }
    })

    // Generate connections between nodes
    const newConnections = []
    for (let i = 0; i < nodeCount; i++) {
      const connectionsPerNode = Math.floor(Math.random() * 3) + 2
      for (let j = 0; j < connectionsPerNode; j++) {
        const targetIndex = (i + j + 1) % nodeCount
        if (!newConnections.some(conn => 
          (conn.from === i && conn.to === targetIndex) || 
          (conn.from === targetIndex && conn.to === i)
        )) {
          newConnections.push({
            id: `${i}-${targetIndex}`,
            from: i,
            to: targetIndex,
            strength: Math.random(),
            active: Math.random() > 0.7,
          })
        }
      }
    }

    setNodes(newNodes)
    setConnections(newConnections)
  }, [nodeCount])

  const getNodeColor = (node) => {
    switch (node.type) {
      case 'validator':
        return node.status === 'active' ? '#00FF88' : '#F59E0B'
      case 'bridge':
        return '#8B5CF6'
      default:
        return '#00D4FF'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00FF88'
      case 'syncing': return '#F59E0B'
      case 'pending': return '#FF6B35'
      default: return '#00D4FF'
    }
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <svg className="absolute inset-0 w-full h-full">
        {/* Connection lines */}
        {connections.map((connection) => {
          const fromNode = nodes[connection.from]
          const toNode = nodes[connection.to]
          if (!fromNode || !toNode) return null

          return (
            <motion.line
              key={connection.id}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke={connection.active ? '#00D4FF' : '#ffffff20'}
              strokeWidth={connection.active ? 2 : 1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: connection.active ? 0.8 : 0.3,
                strokeDasharray: connection.active ? "5,5" : "none",
              }}
              transition={{ 
                duration: 2,
                strokeDasharray: {
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
            />
          )
        })}

        {/* Data packets traveling along connections */}
        {connections.filter(c => c.active).map((connection) => {
          const fromNode = nodes[connection.from]
          const toNode = nodes[connection.to]
          if (!fromNode || !toNode) return null

          return (
            <motion.circle
              key={`packet-${connection.id}`}
              r="3"
              fill="#00D4FF"
              initial={{
                cx: `${fromNode.x}%`,
                cy: `${fromNode.y}%`,
              }}
              animate={{
                cx: [`${fromNode.x}%`, `${toNode.x}%`, `${fromNode.x}%`],
                cy: [`${fromNode.y}%`, `${toNode.y}%`, `${fromNode.y}%`],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <motion.animate
                attributeName="r"
                values="2;4;2"
                dur="1s"
                repeatCount="indefinite"
              />
            </motion.circle>
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
          onMouseEnter={() => setActiveNode(node.id)}
          onMouseLeave={() => setActiveNode(null)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Node glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              width: node.size * 2,
              height: node.size * 2,
              background: `radial-gradient(circle, ${getNodeColor(node)}40, transparent)`,
              filter: 'blur(10px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Main node */}
          <motion.div
            className="relative rounded-full border-2"
            style={{
              width: node.size,
              height: node.size,
              backgroundColor: getNodeColor(node),
              borderColor: getStatusColor(node.status),
              boxShadow: `0 0 20px ${getNodeColor(node)}`,
            }}
            animate={{
              boxShadow: activeNode === node.id 
                ? `0 0 30px ${getNodeColor(node)}, 0 0 60px ${getNodeColor(node)}40`
                : `0 0 20px ${getNodeColor(node)}`,
            }}
          >
            {/* Node type indicator */}
            <div className="absolute inset-1 rounded-full flex items-center justify-center">
              {node.type === 'validator' && (
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {node.type === 'bridge' && (
                <div className="w-3 h-0.5 bg-white rounded-full" />
              )}
              {node.type === 'node' && (
                <div className="w-1.5 h-1.5 bg-white rounded-sm" />
              )}
            </div>

            {/* Activity pulse */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white"
              animate={{
                scale: [1, 2],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: node.id * 0.2,
              }}
            />
          </motion.div>

          {/* Node info tooltip */}
          {activeNode === node.id && (
            <motion.div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="font-semibold capitalize">{node.type} Node</div>
              <div className="text-xs opacity-80">Status: {node.status}</div>
              <div className="text-xs opacity-80">Activity: {(node.activity * 100).toFixed(1)}%</div>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Center hub */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-accent/50"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Inner core */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <motion.div
              className="w-6 h-6 rounded-full bg-white"
              animate={{
                scale: [1, 0.8, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default BlockchainNetwork
