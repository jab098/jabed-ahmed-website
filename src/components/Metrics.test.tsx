import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { formatMetricCount } from '../data'
import { Metrics } from './Metrics'

it('formats metric count-up values with the historical cubic easing', () => {
  expect(formatMetricCount('8+', 0)).toBe('0+')
  expect(formatMetricCount('8+', 0.5)).toBe('7+')
  expect(formatMetricCount('16', 1)).toBe('16')
  expect(formatMetricCount('€2M+', 0, 0.5, 1)).toBe('€0.5M+')
  expect(formatMetricCount('€2M+', 1, 0.5, 1)).toBe('€2M+')
})

it('renders proof as a compact supporting strip rather than its own scroll scene', () => {
  const { container } = render(<Metrics />)

  expect(screen.getByRole('heading', { name: 'Proof in the system.' })).toBeInTheDocument()
  expect(screen.getByLabelText('8+ Years of experience')).toBeInTheDocument()
  expect(screen.getByLabelText('16 Global markets')).toBeInTheDocument()
  expect(screen.getByLabelText('€2M+ Experimentation uplift')).toBeInTheDocument()
  expect(container.querySelector('#proof')).toHaveClass('evidence-strip')
  expect(container.querySelector('#proof')).not.toHaveAttribute('data-scroll-scene')
  expect(container.querySelector('#proof')).not.toHaveAttribute('data-scroll-frame')
  expect(container.querySelector('#proof')).not.toHaveAttribute('data-scroll-waypoint')
  expect(container.querySelectorAll('[data-count-up-metric]')).toHaveLength(3)
})

it('shows final metric values immediately when reduced motion is requested', () => {
  const originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  try {
    const { container } = render(<Metrics />)
    expect([...container.querySelectorAll('[data-count-up-metric]')].map((node) => node.textContent)).toEqual([
      '8+',
      '16',
      '€2M+',
    ])
  } finally {
    window.matchMedia = originalMatchMedia
  }
})
