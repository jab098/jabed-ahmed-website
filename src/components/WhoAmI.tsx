import { useEffect, useMemo, useRef, useState } from 'react'
import { LINKEDIN_URL, WHO_HEADLINE, WHO_STATS } from '../data'
import { useReveal } from '../hooks'
import { MagneticLink } from './MagneticLink'
import { SectionMarker } from './SectionMarker'

/* Counts the numeric portion of a stat string ("€2M+" → "€" + 2 + "M+") up
   from `from` once its card scrolls into view, via requestAnimationFrame like
   the rest of the site's motion rather than a state-per-tick timer. Easing is
   ease-out cubic, so motion is quick early and visibly slows as it nears the
   target; `decimals` forces finer-grained steps (e.g. 0.1) so that
   deceleration reads as discrete increments rather than jumping 0→1→2. */
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
  // Memoised: value.match() returns a new array every render, and putting
  // that in a dependency array would re-fire (and cancel) the effect below
  // on every render instead of once when it comes into view
  const match = useMemo(() => value.match(/^([^\d]*)([\d.]+)(.*)$/), [value])
  const decimals = decimalsProp ?? (match && match[2].includes('.') ? match[2].split('.')[1].length : 0)
  const [display, setDisplay] = useState(match ? `${match[1]}${from.toFixed(decimals)}${match[3]}` : value)
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
      // Snap to the exact original label ("€2M+") the instant the rounded
      // value already reads as the target, instead of waiting for t to hit
      // 1 — otherwise a rounded frame like "€2.0M+" briefly holds before an
      // abrupt swap to "€2M+", which reads as a glitch rather than an arrival
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
  // Headline unmask fires at 20% visibility; stat cards get their own
  // observer so the cascade starts as the grid itself scrolls into view
  const headline = useReveal<HTMLElement>(0.2, '0px 0px -50px 0px')
  const stats = useReveal<HTMLDivElement>(0.1)

  return (
    <section
      ref={headline.ref}
      id="who"
      className={`w-full px-6 lg:px-12 pt-32 pb-24 bg-[#f4f4f5] text-black ${
        headline.inView ? 'rv-in is-revealed' : ''
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Title column (~25%) — mirrors the Insights column so the vertical
            separators sit parallel while scrolling */}
        <div className="lg:col-span-3">
          <SectionMarker index={1} label="Who Am I" />
          <h2 className="rv text-black leading-[0.98] mt-8" style={{ animationDelay: '0.1s' }}>
            <span
              className="block font-playfair italic font-normal text-[34px] md:text-[42px]"
              style={{ letterSpacing: '-0.05em' }}
            >
              Analytics Professional
            </span>
            <span
              className="block font-normal text-[34px] md:text-[42px]"
              style={{ letterSpacing: '-0.08em' }}
            >
              technical expert.
            </span>
          </h2>
          <p
            className="rv text-[16px] text-black/60 mt-6 leading-relaxed"
            style={{ animationDelay: '0.2s' }}
          >
            Building the tracking environments and data pipelines that unlock millions in
            actionable revenue for digital products.
          </p>
        </div>

        <div className="lg:col-span-9 lg:border-l lg:border-black/10 lg:pl-10">
          {/* Word-by-word unmask: each word slides up out of its own
              overflow-hidden mask with an incrementing delay */}
          <h3 className="text-[32px] sm:text-[42px] md:text-[48px] font-medium leading-[1.15] tracking-tight max-w-[1000px]">
            {WHO_HEADLINE.split(' ').map((word, i) => (
              <span key={i} className="reveal-mask">
                <span className="reveal-word" style={{ transitionDelay: `${i * 0.03}s` }}>
                  {word}&nbsp;
                </span>
              </span>
            ))}
          </h3>

          {/* rv sits on the wrapper, not the magnetic anchor itself — the
              entrance animation's forwards fill would otherwise permanently
              pin transform: translateY(0) and swallow the magnetic scale */}
          <div className="rv mt-10" style={{ animationDelay: '0.6s' }}>
            <MagneticLink
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-streak inline-flex items-center gap-2.5 bg-black text-white px-7 py-3 rounded-full text-[14px] font-medium hover:bg-black/80 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00df8e]" />
              <span className="relative z-10">LinkedIn</span>
            </MagneticLink>
          </div>

          {/* Statistic cards: delayed cascading rise */}
          <div
            ref={stats.ref}
            className={`stat-grid-wrapper grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-[1200px] ${
              stats.inView ? 'is-visible' : ''
            }`}
          >
            {WHO_STATS.map((stat, i) => (
              /* entrance keyframes live on the wrapper; the inner card keeps
                 its slow hover free of the animation's transform */
              <div key={stat.tag} className="stat-rise" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="glow-border-soft bg-[#eaeaea] rounded-[32px] p-8 flex flex-col justify-between relative h-[240px] transition-[transform,box-shadow] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-xl">
                  <p className="font-data text-[44px] sm:text-[52px] xl:text-[64px] 2xl:text-[76px] font-medium leading-none text-black">
                    <CountUp
                      value={stat.value}
                      inView={stats.inView}
                      duration={4}
                      from={'from' in stat ? stat.from : undefined}
                      decimals={'decimals' in stat ? stat.decimals : undefined}
                    />
                  </p>
                  <p className="text-[14px] text-black/60 mt-auto pr-10">{stat.label}</p>
                  <span className="font-data absolute bottom-8 right-8 text-[13px] text-black/30">
                    {stat.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
