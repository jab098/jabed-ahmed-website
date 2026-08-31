import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { getCanvasBackingStore } from '../canvasBudget'
import { useReducedMotion } from '../useReducedMotion'

const GLYPHS = ['0', '1', '+', '/', ':', '=', '%', '·', '#']
const COLOURS = ['#ff5a1f', '#f1f0ec', '#11100f']

type Particle = {
  stream: number
  offset: number
  speed: number
  glyph: string
}

export function FooterGlyphStream() {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: -999, y: -999, active: false })
  const paletteRef = useRef(0)
  const clockRef = useRef(0)
  const [palette, setPalette] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)
  const reducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const still = reducedMotion || paused
  const staticPalette = still ? palette : 0

  useEffect(() => { paletteRef.current = palette }, [palette])

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas || navigator.userAgent.includes('jsdom')) return
    const context = canvas.getContext('2d')
    if (!context) return
    setCanvasReady(true)

    const particles: Particle[] = Array.from({ length: 9 * 34 }, (_, index) => ({
      stream: index % 9,
      offset: ((index * 47) % 307) / 307,
      speed: 0.000025 + ((index * 13) % 9) * 0.000003,
      glyph: GLYPHS[(index * 19) % GLYPHS.length],
    }))
    let width = 0
    let height = 0
    let frame = 0
    let resizeFrame = 0
    let intersecting = true
    let lastFrame = 0

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      width = Math.max(bounds.width, 1)
      height = Math.max(bounds.height, 1)
      const backingStore = getCanvasBackingStore(width, height, window.devicePixelRatio || 1)
      canvas.width = backingStore.pixelWidth
      canvas.height = backingStore.pixelHeight
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(backingStore.scaleX, 0, 0, backingStore.scaleY, 0, 0)
    }

    const scheduleResize = () => {
      if (resizeFrame) return
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0
        resize()
        start()
      })
    }

    const shouldAnimate = () => intersecting && !document.hidden
    const stop = () => {
      lastFrame = 0
      if (!frame) return
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    const start = () => {
      if (!frame && shouldAnimate()) frame = window.requestAnimationFrame(draw)
    }

    const draw = (time: number) => {
      frame = 0
      if (!shouldAnimate()) return
      if (!still) {
        if (lastFrame) clockRef.current += Math.min(time - lastFrame, 40)
        lastFrame = time
      }
      time = clockRef.current
      context.clearRect(0, 0, width, height)
      context.font = `600 ${Math.max(8, Math.min(12, width / 130))}px "JetBrains Mono", monospace`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = COLOURS[paletteRef.current]
      const pointer = pointerRef.current

      for (const particle of particles) {
        const progress = (particle.offset + time * particle.speed) % 1
        const startX = ((particle.stream + 0.5) / 9) * width
        const convergence = Math.exp(-Math.pow(progress - 0.57, 2) / 0.035)
        let x = startX + (width * 0.5 - startX) * convergence * 0.82
        let y = progress * height
        x += Math.sin(progress * 18 + particle.stream * 1.7 + time * 0.0008) * (5 + 13 * (1 - convergence))

        if (pointer.active && !still) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const radius = Math.min(width, height) * 0.18
          if (distance < radius && distance > 0) {
            const pressure = (1 - distance / radius) * 55
            x += (dx / distance) * pressure
            y += (dy / distance) * pressure
          }
        }

        context.globalAlpha = 0.2 + convergence * 0.75
        context.fillText(particle.glyph, x, y)
      }
      context.globalAlpha = 1
      if (!still) frame = window.requestAnimationFrame(draw)
    }

    resize()
    start()
    const observer = new ResizeObserver(scheduleResize)
    observer.observe(host)
    const intersectionObserver = typeof IntersectionObserver === 'undefined'
      ? undefined
      : new IntersectionObserver(([entry]) => {
        intersecting = entry?.isIntersecting ?? false
        if (shouldAnimate()) start()
        else stop()
      })
    intersectionObserver?.observe(host)
    const onVisibilityChange = () => {
      if (shouldAnimate()) start()
      else stop()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      observer.disconnect()
      intersectionObserver?.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.cancelAnimationFrame(resizeFrame)
      window.cancelAnimationFrame(frame)
    }
  }, [still, staticPalette])

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (still || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerRef.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true }
  }

  return (
    <div
      ref={hostRef}
      className={`footer-glyphs${canvasReady ? ' is-canvas-ready' : ''}`}
      data-palette={palette}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointerRef.current.active = false }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <svg className="footer-glyphs__fallback" viewBox="0 0 1400 850" aria-hidden="true">
        <defs>
          <pattern id="footer-glyph-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <text x="5" y="16">+</text>
          </pattern>
        </defs>
        {[110, 250, 390, 530, 700, 870, 1010, 1150, 1290].map((x, index) => (
          <path key={x} d={`M${x} -20 C${x + (700 - x) * 0.15} 250, ${700 + (index - 4) * 18} 390, ${700 + (index - 4) * 32} 880`} />
        ))}
        <ellipse cx="700" cy="465" rx="165" ry="84" fill="url(#footer-glyph-pattern)" />
      </svg>
      <div className="footer-glyphs__core" aria-hidden="true"><span>DECISION</span><strong>01</strong></div>
      <div className="footer-artwork-header">
        <div className="signal-footer__top">
          <span>JA / DATA</span>
          <span>Signals into decisions</span>
        </div>
        <div className="footer-artwork-controls">
          <button type="button" className="footer-motion-control" disabled={reducedMotion}
            aria-label={still ? 'Play footer artwork' : 'Pause footer artwork'}
            onClick={() => setPaused(value => !value)}>{reducedMotion ? 'Still' : paused ? 'Play' : 'Pause'}</button>
          <button
            type="button"
            className="footer-colour-control"
            aria-label="Change colour"
            data-palette={palette}
            onClick={() => setPalette((value) => (value + 1) % COLOURS.length)}
          >
            <kbd>C</kbd><span>Change colour</span>
          </button>
        </div>
      </div>
    </div>
  )
}
