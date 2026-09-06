import type { CSSProperties, ReactNode } from 'react'
import type { CapabilityDemoSlug } from '../data'

interface DemoNodeProps {
  className: string
  label: string
  meta: string
  number: string
  node: string
}

function DemoNode({ className, label, meta, number, node }: DemoNodeProps) {
  return (
    <div className={`capability-demo__node ${className}`} data-demo-node={node}>
      <span>{number}</span>
      <b>{label}</b>
      <small>{meta}</small>
    </div>
  )
}

interface DemoFrameProps {
  children: ReactNode
  footer: ReactNode
  label: string
  slug: string
  status: string
}

function DemoFrame({ children, footer, label, slug, status }: DemoFrameProps) {
  return (
    <div className={`capability-demo capability-demo--${slug}`} data-capability-demo={slug} aria-hidden="true">
      <div className="capability-demo__head"><span>{label}</span><b>{status}</b></div>
      <div className="capability-demo__body">{children}</div>
      <div className="capability-demo__foot">{footer}</div>
    </div>
  )
}

function TagManagementDemo() {
  return (
    <DemoFrame slug="tag-management" label="EVENT CONTRACT / CHECKOUT" status="QA / PASS" footer={<><span>3 DESTINATIONS</span><strong>42MS</strong></>}>
      <svg className="capability-demo__routes" viewBox="0 0 600 340" preserveAspectRatio="none">
        <path d="M72 108H212" /><path d="M258 108H390" /><path d="M438 108H548" />
        <path d="M414 132V250H548" />
        <circle className="capability-demo__packet" r="6"><animateMotion dur="2.6s" repeatCount="indefinite" path="M72 108H212H390H548" /></circle>
      </svg>
      <DemoNode className="demo-tag__trigger" node="ui-event" number="01" label="CLICK" meta="checkout_cta" />
      <DemoNode className="demo-tag__layer" node="data-layer" number="02" label="DATALAYER" meta="schema / v4" />
      <DemoNode className="demo-tag__router" node="tag-router" number="03" label="ROUTER" meta="rules / 07" />
      <div className="demo-tag__destinations">
        <span>GA4 <i>200</i></span><span>TEALIUM <i>200</i></span><span>SNOWPLOW <i>200</i></span>
      </div>
      <div className="demo-tag__payload"><span>event</span><b>purchase</b><span>value</span><b>149.00</b></div>
    </DemoFrame>
  )
}

function ServerSideDemo() {
  return (
    <DemoFrame slug="server-side-tracking" label="SERVER EVENT ROUTE / LIVE" status="12.4K / MIN" footer={<><span>LATENCY / P95</span><strong>84MS</strong></>}>
      <svg className="capability-demo__routes" viewBox="0 0 600 340" preserveAspectRatio="none">
        <path d="M64 164H200" /><path d="M248 164H374" /><path d="M422 164H552" />
        <circle className="capability-demo__packet" r="6"><animateMotion dur="2.4s" repeatCount="indefinite" path="M64 164H552" /></circle>
      </svg>
      <DemoNode className="demo-server__browser" node="browser" number="01" label="BROWSER" meta="first party" />
      <DemoNode className="demo-server__collector" node="collector" number="02" label="COLLECT" meta="sGTM" />
      <DemoNode className="demo-server__enrich" node="enrichment" number="03" label="ENRICH" meta="identity" />
      <DemoNode className="demo-server__warehouse" node="warehouse" number="04" label="WAREHOUSE" meta="validated" />
      <div className="demo-server__headers"><span>CONSENT ✓</span><span>EVENT ID ✓</span><span>IP / REDACTED</span></div>
    </DemoFrame>
  )
}

function CroTestingDemo() {
  return (
    <DemoFrame slug="cro-testing" label="EXPERIMENT / CHECKOUT_07" status="RUNNING" footer={<><span>SAMPLE / 84.2K</span><strong>DAY 18</strong></>}>
      <svg className="capability-demo__routes" viewBox="0 0 600 340" preserveAspectRatio="none">
        <path d="M88 164H174L236 92H318" /><path d="M174 164L236 238H318" />
      </svg>
      <div className="demo-cro__traffic"><span>TRAFFIC</span><strong>50 / 50</strong></div>
      <div className="demo-cro__variant demo-cro__variant--control"><span>CONTROL / A</span><b>3.84%</b><i><em /></i></div>
      <div className="demo-cro__variant demo-cro__variant--winner"><span>VARIANT / B</span><b>4.55%</b><i><em /></i></div>
      <div className="demo-cro__uplift" data-demo-metric="uplift"><span>MEASURED UPLIFT</span><strong>+18.4%</strong><small>CONFIDENCE / 97%</small></div>
    </DemoFrame>
  )
}

function ConsentPrivacyDemo() {
  return (
    <DemoFrame slug="consent-privacy" label="CONSENTED EVENT ROUTE / EU" status="99.2% VALID" footer={<><span>GRANTED / 82%</span><strong>18.4K / MIN</strong></>}>
      <svg className="capability-demo__routes" viewBox="0 0 600 340" preserveAspectRatio="none">
        <path d="M70 112H232" /><path className="is-active" d="M278 112H520" />
        <path className="is-muted" d="M254 138V250H410" />
        <circle className="capability-demo__packet" r="6"><animateMotion dur="2.5s" repeatCount="indefinite" path="M70 112H520" /></circle>
      </svg>
      <DemoNode className="demo-consent__event" node="consent-event" number="01" label="EVENT" meta="browser" />
      <DemoNode className="demo-consent__gate" node="consent-gate" number="02" label="POLICY" meta="consent gate" />
      <DemoNode className="demo-consent__collect" node="consented-route" number="03" label="COLLECT" meta="granted" />
      <DemoNode className="demo-consent__hold" node="quarantine" number="02B" label="HOLD" meta="no consent" />
      <div className="demo-consent__flags"><span>AD_STORAGE</span><b>GRANTED</b><span>ANALYTICS</span><b>GRANTED</b></div>
    </DemoFrame>
  )
}

function BiModellingDemo() {
  return (
    <DemoFrame slug="bi-data-modelling" label="GOVERNED MODEL / REVENUE" status="REFRESHED" footer={<><span>16 MARKETS</span><strong>1 SOURCE</strong></>}>
      <svg className="capability-demo__routes" viewBox="0 0 600 340" preserveAspectRatio="none">
        <path d="M88 74H216V164H290" /><path d="M88 164H290" /><path d="M88 254H216V164" /><path className="is-active" d="M338 164H512" />
        <circle className="capability-demo__packet" r="6"><animateMotion dur="2.8s" repeatCount="indefinite" path="M88 74H216V164H512" /></circle>
      </svg>
      <div className="demo-bi__sources"><span>ORDERS <i>24M</i></span><span>PRODUCT <i>18K</i></span><span>CAMPAIGN <i>840</i></span></div>
      <DemoNode className="demo-bi__model" node="governed-model" number="04" label="MODEL" meta="joins / pass" />
      <DemoNode className="demo-bi__semantic" node="semantic-layer" number="05" label="METRIC" meta="net revenue" />
      <div className="demo-bi__report"><span>NET REVENUE</span><strong>€2.04M</strong><div>{[38, 54, 46, 72, 65, 88].map((value) => <i key={value} style={{ '--bar': `${value}%` } as CSSProperties} />)}</div></div>
    </DemoFrame>
  )
}

function FrontEndDemo() {
  return (
    <DemoFrame slug="front-end-instrumentation" label="INTERACTION TRACE / PURCHASE" status="SCHEMA / PASS" footer={<><span>RELEASE / 1.24.0</span><strong>QA READY</strong></>}>
      <div className="demo-front__interface">
        <span>CHECKOUT</span><strong>Complete order</strong><span className="demo-front__button">PAY £149</span><i />
      </div>
      <div className="demo-front__payload">
        <span>{'{'}</span><b>event:</b> <em>'purchase'</em><br /><b>value:</b> 149.00,<br /><b>currency:</b> <em>'GBP'</em><span>{'}'}</span>
        <i className="demo-front__scan" />
      </div>
      <div className="demo-front__checks" data-demo-node="qa-pass"><span>EVENT NAME</span><b>PASS</b><span>REQUIRED KEYS</span><b>PASS</b><span>DUPLICATE ID</span><b>CLEAR</b></div>
    </DemoFrame>
  )
}

const DEMONSTRATIONS: Record<CapabilityDemoSlug, () => ReactNode> = {
  'front-end-instrumentation': FrontEndDemo,
  'tag-management': TagManagementDemo,
  'server-side-tracking': ServerSideDemo,
  'cro-testing': CroTestingDemo,
  'consent-privacy': ConsentPrivacyDemo,
  'bi-data-modelling': BiModellingDemo,
}

export function CapabilityDemonstration({ demo }: { demo: CapabilityDemoSlug }) {
  const Demonstration = DEMONSTRATIONS[demo]
  return <Demonstration />
}
