import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NarrativeScroll } from './NarrativeScroll'
import { createPreviewFollower, handoffEase } from '../narrativeScrollAdapter'
import {
  collectNarrativeWaypoints,
  resolveDirectScrollTarget,
  shouldYieldToNativeScroll,
  type NarrativeTrigger,
} from '../narrativeScrollDom'

function setRect(element: Element, top: number, bottom = top) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    bottom,
    height: bottom - top,
    left: 0,
    right: 0,
    top,
    width: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  })
}

describe('collectNarrativeWaypoints', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('collects the active physical headline set and offsets it below the nav', () => {
    document.body.innerHTML = `
      <section data-scroll-waypoint="hero"></section>
      <article data-scroll-waypoint-desktop="desktop-proof"></article>
      <article data-scroll-waypoint-mobile="mobile-proof"></article>
    `
    const [hero, desktop, mobile] = [...document.body.children]
    setRect(hero, 100)
    setRect(desktop, 500)
    setRect(mobile, 900)

    const desktopPoints = collectNarrativeWaypoints({
      getTrigger: () => undefined,
      maxScrollY: 4_000,
      navHeight: 64,
      scrollY: 200,
      viewportHeight: 1_000,
      viewportWidth: 1_200,
    })

    expect(desktopPoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'hero', y: 236 }),
        expect.objectContaining({ id: 'desktop-proof', y: 636 }),
      ]),
    )
    expect(desktopPoints.some(({ id }) => id === 'mobile-proof')).toBe(false)
  })

  it('maps virtual process and horizontal-track scenes onto their pin progress', () => {
    document.body.innerHTML = `
      <button data-scroll-virtual="process-02" data-scroll-trigger="process-pin" data-scroll-progress="0.34"></button>
      <div data-scroll-track data-scroll-trigger="systems-pin">
        <article data-scroll-track-waypoint="system-01"></article>
        <article data-scroll-track-waypoint="system-02"></article>
      </div>
    `
    const track = document.querySelector('[data-scroll-track]') as HTMLElement
    const [, secondCard] = [...track.children] as HTMLElement[]
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 2_000 },
    })
    Object.defineProperties(secondCard, {
      offsetLeft: { configurable: true, value: 900 },
    })
    const triggers: Record<string, NarrativeTrigger> = {
      'process-pin': { end: 2_000, start: 1_000 },
      'systems-pin': { end: 5_000, start: 3_000 },
    }

    const points = collectNarrativeWaypoints({
      getTrigger: (id) => triggers[id],
      maxScrollY: 8_000,
      navHeight: 0,
      scrollY: 0,
      viewportHeight: 1_000,
      viewportWidth: 1_000,
    })

    expect(points).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'process-02', y: 1_340 }),
        expect.objectContaining({ id: 'system-01', y: 3_000 }),
        expect.objectContaining({ id: 'system-02', y: 4_653.846153846154 }),
      ]),
    )
  })

  it('keeps only authored compositions across a tall declared scene', () => {
    document.body.innerHTML = `
      <section data-scroll-scene="chapter" data-scroll-waypoint="chapter-start">
        <h2 data-scroll-waypoint="chapter-end"></h2>
      </section>
    `
    const scene = document.querySelector('[data-scroll-scene]') as HTMLElement
    const end = document.querySelector('[data-scroll-waypoint="chapter-end"]') as HTMLElement
    setRect(scene, 0, 1_800)
    setRect(end, 1_800)

    const points = collectNarrativeWaypoints({
      getTrigger: () => undefined,
      maxScrollY: 2_000,
      navHeight: 0,
      scrollY: 0,
      viewportHeight: 1_000,
      viewportWidth: 1_200,
    })

    expect(points.map(({ id }) => id)).toEqual(['chapter-start', 'chapter-end'])
  })
})

it('resolves section anchors to their authored headline destination', () => {
  document.body.innerHTML = `
    <section id="process"><header data-scroll-waypoint="process-heading"></header></section>
  `
  const section = document.querySelector('#process') as HTMLElement
  setRect(section, 1_500)

  expect(
    resolveDirectScrollTarget(section, [{ id: 'process-heading', y: 1_200 }], {
      navHeight: 60,
      scrollY: 0,
      viewportWidth: 1_200,
    }),
  ).toBe(1_200)
})

describe('shouldYieldToNativeScroll', () => {
  it('preserves form controls and independently scrollable regions', () => {
    const input = document.createElement('input')
    expect(shouldYieldToNativeScroll(input, 1)).toBe(true)

    const editor = document.createElement('div')
    editor.setAttribute('contenteditable', '')
    const editorChild = document.createElement('span')
    editor.append(editorChild)
    document.body.append(editor)
    expect(shouldYieldToNativeScroll(editorChild, 1)).toBe(true)

    const scroller = document.createElement('div')
    scroller.style.overflowY = 'auto'
    const child = document.createElement('span')
    scroller.append(child)
    document.body.append(scroller)
    Object.defineProperties(scroller, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 50, writable: true },
    })

    expect(shouldYieldToNativeScroll(child, 1)).toBe(true)
    scroller.scrollTop = 300
    expect(shouldYieldToNativeScroll(child, 1)).toBe(false)
  })
})

describe('narrative preview adapter', () => {
  it('approaches the latest preview target over time and cancels without flushing it', () => {
    let nextFrameId = 0
    let scrollY = 0
    const frames = new Map<number, FrameRequestCallback>()
    const writes: number[] = []
    const follower = createPreviewFollower({
      cancelFrame: (id) => frames.delete(id),
      readScroll: () => scrollY,
      requestFrame: (callback) => {
        const id = ++nextFrameId
        frames.set(id, callback)
        return id
      },
      writeScroll: (y) => {
        scrollY = y
        writes.push(y)
      },
    })

    follower.queue(100)
    const firstFrame = frames.get(1)
    frames.delete(1)
    firstFrame?.(16)

    expect(writes[0]).toBeGreaterThan(0)
    expect(writes[0]).toBeLessThan(100)
    expect(follower.getPendingTarget()).toBe(100)
    expect(frames.size).toBe(1)

    follower.cancel()

    expect(frames.size).toBe(0)
    expect(follower.getPendingTarget()).toBeUndefined()
    expect(writes).toHaveLength(1)
  })

  it('uses a distinct ease for forward, return, and direct handoffs', () => {
    expect(handoffEase('continue')).toBe('power1.out')
    expect(handoffEase('return')).toBe('sine.inOut')
    expect(handoffEase('direct')).toBe('power3.inOut')
  })
})

it('observes the responsive nav height with the narrative content roots', () => {
  const OriginalResizeObserver = globalThis.ResizeObserver
  const observed: Element[] = []
  class RecordingResizeObserver {
    observe(element: Element) {
      observed.push(element)
    }
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = RecordingResizeObserver as typeof ResizeObserver
  document.body.innerHTML = '<nav class="site-nav"></nav><main><footer></footer></main>'

  try {
    const { unmount } = render(<NarrativeScroll />)
    expect(document.documentElement).toHaveClass('narrative-scroll-active')
    expect(observed).toEqual([
      document.querySelector('.site-nav'),
      document.querySelector('main'),
      document.querySelector('footer'),
    ])
    unmount()
    expect(document.documentElement).not.toHaveClass('narrative-scroll-active')
  } finally {
    globalThis.ResizeObserver = OriginalResizeObserver
  }
})

it('registers and cleans up delegated direct-navigation clicks', () => {
  const addEventListener = vi.spyOn(document, 'addEventListener')
  const removeEventListener = vi.spyOn(document, 'removeEventListener')
  const { unmount } = render(<NarrativeScroll />)

  expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
  unmount()
  expect(removeEventListener).toHaveBeenCalledWith('click', expect.any(Function))
})

it('leaves scrolling fully native when reduced motion is requested', () => {
  const originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  try {
    const { unmount } = render(<NarrativeScroll />)
    expect(document.documentElement).not.toHaveClass('narrative-scroll-active')
    unmount()
  } finally {
    window.matchMedia = originalMatchMedia
  }
})
