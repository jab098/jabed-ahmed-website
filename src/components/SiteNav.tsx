import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { CALENDLY_URL, EMAIL, NAV_LINKS } from '../data'
import { LogoMark } from './LogoMark'
import { MagneticLink } from './MagneticLink'

export function SiteNav() {
  const [hidden, setHidden] = useState(false)
  const [onDark, setOnDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<(typeof NAV_LINKS)[number]['href']>('#home')
  const progressRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lastY = window.scrollY
    let raf = 0
    const decisionRoom = document.querySelector<HTMLElement>(
      '[data-insights-stage="decision-room"]',
    )
    const sections = NAV_LINKS.map((link) => ({
      href: link.href,
      element: document.querySelector<HTMLElement>(link.href),
    }))

    const update = () => {
      raf = 0
      const y = window.scrollY
      const viewportHeight = window.innerHeight

      if (y <= viewportHeight * 0.45) setHidden(false)
      else if (y > lastY + 3) setHidden(true)
      else if (y < lastY - 3) setHidden(false)
      lastY = y

      const navigationAnchor = Math.min(150, viewportHeight * 0.24)
      const currentSection = sections.find(({ element }) => {
        const bounds = element?.getBoundingClientRect()
        return Boolean(bounds && bounds.top <= navigationAnchor && bounds.bottom > navigationAnchor)
      })
      if (currentSection) setActiveSection(currentSection.href)

      const roomBounds = decisionRoom?.getBoundingClientRect()
      setOnDark(Boolean(roomBounds && roomBounds.top < 92 && roomBounds.bottom > 92))

      const maxScroll = document.documentElement.scrollHeight - viewportHeight
      const progress = maxScroll > 0 ? Math.min(Math.max(y / maxScroll, 0), 1) : 0
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const menu = menuRef.current
    const focusable = menu
      ? Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
      : []
    const focusRaf = requestAnimationFrame(() => focusable[0]?.focus())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        return
      }
      if (event.key !== 'Tab' || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(focusRaf)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [menuOpen])

  const effectiveDark = onDark && !menuOpen
  const effectiveHidden = hidden && !menuOpen

  return (
    <nav
      className={`site-nav ${effectiveHidden ? 'is-hidden' : ''} ${effectiveDark ? 'is-dark' : ''} ${menuOpen ? 'is-menu-open' : ''}`}
      aria-label="Primary navigation"
    >
      <div className="site-nav-frame">
        <a href="#home" className="site-wordmark" onClick={() => setMenuOpen(false)}>
          <LogoMark size={20} className="site-wordmark-mark" />
          <span>Jabed Ahmed</span>
        </a>

        <div className="site-nav-links">
          {NAV_LINKS.map((link) => (
            <MagneticLink
              key={link.label}
              href={link.href}
              className={activeSection === link.href ? 'is-active' : ''}
              aria-current={activeSection === link.href ? 'page' : undefined}
            >
              {link.label}
            </MagneticLink>
          ))}
        </div>

        <div className="site-nav-consulting">
          <span>
            <i />
            Independent consulting
          </span>
          <a href={CALENDLY_URL} target="_blank" rel="noreferrer">
            Book an intro
            <ArrowUpRight size={13} strokeWidth={1.9} />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="site-menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-site-menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        ref={menuRef}
        id="mobile-site-menu"
        className={`mobile-menu-panel ${menuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal={menuOpen || undefined}
        aria-label="Site menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="mobile-menu-material" aria-hidden="true" />
        <div className="mobile-menu-inner">
          <p className="mobile-menu-kicker">Data &amp; analytics consulting</p>
          <div className="mobile-menu-links">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={activeSection === link.href ? 'is-active' : ''}
                aria-current={activeSection === link.href ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span className="font-data">{link.number}</span>
                <strong>{link.label}</strong>
                <ArrowUpRight size={19} strokeWidth={1.55} aria-hidden="true" />
              </a>
            ))}
          </div>

          <div className="mobile-menu-footer">
            <p>
              <span />
              Independent consulting · London / worldwide
            </p>
            <a href={`mailto:${EMAIL}`} className="mobile-menu-email">
              {EMAIL}
            </a>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="mobile-menu-call"
            >
              Book a 30-minute intro
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </a>
          </div>
        </div>
      </div>

      <span className="site-scroll-progress-track" aria-hidden="true">
        <span ref={progressRef} className="site-scroll-progress" />
      </span>
    </nav>
  )
}
