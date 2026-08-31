import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from './useReducedMotion'

export const AUTO_ADVANCE_MS = 4000
export const RESUME_DELAY_MS = 5000

const POINTER_FOCUS_WINDOW_MS = 300

/**
 * Drives a section that cycles through its own states on a timer instead of on scroll distance.
 *
 * The timer only runs while the section is on screen and never under reduced motion. Keyboard
 * focus inside the section temporarily holds playback. Explicit manual selection instead
 * pauses persistently. `held` is for callers that add their own temporary hold, such as hover.
 *
 * Manual selection pauses until explicitly resumed. Background tabs and keyboard focus hold
 * playback temporarily; reduced motion always keeps the sequence manual.
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
  const [userPaused, setUserPaused] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const reducedMotion = useReducedMotion()
  const paused = userPaused || reducedMotion
  const advanceRef = useRef(advance)
  advanceRef.current = advance

  const defer = useCallback(() => {
    setDelay(RESUME_DELAY_MS)
    setCycle((value) => value + 1)
  }, [])
  const pause = useCallback(() => setUserPaused(true), [])
  const resume = useCallback(() => {
    setUserPaused(false)
    setFocusHeld(false)
    setDelay(AUTO_ADVANCE_MS)
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
    const onFocusIn = (event: FocusEvent) => {
      if ((event.target as Element).closest('[data-sequence-control]')) return
      if (performance.now() - pointerFocusAt < POINTER_FOCUS_WINDOW_MS) return
      setFocusHeld(true)
    }
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return
      setFocusHeld(false)
      defer()
    }

    root.addEventListener('pointerdown', onPointerDown, true)
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    const onVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      root.removeEventListener('pointerdown', onPointerDown, true)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [defer, rootRef])

  useEffect(() => {
    if (!inView || held || focusHeld || paused || !pageVisible) return

    const timer = window.setTimeout(() => {
      advanceRef.current()
      setDelay(AUTO_ADVANCE_MS)
      setCycle((value) => value + 1)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [cycle, delay, focusHeld, held, inView, paused, pageVisible])

  return { paused, pause, resume, defer, reducedMotion }
}
