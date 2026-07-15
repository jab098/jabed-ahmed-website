import { afterEach, describe, expect, it, vi } from 'vitest'
import { navigationEdgeScrollPosition } from './motion'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('navigationEdgeScrollPosition', () => {
  it('aligns a scroll reveal with the measured navigation edge', () => {
    document.body.innerHTML = '<nav class="site-nav"></nav>'
    const nav = document.querySelector('.site-nav') as HTMLElement
    vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
      bottom: 68,
      height: 68,
      left: 0,
      right: 1_024,
      top: 0,
      width: 1_024,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    expect(navigationEdgeScrollPosition()).toBe('top 68px')
  })

  it('falls back to the viewport top when navigation is absent', () => {
    expect(navigationEdgeScrollPosition()).toBe('top 0px')
  })
})
