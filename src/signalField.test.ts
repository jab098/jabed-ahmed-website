import { expect, it } from 'vitest'
import { getSignalPoint } from './signalField'

it('keeps all three projected formations finite and bounded through animation', () => {
  for (let formation = 0; formation < 3; formation++) {
    for (let time = 0; time <= 120; time += 15) {
      for (let u = 0; u <= 1; u += 0.1) {
        for (let v = 0; v <= 1; v += 0.1) {
          const point = getSignalPoint(u, v, time, formation)
          for (const value of Object.values(point)) {
            expect(Number.isFinite(value)).toBe(true)
            expect(Math.abs(value)).toBeLessThan(1.2)
          }
        }
      }
    }
  }
})

it('gives each formation a distinct silhouette', () => {
  const shapes = [0, 1, 2].map(formation => getSignalPoint(0.3, 0.4, 2, formation))
  expect(shapes[0]).not.toEqual(shapes[1])
  expect(shapes[1]).not.toEqual(shapes[2])
})

it('uses open signal sheets, not closed rings', () => {
  for (const formation of [0, 1, 2]) {
    const start = getSignalPoint(0, 0.5, 2, formation)
    const end = getSignalPoint(1, 0.5, 2, formation)
    expect(Math.hypot(end.x - start.x, end.y - start.y, end.depth - start.depth)).toBeGreaterThan(0.5)
  }
})

it('keeps a filled central signal instead of a hollow torus', () => {
  const centre = getSignalPoint(0.5, 0.5, 2, 0)
  expect(Math.hypot(centre.x, centre.y, centre.depth)).toBeLessThan(0.05)
})
