import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { CALENDLY_URL } from '../data'
import { gsap } from '../motion'
import { GlyphReport } from './GlyphReport'

const HERO_LINES = [
  ['Build data systems', ''],
  ['that make the next', ''],
  ['decision obvious.', ' hero-reveal--accent'],
] as const

export function Hero() {
  const rootRef = useRef<HTMLElement>(null)
  const [reportActive, setReportActive] = useState(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let hasRevealed = false
    let revealTimeline: gsap.core.Timeline | undefined

    const context = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>('.hero-reveal')

      gsap.set('.hero-reveal__text', {
        clipPath: 'inset(0 100% 0 0)',
        visibility: 'hidden',
      })
      gsap.set('.hero-reveal__wipe', {
        scaleX: 0,
        xPercent: 0,
        transformOrigin: 'left center',
      })
      gsap.set('.hero-copy__meta, .hero-copy__body, .hero-actions, .hero-copy__foot', {
        opacity: 0,
        y: 18,
      })
      gsap.set('.hero-visual', { clipPath: 'inset(0 100% 0 0)', opacity: 0 })
      gsap.set('.glyph-report', { opacity: 0 })

      if (reduced) {
        gsap.set('.hero-reveal__text', { clipPath: 'inset(0)', visibility: 'visible' })
        gsap.set('.hero-reveal__wipe', { display: 'none' })
        gsap.set('.hero-copy__meta, .hero-copy__body, .hero-actions, .hero-copy__foot', {
          opacity: 1,
          y: 0,
        })
        gsap.set('.hero-visual', { clipPath: 'inset(0)', opacity: 1 })
        gsap.set('.glyph-report', { opacity: 1 })
        setReportActive(true)
        hasRevealed = true
        return
      }

      revealTimeline = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })

      lines.forEach((line, index) => {
        const text = line.querySelector<HTMLElement>('.hero-reveal__text')
        const signal = line.querySelector<HTMLElement>('[data-hero-wipe="signal"]')
        const paper = line.querySelector<HTMLElement>('[data-hero-wipe="paper"]')
        if (!text || !signal || !paper) return
        const start = index * 0.19

        revealTimeline
          ?.to(signal, { scaleX: 1, duration: 0.48 }, start)
          .to(paper, { scaleX: 1, duration: 0.42 }, start + 0.16)
          .set(text, { clipPath: 'inset(0)', visibility: 'visible' }, start + 0.48)
          .to(paper, { xPercent: 102, duration: 0.56 }, start + 0.55)
          .to(signal, { xPercent: 102, duration: 0.58 }, start + 0.61)
          .set(text, { clipPath: 'none' }, start + 1.21)
          .set([signal, paper], { display: 'none' }, start + 1.21)
      })

      revealTimeline
        .to(
          '.hero-copy__meta, .hero-copy__body, .hero-actions, .hero-copy__foot',
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.07, ease: 'power4.out' },
          0.72,
        )
        .to(
          '.hero-visual',
          { clipPath: 'inset(0)', opacity: 1, duration: 1.25, ease: 'power2.inOut' },
          0.7,
        )
        .call(() => setReportActive(true), [], 0.98)
        .to('.glyph-report', { opacity: 1, duration: 0.8, ease: 'power3.out' }, 1.02)
    }, root)

    const reveal = () => {
      if (hasRevealed) return
      hasRevealed = true
      revealTimeline?.play(0)
    }

    if (!reduced) {
      if (document.documentElement.classList.contains('loader-complete')) reveal()
      else window.addEventListener('site:loader-complete', reveal, { once: true })
    }

    return () => {
      window.removeEventListener('site:loader-complete', reveal)
      context.revert()
    }
  }, [])

  return (
    <section ref={rootRef} id="home" className="hero-section" data-scroll-waypoint="home">
      <div className="hero-copy">
        <p className="hero-copy__meta">DATA SYSTEMS / EXPERIMENTATION / DECISION DESIGN</p>
        <h1 aria-label="Build data systems that make the next decision obvious.">
          {HERO_LINES.map(([line, modifier]) => (
            <span className={`hero-reveal${modifier}`} data-fit-content-reveal key={line}>
              <span className="hero-reveal__text" data-reveal-safe="true">{line}</span>
              <i className="hero-reveal__wipe hero-reveal__wipe--signal" data-hero-wipe="signal" aria-hidden="true" />
              <i className="hero-reveal__wipe hero-reveal__wipe--paper" data-hero-wipe="paper" aria-hidden="true" />
            </span>
          ))}
        </h1>
        <p className="hero-copy__body">
          <strong>I build tracking and data-collection systems.</strong>{' '}
          Then I turn every critical signal into evidence product, growth and leadership teams can
          use with confidence.
        </p>
        <div className="hero-actions">
          <a className="rect-cta rect-cta--signal" href={CALENDLY_URL} target="_blank" rel="noreferrer">
            <span>Schedule a call</span><ArrowUpRight aria-hidden="true" />
          </a>
          <a className="rect-cta rect-cta--ghost" href="#process">
            <span>See how I work</span><ArrowDown aria-hidden="true" />
          </a>
        </div>
        <div className="hero-copy__foot">
          <span>Independent consultant</span>
          <span>London / Worldwide</span>
        </div>
      </div>
      <div
        className="hero-visual"
        data-hero-visual-entrance="soft"
        data-scroll-waypoint-mobile="hero-report"
      >
        <GlyphReport active={reportActive} />
      </div>
      <a className="hero-scroll" href="#proof" aria-label="Scroll to proof">
        <span>SCROLL</span><ArrowDown aria-hidden="true" />
      </a>
    </section>
  )
}
