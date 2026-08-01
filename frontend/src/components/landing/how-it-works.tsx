import { motion } from "framer-motion"
import { FileStack, ScanSearch, Sparkles, FileCheck2 } from "lucide-react"

const STEPS = [
  {
    icon: FileStack,
    title: "Ingest",
    description: "Reports, photos, payment ledgers, and complaints are collected from every project source.",
  },
  {
    icon: ScanSearch,
    title: "Extract",
    description: "OCR and vision models pull structured facts — measurements, dates, amounts — from raw evidence.",
  },
  {
    icon: Sparkles,
    title: "Reason",
    description: "The reasoning engine correlates facts across sources, surfacing anomalies with confidence scores.",
  },
  {
    icon: FileCheck2,
    title: "Recommend",
    description: "Officials receive a cited, ranked recommendation — never a conclusion without its evidence trail.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How the AI reasons</h2>
          <p className="mt-4 text-muted-foreground">
            Four stages turn scattered field evidence into a decision an official can act on with confidence.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-accent shadow-sm">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-medium text-muted-foreground">Step {i + 1}</p>
              <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
