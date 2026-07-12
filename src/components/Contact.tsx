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
      className={`contact-panel w-full px-6 lg:px-12 py-14 md:py-20 text-black rounded-[32px] md:rounded-[48px] mt-16 ${inView ? 'rv-in' : ''}`}
    >
      {/* Marker top-left, matching the other sections */}
      <SectionMarker index={4} label="Contact" />

      <div className="max-w-[900px] mt-10 md:mt-14">
        <h2
          className="rv text-black leading-[1.05] text-[40px] sm:text-[56px] md:text-[68px]"
          style={{ animationDelay: '0.1s' }}
        >
          Let's get your data{' '}
          <span className="font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
            working for you.
          </span>
        </h2>
        <div
          className="rv flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-12 mt-12"
          style={{ animationDelay: '0.2s' }}
        >
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
          <div>
            <p className="text-black/40 text-xs font-medium tracking-[0.2em] uppercase mb-1.5">
              Or drop me a line
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="font-playfair italic text-2xl sm:text-3xl text-black hover:text-[#008f5b] transition-colors"
            >
              {EMAIL}
            </a>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[12px] text-black/40 mt-16 md:mt-20 border-t border-black/10 pt-8">
        <p>© {new Date().getFullYear()} Jabed Ahmed — Data & Analytics Consulting</p>
        <p>30-minute intro call, no obligation.</p>
      </div>
    </section>
  )
}
