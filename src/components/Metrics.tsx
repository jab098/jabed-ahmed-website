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

    if (reducedMotion) {
      hasAnimated.current = true
      setDisplayValue(value)
      return
    }

    let frame = 0
    const startedAt = performance.now()
    const update = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / COUNT_UP_DURATION, 1)
      setDisplayValue(formatMetricCount(value, progress, from, decimals))

      if (progress < 1) {
        frame = window.requestAnimationFrame(update)
      } else {
        hasAnimated.current = true
      }
    }

    frame = window.requestAnimationFrame(update)
    return () => window.cancelAnimationFrame(frame)
  }, [decimals, from, isVisible, reducedMotion, value])

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
      if (entry.isIntersecting) {
        setIsVisible(true)
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
      className={`proof-section${isVisible ? ' is-visible' : ''}`}
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
