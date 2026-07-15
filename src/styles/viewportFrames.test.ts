/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const faqStyles = readFileSync('src/styles/capabilities-faq.css', 'utf8')
const heroStyles = readFileSync('src/styles/hero.css', 'utf8')

describe('short desktop viewport frames', () => {
  it('compacts the complete FAQ composition across laptop-height viewports', () => {
    expect(faqStyles).toContain(
      '@media (min-width: 901px) and (max-height: 940px)',
    )
    expect(faqStyles).toMatch(
      /@media \(min-width: 901px\) and \(max-height: 940px\)[\s\S]*?\.faq-list button\s*\{[^}]*min-height:/,
    )
  })

  it('centres every desktop Proof block on one shared content band', () => {
    expect(heroStyles).toContain('--proof-content-band: 60%')
    expect(heroStyles).toMatch(
      /\.proof-art__content,[\s\S]*?\.proof-metric__content\s*\{[^}]*top: var\(--proof-content-band\);[^}]*transform: translateY\(-50%\);/,
    )
  })

  it('fits the longest animated Proof value on compact desktop columns', () => {
    expect(heroStyles).toMatch(
      /@media \(min-width: 901px\) and \(max-width: 1200px\)[\s\S]*?\.static-value\s*\{[^}]*font-size: clamp\(3\.1rem, 5\.8vw, 6rem\);/,
    )
  })
})
