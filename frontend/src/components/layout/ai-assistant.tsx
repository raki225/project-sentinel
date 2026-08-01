import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sparkles, X, Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"

const SUGGESTIONS = [
  "Summarize risk across all active projects",
  "Which projects have payment-progress mismatches?",
  "Draft a review note for PRJ-1044",
]

export function AiAssistant() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-96 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3.5 text-primary-foreground">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">Sentinel Assistant</p>
                  <p className="mt-1 text-[11px] text-primary-foreground/60">Evidence-grounded answers</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close assistant" className="opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 no-scrollbar">
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed">
                  I'm monitoring 9 active projects across 8 districts. 2 require immediate attention. Ask me
                  anything — every answer is traced back to source evidence.
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="block w-full rounded-xl border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2">
                <input
                  placeholder="Ask about any project, report, or risk..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button aria-label="Send" className="text-accent">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-6 right-6 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          onClick={() => setOpen((o) => !o)}
          className="h-14 w-14 rounded-full shadow-lg shadow-accent/25"
          aria-label="Open AI assistant"
        >
          {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </Button>
      </motion.div>
    </>
  )
}
