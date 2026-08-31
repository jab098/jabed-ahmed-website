import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PageLoader } from './PageLoader'

beforeEach(() => {
  vi.useFakeTimers()
  document.documentElement.classList.add('is-loading')
  document.body.style.overflow = 'hidden'
})

afterEach(() => {
  vi.useRealTimers()
  document.documentElement.className = ''
  document.body.style.overflow = ''
  history.replaceState(null, '', '/')
})

it('keeps the two-stage entrance and lands on a directly requested section afterward', () => {
  history.replaceState(null, '', '/#systems')
  const target = document.createElement('section')
  target.id = 'systems'
  target.scrollIntoView = vi.fn()
  document.body.append(target)
  const { container } = render(<PageLoader />)
  expect(container.querySelectorAll('.loader-plane')).toHaveLength(2)
  expect(document.documentElement).toHaveClass('is-loading')
  act(() => vi.advanceTimersByTime(4100))
  expect(location.hash).toBe('#systems')
  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' })
  target.remove()
})

it('completes the loading contract and unlocks the page once', () => {
  const onComplete = vi.fn()
  const fallbackWindow = window as typeof window & { __loaderFallback?: number }
  fallbackWindow.__loaderFallback = window.setTimeout(() => undefined, 7000)

  render(<PageLoader onComplete={onComplete} />)
  expect(screen.getByText('JA / DATA')).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(4100))

  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(document.documentElement).not.toHaveClass('is-loading')
  expect(document.documentElement).toHaveClass('loader-complete')
  expect(document.body.style.overflow).toBe('')
  expect(fallbackWindow.__loaderFallback).toBeUndefined()
})
