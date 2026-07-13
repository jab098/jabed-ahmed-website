import { BarChart3, Code2, FlaskConical, Server, ShieldCheck, Tag } from 'lucide-react'

/* Site-wide constants shared across sections */

export const NAV_LINKS = [
  { label: 'Home', href: '#home', number: '00' },
  { label: 'Profile', href: '#who', number: '01' },
  { label: 'Insights', href: '#insights', number: '02' },
  { label: 'Capabilities', href: '#service', number: '03' },
  { label: 'Contact', href: '#contact', number: '04' },
] as const
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

/* AI query-lane glyphs use the pinned simple-icons set. The capability tools
   are intentionally text-only so the page does not fetch a separate logo
   asset for every platform. */
export const SIMPLE_ICONS = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons'
export const TOOL_NAMES = [
  'Google Analytics',
  'Google Tag Manager',
  'Google BigQuery',
  'Mixpanel',
  'Optimizely',
  'Tealium',
  'Adobe Analytics',
  'Snowplow',
  'OneTrust',
  'Amplitude',
  'PostgreSQL',
  'Apache Kafka',
  'Snowflake',
  'Looker',
  'Tableau',
  'Twilio Segment',
  'mParticle',
  'Heap',
  'Microsoft Power BI',
  'VWO',
] as const

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
