import { render, screen } from '@testing-library/react'
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

it('keeps the audit denominator separate and connects each architecture node in sequence', async () => {
  const user = userEvent.setup()
  const { container } = render(<Process />)

  expect(container.querySelector('.audit-visual__denominator')).toHaveTextContent('/100')

  await user.click(screen.getByRole('button', { name: '02 Architect the system.' }))
  const connectors = container.querySelector('[data-event-connectors]')
  expect(connectors).toBeInTheDocument()
  expect(connectors?.querySelectorAll('path')).toHaveLength(4)
})

it('uses the empty audit space for one clear diagnostic summary', () => {
  const { container } = render(<Process />)
  const summary = container.querySelector('[data-audit-summary]')

  expect(summary).toBeInTheDocument()
  expect(summary?.children).toHaveLength(3)
  expect(summary).toHaveTextContent('Signals checked')
  expect(summary).toHaveTextContent('Blockers')
  expect(summary).toHaveTextContent('Next action')
})
