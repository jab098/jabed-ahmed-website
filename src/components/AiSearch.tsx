import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SIMPLE_ICONS } from '../data'
import { useReveal } from '../hooks'

/* ——— AI search strategy section (bottom of Insights) ——— */
const AI_ICON = (slug: string) => `${SIMPLE_ICONS}/${slug}.svg`

interface AiQuery {
  icon?: string
  text: string
}

const AI_QUERY_ROWS: AiQuery[][] = [
  [
    { icon: AI_ICON('meta'), text: 'How do I migrate GTM containers to server-side tagging?' },
    { icon: AI_ICON('openai'), text: 'Can AI assistants read my dataLayer events?' },
    { icon: AI_ICON('githubcopilot'), text: 'What should a dataLayer spec include for GA4?' },
    { icon: AI_ICON('googlegemini'), text: 'How do I QA custom event tracking before a release?' },
    { icon: AI_ICON('claude'), text: 'Do AI crawlers execute JavaScript tags?' },
    { icon: AI_ICON('x'), text: 'Which ecommerce events are worth tracking in 2026?' },
  ],
  [
    { icon: AI_ICON('openai'), text: 'How do I A/B test responses from an AI chatbot?' },
    { icon: AI_ICON('claude'), text: 'Does Consent Mode v2 change conversion modelling?' },
    { icon: AI_ICON('huggingface'), text: 'Can an LLM analyse my experiment results reliably?' },
    { icon: AI_ICON('perplexity'), text: 'Is personalisation legal under GDPR without consent?' },
    { icon: AI_ICON('googlegemini'), text: 'What sample size makes an A/B test trustworthy?' },
    { icon: AI_ICON('githubcopilot'), text: 'How does ATT affect SKAdNetwork attribution?' },
  ],
  [
    { icon: AI_ICON('x'), text: 'Is server-side tracking more accurate than browser tags?' },
    { icon: AI_ICON('openai'), text: 'How do I validate Snowplow payloads before the warehouse?' },
    { icon: AI_ICON('perplexity'), text: 'Which KPIs belong on an executive analytics dashboard?' },
    { icon: AI_ICON('meta'), text: 'Can BigQuery power real-time personalisation?' },
    { icon: AI_ICON('claude'), text: 'How do I attribute revenue to AI search referrals?' },
    { icon: AI_ICON('huggingface'), text: 'Does clean event data improve AI model training?' },
  ],
]

const HOW_ITEMS = [
  {
    title: 'Semantic Data Architecture',
    desc: 'I implement rigorous JSON-LD structured data and schema markup, ensuring that LLMs can accurately parse, index, and surface your business information with absolute confidence (e.g., using Product and Organization schema to enhance AI-generated snippets).',
  },
  {
    title: 'Prompt-Level Attribution',
    desc: 'My infrastructure tracks the specific user-initiated prompts that lead to brand citations within AI summaries, providing visibility into traffic sources that traditional analytics ignore (e.g., mapping brand mentions to specific query inputs in GA4).',
  },
  {
    title: 'Validated Data Pipelines',
    desc: "By leveraging strict payload validation—such as Snowplow's Iglu registries—I ensure that the data feeding into your models and analytics tools is consistently accurate, clean, and reliable (e.g., rejecting malformed event payloads before they reach the warehouse).",
  },
  {
    title: 'AI Sentiment Quantification',
    desc: 'I configure custom dashboards that ingest AI search results, allowing brands to measure their position, visibility, and sentiment within AI-generated responses (e.g., tracking the frequency of positive vs. neutral mentions in LLM summaries).',
  },
  {
    title: 'Contextual Intelligence',
    desc: "Through advanced behavioural pipelines, I inject real-time user intent data back into your site's AI agents, delivering hyper-personalized, data-informed responses that drive engagement (e.g., tailoring AI chatbot responses based on a user's previous purchase history).",
  },
]

/* Height collapse/expand with symmetric motion: content stays mounted, so
   closing glides through the same animation as opening instead of snapping */
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    setHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className="overflow-hidden transition-[height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
      aria-hidden={!open}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  )
}

function QueryRow({ items, reverse }: { items: AiQuery[]; reverse?: boolean }) {
  return (
    // py keeps pill borders and shadows inside the clip box
    <div className="overflow-hidden py-1">
      <div className={`flex w-max gap-3 ${reverse ? 'q-marquee-r' : 'q-marquee'}`}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3 pr-3" aria-hidden={copy === 1}>
            {items.map((q) => (
              <span
                key={q.text}
                className="flex items-center gap-2 whitespace-nowrap bg-white border border-black/10 rounded-full px-4 py-2 text-[13px] text-black/70 shadow-sm"
              >
                {q.icon && <img src={q.icon} alt="" className="w-3.5 h-3.5 opacity-60" loading="lazy" />}
                {q.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AiSearch() {
  const [open, setOpen] = useState(false)
  const { ref, inView } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`mt-28 md:mt-36 ${inView ? 'rv-in' : ''}`}>
      <h3 className="rv text-center text-[24px] md:text-[34px] font-semibold tracking-tight max-w-[860px] mx-auto leading-[1.25]">
        The AI Search Strategy: I optimize your digital presence for the new search engine era.
      </h3>

      {/* Query marquees: top drifts left, middle right, bottom left */}
      <div className="rv q-fade mt-12 space-y-4" style={{ animationDelay: '0.15s' }}>
        <QueryRow items={AI_QUERY_ROWS[0]} />
        <QueryRow items={AI_QUERY_ROWS[1]} reverse />
        <QueryRow items={AI_QUERY_ROWS[2]} />
      </div>

      {/* Expandable methodology */}
      <div className="rv flex flex-col items-center mt-12" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="cursor-pointer inline-flex items-center gap-2 border border-black/15 bg-white rounded-full px-6 py-2.5 text-[14px] font-medium hover:border-black/30 transition-colors"
        >
          How?
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <div className="w-full max-w-[900px]">
          <Collapse open={open}>
            {/* padding on all sides keeps the panel's shadow and rounded
                corners clear of the clip box */}
            <div className="pt-8 pb-6 px-3">
              <div className="bg-white border border-black/10 rounded-[24px] p-7 md:p-9 text-left space-y-6 shadow-lg">
                {HOW_ITEMS.map((item) => (
                  <div key={item.title}>
                    <p className="font-semibold text-[16px]">{item.title}</p>
                    <p className="text-[14px] text-black/70 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  )
}
