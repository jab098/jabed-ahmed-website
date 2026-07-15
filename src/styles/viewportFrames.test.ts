/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const faqStyles = readFileSync('src/styles/capabilities-faq.css', 'utf8')

describe('short desktop viewport frames', () => {
  it('compacts the complete FAQ composition below 760px tall', () => {
    expect(faqStyles).toContain(
      '@media (min-width: 901px) and (max-height: 760px)',
    )
    expect(faqStyles).toMatch(
      /@media \(min-width: 901px\) and \(max-height: 760px\)[\s\S]*?\.faq-list button\s*\{[^}]*min-height:/,
    )
  })
})
