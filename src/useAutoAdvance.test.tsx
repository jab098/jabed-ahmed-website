import { act, fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAutoAdvance } from './useAutoAdvance'

const originalObserver = globalThis.IntersectionObserver

beforeEach(() => {
  vi.useFakeTimers()
  class VisibleObserver {
    callback: IntersectionObserverCallback
    constructor(callback: IntersectionObserverCallback) { this.callback = callback }
    observe(target: Element) {
      this.callback([{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal('IntersectionObserver', VisibleObserver)
})

afterEach(() => {
  vi.useRealTimers()
  vi.stubGlobal('IntersectionObserver', originalObserver)
})

function Sequence() {
  const root = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(0)
  const controls = useAutoAdvance(root, () => setValue(v => v + 1))
  return <div ref={root}>
    <output aria-label="Current state">{value}</output>
    <button onClick={controls.pause}>Pause</button>
    <button onClick={controls.resume}>Resume</button>
  </div>
}

it('keeps a paused sequence still until explicitly resumed', () => {
  render(<Sequence />)
  act(() => vi.advanceTimersByTime(4000))
  expect(screen.getByLabelText('Current state')).toHaveTextContent('1')
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
  act(() => vi.advanceTimersByTime(24000))
  expect(screen.getByLabelText('Current state')).toHaveTextContent('1')
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
  act(() => vi.advanceTimersByTime(4000))
  expect(screen.getByLabelText('Current state')).toHaveTextContent('2')
})

it('suspends playback in a hidden browser tab', () => {
  render(<Sequence />)
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
  fireEvent(document, new Event('visibilitychange'))
  act(() => vi.advanceTimersByTime(12000))
  expect(screen.getByLabelText('Current state')).toHaveTextContent('0')
  hidden.mockReturnValue(false)
  fireEvent(document, new Event('visibilitychange'))
  act(() => vi.advanceTimersByTime(4000))
  expect(screen.getByLabelText('Current state')).toHaveTextContent('1')
  hidden.mockRestore()
})
