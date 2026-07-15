import { useEffect, useRef, type CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { CAPABILITIES } from '../data'

function CapabilityMotif({ index }: { index: number }) {
  const number = String(index + 1).padStart(2, '0')
  return (
    <div
      className={`capability-motif capability-motif--${index + 1}`}
      data-capability-motif={number}
      aria-hidden="true"
    >
      {Array.from({ length: index === 3 ? 18 : 9 }, (_, cell) => <i key={cell} />)}
      <span className="capability-motif__number">{number}</span>
    </div>
  )
}

export function Capabilities() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        root.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.1 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={rootRef} id="capabilities" className="capabilities-section" aria-labelledby="capabilities-title">
      <header className="capabilities-header" data-scroll-waypoint="capabilities-heading">
        <p className="eyebrow">// Inside the system</p>
        <h2 id="capabilities-title" aria-label="What's in a reliable measurement system?">
          <span>What’s in a reliable</span>
          <span>measurement system?</span>
        </h2>
        <p>Six connected capabilities. No black boxes.</p>
      </header>
      <div className="capabilities-grid">
        {CAPABILITIES.map((capability, index) => (
          <article
            key={capability.number}
            tabIndex={0}
            data-scroll-waypoint-desktop={`capability-0${index + 1}`}
            data-scroll-waypoint-mobile={`capability-0${index + 1}`}
            style={{ '--delay': `${index * 80}ms` } as CSSProperties}
          >
            <CapabilityMotif index={index} />
            <div className="capability-card__top">
              <span>{capability.number}</span>
              <span>{capability.discipline}</span>
            </div>
            <h3>{capability.title}</h3>
            <p>{capability.copy}</p>
            <div className="capability-card__stack">
              {capability.stack.map((item) => <span key={item}>{item}</span>)}
            </div>
            <ArrowUpRight className="capability-card__arrow" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  )
}
