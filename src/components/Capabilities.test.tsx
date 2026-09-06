import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { Capabilities } from './Capabilities'

afterEach(() => {
  vi.useRealTimers()
})

it('renders the capability workspace without the editorial headline or evidence strip', () => {
  const { container } = render(<Capabilities />)

  expect(screen.queryByRole('heading', { name: "What's in a reliable measurement system?" })).not.toBeInTheDocument()
  expect(container.querySelector('#capability-system')).toHaveAttribute('data-scroll-frame', 'viewport')
  expect(container.querySelector('#capability-system')).toHaveAttribute('data-scroll-waypoint', 'capabilities')
  expect(container.querySelector('.capabilities-grid')).not.toBeInTheDocument()
  expect(screen.getByRole('tablist', { name: 'Measurement capabilities' })).toBeInTheDocument()
  expect(screen.getAllByRole('tab')).toHaveLength(6)
  expect(screen.getByRole('tabpanel').tagName).toBe('DIV')
  expect(container.querySelector('#proof')).not.toBeInTheDocument()
})

it('uses the capability selector to update the readable technical canvas', async () => {
  const user = userEvent.setup()
  render(<Capabilities />)

  const frontEnd = screen.getByRole('tab', { name: '01 Front-End Instrumentation' })
  expect(frontEnd).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Custom JavaScript event tracking')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('QA READY')

  await user.click(screen.getByRole('tab', { name: '04 CRO & Testing' }))

  expect(frontEnd).toHaveAttribute('aria-selected', 'false')
  expect(screen.getByRole('tab', { name: '04 CRO & Testing' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Experimentation')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('A/B testing and personalisation programmes')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Adobe Target')
})

it('keeps all capability content in the document without creating six mobile scroll stops', () => {
  const { container } = render(<Capabilities />)

  expect(screen.getByRole('tab', { name: '01 Front-End Instrumentation' })).toBeInTheDocument()
  expect(screen.getByText('Consent Mode v2')).toBeInTheDocument()
  expect(container.querySelectorAll('[data-scroll-waypoint-mobile^="capability-"]')).toHaveLength(0)
})

it('moves between capability tabs with the arrow keys', async () => {
  const user = userEvent.setup()
  render(<Capabilities />)

  const frontEnd = screen.getByRole('tab', { name: '01 Front-End Instrumentation' })
  frontEnd.focus()
  await user.keyboard('{ArrowRight}')

  const tagManagement = screen.getByRole('tab', { name: '02 Tag Management' })
  expect(tagManagement).toHaveFocus()
  expect(tagManagement).toHaveAttribute('aria-selected', 'true')
})

it('numbers every capability in the approved front-end-first order', () => {
  render(<Capabilities />)

  expect(screen.getAllByRole('tab').map((tab) => tab.getAttribute('aria-label'))).toEqual([
    '01 Front-End Instrumentation',
    '02 Tag Management',
    '03 Server-Side Tracking',
    '04 CRO & Testing',
    '05 Consent & Privacy',
    '06 BI & Data Modelling',
  ])
})

it('renders a capability-specific technical demonstration for every skill', () => {
  const { container } = render(<Capabilities />)

  expect([...container.querySelectorAll('[data-capability-demo]')].map((demo) => demo.getAttribute('data-capability-demo'))).toEqual([
    'front-end-instrumentation',
    'tag-management',
    'server-side-tracking',
    'cro-testing',
    'consent-privacy',
    'bi-data-modelling',
  ])
  expect(container.querySelector('[data-demo-node="data-layer"]')).toBeInTheDocument()
  expect(container.querySelector('[data-demo-node="collector"]')).toBeInTheDocument()
  expect(container.querySelector('[data-demo-metric="uplift"]')).toBeInTheDocument()
  expect(container.querySelector('[data-demo-node="consent-gate"]')).toBeInTheDocument()
  expect(container.querySelector('[data-demo-node="semantic-layer"]')).toBeInTheDocument()
  expect(container.querySelector('[data-demo-node="qa-pass"]')).toBeInTheDocument()
  expect(container.querySelector('.capability-signal')).not.toBeInTheDocument()
})

it('retains the outgoing composition for the established 480ms transition', () => {
  vi.useFakeTimers()
  const { container } = render(<Capabilities />)

  fireEvent.click(screen.getByRole('tab', { name: '02 Tag Management' }))

  expect(screen.getByRole('tabpanel')).toHaveAttribute('data-panel-state', 'current')
  expect(screen.getByRole('tabpanel')).toHaveAttribute('data-layout', 'tag-management')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Tag Management')
  expect(container.querySelector('[data-panel-state="outgoing"]')).toHaveTextContent('Front-End Instrumentation')
  expect(container.querySelector('[data-panel-state="outgoing"]')).toHaveAttribute('aria-hidden', 'true')
  expect(container.querySelector('[data-panel-state="outgoing"]')).toHaveAttribute('data-layout', 'front-end-instrumentation')

  act(() => vi.advanceTimersByTime(479))
  expect(container.querySelector('[data-panel-state="outgoing"]')).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(1))
  expect(container.querySelector('[data-panel-state="outgoing"]')).not.toBeInTheDocument()
})

it('cancels stale outgoing cleanup when selections change rapidly', () => {
  vi.useFakeTimers()
  const { container } = render(<Capabilities />)

  fireEvent.click(screen.getByRole('tab', { name: '02 Tag Management' }))
  act(() => vi.advanceTimersByTime(240))
  fireEvent.click(screen.getByRole('tab', { name: '03 Server-Side Tracking' }))
  act(() => vi.advanceTimersByTime(240))

  expect(screen.getByRole('tabpanel')).toHaveTextContent('Server-Side Tracking')
  expect(container.querySelector('[data-panel-state="outgoing"]')).toHaveTextContent('Tag Management')

  act(() => vi.advanceTimersByTime(240))
  expect(container.querySelector('[data-panel-state="outgoing"]')).not.toBeInTheDocument()
})
