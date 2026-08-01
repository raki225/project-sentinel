import { AnimatedCounter } from "@/components/common/animated-counter"

const STATS = [
  { label: "Government Departments", value: 5, suffix: "" },
  { label: "Districts Monitored", value: 8, suffix: "" },
  { label: "Documents Analyzed", value: 12480, suffix: "" },
  { label: "Avg. AI Confidence", value: 91, suffix: "%" },
]

export function StatsBar() {
  return (
    <section id="trust" className="border-y border-white/5 bg-navy">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-white/40">
          Trusted by government infrastructure & works departments
        </p>
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold text-white sm:text-4xl">
                <AnimatedCounter value={stat.value} />
                {stat.suffix}
              </p>
              <p className="mt-1.5 text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
