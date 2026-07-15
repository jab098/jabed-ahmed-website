import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Faq } from './Faq'

it('opens and closes one black-section question at a time', async () => {
  const user = userEvent.setup()
  const { container } = render(<Faq />)

  const first = screen.getByRole('button', { name: 'What kinds of measurement problems are a good fit?' })
  const second = screen.getByRole('button', { name: 'Can you work with our existing analytics stack?' })
  const firstAnswer = container.querySelector('#faq-answer-fit')
  const secondAnswer = container.querySelector('#faq-answer-stack')
  expect(container.querySelector('.faq-header')).toHaveAttribute(
    'data-scroll-waypoint',
    'faq-heading',
  )
  expect(container.querySelectorAll('[data-scroll-waypoint-mobile^="faq-"]')).toHaveLength(6)
  expect(container.querySelectorAll('.faq-item')).toHaveLength(6)
  expect(first).toHaveAttribute('aria-expanded', 'false')
  expect(firstAnswer).toHaveAttribute('aria-hidden', 'true')

  await user.click(first)
  expect(first).toHaveAttribute('aria-expanded', 'true')
  expect(firstAnswer).toHaveAttribute('aria-hidden', 'false')
  expect(screen.getByText(/fragmented tracking/i)).toBeInTheDocument()

  await user.click(second)
  expect(first).toHaveAttribute('aria-expanded', 'false')
  expect(second).toHaveAttribute('aria-expanded', 'true')
  expect(firstAnswer).toHaveAttribute('aria-hidden', 'true')
  expect(secondAnswer).toHaveAttribute('aria-hidden', 'false')
})
