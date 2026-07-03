import { useEffect, useState } from 'react'
import { ArrowUpRight, ChevronDown, Menu } from 'lucide-react'

const NAV_LINKS = ['Home', 'Service', 'Contact']
const CALENDLY_URL = 'https://calendly.com/jabed098/30min'
const EMAIL = 'consulting@jabed.co.uk'

const SERVICES = [
  {
    number: '01',
    overline: 'Implementation',
    headline: 'Tag Management',
    detail: 'GTM, Tealium iQ, custom templates, dataLayer architecture',
  },
  {
    number: '02',
    overline: 'Infrastructure',
    headline: 'Server-Side Tracking',
    detail: 'sGTM, GA4, Tealium EventStream, first-party cookie strategy',
  },
  {
    number: '03',
    overline: 'Experimentation',
    headline: 'CRO & Testing',
    detail: 'Adobe Target, A/B testing, personalisation rules',
  },
  {
    number: '04',
    overline: 'Compliance',
    headline: 'Consent & Privacy',
    detail: 'OneTrust, Consent Mode v2, GDPR-aligned tagging',
  },
  {
    number: '05',
    overline: 'Reporting',
    headline: 'BI & Data Modelling',
    detail: 'Power BI, SQL, dashboarding',
  },
  {
    number: '06',
    overline: 'Engineering',
    headline: 'Front-End Instrumentation',
    detail: 'JavaScript, custom event tracking, QA validation',
  },
]

function Navbar({ active }: { active: string }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      {/* Logo + wordmark */}
      <a href="#home" className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" aria-hidden="true">
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span className="text-white text-2xl font-playfair italic">Jabed Ahmed</span>
      </a>

      {/* Center pill nav */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
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

function Hero({ fade }: { fade: number }) {
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

      {/* Title + CTA, resting above the Earth's horizon */}
      <div className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center text-center px-5 pt-[22vh] sm:pt-[24vh]">
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
            done right
          </span>
        </h1>
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-9 bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 hero-anim hero-fade"
          style={{ animationDelay: '0.6s' }}
        >
          Schedule a Call
        </a>
      </div>

      {/* Scroll indicator */}
      <a
        href="#service"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors hero-anim hero-fade"
        style={{ animationDelay: '1.1s' }}
      >
        <span className="text-xs font-medium tracking-wide uppercase">Scroll</span>
        <ChevronDown size={20} className="animate-bounce" />
      </a>
    </section>
  )
}

function Service() {
  return (
    <section id="service" className="relative bg-black px-5 sm:px-10 md:px-14 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <p className="text-[#e8702a] text-xs font-semibold tracking-[0.25em] uppercase mb-5">
          Service
        </p>
        <h2 className="text-white leading-[1.05] text-4xl sm:text-5xl md:text-6xl max-w-3xl mb-16 md:mb-24">
          Six disciplines,{' '}
          <span className="font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
            one clean dataLayer.
          </span>
        </h2>

        {/* Service grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SERVICES.map((service) => (
            <div
              key={service.number}
              className="group relative border border-white/10 rounded-3xl p-8 flex flex-col gap-14 transition-all duration-300 hover:border-[#e8702a]/50 hover:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between">
                <span className="font-playfair italic text-3xl text-[#e8702a]">
                  {service.number}
                </span>
                <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase pt-2">
                  {service.overline}
                </span>
              </div>
              <div>
                <h3 className="text-white text-2xl font-bold uppercase leading-tight mb-3">
                  {service.headline}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{service.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
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
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 self-start bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
          >
            Schedule a Call
            <ArrowUpRight size={16} />
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
  const [fade, setFade] = useState(0)
  const [active, setActive] = useState('Home')

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const vh = window.innerHeight

      // Hero background fades fully to black before the hero leaves the viewport
      setFade(Math.min(y / (vh * 0.75), 1))

      // Scrollspy for the nav pill
      const mid = y + vh / 2
      const contact = document.getElementById('contact')
      const service = document.getElementById('service')
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
      <Navbar active={active} />
      <Hero fade={fade} />
      <Service />
      <Contact />
    </div>
  )
}
