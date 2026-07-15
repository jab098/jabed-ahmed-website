import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Metrics } from './Metrics'

it('renders the evidence tile and accessible rolling metric values', () => {
  const { container } = render(<Metrics />)

  expect(screen.getByRole('heading', { name: 'Proof in the system.' })).toBeInTheDocument()
  expect(screen.getByLabelText('8+ Years of experience')).toBeInTheDocument()
  expect(screen.getByLabelText('16 Global markets')).toBeInTheDocument()
  expect(screen.getByLabelText('€2M+ Experimentation uplift')).toBeInTheDocument()
  expect(screen.getByLabelText('8+ Years of experience').querySelector('[data-static-metric]')).toHaveTextContent('8+')
  expect(screen.getByLabelText('16 Global markets').querySelector('[data-static-metric]')).toHaveTextContent('16')
  expect(screen.getByLabelText('€2M+ Experimentation uplift').querySelector('[data-static-metric]')).toHaveTextContent('€2M+')
  expect(screen.getByLabelText('8+ Years of experience').querySelectorAll('[data-digit-reel]')).toHaveLength(0)
  expect(screen.getByLabelText('16 Global markets').querySelectorAll('[data-digit-reel]')).toHaveLength(0)
  expect(document.querySelectorAll('[data-digit-reel]')).toHaveLength(0)
  expect(container.querySelector('#proof')).toHaveAttribute('data-scroll-frame', 'viewport')
  expect(container.querySelector('#proof')).toHaveAttribute('data-scroll-waypoint', 'proof')
  expect(container.querySelectorAll('[data-scroll-waypoint-mobile^="proof-metric-"]')).toHaveLength(3)
})
