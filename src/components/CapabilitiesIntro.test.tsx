import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from '../App'

it('renders the measurement headline as its own editorial scene', () => {
  const { container } = render(<App />)

  expect(screen.getByRole('heading', { name: "What's in a reliable measurement system?" })).toBeInTheDocument()
  const intro = container.querySelector('#capabilities')
  expect(intro).toHaveAttribute('data-scroll-scene', 'capabilities-intro')
  expect(intro).toHaveAttribute('data-scroll-waypoint', 'capabilities-heading')
  expect(intro?.querySelector('.capability-selector')).not.toBeInTheDocument()
})
