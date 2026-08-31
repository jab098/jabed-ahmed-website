import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { HeroArtwork } from './HeroArtwork'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function setupViewport({ mobile = true, reduced = false, top = 200 } = {}) {
  vi.useFakeTimers()
  const viewport = { mobile, top }
  const media = window.matchMedia('')
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
    ...media,
    media: query,
    get matches() {
      return query === '(max-width: 900px)' ? viewport.mobile
        : query === '(prefers-reduced-motion: reduce)' && reduced
    },
  }))
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('site-nav')
      ? new DOMRect(0, 0, 390, 60)
      : new DOMRect(0, viewport.top, 390, 200)
  })
  const result = render(<><nav className="site-nav" /><HeroArtwork active /></>)
  const exit = () => result.container.querySelector('.hero-artwork__exit')
  const move = (nextTop: number) => {
    viewport.top = nextTop
    act(() => { fireEvent.scroll(window); vi.runOnlyPendingTimers() })
  }
  const resize = (isMobile: boolean) => {
    viewport.mobile = isMobile
    act(() => { fireEvent.resize(window); vi.runOnlyPendingTimers() })
  }
  return { ...result, exit, move, resize }
}

it('offers only sculpture controls and cycles through the three formations', () => {
  render(<HeroArtwork active />)
  expect(screen.getAllByRole('button')).toHaveLength(2)
  expect(screen.getByRole('figure', { name: 'Animated data sculpture' })).not.toHaveAttribute('aria-describedby')
  expect(screen.getByText('CRYSTAL / 01')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Next formation' }))
  expect(screen.getByText('WEAVE / 02')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Next formation' }))
  expect(screen.getByText('STREAM / 03')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Next formation' }))
  expect(screen.getByText('CRYSTAL / 01')).toBeInTheDocument()
})

it('fades on mobile and restores the chosen formation and playback state on return', () => {
  const { exit, move } = setupViewport()
  expect(exit()).toHaveStyle({ opacity: '1' })
  fireEvent.click(screen.getByRole('button', { name: 'Next formation' }))
  fireEvent.click(screen.getByRole('button', { name: 'Pause artwork' }))
  move(-40) // Half of the 200px artwork remains below the 60px navigation.
  expect(exit()).toHaveStyle({ opacity: '0.5' })
  move(-140)
  expect(exit()).toHaveStyle({ opacity: '0', visibility: 'hidden' })
  expect(exit()).toHaveAttribute('inert')
  expect(screen.queryByRole('button', { name: 'Next formation' })).not.toBeInTheDocument()
  move(200)
  expect(exit()).toHaveStyle({ opacity: '1', visibility: 'visible' })
  expect(exit()).not.toHaveAttribute('inert')
  expect(screen.getByText('WEAVE / 02')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Play artwork' })).toBeInTheDocument()
})

it('leaves desktop artwork opacity unchanged when scrolling', () => {
  const { exit, move } = setupViewport({ mobile: false })
  move(-500)
  expect(exit()).toHaveStyle({ opacity: '1', visibility: 'visible' })
  expect(exit()).not.toHaveAttribute('inert')
})

it('recalculates visibility when crossing the mobile breakpoint', () => {
  const { exit, resize } = setupViewport({ top: -200 })
  expect(exit()).toHaveStyle({ opacity: '0' })
  resize(false)
  expect(exit()).toHaveStyle({ opacity: '1' })
  resize(true)
  expect(exit()).toHaveStyle({ opacity: '0' })
})

it('hides the artwork on an initial mobile deep-link without waiting for a scroll', () => {
  const { exit } = setupViewport({ top: -500 })
  expect(exit()).toHaveStyle({ opacity: '0', visibility: 'hidden' })
  expect(exit()).toHaveAttribute('aria-hidden', 'true')
})

it('skips the gradual fade for reduced motion but still hides offscreen artwork', () => {
  const { exit, move } = setupViewport({ reduced: true })
  move(-40)
  expect(exit()).toHaveStyle({ opacity: '1' })
  move(-140)
  expect(exit()).toHaveStyle({ opacity: '0' })
  move(200)
  expect(exit()).toHaveStyle({ opacity: '1' })
  expect(screen.getByRole('button', { name: 'Play artwork' })).toBeDisabled()
})
