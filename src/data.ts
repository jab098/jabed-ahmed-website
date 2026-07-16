export const NAV_LINKS = [
  { label: 'Home', href: '#home', number: '01' },
  { label: 'Expertise', href: '#capabilities', number: '02' },
  { label: 'Approach', href: '#process', number: '03' },
  { label: 'Examples', href: '#systems', number: '04' },
  { label: 'FAQ', href: '#faq', number: '05' },
  { label: 'Contact', href: '#contact', number: '06' },
] as const

export const LINKEDIN_URL = 'https://linkedin.com/in/jabed98'
export const CALENDLY_URL = 'https://calendly.com/jabed098/30min'
export const EMAIL = 'consulting@jabed.co.uk'

export function formatMetricCount(value: string, progress: number, from = 0, decimals = 0) {
  if (progress === 1) return value

  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/)
  if (!match) return value

  const [, prefix, numericValue, suffix] = match
  const target = Number(numericValue)
  const easedProgress = 1 - Math.pow(1 - progress, 3)
  const currentValue = from + (target - from) * easedProgress
  const formattedValue = decimals > 0 ? currentValue.toFixed(decimals) : Math.round(currentValue).toString()

  return `${prefix}${formattedValue}${suffix}`
}

export const METRICS = [
  { value: '8+', label: 'Years of experience' },
  { value: '16', label: 'Global markets' },
  { value: '€2M+', label: 'Experimentation uplift', from: 0.5, decimals: 1 },
] as const

export const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Diagnose the decision.',
    copy: 'Start with the decision, then identify the measurement gaps, broken signals and evidence that would make the next move defensible.',
    visual: 'Measurement audit',
  },
  {
    number: '02',
    title: 'Architect the system.',
    copy: 'Translate product behaviour into a governed event model that connects consent, collection, destinations and reporting.',
    visual: 'Event architecture',
  },
  {
    number: '03',
    title: 'Build and validate.',
    copy: 'Implement the instrumentation, test the edge cases and prove every critical signal before it reaches a decision-maker.',
    visual: 'Quality assurance matrix',
  },
  {
    number: '04',
    title: 'Enable and improve.',
    copy: 'Turn the system into useful reporting, clear documentation and an operating rhythm the team can continue without dependency.',
    visual: 'Decision brief',
  },
] as const

export const SYSTEMS = [
  {
    number: '01',
    title: 'Measurement architecture',
    summary: 'A governed event model that keeps product, engineering and growth aligned.',
    tags: ['DATA LAYER', 'GOVERNANCE', 'SCHEMA'],
    metric: '42 EVENTS',
  },
  {
    number: '02',
    title: 'Experimentation readout',
    summary: 'A clear commercial view of tests, confidence and the value of the winning experience.',
    tags: ['CRO', 'ADOBE TARGET', 'UPLIFT'],
    metric: '+18.4%',
  },
  {
    number: '03',
    title: 'Consent and server-side pipeline',
    summary: 'Privacy-aware collection that preserves useful signals across browser and server boundaries.',
    tags: ['ONETRUST', 'SGTM', 'CONSENT MODE'],
    metric: '99.2%',
  },
  {
    number: '04',
    title: 'Executive decision dashboard',
    summary: 'A focused outcome layer that turns governed measurement into confident action.',
    tags: ['POWER BI', 'LOOKER', 'SQL'],
    metric: '16 MARKETS',
  },
] as const

export const CAPABILITIES = [
  {
    number: '01',
    title: 'Tag Management',
    discipline: 'Implementation',
    copy: 'GTM and Tealium ecosystems, dataLayer specifications, documentation and QA standards that remain consistent at scale.',
    stack: ['GTM', 'Tealium iQ', 'Snowplow'],
  },
  {
    number: '02',
    title: 'Server-Side Tracking',
    discipline: 'Infrastructure',
    copy: 'Behavioural pipelines spanning browser capture, collectors, enrichment and dependable warehouse delivery.',
    stack: ['sGTM', 'GA4', 'EventStream'],
  },
  {
    number: '03',
    title: 'CRO & Testing',
    discipline: 'Experimentation',
    copy: 'A/B testing and personalisation programmes with hypotheses, clean evaluation and measurable commercial outcomes.',
    stack: ['Adobe Target', 'A/B testing', 'Personalisation'],
  },
  {
    number: '04',
    title: 'Consent & Privacy',
    discipline: 'Compliance',
    copy: 'GDPR-aligned consent architecture across markets, including Consent Mode, ATT and SKAdNetwork requirements.',
    stack: ['OneTrust', 'Consent Mode v2', 'GDPR'],
  },
  {
    number: '05',
    title: 'BI & Data Modelling',
    discipline: 'Reporting',
    copy: 'Stakeholder-ready reporting built on governed models and reliable definitions instead of fragile dashboard logic.',
    stack: ['Power BI', 'Looker', 'SQL'],
  },
  {
    number: '06',
    title: 'Front-End Instrumentation',
    discipline: 'Engineering',
    copy: 'Custom JavaScript event tracking with structured validation and release-quality implementation discipline.',
    stack: ['JavaScript', 'Event tracking', 'QA'],
  },
] as const

export const FAQS = [
  {
    id: 'fit',
    question: 'What kinds of measurement problems are a good fit?',
    answer: 'Projects where a product, growth or engineering decision depends on evidence you do not yet trust: fragmented tracking, unclear event models, consent gaps, weak experimentation or reporting that teams cannot defend.',
  },
  {
    id: 'stack',
    question: 'Can you work with our existing analytics stack?',
    answer: 'Yes. The first step is understanding what should remain, what is creating risk and where a targeted intervention is more useful than a platform replacement.',
  },
  {
    id: 'delivery',
    question: 'Do you implement as well as advise?',
    answer: 'Both. Engagements can cover strategy, specifications and governance, or continue into hands-on implementation, validation and enablement with your teams.',
  },
  {
    id: 'timing',
    question: 'How long does an engagement take?',
    answer: 'Focused audits can run for a few weeks. Architecture and implementation programmes are shaped around the system, markets and release constraints after an initial working session.',
  },
  {
    id: 'privacy',
    question: 'Can you support international consent requirements?',
    answer: 'Yes. My experience includes governed tagging and consent across multiple international markets, with OneTrust, Consent Mode, ATT and related privacy constraints.',
  },
  {
    id: 'aftercare',
    question: 'What happens after launch?',
    answer: 'The handover includes validation evidence, documentation and a clear operating model so your team can maintain and improve the system rather than inherit a black box.',
  },
] as const
