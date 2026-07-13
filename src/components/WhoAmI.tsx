import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { LINKEDIN_URL, WHO_STATS } from '../data'
import { useReveal } from '../hooks'
import { MagneticLink } from './MagneticLink'
import { SectionMarker } from './SectionMarker'

const PRACTICES = ['Collect', 'Govern', 'Experiment', 'Explain'] as const
const PROFILE_STATS = [WHO_STATS[0], WHO_STATS[2], WHO_STATS[1]] as const

function CountUp({
  value,
  inView,
  duration = 1.6,
  from = 0,
  decimals: decimalsProp,
}: {
  value: string
  inView: boolean
  duration?: number
  from?: number
  decimals?: number
}) {
  const match = useMemo(() => value.match(/^([^\d]*)([\d.]+)(.*)$/), [value])
  const decimals =
    decimalsProp ?? (match && match[2].includes('.') ? match[2].split('.')[1].length : 0)
  const [display, setDisplay] = useState(
    match ? `${match[1]}${from.toFixed(decimals)}${match[3]}` : value,
  )
  const done = useRef(false)

  useEffect(() => {
    if (!inView || !match || done.current) return
    done.current = true
    const [, prefix, numStr, suffix] = match
    const target = parseFloat(numStr)
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (target - from) * eased

      if (t >= 1 || parseFloat(current.toFixed(decimals)) === target) {
        setDisplay(value)
        return
      }

      setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, match, duration, from, decimals, value])

  return <>{display}</>
}

export function WhoAmI() {
  const story = useReveal<HTMLElement>(0.16, '0px 0px -60px 0px')
  const stats = useReveal<HTMLDivElement>(0.2)

  return (
    <section
      ref={story.ref}
      id="who"
      data-profile-layout="editorial-ledger"
      className={`profile-story paper-section ${story.inView ? 'rv-in is-revealed' : ''}`}
    >
      <div className="profile-material" aria-hidden="true">
        <span className="profile-material-band" />
        <span className="profile-material-ring" />
      </div>

      <header className="profile-topline">
        <SectionMarker index={1} label="Profile" />
        <p className="profile-identity rv" style={{ animationDelay: '0.08s' }}>
          <span className="profile-identity-dot" />
          Independent data &amp; analytics consultant
          <span aria-hidden="true">/</span>
          London · worldwide
        </p>
      </header>

      <div className="profile-statement-grid">
        <h2 className="profile-statement rv" style={{ animationDelay: '0.14s' }}>
          I make complex products <em>measurable.</em>
        </h2>

        <div className="profile-aside rv" style={{ animationDelay: '0.24s' }}>
          <p>
            I work across product, engineering and growth to build measurement systems that stay
            useful as teams, markets and regulation change.
          </p>
          <MagneticLink
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            className="profile-link"
          >
            LinkedIn
            <ArrowUpRight size={15} strokeWidth={1.9} />
          </MagneticLink>
        </div>
      </div>

      <div className="profile-practice-rail rv" style={{ animationDelay: '0.3s' }} role="list">
        {PRACTICES.map((practice, index) => (
          <span key={practice} role="listitem">
            {practice}
            {index < PRACTICES.length - 1 && <i aria-hidden="true">/</i>}
          </span>
        ))}
      </div>

      <div
        ref={stats.ref}
        className={`profile-proof-ledger ${stats.inView ? 'is-visible' : ''}`}
        role="list"
        aria-label="Selected experience highlights"
      >
        {PROFILE_STATS.map((stat, index) => (
          <article key={stat.tag} className="profile-proof-item" role="listitem">
            <span className="profile-proof-index">0{index + 1}</span>
            <p className="profile-proof-value font-data">
              <CountUp
                value={stat.value}
                inView={stats.inView}
                duration={2.4}
                from={'from' in stat ? stat.from : undefined}
                decimals={'decimals' in stat ? stat.decimals : undefined}
              />
            </p>
            <p className="profile-proof-label">{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
