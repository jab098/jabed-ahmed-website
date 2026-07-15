import { useEffect } from 'react'
import {
  NarrativeGestureDirector,
  type ScrollWaypoint,
} from '../narrativeScroll'
import {
  createPreviewFollower,
  handoffEase,
  writeNarrativeScroll,
} from '../narrativeScrollAdapter'
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
    let faqLayoutChanging = false
    let faqLayoutFallbackTimer = 0
    let faqTransitionCompletionFrame = 0
    let rebuildFrame = 0
    let preserveViewportOnRebuild = false
    let waypoints: ScrollWaypoint[] = []
    const activeFaqTransitions = new Set<Element>()

    const previewFollower = createPreviewFollower({
      cancelFrame: (id) => window.cancelAnimationFrame(id),
      readScroll: () => window.scrollY,
      requestFrame: (callback) => window.requestAnimationFrame(callback),
      writeScroll: writeNarrativeScroll,
    })
    const writeScrollImmediately = (y: number) => {
      previewFollower.cancel()
      writeNarrativeScroll(y)
    }

    const rebuild = () => {
      rebuildFrame = 0
      const preserveViewport = preserveViewportOnRebuild
      preserveViewportOnRebuild = false
      waypoints = collectNarrativeWaypoints()
      director.reconcileWaypoints({ preserveViewport })
    }
    const scheduleRebuild = (preserveViewport = false) => {
      if (disposed) return
      preserveViewportOnRebuild ||= preserveViewport
      if (!rebuildFrame) rebuildFrame = window.requestAnimationFrame(rebuild)
    }
    const scheduleStandardRebuild = () => scheduleRebuild()

    const director = new NarrativeGestureDirector({
      animate: ({ to, duration, mode, onComplete }) => {
        previewFollower.cancel()
        const proxy = { y: window.scrollY }
        const tween = gsap.to(proxy, {
          y: to,
          duration: duration / 1_000,
          ease: handoffEase(mode),
          overwrite: true,
          onUpdate: () => writeNarrativeScroll(proxy.y),
          onComplete,
        })
        return () => tween.kill()
      },
      canClaim: (direction) =>
        document.documentElement.classList.contains('loader-complete') &&
        document.body.style.overflow !== 'hidden' &&
        !shouldYieldToNativeScroll(activeTarget, direction),
      clearTimer: (timer) => window.clearTimeout(timer as number),
      getScrollY: previewFollower.getRenderedPosition,
      getViewportHeight: () => window.innerHeight,
      getWaypoints: () => waypoints,
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      writeScroll: previewFollower.queue,
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
    const isFaqLayoutTransition = (event: TransitionEvent) =>
      event.target instanceof Element &&
      event.target.matches('.faq-answer-shell') &&
      event.propertyName === 'grid-template-rows'
    const markFaqLayoutChanging = () => {
      faqLayoutChanging = true
      window.cancelAnimationFrame(faqTransitionCompletionFrame)
      faqTransitionCompletionFrame = 0
      window.clearTimeout(faqLayoutFallbackTimer)
      faqLayoutFallbackTimer = window.setTimeout(() => {
        scheduleRebuild(true)
        faqLayoutChanging = false
        activeFaqTransitions.clear()
      }, 800)
    }
    const onTransitionRun = (event: TransitionEvent) => {
      if (!isFaqLayoutTransition(event)) return
      activeFaqTransitions.add(event.target as Element)
      markFaqLayoutChanging()
    }
    const onTransitionComplete = (event: TransitionEvent) => {
      if (!isFaqLayoutTransition(event)) return
      activeFaqTransitions.delete(event.target as Element)
      scheduleRebuild(true)
      if (activeFaqTransitions.size > 0) return
      window.clearTimeout(faqLayoutFallbackTimer)
      window.cancelAnimationFrame(faqTransitionCompletionFrame)
      faqTransitionCompletionFrame = window.requestAnimationFrame(() => {
        faqTransitionCompletionFrame = 0
        faqLayoutChanging = false
      })
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

    const resizeObserver = new ResizeObserver(() => scheduleRebuild(faqLayoutChanging))
    const nav = document.querySelector('.site-nav')
    const main = document.querySelector('main')
    const footer = document.querySelector('footer')
    if (nav) resizeObserver.observe(nav)
    if (main) resizeObserver.observe(main)
    if (footer) resizeObserver.observe(footer)
    const faqMutationObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.target instanceof Element && mutation.target.matches('.faq-item'))) {
        markFaqLayoutChanging()
        scheduleRebuild(true)
      }
    })
    const faqList = document.querySelector('.faq-list')
    if (faqList) {
      faqMutationObserver.observe(faqList, {
        attributeFilter: ['class'],
        attributes: true,
        subtree: true,
      })
    }

    document.documentElement.classList.add('narrative-scroll-active')
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchCancel, { passive: true })
    window.addEventListener('resize', scheduleStandardRebuild, { passive: true })
    window.addEventListener('orientationchange', scheduleStandardRebuild, { passive: true })
    window.addEventListener('site:loader-complete', onLoaderComplete)
    document.addEventListener('transitionrun', onTransitionRun)
    document.addEventListener('transitionend', onTransitionComplete)
    document.addEventListener('transitioncancel', onTransitionComplete)
    document.addEventListener('click', onDirectNavigation)
    ScrollTrigger.addEventListener('refresh', scheduleStandardRebuild)
    void document.fonts?.ready.then(scheduleStandardRebuild)
    scheduleRebuild()

    return () => {
      disposed = true
      director.destroy()
      window.cancelAnimationFrame(rebuildFrame)
      window.cancelAnimationFrame(faqTransitionCompletionFrame)
      window.clearTimeout(faqLayoutFallbackTimer)
      previewFollower.cancel()
      resizeObserver.disconnect()
      faqMutationObserver.disconnect()
      document.documentElement.classList.remove('narrative-scroll-active')
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchCancel)
      window.removeEventListener('resize', scheduleStandardRebuild)
      window.removeEventListener('orientationchange', scheduleStandardRebuild)
      window.removeEventListener('site:loader-complete', onLoaderComplete)
      document.removeEventListener('transitionrun', onTransitionRun)
      document.removeEventListener('transitionend', onTransitionComplete)
      document.removeEventListener('transitioncancel', onTransitionComplete)
      document.removeEventListener('click', onDirectNavigation)
      ScrollTrigger.removeEventListener('refresh', scheduleStandardRebuild)
    }
  }, [])

  return <span data-narrative-scroll-director aria-hidden="true" hidden />
}
