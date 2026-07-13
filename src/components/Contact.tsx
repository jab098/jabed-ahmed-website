import { ArrowUpRight } from 'lucide-react'
import { CALENDLY_URL, EMAIL } from '../data'
import { useMagnetic, useReveal } from '../hooks'
import { SectionMarker } from './SectionMarker'

export function Contact() {
  const magnet = useMagnetic()
  const { ref, inView } = useReveal<HTMLElement>()
  return (
    <section
      ref={ref}
      id="contact"
      className={`contact-panel w-full text-black mt-16 ${inView ? 'rv-in' : ''}`}
    >
      <header className="contact-topline">
        <SectionMarker index={4} label="Contact" />
        <p className="contact-consulting rv" style={{ animationDelay: '0.08s' }}>
          <span />
          Independent consulting · London / worldwide
        </p>
      </header>

      <div className="contact-layout">
        <div className="contact-message">
          <h2 className="rv" style={{ animationDelay: '0.1s' }}>
            Let's get your data <span className="font-playfair italic">working for you.</span>
          </h2>
          <p className="rv contact-intro" style={{ animationDelay: '0.18s' }}>
            Bring the measurement problem. We’ll use the first call to clarify the decision, the
            evidence required and the most useful next step.
          </p>
        </div>

        <div className="rv contact-actions" style={{ animationDelay: '0.24s' }}>
          <p className="contact-action-label">Start with a 30-minute intro</p>
          <a
            ref={magnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="site-primary-cta self-start"
          >
            <span>Schedule a call</span>
            <span className="site-cta-icon">
              <ArrowUpRight size={17} strokeWidth={2} />
            </span>
          </a>

          <div className="contact-email">
            <p>Prefer email?</p>
            <a
              href={`mailto:${EMAIL}`}
              className="font-playfair italic"
            >
              {EMAIL}
            </a>
          </div>
        </div>
      </div>

      <footer className="contact-footer">
        <p>© {new Date().getFullYear()} Jabed Ahmed — Data & Analytics Consulting</p>
        <p>30-minute intro call, no obligation.</p>
      </footer>
    </section>
  )
}
