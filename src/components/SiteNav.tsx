import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../data'
import { LogoMark } from './LogoMark'
import { MagneticLink } from './MagneticLink'

/* Fixed site navigation. Stays with the user while scrolling; after about
   half a viewport of downward travel it animates away, and the slightest
   upward scroll animates it back. It switches to its light treatment only
   while crossing the dark Insights decision room. */
export function SiteNav() {
  const [hidden, setHidden] = useState(false)
  const [onDark, setOnDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let raf = 0
    const decisionRoom = document.querySelector<HTMLElement>(
      '[data-insights-stage="decision-room"]',
    )

    const update = () => {
      raf = 0
      const y = window.scrollY
      const vh = window.innerHeight
      if (y <= vh * 0.5) setHidden(false)
      else if (y > lastY + 2) setHidden(true)
      else if (y < lastY - 2) setHidden(false)
      lastY = y

      const roomBounds = decisionRoom?.getBoundingClientRect()
      setOnDark(Boolean(roomBounds && roomBounds.top < 90 && roomBounds.bottom > 90))
    }
    // Coalesce scroll bursts so state updates happen at most once per frame.
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

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[100] flex justify-between items-center px-10 md:px-12 lg:px-20 pt-10 md:pt-12 lg:pt-14 pb-4 transition-[opacity,transform] duration-700 ${
        hidden ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      <a href="#home" className="flex items-center gap-2.5">
        <LogoMark size={20} className="text-[#00df8e]" />
        <span
          className={`font-playfair italic text-xl tracking-wide transition-colors duration-300 ${
            onDark ? 'text-white' : 'text-black'
          }`}
        >
          Jabed Ahmed
        </span>
      </a>
      <div
        className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 backdrop-blur-md border rounded-full px-6 py-2 gap-6 text-[13px] font-medium transition-colors duration-300 ${
          onDark ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <MagneticLink
            key={link.label}
            href={link.href}
            className={`inline-block transition-colors ${
              onDark ? 'text-white/75 hover:text-white' : 'text-black/65 hover:text-black'
            }`}
          >
            {link.label}
          </MagneticLink>
        ))}
      </div>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className={`lg:hidden p-2 transition-colors ${onDark ? 'text-white' : 'text-black'}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu panel — self-coloured, so it works over any section */}
      {menuOpen && (
        <div className="menu-pop lg:hidden absolute top-full right-6 left-6 mt-1 rounded-2xl bg-[#0A0D10]/95 backdrop-blur-md border border-white/10 p-3 flex flex-col shadow-2xl">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-[15px] text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
