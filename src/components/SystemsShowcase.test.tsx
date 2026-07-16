import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { SystemsShowcase } from './SystemsShowcase'

it('frames four representative systems without presenting them as client case studies', () => {
  const { container } = render(<SystemsShowcase />)

  expect(screen.getByRole('heading', { name: 'Selected systems.' })).toBeInTheDocument()
  expect(screen.getByText('Representative system / not client work')).toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(4)
  expect(screen.getByRole('heading', { name: 'Executive decision dashboard' })).toBeInTheDocument()
  expect(screen.getByText('16 MARKETS')).toBeInTheDocument()
  expect(container.querySelector('[data-measurement-architecture]')?.querySelectorAll('path').length).toBeGreaterThanOrEqual(5)
  expect(container.querySelector('[data-consent-pipeline]')?.querySelectorAll('path').length).toBeGreaterThanOrEqual(5)
  expect(container.querySelector('.systems-track__end em')).toHaveTextContent('yours.')
  expect(container.querySelector('.systems-track__end em')).toHaveAttribute('data-scroll-flash', 'early-tight')
  expect(container.querySelector('.systems-header')).toHaveAttribute(
    'data-scroll-waypoint',
    'systems-heading',
  )
  expect(container.querySelector('.systems-track')).toHaveAttribute('data-scroll-track')
  expect(container.querySelector('.systems-track')).toHaveAttribute(
    'data-scroll-trigger',
    'systems-pin',
  )
  expect(container.querySelectorAll('[data-scroll-track-waypoint]')).toHaveLength(5)
  expect(container.querySelectorAll('[data-scroll-waypoint-mobile]')).toHaveLength(5)
})

it('rebuilds its pinned scene when the desktop/mobile breakpoint changes', () => {
  const originalMatchMedia = window.matchMedia
  const addEventListener = vi.fn()
  const removeEventListener = vi.fn()
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener,
    removeEventListener,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  try {
    const { unmount } = render(<SystemsShowcase />)
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 900px)')
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    unmount()
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  } finally {
    window.matchMedia = originalMatchMedia
  }
})

it('observes every system card for its own fade entrance', () => {
  const OriginalIntersectionObserver = globalThis.IntersectionObserver
  const observed: Element[] = []
  class RecordingIntersectionObserver {
    observe(element: Element) { observed.push(element) }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', RecordingIntersectionObserver)

  try {
    render(<SystemsShowcase />)
    expect(observed.filter((element) => element.matches('.system-card'))).toHaveLength(4)
  } finally {
    vi.stubGlobal('IntersectionObserver', OriginalIntersectionObserver)
  }
})

it('keeps observer-applied visibility when a card is expanded on mobile', async () => {
  const user = userEvent.setup()
  render(<SystemsShowcase />)

  const card = screen.getByRole('heading', { name: 'Executive decision dashboard' }).closest('article')!
  card.classList.add('is-visible')
  const toggle = screen.getByRole('button', { name: 'Executive decision dashboard — details' })

  await user.click(toggle)
  expect(card).toHaveAttribute('data-open')
  expect(card).toHaveClass('is-visible')

  await user.click(toggle)
  expect(card).not.toHaveAttribute('data-open')
  expect(card).toHaveClass('is-visible')
})
