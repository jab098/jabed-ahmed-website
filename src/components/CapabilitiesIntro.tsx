import { useLayoutEffect, useRef } from 'react'
import {
  gsap,
  HEADLINE_SCRUB,
  navigationEdgeScrollPosition,
  settleHeadlineReveal,
} from '../motion'

export function CapabilitiesIntro() {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || navigator.userAgent.includes('jsdom')) return

    const headlineLines = root.querySelectorAll<HTMLElement>('.capabilities-intro__line > span')
    const context = gsap.context(() => {
      gsap.fromTo(
        headlineLines,
        { yPercent: 110 },
        {
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
        },
      )
    }, root)

    return () => context.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      id="capabilities"
      className="capabilities-intro"
      aria-labelledby="capabilities-title"
      data-scroll-scene="capabilities-intro"
      data-scroll-waypoint="capabilities-heading"
    >
      <p className="eyebrow">// Inside the system</p>
      <p className="capabilities-intro__meta">No black boxes / 01—06</p>
      <h2 id="capabilities-title" aria-label="What's in a reliable measurement system?">
        <span className="capabilities-intro__line"><span>What’s in a</span></span>
        <span className="capabilities-intro__line"><span>reliable</span></span>
        <span className="capabilities-intro__line capabilities-intro__line--accent"><span>measurement system?</span></span>
      </h2>
      <p className="capabilities-intro__aside">Six connected capabilities.</p>
    </section>
  )
}
