import { LOGOS, SERVICES } from '../data'
import { useReveal } from '../hooks'
import { SectionMarker } from './SectionMarker'

function LogoMarquee() {
  return (
    <div className="logo-marquee mt-20 md:mt-28" aria-label="Platforms and tools I work with">
      <div className="logo-marquee-fade">
        <div className="logo-marquee-track">
          {/* Three identical copies back to back: translating the track
              -33.33% (exactly one copy) lands on an identical frame, so the
              loop resets without a visible seam. With 20 logos a single copy
              is ~2300px wide, so two trailing copies cover any viewport. */}
          {[0, 1, 2].map((copy) => (
            <div className="logo-marquee-group" key={copy} aria-hidden={copy > 0}>
              {LOGOS.map((logo) => (
                <span key={logo.name} className="pill-streak inline-block leading-none">
                  <img
                    src={logo.src}
                    alt={copy === 0 ? logo.name : ''}
                    title={logo.name}
                    loading="lazy"
                    draggable={false}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* Each card observes itself, so it floats up when it scrolls into view —
   not when the section header does */
function ServiceCard({ service, index }: { service: (typeof SERVICES)[number]; index: number }) {
  // Deep threshold: the card only rises once most of it is actually in view
  const { ref, inView } = useReveal<HTMLElement>(0.5)

  // Pointer-tracked spotlight: position written straight to CSS vars, no
  // React state, so the glow follows the cursor at full frame rate
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--sx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    e.currentTarget.style.setProperty('--sy', `${((e.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      className={`rv-solo ${inView ? 'rv-solo-in' : ''} group card-spotlight glow-border-soft bg-white border border-black/10 rounded-[32px] p-8 flex flex-col relative min-h-[320px] shadow-md transition-[transform,box-shadow,border-color] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-2xl hover:border-[#00df8e]`}
      style={{ animationDelay: `${(index % 3) * 0.1}s` }}
    >
      <div className="flex items-start justify-between">
        {/* Bold numeric anchor in a solid brand-green tile */}
        <span className="w-10 h-10 rounded-xl bg-[#00df8e] text-black text-[15px] font-data font-semibold flex items-center justify-center">
          {service.number}
        </span>
        <span className="bg-black/[0.05] text-black/60 text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full">
          {service.overline}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <service.icon size={22} className="text-black/70 shrink-0" strokeWidth={1.8} />
        <h3 className="text-[26px] font-semibold leading-tight">{service.headline}</h3>
      </div>
      <p className="text-[14px] text-black/80 mt-4 flex-grow leading-relaxed">{service.blurb}</p>
      <div className="flex flex-wrap gap-2 mt-6">
        {service.stack.map((tech, j) => (
          <span
            key={tech}
            className="pill-streak bg-[#00df8e]/10 text-[#00996a] rounded-full px-3 py-1 text-[11px] font-medium"
            style={{ '--ps-delay': `${j * 70}ms` } as React.CSSProperties}
          >
            <span className="relative z-10">{tech}</span>
          </span>
        ))}
      </div>
    </article>
  )
}

export function Service() {
  const { ref, inView } = useReveal<HTMLElement>()
  return (
    <section
      ref={ref}
      id="service"
      className={`paper-section w-full px-6 lg:px-12 py-32 text-black ${inView ? 'rv-in' : ''}`}
    >
      {/* Header row */}
      <div className="flex justify-between items-end border-b border-black/10 pb-8">
        <div>
          <SectionMarker index={3} label="Service" />
          <h2 className="rv text-black leading-[0.98] mt-6" style={{ animationDelay: '0.1s' }}>
            <span
              className="block font-playfair italic font-normal text-[44px] md:text-[60px]"
              style={{ letterSpacing: '-0.05em' }}
            >
              The Complete
            </span>
            <span
              className="block font-normal text-[44px] md:text-[60px]"
              style={{ letterSpacing: '-0.08em' }}
            >
              data pipeline.
            </span>
          </h2>
        </div>
      </div>

      {/* Service cards — each floats up on its own scroll trigger */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        {SERVICES.map((service, i) => (
          <ServiceCard key={service.number} service={service} index={i} />
        ))}
      </div>

      <LogoMarquee />
    </section>
  )
}
