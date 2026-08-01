import { useMemo } from "react"
import { motion } from "framer-motion"

interface Node {
  x: number
  y: number
  r: number
  delay: number
}

function useNetwork(count: number, seed: number) {
  return useMemo(() => {
    let s = seed
    const rand = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    const nodes: Node[] = Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 1 + rand() * 1.6,
      delay: rand() * 4,
    }))
    const links: [Node, Node][] = []
    nodes.forEach((node, i) => {
      const next = nodes[(i + 1) % nodes.length]
      const dist = Math.hypot(node.x - next.x, node.y - next.y)
      if (dist < 45) links.push([node, next])
    })
    return { nodes, links }
  }, [count, seed])
}

export function NetworkBackground() {
  const { nodes, links } = useNetwork(28, 42)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full opacity-[0.35]">
        {links.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="url(#lineGradient)"
            strokeWidth={0.15}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, delay: i * 0.03, ease: "easeOut" }}
          />
        ))}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.r * 0.4}
            fill="#60a5fa"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 3 + node.delay, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-navy/0 via-navy/40 to-navy" />
    </div>
  )
}
