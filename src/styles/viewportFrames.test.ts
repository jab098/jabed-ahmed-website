/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const faqStyles = readFileSync('src/styles/capabilities-faq.css', 'utf8')

describe('short desktop viewport frames', () => {
  it('compacts the complete FAQ composition across laptop-height viewports', () => {
    expect(faqStyles).toContain(
      '@media (min-width: 901px) and (max-height: 940px)',
    )
    expect(faqStyles).toMatch(
      /@media \(min-width: 901px\) and \(max-height: 940px\)[\s\S]*?\.faq-list button\s*\{[^}]*min-height:/,
    )
  })

  it('gives the capability headline and workspace separate authored compositions', () => {
    expect(faqStyles).toMatch(
      /\.capabilities-intro\s*\{[^}]*min-height: 88svh;/,
    )
    expect(faqStyles).toMatch(/\.capabilities-workspace\s*\{[^}]*grid-template-columns: 31% 69%;/)
    const baseHeadingRule = faqStyles.match(/\.capabilities-intro h2\s*\{[^}]*\}/)?.[0]
    expect(baseHeadingRule).toContain('max-width: 13ch')
  })

  it('uses a horizontal capability selector instead of a long mobile list', () => {
    expect(faqStyles).toMatch(
      /@media \(max-width: 900px\)[\s\S]*?\.capability-selector\s*\{[^}]*display: flex;[^}]*overflow-x: auto;/,
    )
  })

  it('stacks the bespoke demonstration above its copy on mobile and settles motion when requested', () => {
    expect(faqStyles).toMatch(
      /@media \(max-width: 900px\)[\s\S]*?\.capability-demo\s*\{[^}]*height:/,
    )
    expect(faqStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.capability-demo[^}]*animation: none !important;/,
    )
  })

  it('authors a distinct desktop composition for every capability', () => {
    const layouts = [
      'front-end-instrumentation',
      'tag-management',
      'server-side-tracking',
      'cro-testing',
      'consent-privacy',
      'bi-data-modelling',
    ]

    layouts.forEach((layout) => {
      expect(faqStyles).toContain(`.capability-panel[data-layout="${layout}"]`)
    })
  })

  it('moves current and outgoing compositions for 480ms while mobile returns to one readable stack', () => {
    expect(faqStyles).toMatch(
      /\.capability-panel\[data-panel-state="current"\][\s\S]*?capability-demo[^{]*\{[^}]*animation:[^;]*480ms/,
    )
    expect(faqStyles).toMatch(
      /\.capability-panel\[data-panel-state="outgoing"\][\s\S]*?capability-demo[^{]*\{[^}]*animation:[^;]*480ms/,
    )
    expect(faqStyles).toMatch(
      /@media \(max-width: 900px\)[\s\S]*?\.capability-panel__copy\s*\{[^}]*position: relative;/,
    )
    expect(faqStyles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.capability-panel\[data-panel-state[^}]*animation: none !important;/,
    )
  })

  it('keeps the standalone capability workspace usable on short desktop viewports', () => {
    expect(faqStyles).toMatch(
      /@media \(min-width: 901px\) and \(max-height: 760px\)[\s\S]*?\.capabilities-intro\s*\{[^}]*min-height: calc\(100svh - var\(--nav-height\)\);/,
    )
    expect(faqStyles).toMatch(
      /@media \(min-width: 901px\) and \(max-height: 760px\)[\s\S]*?\.capabilities-workspace\s*\{[^}]*min-height:/,
    )
    expect(faqStyles).toMatch(
      /@media \(min-width: 901px\) and \(max-height: 760px\)[\s\S]*?\.capability-selector button\s*\{[^}]*min-height: 0;/,
    )
  })
})
