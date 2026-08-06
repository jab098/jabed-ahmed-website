import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

export const AUTO_ADVANCE_MS = 4000
export const RESUME_DELAY_MS = 5000

const POINTER_FOCUS_WINDOW_MS = 300

/**
 * Drives a section that cycles through its own states on a timer instead of on scroll distance.
 *
 * The timer only runs while the section is on screen and never under reduced motion. Keyboard
 * focus inside the section holds it (WCAG 2.2.2); a pointer click that happens to focus a control
 * does not, because a visitor selecting a state wants the longer resume delay instead of a
 * permanent stop. `held` is for callers that add their own hold, such as hover.
 *
 * Returns `defer`: restart the timer with the longer resume delay after the visitor takes over.
 */
export function useAutoAdvance(
  rootRef: RefObject<HTMLElement | null>,
  advance: () => void,
  held = false,
) {
  const [inView, setInView] = useState(false)
  const [focusHeld, setFocusHeld] = useState(false)
  const [delay, setDelay] = useState<number>(AUTO_ADVANCE_MS)
  const [cycle, setCycle] = useState(0)
  const advanceRef = useRef(advance)
  advanceRef.current = advance

  const defer = useCallback(() => {
    setDelay(RESUME_DELAY_MS)
    setCycle((value) => value + 1)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    )
    observer.observe(root)

    let pointerFocusAt = 0
    const onPointerDown = () => {
      pointerFocusAt = performance.now()
    }
    const onFocusIn = () => {
      if (performance.now() - pointerFocusAt < POINTER_FOCUS_WINDOW_MS) return
      setFocusHeld(true)
    }
    const onFocusOut = () => {
      setFocusHeld(false)
      defer()
    }

    root.addEventListener('pointerdown', onPointerDown, true)
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    return () => {
      observer.disconnect()
      root.removeEventListener('pointerdown', onPointerDown, true)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
    }
  }, [defer, rootRef])

  useEffect(() => {
    if (!inView || held || focusHeld) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setTimeout(() => {
      advanceRef.current()
      setDelay(AUTO_ADVANCE_MS)
      setCycle((value) => value + 1)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [cycle, delay, focusHeld, held, inView])

  return defer
}
