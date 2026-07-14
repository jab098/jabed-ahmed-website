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
