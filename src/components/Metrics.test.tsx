import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { formatMetricCount } from '../data'
import { Metrics } from './Metrics'

it('formats metric count-up values with the historical cubic easing', () => {
  expect(formatMetricCount).toBeTypeOf('function')
  expect(formatMetricCount('8+', 0)).toBe('0+')
  expect(formatMetricCount('8+', 0.5)).toBe('7+')
  expect(formatMetricCount('16', 1)).toBe('16')
  expect(formatMetricCount('€2M+', 0, 0.5, 1)).toBe('€0.5M+')
  expect(formatMetricCount('€2M+', 1, 0.5, 1)).toBe('€2M+')
})

it('renders the evidence tile and accessible count-up metric values', () => {
  const { container } = render(<Metrics />)

  expect(screen.getByRole('heading', { name: 'Proof in the system.' })).toBeInTheDocument()
  expect(screen.getByLabelText('8+ Years of experience')).toBeInTheDocument()
  expect(screen.getByLabelText('16 Global markets')).toBeInTheDocument()
  expect(screen.getByLabelText('€2M+ Experimentation uplift')).toBeInTheDocument()
  expect(container.querySelectorAll('[data-count-up-metric]')).toHaveLength(3)
  expect(screen.getByLabelText('8+ Years of experience').querySelectorAll('[data-digit-reel]')).toHaveLength(0)
  expect(screen.getByLabelText('16 Global markets').querySelectorAll('[data-digit-reel]')).toHaveLength(0)
  expect(document.querySelectorAll('[data-digit-reel]')).toHaveLength(0)
  expect(container.querySelector('#proof')).toHaveAttribute('data-scroll-frame', 'viewport')
  expect(container.querySelector('#proof')).toHaveAttribute('data-scroll-waypoint', 'proof')
  expect(container.querySelectorAll('[data-proof-content-band]')).toHaveLength(4)
  expect(container.querySelectorAll('[data-scroll-waypoint-mobile^="proof-metric-"]')).toHaveLength(3)
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
