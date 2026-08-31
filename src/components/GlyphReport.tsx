import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { getCanvasBackingStore, getCappedGlyphGrid } from '../canvasBudget'
import { useReducedMotion } from '../useReducedMotion'

const GLYPHS = ['+', '/', '0', '1', '=', ':', '%', '#', '·']
const GLYPH_FIELD_CONFIG = Object.freeze({
  spacing: 8,
  ambientDivisor: 3,
  minFontSize: 6,
  maxFontSize: 9,
  pointerRadiusRatio: 0.24,
  maxParallax: 12,
})

const SIGNAL_STEPS = [
  [126, 470], [158, 459], [190, 447], [222, 431], [254, 413], [286, 397],
  [318, 406], [350, 410], [382, 393], [414, 367], [446, 338], [478, 319],
  [510, 326], [542, 331], [574, 302], [606, 266], [638, 229], [670, 196], [710, 166],
] as const

type Rgba = readonly [number, number, number, number]
type Palette = { field: Rgba; ink: Rgba; quiet: Rgba; hover: Rgba }

const PALETTES: readonly Palette[] = [
  { field: [255, 90, 31, 1], ink: [17, 16, 15, 1], quiet: [17, 16, 15, 0.3], hover: [241, 240, 236, 1] },
  { field: [241, 240, 236, 1], ink: [17, 16, 15, 1], quiet: [17, 16, 15, 0.24], hover: [255, 90, 31, 1] },
  { field: [17, 16, 15, 1], ink: [255, 90, 31, 1], quiet: [255, 90, 31, 0.28], hover: [241, 240, 236, 1] },
] as const

type Point = {
  x: number
  y: number
  homeX: number
  homeY: number
  vx: number
  vy: number
  glyph: string
  glyphIndex: number
  emphasis: boolean
  phase: number
  depth: number
  seed: number
  morphAt: number
}

function isReportPoint(nx: number, ny: number) {
  const insideField = nx > 0.05 && nx < 0.97 && ny > 0.08 && ny < 0.91
  const gridX = [0.18, 0.34, 0.5, 0.66, 0.82].some((line) => Math.abs(nx - line) < 0.007)
  const gridY = [0.29, 0.44, 0.59, 0.74].some((line) => Math.abs(ny - line) < 0.009)
  const barOne = nx > 0.22 && nx < 0.27 && ny > 0.61 && ny < 0.75
  const barTwo = nx > 0.34 && nx < 0.39 && ny > 0.52 && ny < 0.75
  const barThree = nx > 0.46 && nx < 0.51 && ny > 0.42 && ny < 0.75
  const barFour = nx > 0.58 && nx < 0.63 && ny > 0.48 && ny < 0.75
  const barFive = nx > 0.7 && nx < 0.75 && ny > 0.32 && ny < 0.75
  const primary = Math.abs(ny - (0.68 - Math.sin((nx - 0.12) * 8.2) * 0.08 - (nx - 0.12) * 0.4)) < 0.027
  return {
    insideField,
    emphasis: gridX || gridY || barOne || barTwo || barThree || barFour || barFive || primary,
  }
}

const mixChannel = (from: number, to: number, amount: number) => from + (to - from) * amount
const mixColour = (from: Rgba, to: Rgba, amount: number): Rgba => [
  mixChannel(from[0], to[0], amount),
  mixChannel(from[1], to[1], amount),
  mixChannel(from[2], to[2], amount),
  mixChannel(from[3], to[3], amount),
]
const mixPalette = (from: Palette, to: Palette, amount: number): Palette => ({
  field: mixColour(from.field, to.field, amount),
  ink: mixColour(from.ink, to.ink, amount),
  quiet: mixColour(from.quiet, to.quiet, amount),
  hover: mixColour(from.hover, to.hover, amount),
})
const cssColour = ([red, green, blue, alpha]: Rgba) => `rgba(${red}, ${green}, ${blue}, ${alpha})`

export function GlyphReport({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hostRef = useRef<HTMLButtonElement>(null)
  const pointerRef = useRef({ x: -999, y: -999, active: false })
  const livePaletteRef = useRef<Palette>(PALETTES[0])
  const paletteTransitionRef = useRef({ from: PALETTES[0], to: PALETTES[0], started: 0 })
  const [palette, setPalette] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)
  const reducedMotion = useReducedMotion()
  const staticPalette = reducedMotion ? palette : 0

  useEffect(() => {
    paletteTransitionRef.current = {
      from: livePaletteRef.current,
      to: PALETTES[palette],
      started: typeof performance === 'undefined' ? 0 : performance.now(),
    }
  }, [palette])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host || navigator.userAgent.includes('jsdom')) return

    const context = canvas.getContext('2d')
    if (!context) return
    setCanvasReady(true)

    let frame = 0
    let points: Point[] = []
    let width = 0
    let height = 0
    let lastTime = performance.now()
    let parallaxX = 0
    let parallaxY = 0
    let resizeFrame = 0
    let intersecting = true

    const rebuild = () => {
      const bounds = host.getBoundingClientRect()
      width = Math.max(bounds.width, 1)
      height = Math.max(bounds.height, 1)
      const backingStore = getCanvasBackingStore(width, height, window.devicePixelRatio || 1)
      canvas.width = backingStore.pixelWidth
      canvas.height = backingStore.pixelHeight
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(backingStore.scaleX, 0, 0, backingStore.scaleY, 0, 0)

      const requestedSpacing = Math.max(7, Math.min(GLYPH_FIELD_CONFIG.spacing, width / 68))
      const { spacing, columns, rows } = getCappedGlyphGrid(width, height, requestedSpacing)
      points = []
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const homeX = column * spacing - spacing * 0.5
          const homeY = row * spacing
          const report = isReportPoint(homeX / width, homeY / height)
          if (
            !report.insideField
            || (!report.emphasis && (row * 7 + column * 13) % GLYPH_FIELD_CONFIG.ambientDivisor !== 0)
          ) continue
          const seed = row * 79 + column * 41
          const glyphIndex = Math.abs(seed) % GLYPHS.length
          const depth = 0.32 + ((seed % 17) / 17) * 0.68
          points.push({
            x: reducedMotion ? homeX : homeX + Math.sin(seed) * width * 0.46,
            y: reducedMotion ? homeY : homeY + Math.cos(seed * 0.7) * height * 0.42,
            homeX,
            homeY,
            vx: 0,
            vy: 0,
            glyph: GLYPHS[glyphIndex],
            glyphIndex,
            emphasis: report.emphasis,
            phase: (seed % 31) / 31,
            depth,
            seed,
            morphAt: performance.now() + 450 + (seed % 11) * 70,
          })
        }
      }
      host.dataset.glyphPoints = String(points.length)
    }

    const scheduleRebuild = () => {
      if (resizeFrame) return
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0
        rebuild()
        start()
      })
    }

    const shouldAnimate = () => intersecting && !document.hidden
    const stop = () => {
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
      const elapsed = Math.min((time - lastTime) / 16.67, 2)
      lastTime = time
      const transition = paletteTransitionRef.current
      const rawProgress = Math.min(Math.max((time - transition.started) / 680, 0), 1)
      const paletteProgress = reducedMotion ? 1 : 1 - Math.pow(1 - rawProgress, 3)
      const activePalette = mixPalette(transition.from, transition.to, paletteProgress)
      livePaletteRef.current = activePalette
      const pointer = pointerRef.current
      const targetParallaxX = pointer.active && !reducedMotion
        ? -((pointer.x / width) - 0.5) * GLYPH_FIELD_CONFIG.maxParallax
        : 0
      const targetParallaxY = pointer.active && !reducedMotion
        ? -((pointer.y / height) - 0.5) * GLYPH_FIELD_CONFIG.maxParallax
        : 0
      parallaxX += (targetParallaxX - parallaxX) * 0.055 * elapsed
      parallaxY += (targetParallaxY - parallaxY) * 0.055 * elapsed
      context.clearRect(0, 0, width, height)
      context.fillStyle = cssColour(activePalette.field)
      context.fillRect(0, 0, width, height)
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      const glyphSize = Math.max(
        GLYPH_FIELD_CONFIG.minFontSize,
        Math.min(GLYPH_FIELD_CONFIG.maxFontSize, width / 76),
      )
      context.font = `600 ${glyphSize}px "JetBrains Mono", monospace`

      for (const point of points) {
        const homeX = point.homeX + parallaxX * point.depth
        const homeY = point.homeY + parallaxY * point.depth
        let forceX = (homeX - point.x) * 0.048
        let forceY = (homeY - point.y) * 0.048
        let hoverInfluence = 0
        if (pointer.active && !reducedMotion) {
          const dx = point.x - pointer.x
          const dy = point.y - pointer.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const radius = Math.min(width, height) * GLYPH_FIELD_CONFIG.pointerRadiusRatio
          if (distance < radius && distance > 0) {
            hoverInfluence = Math.pow(1 - distance / radius, 1.45)
            const pressure = hoverInfluence * 1.05
            forceX += (dx / distance) * pressure
            forceY += (dy / distance) * pressure
          }
          if (distance < radius * 1.35 && time >= point.morphAt) {
            point.glyphIndex = (point.glyphIndex + 1 + (point.seed % 5)) % GLYPHS.length
            point.glyph = GLYPHS[point.glyphIndex]
            point.morphAt = time + 450 + point.phase * 750
          }
        }
        point.vx = (point.vx + forceX * elapsed) * 0.87
        point.vy = (point.vy + forceY * elapsed) * 0.87
        point.x += point.vx * elapsed
        point.y += point.vy * elapsed
        const ambientAlpha = reducedMotion
          ? 0.3
          : 0.27 + Math.sin(time * 0.0012 + point.phase * 6) * 0.07
        context.globalAlpha = Math.max(point.emphasis ? 0.82 : ambientAlpha, hoverInfluence * 0.96)
        const baseColour = point.emphasis ? activePalette.ink : activePalette.quiet
        context.fillStyle = cssColour(mixColour(baseColour, activePalette.hover, hoverInfluence * 0.94))
        context.fillText(point.glyph, point.x, point.y)
      }
      context.globalAlpha = 1
      if (!reducedMotion) frame = window.requestAnimationFrame(draw)
    }

    rebuild()
    start()
    const observer = new ResizeObserver(scheduleRebuild)
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
  }, [active, reducedMotion, staticPalette])

  const cyclePalette = () => setPalette((value) => (value + 1) % PALETTES.length)
  const updatePointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    pointerRef.current = { x, y, active: true }
    event.currentTarget.classList.add('is-probing')
    event.currentTarget.style.setProperty('--probe-x', `${x}px`)
    event.currentTarget.style.setProperty('--probe-y', `${y}px`)
    event.currentTarget.style.setProperty(
      '--report-shift-x',
      `${-((x / bounds.width) - 0.5) * GLYPH_FIELD_CONFIG.maxParallax * 0.42}px`,
    )
    event.currentTarget.style.setProperty(
      '--report-shift-y',
      `${-((y / bounds.height) - 0.5) * GLYPH_FIELD_CONFIG.maxParallax * 0.42}px`,
    )
  }

  return (
    <button
      ref={hostRef}
      type="button"
      className={`glyph-report${canvasReady ? ' is-canvas-ready' : ''}`}
      aria-label="Interactive analytics report. Activate to change colour"
      data-active={active}
      data-palette={palette}
      data-palette-transition="smooth"
      data-glyph-density="high"
      data-glyph-spacing={GLYPH_FIELD_CONFIG.spacing}
      data-ambient-divisor={GLYPH_FIELD_CONFIG.ambientDivisor}
      data-pointer-mode="parallax-morph"
      onClick={cyclePalette}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          cyclePalette()
        }
      }}
      onPointerMove={updatePointer}
      onPointerEnter={updatePointer}
      onPointerLeave={(event) => {
        pointerRef.current.active = false
        event.currentTarget.classList.remove('is-probing')
        event.currentTarget.style.setProperty('--report-shift-x', '0px')
        event.currentTarget.style.setProperty('--report-shift-y', '0px')
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <svg
        className="glyph-report__structure"
        data-analytics-structure
        viewBox="0 0 800 650"
        aria-hidden="true"
      >
        <g className="glyph-report__grid">
          <path d="M112 192H730M112 286H730M112 380H730M112 474H730" />
          <path d="M224 150V520M348 150V520M472 150V520M596 150V520M720 150V520" />
        </g>
        <g className="glyph-report__bar-set">
          <path d="M172 520V428H220V520Z" />
          <path d="M282 520V362H330V520Z" />
          <path d="M392 520V405H440V520Z" />
          <path d="M502 520V278H550V520Z" />
          <path d="M612 520V224H660V520Z" />
        </g>
        <g className="glyph-report__micro-trend">
          {SIGNAL_STEPS.map(([x, y], index) => (
            <g
              className="glyph-report__signal-step"
              style={{ '--step': index } as CSSProperties}
              key={`${x}-${y}`}
            >
              <rect data-signal-piece x={x - 9} y={y - 3} width={12 + (index % 3) * 3} height="5" />
              <rect data-signal-piece x={x + 7} y={y - 10} width="4" height={8 + (index % 4) * 2} />
              <circle data-signal-piece cx={x - 4} cy={y + 8} r={2.5 + (index % 2)} />
            </g>
          ))}
        </g>
      </svg>
      <span className="glyph-report__probe" data-analytics-probe aria-hidden="true">
        <i className="glyph-report__probe-x" />
        <i className="glyph-report__probe-y" />
      </span>
    </button>
  )
}
