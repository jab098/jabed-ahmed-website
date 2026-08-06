import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { SystemsShowcase } from './SystemsShowcase'
import { AUTO_ADVANCE_MS, RESUME_DELAY_MS } from '../useAutoAdvance'

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
  expect(container.querySelector('.systems-stage')).toHaveAttribute(
    'data-scroll-waypoint',
    'systems-stage',
  )
  expect(container.querySelector('.systems-stage')).toHaveAttribute('data-scroll-frame', 'viewport')
  expect(container.querySelectorAll('[data-scroll-track-waypoint]')).toHaveLength(0)
  expect(container.querySelectorAll('[data-scroll-waypoint-mobile]')).toHaveLength(0)
})

it('cycles the track through every card and the bridge, and defers after a selection', () => {
  vi.useFakeTimers()
  const OriginalIntersectionObserver = globalThis.IntersectionObserver
  class VisibleObserver {
    callback: IntersectionObserverCallback
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
    }
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', VisibleObserver)

  try {
    const { container } = render(<SystemsShowcase />)
    const active = () => container.querySelector('[data-active]')
    const tick = () => act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS))

    expect(active()).toHaveTextContent('Measurement architecture')
    tick()
    expect(active()).toHaveTextContent('Experimentation readout')

    tick()
    tick()
    tick()
    expect(active()).toHaveClass('systems-track__end')
    tick()
    expect(active()).toHaveTextContent('Measurement architecture')

    fireEvent.click(screen.getByRole('heading', { name: 'Executive decision dashboard' }))
    expect(active()).toHaveTextContent('Executive decision dashboard')
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS))
    expect(active()).toHaveTextContent('Executive decision dashboard')
    act(() => vi.advanceTimersByTime(RESUME_DELAY_MS - AUTO_ADVANCE_MS))
    expect(active()).toHaveClass('systems-track__end')
  } finally {
    vi.stubGlobal('IntersectionObserver', OriginalIntersectionObserver)
    vi.useRealTimers()
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

it('selects a neighbouring card from the keyboard', async () => {
  const user = userEvent.setup()
  const { container } = render(<SystemsShowcase />)

  const card = screen.getByRole('heading', { name: 'Consent and server-side pipeline' }).closest('article')!
  card.focus()
  await user.keyboard('{Enter}')

  expect(card).toHaveAttribute('data-active', 'true')
  expect(container.querySelectorAll('[data-active]')).toHaveLength(1)
})
