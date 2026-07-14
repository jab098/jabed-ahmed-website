import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Contact } from './Contact'

it('ends with the approved contact actions and an interactive signal footer', () => {
  const { container } = render(<Contact />)

  expect(screen.getByRole('heading', { name: 'Ready to make your data useful?' })).toBeInTheDocument()
  expect(container.querySelector('.contact-flash-word')).toHaveTextContent('your')
  expect(container.querySelector('.contact-flash-word')).toHaveAttribute('data-scroll-flash', 'tight')
  expect(screen.getByRole('link', { name: 'Schedule a call' })).toHaveAttribute('href', 'https://calendly.com/jabed098/30min')
  expect(screen.getByRole('link', { name: 'consulting@jabed.co.uk' })).toHaveAttribute('href', 'mailto:consulting@jabed.co.uk')

  const footer = screen.getByRole('contentinfo')
  const colour = screen.getByRole('button', { name: 'Change colour' })
  expect(footer.querySelector('svg')).toBeInTheDocument()
  expect(colour).toHaveAttribute('data-palette', '0')
  fireEvent.click(colour)
  expect(colour).toHaveAttribute('data-palette', '1')
})
