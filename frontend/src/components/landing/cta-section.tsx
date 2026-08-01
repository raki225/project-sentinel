import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="bg-navy py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Give your officials evidence, not guesswork.
        </h2>
        <p className="mt-4 text-white/60">
          Onboard your department's infrastructure portfolio and see Sentinel's first risk assessment within a day.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="gap-2 px-6">
            <Link to="/dashboard">
              Enter Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
