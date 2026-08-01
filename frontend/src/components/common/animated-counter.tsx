import { useEffect, useRef } from "react"
import { animate, useInView, useMotionValue, useTransform } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  duration?: number
  format?: (value: number) => string
  className?: string
}

export function AnimatedCounter({ value, duration = 1.2, format, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) =>
    format ? format(latest) : Math.round(latest).toLocaleString("en-IN"),
  )

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] })
    return controls.stop
  }, [inView, value, duration, motionValue])

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) ref.current.textContent = String(latest)
    })
  }, [rounded])

  return <span ref={ref} className={className}>0</span>
}
