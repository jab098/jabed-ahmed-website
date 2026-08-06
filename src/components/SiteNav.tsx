import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { CALENDLY_URL, EMAIL, NAV_LINKS } from '../data'

type NavMotionState = {
  y: number
  direction: -1 | 0 | 1
  travel: number
  hidden: boolean
}

const DESKTOP_FRAME_BREAKPOINT = 900
const FRAME_LANDING_TOLERANCE = 1

function isViewportFramedLanding(navHeight: number, viewportWidth: number) {
  if (viewportWidth <= DESKTOP_FRAME_BREAKPOINT) return false

  return Array.from(
    document.querySelectorAll('[data-scroll-frame="viewport"][data-scroll-waypoint]'),
  ).some((frame) => (
    Math.abs(frame.getBoundingClientRect().top - navHeight) <= FRAME_LANDING_TOLERANCE
  ))
}

function getNextNavMotionState(
  state: NavMotionState,
  nextY: number,
  viewportHeight: number,
  keepVisible: boolean,
): NavMotionState {
  const delta = nextY - state.y
  if (Math.abs(delta) < 1) {
    return { ...state, y: nextY, hidden: keepVisible ? false : state.hidden }
  }

  const direction: -1 | 1 = delta > 0 ? 1 : -1
  const travel = direction === state.direction ? state.travel + Math.abs(delta) : Math.abs(delta)
  let hidden = state.hidden

  if (nextY <= 80 || keepVisible) hidden = false
  else if (direction === 1 && nextY > viewportHeight * 0.55 && travel >= 48) hidden = true
  else if (direction === -1 && travel >= 56) hidden = false

  return { y: nextY, direction, travel, hidden }
}

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let motion: NavMotionState = { y: window.scrollY, direction: 0, travel: 0, hidden: false }
    let frame = 0
    const update = () => {
      frame = 0
      const keepVisible = isViewportFramedLanding(
        navRef.current?.getBoundingClientRect().height ?? 0,
        window.innerWidth,
      )
      const next = getNextNavMotionState(
        motion,
        window.scrollY,
        window.innerHeight,
        keepVisible,
      )
      if (next.hidden !== motion.hidden) setHidden(next.hidden)
      motion = next
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const panel = menuRef.current
    const trigger = triggerRef.current
    const focusable = Array.from(
      panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
    )
    const frame = window.requestAnimationFrame(() => focusable[0]?.focus())
    const previousOverflow = document.body.style.overflow

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        return
      }
      if (event.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav
      ref={navRef}
      className={`site-nav${hidden && !menuOpen ? ' is-hidden' : ''}${menuOpen ? ' is-open' : ''}`}
      aria-label="Primary navigation"
    >
      <a className="site-wordmark" href="#home" aria-label="Jabed Ahmed — home" onClick={closeMenu}>
        <span className="site-wordmark__monogram">JA</span>
        <span className="site-wordmark__name">Jabed Ahmed</span>
      </a>

      <div className="site-nav__status" aria-hidden="true">
        <span /> Independent data consultancy
      </div>

      <a className="site-nav__call" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
        <span>Schedule a call</span>
        <ArrowUpRight size={17} strokeWidth={1.6} />
      </a>

      <button
        ref={triggerRef}
        className="site-menu-toggle"
        type="button"
        aria-label="Menu"
        aria-controls="site-menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span className="site-menu-toggle__label" key={menuOpen ? 'close' : 'menu'}>
          {menuOpen ? 'CLOSE' : 'MENU'}
        </span>
        <i aria-hidden="true"><b /><b /></i>
      </button>

      <div
        ref={menuRef}
        id="site-menu"
        className="site-menu"
        role="dialog"
        aria-modal={menuOpen || undefined}
        aria-label="Site menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="site-menu__wipe site-menu__wipe--signal" aria-hidden="true" />
        <div className="site-menu__wipe site-menu__wipe--ink" aria-hidden="true" />
        <div className="site-menu__header" data-menu-fade>
          <span>Navigation / 2026</span>
          <span>London → Worldwide</span>
        </div>
        <div className="site-menu__links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu} data-menu-fade>
              <span>{link.number}</span>
              <strong>{link.label}</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="site-menu__footer" data-menu-fade>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <span>Make the data useful.</span>
        </div>
      </div>
    </nav>
  )
}
