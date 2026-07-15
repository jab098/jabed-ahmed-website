export type Direction = -1 | 1

export type ScrollWaypoint = {
  id: string
  y: number
  priority?: number
}

export type WheelInput = {
  ctrlKey: boolean
  deltaMode: number
  deltaX: number
  deltaY: number
  preventDefault: () => void
}

export type TouchPoint = {
  clientX: number
  clientY: number
}

export type TouchInput = {
  preventDefault: () => void
  touches: ArrayLike<TouchPoint>
}

export type AnimationRequest = {
  to: number
  duration: number
  onComplete: () => void
}

export type DirectorDependencies = {
  getScrollY: () => number
  getViewportHeight: () => number
  getWaypoints: () => ScrollWaypoint[]
  canClaim: (direction: Direction) => boolean
  writeScroll: (y: number) => void
  animate: (request: AnimationRequest) => (() => void) | void
  setTimer: (callback: () => void, delay: number) => unknown
  clearTimer: (timer: unknown) => void
}

const WAYPOINT_DEDUPE_EPSILON = 4
const WAYPOINT_ARRIVAL_TOLERANCE = 12
const MAXIMUM_GAP_RATIO = 0.82
const TOUCH_CLASSIFICATION_DISTANCE = 8
const TOUCH_VERTICAL_DOMINANCE = 1.25
const WHEEL_QUIET_MS = 180

function clamp(minimum: number, value: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export function normalizeWheelDelta(delta: number, mode: number, viewportHeight: number) {
  if (mode === 1) return delta * 16
  if (mode === 2) return delta * viewportHeight
  return delta
}

export function wheelIntentThreshold(viewportHeight: number) {
  return clamp(72, viewportHeight * 0.12, 120)
}

export function touchIntentThreshold(viewportHeight: number) {
  return clamp(56, viewportHeight * 0.1, 96)
}

export function handoffDuration(distance: number) {
  return clamp(520, 520 + Math.abs(distance) * 0.32, 980)
}

export function findDirectionalWaypoint(
  points: ScrollWaypoint[],
  currentY: number,
  direction: Direction,
) {
  if (direction === 1) {
    return points.find((point) => point.y > currentY + WAYPOINT_ARRIVAL_TOLERANCE)
  }

  return points.findLast((point) => point.y < currentY - WAYPOINT_ARRIVAL_TOLERANCE)
}

export function buildWaypointMap(
  points: ScrollWaypoint[],
  viewportHeight: number,
  maxY: number,
) {
  const sorted = points
    .filter((point) => Number.isFinite(point.y))
    .map((point) => ({ ...point, y: clamp(0, point.y, Math.max(0, maxY)) }))
    .sort((left, right) => left.y - right.y || (right.priority ?? 0) - (left.priority ?? 0))

  const authored = sorted.filter(
    (point, index) =>
      index === 0 || Math.abs(point.y - sorted[index - 1].y) > WAYPOINT_DEDUPE_EPSILON,
  )
  const maximumGap = Math.max(1, viewportHeight * MAXIMUM_GAP_RATIO)

  return authored.flatMap((point, index) => {
    const next = authored[index + 1]
    if (!next || next.y - point.y <= maximumGap) return [point]

    const segments = Math.ceil((next.y - point.y) / maximumGap)
    const continuations = Array.from({ length: segments - 1 }, (_, offset) => ({
      id: `${point.id}--continuation-${offset + 1}`,
      y: point.y + ((next.y - point.y) * (offset + 1)) / segments,
      priority: 0,
    }))

    return [point, ...continuations]
  })
}

type WheelSession = {
  accumulatedIntent: number
  committed: boolean
  direction: Direction
  origin: number
  target: number
}

type TouchSession = {
  claimed: boolean
  committed: boolean
  direction?: Direction
  origin: number
  startX: number
  startY: number
  target?: number
}

export class NarrativeGestureDirector {
  private animationActive = false
  private cancelAnimation?: () => void
  private destroyed = false
  private quietTimer?: unknown
  private rearmAfterAnimation = false
  private touch?: TouchSession
  private wheel?: WheelSession
  private readonly dependencies: DirectorDependencies

  constructor(dependencies: DirectorDependencies) {
    this.dependencies = dependencies
  }

  handleWheel(input: WheelInput) {
    if (this.destroyed || input.ctrlKey || Math.abs(input.deltaY) <= Math.abs(input.deltaX)) {
      return false
    }

    const delta = normalizeWheelDelta(
      input.deltaY,
      input.deltaMode,
      this.dependencies.getViewportHeight(),
    )
    if (!Number.isFinite(delta) || Math.abs(delta) < 0.01) return false

    const direction: Direction = delta > 0 ? 1 : -1
    if (!this.dependencies.canClaim(direction)) return false

    if (this.animationActive || this.wheel?.committed) {
      input.preventDefault()
      this.rearmAfterAnimation = false
      this.scheduleWheelQuiet()
      return true
    }

    if (this.wheel && this.wheel.direction !== direction) {
      this.clearQuietTimer()
      this.wheel = undefined
    }

    if (!this.wheel) {
      const origin = this.dependencies.getScrollY()
      const target = findDirectionalWaypoint(
        this.dependencies.getWaypoints(),
        origin,
        direction,
      )
      if (!target) return false

      this.wheel = {
        accumulatedIntent: 0,
        committed: false,
        direction,
        origin,
        target: target.y,
      }
    }

    input.preventDefault()
    const session = this.wheel
    session.accumulatedIntent += Math.abs(delta)
    const threshold = wheelIntentThreshold(this.dependencies.getViewportHeight())
    const targetDistance = Math.abs(session.target - session.origin)
    const previewDistance = Math.min(session.accumulatedIntent, threshold, targetDistance)
    this.dependencies.writeScroll(session.origin + session.direction * previewDistance)

    if (session.accumulatedIntent >= threshold || previewDistance >= targetDistance) {
      session.committed = true
      this.animateTo(session.target)
    }

    this.scheduleWheelQuiet()
    return true
  }

  handleTouchStart(input: TouchInput) {
    if (this.destroyed || this.animationActive || this.wheel?.committed || input.touches.length !== 1) {
      this.touch = undefined
      return
    }

    const touch = input.touches[0]
    this.touch = {
      claimed: false,
      committed: false,
      origin: this.dependencies.getScrollY(),
      startX: touch.clientX,
      startY: touch.clientY,
    }
  }

  handleTouchMove(input: TouchInput) {
    const session = this.touch
    if (this.destroyed || !session) return false

    if (input.touches.length !== 1) {
      if (session.claimed) this.dependencies.writeScroll(session.origin)
      this.touch = undefined
      return false
    }

    const touch = input.touches[0]
    const horizontalTravel = touch.clientX - session.startX
    const verticalTravel = session.startY - touch.clientY
    const absoluteHorizontal = Math.abs(horizontalTravel)
    const absoluteVertical = Math.abs(verticalTravel)

    if (!session.claimed) {
      if (Math.hypot(horizontalTravel, verticalTravel) < TOUCH_CLASSIFICATION_DISTANCE) {
        return false
      }
      if (absoluteVertical < absoluteHorizontal * TOUCH_VERTICAL_DOMINANCE) {
        this.touch = undefined
        return false
      }
    }

    const direction: Direction = verticalTravel >= 0 ? 1 : -1
    if (!session.claimed || session.direction !== direction) {
      if (!this.dependencies.canClaim(direction)) {
        this.touch = undefined
        return false
      }

      const target = findDirectionalWaypoint(
        this.dependencies.getWaypoints(),
        session.origin,
        direction,
      )
      if (!target) {
        this.touch = undefined
        return false
      }

      session.claimed = true
      session.committed = false
      session.direction = direction
      session.target = target.y
    }

    input.preventDefault()
    const target = session.target as number
    const targetDistance = Math.abs(target - session.origin)
    const previewDistance = Math.min(absoluteVertical, targetDistance)
    this.dependencies.writeScroll(session.origin + direction * previewDistance)
    session.committed =
      absoluteVertical >= touchIntentThreshold(this.dependencies.getViewportHeight()) ||
      previewDistance >= targetDistance
    return true
  }

  handleTouchEnd() {
    const session = this.touch
    if (!session?.claimed || session.target === undefined) {
      this.touch = undefined
      return false
    }

    const destination = session.committed ? session.target : session.origin
    this.touch = undefined
    this.animateTo(destination)
    return true
  }

  handleTouchCancel() {
    const origin = this.touch?.claimed ? this.touch.origin : undefined
    this.touch = undefined
    if (origin !== undefined) this.animateTo(origin)
  }

  goTo(y: number) {
    if (this.destroyed || !Number.isFinite(y)) return
    this.clearQuietTimer()
    this.wheel = undefined
    this.touch = undefined
    this.cancelActiveAnimation()
    this.animateTo(y)
  }

  destroy() {
    this.destroyed = true
    this.clearQuietTimer()
    this.cancelActiveAnimation()
    this.wheel = undefined
    this.touch = undefined
  }

  private animateTo(target: number, afterComplete?: () => void) {
    this.cancelActiveAnimation()
    this.animationActive = true
    let completedSynchronously = false
    const cancellation = this.dependencies.animate({
      to: target,
      duration: handoffDuration(target - this.dependencies.getScrollY()),
      onComplete: () => {
        completedSynchronously = true
        this.animationActive = false
        this.cancelAnimation = undefined
        this.dependencies.writeScroll(target)
        afterComplete?.()
        if (this.rearmAfterAnimation) {
          this.rearmAfterAnimation = false
          this.wheel = undefined
        }
      },
    })

    if (!completedSynchronously && cancellation) this.cancelAnimation = cancellation
  }

  private cancelActiveAnimation() {
    this.cancelAnimation?.()
    this.cancelAnimation = undefined
    this.animationActive = false
  }

  private scheduleWheelQuiet() {
    this.clearQuietTimer()
    this.quietTimer = this.dependencies.setTimer(() => {
      this.quietTimer = undefined
      const session = this.wheel
      if (!session) return
      if (this.animationActive) {
        this.rearmAfterAnimation = true
        return
      }
      if (session.committed) {
        this.wheel = undefined
        return
      }
      this.animateTo(session.origin, () => {
        this.wheel = undefined
      })
    }, WHEEL_QUIET_MS)
  }

  private clearQuietTimer() {
    if (this.quietTimer === undefined) return
    this.dependencies.clearTimer(this.quietTimer)
    this.quietTimer = undefined
  }
}
