import { useEffect, useRef, useState } from 'react'
import { CAPABILITIES } from '../data'
import { CapabilityDemonstration } from './CapabilityDemonstration'

export function Capabilities() {
  const rootRef = useRef<HTMLElement>(null)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeCapability, setActiveCapability] = useState(0)
  const [previousCapability, setPreviousCapability] = useState<number | null>(null)

  useEffect(() => () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
  }, [])

  const selectCapability = (nextIndex: number) => {
    if (nextIndex === activeCapability) return
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)

    setPreviousCapability(activeCapability)
    setActiveCapability(nextIndex)
    transitionTimerRef.current = setTimeout(() => {
      setPreviousCapability(null)
      transitionTimerRef.current = null
    }, 480)
  }

  const moveCapabilityFocus = (index: number, direction: -1 | 1) => {
    const nextIndex = (index + direction + CAPABILITIES.length) % CAPABILITIES.length
    selectCapability(nextIndex)
    rootRef.current
      ?.querySelector<HTMLButtonElement>(`#capability-tab-${CAPABILITIES[nextIndex].number}`)
      ?.focus()
  }

  return (
    <section
      ref={rootRef}
      id="capability-system"
      className="capabilities-section"
      aria-label="Connected measurement capabilities"
      data-scroll-scene="capabilities"
      data-scroll-frame="viewport"
      data-scroll-waypoint="capabilities"
    >
      <div className="capabilities-workspace">
        <div className="capability-selector" role="tablist" aria-label="Measurement capabilities">
          {CAPABILITIES.map((capability, index) => (
            <button
              type="button"
              role="tab"
              id={`capability-tab-${capability.number}`}
              aria-controls={`capability-panel-${capability.number}`}
              aria-label={`${capability.number} ${capability.title}`}
              aria-selected={activeCapability === index}
              tabIndex={activeCapability === index ? 0 : -1}
              className={activeCapability === index ? 'is-active' : ''}
              onClick={() => selectCapability(index)}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                event.preventDefault()
                moveCapabilityFocus(index, event.key === 'ArrowRight' ? 1 : -1)
              }}
              key={capability.number}
            >
              <span>{capability.number}</span>
              <strong>{capability.title}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="capability-panels">
          {CAPABILITIES.map((capability, index) => {
            const isCurrent = activeCapability === index
            const isOutgoing = previousCapability === index
            const panelState = isCurrent ? 'current' : isOutgoing ? 'outgoing' : 'inactive'

            return (
              <div
                role="tabpanel"
                id={`capability-panel-${capability.number}`}
                aria-labelledby={`capability-tab-${capability.number}`}
                aria-hidden={isCurrent ? undefined : true}
                className="capability-panel"
                data-active={isCurrent ? 'true' : undefined}
                data-layout={capability.layout}
                data-panel-state={panelState}
                hidden={!isCurrent && !isOutgoing}
                key={capability.number}
              >
                <CapabilityDemonstration demo={capability.demo} />
                <div className="capability-panel__top">
                  <span>{capability.number} / {capability.discipline}</span>
                  <span><i aria-hidden="true" />Signal live</span>
                </div>
                <div className="capability-panel__copy">
                  <h3>{capability.title}</h3>
                  <p>{capability.copy}</p>
                  <div className="capability-panel__stack">
                    {capability.stack.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
