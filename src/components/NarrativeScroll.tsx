import { useEffect } from 'react'
import { NarrativeGestureDirector, type ScrollWaypoint } from '../narrativeScroll'
import { collectNarrativeWaypoints, shouldYieldToNativeScroll } from '../narrativeScrollDom'
import {
  gsap,
  REDUCED_MOTION_QUERY,
  registerMotion,
  ScrollTrigger,
} from '../motion'

export function NarrativeScroll() {
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

    registerMotion()
    let activeTarget: EventTarget | null = null
    let disposed = false
    let frame = 0
    let waypoints: ScrollWaypoint[] = []

    const rebuild = () => {
      frame = 0
      waypoints = collectNarrativeWaypoints()
    }
    const scheduleRebuild = () => {
      if (disposed) return
      if (!frame) frame = window.requestAnimationFrame(rebuild)
    }

    const director = new NarrativeGestureDirector({
      animate: ({ to, duration, onComplete }) => {
        const proxy = { y: window.scrollY }
        const tween = gsap.to(proxy, {
          y: to,
          duration: duration / 1_000,
          ease: 'power3.inOut',
          overwrite: true,
          onUpdate: () => window.scrollTo(0, proxy.y),
          onComplete,
        })
        return () => tween.kill()
      },
      canClaim: (direction) =>
        document.documentElement.classList.contains('loader-complete') &&
        document.body.style.overflow !== 'hidden' &&
        !shouldYieldToNativeScroll(activeTarget, direction),
      clearTimer: (timer) => window.clearTimeout(timer as number),
      getScrollY: () => window.scrollY,
      getViewportHeight: () => window.innerHeight,
      getWaypoints: () => waypoints,
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      writeScroll: (y) => window.scrollTo(0, y),
    })

    const onWheel = (event: WheelEvent) => {
      activeTarget = event.target
      director.handleWheel(event)
    }
    const onTouchStart = (event: TouchEvent) => {
      activeTarget = event.target
      director.handleTouchStart(event)
    }
    const onTouchMove = (event: TouchEvent) => {
      activeTarget = event.target
      director.handleTouchMove(event)
    }
    const onTouchEnd = () => director.handleTouchEnd()
    const onTouchCancel = () => director.handleTouchCancel()
    const onLoaderComplete = () => {
      ScrollTrigger.refresh()
      scheduleRebuild()
    }
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target instanceof Element && event.target.closest('.faq-item')) scheduleRebuild()
    }

    const resizeObserver = new ResizeObserver(scheduleRebuild)
    const nav = document.querySelector('.site-nav')
    const main = document.querySelector('main')
    const footer = document.querySelector('footer')
    if (nav) resizeObserver.observe(nav)
    if (main) resizeObserver.observe(main)
    if (footer) resizeObserver.observe(footer)

    document.documentElement.classList.add('narrative-scroll-active')
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchCancel, { passive: true })
    window.addEventListener('resize', scheduleRebuild, { passive: true })
    window.addEventListener('orientationchange', scheduleRebuild, { passive: true })
    window.addEventListener('site:loader-complete', onLoaderComplete)
    document.addEventListener('transitionend', onTransitionEnd)
    ScrollTrigger.addEventListener('refresh', scheduleRebuild)
    void document.fonts?.ready.then(scheduleRebuild)
    scheduleRebuild()

    return () => {
      disposed = true
      director.destroy()
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      document.documentElement.classList.remove('narrative-scroll-active')
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchCancel)
      window.removeEventListener('resize', scheduleRebuild)
      window.removeEventListener('orientationchange', scheduleRebuild)
      window.removeEventListener('site:loader-complete', onLoaderComplete)
      document.removeEventListener('transitionend', onTransitionEnd)
      ScrollTrigger.removeEventListener('refresh', scheduleRebuild)
    }
  }, [])

  return <span data-narrative-scroll-director aria-hidden="true" hidden />
}
