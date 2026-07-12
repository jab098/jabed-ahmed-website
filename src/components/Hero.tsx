import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { CALENDLY_URL } from '../data'
import { useMagnetic } from '../hooks'

const PROOF_POINTS = [
  { value: '8+', label: 'years' },
  { value: '16', label: 'markets' },
  { value: '€2M+', label: 'uplift' },
] as const

export function Hero() {
  const ctaMagnet = useMagnetic()

  return (
    <section id="home" className="texture-hero">
      <div className="hero-spectrum" data-hero-texture="spectrum" aria-hidden="true">
        <div className="hero-spectrum-band" />
        <div className="hero-spectrum-veil hero-spectrum-veil-a" />
        <div className="hero-spectrum-veil hero-spectrum-veil-b" />
        <div className="hero-contours" />
        <div className="hero-paper-grain" />
      </div>

      <div className="texture-hero-shell">
        <p className="texture-eyebrow texture-enter texture-enter-1">
          Data collection <span aria-hidden="true">·</span> Experimentation{' '}
          <span aria-hidden="true">·</span> Analytics
        </p>

        <h1 className="texture-heading">
          <span className="texture-heading-line texture-enter texture-enter-2">
            {'Data you can trust. '}
          </span>
          <span className="texture-heading-line texture-enter texture-enter-3">
            <em>Decisions</em> you can defend.
          </span>
        </h1>

        <p className="texture-intro texture-enter texture-enter-4">
          I design reliable tracking, experimentation and reporting systems for ambitious digital
          products.
        </p>

        <div className="texture-actions texture-enter texture-enter-5">
          <a
            ref={ctaMagnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="site-primary-cta"
          >
            <span>Schedule a call</span>
            <span className="site-cta-icon">
              <ArrowUpRight size={17} strokeWidth={2} />
            </span>
          </a>
          <a href="#who" className="texture-secondary-cta">
            See how I work
            <ArrowDown size={15} strokeWidth={1.8} />
          </a>
        </div>
      </div>

      <div className="texture-proof texture-enter texture-enter-6">
        <a href="#who" className="texture-scroll-cue">
          <span>Scroll to explore</span>
          <ArrowDown size={13} strokeWidth={1.7} />
        </a>

        <div
          className="texture-proof-points"
          role="list"
          aria-label="Selected experience highlights"
        >
          {PROOF_POINTS.map((point) => (
            <span key={point.label} className="texture-proof-point" role="listitem">
              <strong>{point.value}</strong>
              <small>{point.label}</small>
            </span>
          ))}
        </div>

        <p className="texture-location">London / working worldwide</p>
      </div>
    </section>
  )
}
