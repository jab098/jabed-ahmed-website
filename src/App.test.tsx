import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('renders the approved v2 chapter order', () => {
  const { container } = render(<App />)

  expect(screen.getByText('Skip to content')).toHaveAttribute('href', '#main-content')
  expect(container.querySelector('main#main-content')).toBeInTheDocument()
  expect([...container.querySelectorAll('main > section')].map((node) => node.id)).toEqual([
    'home',
    'proof',
    'process',
    'systems',
    'capabilities',
    'faq',
    'contact',
  ])
})
