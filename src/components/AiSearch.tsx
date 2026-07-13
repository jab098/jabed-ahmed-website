import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SIMPLE_ICONS } from '../data'
import { useReveal } from '../hooks'

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
    desc: 'Rigorous structured data and schema markup give language models a dependable picture of your products, organisation and expertise.',
  },
  {
    title: 'Prompt-Level Attribution',
    desc: 'Measurement connects brand citations and AI referrals back to the questions and journeys that created commercial intent.',
  },
  {
    title: 'Validated Data Pipelines',
    desc: 'Payload contracts and quality gates stop malformed signals before they reach a warehouse, model or decision-maker.',
  },
  {
    title: 'AI Sentiment Quantification',
    desc: 'Purpose-built reporting makes position, visibility and sentiment across answer engines visible and comparable over time.',
  },
  {
    title: 'Contextual Intelligence',
    desc: 'Real-time behavioural signals give AI experiences the context to respond usefully without abandoning governance or consent.',
  },
]

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
      className="ai-method-collapse"
      style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
      aria-hidden={!open}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  )
}

function QueryRow({ items, reverse }: { items: AiQuery[]; reverse?: boolean }) {
  return (
    <div className="ai-query-lane">
      <div className={reverse ? 'q-marquee-r' : 'q-marquee'}>
        {[0, 1].map((copy) => (
          <div key={copy} className="ai-query-group" aria-hidden={copy === 1}>
            {items.map((query) => (
              <span key={query.text} className="ai-query-item">
                {query.icon && <img src={query.icon} alt="" loading="lazy" />}
                <span>{query.text}</span>
                <i aria-hidden="true">✦</i>
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
  const { ref, inView } = useReveal<HTMLDivElement>(0.08)

  return (
    <div ref={ref} className={`ai-field ${inView ? 'rv-in' : ''}`}>
      <header className="ai-field-header">
        <div>
          <p className="ai-field-kicker rv">AI search / emerging channel</p>
          <h3 className="rv" style={{ animationDelay: '0.1s' }}>
            <span>Search is becoming </span>
            <em>an answer.</em>
          </h3>
        </div>
        <p className="ai-field-copy rv" style={{ animationDelay: '0.18s' }}>
          I structure and measure the signals that help brands appear, get cited and understand
          what happens next.
        </p>
      </header>

      <div className="ai-query-field rv" style={{ animationDelay: '0.24s' }}>
        <QueryRow items={AI_QUERY_ROWS[0]} />
        <QueryRow items={AI_QUERY_ROWS[1]} reverse />
        <QueryRow items={AI_QUERY_ROWS[2]} />
      </div>

      <div className="ai-method rv" style={{ animationDelay: '0.3s' }}>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="ai-method-trigger"
          aria-expanded={open}
          aria-controls="ai-method-notes"
        >
          See the method
          <ChevronDown size={15} className={open ? 'rotate-180' : ''} />
        </button>

        <div id="ai-method-notes">
          <Collapse open={open}>
            <div className="ai-method-grid">
              {HOW_ITEMS.map((item, index) => (
                <article key={item.title}>
                  <span className="font-data">0{index + 1}</span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  )
}
