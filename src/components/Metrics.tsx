import { useEffect, useRef, useState } from 'react'
import { formatMetricCount, METRICS } from '../data'

const COUNT_UP_DURATION = 2400
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

type CountUpValueProps = {
  value: string
  isVisible: boolean
  from?: number
  decimals?: number
}

function CountUpValue({ value, isVisible, from = 0, decimals = 0 }: CountUpValueProps) {
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
  const [displayValue, setDisplayValue] = useState(() =>
    reducedMotion ? value : formatMetricCount(value, 0, from, decimals),
  )
  const hasAnimated = useRef(reducedMotion)

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return
    let frame = 0
    const startedAt = performance.now()
    const update = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / COUNT_UP_DURATION, 1)
      setDisplayValue(formatMetricCount(value, progress, from, decimals))
      if (progress < 1) frame = window.requestAnimationFrame(update)
      else hasAnimated.current = true
    }
    frame = window.requestAnimationFrame(update)
    return () => window.cancelAnimationFrame(frame)
  }, [decimals, from, isVisible, value])

  return (
    <span className="static-value" data-static-metric aria-hidden="true">
      <span data-count-up-metric>{displayValue}</span>
    </span>
  )
}

export function Metrics() {
  const rootRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setIsVisible(true)
      observer.disconnect()
    }, { threshold: 0.25 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={rootRef} id="proof" className={`evidence-strip${isVisible ? ' is-visible' : ''}`} aria-labelledby="proof-title">
      <div className="evidence-strip__intro">
        <p className="eyebrow">// Evidence</p>
        <h3 id="proof-title">Proof in the system.</h3>
      </div>
      {METRICS.map((metric) => (
        <article className="evidence-strip__metric" aria-label={`${metric.value} ${metric.label}`} key={metric.label}>
          <CountUpValue
            value={metric.value}
            isVisible={isVisible}
            from={'from' in metric ? metric.from : undefined}
            decimals={'decimals' in metric ? metric.decimals : undefined}
          />
          <p>{metric.label}</p>
        </article>
      ))}
    </section>
  )
}
