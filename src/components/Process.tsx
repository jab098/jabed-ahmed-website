import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { PROCESS_STEPS } from '../data'
import { gsap, ScrollTrigger } from '../motion'

const PROCESS_SCROLL_PROGRESS = [0.08, 0.34, 0.6, 0.86] as const

function ProcessVisual({ index }: { index: number }) {
  const step = PROCESS_STEPS[index]

  return (
    <figure className={`process-visual process-visual--${index + 1}`} aria-label={step.visual}>
      <figcaption>{step.visual}</figcaption>
      {index === 0 && (
        <div className="audit-visual" aria-hidden="true">
          <div className="audit-visual__score">
            <span>TRUST SCORE</span>
            <div className="audit-visual__value">
              <strong>62</strong><i className="audit-visual__denominator">/100</i>
            </div>
          </div>
          {['Identity coverage', 'Event consistency', 'Consent integrity', 'Decision readiness'].map((label, row) => (
            <div className="audit-visual__row" key={label}>
              <span>{`0${row + 1}`}</span><b>{label}</b><i style={{ '--score': `${46 + row * 13}%` } as CSSProperties} />
            </div>
          ))}
          <div className="audit-visual__summary" data-audit-summary>
            <div><span>Signals checked</span><strong>04</strong></div>
            <div><span>Blockers</span><strong>02</strong></div>
            <div><span>Next action</span><strong>Fix identity joins</strong></div>
          </div>
        </div>
      )}
      {index === 1 && (
        <div className="architecture-visual" aria-hidden="true">
          <svg
            className="architecture-visual__connectors"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            data-event-connectors
          >
            <path d="M 12 20 L 26 72" />
            <path d="M 26 72 L 52 44" />
            <path d="M 52 44 L 79 17" />
            <path d="M 79 17 L 89 81" />
          </svg>
          {['PRODUCT', 'CONSENT', 'COLLECT', 'MODEL', 'DECIDE'].map((label, node) => (
            <div className={`architecture-visual__node architecture-visual__node--${node + 1}`} key={label}>
              <span>0{node + 1}</span><b>{label}</b>
            </div>
          ))}
        </div>
      )}
      {index === 2 && (
        <div className="matrix-visual" aria-hidden="true">
          <div className="matrix-visual__head"><span>EVENT</span><span>SCHEMA</span><span>CONSENT</span><span>VALUE</span></div>
          {['view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'experiment_view'].map((event, row) => (
            <div className="matrix-visual__row" key={event}>
              <b>{event}</b>
              {[0, 1, 2].map((cell) => <i className={(row + cell) % 4 === 0 ? 'is-checking' : ''} key={cell}>{(row + cell) % 4 === 0 ? '···' : '✓'}</i>)}
            </div>
          ))}
        </div>
      )}
      {index === 3 && (
        <div className="brief-visual" data-release-decision aria-hidden="true">
          <div className="brief-visual__top"><span>DECISION / 04</span><span>READY TO SHIP</span></div>
          <strong>Ship the<br />winning system.</strong>
          <div className="brief-visual__decision">
            <div className="brief-visual__chart" data-release-comparison>
              <div className="brief-visual__chart-head"><span>OBSERVED OUTCOME</span><span>8 WEEK READ</span></div>
              <svg viewBox="0 0 520 176" preserveAspectRatio="none">
                <g className="brief-visual__grid">
                  <path d="M0 44H520M0 88H520M0 132H520" />
                  <path d="M104 0V176M208 0V176M312 0V176M416 0V176" />
                </g>
                <path className="brief-visual__control" d="M0 138C76 134 121 122 177 124S289 116 352 112s112-18 168-16" />
                <path className="brief-visual__winner" d="M0 138C72 136 119 126 177 118s96-21 148-32 116-34 195-65" />
                <circle className="brief-visual__winner-dot" cx="520" cy="21" r="6" />
              </svg>
              <div className="brief-visual__legend">
                <span><i />CONTROL / 100</span>
                <span><i />WINNER B / 118.4</span>
              </div>
            </div>
            <div className="brief-visual__metrics">
              <div><span>MEASURED LIFT</span><b>+18.4%</b></div>
              <div><span>CONFIDENCE</span><b>96%</b></div>
              <div><span>ROLLOUT</span><b>100%</b></div>
            </div>
          </div>
          <div className="brief-visual__guardrails">
            <strong>Guardrails stable</strong><span>REVENUE ✓</span><span>QUALITY ✓</span>
          </div>
          <div className="brief-visual__handoff">
            <div><span>01</span><b>Evidence</b><small>Validated lift</small></div>
            <div><span>02</span><b>Decision</b><small>Ship variant B</small></div>
            <div><span>03</span><b>Owner</b><small>Growth + data</small></div>
          </div>
        </div>
      )}
    </figure>
  )
}

export function Process() {
  const [activeStep, setActiveStep] = useState(0)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches,
  )
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || navigator.userAgent.includes('jsdom')) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      gsap.fromTo(
        '.process-intro__line > span',
        { yPercent: 110 },
        {
          yPercent: 0,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.process-intro', start: 'top 68%', end: 'bottom 60%', scrub: 0.7 },
        },
      )

      if (stage && !reduced && !isMobile) {
        ScrollTrigger.create({
          id: 'process-pin',
          trigger: stage,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: ({ progress }) => {
            setActiveStep(Math.min(PROCESS_STEPS.length - 1, Math.floor(progress * PROCESS_STEPS.length)))
          },
        })
      }
    }, root)

    return () => context.revert()
  }, [isMobile])

  return (
    <section ref={rootRef} id="process" className="process-section" aria-labelledby="process-title">
      <header className="process-intro" data-scroll-waypoint="process-heading">
        <p className="eyebrow">// How I work</p>
        <h2 id="process-title" aria-label="How I turn uncertainty into a working data system.">
          <span className="process-intro__line"><span>How I turn</span></span>
          <span className="process-intro__line"><span>uncertainty into a</span></span>
          <span className="process-intro__line process-intro__line--accent"><span>working data system.</span></span>
        </h2>
        <p className="process-intro__aside">Four disciplined moves. One system your team can trust, use and improve.</p>
      </header>

      {isMobile ? (
        <div className="process-mobile" aria-label="Process stages">
          {PROCESS_STEPS.map((step, index) => (
            <article
              className="process-mobile__scene"
              data-scroll-waypoint-mobile={`process-0${index + 1}`}
              key={step.number}
            >
              <div className="process-mobile__copy">
                <span>{step.number} / 04</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
              <div className="process-mobile__display">
                <ProcessVisual index={index} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div ref={stageRef} className="process-stage process-stage--desktop">
          <div className="process-stage__rail">
            <p className="eyebrow">// The method</p>
            <div className="process-tabs" role="group" aria-label="Process stages">
              {PROCESS_STEPS.map((step, index) => (
                <button
                  type="button"
                  key={step.number}
                  className={activeStep === index ? 'is-active' : ''}
                  aria-pressed={activeStep === index}
                  aria-label={`${step.number} ${step.title}`}
                  data-scroll-virtual={`process-0${index + 1}`}
                  data-scroll-trigger="process-pin"
                  data-scroll-progress={PROCESS_SCROLL_PROGRESS[index]}
                  onClick={() => setActiveStep(index)}
                >
                  <span>{step.number}</span>
                  <strong>{step.title}</strong>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="process-stage__copy" key={`copy-${activeStep}`}>
              <span>{PROCESS_STEPS[activeStep].number} / 04</span>
              <p>{PROCESS_STEPS[activeStep].copy}</p>
            </div>
          </div>
          <div className="process-stage__display" key={`visual-${activeStep}`}>
            <ProcessVisual index={activeStep} />
          </div>
          <div className="process-stage__progress" aria-hidden="true"><i style={{ transform: `scaleX(${(activeStep + 1) / 4})` }} /></div>
        </div>
      )}
    </section>
  )
}
