import { useEffect, useRef } from 'react'
import { METRICS } from '../data'

function StaticValue({ value }: { value: string }) {
  return (
    <span className="static-value" data-static-metric aria-hidden="true">
      <span>{value}</span>
    </span>
  )
}

export function Metrics() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        root.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.25 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={rootRef}
      id="proof"
      className="proof-section"
      aria-labelledby="proof-title"
      data-scroll-scene="proof"
      data-scroll-frame="viewport"
      data-scroll-waypoint="proof"
    >
      <div className="proof-art">
        <div className="proof-art__grid" aria-hidden="true">
          {Array.from({ length: 49 }, (_, index) => <i key={index} />)}
        </div>
        <p className="eyebrow">// Evidence</p>
        <h2 id="proof-title">Proof in the system.</h2>
      </div>
      {METRICS.map((metric, index) => (
        <article
          key={metric.label}
          className="proof-metric"
          aria-label={`${metric.value} ${metric.label}`}
          data-scroll-waypoint-mobile={`proof-metric-0${index + 1}`}
        >
          <span className="proof-metric__number">0{index + 1}</span>
          <StaticValue value={metric.value} />
          <p>{metric.label}</p>
        </article>
      ))}
    </section>
  )
}
