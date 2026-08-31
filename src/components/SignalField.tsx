import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Shuffle } from 'lucide-react'
import { getCanvasBackingStore } from '../canvasBudget'
import { getSignalPoint, SIGNAL_LAYERS } from '../signalField'
import { useReducedMotion } from '../useReducedMotion'

const GLYPHS = ['+', '/', '0', '1', ':', '=', '·', '#']
const FORMATIONS = ['CRYSTAL / 01', 'WEAVE / 02', 'STREAM / 03']

export function SignalField({ active }: { active: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = useRef({ x: 0, y: 0, active: false })
  const clock = useRef(0)
  const [formation, setFormation] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!active || !host || !canvas || navigator.userAgent.includes('jsdom')) return
    const context = canvas.getContext('2d')
    if (!context) return
    let width = 1
    let height = 1
    let frame = 0
    let visible = true
    let last = 0
    let settled = false
    const moving = !paused && !reduced
    const canRun = () => visible && !document.hidden && moving

    const draw = (timestamp: number) => {
      frame = 0
      if (moving && last) clock.current += Math.min(timestamp - last, 40) / 1000
      last = timestamp
      context.clearRect(0, 0, width, height)
      const compact = height < 360
      const rowsPerLayer = compact ? 12 : 18
      const rows = SIGNAL_LAYERS * rowsPerLayer
      const points = compact ? 20 : 34
      const scale = compact ? Math.min(width * 0.94, height * 1.2) : Math.min(width * 1.13, height * 0.94)
      const centreX = width * 0.5
      const centreY = height * (compact ? 0.5 : 0.52)
      const time = reduced ? 2 : clock.current + 2
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = `500 ${compact ? 7 : 9}px "JetBrains Mono", monospace`
      for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const layer = Math.floor(rowIndex / rowsPerLayer)
        const row = rowIndex % rowsPerLayer
        const v = (layer + row / (rowsPerLayer - 1) * 0.999999) / SIGNAL_LAYERS
        for (let step = 0; step < points; step++) {
          const point = getSignalPoint(step / (points - 1), v, time, formation)
          let x = centreX + point.x * scale
          let y = centreY + point.y * scale
          let intensity = 0
          if (pointer.current.active && moving) {
            const dx = x - pointer.current.x
            const dy = y - pointer.current.y
            const distance = Math.hypot(dx, dy)
            const radius = Math.min(width, height) * 0.26
            intensity = Math.max(0, 1 - distance / radius)
            if (distance > 0) {
              x += dx / distance * intensity * 17
              y += dy / distance * intensity * 17
            }
          }
          context.globalAlpha = Math.min(0.92, 0.2 + (point.depth + 0.8) * 0.47 + intensity * 0.3)
          context.fillStyle = intensity > 0.38 ? '#f1f0ec' : '#11100f'
          context.fillText(GLYPHS[(rowIndex * 3 + step * 7) % GLYPHS.length], x, y)
        }
      }
      context.globalAlpha = 1
      if (!settled) { settled = true; setReady(true) }
      if (canRun()) frame = requestAnimationFrame(draw)
    }

    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0 }
    const start = () => { if (!frame) frame = requestAnimationFrame(draw) }
    const resize = () => {
      const bounds = host.getBoundingClientRect()
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      const backing = getCanvasBackingStore(width, height, window.devicePixelRatio)
      canvas.width = backing.pixelWidth
      canvas.height = backing.pixelHeight
      context.setTransform(backing.scaleX, 0, 0, backing.scaleY, 0, 0)
      stop()
      start()
    }
    const observer = new ResizeObserver(resize)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    const onVisibility = () => { if (document.hidden) stop(); else if (visible) start() }
    resize()
    observer.observe(host)
    intersection.observe(host)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [active, formation, paused, reduced])

  return (
    <div className="signal-field" data-ready={ready} role="figure" aria-label="Animated data sculpture">
      <div ref={hostRef} className="signal-field__surface" aria-hidden="true"
        onPointerMove={event => {
          if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
          const bounds = event.currentTarget.getBoundingClientRect()
          pointer.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true }
        }}
        onPointerLeave={() => { pointer.current.active = false }}
      >
        <svg className="signal-field__fallback" viewBox="0 0 600 500">
          {Array.from({ length: SIGNAL_LAYERS }, (_, layer) => {
            const points = [[0, 0], [1, 0], [1, 0.999999], [0, 0.999999], [0, 0]].map(([u, v]) => {
              const point = getSignalPoint(u, (layer + v) / SIGNAL_LAYERS, 2, formation)
              return `${300 + point.x * 440},${250 + point.y * 440}`
            }).join(' ')
            return <polyline key={layer} points={points} />
          })}
        </svg>
        <canvas ref={canvasRef} />
      </div>
      <div className="signal-field__controls">
        <span className="signal-field__formation" aria-live="polite">{FORMATIONS[formation]}</span>
        <button type="button" aria-label="Next formation" onClick={() => setFormation(value => (value + 1) % FORMATIONS.length)}><Shuffle size={14} aria-hidden="true" /><span>Reshape</span></button>
        <button type="button" aria-label={paused || reduced ? 'Play artwork' : 'Pause artwork'} disabled={reduced} onClick={() => setPaused(value => !value)}>
          {paused || reduced ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span>{reduced ? 'Still' : paused ? 'Play' : 'Pause'}</span>
        </button>
      </div>
    </div>
  )
}
