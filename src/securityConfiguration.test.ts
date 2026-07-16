import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8')

describe('production security configuration', () => {
  it('ships restrictive Cloudflare Pages response headers', () => {
    const viteConfig = readProjectFile('vite.config.ts')
    const headers = readProjectFile('cloudflare/_headers')

    expect(viteConfig).toContain("publicDir: 'cloudflare'")
    expect(headers).toContain('! Access-Control-Allow-Origin')
    expect(headers).toContain('Content-Security-Policy:')
    expect(headers).toContain("default-src 'self'")
    expect(headers).toContain("script-src 'self'")
    expect(headers).toContain("frame-ancestors 'none'")
    expect(headers).toContain('Strict-Transport-Security: max-age=31536000; includeSubDomains')
    expect(headers).toContain('X-Frame-Options: DENY')
    expect(headers).toContain('X-Content-Type-Options: nosniff')
    expect(headers).toContain('Referrer-Policy: strict-origin-when-cross-origin')
    expect(headers).toContain('Permissions-Policy:')
    expect(headers).toContain('Cross-Origin-Opener-Policy: same-origin')
    expect(headers).toContain('Cross-Origin-Resource-Policy: same-origin')
    const scriptPolicy = headers.match(/script-src\s+([^;]+)/)?.[1]
    expect(scriptPolicy).toBeDefined()
    expect(scriptPolicy?.trim().split(/\s+/)).toEqual([
      "'self'",
      'https://static.cloudflareinsights.com/beacon.min.js',
    ])
    const connectPolicy = headers.match(/connect-src\s+([^;]+)/)?.[1]
    expect(connectPolicy?.trim().split(/\s+/)).toEqual([
      "'self'",
      'https://cloudflareinsights.com/cdn-cgi/rum',
    ])
  })

  it('keeps executable code and page CSS out of inline HTML blocks', () => {
    for (const page of ['index.html', 'privacy.html']) {
      const html = readProjectFile(page)
      expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/i)
      expect(html).not.toMatch(/<style(?:\s[^>]*)?>/i)
    }
  })

  it('binds CI actions immutably and isolates write authority', () => {
    const workflow = readProjectFile('.github/workflows/release.yml')
    const actionRefs = [...workflow.matchAll(/^\s*uses:\s*([^\s#]+)/gm)].map((match) => match[1])

    expect(actionRefs.length).toBeGreaterThan(0)
    for (const actionRef of actionRefs) {
      expect(actionRef).toMatch(/@[a-f0-9]{40}$/)
    }
    expect(workflow).not.toContain('softprops/action-gh-release')
    const rootPermissions = workflow
      .match(/^permissions:\s*\n([\s\S]*?)\n\nconcurrency:/m)?.[1]
      .split('\n')
      .map((line) => line.trim())
    expect(rootPermissions).toEqual(['contents: read', 'pull-requests: read'])
    expect(workflow).toMatch(/uses: actions\/checkout@[a-f0-9]{40}[\s\S]*?persist-credentials: false/)
    expect(workflow).toMatch(/uses: gitleaks\/gitleaks-action@[a-f0-9]{40}[\s\S]*?GITHUB_TOKEN: \$\{\{ github\.token \}\}/)
    expect(workflow).toMatch(/release:[\s\S]*?permissions:\s*\n\s+contents:\s+write/)
    expect(workflow).toMatch(/deploy:[\s\S]*?permissions:\s*\{\}/)
    expect(workflow).toContain('needs: verify')
    expect(workflow).toContain('curl --fail-with-body')
    expect(workflow).toContain("--proto '=https'")
    expect(workflow).toContain('https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/*')
    expect(workflow).toContain('gh release create')
  })

  it('ignores local secrets and private key material', () => {
    const ignore = readProjectFile('.gitignore')

    for (const pattern of [
      '.env',
      '.env.*',
      '!.env.example',
      '*.pem',
      '*.key',
      '*.p12',
      '*.pfx',
      '*.jks',
      '*.keystore',
      '.npmrc',
      '.netrc',
      'id_rsa*',
      'id_ed25519*',
      'AGENTS.local.md',
    ]) {
      expect(ignore).toContain(pattern)
    }
  })

  it('uses both opener protections on every new browsing context', () => {
    const components = [
      readProjectFile('src/components/Contact.tsx'),
      readProjectFile('src/components/Hero.tsx'),
      readProjectFile('src/components/SiteNav.tsx'),
    ].join('\n')
    const blankLinks = components.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []

    expect(blankLinks.length).toBeGreaterThan(0)
    for (const link of blankLinks) {
      expect(link).toMatch(/rel="[^"]*noopener[^"]*"/)
      expect(link).toMatch(/rel="[^"]*noreferrer[^"]*"/)
    }
  })

  it('pauses every continuous canvas outside the visible page', () => {
    for (const component of ['GlyphReport.tsx', 'FooterGlyphStream.tsx']) {
      const source = readProjectFile(`src/components/${component}`)
      expect(source).toContain('new IntersectionObserver')
      expect(source).toContain("document.addEventListener('visibilitychange'")
      expect(source).toContain('if (!shouldAnimate()) return')
    }
  })
})
