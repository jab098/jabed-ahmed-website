import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Capabilities } from './Capabilities'

it('renders the six-part measurement system grid', () => {
  const { container } = render(<Capabilities />)

  expect(screen.getByRole('heading', { name: "What's in a reliable measurement system?" })).toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(6)
  expect(screen.getByText('Consent Mode v2')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Front-End Instrumentation' })).toBeInTheDocument()
  const croCard = screen.getByRole('heading', { name: 'CRO & Testing' }).closest('article')
  expect(croCard?.querySelector('[data-capability-motif="03"] .capability-motif__number')).toHaveTextContent('03')
  expect(container.querySelector('.capabilities-header')).toHaveAttribute(
    'data-scroll-waypoint',
    'capabilities-heading',
  )
  expect(container.querySelectorAll('[data-scroll-waypoint-desktop^="capability-"]')).toHaveLength(6)
  expect(container.querySelectorAll('[data-scroll-waypoint-mobile^="capability-"]')).toHaveLength(6)
})

it('observes every capability card for its own fade entrance', () => {
  const OriginalIntersectionObserver = globalThis.IntersectionObserver
  const observed: Element[] = []
  class RecordingIntersectionObserver {
    observe(element: Element) { observed.push(element) }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', RecordingIntersectionObserver)

  try {
    render(<Capabilities />)
    expect(observed.filter((element) => element.matches('.capabilities-grid article'))).toHaveLength(6)
  } finally {
    vi.stubGlobal('IntersectionObserver', OriginalIntersectionObserver)
  }
})

it('keeps observer-applied visibility when a card is expanded on mobile', async () => {
  const user = userEvent.setup()
  render(<Capabilities />)

  const card = screen.getByRole('heading', { name: 'Front-End Instrumentation' }).closest('article')!
  card.classList.add('is-visible')
  const toggle = screen.getByRole('button', { name: 'Front-End Instrumentation — details' })

  await user.click(toggle)
  expect(card).toHaveAttribute('data-open')
  expect(card).toHaveClass('is-visible')

  await user.click(toggle)
  expect(card).not.toHaveAttribute('data-open')
  expect(card).toHaveClass('is-visible')
})
