import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../data'
import { LogoMark } from './LogoMark'
import { MagneticLink } from './MagneticLink'

/* Fixed site navigation. Stays with the user while scrolling; after about
   half a viewport of downward travel it animates away, and the slightest
   upward scroll animates it back. Flips to a dark-on-light scheme while
   floating over the light middle sections. */
export function SiteNav() {
  const [hidden, setHidden] = useState(false)
  const [onLight, setOnLight] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let raf = 0
    // The section anchors never remount, so resolve them once instead of
    // querying the DOM on every scroll event
    const hero = document.getElementById('home')
    const contact = document.getElementById('contact')

    const update = () => {
      raf = 0
      const y = window.scrollY
      const vh = window.innerHeight
      if (y <= vh * 0.5) setHidden(false)
      else if (y > lastY + 2) setHidden(true)
      else if (y < lastY - 2) setHidden(false)
      lastY = y

      // Dark scheme over the hero and contact cards, light scheme between
      const overHero = hero ? hero.getBoundingClientRect().bottom > 120 : true
      const overContact = contact ? contact.getBoundingClientRect().top < 90 : false
      setOnLight(!overHero && !overContact)
    }
    // Coalesce scroll bursts to one layout read per frame — scroll can fire
    // several times a frame, and each update forces two rect measurements
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
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
            onLight ? 'text-black' : 'text-white'
          }`}
        >
          Jabed Ahmed
        </span>
      </a>
      <div
        className={`hidden md:flex absolute left-1/2 -translate-x-1/2 backdrop-blur-md border rounded-full px-6 py-2 gap-6 text-[13px] font-medium transition-colors duration-300 ${
          onLight ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <MagneticLink
            key={link.label}
            href={link.href}
            className={`inline-block transition-colors ${
              onLight ? 'text-black/65 hover:text-black' : 'text-white/75 hover:text-white'
            }`}
          >
            {link.label}
          </MagneticLink>
        ))}
      </div>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className={`md:hidden p-2 transition-colors ${onLight ? 'text-black' : 'text-white'}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu panel — self-coloured, so it works over any section */}
      {menuOpen && (
        <div className="menu-pop md:hidden absolute top-full right-6 left-6 mt-1 rounded-2xl bg-[#0A0D10]/95 backdrop-blur-md border border-white/10 p-3 flex flex-col shadow-2xl">
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
