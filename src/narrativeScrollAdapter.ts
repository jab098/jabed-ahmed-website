import { previewFollowPosition, type HandoffMode } from './narrativeScroll'

type PreviewFollowerDependencies = {
  cancelFrame: (id: number) => void
  readScroll: () => number
  requestFrame: (callback: FrameRequestCallback) => number
  writeScroll: (y: number) => void
}

export function createPreviewFollower({
  cancelFrame,
  readScroll,
  requestFrame,
  writeScroll,
}: PreviewFollowerDependencies) {
  let frame = 0
  let lastFrameTime: number | undefined
  let pendingTarget: number | undefined

  const tick: FrameRequestCallback = (time) => {
    frame = 0
    const target = pendingTarget
    if (target === undefined) {
      lastFrameTime = undefined
      return
    }

    const current = readScroll()
    if (Math.abs(target - current) <= 0.5) {
      writeScroll(target)
      pendingTarget = undefined
      lastFrameTime = undefined
      return
    }

    const elapsed = lastFrameTime === undefined ? 1_000 / 60 : Math.max(0, time - lastFrameTime)
    const next = previewFollowPosition(current, target, elapsed)
    if (Math.abs(target - next) <= 0.5) {
      writeScroll(target)
      pendingTarget = undefined
      lastFrameTime = undefined
      return
    }

    writeScroll(next)
    lastFrameTime = time
    frame = requestFrame(tick)
  }

  return {
    cancel() {
      if (frame) cancelFrame(frame)
      frame = 0
      lastFrameTime = undefined
      pendingTarget = undefined
    },
    getRenderedPosition() {
      return readScroll()
    },
    queue(y: number) {
      pendingTarget = y
      if (!frame) {
        lastFrameTime = undefined
        frame = requestFrame(tick)
      }
    },
  }
}

export function handoffEase(mode: HandoffMode) {
  if (mode === 'continue') return 'power1.out'
  if (mode === 'return') return 'sine.inOut'
  return 'power3.inOut'
}
