import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { CALENDLY_URL, EMAIL, LINKEDIN_URL } from '../data'
import {
  gsap,
  HEADLINE_SCRUB,
  navigationEdgeScrollPosition,
  settleHeadlineReveal,
} from '../motion'
import { FooterGlyphStream } from './FooterGlyphStream'

export function Contact() {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || navigator.userAgent.includes('jsdom')) return
    const headlineLines = root.querySelectorAll<HTMLElement>('.contact-line > span')
    const context = gsap.context(() => {
      gsap.fromTo(headlineLines, { yPercent: 110 }, {
        yPercent: 0,
        stagger: 0.08,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: root,
          start: 'top 68%',
          end: navigationEdgeScrollPosition,
          scrub: HEADLINE_SCRUB,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            settleHeadlineReveal(headlineLines, progress)
          },
        },
      })
      gsap.fromTo('.contact-actions-new', { opacity: 0, y: 34 }, {
        opacity: 1,
        y: 0,
        scrollTrigger: { trigger: root, start: 'top 42%' },
        duration: 0.8,
      })
      gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 88%', end: 'top 74%', scrub: 0.2 },
      })
        .to('.contact-flash-word', { color: '#ff5a1f', duration: 0.2, ease: 'power3.inOut' })
        .to('.contact-flash-word', { color: '#ff5a1f', duration: 0.12, ease: 'none' })
        .to('.contact-flash-word', { color: '#11100f', duration: 0.24, ease: 'power3.inOut' })
    }, root)
    return () => context.revert()
  }, [])

  return (
    <>
      <section
        ref={rootRef}
        id="contact"
        className="contact-section"
        aria-labelledby="contact-title"
        data-scroll-scene="contact"
        data-scroll-waypoint="contact"
      >
        <div className="contact-topline-new">
          <span>// Start a conversation</span>
          <span>Independent consulting · London / worldwide</span>
        </div>
        <h2 id="contact-title" aria-label="Ready to make your data useful?">
          <span className="contact-line"><span>Ready to make</span></span>
          <span className="contact-line"><span><span className="contact-flash-word" data-scroll-flash="tight">your</span> data <em>useful?</em></span></span>
        </h2>
        <div className="contact-actions-new">
          <p>Bring the measurement problem. We’ll clarify the decision, the evidence required and the most useful next move.</p>
          <a className="contact-primary" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
            <span>Schedule a call</span><ArrowUpRight aria-hidden="true" />
          </a>
          <a className="contact-email-new" href={`mailto:${EMAIL}`} aria-label={EMAIL}>
            <span>Prefer email?</span><strong>{EMAIL}</strong><ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer
        className="signal-footer"
        data-scroll-align="viewport"
        data-scroll-scene="footer"
        data-scroll-waypoint="footer"
      >
        <FooterGlyphStream />
        <div className="signal-footer__wordmark" aria-hidden="true">JA<span>.</span>DATA</div>
        <div className="signal-footer__bottom">
          <p>© {new Date().getFullYear()} Jabed Ahmed</p>
          <nav aria-label="Footer navigation">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={`mailto:${EMAIL}`}>Email</a>
            <a href="/privacy.html">Privacy</a>
            <a href="#home">Back to top</a>
          </nav>
          <p>Data &amp; analytics consulting</p>
        </div>
      </footer>
    </>
  )
}
