import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

declare global {
  interface Window {
    __loaderFallback?: number
  }
}

type PageLoaderProps = {
  onComplete?: () => void
}

export function PageLoader({ onComplete }: PageLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    document.documentElement.classList.add('is-loading')
    document.body.style.overflow = 'hidden'

    let timeline: gsap.core.Timeline | undefined
    let safetyTimer = 0

    const finish = () => {
      if (completedRef.current) return
      completedRef.current = true
      timeline?.kill()
      window.clearTimeout(safetyTimer)
      window.clearTimeout(window.__loaderFallback)
      window.__loaderFallback = undefined
      document.documentElement.classList.remove('is-loading')
      document.documentElement.classList.add('loader-complete')
      document.body.style.overflow = ''
      window.dispatchEvent(new Event('site:loader-complete'))
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (location.hash && navigation?.type !== 'back_forward') {
        try {
          document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant', block: 'start' })
        } catch { /* An invalid fragment must not block the entrance. */ }
      }
      onComplete?.()
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      safetyTimer = window.setTimeout(finish, 80)
    } else {
      const context = gsap.context(() => {
        timeline = gsap
          .timeline({ defaults: { ease: 'power4.inOut' } })
          .set('.loader-mark__glyph', { yPercent: 125, opacity: 0 })
          .set('.loader-scan', { scaleX: 0 })
          .to('.loader-mark__glyph', {
            yPercent: 0,
            opacity: 1,
            duration: 0.42,
            stagger: 0.055,
            ease: 'expo.out',
          })
          .to('.loader-mark', { letterSpacing: '0.08em', duration: 0.65 }, '-=0.18')
          .to('.loader-plane--ink', {
            clipPath: 'polygon(-18% 0, 118% 0, 118% 100%, -18% 100%)',
            duration: 0.72,
            ease: 'expo.inOut',
          })
          .to('.loader-mark', { color: '#ff5a1f', duration: 0.01 }, '<0.38')
          .to('.loader-mark', { opacity: 0, duration: 0.2 }, '>-0.02')
          .to('.loader-scan--signal', { scaleX: 1, duration: 0.32, transformOrigin: 'left' })
          .to('.loader-scan--paper', { scaleX: 1, duration: 0.38, transformOrigin: 'left' }, '-=0.12')
          .to(root, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.72,
            ease: 'expo.inOut',
            onComplete: finish,
          })
      }, root)

      safetyTimer = window.setTimeout(finish, 4000)
      return () => {
        context.revert()
        window.clearTimeout(safetyTimer)
        if (!completedRef.current) {
          document.body.style.overflow = ''
        }
      }
    }

    return () => window.clearTimeout(safetyTimer)
  }, [onComplete])

  return (
    <div ref={rootRef} className="page-loader" aria-label="Loading website">
      <div className="loader-plane loader-plane--signal" aria-hidden="true" />
      <div className="loader-plane loader-plane--ink" aria-hidden="true" />
      <span className="visually-hidden">JA / DATA</span>
      <div className="loader-mark" aria-hidden="true">
        {'JA / DATA'.split('').map((character, index) => (
          <span className="loader-mark__slot" key={`${character}-${index}`}>
            <span className="loader-mark__glyph">{character === ' ' ? '\u00a0' : character}</span>
          </span>
        ))}
      </div>
      <div className="loader-scan loader-scan--signal" aria-hidden="true" />
      <div className="loader-scan loader-scan--paper" aria-hidden="true" />
    </div>
  )
}
