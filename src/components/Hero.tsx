import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { CALENDLY_URL } from '../data'
import { useMagnetic } from '../hooks'
import { LogoMark } from './LogoMark'

/* Decorative diagonal graph for the hero dashboard mock. The path is built
   from identical units, each 400 SVG units wide with a net 80-unit climb —
   sharp angular rises with small pullbacks, no flat steps. Because the
   pattern is periodic in both axes, the CSS crawl of (-400, +80) per cycle
   loops seamlessly: an endlessly rising chart. */
const GRAPH_UNITS = 4
const HERO_GRAPH_PATH = (() => {
  let d = 'M0,260'
  let x = 0
  let y = 260
  for (let i = 0; i < GRAPH_UNITS; i++) {
    d += ` L${x + 90},${y - 58} L${x + 150},${y - 34} L${x + 240},${y - 96} L${x + 290},${y - 72} L${x + 400},${y - 80}`
    x += 400
    y -= 80
  }
  return d
})()
const HERO_NODES: [number, number][] = Array.from({ length: GRAPH_UNITS }, (_, i) => [
  i * 400 + 240,
  260 - i * 80 - 96,
])

function HeroGraph() {
  return (
    <svg viewBox="0 0 800 240" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="hgFill" x1="0" y1="-80" x2="0" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <filter id="hgGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g className="hero-graph-crawl">
        <path d={`${HERO_GRAPH_PATH} L1600,600 L0,600 Z`} fill="url(#hgFill)" />
        <path
          d={HERO_GRAPH_PATH}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          opacity="0.35"
          filter="url(#hgGlow)"
        />
        <path d={HERO_GRAPH_PATH} fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
        {HERO_NODES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.2"
            fill="#34d399"
            className="hero-node"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </g>
    </svg>
  )
}

/* Simulated click-tracking cursor: drifts into a random spot on its half of
   the dashboard, waits a beat, clicks (pulse + ripple), pops an event chip
   ("Tracked" / "Conversion"), then fades away and respawns elsewhere. The
   two instances run the same cycle length with different start offsets and
   label rotations, so clicks never coincide and the two visible chips never
   match. */
const CLICK_LABELS = ['Tracked', 'Conversion']
/* Shared registry of what each cursor is currently claiming, so two visible
   chips can never read the same text */
const activeChip: Record<'left' | 'right', string> = { left: '', right: '' }

function FakeCursor({ side, offsetMs }: { side: 'left' | 'right'; offsetMs: number }) {
  // 'off' (not 'hidden'): Tailwind's .hidden utility means display:none,
  // which would kill the fade-in transition when the cursor reappears
  const [phase, setPhase] = useState<'off' | 'idle' | 'click' | 'label' | 'leave'>('off')
  const [pos, setPos] = useState({ x: side === 'left' ? 12 : 84, y: 40 })
  const [label, setLabel] = useState(CLICK_LABELS[side === 'left' ? 0 : 1])
  const lastLabel = useRef('')

  useEffect(() => {
    let alive = true
    const timers: number[] = []
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms))
      })
    // Restraint over simulated interactivity: each cursor performs a
    // handful of clicks once, then stays off for good — a brief flourish
    // rather than a looping animation a repeat visitor tires of
    const MAX_CYCLES = 2
    const run = async () => {
      await wait(offsetMs)
      for (let cycle = 0; alive && cycle < MAX_CYCLES; cycle++) {
        // side bands of the hero backdrop — clear of the centred title
        // column and above the docked chart
        setPos({
          x: side === 'left' ? 5 + Math.random() * 15 : 78 + Math.random() * 15,
          y: 12 + Math.random() * 46,
        })
        // claim a label the other cursor isn't showing; alternate our own
        const other = side === 'left' ? activeChip.right : activeChip.left
        const candidates = CLICK_LABELS.filter((l) => l !== other)
        const next = candidates.find((l) => l !== lastLabel.current) ?? candidates[0]
        lastLabel.current = next
        activeChip[side] = next
        setLabel(next)
        if (!alive) break
        setPhase('idle') // drift in
        await wait(1100)
        setPhase('click') // press pulse + ripple
        await wait(350)
        setPhase('label') // event chip pops
        await wait(1100)
        setPhase('leave') // fade out
        await wait(850)
        setPhase('off')
        activeChip[side] = ''
        await wait(900)
      }
    }
    run()
    return () => {
      alive = false
      activeChip[side] = ''
      timers.forEach(clearTimeout)
    }
  }, [side, offsetMs])

  return (
    <div
      className={`fake-cursor ${phase}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      aria-hidden="true"
    >
      <span className="fc-chip">{label}</span>
      <span className="fc-ripple" />
      <svg className="fc-arrow" width="22" height="22" viewBox="0 0 24 24">
        <path
          d="M5 3 L19 12 L12 13.5 L9.5 20 Z"
          fill="#ffffff"
          stroke="#0A0D10"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function Hero() {
  const ctaMagnet = useMagnetic()
  return (
    <section
      id="home"
      className="relative w-full h-[calc(100dvh-1rem)] md:h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-4rem)] bg-[#0A0D10] text-white rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl px-6 lg:px-12 py-6 md:py-8 flex flex-col"
    >
      {/* Animated backdrop: ambient radial base, emerald mesh, teal wash,
          dot grid and film grain */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#112218] via-[#0A0D10] to-[#050505] opacity-80" />
        <div className="hero-mesh" />
        <div className="hero-mesh2" />
        <div className="hero-teal" />
        <div className="hero-bloom hero-bloom-a" />
        <div className="hero-bloom hero-bloom-b" />
        <div className="hero-grid" />
        <div className="hero-grid2" />
        <div className="hero-grid3" />
        <div className="hero-grain" />
      </div>

      {/* Centered typography + CTA. pt clears the fixed nav; pb equals the
          docked dashboard's height, so the block centres in the visible gap
          between nav and dock on any display size */}
      <div className="flex-grow flex flex-col items-center justify-center text-center relative z-20 pt-20 md:pt-24 pb-[35vh] min-h-0">
        <h1 className="leading-[0.95]">
          {/* pb keeps descenders inside the clip-text paint box */}
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl pb-[0.12em] hero-anim hero-reveal bg-gradient-to-b from-white via-[#e9edec] to-[#98a29e] bg-clip-text text-transparent"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Data Collection
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-[0.18em] pb-[0.14em] hero-anim hero-reveal bg-gradient-to-b from-white via-[#e9edec] to-[#98a29e] bg-clip-text text-transparent"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            done right.
          </span>
        </h1>
        <p
          className="text-[16px] text-white/70 mt-4 hero-anim hero-fade"
          style={{ animationDelay: '0.58s' }}
        >
          by Jabed Ahmed
        </p>
        {/* Entrance animation lives on the wrapper: its fill-mode pins a final
            transform that would otherwise override the magnetic offset */}
        <div className="mt-8 hero-anim hero-fade" style={{ animationDelay: '0.72s' }}>
          <a
            ref={ctaMagnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-streak inline-block bg-[#00df8e] text-black px-8 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#00c27a] shadow-[0_0_30px_rgba(0,223,142,0.2)] transition-[background-color,scale,box-shadow] active:scale-95"
          >
            <span className="relative z-10 inline-block">Schedule a Call</span>
          </a>
        </div>
      </div>

      {/* Dashboard UI docked to the card's bottom edge, with the orbiting
          emerald light trace around its border */}
      <div
        className="glow-border absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] h-[35vh] bg-[#111518] border-t border-x border-b-0 border-white/10 rounded-t-[24px] shadow-2xl z-30 flex hero-anim hero-fade"
        style={{ animationDelay: '0.9s' }}
        aria-hidden="true"
      >
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-48 lg:w-64 shrink-0 border-r border-white/5 p-6 flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <LogoMark size={13} className="text-[#00df8e]" />
            <span className="h-2.5 w-16 rounded-full bg-white/10" />
          </div>
          {[92, 78, 84, 68, 74].map((w, i) => (
            <span key={i} className="h-3 bg-white/5 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Main chart area */}
        <div className="flex-grow relative flex items-end justify-center p-8 min-w-0 overflow-hidden rounded-t-[24px]">
          <span className="w-32 h-4 bg-white/5 rounded-full absolute top-6 left-8" />
          <span className="w-24 h-4 bg-white/5 rounded-full absolute top-6 right-8 hidden sm:block" />
          <div className="hero-graph-window absolute inset-x-6 top-16 bottom-0">
            <HeroGraph />
          </div>
        </div>
      </div>

      {/* Roaming click-tracking cursors in the backdrop's side bands —
          clear of the title column and outside the docked chart */}
      <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
        <FakeCursor side="left" offsetMs={900} />
        <FakeCursor side="right" offsetMs={3400} />
      </div>

      {/* Scroll indicator */}
      <a
        href="#who"
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 text-white/70 hover:text-white transition-colors hero-anim hero-fade rounded-md px-3 py-1.5 bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20"
        style={{ animationDelay: '1.1s' }}
      >
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase">Scroll</span>
        <ChevronDown size={13} className="animate-bounce" />
      </a>
    </section>
  )
}
