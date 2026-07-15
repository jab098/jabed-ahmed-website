import { describe, expect, it, vi } from 'vitest'
import {
  buildWaypointMap,
  findDirectionalWaypoint,
  handoffDuration,
  NarrativeGestureDirector,
  normalizeWheelDelta,
  touchIntentThreshold,
  wheelIntentThreshold,
} from './narrativeScroll'

const wheelInput = (deltaY: number, deltaX = 0) => ({
  ctrlKey: false,
  deltaMode: 0,
  deltaX,
  deltaY,
  preventDefault: vi.fn(),
})

const touchInput = (clientX: number, clientY: number) => ({
  preventDefault: vi.fn(),
  touches: [{ clientX, clientY }],
})

function createDirectorHarness(positions: number[], initialY = positions[0]) {
  let scrollY = initialY
  let quietTimer = () => {}
  let animationCancellationCount = 0
  const animations: number[] = []
  const scrollWrites: number[] = []
  const director = new NarrativeGestureDirector({
    getScrollY: () => scrollY,
    getViewportHeight: () => 800,
    getWaypoints: () => positions.map((y, index) => ({ id: `point-${index}`, y })),
    canClaim: () => true,
    writeScroll: (y) => {
      scrollY = y
      scrollWrites.push(y)
    },
    animate: ({ to, onComplete }) => {
      animations.push(to)
      scrollY = to
      onComplete()
      return () => {
        animationCancellationCount += 1
      }
    },
    setTimer: (callback) => {
      quietTimer = callback
      return 1
    },
    clearTimer: () => {},
  })

  return {
    animations,
    director,
    get animationCancellationCount() {
      return animationCancellationCount
    },
    runQuietTimer: () => quietTimer(),
    scrollWrites,
  }
}

describe('narrative waypoint model', () => {
  it('sorts and deduplicates authored positions before adding 82vh continuations', () => {
    const points = buildWaypointMap(
      [
        { id: 'contact', y: 1800, priority: 2 },
        { id: 'home-copy', y: 2, priority: 2 },
        { id: 'home', y: 0, priority: 3 },
      ],
      1000,
      2000,
    )

    expect(points[0]).toMatchObject({ id: 'home', y: 0 })
    expect(
      Math.max(...points.slice(1).map((point, index) => point.y - points[index].y)),
    ).toBeLessThanOrEqual(820)
  })

  it('normalizes pixel, line, and page wheel deltas', () => {
    expect(normalizeWheelDelta(12, 0, 800)).toBe(12)
    expect(normalizeWheelDelta(3, 1, 800)).toBe(48)
    expect(normalizeWheelDelta(1, 2, 800)).toBe(800)
  })

  it('resolves only the first destination in the requested direction', () => {
    const points = [
      { id: 'a', y: 0 },
      { id: 'b', y: 500 },
      { id: 'c', y: 1000 },
    ]

    expect(findDirectionalWaypoint(points, 20, 1)?.id).toBe('b')
    expect(findDirectionalWaypoint(points, 980, -1)?.id).toBe('b')
  })

  it('uses the approved adaptive thresholds and duration cap', () => {
    expect(wheelIntentThreshold(800)).toBe(96)
    expect(touchIntentThreshold(800)).toBe(80)
    expect(handoffDuration(2000)).toBe(980)
  })
})

describe('NarrativeGestureDirector', () => {
  it('clamps an extreme wheel event to one adjacent target', () => {
    const harness = createDirectorHarness([0, 600, 1200])
    const input = wheelInput(10000)

    expect(harness.director.handleWheel(input)).toBe(true)
    expect(input.preventDefault).toHaveBeenCalledOnce()
    expect(harness.animations).toEqual([600])
    expect(harness.scrollWrites.every((value) => value <= 600)).toBe(true)
  })

  it('absorbs momentum until the quiet timer rearms the director', () => {
    const harness = createDirectorHarness([0, 600, 1200])

    harness.director.handleWheel(wheelInput(10000))
    harness.director.handleWheel(wheelInput(10000))
    expect(harness.animations).toEqual([600])

    harness.runQuietTimer()
    harness.director.handleWheel(wheelInput(10000))
    expect(harness.animations).toEqual([600, 1200])
  })

  it('settles a sub-threshold wheel gesture back to its origin', () => {
    const harness = createDirectorHarness([0, 600])

    harness.director.handleWheel(wheelInput(20))
    expect(harness.animations).toEqual([])

    harness.runQuietTimer()
    expect(harness.animations).toEqual([0])
  })

  it('reverses toward the closest waypoint without crossing it', () => {
    const harness = createDirectorHarness([0, 600, 1200], 600)

    harness.director.handleWheel(wheelInput(40))
    harness.director.handleWheel(wheelInput(-10000))

    expect(harness.animations).toEqual([600])
    expect(harness.scrollWrites.every((value) => value >= 600 && value <= 1200)).toBe(true)
  })

  it('clamps a long touch swipe to one adjacent target', () => {
    const harness = createDirectorHarness([0, 600, 1200])
    const move = touchInput(100, -700)

    harness.director.handleTouchStart(touchInput(100, 700))
    expect(harness.director.handleTouchMove(move)).toBe(true)
    expect(move.preventDefault).toHaveBeenCalledOnce()
    harness.director.handleTouchEnd()

    expect(harness.animations).toEqual([600])
    expect(harness.scrollWrites.every((value) => value <= 600)).toBe(true)
  })

  it('settles a short touch drag back to its origin', () => {
    const harness = createDirectorHarness([0, 600])

    harness.director.handleTouchStart(touchInput(100, 700))
    harness.director.handleTouchMove(touchInput(100, 670))
    harness.director.handleTouchEnd()

    expect(harness.animations).toEqual([0])
  })

  it('leaves horizontal and multi-touch gestures native', () => {
    const harness = createDirectorHarness([0, 600])
    const horizontal = touchInput(300, 690)

    harness.director.handleTouchStart(touchInput(100, 700))
    expect(harness.director.handleTouchMove(horizontal)).toBe(false)
    expect(horizontal.preventDefault).not.toHaveBeenCalled()

    harness.director.handleTouchStart({
      preventDefault: vi.fn(),
      touches: [
        { clientX: 100, clientY: 700 },
        { clientX: 140, clientY: 700 },
      ],
    })
    expect(harness.director.handleTouchMove(horizontal)).toBe(false)
  })
})
