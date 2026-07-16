export const MAX_CANVAS_PIXELS = 8_388_608
export const MAX_CANVAS_DIMENSION = 8_192
export const MAX_GLYPH_GRID_CELLS = 60_000

type CanvasBackingStore = {
  cssWidth: number
  cssHeight: number
  pixelWidth: number
  pixelHeight: number
  scaleX: number
  scaleY: number
}

type GlyphGrid = {
  spacing: number
  columns: number
  rows: number
}

const finitePositive = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback

export function getCanvasBackingStore(
  width: number,
  height: number,
  devicePixelRatio: number,
): CanvasBackingStore {
  const cssWidth = finitePositive(width, 1)
  const cssHeight = finitePositive(height, 1)
  const requestedRatio = Math.min(Math.max(finitePositive(devicePixelRatio, 1), 1), 2)
  const pixelBudgetRatio = Math.sqrt(MAX_CANVAS_PIXELS / (cssWidth * cssHeight))
  const dimensionRatio = Math.min(
    MAX_CANVAS_DIMENSION / cssWidth,
    MAX_CANVAS_DIMENSION / cssHeight,
  )
  const ratio = Math.min(requestedRatio, pixelBudgetRatio, dimensionRatio)
  const pixelWidth = Math.max(1, Math.floor(cssWidth * ratio))
  const pixelHeight = Math.max(1, Math.floor(cssHeight * ratio))

  return {
    cssWidth,
    cssHeight,
    pixelWidth,
    pixelHeight,
    scaleX: pixelWidth / cssWidth,
    scaleY: pixelHeight / cssHeight,
  }
}

export function getCappedGlyphGrid(
  width: number,
  height: number,
  requestedSpacing: number,
): GlyphGrid {
  const safeWidth = finitePositive(width, 1)
  const safeHeight = finitePositive(height, 1)
  let spacing = finitePositive(requestedSpacing, 8)
  let columns = Math.ceil(safeWidth / spacing) + 2
  let rows = Math.ceil(safeHeight / spacing) + 2

  if (columns * rows <= MAX_GLYPH_GRID_CELLS) {
    return { spacing, columns, rows }
  }

  const aspectRatio = safeWidth / safeHeight
  const maximumAxisCells = Math.floor(MAX_GLYPH_GRID_CELLS / 3)
  const proportionalColumns = Number.isFinite(aspectRatio)
    ? Math.floor(Math.sqrt(MAX_GLYPH_GRID_CELLS * aspectRatio))
    : maximumAxisCells
  const targetColumns = Math.min(maximumAxisCells, Math.max(3, proportionalColumns))
  const targetRows = Math.max(3, Math.floor(MAX_GLYPH_GRID_CELLS / targetColumns))
  spacing = Math.max(
    spacing,
    safeWidth / Math.max(targetColumns - 2, 1),
    safeHeight / Math.max(targetRows - 2, 1),
  )
  columns = Math.ceil(safeWidth / spacing) + 2
  rows = Math.ceil(safeHeight / spacing) + 2

  while (columns * rows > MAX_GLYPH_GRID_CELLS) {
    spacing *= 1.01
    columns = Math.ceil(safeWidth / spacing) + 2
    rows = Math.ceil(safeHeight / spacing) + 2
  }

  return { spacing, columns, rows }
}
