import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { SiteNav } from './SiteNav'

afterEach(() => {
  vi.useRealTimers()
})

it('puts a close control inside the dialog and restores focus after closing', async () => {
  const user = userEvent.setup()
  render(<SiteNav />)
  const trigger = screen.getByRole('button', { name: 'Menu' })
  await user.click(trigger)
  const dialog = screen.getByRole('dialog', { name: 'Site menu' })
  const close = within(dialog).getByRole('button', { name: 'Close menu' })
  close.focus()
  await user.keyboard('{Enter}')
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveFocus()
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

it('keeps keyboard focus inside the open menu, including its close control', async () => {
  const user = userEvent.setup()
  render(<SiteNav />)
  await user.click(screen.getByRole('button', { name: 'Menu' }))
  const dialog = screen.getByRole('dialog', { name: 'Site menu' })
  const close = within(dialog).getByRole('button', { name: 'Close menu' })
  const email = within(dialog).getByRole('link', { name: 'consulting@jabed.co.uk' })
  close.focus()
  await user.tab({ shift: true })
  expect(email).toHaveFocus()
  await user.tab()
  expect(close).toHaveFocus()
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

it('keeps the navigation visible at a desktop viewport-framed landing', () => {
  vi.useFakeTimers()
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 })
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 600 })
  const frame = document.createElement('section')
  frame.dataset.scrollFrame = 'viewport'
  frame.dataset.scrollWaypoint = 'faq-heading'
  document.body.append(frame)
  const { container } = render(<SiteNav />)
  const nav = container.querySelector('.site-nav') as HTMLElement
  let frameTop = 400

  vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
    bottom: 68,
    height: 68,
    left: 0,
    right: 1200,
    top: 0,
    width: 1200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
  vi.spyOn(frame, 'getBoundingClientRect').mockImplementation(() => ({
    bottom: frameTop + 800,
    height: 800,
    left: 0,
    right: 1200,
    top: frameTop,
    width: 1200,
    x: 0,
    y: frameTop,
    toJSON: () => ({}),
  }))

  window.scrollY = 670
  fireEvent.scroll(window)
  act(() => vi.runOnlyPendingTimers())
  expect(nav).toHaveClass('is-hidden')

  frameTop = 68
  window.scrollY = 1000
  fireEvent.scroll(window)
  act(() => vi.runOnlyPendingTimers())

  expect(nav).not.toHaveClass('is-hidden')
})
