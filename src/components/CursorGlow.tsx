import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    // Touch devices have no persistent cursor to follow
    if (window.matchMedia('(pointer: coarse)').matches) return

    const half = glow.offsetWidth / 2
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let x = targetX
    let y = targetY
    let raf = 0

    // Lerp toward the cursor each frame — the gap between the glow and the
    // pointer closes exponentially, which reads as soft elastic trailing
    const tick = () => {
      x += (targetX - x) * 0.1
      y += (targetY - y) * 0.1
      glow.style.transform = `translate3d(${x - half}px, ${y - half}px, 0)`
      if (Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      glow.style.opacity = '1'
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => {
      glow.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}
