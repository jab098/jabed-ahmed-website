import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
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
