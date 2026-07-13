import { useState } from 'react'
import type { ReactNode } from 'react'
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

function Collapse({
  id,
  open,
  children,
}: {
  id: string
  open: boolean
  children: ReactNode
}) {
  return (
    <div
      id={id}
      className="ai-method-collapse"
      data-open={open}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="ai-method-collapse-inner">{children}</div>
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
  const { ref, inView } = useReveal<HTMLElement>(0.08)

  return (
    <section
      ref={ref}
      id="ai-search"
      className={`ai-field ${inView ? 'rv-in' : ''}`}
      data-ai-stage="answer-field"
      aria-labelledby="ai-field-title"
    >
      <div className="ai-field-material" aria-hidden="true">
        <span className="ai-field-wash" />
        <span className="ai-field-lines" />
      </div>

      <header className="ai-field-header">
        <div>
          <p className="ai-field-kicker rv">AI search / emerging channel</p>
          <h3 id="ai-field-title" className="rv" style={{ animationDelay: '0.1s' }}>
            <span>Search is becoming </span>
            <em>an answer.</em>
          </h3>
        </div>
        <p className="ai-field-copy rv" style={{ animationDelay: '0.18s' }}>
          I structure and measure the signals that help brands appear, get cited and understand
          what happens next.
        </p>
      </header>

      <p className="sr-only">
        Example question themes include measurement architecture, experimentation, consent,
        analytics quality and AI-search attribution.
      </p>
      <div
        className="ai-query-field rv"
        style={{ animationDelay: '0.24s' }}
        aria-hidden="true"
      >
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

        <Collapse id="ai-method-notes" open={open}>
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
    </section>
  )
}
