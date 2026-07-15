import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Hero } from './Hero'

it('presents the approved data consultancy proposition and next action', () => {
  const { container } = render(<Hero />)

  expect(
    screen.getByRole('heading', { name: 'Build data systems that make the next decision obvious.' }),
  ).toBeInTheDocument()
  expect(screen.getByText('I build tracking and data-collection systems.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'See how I work' })).toHaveAttribute('href', '#process')
  expect(container.querySelector('#home')).toHaveAttribute('data-scroll-waypoint', 'home')
  expect(container.querySelector('.hero-visual')).toHaveAttribute(
    'data-scroll-waypoint-mobile',
    'hero-report',
  )
})

it('keeps the glyph interaction on the report and cycles its colour palette', () => {
  render(<Hero />)

  const report = screen.getByRole('button', {
    name: 'Interactive analytics report. Activate to change colour',
  })
  expect(report).toHaveAttribute('data-palette', '0')
  expect(report).toHaveAttribute('data-palette-transition', 'smooth')
  expect(report).toHaveAttribute('data-glyph-density', 'high')
  expect(report).toHaveAttribute('data-glyph-spacing', '8')
  expect(report).toHaveAttribute('data-ambient-divisor', '3')
  expect(report).toHaveAttribute('data-pointer-mode', 'parallax-morph')
  const structure = report.querySelector('[data-analytics-structure]')
  const probe = report.querySelector('[data-analytics-probe]')
  expect(structure).toBeInTheDocument()
  expect(probe).toBeInTheDocument()
  expect(structure?.querySelectorAll('text')).toHaveLength(0)
  expect(structure?.querySelectorAll('.glyph-report__line')).toHaveLength(0)
  expect(structure?.querySelectorAll('[data-signal-piece]').length).toBeGreaterThanOrEqual(24)
  expect(probe?.querySelector('b, small')).not.toBeInTheDocument()
  expect(report.querySelector('.glyph-report__index')).not.toBeInTheDocument()
  expect(report.querySelector('.glyph-report__hint')).not.toBeInTheDocument()

  fireEvent.click(report)
  expect(report).toHaveAttribute('data-palette', '1')

  fireEvent.keyDown(report, { key: 'Enter' })
  expect(report).toHaveAttribute('data-palette', '2')
})

it('primes every headline line for the two-colour horizontal reveal', () => {
  const { container } = render(<Hero />)

  expect(container.querySelectorAll('[data-hero-wipe="signal"]')).toHaveLength(3)
  expect(container.querySelectorAll('[data-hero-wipe="paper"]')).toHaveLength(3)
  expect(container.querySelectorAll('.hero-reveal__text')).toHaveLength(3)
  expect(container.querySelectorAll('.hero-reveal__text[data-reveal-safe="true"]')).toHaveLength(3)
  expect(container.querySelectorAll('[data-fit-content-reveal]')).toHaveLength(3)
  expect(container.querySelector('.hero-visual')).toHaveAttribute('data-hero-visual-entrance', 'soft')
})
