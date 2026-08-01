import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowRight, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NetworkBackground } from "@/components/landing/network-background"

export function Hero() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-navy pt-16">
      <NetworkBackground />

      <div className="relative mx-auto max-w-5xl px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Deployed across 8 districts · 9 active projects monitored
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl"
        >
          AI Infrastructure
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-white bg-clip-text text-transparent">
            Oversight, made explainable.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-white/60"
        >
          Sentinel continuously reads inspection reports, payment records, and field evidence — then shows
          officials exactly why a project is at risk, with citations, not black boxes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="gap-2 px-6">
            <Link to="/dashboard">
              Enter Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 border-white/15 bg-white/0 px-6 text-white hover:bg-white/10 hover:text-white"
          >
            <a href="#how-it-works">
              <PlayCircle className="h-4 w-4" />
              See how the AI reasons
            </a>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-white/50"
          />
        </div>
      </motion.div>
    </section>
  )
}
