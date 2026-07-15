import { useState } from 'react'
import { FAQS } from '../data'

export function Faq() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section
      id="faq"
      className="faq-section"
      aria-labelledby="faq-title"
      data-scroll-scene="faq"
    >
      <header className="faq-header" data-scroll-waypoint="faq-heading">
        <p className="eyebrow">// Common questions</p>
        <h2 id="faq-title">Common<br /><span>questions.</span></h2>
        <p>Clear answers before we start.</p>
      </header>
      <div className="faq-list">
        {FAQS.map((item, index) => {
          const isOpen = openId === item.id
          return (
            <article
              className={`faq-item${isOpen ? ' is-open' : ''}`}
              data-scroll-waypoint-mobile={`faq-${item.id}`}
              key={item.id}
            >
              <button
                type="button"
                aria-label={item.question}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span className="faq-question__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <strong className="faq-question__label">{item.question}</strong>
                <i className="faq-question__icon" aria-hidden="true"><b /><b /></i>
              </button>
              <div
                className="faq-answer-shell"
                id={`faq-answer-${item.id}`}
                aria-hidden={!isOpen}
                inert={!isOpen}
              >
                <div className="faq-answer">
                  <span />
                  <p>{item.answer}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
