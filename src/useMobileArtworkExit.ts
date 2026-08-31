import { useEffect, useState, type RefObject } from 'react'
import { useReducedMotion } from './useReducedMotion'

/** Keep the mobile exit separate from the loader's entrance animation. */
export function useMobileArtworkExit(ref: RefObject<HTMLElement | null>) {
  const [opacity, setOpacity] = useState(1)
  const reduced = useReducedMotion()

  useEffect(() => {
    const artwork = ref.current
    if (!artwork) return
    const mobile = window.matchMedia('(max-width: 900px)')
    const nav = document.querySelector('.site-nav')
    let frame = 0

    const update = () => {
      frame = 0
      if (!mobile.matches) { setOpacity(1); return }
      const bounds = artwork.getBoundingClientRect()
      const navHeight = nav?.getBoundingClientRect().height ?? 0
      // Fade only while the artwork passes behind the navigation, not on entry.
      const remaining = bounds.height > 0
        ? Math.min(1, Math.max(0, (bounds.bottom - navHeight) / bounds.height))
        : 1
      setOpacity(reduced ? Number(remaining > 0) : remaining)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const onScroll = () => { if (mobile.matches) schedule() }
    const observer = new ResizeObserver(schedule)
    observer.observe(artwork)
    if (nav) observer.observe(nav)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    mobile.addEventListener('change', schedule)
    update()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', schedule)
      mobile.removeEventListener('change', schedule)
    }
  }, [ref, reduced])

  return opacity
}
