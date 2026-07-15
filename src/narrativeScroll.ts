export type Direction = -1 | 1

export type HandoffMode = 'continue' | 'return' | 'direct'

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
  timeStamp: number
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
  mode: HandoffMode
  onComplete: () => void
}

export type ReconcileOptions = {
  preserveViewport?: boolean
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
const WHEEL_IMPULSE_GAP_MS = 72
const WHEEL_REBOUND_GAP_MS = 24
const WHEEL_DECAY_RATIO = 0.55
const WHEEL_REBOUND_RATIO = 1.8
const WHEEL_REBOUND_PEAK_RATIO = 0.32
const WHEEL_REBOUND_MINIMUM = 8
const PREVIEW_TIME_CONSTANT_MS = 55

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

export function returnDuration(distance: number) {
  return clamp(380, 340 + Math.abs(distance) * 1.6, 580)
}

export function wheelPreviewDistance(rawIntent: number, targetDistance: number) {
  return Math.min(Math.max(0, rawIntent) * 0.55, Math.max(0, targetDistance))
}

export function touchPreviewDistance(rawTravel: number, targetDistance: number) {
  return Math.min(Math.max(0, rawTravel) * 0.72, Math.max(0, targetDistance))
}

export function previewFollowPosition(
  current: number,
  target: number,
  elapsedMs: number,
) {
  const progress = 1 - Math.exp(-Math.max(0, elapsedMs) / PREVIEW_TIME_CONSTANT_MS)
  return current + (target - current) * progress
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

type QueuedWheelIntent = {
  accumulatedIntent: number
  committed: boolean
  direction: Direction
  quiet: boolean
}

type WheelStreamSample = {
  decayed: boolean
  deltaMode: number
  direction: Direction
  magnitude: number
  peakMagnitude: number
  timeStamp: number
}

type FollowOnOwner = 'touch' | 'wheel'

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
  private activeTargetY?: number
  private cancelAnimation?: () => void
  private destroyed = false
  private followOnOwner?: FollowOnOwner
  private lastSettledWaypoint?: ScrollWaypoint
  private lastSettledViewportDetached = false
  private quietTimer?: unknown
  private queuedTouchDirection?: Direction
  private queuedWheel?: QueuedWheelIntent
  private touch?: TouchSession
  private wheel?: WheelSession
  private wheelDisarmed = false
  private wheelSample?: WheelStreamSample
  private wheelStreamQuiet = false
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

    const magnitude = Math.abs(delta)
    const freshImpulse = this.observeWheelImpulse(
      direction,
      magnitude,
      input.deltaMode,
      input.timeStamp,
    )

    if (!this.animationActive && freshImpulse && (this.wheel?.committed || this.wheelDisarmed)) {
      this.clearQuietTimer()
      this.wheel = undefined
      this.queuedWheel = undefined
      this.followOnOwner = undefined
      this.wheelDisarmed = false
      this.wheelStreamQuiet = false
    }

    if (this.animationActive || this.wheel?.committed || this.wheelDisarmed) {
      input.preventDefault()
      if (
        this.animationActive &&
        (freshImpulse || this.queuedWheel || this.wheelStreamQuiet)
      ) {
        this.captureQueuedWheel(direction, magnitude)
      }
      this.wheelDisarmed = true
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
      const semanticOrigin = this.lastSettledViewportDetached && settleOrigin !== undefined
        ? settleOrigin
        : origin
      const target = this.findGestureWaypoint(semanticOrigin, direction)
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
    this.wheelStreamQuiet = false
    const session = this.wheel
    session.accumulatedIntent += Math.abs(delta)
    const threshold = wheelIntentThreshold(this.dependencies.getViewportHeight())
    const targetDistance = Math.abs(session.target - session.origin)
    const previewDistance = wheelPreviewDistance(session.accumulatedIntent, targetDistance)
    this.dependencies.writeScroll(session.origin + session.direction * previewDistance)

    if (session.accumulatedIntent >= threshold || session.accumulatedIntent >= targetDistance) {
      session.committed = true
      this.animateTo(session.target, undefined, session.targetId, 'continue')
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
      blocked: this.animationActive || Boolean(this.wheel?.committed) || this.wheelDisarmed,
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
      session.direction = direction
      session.committed = this.commitsProjectedFollowOn(
        direction,
        absoluteVertical,
        touchIntentThreshold(this.dependencies.getViewportHeight()),
      )
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
    const previewDistance = touchPreviewDistance(absoluteVertical, targetDistance)
    this.dependencies.writeScroll(session.origin + direction * previewDistance)
    session.committed =
      absoluteVertical >= touchIntentThreshold(this.dependencies.getViewportHeight()) ||
      absoluteVertical >= targetDistance
    return true
  }

  handleTouchEnd() {
    const session = this.touch
    if (session?.blocked) {
      this.touch = undefined
      if (session.claimed && session.committed && session.direction) {
        if (this.animationActive) {
          if (!this.followOnOwner) {
            this.clearQuietTimer()
            this.queuedWheel = undefined
            this.queuedTouchDirection = session.direction
            this.followOnOwner = 'touch'
            this.wheelStreamQuiet = false
          }
        } else {
          this.resetWheelState()
          this.startAdjacentHandoff(this.dependencies.getScrollY(), session.direction)
        }
      }
      return session.claimed
    }
    if (!session?.claimed || session.target === undefined) {
      this.touch = undefined
      return false
    }

    const destination = session.committed ? session.target : session.origin
    const destinationId = session.committed ? session.targetId : undefined
    const mode: HandoffMode = session.committed ? 'continue' : 'return'
    this.touch = undefined
    this.animateTo(destination, undefined, destinationId, mode)
    return true
  }

  handleTouchCancel() {
    const origin = this.touch?.claimed && !this.touch.blocked ? this.touch.origin : undefined
    this.touch = undefined
    if (origin !== undefined) this.animateTo(origin, undefined, undefined, 'return')
  }

  reconcileWaypoints({ preserveViewport = false }: ReconcileOptions = {}) {
    if (this.destroyed) return
    const points = this.dependencies.getWaypoints()
    const currentY = this.dependencies.getScrollY()
    if (points.length === 0) return

    const hasActiveInteraction =
      this.animationActive || Boolean(this.wheel) || Boolean(this.touch?.claimed)
    if (!hasActiveInteraction) {
      const settled = this.lastSettledWaypoint
      if (!settled || Math.abs(currentY - settled.y) > WAYPOINT_DEDUPE_EPSILON) {
        this.lastSettledViewportDetached = false
        return
      }
      const refreshed = points.find((point) => point.id === settled.id)
      if (!refreshed) {
        this.lastSettledWaypoint = undefined
        this.lastSettledViewportDetached = false
        return
      }
      if (preserveViewport || this.lastSettledViewportDetached) {
        this.lastSettledWaypoint = { ...refreshed, y: currentY }
        this.lastSettledViewportDetached = true
        return
      }
      if (Math.abs(currentY - refreshed.y) > 0.5) this.dependencies.writeScroll(refreshed.y)
      this.lastSettledWaypoint = { ...refreshed }
      this.lastSettledViewportDetached = false
      return
    }

    if (
      (preserveViewport || this.lastSettledViewportDetached) &&
      this.preservePendingPreview(points)
    ) return

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
      this.lastSettledViewportDetached = false
      const continuedAfterLanding = this.continueAfterLanding(destination.y)
      if (preserveWheelDisarm && !continuedAfterLanding) this.scheduleWheelQuiet()
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
    this.queuedWheel = undefined
    this.queuedTouchDirection = undefined
    this.followOnOwner = undefined
    this.wheelSample = undefined
    this.wheelStreamQuiet = false
    this.lastSettledViewportDetached = false
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
    this.queuedWheel = undefined
    this.queuedTouchDirection = undefined
    this.followOnOwner = undefined
    this.touch = undefined
    this.lastSettledWaypoint = undefined
    this.lastSettledViewportDetached = false
    this.wheelDisarmed = false
    this.wheelSample = undefined
    this.wheelStreamQuiet = false
  }

  private animateTo(
    target: number,
    afterComplete?: () => void,
    targetId?: string,
    mode: HandoffMode = 'direct',
  ) {
    this.cancelActiveAnimation()
    this.animationActive = true
    this.activeTargetId = targetId
    this.activeTargetY = target
    let completedSynchronously = false
    const distance = target - this.dependencies.getScrollY()
    const cancellation = this.dependencies.animate({
      to: target,
      duration: mode === 'return' ? returnDuration(distance) : handoffDuration(distance),
      mode,
      onComplete: () => {
        completedSynchronously = true
        this.animationActive = false
        this.activeTargetId = undefined
        this.activeTargetY = undefined
        this.cancelAnimation = undefined
        this.dependencies.writeScroll(target)
        if (targetId) {
          this.lastSettledWaypoint = { id: targetId, y: target }
          this.lastSettledViewportDetached = false
        }
        afterComplete?.()
        this.continueAfterLanding(target)
      },
    })

    if (!completedSynchronously && cancellation) this.cancelAnimation = cancellation
  }

  private cancelActiveAnimation() {
    this.cancelAnimation?.()
    this.activeTargetId = undefined
    this.activeTargetY = undefined
    this.cancelAnimation = undefined
    this.animationActive = false
  }

  private findGestureWaypoint(currentY: number, direction: Direction) {
    const points = this.dependencies.getWaypoints()
    const settled = this.lastSettledWaypoint
    if (!settled || Math.abs(currentY - settled.y) > SETTLED_LAYOUT_DRIFT_TOLERANCE) {
      this.lastSettledWaypoint = undefined
      this.lastSettledViewportDetached = false
      return findDirectionalWaypoint(points, currentY, direction)
    }

    const refreshed = points.find((point) => point.id === settled.id)
    if (!refreshed) {
      this.lastSettledWaypoint = undefined
      this.lastSettledViewportDetached = false
      return findDirectionalWaypoint(points, currentY, direction)
    }
    if (this.lastSettledViewportDetached) {
      return findDirectionalWaypoint(
        points.filter((point) => point.id !== settled.id),
        currentY,
        direction,
      )
    }
    if (Math.abs(currentY - refreshed.y) > SETTLED_LAYOUT_DRIFT_TOLERANCE) {
      return findDirectionalWaypoint(points, currentY, direction)
    }
    return findDirectionalWaypoint(
      points.filter((point) => point.id !== settled.id),
      currentY,
      direction,
    )
  }

  private preservePendingPreview(points: ScrollWaypoint[]) {
    if (this.activeTargetId) return false

    const wheel = this.wheel
    if (wheel && !wheel.committed) {
      const target = this.refreshPendingTarget(
        points,
        wheel.settleOrigin,
        wheel.direction,
        wheel.targetId,
      )
      if (target) {
        wheel.target = target.y
        wheel.targetId = target.id
      }
      return true
    }

    const touch = this.touch
    if (touch?.claimed && !touch.blocked && !touch.committed && touch.direction) {
      const target = this.refreshPendingTarget(
        points,
        touch.origin,
        touch.direction,
        touch.targetId,
      )
      if (target) {
        touch.target = target.y
        touch.targetId = target.id
      }
      return true
    }

    return this.animationActive
  }

  private refreshPendingTarget(
    points: ScrollWaypoint[],
    origin: number,
    direction: Direction,
    targetId?: string,
  ) {
    const settled = this.lastSettledWaypoint
    if (settled && Math.abs(origin - settled.y) <= SETTLED_LAYOUT_DRIFT_TOLERANCE) {
      const refreshedSettled = points.find((point) => point.id === settled.id)
      if (refreshedSettled) {
        this.lastSettledWaypoint = { ...refreshedSettled, y: origin }
        this.lastSettledViewportDetached = true
      }
    }

    const settledId = this.lastSettledViewportDetached
      ? this.lastSettledWaypoint?.id
      : undefined
    const existingTarget = targetId === settledId
      ? undefined
      : points.find((point) => point.id === targetId)
    if (existingTarget) return existingTarget

    return findDirectionalWaypoint(
      settledId ? points.filter((point) => point.id !== settledId) : points,
      origin,
      direction,
    )
  }

  private captureQueuedWheel(direction: Direction, intent: number) {
    const queued = this.queuedWheel
    if (this.followOnOwner) {
      if (this.followOnOwner === 'wheel' && queued) queued.quiet = false
    } else if (queued?.committed) {
      this.followOnOwner = 'wheel'
      queued.quiet = false
    } else if (!queued || queued.quiet || queued.direction !== direction) {
      this.queuedWheel = {
        accumulatedIntent: intent,
        committed: this.commitsProjectedFollowOn(
          direction,
          intent,
          wheelIntentThreshold(this.dependencies.getViewportHeight()),
        ),
        direction,
        quiet: false,
      }
    } else {
      queued.accumulatedIntent += intent
      queued.committed = this.commitsProjectedFollowOn(
        direction,
        queued.accumulatedIntent,
        wheelIntentThreshold(this.dependencies.getViewportHeight()),
      )
      queued.quiet = false
    }
    if (this.queuedWheel?.committed) this.followOnOwner = 'wheel'
    this.wheelStreamQuiet = false
  }

  private commitsProjectedFollowOn(
    direction: Direction,
    intent: number,
    threshold: number,
  ) {
    if (intent >= threshold) return true

    const currentY = this.dependencies.getScrollY()
    const settled = this.lastSettledWaypoint
    const origin = this.activeTargetY ?? (
      settled && Math.abs(currentY - settled.y) <= SETTLED_LAYOUT_DRIFT_TOLERANCE
        ? settled.y
        : currentY
    )

    const target = findDirectionalWaypoint(this.dependencies.getWaypoints(), origin, direction)
    return Boolean(target && intent >= Math.abs(target.y - origin))
  }

  private continueAfterLanding(target: number) {
    const queuedTouchDirection = this.queuedTouchDirection
    if (queuedTouchDirection) {
      this.resetWheelState(true)
      if (!this.startAdjacentHandoff(target, queuedTouchDirection)) {
        this.followOnOwner = undefined
      }
      return true
    }

    const queuedWheel = this.queuedWheel
    if (queuedWheel) {
      this.queuedWheel = undefined
      this.wheel = undefined
      this.wheelDisarmed = false
      this.wheelStreamQuiet = false
      this.startQueuedWheel(target, queuedWheel)
      return true
    }

    if (this.followOnOwner === 'touch') {
      this.resetWheelState()
      return true
    }

    if (this.wheelStreamQuiet) {
      this.resetWheelState()
      return true
    }

    return false
  }

  private startQueuedWheel(origin: number, queued: QueuedWheelIntent) {
    const target = this.findGestureWaypoint(origin, queued.direction)
    if (!target) {
      this.resetWheelState()
      return
    }

    const targetDistance = Math.abs(target.y - origin)
    const committed =
      queued.committed ||
      queued.accumulatedIntent >= wheelIntentThreshold(this.dependencies.getViewportHeight()) ||
      queued.accumulatedIntent >= targetDistance
    const session: WheelSession = {
      accumulatedIntent: queued.accumulatedIntent,
      committed,
      direction: queued.direction,
      origin,
      settleOrigin: origin,
      target: target.y,
      targetId: target.id,
    }

    if (committed) {
      this.followOnOwner = 'wheel'
      this.wheel = session
      this.wheelDisarmed = true
      this.wheelStreamQuiet = queued.quiet
      this.animateTo(target.y, undefined, target.id, 'continue')
      return
    }

    if (queued.quiet) {
      this.resetWheelState()
      return
    }

    this.wheel = session
    const previewDistance = wheelPreviewDistance(queued.accumulatedIntent, targetDistance)
    this.dependencies.writeScroll(origin + queued.direction * previewDistance)
  }

  private startAdjacentHandoff(origin: number, direction: Direction) {
    const target = this.findGestureWaypoint(origin, direction)
    if (!target) return false
    this.animateTo(target.y, undefined, target.id, 'continue')
    return true
  }

  private resetWheelState(preserveFollowOnOwner = false) {
    this.clearQuietTimer()
    this.wheel = undefined
    this.queuedWheel = undefined
    this.queuedTouchDirection = undefined
    if (!preserveFollowOnOwner) this.followOnOwner = undefined
    this.wheelDisarmed = false
    this.wheelSample = undefined
    this.wheelStreamQuiet = false
  }

  private observeWheelImpulse(
    direction: Direction,
    magnitude: number,
    deltaMode: number,
    timeStamp: number,
  ) {
    const previous = this.wheelSample
    const at = Number.isFinite(timeStamp) ? timeStamp : previous?.timeStamp ?? 0

    if (!previous || at < previous.timeStamp) {
      this.wheelSample = {
        decayed: false,
        deltaMode,
        direction,
        magnitude,
        peakMagnitude: magnitude,
        timeStamp: at,
      }
      return false
    }

    const gap = at - previous.timeStamp
    const canClassifyEarly = deltaMode === 0 && previous.deltaMode === 0
    const paused = canClassifyEarly && gap >= WHEEL_IMPULSE_GAP_MS
    const rebounded =
      canClassifyEarly &&
      gap >= WHEEL_REBOUND_GAP_MS &&
      previous.decayed &&
      magnitude >= WHEEL_REBOUND_MINIMUM &&
      magnitude >= previous.magnitude * WHEEL_REBOUND_RATIO &&
      magnitude >= previous.peakMagnitude * WHEEL_REBOUND_PEAK_RATIO
    const reversed =
      canClassifyEarly &&
      gap >= WHEEL_REBOUND_GAP_MS &&
      direction !== previous.direction &&
      magnitude >= Math.max(WHEEL_REBOUND_MINIMUM, previous.magnitude)
    const fresh = paused || rebounded || reversed

    if (fresh) {
      this.wheelSample = {
        decayed: false,
        deltaMode,
        direction,
        magnitude,
        peakMagnitude: magnitude,
        timeStamp: at,
      }
      return true
    }

    this.wheelSample = {
      decayed:
        previous.decayed ||
        magnitude <= previous.peakMagnitude * WHEEL_DECAY_RATIO,
      deltaMode,
      direction,
      magnitude,
      peakMagnitude: Math.max(previous.peakMagnitude, magnitude),
      timeStamp: at,
    }
    return false
  }

  private scheduleWheelQuiet() {
    this.clearQuietTimer()
    this.quietTimer = this.dependencies.setTimer(() => {
      this.quietTimer = undefined
      const session = this.wheel
      if (this.animationActive) {
        if (this.queuedWheel) this.queuedWheel.quiet = true
        else this.wheelStreamQuiet = true
        this.wheelSample = undefined
        return
      }
      const queuedWheel = this.queuedWheel
      if (queuedWheel) {
        this.queuedWheel = undefined
        this.wheel = undefined
        this.wheelDisarmed = false
        this.wheelStreamQuiet = false
        this.startQueuedWheel(this.dependencies.getScrollY(), queuedWheel)
        if (this.wheel || this.animationActive) this.scheduleWheelQuiet()
        return
      }
      this.wheelDisarmed = false
      this.wheelStreamQuiet = false
      if (!session) return
      if (session.committed) {
        this.resetWheelState()
        return
      }
      this.wheelStreamQuiet = true
      this.animateTo(
        session.settleOrigin,
        () => {
          this.wheel = undefined
        },
        undefined,
        'return',
      )
    }, WHEEL_QUIET_MS)
  }

  private clearQuietTimer() {
    if (this.quietTimer === undefined) return
    this.dependencies.clearTimer(this.quietTimer)
    this.quietTimer = undefined
  }
}
