import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  window.clearTimeout(window.__loaderFallback)
  history.replaceState(null, '', '/')
  document.documentElement.className = ''
  document.body.style.overflow = ''
  vi.useRealTimers()
})

it('keeps a directly requested section in the URL', async () => {
  history.replaceState(null, '', '/#systems')
  await import('./loader')
  expect(location.hash).toBe('#systems')
  expect(history.scrollRestoration).toBe('auto')
})

it('unlocks the page and releases the hero if the normal loader cannot complete', async () => {
  vi.useFakeTimers()
  vi.resetModules()
  const complete = vi.fn()
  window.addEventListener('site:loader-complete', complete, { once: true })
  document.documentElement.classList.add('is-loading')
  document.body.style.overflow = 'hidden'
  await import('./loader')
  vi.advanceTimersByTime(7000)
  expect(document.documentElement).toHaveClass('loader-complete')
  expect(document.documentElement).not.toHaveClass('is-loading')
  expect(document.body.style.overflow).toBe('')
  expect(complete).toHaveBeenCalledTimes(1)
})
