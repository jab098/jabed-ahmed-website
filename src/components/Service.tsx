import { useState } from 'react'
import { ArrowDownRight } from 'lucide-react'
import { SERVICES, TOOL_NAMES } from '../data'
import { useReveal } from '../hooks'
import { SectionMarker } from './SectionMarker'

function ToolRibbon() {
  return (
    <div className="capability-tools" aria-label="Platforms and tools I work with">
      <div className="capability-tools-heading">
        <span>Selected tools</span>
        <span>{TOOL_NAMES.length} platforms across the stack</span>
      </div>
      <p className="sr-only">{TOOL_NAMES.join(', ')}</p>
      <div className="tool-ribbon" aria-hidden="true">
        <div className="tool-ribbon-track">
          {[0, 1].map((copy) => (
            <div className="tool-ribbon-group" key={copy}>
              {TOOL_NAMES.map((tool) => (
                <span key={tool}>
                  {tool}
                  <i>✦</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CapabilityRow({
  service,
  active,
  onSelect,
}: {
  service: (typeof SERVICES)[number]
  active: boolean
  onSelect: () => void
}) {
  const triggerId = `capability-trigger-${service.number}`
  const detailId = `capability-detail-${service.number}`

  return (
    <article className={`capability-row ${active ? 'is-active' : ''}`}>
      <button
        id={triggerId}
        type="button"
        className="capability-trigger"
        aria-expanded={active}
        aria-controls={detailId}
        onClick={onSelect}
        onMouseEnter={onSelect}
        onFocus={onSelect}
      >
        <span className="capability-number font-data">{service.number}</span>
        <span className="capability-title-block">
          <small>{service.overline}</small>
          <span className="capability-title">{service.headline}</span>
        </span>
        <service.icon className="capability-icon" size={23} strokeWidth={1.65} />
        <span className="capability-arrow" aria-hidden="true">
          <ArrowDownRight size={18} strokeWidth={1.8} />
        </span>
      </button>

      <div
        id={detailId}
        className="capability-detail"
        data-open={active}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!active}
        inert={!active}
      >
        <div>
          <div className="capability-detail-inner">
            <p>{service.blurb}</p>
            <div className="capability-stack" aria-label={`${service.headline} technologies`}>
              {service.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function Service() {
  const [active, setActive] = useState(0)
  const { ref, inView } = useReveal<HTMLElement>(0.08)

  return (
    <section
      ref={ref}
      id="service"
      data-service-layout="capability-index"
      className={`capability-section paper-section ${inView ? 'rv-in' : ''}`}
    >
      <div className="capability-material" aria-hidden="true">
        <span />
      </div>

      <div className="capability-layout">
        <aside className="capability-intro">
          <SectionMarker index={3} label="Capabilities" />
          <h2 className="rv capability-heading" style={{ animationDelay: '0.1s' }}>
            <span>Six capabilities. </span>
            <em>One connected system.</em>
          </h2>
          <p className="rv capability-copy" style={{ animationDelay: '0.2s' }}>
            From the first event to the final decision, every layer is designed to work together —
            accurately, responsibly and at scale.
          </p>
          <div className="rv capability-flow" style={{ animationDelay: '0.3s' }} aria-hidden="true">
            <span>Capture</span>
            <i />
            <span>Connect</span>
            <i />
            <span>Learn</span>
          </div>
        </aside>

        <div className="capability-index" role="list">
          {SERVICES.map((service, index) => (
            <div key={service.number} role="listitem">
              <CapabilityRow
                service={service}
                active={active === index}
                onSelect={() => setActive(index)}
              />
            </div>
          ))}
        </div>
      </div>

      <ToolRibbon />
    </section>
  )
}
