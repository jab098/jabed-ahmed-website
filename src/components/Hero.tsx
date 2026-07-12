import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { CALENDLY_URL } from '../data'
import { useMagnetic } from '../hooks'
import { LogoMark } from './LogoMark'

const FLOW_PATHS = [
  { id: 'page-view', path: 'M46 168 C142 168 190 246 282 298', duration: '6.8s', delay: '-1.2s' },
  { id: 'consent', path: 'M52 320 C154 320 202 320 282 320', duration: '5.6s', delay: '-3.8s' },
  { id: 'experiment', path: 'M94 512 C180 476 220 396 290 348', duration: '7.4s', delay: '-5.1s' },
  { id: 'quality', path: 'M358 292 C438 238 484 154 586 126', duration: '7s', delay: '-2.6s' },
  { id: 'decision', path: 'M362 320 C450 320 500 320 602 320', duration: '5.8s', delay: '-4.5s' },
  { id: 'revenue', path: 'M354 350 C442 398 486 490 578 526', duration: '7.8s', delay: '-6.2s' },
] as const

const STATIC_NODES = [
  [104, 187],
  [176, 238],
  [132, 320],
  [208, 320],
  [156, 476],
  [226, 406],
  [438, 238],
  [504, 166],
  [446, 320],
  [530, 320],
  [430, 396],
  [506, 484],
] as const

const PROOF_POINTS = [
  { value: '8+', label: 'years' },
  { value: '16', label: 'markets' },
  { value: '€2M+', label: 'uplift' },
] as const

function SignalLabel({
  className,
  name,
  value,
}: {
  className: string
  name: string
  value: string
}) {
  return (
    <div className={`signal-label ${className}`}>
      <span className="signal-label-dot" />
      <span>
        <strong>{name}</strong>
        <small>{value}</small>
      </span>
    </div>
  )
}

function SignalSystem() {
  return (
    <div className="signal-system" data-hero-system="signal-network" aria-hidden="true">
      <div className="signal-system-grid" />
      <div className="signal-system-glow" />
      <div className="signal-scan" />

      <svg className="signal-map" viewBox="0 0 640 640" role="presentation">
        <defs>
          <radialGradient id="signalNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#00df8e" stopOpacity="0.75" />
            <stop offset="1" stopColor="#00df8e" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="signal-map-crosshair">
          <path d="M320 42 V598" />
          <path d="M42 320 H598" />
        </g>

        <g className="signal-map-rings">
          <circle cx="320" cy="320" r="116" />
          <circle cx="320" cy="320" r="176" />
          <circle cx="320" cy="320" r="246" />
        </g>

        <g className="signal-map-flows">
          {FLOW_PATHS.map((flow) => (
            <path key={flow.id} d={flow.path} pathLength="1" />
          ))}
        </g>

        <g className="signal-map-nodes">
          {STATIC_NODES.map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="11" fill="url(#signalNodeGlow)" />
              <circle cx={cx} cy={cy} r="2.5" />
            </g>
          ))}
        </g>

        {FLOW_PATHS.map((flow, index) => (
          <circle
            key={`packet-${flow.id}`}
            r={index % 2 === 0 ? 4.5 : 3.5}
            className={`signal-packet signal-packet-${index + 1}`}
          >
            <animateMotion
              path={flow.path}
              dur={flow.duration}
              begin={flow.delay}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      <div className="signal-orbit signal-orbit-one">
        <span />
      </div>
      <div className="signal-orbit signal-orbit-two">
        <span />
      </div>

      <div className="signal-core">
        <span className="signal-core-pulse" />
        <div className="signal-core-mark">
          <LogoMark size={27} className="text-[#00df8e]" />
        </div>
        <span className="signal-core-kicker">Measurement</span>
        <strong>Trusted signal</strong>
        <span className="signal-core-meta">LIVE / 01</span>
      </div>

      <SignalLabel className="signal-label-page" name="page_view" value="captured" />
      <SignalLabel className="signal-label-consent" name="consent" value="granted" />
      <SignalLabel className="signal-label-test" name="experiment" value="variant_b" />
      <SignalLabel className="signal-label-quality" name="quality" value="99.98%" />
      <SignalLabel className="signal-label-decision" name="decision" value="ready" />
      <SignalLabel className="signal-label-revenue" name="revenue" value="+€2.0M" />

      <div className="signal-live-status">
        <span />
        system online
      </div>
    </div>
  )
}

export function Hero() {
  const ctaMagnet = useMagnetic()

  return (
    <section id="home" className="signal-hero">
      <div className="signal-hero-aurora" aria-hidden="true" />
      <div className="signal-hero-grid" aria-hidden="true" />

      <div className="signal-hero-shell">
        <div className="signal-hero-content">
          <p className="signal-eyebrow signal-enter signal-enter-1">
            <span className="signal-eyebrow-dot" />
            Independent data &amp; analytics consultant
          </p>

          <h1 className="signal-heading">
            <span className="signal-heading-line signal-enter signal-enter-2">
              {'Make every '}
            </span>
            <span className="signal-heading-line signal-enter signal-enter-3">
              <em>signal</em> count.
            </span>
          </h1>

          <p className="signal-intro signal-enter signal-enter-4">
            I build the measurement systems behind confident product decisions — from the first
            event to the final dashboard.
          </p>

          <div className="signal-actions signal-enter signal-enter-5">
            <a
              ref={ctaMagnet.ref}
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="signal-primary-cta"
            >
              <span>Schedule a call</span>
              <span className="signal-cta-icon">
                <ArrowUpRight size={17} strokeWidth={2} />
              </span>
            </a>
            <a href="#who" className="signal-secondary-cta">
              Explore the system
              <ArrowDown size={15} strokeWidth={1.8} />
            </a>
          </div>
        </div>

        <div className="signal-system-wrap signal-enter signal-enter-6">
          <SignalSystem />
        </div>
      </div>

      <div className="signal-proof signal-enter signal-enter-7">
        <a href="#who" className="signal-scroll-cue">
          <span>Scroll to explore</span>
          <ArrowDown size={13} strokeWidth={1.7} />
        </a>

        <div
          className="signal-proof-points"
          role="list"
          aria-label="Selected experience highlights"
        >
          {PROOF_POINTS.map((point) => (
            <span key={point.label} className="signal-proof-point" role="listitem">
              <strong>{point.value}</strong>
              <small>{point.label}</small>
            </span>
          ))}
        </div>

        <p className="signal-location">London / working worldwide</p>
      </div>
    </section>
  )
}
