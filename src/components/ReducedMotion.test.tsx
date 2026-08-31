import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { HeroArtwork } from './HeroArtwork'
import { Process } from './Process'
import { SystemsShowcase } from './SystemsShowcase'
import { FooterGlyphStream } from './FooterGlyphStream'

afterEach(() => vi.restoreAllMocks())

it('keeps artwork and sequences still while retaining manual exploration under reduced motion', () => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
    ...media, media: query, matches: query === '(prefers-reduced-motion: reduce)',
  }))
  const { container } = render(<><HeroArtwork active /><Process /><SystemsShowcase /><FooterGlyphStream /></>)
  expect(screen.getByRole('button', { name: 'Play artwork' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Play footer artwork' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Resume examples' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Resume process animation' })).toBeDisabled()
  expect(container.querySelector('animateMotion')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Next formation' }))
  expect(screen.getByText('WEAVE / 02')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Next example' }))
  expect(container.querySelector('.system-card[data-active]')).toHaveTextContent('Experimentation readout')
})
