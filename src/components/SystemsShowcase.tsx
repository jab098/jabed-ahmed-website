import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SYSTEMS } from '../data'
import {
  gsap,
  HEADLINE_SCRUB,
  navigationEdgeScrollPosition,
  settleHeadlineReveal,
} from '../motion'
import { useAutoAdvance } from '../useAutoAdvance'
import { useReducedMotion } from '../useReducedMotion'

/** Four cards plus the `Build yours.` bridge, which stays in the rotation. */
const SLIDE_COUNT = SYSTEMS.length + 1
const TRACK_INSET_RATIO = 0.04

function SystemGraphic({ index }: { index: number }) {
  const reducedMotion = useReducedMotion()
  if (index === 0) {
    return (
      <div className="system-graphic measurement-map" data-measurement-architecture aria-hidden="true">
        <div className="measurement-map__head"><span>MEASUREMENT ARCHITECTURE / 42 EVENTS</span><span>DEMO</span></div>
        <svg viewBox="0 0 700 500" preserveAspectRatio="none">
          <g className="measurement-map__grid"><path d="M0 100H700M0 200H700M0 300H700M0 400H700" /><path d="M140 0V500M280 0V500M420 0V500M560 0V500" /></g>
          <g className="measurement-map__routes">
            <path d="M105 126L281 247" /><path d="M105 374L281 247" /><path d="M105 250H281" />
            <path d="M351 247L520 111" /><path d="M351 247L520 247" /><path d="M351 247L520 385" />
            <path d="M281 247H351" />
          </g>
          {!reducedMotion && <>
            <circle className="measurement-map__packet packet-1" cx="0" cy="0" r="7"><animateMotion dur="3.2s" repeatCount="indefinite" path="M105 126L281 247H351L520 111" /></circle>
            <circle className="measurement-map__packet packet-2" cx="0" cy="0" r="5"><animateMotion begin="1.2s" dur="3.2s" repeatCount="indefinite" path="M105 374L281 247H351L520 385" /></circle>
          </>}
        </svg>
        <div className="measurement-map__node node-product"><span>01</span><b>PRODUCT</b><small>WEB / APP</small></div>
        <div className="measurement-map__node node-crm"><span>02</span><b>CRM</b><small>IDENTITY</small></div>
        <div className="measurement-map__node node-media"><span>03</span><b>MEDIA</b><small>ACQUISITION</small></div>
        <div className="measurement-map__node measurement-map__contract"><span>04</span><b>EVENT CONTRACT</b><small>SCHEMA + CONSENT</small></div>
        <div className="measurement-map__node node-warehouse"><span>05</span><b>WAREHOUSE</b><small>MODELLING</small></div>
        <div className="measurement-map__node node-bi"><span>06</span><b>BI</b><small>DECISIONS</small></div>
        <div className="measurement-map__node node-activate"><span>07</span><b>ACTIVATE</b><small>AUDIENCES</small></div>
        <div className="measurement-map__foot"><span>QUALITY GATE / PASS</span><strong>99.2%</strong></div>
      </div>
    )
  }

  if (index === 1) {
    return (
      <div className="system-graphic experiment-graphic" aria-hidden="true">
        <div className="experiment-graphic__control"><span>CONTROL</span><strong>100</strong></div>
        <div className="experiment-graphic__variant"><span>VARIANT B</span><strong>118.4</strong></div>
        <div className="experiment-graphic__lift">+18.4%<small>CONFIDENCE / 97%</small></div>
      </div>
    )
  }

  if (index === 2) {
    return (
      <div className="system-graphic pipeline-graphic" data-consent-pipeline aria-hidden="true">
        <div className="pipeline-graphic__head"><span>CONSENTED EVENT ROUTE / EU</span><b>99.2% VALID</b></div>
        <svg viewBox="0 0 700 430" preserveAspectRatio="none">
          <g className="pipeline-graphic__routes">
            <path d="M86 112H229" /><path d="M271 112H390" /><path d="M430 112H574" />
            <path d="M250 140V304" /><path d="M410 140V304" /><path d="M430 326H574" />
          </g>
          <path className="pipeline-graphic__route-active" d="M86 112H410V326H574" />
          {!reducedMotion && <circle className="pipeline-graphic__packet" cx="0" cy="0" r="7">
            <animateMotion dur="2.8s" repeatCount="indefinite" path="M86 112H410V326H574" />
          </circle>}
        </svg>
        <div className="pipeline-graphic__node node-browser"><span>01</span><b>BROWSER</b><small>EVENT</small></div>
        <div className="pipeline-graphic__node node-consent"><span>02</span><b>CONSENT</b><small>POLICY GATE</small></div>
        <div className="pipeline-graphic__node node-collect"><span>03</span><b>COLLECT</b><small>SERVER</small></div>
        <div className="pipeline-graphic__node node-vault"><span>04</span><b>VAULT</b><small>RAW / 30D</small></div>
        <div className="pipeline-graphic__node node-hold"><span>02B</span><b>HOLD</b><small>NO CONSENT</small></div>
        <div className="pipeline-graphic__node node-model"><span>05</span><b>MODEL</b><small>ENRICH</small></div>
        <div className="pipeline-graphic__node node-decide"><span>06</span><b>DECIDE</b><small>ACTIVATE</small></div>
        <div className="pipeline-graphic__legend"><span><i />CONSENTED</span><span><i />QUARANTINED</span><strong>18.4K / MIN</strong></div>
      </div>
    )
  }

  return (
    <div className="system-graphic dashboard-graphic" aria-hidden="true">
      <div className="dashboard-graphic__head"><span>OUTCOME LAYER</span><span>DEMO / 16 MARKETS</span></div>
      <div className="dashboard-graphic__metric"><span>CONVERSION VALUE</span><strong>€2.04M</strong><i>↑ 12.8%</i></div>
      <div className="dashboard-graphic__bars">
        {[44, 68, 52, 81, 74, 94, 62, 88].map((value) => <i key={value} style={{ '--height': `${value}%` } as CSSProperties} />)}
      </div>
      <div className="dashboard-graphic__foot"><span>UK</span><span>DE</span><span>FR</span><span>NL</span><span>+12</span></div>
    </div>
  )
}

export function SystemsShowcase() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [trackOffset, setTrackOffset] = useState(0)
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const swipeRef = useRef<{ x: number, y: number } | null>(null)

  const playback = useAutoAdvance(
    stageRef,
    useCallback(() => setActiveSlide((slide) => (slide + 1) % SLIDE_COUNT), []),
  )

  const selectSlide = (slide: number) => {
    setActiveSlide((slide + SLIDE_COUNT) % SLIDE_COUNT)
    playback.pause()
  }

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      const slide = track.children[activeSlide] as HTMLElement | undefined
      if (!slide) return
      const inset = window.innerWidth * TRACK_INSET_RATIO
      const travel = Math.max(0, track.scrollWidth - window.innerWidth + inset)
      setTrackOffset(Math.min(Math.max(0, slide.offsetLeft - inset), travel))
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeSlide])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.05 })

    root.querySelectorAll('.system-card').forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || navigator.userAgent.includes('jsdom')) return

    const headlineLines = root.querySelectorAll<HTMLElement>('.systems-heading__line > span')
    const context = gsap.context(() => {
      gsap.fromTo(headlineLines, { yPercent: 110 }, {
        yPercent: 0,
        stagger: 0.08,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '.systems-header',
          start: 'top 70%',
          end: navigationEdgeScrollPosition,
          scrub: HEADLINE_SCRUB,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            settleHeadlineReveal(headlineLines, progress)
          },
        },
      })
    }, root)

    return () => context.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      id="systems"
      className="systems-section"
      aria-labelledby="systems-title"
      data-scroll-scene="systems"
    >
      <header className="systems-header" data-scroll-waypoint="systems-heading">
        <p className="eyebrow">// Working systems</p>
        <h2 id="systems-title" aria-label="Selected systems.">
          <span className="systems-heading__line"><span>Selected</span></span>
          <span className="systems-heading__line systems-heading__line--signal"><span>systems.</span></span>
        </h2>
        <p>Representative system / not client work</p>
      </header>

      <div
        ref={stageRef}
        className="systems-stage"
        data-scroll-frame="viewport"
        data-scroll-waypoint="systems-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label="System demonstrations"
      >
        <div className="systems-stage__topline">
          <span aria-live={playback.paused ? 'polite' : 'off'}>{activeSlide === SYSTEMS.length ? 'FINALE' : `EXAMPLE 0${activeSlide + 1} / 0${SYSTEMS.length}`}</span>
          <div className="systems-stage__controls">
            <button type="button" aria-label="Previous example" onClick={() => selectSlide(activeSlide - 1)}><ChevronLeft aria-hidden="true" /></button>
            <button type="button" data-sequence-control disabled={playback.reducedMotion}
              aria-label={playback.paused ? 'Resume examples' : 'Pause examples'}
              onClick={playback.paused ? playback.resume : playback.pause}>
              {playback.reducedMotion ? 'Manual' : playback.paused ? 'Play' : 'Pause'}
            </button>
            <button type="button" aria-label="Next example" onClick={() => selectSlide(activeSlide + 1)}><ChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        <div
          ref={trackRef}
          className="systems-track"
          style={{ transform: `translate3d(${-trackOffset}px, 0, 0)` }}
          onPointerDown={(event) => {
            if (event.pointerType === 'mouse') return
            swipeRef.current = { x: event.clientX, y: event.clientY }
          }}
          onPointerCancel={() => { swipeRef.current = null }}
          onPointerUp={(event) => {
            const start = swipeRef.current
            swipeRef.current = null
            if (!start) return
            const dx = event.clientX - start.x
            const dy = event.clientY - start.y
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
              selectSlide(activeSlide + (dx < 0 ? 1 : -1))
            }
          }}
        >
          {SYSTEMS.map((system, index) => (
            <article
              className="system-card"
              data-active={activeSlide === index ? 'true' : undefined}
              aria-current={activeSlide === index ? 'true' : undefined}
              key={system.number}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${SYSTEMS.length}: ${system.title}`}
              inert={activeSlide !== index}
            >
              <div className="system-card__visual"><SystemGraphic index={index} /></div>
              <div className="system-card__body">
                <span className="system-card__number">{system.number}</span>
                <span className="system-card__demo">SIMULATED DATA</span>
                <h3>{system.title}</h3>
                <strong className="system-card__metric">{system.metric}</strong>
                <p>{system.summary}</p>
                <div className="system-card__tags">{system.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>
            </article>
          ))}
          <div
            className="systems-track__end"
            data-active={activeSlide === SYSTEMS.length ? 'true' : undefined}
            inert={activeSlide !== SYSTEMS.length}
          ><span>NEXT</span><strong>Build <em data-scroll-flash="early-tight">yours.</em></strong><a href="#contact">Start a conversation →</a></div>
        </div>
        <div className="systems-stage__selector" role="group" aria-label="Choose example">
          {SYSTEMS.map((system, index) => <button key={system.number} type="button"
            aria-label={`Show ${system.title}`} aria-pressed={activeSlide === index}
            onClick={() => selectSlide(index)}>{system.number}</button>)}
          <button type="button" aria-label="Show finale" aria-pressed={activeSlide === SYSTEMS.length}
            onClick={() => selectSlide(SYSTEMS.length)}>END</button>
        </div>
      </div>
    </section>
  )
}
