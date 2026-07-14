import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

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
  const [palette, setPalette] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)

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

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(bounds.width, 1)
      height = Math.max(bounds.height, 1)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = (time: number) => {
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

        if (pointer.active) {
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
      frame = window.requestAnimationFrame(draw)
    }

    resize()
    frame = window.requestAnimationFrame(draw)
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [])

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
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
  )
}
