import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Process } from './Process'

it('renders four selectable process states and updates the active decision visual', async () => {
  const user = userEvent.setup()
  render(<Process />)

  expect(screen.getByRole('heading', { name: 'How I turn uncertainty into a working data system.' })).toBeInTheDocument()
  const first = screen.getByRole('button', { name: '01 Diagnose the decision.' })
  const fourth = screen.getByRole('button', { name: '04 Enable and improve.' })

  expect(first).toHaveAttribute('aria-pressed', 'true')
  await user.click(fourth)
  expect(fourth).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('Decision brief')).toBeVisible()

  const release = document.querySelector('[data-release-decision]')
  expect(release).toBeInTheDocument()
  expect(release?.querySelector('[data-release-comparison]')).toBeInTheDocument()
  expect(release).toHaveTextContent('+18.4%')
  expect(release).toHaveTextContent('96%')
  expect(release).toHaveTextContent('Guardrails stable')
  expect(release).toHaveTextContent('Evidence')
  expect(release).toHaveTextContent('Decision')
  expect(release).toHaveTextContent('Owner')
})

it('keeps the audit denominator separate and connects each architecture node in sequence', async () => {
  const user = userEvent.setup()
  const { container } = render(<Process />)

  expect(container.querySelector('.audit-visual__denominator')).toHaveTextContent('/100')

  await user.click(screen.getByRole('button', { name: '02 Architect the system.' }))
  const connectors = container.querySelector('[data-event-connectors]')
  expect(connectors).toBeInTheDocument()
  expect(connectors?.querySelectorAll('path')).toHaveLength(4)
})

it('uses the empty audit space for one clear diagnostic summary', () => {
  const { container } = render(<Process />)
  const summary = container.querySelector('[data-audit-summary]')

  expect(summary).toBeInTheDocument()
  expect(summary?.children).toHaveLength(3)
  expect(summary).toHaveTextContent('Signals checked')
  expect(summary).toHaveTextContent('Blockers')
  expect(summary).toHaveTextContent('Next action')
})
