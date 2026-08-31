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
  expect(container.querySelector('.hero-visual')).not.toHaveAttribute('data-scroll-waypoint-mobile')
})

it('offers the sculpture with reshape and playback controls', () => {
  render(<Hero />)
  expect(screen.getAllByRole('button')).toHaveLength(2)
  expect(screen.getByRole('button', { name: 'Next formation' })).toBeInTheDocument()
  expect(screen.getByText('CRYSTAL / 01')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Next formation' }))
  expect(screen.getByText('WEAVE / 02')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Pause artwork' }))
  expect(screen.getByRole('button', { name: 'Play artwork' })).toBeInTheDocument()
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
