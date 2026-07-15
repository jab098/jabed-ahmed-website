import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Process } from './Process'

it('renders four selectable process states and updates the active decision visual', async () => {
  const user = userEvent.setup()
  render(<Process />)

  expect(screen.getByRole('heading', { name: 'How I turn uncertainty into a working data system.' })).toBeInTheDocument()
  const first = screen.getByRole('button', { name: '01 Diagnose the decision.' })
  const fourth = screen.getByRole('button', { name: '04 Enable and improve.' })

  expect(document.querySelector('.process-intro')).toHaveAttribute(
    'data-scroll-waypoint',
    'process-heading',
  )
  expect(document.querySelectorAll('[data-scroll-virtual]')).toHaveLength(4)
  expect(first).toHaveAttribute('data-scroll-trigger', 'process-pin')

  expect(first).toHaveAttribute('aria-pressed', 'true')
  await user.click(fourth)
  expect(fourth).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('Decision brief')).toBeVisible()

  const release = document.querySelector('[data-release-decision]')
  expect(release).toBeInTheDocument()
  expect(release?.querySelector('[data-release-comparison]')).toBeInTheDocument()
  expect(release).toHaveTextContent('+18.4%')
  expect(release).toHaveTextContent('96%')
  expect(release).toHaveTextContent('Guardrails stable')
  expect(release).toHaveTextContent('Evidence')
  expect(release).toHaveTextContent('Decision')
  expect(release).toHaveTextContent('Owner')
})

it('renders all four process scenes as physical mobile stops instead of a hidden tab state', () => {
  const originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(max-width: 900px)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  try {
    const { container } = render(<Process />)

    expect(container.querySelectorAll('[data-scroll-waypoint-mobile^="process-"]')).toHaveLength(4)
    expect(screen.queryByRole('group', { name: 'Process stages' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Diagnose the decision.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Enable and improve.' })).toBeInTheDocument()
  } finally {
    window.matchMedia = originalMatchMedia
  }
})

it('replaces the aggregate score with a reverse evidence diagnosis', () => {
  const { container } = render(<Process />)
  const trace = container.querySelector('[data-diagnosis-trace]')
  const summary = container.querySelector('[data-diagnosis-summary]')

  expect(trace).toBeInTheDocument()
  expect(container).not.toHaveTextContent('TRUST SCORE')
  expect(container).not.toHaveTextContent('/100')
  expect(container).toHaveTextContent('Can we trust the lift?')
  expect(container).toHaveTextContent('Identity join')
  expect(container).toHaveTextContent('Consent loss')
  expect(trace?.querySelectorAll('.diagnosis-visual__row')).toHaveLength(4)
  expect(trace?.querySelectorAll('.diagnosis-visual__connectors path')).toHaveLength(4)
  expect(trace?.querySelectorAll('.diagnosis-visual__fault')).toHaveLength(2)
  expect(summary?.children).toHaveLength(3)
  expect(summary).toHaveTextContent('Signals checked')
  expect(summary).toHaveTextContent('Blockers found')
  expect(summary).toHaveTextContent('Next action /')
  expect(summary).toHaveTextContent('Fix identity joins')
})

it('connects each architecture node in sequence', async () => {
  const user = userEvent.setup()
  const { container } = render(<Process />)

  await user.click(screen.getByRole('button', { name: '02 Architect the system.' }))
  const connectors = container.querySelector('[data-event-connectors]')
  expect(connectors).toBeInTheDocument()
  expect(connectors?.querySelectorAll('path')).toHaveLength(4)
})

it('crossfades outgoing and incoming copy and visual layers before cleanup', async () => {
  const user = userEvent.setup()
  const { container } = render(<Process />)

  expect(container.querySelectorAll('[data-process-copy-layer]')).toHaveLength(1)
  expect(container.querySelectorAll('[data-process-visual-layer]')).toHaveLength(1)

  await user.click(screen.getByRole('button', { name: '02 Architect the system.' }))

  expect(container.querySelectorAll('[data-process-copy-layer]')).toHaveLength(2)
  expect(container.querySelector('[data-process-copy-layer="leaving"]')).toBeInTheDocument()
  expect(container.querySelector('[data-process-copy-layer="entering"]')).toBeInTheDocument()
  expect(container.querySelectorAll('[data-process-visual-layer]')).toHaveLength(2)
  expect(container.querySelector('[data-process-visual-layer="leaving"]')).toBeInTheDocument()
  expect(container.querySelector('[data-process-visual-layer="entering"]')).toBeInTheDocument()

  await waitFor(() => {
    expect(container.querySelectorAll('[data-process-copy-layer]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-process-visual-layer]')).toHaveLength(1)
  })
})

it('cancels stale layer cleanup when the active state changes rapidly', () => {
  vi.useFakeTimers()

  try {
    const { container } = render(<Process />)

    fireEvent.click(screen.getByRole('button', { name: '02 Architect the system.' }))
    act(() => vi.advanceTimersByTime(300))
    fireEvent.click(screen.getByRole('button', { name: '03 Build and validate.' }))
    act(() => vi.advanceTimersByTime(180))

    const leaving = container.querySelector('[data-process-visual-layer="leaving"]')
    const entering = container.querySelector('[data-process-visual-layer="entering"]')
    expect(container.querySelectorAll('[data-process-visual-layer]')).toHaveLength(2)
    expect(leaving).toHaveTextContent('Event architecture')
    expect(entering).toHaveTextContent('Quality assurance matrix')

    act(() => vi.advanceTimersByTime(300))
    expect(container.querySelectorAll('[data-process-visual-layer]')).toHaveLength(1)
  } finally {
    vi.useRealTimers()
  }
})
