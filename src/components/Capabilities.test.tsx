import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
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
