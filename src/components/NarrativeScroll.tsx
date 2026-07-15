import { useEffect } from 'react'
import { NarrativeGestureDirector, type ScrollWaypoint } from '../narrativeScroll'
import {
  collectNarrativeWaypoints,
  resolveDirectScrollTarget,
  shouldYieldToNativeScroll,
} from '../narrativeScrollDom'
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
    let rebuildFrame = 0
    let scrollFrame = 0
    let pendingScrollY: number | undefined
    let waypoints: ScrollWaypoint[] = []

    const flushScroll = () => {
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
      scrollFrame = 0
      if (pendingScrollY === undefined) return
      window.scrollTo(0, pendingScrollY)
      pendingScrollY = undefined
    }
    const queueScroll = (y: number) => {
      pendingScrollY = y
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(flushScroll)
    }
    const writeScrollImmediately = (y: number) => {
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
      scrollFrame = 0
      pendingScrollY = undefined
      window.scrollTo(0, y)
    }

    const rebuild = () => {
      rebuildFrame = 0
      waypoints = collectNarrativeWaypoints()
      director.reconcileWaypoints()
    }
    const scheduleRebuild = () => {
      if (disposed) return
      if (!rebuildFrame) rebuildFrame = window.requestAnimationFrame(rebuild)
    }

    const director = new NarrativeGestureDirector({
      animate: ({ to, duration, onComplete }) => {
        flushScroll()
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
      getScrollY: () => pendingScrollY ?? window.scrollY,
      getViewportHeight: () => window.innerHeight,
      getWaypoints: () => waypoints,
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      writeScroll: queueScroll,
      writeScrollImmediately,
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
    const onDirectNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !document.documentElement.classList.contains('loader-complete')
      ) {
        return
      }

      const target = event.target instanceof Element ? event.target : null
      if (!target) return

      const virtualControl = target.closest<HTMLElement>('[data-scroll-virtual]')
      if (virtualControl) {
        const id = virtualControl.dataset.scrollVirtual
        const waypoint = id ? waypoints.find((point) => point.id === id) : undefined
        if (!waypoint) return
        event.preventDefault()
        director.goTo(waypoint.y)
        return
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor || anchor.classList.contains('skip-link')) return
      const href = anchor.getAttribute('href')
      if (!href || href === '#') return
      const destination = document.getElementById(decodeURIComponent(href.slice(1)))
      if (!destination) return

      event.preventDefault()
      director.goTo(resolveDirectScrollTarget(destination, waypoints))
      window.history.pushState(null, '', href)
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
    document.addEventListener('click', onDirectNavigation)
    ScrollTrigger.addEventListener('refresh', scheduleRebuild)
    void document.fonts?.ready.then(scheduleRebuild)
    scheduleRebuild()

    return () => {
      disposed = true
      director.destroy()
      window.cancelAnimationFrame(rebuildFrame)
      window.cancelAnimationFrame(scrollFrame)
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
      document.removeEventListener('click', onDirectNavigation)
      ScrollTrigger.removeEventListener('refresh', scheduleRebuild)
    }
  }, [])

  return <span data-narrative-scroll-director aria-hidden="true" hidden />
}
