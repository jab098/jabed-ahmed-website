import { describe, expect, it } from 'vitest'
import {
  MAX_CANVAS_DIMENSION,
  MAX_CANVAS_PIXELS,
  MAX_GLYPH_GRID_CELLS,
  getCanvasBackingStore,
  getCappedGlyphGrid,
} from './canvasBudget'

describe('canvas resource budgets', () => {
  it('preserves normal high-density rendering inside the budget', () => {
    const layout = getCanvasBackingStore(1440, 900, 2)

    expect(layout.pixelWidth).toBe(2880)
    expect(layout.pixelHeight).toBe(1800)
    expect(layout.pixelWidth * layout.pixelHeight).toBeLessThanOrEqual(MAX_CANVAS_PIXELS)
  })

  it('bounds enormous or malformed canvas dimensions', () => {
    for (const [width, height, ratio] of [
      [100_000, 100_000, 4],
      [1_000_000, 1, 2],
      [1e308, 1e308, 2],
      [Number.POSITIVE_INFINITY, Number.NaN, Number.POSITIVE_INFINITY],
    ]) {
      const layout = getCanvasBackingStore(width, height, ratio)
      expect(layout.pixelWidth * layout.pixelHeight).toBeLessThanOrEqual(MAX_CANVAS_PIXELS)
      expect(layout.pixelWidth).toBeLessThanOrEqual(MAX_CANVAS_DIMENSION)
      expect(layout.pixelHeight).toBeLessThanOrEqual(MAX_CANVAS_DIMENSION)
      expect(layout.scaleX).toBeGreaterThan(0)
      expect(layout.scaleY).toBeGreaterThan(0)
    }
  })

  it('caps glyph-grid work while retaining normal spacing', () => {
    const normal = getCappedGlyphGrid(1440, 900, 8)
    const enormous = getCappedGlyphGrid(100_000, 100_000, 8)
    const numericExtreme = getCappedGlyphGrid(1e308, 1e308, 8)

    expect(normal.spacing).toBe(8)
    expect(normal.columns * normal.rows).toBeLessThanOrEqual(MAX_GLYPH_GRID_CELLS)
    expect(enormous.columns * enormous.rows).toBeLessThanOrEqual(MAX_GLYPH_GRID_CELLS)
    expect(enormous.spacing).toBeGreaterThan(8)
    expect(numericExtreme.columns * numericExtreme.rows).toBeLessThanOrEqual(MAX_GLYPH_GRID_CELLS)
    expect(Number.isFinite(numericExtreme.spacing)).toBe(true)
  })
})
