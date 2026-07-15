import {
  buildWaypointMap,
  type Direction,
  type ScrollWaypoint,
} from './narrativeScroll'
import { ScrollTrigger } from './motion'

const MOBILE_BREAKPOINT = 900

export type NarrativeTrigger = {
  start: number
  end: number
}

type CollectOptions = {
  getTrigger?: (id: string) => NarrativeTrigger | undefined
  maxScrollY?: number
  navHeight?: number
  root?: ParentNode
  scrollY?: number
  viewportHeight?: number
  viewportWidth?: number
}

function clamp(minimum: number, value: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function readWaypoint(element: Element, attribute: string) {
  return element.getAttribute(attribute)?.trim()
}

export function collectNarrativeWaypoints(options: CollectOptions = {}) {
  const root = options.root ?? document
  const viewportWidth = options.viewportWidth ?? window.innerWidth
  const viewportHeight = options.viewportHeight ?? window.innerHeight
  const scrollY = options.scrollY ?? window.scrollY
  const maxScrollY =
    options.maxScrollY ??
    Math.max(0, document.documentElement.scrollHeight - viewportHeight)
  const navHeight =
    options.navHeight ??
    document.querySelector<HTMLElement>('.site-nav')?.getBoundingClientRect().height ??
    0
  const getTrigger =
    options.getTrigger ??
    ((id: string) => {
      const trigger = ScrollTrigger.getById(id)
      if (!trigger || typeof trigger.start !== 'number' || typeof trigger.end !== 'number') {
        return undefined
      }
      return { start: trigger.start, end: trigger.end }
    })
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT
  const points: ScrollWaypoint[] = []

  const addPhysical = (selector: string, attribute: string) => {
    root.querySelectorAll(selector).forEach((element) => {
      const id = readWaypoint(element, attribute)
      if (!id) return
      const alignmentOffset =
        readWaypoint(element, 'data-scroll-align') === 'viewport' ? 0 : navHeight
      points.push({
        id,
        y: element.getBoundingClientRect().top + scrollY - alignmentOffset,
        priority: 3,
      })
    })
  }

  addPhysical('[data-scroll-waypoint]', 'data-scroll-waypoint')
  addPhysical(
    isMobile ? '[data-scroll-waypoint-mobile]' : '[data-scroll-waypoint-desktop]',
    isMobile ? 'data-scroll-waypoint-mobile' : 'data-scroll-waypoint-desktop',
  )

  if (!isMobile) {
    root.querySelectorAll<HTMLElement>('[data-scroll-virtual]').forEach((element) => {
      const id = readWaypoint(element, 'data-scroll-virtual')
      const triggerId = readWaypoint(element, 'data-scroll-trigger')
      const progress = Number(element.dataset.scrollProgress)
      const trigger = triggerId ? getTrigger(triggerId) : undefined
      if (!id || !trigger || !Number.isFinite(progress)) return
      points.push({
        id,
        y: trigger.start + (trigger.end - trigger.start) * clamp(0, progress, 1),
        priority: 2,
      })
    })

    root.querySelectorAll<HTMLElement>('[data-scroll-track]').forEach((track) => {
      const triggerId = readWaypoint(track, 'data-scroll-trigger')
      const trigger = triggerId ? getTrigger(triggerId) : undefined
      if (!trigger) return

      const leadingInset = viewportWidth * 0.04
      const totalTravel = Math.max(1, track.scrollWidth - viewportWidth + leadingInset)
      track.querySelectorAll<HTMLElement>('[data-scroll-track-waypoint]').forEach((element) => {
        const id = readWaypoint(element, 'data-scroll-track-waypoint')
        if (!id) return
        const progress = clamp(0, (element.offsetLeft - leadingInset) / totalTravel, 1)
        points.push({
          id,
          y: trigger.start + (trigger.end - trigger.start) * progress,
          priority: 2,
        })
      })
    })
  }

  return buildWaypointMap(points, maxScrollY)
}

type DirectScrollOptions = {
  navHeight?: number
  scrollY?: number
  viewportWidth?: number
}

export function resolveDirectScrollTarget(
  target: Element,
  points: ScrollWaypoint[],
  options: DirectScrollOptions = {},
) {
  const viewportWidth = options.viewportWidth ?? window.innerWidth
  const responsiveAttribute =
    viewportWidth <= MOBILE_BREAKPOINT
      ? 'data-scroll-waypoint-mobile'
      : 'data-scroll-waypoint-desktop'
  const selectors = `[data-scroll-waypoint], [${responsiveAttribute}]`
  const candidates = [target, ...target.querySelectorAll(selectors)]

  for (const candidate of candidates) {
    const id =
      readWaypoint(candidate, 'data-scroll-waypoint') ??
      readWaypoint(candidate, responsiveAttribute)
    const point = id ? points.find((waypoint) => waypoint.id === id) : undefined
    if (point) return point.y
  }

  const navHeight =
    options.navHeight ??
    document.querySelector<HTMLElement>('.site-nav')?.getBoundingClientRect().height ??
    0
  return Math.max(
    0,
    target.getBoundingClientRect().top + (options.scrollY ?? window.scrollY) - navHeight,
  )
}

export function shouldYieldToNativeScroll(target: EventTarget | null, direction: Direction) {
  const node = target instanceof Element ? target : null
  if (!node) return false
  if (node.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) {
    return true
  }

  let element: Element | null = node
  while (element && element !== document.body && element !== document.documentElement) {
    const candidate = element as HTMLElement
    const { overflowY } = window.getComputedStyle(candidate)
    if (/(auto|scroll)/.test(overflowY) && candidate.scrollHeight > candidate.clientHeight + 1) {
      if (direction === -1 && candidate.scrollTop > 1) return true
      if (
        direction === 1 &&
        candidate.scrollTop + candidate.clientHeight < candidate.scrollHeight - 1
      ) {
        return true
      }
    }
    element = element.parentElement
  }

  return false
}
