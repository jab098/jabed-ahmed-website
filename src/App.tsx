import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Menu } from 'lucide-react'

const NAV_LINKS = ['Home', 'Service', 'Contact']
const CALENDLY_URL = 'https://calendly.com/jabed098/30min'
const EMAIL = 'consulting@jabed.co.uk'

const SERVICES = [
  {
    number: '01',
    overline: 'Implementation',
    headline: 'Tag Management',
    blurb:
      'Tag ecosystems managed across five international markets — dataLayer design specs, documentation and QA standards that keep tracking consistent at scale.',
    stack: ['GTM', 'Tealium iQ', 'Snowplow', 'Custom templates', 'dataLayer architecture'],
  },
  {
    number: '02',
    overline: 'Infrastructure',
    headline: 'Server-Side Tracking',
    blurb:
      'End-to-end behavioural pipelines: browser-level capture, collector configuration, stream processing and enrichment — delivered cleanly into the warehouse.',
    stack: ['sGTM', 'GA4', 'Tealium EventStream', 'First-party cookies'],
  },
  {
    number: '03',
    overline: 'Experimentation',
    headline: 'CRO & Testing',
    blurb:
      'Adobe Target A/B and personalisation programmes with measurable impact — contributing over €2M in annual revenue uplift for a global telco.',
    stack: ['Adobe Target', 'A/B testing', 'Personalisation rules'],
  },
  {
    number: '04',
    overline: 'Compliance',
    headline: 'Consent & Privacy',
    blurb:
      'OneTrust administration and GDPR-aligned consent across multiple markets, including ATT and SKAdNetwork compliance after the iOS privacy changes.',
    stack: ['OneTrust', 'Consent Mode v2', 'GDPR-aligned tagging'],
  },
  {
    number: '05',
    overline: 'Reporting',
    headline: 'BI & Data Modelling',
    blurb:
      'GA4-powered pipelines feeding the data lake, with downstream Power BI and Looker reporting — governed, accurate and stakeholder-ready.',
    stack: ['Power BI', 'Looker', 'SQL', 'Dashboarding'],
  },
  {
    number: '06',
    overline: 'Engineering',
    headline: 'Front-End Instrumentation',
    blurb:
      'First-class Software Engineering foundations. Custom JavaScript event tracking with structured QA and validation baked into every release.',
    stack: ['JavaScript', 'Custom event tracking', 'QA validation'],
  },
]

/* Logo sources: simple-icons pinned to @13 — the last major that still ships
   the Adobe glyph (removed upstream in v14; @latest only serves it from a
   stale CDN cache). Optimizely, Tealium and Amplitude were never part of
   simple-icons, so they come from the gilbarbara/logos set, also on jsDelivr.
   Snowplow and OneTrust exist on no public icon CDN at all — their official
   brand SVGs are vendored in public/assets/logos/. */
const SIMPLE_ICONS = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons'
const GILBARBARA = 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos'
const LOGOS = [
  { name: 'Google Analytics', src: `${SIMPLE_ICONS}/googleanalytics.svg` },
  { name: 'Google Tag Manager', src: `${SIMPLE_ICONS}/googletagmanager.svg` },
  { name: 'Google BigQuery', src: `${SIMPLE_ICONS}/googlebigquery.svg` },
  { name: 'Mixpanel', src: `${SIMPLE_ICONS}/mixpanel.svg` },
  { name: 'Optimizely', src: `${GILBARBARA}/optimizely-icon.svg` },
  { name: 'Tealium', src: `${GILBARBARA}/tealium.svg` },
  { name: 'Adobe Analytics', src: `${SIMPLE_ICONS}/adobe.svg` },
  { name: 'Snowplow', src: '/assets/logos/snowplow.svg' },
  { name: 'OneTrust', src: '/assets/logos/onetrust.svg' },
  { name: 'Amplitude', src: `${GILBARBARA}/amplitude-icon.svg` },
  { name: 'PostgreSQL', src: `${SIMPLE_ICONS}/postgresql.svg` },
]

function LogoMarquee() {
  return (
    <div className="logo-marquee mt-20 md:mt-28" aria-label="Platforms and tools I work with">
      <div className="logo-marquee-fade">
        <div className="logo-marquee-track">
          {/* Five identical copies back to back: translating the track -20%
              (exactly one copy) lands on an identical frame, so the loop
              resets without a visible seam. Five (not two) so the copies
              behind the animated one always cover ultra-wide viewports —
              with two, any screen wider than a single copy (~1200px) saw
              a gap and a blink at the reset point. */}
          {[0, 1, 2, 3, 4].map((copy) => (
            <div className="logo-marquee-group" key={copy} aria-hidden={copy > 0}>
              {LOGOS.map((logo) => (
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={copy === 0 ? logo.name : ''}
                  title={logo.name}
                  loading="lazy"
                  draggable={false}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Navbar({
  active,
  scrolled,
  dimmed,
}: {
  active: string
  scrolled: boolean
  dimmed: boolean
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-5 pt-6 sm:pt-8 pb-4">
      {/* Logo + wordmark — fades out once the hero scrolls away so it never
          overlaps section headings */}
      <a
        href="#home"
        className={`flex items-center gap-2.5 transition-opacity duration-300 ${
          scrolled ? 'opacity-0 pointer-events-none' : ''
        }`}
      >
        <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" aria-hidden="true">
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span className="text-white text-2xl font-playfair italic">Jabed Ahmed</span>
      </a>

      {/* Center pill nav — recedes while scrolling down, returns on scroll up */}
      <div
        className={`hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1 transition-opacity duration-500 ${
          dimmed ? 'opacity-45' : 'opacity-100'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              link === active
                ? 'text-white bg-white/20'
                : 'text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {link}
          </a>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden text-white p-2" aria-label="Open menu">
        <Menu size={24} />
      </button>
    </nav>
  )
}

/* Magnetic CTAs: the button stays exactly in place and keeps its shape — it
   only grows as the cursor approaches, from 1 at the edge of the radius up
   to a capped maximum right over the button. The slow lerp gives it the
   unhurried feel of the landing-page background, and the same lerp eases it
   back down when the cursor retreats. The rAF loop self-stops once settled. */
function useMagnetic() {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Touch devices have no hovering cursor; honour reduced-motion
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return

    let raf = 0
    let scale = 1
    let target = 1
    const MAX_GROWTH = 0.07
    const EASE = 0.06

    const tick = () => {
      scale += (target - scale) * EASE
      const settled = Math.abs(target - scale) < 0.0005
      if (settled) scale = target
      el.style.transform = `scale(${scale})`
      raf = settled ? 0 : requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right)
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom)
      const radius = window.innerWidth < 1024 ? 52 : 72
      const dist = Math.hypot(dx, dy)
      // growth is 0 at the radius edge and caps at MAX_GROWTH on the button
      target = dist < radius ? 1 + (1 - dist / radius) * MAX_GROWTH : 1
      if (!raf) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      el.style.transform = ''
    }
  }, [])

  return { ref }
}

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    // Touch devices have no persistent cursor to follow
    if (window.matchMedia('(pointer: coarse)').matches) return

    const half = glow.offsetWidth / 2
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let x = targetX
    let y = targetY
    let raf = 0

    // Lerp toward the cursor each frame — the gap between the glow and the
    // pointer closes exponentially, which reads as soft elastic trailing
    const tick = () => {
      x += (targetX - x) * 0.1
      y += (targetY - y) * 0.1
      glow.style.transform = `translate3d(${x - half}px, ${y - half}px, 0)`
      if (Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      glow.style.opacity = '1'
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => {
      glow.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}

function Hero({ fade }: { fade: number }) {
  const magnet = useMagnetic()
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden h-screen bg-black"
      style={{ height: '100dvh' }}
    >
      {/* Background video — anchored to this section only */}
      <video
        className="absolute inset-0 z-10 w-full h-full object-cover"
        src="/assets/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Scroll-linked fade to black */}
      <div
        className="absolute inset-0 z-40 bg-black pointer-events-none"
        style={{ opacity: fade }}
      />

      {/* Title + CTA — bottom-anchored at 52% of the viewport so it always
          clears the Earth's horizon, growing upward on shorter displays */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center justify-end text-center px-5 h-[52vh]"
        style={{ height: '52dvh' }}
      >
        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Data Collection
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            done right.
          </span>
        </h1>
        <p
          className="mt-5 text-white text-2xl font-playfair italic hero-anim hero-fade"
          style={{ animationDelay: '0.58s' }}
        >
          by Jabed Ahmed
        </p>
        {/* Entrance animation lives on the wrapper: its fill-mode pins a final
            transform that would otherwise override the magnetic offset */}
        <div className="mt-8 hero-anim hero-fade" style={{ animationDelay: '0.72s' }}>
          <a
            ref={magnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-[background-color,scale,box-shadow] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
          >
            <span className="inline-block">Schedule a Call</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#service"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 text-white/80 hover:text-white transition-colors hero-anim hero-fade rounded-full px-6 py-3.5 bg-black/25 backdrop-blur-sm border border-white/10 hover:border-white/20"
        style={{ animationDelay: '1.1s' }}
      >
        <span className="text-xs font-medium tracking-wide uppercase">Scroll</span>
        <ChevronDown size={20} className="animate-bounce" />
      </a>
    </section>
  )
}

function CarouselArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center gap-4 shrink-0">
      <button
        onClick={onPrev}
        aria-label="Previous services"
        className="w-16 h-16 rounded-full border border-white/25 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/50 active:scale-95"
      >
        <ChevronLeft size={30} />
      </button>
      <button
        onClick={onNext}
        aria-label="Next services"
        className="w-16 h-16 rounded-full border border-white/25 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/50 active:scale-95"
      >
        <ChevronRight size={30} />
      </button>
    </div>
  )
}

function Service({ fade }: { fade: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)

  const scrollByCard = (direction: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('article')
    const gap = 20
    const step = card ? card.clientWidth + gap : 400
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  // When every card fits in the window, show them all and hide the controls.
  // When the track overflows, the cards that fully fit from the current snap
  // position are "selected"; the rest recede: transparent + scaled down.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0

    const updateCards = () => {
      const cards = track.querySelectorAll('article')
      const first = cards[0]
      if (!first) return

      const hasOverflow = track.scrollWidth > track.clientWidth + 4
      setScrollable(hasOverflow)

      const gap = 20
      const step = first.clientWidth + gap
      const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0
      const visibleCount = Math.max(
        1,
        Math.floor((track.clientWidth - 2 * padLeft + gap) / step),
      )
      let start = Math.round(track.scrollLeft / step)
      // At the end of the track there's less than a full step left to scroll,
      // so anchor the selection to the last fully visible cards instead
      const maxScroll = track.scrollWidth - track.clientWidth
      if (track.scrollLeft >= maxScroll - 4) {
        start = cards.length - visibleCount
      }
      cards.forEach((card, i) => {
        const selected = !hasOverflow || (i >= start && i < start + visibleCount)
        card.style.opacity = selected ? '1' : '0.22'
        card.style.transform = selected ? 'scale(1)' : 'scale(0.94)'
      })
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updateCards)
    }

    updateCards()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section id="service" className="relative overflow-hidden bg-black py-24 md:py-32">
      {/* Background video — anchored to this section only */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/service-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Constant legibility dimmer */}
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />
      {/* Soft blends into the sections above and below */}
      <div className="absolute top-0 left-0 right-0 h-[35vh] bg-gradient-to-b from-black via-black/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
      {/* Scroll-linked fade to black */}
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: fade }} />

      <div className="relative z-10">
        {/* Section header + carousel arrows */}
        <div className="max-w-6xl mx-auto px-5 sm:px-10 md:px-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14 md:mb-20">
          <div>
            <p className="text-[#e8702a] text-xs font-semibold tracking-[0.25em] uppercase mb-5">
              Service
            </p>
            <h2 className="text-white leading-[1.05] text-4xl sm:text-5xl md:text-6xl max-w-3xl">
              Six disciplines,{' '}
              <span className="font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
                one robust
              </span>
              <span className="block font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
                data infrastructure.
              </span>
            </h2>
          </div>
          {scrollable && (
            <CarouselArrows onPrev={() => scrollByCard(-1)} onNext={() => scrollByCard(1)} />
          )}
        </div>

        {/* Carousel — full-bleed so neighbouring cards peek at the edges */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-[8vw]"
          style={{ scrollPaddingLeft: '8vw' }}
        >
          {SERVICES.map((service) => (
            <article
              key={service.number}
              className="group relative snap-start shrink-0 w-[72vw] sm:w-[40vw] md:w-[340px] min-h-[540px] md:min-h-[620px] border border-white/10 rounded-3xl p-8 flex flex-col bg-black/35 backdrop-blur-sm transition-all duration-300 hover:border-[#e8702a]/40 hover:bg-black/50 hover:shadow-[0_0_35px_rgba(232,112,42,0.14)]"
            >
              <div className="flex items-start justify-between mb-10">
                <span className="font-playfair italic text-4xl text-[#e8702a]">
                  {service.number}
                </span>
                <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase pt-2.5">
                  {service.overline}
                </span>
              </div>

              <h3 className="text-white text-2xl lg:text-3xl font-bold uppercase leading-tight mb-4">
                {service.headline}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{service.blurb}</p>

              <div className="flex flex-wrap gap-2 mt-auto pt-8">
                {service.stack.map((tech) => (
                  <span
                    key={tech}
                    className="border border-white/15 bg-white/[0.06] text-white/75 text-xs font-medium px-3 py-1.5 rounded-full transition-colors group-hover:border-white/25 group-hover:text-white/90"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <LogoMarquee />
      </div>
    </section>
  )
}

function Contact() {
  const magnet = useMagnetic()
  return (
    <section
      id="contact"
      className="relative bg-black px-5 sm:px-10 md:px-14 py-24 md:py-32 min-h-[85vh] flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        <p className="text-[#e8702a] text-xs font-semibold tracking-[0.25em] uppercase mb-5">
          Contact
        </p>
        <h2 className="text-white leading-[1.02] text-4xl sm:text-6xl md:text-7xl max-w-4xl mb-12">
          Let's get your data{' '}
          <span className="font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
            working for you.
          </span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-12">
          <a
            ref={magnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center self-start bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-[background-color,scale,box-shadow] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
          >
            <span className="inline-flex items-center gap-2">
              Schedule a Call
              <ArrowUpRight size={16} />
            </span>
          </a>
          <div>
            <p className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase mb-1.5">
              Or drop me a line
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="font-playfair italic text-2xl sm:text-3xl text-white hover:text-[#e8702a] transition-colors"
            >
              {EMAIL}
            </a>
          </div>
        </div>

        {/* Footer line */}
        <div className="border-t border-white/10 mt-24 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Jabed Ahmed — Data & Analytics Consulting
          </p>
          <p className="text-white/40 text-xs">30-minute intro call, no obligation.</p>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [heroFade, setHeroFade] = useState(0)
  const [serviceFade, setServiceFade] = useState(0)
  const [active, setActive] = useState('Home')
  const [scrolled, setScrolled] = useState(false)
  const [navDimmed, setNavDimmed] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const vh = window.innerHeight

      // Hero background fades fully to black before the hero leaves the viewport
      setHeroFade(Math.min(y / (vh * 0.75), 1))

      // Past the hero, section headings reach the top of the viewport
      setScrolled(y > vh * 0.5)

      // Nav pill recedes while scrolling down, returns on any upward scroll.
      // The few-pixel deadband stops it flickering on tiny scroll jitters.
      if (y > lastY + 4 && y > 100) setNavDimmed(true)
      else if (y < lastY - 4 || y <= 100) setNavDimmed(false)
      lastY = y

      // Service background fades to black as the section scrolls out of view
      const service = document.getElementById('service')
      if (service) {
        const rect = service.getBoundingClientRect()
        setServiceFade(Math.min(Math.max((vh - rect.bottom) / (vh * 0.85), 0), 1))
      }

      // Scrollspy for the nav pill
      const mid = y + vh / 2
      const contact = document.getElementById('contact')
      if (contact && mid >= contact.offsetTop) setActive('Contact')
      else if (service && mid >= service.offsetTop) setActive('Service')
      else setActive('Home')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CursorGlow />
      <Navbar active={active} scrolled={scrolled} dimmed={navDimmed} />
      <Hero fade={heroFade} />
      <Service fade={serviceFade} />
      <Contact />
    </div>
  )
}
