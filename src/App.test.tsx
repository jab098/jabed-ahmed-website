import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'
import readme from '../README.md?raw'

it('renders the approved v2 chapter order', () => {
  const { container } = render(<App />)

  expect(screen.getByText('Skip to content')).toHaveAttribute('href', '#main-content')
  expect(container.querySelector('main#main-content')).toBeInTheDocument()
  expect(container.querySelector('[data-narrative-scroll-director]')).toBeInTheDocument()
  expect(container.querySelectorAll('[data-scroll-scene]')).toHaveLength(8)
  expect([...container.querySelectorAll('main > section')].map((node) => node.id)).toEqual([
    'home',
    'proof',
    'capabilities',
    'process',
    'systems',
    'faq',
    'contact',
  ])
})

it('links the permanent scroll choreography contract', () => {
  expect(readme).toContain('docs/design-language/scroll-choreography.md')
})
