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
  writeScrollImmediately: (y: number) => void
  animate: (request: AnimationRequest) => (() => void) | void
  setTimer: (callback: () => void, delay: number) => unknown
  clearTimer: (timer: unknown) => void
}

const WAYPOINT_DEDUPE_EPSILON = 4
const DIRECTIONAL_EPSILON = 0.5
const SETTLED_LAYOUT_DRIFT_TOLERANCE = 12
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
    return points.find((point) => point.y > currentY + DIRECTIONAL_EPSILON)
  }

  return points.findLast((point) => point.y < currentY - DIRECTIONAL_EPSILON)
}

export function buildWaypointMap(
  points: ScrollWaypoint[],
  maxY: number,
) {
  const sorted = points
    .filter((point) => Number.isFinite(point.y))
    .map((point) => ({ ...point, y: clamp(0, point.y, Math.max(0, maxY)) }))
    .sort((left, right) => left.y - right.y || (right.priority ?? 0) - (left.priority ?? 0))

  return sorted.filter(
    (point, index) =>
      index === 0 || Math.abs(point.y - sorted[index - 1].y) > WAYPOINT_DEDUPE_EPSILON,
  )
}

type WheelSession = {
  accumulatedIntent: number
  committed: boolean
  direction: Direction
  origin: number
  settleOrigin: number
  target: number
  targetId: string
}

type TouchSession = {
  blocked: boolean
  claimed: boolean
  committed: boolean
  direction?: Direction
  origin: number
  startX: number
  startY: number
  target?: number
  targetId?: string
}

export class NarrativeGestureDirector {
  private animationActive = false
  private activeTargetId?: string
  private cancelAnimation?: () => void
  private destroyed = false
  private lastSettledWaypoint?: ScrollWaypoint
  private quietTimer?: unknown
  private rearmAfterAnimation = false
  private touch?: TouchSession
  private wheel?: WheelSession
  private wheelDisarmed = false
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

    if (this.animationActive || this.wheel?.committed || this.wheelDisarmed) {
      input.preventDefault()
      this.wheelDisarmed = true
      this.rearmAfterAnimation = false
      this.scheduleWheelQuiet()
      return true
    }

    let settleOrigin: number | undefined
    if (this.wheel && this.wheel.direction !== direction) {
      settleOrigin = this.wheel.settleOrigin
      this.clearQuietTimer()
      this.wheel = undefined
    }

    if (!this.wheel) {
      const origin = this.dependencies.getScrollY()
      const target = this.findGestureWaypoint(origin, direction)
      if (!target) return false

      this.wheel = {
        accumulatedIntent: 0,
        committed: false,
        direction,
        origin,
        settleOrigin: settleOrigin ?? origin,
        target: target.y,
        targetId: target.id,
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
      this.animateTo(session.target, undefined, session.targetId)
    }

    this.scheduleWheelQuiet()
    return true
  }

  handleTouchStart(input: TouchInput) {
    if (this.destroyed) {
      this.touch = undefined
      return
    }
    if (input.touches.length !== 1) {
      if (this.touch?.claimed && !this.touch.blocked) {
        this.dependencies.writeScrollImmediately(this.touch.origin)
      }
      this.touch = undefined
      return
    }

    const touch = input.touches[0]
    this.touch = {
      blocked: this.animationActive || Boolean(this.wheel?.committed),
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
      if (session.claimed && !session.blocked) {
        this.dependencies.writeScrollImmediately(session.origin)
      }
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
    if (session.blocked) {
      if (!this.dependencies.canClaim(direction)) {
        this.touch = undefined
        return false
      }
      input.preventDefault()
      session.claimed = true
      return true
    }

    if (!session.claimed || session.direction !== direction) {
      if (!this.dependencies.canClaim(direction)) {
        this.touch = undefined
        return false
      }

      const target = this.findGestureWaypoint(session.origin, direction)
      if (!target) {
        this.touch = undefined
        return false
      }

      session.claimed = true
      session.committed = false
      session.direction = direction
      session.target = target.y
      session.targetId = target.id
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
    if (session?.blocked) {
      this.touch = undefined
      return session.claimed
    }
    if (!session?.claimed || session.target === undefined) {
      this.touch = undefined
      return false
    }

    const destination = session.committed ? session.target : session.origin
    const destinationId = session.committed ? session.targetId : undefined
    this.touch = undefined
    this.animateTo(destination, undefined, destinationId)
    return true
  }

  handleTouchCancel() {
    const origin = this.touch?.claimed && !this.touch.blocked ? this.touch.origin : undefined
    this.touch = undefined
    if (origin !== undefined) this.animateTo(origin)
  }

  reconcileWaypoints() {
    if (this.destroyed) return
    const points = this.dependencies.getWaypoints()
    const currentY = this.dependencies.getScrollY()
    if (points.length === 0) return

    const hasActiveInteraction =
      this.animationActive || Boolean(this.wheel) || Boolean(this.touch?.claimed)
    if (!hasActiveInteraction) {
      const settled = this.lastSettledWaypoint
      if (!settled || Math.abs(currentY - settled.y) > WAYPOINT_DEDUPE_EPSILON) return
      const refreshed = points.find((point) => point.id === settled.id)
      if (!refreshed) {
        this.lastSettledWaypoint = undefined
        return
      }
      if (Math.abs(currentY - refreshed.y) > 0.5) this.dependencies.writeScroll(refreshed.y)
      this.lastSettledWaypoint = { ...refreshed }
      return
    }

    const preferredId =
      this.activeTargetId ??
      (this.wheel?.committed ? this.wheel.targetId : undefined) ??
      (this.touch?.committed ? this.touch.targetId : undefined)
    const anchorY =
      this.wheel && !this.wheel.committed
        ? this.wheel.settleOrigin
        : this.touch?.claimed && !this.touch.committed
          ? this.touch.origin
          : currentY
    const destination =
      points.find((point) => point.id === preferredId) ??
      points.reduce((closest, point) =>
        Math.abs(point.y - anchorY) < Math.abs(closest.y - anchorY) ? point : closest,
      )
    const committedWheel = this.wheel?.committed ? this.wheel : undefined
    const heldTouch = this.touch && (this.touch.blocked || this.touch.claimed)
      ? { ...this.touch, blocked: true, committed: false, target: undefined, targetId: undefined }
      : undefined
    const preserveWheelDisarm = this.wheelDisarmed

    if (committedWheel) {
      committedWheel.target = destination.y
      committedWheel.targetId = destination.id
    } else {
      this.clearQuietTimer()
      this.wheel = undefined
    }
    this.touch = heldTouch
    this.cancelActiveAnimation()

    if (Math.abs(currentY - destination.y) <= 0.5) {
      this.dependencies.writeScroll(destination.y)
      this.lastSettledWaypoint = { ...destination }
      if (preserveWheelDisarm) this.scheduleWheelQuiet()
      return
    }
    this.animateTo(destination.y, undefined, destination.id)
    if (preserveWheelDisarm) this.scheduleWheelQuiet()
  }

  goTo(y: number) {
    if (this.destroyed || !Number.isFinite(y)) return
    const preserveWheelDisarm = this.wheelDisarmed
    this.clearQuietTimer()
    this.wheel = undefined
    this.touch = undefined
    this.cancelActiveAnimation()
    const targetId = this.dependencies
      .getWaypoints()
      .find((point) => Math.abs(point.y - y) <= WAYPOINT_DEDUPE_EPSILON)?.id
    this.animateTo(y, undefined, targetId)
    if (preserveWheelDisarm) this.scheduleWheelQuiet()
  }

  destroy() {
    this.destroyed = true
    this.clearQuietTimer()
    this.cancelActiveAnimation()
    this.wheel = undefined
    this.touch = undefined
    this.lastSettledWaypoint = undefined
    this.wheelDisarmed = false
    this.rearmAfterAnimation = false
  }

  private animateTo(target: number, afterComplete?: () => void, targetId?: string) {
    this.cancelActiveAnimation()
    this.animationActive = true
    this.activeTargetId = targetId
    let completedSynchronously = false
    const cancellation = this.dependencies.animate({
      to: target,
      duration: handoffDuration(target - this.dependencies.getScrollY()),
      onComplete: () => {
        completedSynchronously = true
        this.animationActive = false
        this.activeTargetId = undefined
        this.cancelAnimation = undefined
        this.dependencies.writeScroll(target)
        if (targetId) this.lastSettledWaypoint = { id: targetId, y: target }
        afterComplete?.()
        if (this.rearmAfterAnimation) {
          this.rearmAfterAnimation = false
          this.wheel = undefined
          this.wheelDisarmed = false
        }
      },
    })

    if (!completedSynchronously && cancellation) this.cancelAnimation = cancellation
  }

  private cancelActiveAnimation() {
    this.cancelAnimation?.()
    this.activeTargetId = undefined
    this.cancelAnimation = undefined
    this.animationActive = false
  }

  private findGestureWaypoint(currentY: number, direction: Direction) {
    const points = this.dependencies.getWaypoints()
    const settled = this.lastSettledWaypoint
    if (!settled || Math.abs(currentY - settled.y) > SETTLED_LAYOUT_DRIFT_TOLERANCE) {
      this.lastSettledWaypoint = undefined
      return findDirectionalWaypoint(points, currentY, direction)
    }

    const refreshed = points.find((point) => point.id === settled.id)
    if (!refreshed || Math.abs(currentY - refreshed.y) > SETTLED_LAYOUT_DRIFT_TOLERANCE) {
      return findDirectionalWaypoint(points, currentY, direction)
    }
    return findDirectionalWaypoint(
      points.filter((point) => point.id !== settled.id),
      currentY,
      direction,
    )
  }

  private scheduleWheelQuiet() {
    this.clearQuietTimer()
    this.quietTimer = this.dependencies.setTimer(() => {
      this.quietTimer = undefined
      const session = this.wheel
      if (this.animationActive) {
        this.rearmAfterAnimation = true
        return
      }
      this.wheelDisarmed = false
      if (!session) return
      if (session.committed) {
        this.wheel = undefined
        return
      }
      this.animateTo(session.settleOrigin, () => {
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
