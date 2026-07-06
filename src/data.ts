import { BarChart3, Code2, FlaskConical, Server, ShieldCheck, Tag } from 'lucide-react'

/* Site-wide constants shared across sections */

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Who Am I', href: '#who' },
  { label: 'Insights', href: '#insights' },
  { label: 'Service', href: '#service' },
  { label: 'Contact', href: '#contact' },
]
export const LINKEDIN_URL = 'https://linkedin.com/in/jabed98'
export const CALENDLY_URL = 'https://calendly.com/jabed098/30min'
export const EMAIL = 'consulting@jabed.co.uk'

export const SERVICES = [
  {
    number: '01',
    icon: Tag,
    overline: 'Implementation',
    headline: 'Tag Management',
    blurb:
      'Tag ecosystems managed across five international markets — dataLayer design specs, documentation and QA standards that keep tracking consistent at scale.',
    stack: ['GTM', 'Tealium iQ', 'Snowplow', 'Custom templates', 'dataLayer architecture'],
  },
  {
    number: '02',
    icon: Server,
    overline: 'Infrastructure',
    headline: 'Server-Side Tracking',
    blurb:
      'End-to-end behavioural pipelines: browser-level capture, collector configuration, stream processing and enrichment — delivered cleanly into the warehouse.',
    stack: ['sGTM', 'GA4', 'Tealium EventStream', 'First-party cookies'],
  },
  {
    number: '03',
    icon: FlaskConical,
    overline: 'Experimentation',
    headline: 'CRO & Testing',
    blurb:
      'Adobe Target A/B and personalisation programmes with measurable impact — contributing over €2M in annual revenue uplift for a global telco.',
    stack: ['Adobe Target', 'A/B testing', 'Personalisation rules'],
  },
  {
    number: '04',
    icon: ShieldCheck,
    overline: 'Compliance',
    headline: 'Consent & Privacy',
    blurb:
      'OneTrust administration and GDPR-aligned consent across multiple markets, including ATT and SKAdNetwork compliance after the iOS privacy changes.',
    stack: ['OneTrust', 'Consent Mode v2', 'GDPR-aligned tagging'],
  },
  {
    number: '05',
    icon: BarChart3,
    overline: 'Reporting',
    headline: 'BI & Data Modelling',
    blurb:
      'GA4-powered pipelines feeding the data lake, with downstream Power BI and Looker reporting — governed, accurate and stakeholder-ready.',
    stack: ['Power BI', 'Looker', 'SQL', 'Dashboarding'],
  },
  {
    number: '06',
    icon: Code2,
    overline: 'Engineering',
    headline: 'Front-End Instrumentation',
    blurb:
      'First-class Software Engineering foundations. Custom JavaScript event tracking with structured QA and validation baked into every release.',
    stack: ['JavaScript', 'Custom event tracking', 'QA validation'],
  },
]

/* Logo sources: simple-icons pinned to @13 — the last major that still ships
   the Adobe glyph (removed upstream in v14; @latest only serves it from a
   stale CDN cache). Optimizely, Tealium and Amplitude were never part of
   simple-icons, so they come from the gilbarbara/logos set, also on jsDelivr.
   Snowplow and OneTrust exist on no public icon CDN at all — their official
   brand SVGs are vendored in public/assets/logos/. */
export const SIMPLE_ICONS = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons'
const GILBARBARA = 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos'
export const LOGOS = [
  { name: 'Google Analytics', src: `${SIMPLE_ICONS}/googleanalytics.svg` },
  { name: 'Google Tag Manager', src: `${SIMPLE_ICONS}/googletagmanager.svg` },
  { name: 'Google BigQuery', src: `${SIMPLE_ICONS}/googlebigquery.svg` },
  { name: 'Mixpanel', src: `${SIMPLE_ICONS}/mixpanel.svg` },
  { name: 'Optimizely', src: `${GILBARBARA}/optimizely-icon.svg` },
  { name: 'Tealium', src: `${GILBARBARA}/tealium.svg` },
  { name: 'Adobe Analytics', src: `${SIMPLE_ICONS}/adobe.svg` },
  { name: 'Snowplow', src: '/assets/logos/snowplow.svg' },
  { name: 'OneTrust', src: '/assets/logos/onetrust.svg' },
  { name: 'Amplitude', src: `${GILBARBARA}/amplitude-icon.svg` },
  { name: 'PostgreSQL', src: `${SIMPLE_ICONS}/postgresql.svg` },
  { name: 'Apache Kafka', src: `${SIMPLE_ICONS}/apachekafka.svg` },
  { name: 'Snowflake', src: `${SIMPLE_ICONS}/snowflake.svg` },
  { name: 'Looker', src: `${SIMPLE_ICONS}/looker.svg` },
  { name: 'Tableau', src: `${SIMPLE_ICONS}/tableau.svg` },
  { name: 'Twilio Segment', src: `${GILBARBARA}/segment-icon.svg` },
  { name: 'mParticle', src: `${GILBARBARA}/mparticle-icon.svg` },
  { name: 'Heap', src: `${GILBARBARA}/heap-icon.svg` },
  { name: 'Microsoft Power BI', src: `${GILBARBARA}/microsoft-power-bi.svg` },
  { name: 'VWO', src: `${GILBARBARA}/vwo.svg` },
]

export const WHO_HEADLINE =
  "I'm an Analytics Specialist with 8+ Years of Experience in Designing Scalable Data Collection Environments and High growth Digital Products."

export const WHO_STATS = [
  { value: '8+', label: 'Years of Experience', tag: '/01' },
  {
    value: '€2M+',
    label: 'Annual Revenue Uplift',
    tag: '/02',
    // finer-grained count (0.5 → 2.0 in 0.1 steps) so the ease-out
    // deceleration is visible instead of just snapping 0 → 1 → 2
    from: 0.5,
    decimals: 1,
  },
  { value: '16', label: 'Global Market Apps Managed', tag: '/03' },
]
