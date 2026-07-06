import { useEffect, useRef, useState } from 'react'

/* One-shot IntersectionObserver reveal: adds .rv-in to the section so its
   .rv children play the fadeUpSmooth entrance with their inline delays */
export function useReveal<T extends HTMLElement>(threshold = 0.12, rootMargin = '0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, inView }
}

/* Magnetic CTAs: the button stays exactly in place and keeps its shape — it
   only grows as the cursor approaches, from 1 at the edge of the radius up
   to a capped maximum right over the button. The slow lerp gives it the
   unhurried feel of the landing-page background, and the same lerp eases it
   back down when the cursor retreats. The rAF loop self-stops once settled. */
export function useMagnetic() {
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
