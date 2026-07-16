import { useEffect, useRef, useState } from 'react'
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
  const [openCard, setOpenCard] = useState<number | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const headerObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        root.classList.add('is-visible')
        headerObserver.disconnect()
      }
    }, { threshold: 0.1 })
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        cardObserver.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.16 })

    headerObserver.observe(root)
    root.querySelectorAll('.capabilities-grid article').forEach((card) => cardObserver.observe(card))
    return () => {
      headerObserver.disconnect()
      cardObserver.disconnect()
    }
  }, [])

  return (
    <section
      ref={rootRef}
      id="capabilities"
      className="capabilities-section"
      aria-labelledby="capabilities-title"
      data-scroll-scene="capabilities"
    >
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
            className={`capability-card${openCard === index ? ' is-open' : ''}`}
            key={capability.number}
            tabIndex={0}
            data-scroll-waypoint-desktop={`capability-0${index + 1}`}
            data-scroll-waypoint-mobile={`capability-0${index + 1}`}
          >
            <button
              type="button"
              className="card-toggle"
              aria-expanded={openCard === index}
              aria-label={`${capability.title} — details`}
              onClick={() => setOpenCard(openCard === index ? null : index)}
            >
              <i aria-hidden="true"><b /><b /></i>
            </button>
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
