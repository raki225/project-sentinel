import { motion } from "framer-motion"
import { FileSearch, GitMerge, MapPinned, ShieldAlert, TrendingUp, Workflow } from "lucide-react"

const FEATURES = [
  {
    icon: FileSearch,
    title: "Evidence-based analysis",
    description:
      "Every AI conclusion is traced to source documents, images, and payment records — never a black box.",
  },
  {
    icon: GitMerge,
    title: "Cross-source correlation",
    description: "Sentinel merges inspection reports, drone imagery, complaints, and payments into one timeline.",
  },
  {
    icon: ShieldAlert,
    title: "Risk detection",
    description: "Anomalies like payment-progress mismatches surface automatically, ranked by confidence.",
  },
  {
    icon: Workflow,
    title: "Explainable reasoning chains",
    description: "See the exact observation → correlation → conclusion path behind every recommendation.",
  },
  {
    icon: MapPinned,
    title: "Geospatial oversight",
    description: "Track every sanctioned project across districts with live status and risk overlays.",
  },
  {
    icon: TrendingUp,
    title: "Budget intelligence",
    description: "Utilization trends flag disbursement ahead of verified progress before funds are lost.",
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="bg-background py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for decisions that carry weight
          </h2>
          <p className="mt-4 text-muted-foreground">
            Not a dashboard of charts — a system that reasons about infrastructure the way a senior engineer would.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
