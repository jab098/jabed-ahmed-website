import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { SiteNav } from './SiteNav'

afterEach(() => {
  vi.useRealTimers()
})

it('opens an accessible full-screen menu and closes it with Escape', async () => {
  const user = userEvent.setup()
  render(<SiteNav />)

  const trigger = screen.getByRole('button', { name: 'Menu' })
  await user.click(trigger)

  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('dialog', { name: 'Site menu' })).toBeInTheDocument()
  expect(document.body.style.overflow).toBe('hidden')

  fireEvent.keyDown(document, { key: 'Escape' })

  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(document.body.style.overflow).toBe('')
  expect(trigger).toHaveFocus()
})

it('contains the approved navigation and consulting action', () => {
  const { container } = render(<SiteNav />)

  expect(screen.getByRole('link', { name: 'Jabed Ahmed — home' })).toHaveAttribute('href', '#home')
  expect(screen.getByRole('link', { name: 'Schedule a call' })).toHaveAttribute(
    'href',
    'https://calendly.com/jabed098/30min',
  )
  expect(container.querySelector('.site-menu__header')).toHaveAttribute('data-menu-fade')
  expect(container.querySelector('.site-menu__footer')).toHaveAttribute('data-menu-fade')
  expect(container.querySelectorAll('.site-menu__links a[data-menu-fade]')).toHaveLength(6)
})

it('ignores tiny scroll reversals and only changes visibility after deliberate travel', () => {
  vi.useFakeTimers()
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 600 })
  const { container } = render(<SiteNav />)
  const nav = container.querySelector('.site-nav')

  window.scrollY = 605
  fireEvent.scroll(window)
  act(() => vi.runOnlyPendingTimers())
  expect(nav).not.toHaveClass('is-hidden')

  window.scrollY = 670
  fireEvent.scroll(window)
  act(() => vi.runOnlyPendingTimers())
  expect(nav).toHaveClass('is-hidden')

  window.scrollY = 665
  fireEvent.scroll(window)
  act(() => vi.runOnlyPendingTimers())
  expect(nav).toHaveClass('is-hidden')

  window.scrollY = 590
  fireEvent.scroll(window)
  act(() => vi.runOnlyPendingTimers())
  expect(nav).not.toHaveClass('is-hidden')
})
