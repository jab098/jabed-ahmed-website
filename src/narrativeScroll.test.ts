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

function createDirectorHarness(
  positions: number[],
  initialY = positions[0],
  completeAnimationsSynchronously = true,
) {
  let scrollY = initialY
  let quietTimer = () => {}
  let animationCancellationCount = 0
  let pendingAnimationCompletion = () => {}
  const animations: number[] = []
  const immediateScrollWrites: number[] = []
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
    writeScrollImmediately: (y) => {
      scrollY = y
      immediateScrollWrites.push(y)
    },
    animate: ({ to, onComplete }) => {
      animations.push(to)
      scrollY = to
      pendingAnimationCompletion = onComplete
      if (completeAnimationsSynchronously) {
        pendingAnimationCompletion()
        pendingAnimationCompletion = () => {}
      }
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
    completeAnimation: () => {
      pendingAnimationCompletion()
      pendingAnimationCompletion = () => {}
    },
    director,
    get animationCancellationCount() {
      return animationCancellationCount
    },
    immediateScrollWrites,
    runQuietTimer: () => quietTimer(),
    scrollWrites,
  }
}

describe('narrative waypoint model', () => {
  it('sorts, clamps, and deduplicates authored positions without filling large gaps', () => {
    const points = buildWaypointMap(
      [
        { id: 'process-heading', y: 1800, priority: 2 },
        { id: 'proof-copy', y: 2, priority: 2 },
        { id: 'proof', y: 0, priority: 3 },
        { id: 'footer', y: 2400, priority: 3 },
      ],
      2000,
    )

    expect(points).toEqual([
      expect.objectContaining({ id: 'proof', y: 0 }),
      expect.objectContaining({ id: 'process-heading', y: 1800 }),
      expect.objectContaining({ id: 'footer', y: 2000 }),
    ])
    expect(points.some(({ id }) => id.includes('continuation'))).toBe(false)
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

  it('does not skip an unvisited destination just because it is nearby', () => {
    const points = [
      { id: 'proof', y: 500 },
      { id: 'metric-01', y: 900 },
    ]

    expect(findDirectionalWaypoint(points, 493, 1)?.id).toBe('proof')
    expect(findDirectionalWaypoint(points, 507, -1)?.id).toBe('proof')
  })

  it('does not skip an unvisited destination one to three pixels away', () => {
    const points = [
      { id: 'proof', y: 500 },
      { id: 'metric-01', y: 900 },
    ]

    expect(findDirectionalWaypoint(points, 497, 1)?.id).toBe('proof')
    expect(findDirectionalWaypoint(points, 503, -1)?.id).toBe('proof')
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

  it('keeps wheel momentum disarmed past a direct handoff until it is actually quiet', () => {
    const harness = createDirectorHarness([0, 600, 1200], 0, false)

    harness.director.goTo(600)
    expect(harness.director.handleWheel(wheelInput(10000))).toBe(true)
    harness.completeAnimation()
    expect(harness.director.handleWheel(wheelInput(10000))).toBe(true)
    expect(harness.animations).toEqual([600])

    harness.runQuietTimer()
    harness.director.handleWheel(wheelInput(10000))
    expect(harness.animations).toEqual([600, 1200])
  })

  it('keeps wheel momentum disarmed past a touch handoff until it is actually quiet', () => {
    const harness = createDirectorHarness([0, 600, 1200], 0, false)

    harness.director.handleTouchStart(touchInput(100, 700))
    harness.director.handleTouchMove(touchInput(100, 500))
    harness.director.handleTouchEnd()
    harness.director.handleWheel(wheelInput(10000))
    harness.completeAnimation()
    harness.director.handleWheel(wheelInput(10000))
    expect(harness.animations).toEqual([600])

    harness.runQuietTimer()
    harness.director.handleWheel(wheelInput(10000))
    expect(harness.animations).toEqual([600, 1200])
  })

  it('does not revisit the semantic destination it just settled after small layout drift', () => {
    const positions = [0, 500, 900]
    const harness = createDirectorHarness(positions)

    harness.director.handleWheel(wheelInput(10000))
    harness.runQuietTimer()
    positions[1] = 507
    harness.director.handleWheel(wheelInput(10000))

    expect(harness.animations).toEqual([500, 900])
  })

  it('re-resolves an active semantic target when waypoint geometry rebuilds', () => {
    const positions = [0, 600]
    const harness = createDirectorHarness(positions, 0, false)

    harness.director.handleWheel(wheelInput(10000))
    positions[1] = 650
    harness.director.reconcileWaypoints()

    expect(harness.animationCancellationCount).toBe(1)
    expect(harness.animations).toEqual([600, 650])
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

  it('returns to the original composition when a reversal also stays below threshold', () => {
    const harness = createDirectorHarness([0, 600])

    harness.director.handleWheel(wheelInput(40))
    harness.director.handleWheel(wheelInput(-20))
    harness.runQuietTimer()

    expect(harness.animations).toEqual([0])
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

  it('absorbs a new vertical touch while a handoff is still active', () => {
    const harness = createDirectorHarness([0, 600, 1200], 0, false)
    harness.director.handleWheel(wheelInput(10000))
    const move = touchInput(100, 560)

    harness.director.handleTouchStart(touchInput(100, 700))
    expect(harness.director.handleTouchMove(move)).toBe(true)
    expect(move.preventDefault).toHaveBeenCalledOnce()
    expect(harness.director.handleTouchEnd()).toBe(true)
    expect(harness.animations).toEqual([600])
  })

  it('settles a short touch drag back to its origin', () => {
    const harness = createDirectorHarness([0, 600])

    harness.director.handleTouchStart(touchInput(100, 700))
    harness.director.handleTouchMove(touchInput(100, 670))
    harness.director.handleTouchEnd()

    expect(harness.animations).toEqual([0])
  })

  it('settles a claimed touch cancellation back to its origin', () => {
    const harness = createDirectorHarness([0, 600])

    harness.director.handleTouchStart(touchInput(100, 700))
    harness.director.handleTouchMove(touchInput(100, 640))
    harness.director.handleTouchCancel()

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

  it('restores a claimed preview when a second finger turns it into multi-touch', () => {
    const harness = createDirectorHarness([0, 600])

    harness.director.handleTouchStart(touchInput(100, 700))
    harness.director.handleTouchMove(touchInput(100, 640))
    harness.director.handleTouchStart({
      preventDefault: vi.fn(),
      touches: [
        { clientX: 100, clientY: 640 },
        { clientX: 140, clientY: 640 },
      ],
    })

    expect(harness.immediateScrollWrites.at(-1)).toBe(0)
    expect(harness.director.handleTouchEnd()).toBe(false)
  })

  it('keeps a committed touch blocked after waypoint geometry rebuilds', () => {
    const positions = [0, 600]
    const harness = createDirectorHarness(positions, 0, false)
    const heldMove = touchInput(100, 480)

    harness.director.handleTouchStart(touchInput(100, 700))
    harness.director.handleTouchMove(touchInput(100, 500))
    positions[1] = 650
    harness.director.reconcileWaypoints()

    expect(harness.animations).toEqual([650])
    expect(harness.director.handleTouchMove(heldMove)).toBe(true)
    expect(heldMove.preventDefault).toHaveBeenCalledOnce()
    expect(harness.director.handleTouchEnd()).toBe(true)
    expect(harness.animations).toEqual([650])
  })

  it('returns an uncommitted touch to its refreshed origin and blocks it through release', () => {
    const positions = [0, 600]
    const harness = createDirectorHarness(positions, 0, false)
    const heldMove = touchInput(100, 620)

    harness.director.handleTouchStart(touchInput(100, 700))
    harness.director.handleTouchMove(touchInput(100, 660))
    positions[0] = 10
    positions[1] = 650
    harness.director.reconcileWaypoints()

    expect(harness.animations).toEqual([10])
    expect(harness.director.handleTouchMove(heldMove)).toBe(true)
    expect(heldMove.preventDefault).toHaveBeenCalledOnce()
    expect(harness.director.handleTouchEnd()).toBe(true)
    expect(harness.animations).toEqual([10])
  })

  it('preserves an unclassified blocked touch when geometry rebuilds mid-handoff', () => {
    const positions = [0, 600]
    const harness = createDirectorHarness(positions, 0, false)
    const heldMove = touchInput(100, 560)

    harness.director.goTo(600)
    harness.director.handleTouchStart(touchInput(100, 700))
    positions[1] = 650
    harness.director.reconcileWaypoints()

    expect(harness.animations).toEqual([600, 650])
    expect(harness.director.handleTouchMove(heldMove)).toBe(true)
    expect(heldMove.preventDefault).toHaveBeenCalledOnce()
    expect(harness.director.handleTouchEnd()).toBe(true)
  })
})
