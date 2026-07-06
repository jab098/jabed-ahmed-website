import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  Code2,
  Cpu,
  Download,
  FlaskConical,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Server,
  Settings,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react'

/* The site's brand glyph — a chunky extruded "J": a ghosted depth layer
   offset up-left behind the solid front face gives the 3D block look.
   Drawn in currentColor so each context sets the tone; the favicon mirrors
   this shape in brand green on the dark tile. */
const J_PATH =
  'M208 40 V152 A56 56 0 0 1 152 208 H116 A56 56 0 0 1 60 152 V120 H112 V152 A4 4 0 0 0 116 156 H152 A4 4 0 0 0 156 152 V40 Z'

function LogoMark({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d={J_PATH} transform="translate(-16 -16)" fill="currentColor" opacity="0.35" />
      <path d={J_PATH} fill="currentColor" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Who Am I', href: '#who' },
  { label: 'Insights', href: '#insights' },
  { label: 'Service', href: '#service' },
  { label: 'Contact', href: '#contact' },
]
const LINKEDIN_URL = 'https://linkedin.com/in/jabed98'
const CALENDLY_URL = 'https://calendly.com/jabed098/30min'
const EMAIL = 'consulting@jabed.co.uk'

const SERVICES = [
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

/* ——— Insights dashboard data (typed arrays, kept separate from layout) ——— */
type MetricTab = 'Visibility' | 'Sentiment' | 'Position'
const METRIC_TABS: MetricTab[] = ['Visibility', 'Sentiment', 'Position']
const CHART_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

interface DashSeries {
  name: string
  color: string
  values: number[]
}

const CHART_DATA: Record<MetricTab, DashSeries[]> = {
  Visibility: [
    { name: 'Google Analytics', color: '#f59e0b', values: [38, 44, 41, 52, 58, 65] },
    { name: 'Salesforce', color: '#22d3ee', values: [55, 51, 57, 54, 60, 62] },
    { name: 'Meta Ads', color: '#3b82f6', values: [22, 28, 33, 30, 41, 47] },
    { name: 'Zero', color: '#ec4899', values: [10, 14, 19, 24, 27, 32] },
    { name: 'Pipedrive', color: '#a78bfa', values: [26, 24, 20, 23, 19, 21] },
  ],
  Sentiment: [
    { name: 'Google Analytics', color: '#f59e0b', values: [71, 74, 70, 76, 79, 82] },
    { name: 'Salesforce', color: '#22d3ee', values: [64, 66, 61, 65, 68, 66] },
    { name: 'Meta Ads', color: '#3b82f6', values: [78, 80, 84, 83, 88, 90] },
    { name: 'Zero', color: '#ec4899', values: [70, 73, 77, 80, 84, 88] },
    { name: 'Pipedrive', color: '#a78bfa', values: [58, 55, 57, 53, 56, 54] },
  ],
  Position: [
    { name: 'Google Analytics', color: '#f59e0b', values: [2.4, 2.1, 2.2, 1.9, 1.8, 1.6] },
    { name: 'Salesforce', color: '#22d3ee', values: [1.8, 2.0, 1.9, 2.2, 2.1, 2.3] },
    { name: 'Meta Ads', color: '#3b82f6', values: [3.6, 3.2, 3.0, 3.1, 2.8, 2.6] },
    { name: 'Zero', color: '#ec4899', values: [4.8, 4.5, 4.1, 3.8, 3.4, 3.1] },
    { name: 'Pipedrive', color: '#a78bfa', values: [3.9, 4.1, 4.4, 4.3, 4.6, 4.5] },
  ],
}

const formatMetric: Record<MetricTab, (v: number) => string> = {
  Visibility: (v) => `${v}%`,
  Sentiment: (v) => `${v}`,
  Position: (v) => v.toFixed(1),
}

interface CompetitorRow {
  rank: number
  brand: string
  tone: string
  visibility: string
  visDelta: string
  sentiment: string
  sentDelta: string
  position: string
  posDelta: string
}

const COMPETITORS: CompetitorRow[] = [
  { rank: 1, brand: 'Google Analytics', tone: 'bg-amber-500', visibility: '65%', visDelta: '+2.1', sentiment: '82', sentDelta: '+3', position: '1.6', posDelta: '+0.3' },
  { rank: 2, brand: 'Salesforce', tone: 'bg-cyan-500', visibility: '62%', visDelta: '-0.4', sentiment: '66', sentDelta: '-2', position: '2.3', posDelta: '-0.2' },
  { rank: 3, brand: 'Meta Ads', tone: 'bg-blue-500', visibility: '47%', visDelta: '+1.2', sentiment: '90', sentDelta: '+4', position: '2.6', posDelta: '+0.2' },
  { rank: 4, brand: 'Zero', tone: 'bg-pink-500', visibility: '32%', visDelta: '+0.3', sentiment: '88', sentDelta: '+5', position: '3.1', posDelta: '+0.7' },
  { rank: 5, brand: 'Pipedrive', tone: 'bg-violet-500', visibility: '21%', visDelta: '-0.1', sentiment: '54', sentDelta: '-1', position: '4.5', posDelta: '-0.1' },
]

interface PromptRow {
  prompt: string
  models: string[]
  mentions: number
  trend: string
}

const PROMPTS: PromptRow[] = [
  { prompt: 'What are the best CRMs for startups?', models: ['ChatGPT', 'Gemini'], mentions: 142, trend: '+12%' },
  { prompt: 'Top web analytics platforms in 2026', models: ['ChatGPT', 'Claude'], mentions: 118, trend: '+8%' },
  { prompt: 'How do I set up server-side tagging?', models: ['Perplexity', 'ChatGPT'], mentions: 96, trend: '+21%' },
  { prompt: 'Google Analytics vs Meta Ads reporting', models: ['Claude', 'Gemini'], mentions: 73, trend: '-3%' },
  { prompt: 'Best consent management platforms', models: ['ChatGPT'], mentions: 51, trend: '+5%' },
]

interface ModelShare {
  name: string
  share: number
  color: string
  note: string
}

const MODEL_SHARES: ModelShare[] = [
  { name: 'ChatGPT', share: 46, color: '#34d399', note: 'Strongest source of brand mentions' },
  { name: 'Gemini', share: 24, color: '#3b82f6', note: 'Growing fastest month over month' },
  { name: 'Claude', share: 18, color: '#a78bfa', note: 'Highest sentiment per mention' },
  { name: 'Perplexity', share: 12, color: '#22d3ee', note: 'Most citation-heavy answers' },
]

interface SettingToggle {
  label: string
  desc: string
  on: boolean
}

const SETTINGS_TOGGLES: SettingToggle[] = [
  { label: 'Weekly email digest', desc: 'Summary of visibility changes every Monday', on: true },
  { label: 'Real-time alerts', desc: 'Notify when brand sentiment shifts sharply', on: true },
  { label: 'Anonymised sharing', desc: 'Share aggregate stats with your team', on: false },
  { label: 'API access', desc: 'Programmatic access to dashboard metrics', on: true },
]

interface DomainRow {
  domain: string
  category: string
  share: string
}

const DOMAINS: DomainRow[] = [
  { domain: 'reddit.com', category: 'UGC', share: '21%' },
  { domain: 'techradar.com', category: 'Editorial', share: '16%' },
  { domain: 'wikipedia.org', category: 'Reference', share: '12%' },
  { domain: 'g2.com', category: 'Review', share: '9%' },
  { domain: 'linkedin.com', category: 'Corporate', share: '7%' },
]

const CATEGORY_STYLES: Record<string, string> = {
  UGC: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20',
  Editorial: 'bg-pink-500/15 text-pink-300 border-pink-400/20',
  Reference: 'bg-blue-500/15 text-blue-300 border-blue-400/20',
  Review: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  Corporate: 'bg-violet-500/15 text-violet-300 border-violet-400/20',
}

interface DonutSlice {
  label: string
  value: number
  color: string
}

const DONUT_SLICES: DonutSlice[] = [
  { label: 'UGC', value: 38, color: '#22d3ee' },
  { label: 'Editorial', value: 26, color: '#ec4899' },
  { label: 'Corporate', value: 14, color: '#a78bfa' },
  { label: 'Reference', value: 12, color: '#3b82f6' },
  { label: 'Other', value: 10, color: '#34d399' },
]

const SIDEBAR_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Prompts', icon: MessageSquare },
  { label: 'Sources', icon: Globe },
  { label: 'Models', icon: Cpu },
  { label: 'Settings', icon: Settings },
]

const DATE_RANGES = ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Last quarter']
const MODEL_OPTIONS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity']
const EXPORT_OPTIONS = ['Export as CSV', 'Export as PDF', 'Copy share link']

/* Logo sources: simple-icons pinned to @13 — the last major that still ships
   the Adobe glyph (removed upstream in v14; @latest only serves it from a
   stale CDN cache). Optimizely, Tealium and Amplitude were never part of
   simple-icons, so they come from the gilbarbara/logos set, also on jsDelivr.
   Snowplow and OneTrust exist on no public icon CDN at all — their official
   brand SVGs are vendored in public/assets/logos/. */
const SIMPLE_ICONS = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons'
const GILBARBARA = 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@main/logos'
const LOGOS = [
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

function LogoMarquee() {
  return (
    <div className="logo-marquee mt-20 md:mt-28" aria-label="Platforms and tools I work with">
      <div className="logo-marquee-fade">
        <div className="logo-marquee-track">
          {/* Three identical copies back to back: translating the track
              -33.33% (exactly one copy) lands on an identical frame, so the
              loop resets without a visible seam. With 20 logos a single copy
              is ~2300px wide, so two trailing copies cover any viewport. */}
          {[0, 1, 2].map((copy) => (
            <div className="logo-marquee-group" key={copy} aria-hidden={copy > 0}>
              {LOGOS.map((logo) => (
                <span key={logo.name} className="pill-streak inline-block leading-none">
                  <img
                    src={logo.src}
                    alt={copy === 0 ? logo.name : ''}
                    title={logo.name}
                    loading="lazy"
                    draggable={false}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const deltaTone = (d: string) => (d.startsWith('+') ? 'text-emerald-400' : 'text-rose-400')

/* Section marker: a mono index + growing underline instead of the
   "(Section Name)" + static hairline pattern — that motif is the most
   copied one in current portfolio templates, so this swaps in a more
   distinctive, data-tool-flavoured mark built from pieces already in use
   elsewhere on the site (font-data, .marker-line). */
function SectionMarker({
  index,
  label,
  dark,
}: {
  index: number
  label: string
  dark?: boolean
}) {
  const numeralColor = dark ? '#00df8e' : '#00a86b'
  return (
    <p className={`rv flex items-center gap-3 text-[13px] font-medium ${dark ? 'text-white/50' : 'text-black/50'}`}>
      <span className="font-data text-[11px] tracking-[0.08em]" style={{ color: numeralColor }}>
        N&deg;{String(index).padStart(2, '0')}
      </span>
      <span className="marker-line w-10" />
      <span className="uppercase tracking-[0.22em] text-[11px]">{label}</span>
    </p>
  )
}

/* Multi-line chart with a cursor-tracked tooltip. The tooltip position is
   written imperatively inside requestAnimationFrame (never through React
   state), so tracking stays on the compositor at 60fps; React state only
   changes when the snapped month index changes. */
function DashChart({ tab }: { tab: MetricTab }) {
  const series = CHART_DATA[tab]
  const wrapRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const hoverRef = useRef<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // chart geometry — y-domain adapts to the active metric's value range
  const W = 640
  const H = 220
  const PX = 12
  const PY = 16
  const all = series.flatMap((s) => s.values)
  const spread = Math.max(...all) - Math.min(...all)
  const lo = Math.min(...all) - (spread * 0.15 || 1)
  const hi = Math.max(...all) + (spread * 0.15 || 1)
  const px = (i: number) => PX + (i * (W - 2 * PX)) / (CHART_MONTHS.length - 1)
  const py = (v: number) => H - PY - ((v - lo) / (hi - lo)) * (H - 2 * PY)

  const onMove = (e: React.PointerEvent) => {
    const wrap = wrapRef.current
    const tip = tipRef.current
    if (!wrap || !tip || rafRef.current) return
    const { clientX, clientY } = e
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      const rect = wrap.getBoundingClientRect()
      const cx = clientX - rect.left
      const cy = clientY - rect.top
      const inset = (PX / W) * rect.width
      const frac = Math.min(Math.max((cx - inset) / (rect.width - 2 * inset), 0), 1)
      const idx = Math.round(frac * (CHART_MONTHS.length - 1))
      if (hoverRef.current !== idx) {
        hoverRef.current = idx
        setHover(idx)
      }
      const left = Math.min(Math.max(cx + 18, 8), rect.width - tip.offsetWidth - 8)
      const top = Math.min(Math.max(cy - tip.offsetHeight / 2, 8), rect.height - tip.offsetHeight - 8)
      tip.style.transform = `translate3d(${left}px, ${top}px, 0)`
    })
  }
  const onLeave = () => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    hoverRef.current = null
    setHover(null)
  }

  // tooltip rows: best value first (for Position, lower is better)
  const ranked =
    hover === null
      ? []
      : [...series].sort((a, b) =>
          tab === 'Position' ? a.values[hover] - b.values[hover] : b.values[hover] - a.values[hover],
        )

  return (
    <div>
      <div ref={wrapRef} className="relative" onPointerMove={onMove} onPointerLeave={onLeave}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44 sm:h-56" preserveAspectRatio="none">
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={PX}
              x2={W - PX}
              y1={PY + f * (H - 2 * PY)}
              y2={PY + f * (H - 2 * PY)}
              stroke="#27272a"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {hover !== null && (
            <line
              x1={px(hover)}
              x2={px(hover)}
              y1={PY / 2}
              y2={H - PY / 2}
              stroke="#3f3f46"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {series.map((s) => (
            <polyline
              key={s.name}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              points={s.values.map((v, i) => `${px(i)},${py(v)}`).join(' ')}
            />
          ))}
          {hover !== null &&
            series.map((s) => (
              <circle
                key={s.name}
                cx={px(hover)}
                cy={py(s.values[hover])}
                r="3.5"
                fill={s.color}
                stroke="#0a0a0c"
                strokeWidth="1.5"
              />
            ))}
        </svg>

        {/* floating deep-black tooltip card */}
        <div
          ref={tipRef}
          className={`absolute top-0 left-0 z-20 w-44 pointer-events-none rounded-xl border border-[#27272a] bg-black/95 p-3 shadow-2xl transition-opacity duration-150 ${
            hover !== null ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-[11px] text-[#a1a1aa] mb-2">
            {hover !== null ? CHART_MONTHS[hover] : ''} · {tab}
          </p>
          <div className="space-y-1.5">
            {ranked.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-[#f4f4f5]">{s.name}</span>
                <span className="font-data ml-auto font-semibold text-[#f4f4f5]">
                  {hover !== null && formatMetric[tab](s.values[hover])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between px-1 mt-2 text-[11px] text-[#71717a]">
        {CHART_MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

/* Sentiment view: horizontal score bars per platform — visually distinct
   from the visibility line chart */
function SentimentViz() {
  const rows = [...CHART_DATA.Sentiment]
    .map((s) => ({ name: s.name, color: s.color, score: s.values[s.values.length - 1], delta: s.values[5] - s.values[0] }))
    .sort((a, b) => b.score - a.score)
  return (
    <div className="space-y-4 py-2 min-h-[184px] sm:min-h-[232px]">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-3">
          <span className="w-28 sm:w-36 shrink-0 truncate text-xs text-[#a1a1aa]">{r.name}</span>
          <div className="flex-1 h-3 rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full"
              style={{ width: `${r.score}%`, background: `linear-gradient(to right, ${r.color}55, ${r.color})` }}
            />
          </div>
          <span className="font-data w-8 text-right text-sm font-semibold text-[#f4f4f5]">{r.score}</span>
          <span className={`font-data w-8 text-right text-[11px] ${r.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {r.delta >= 0 ? `+${r.delta}` : r.delta}
          </span>
        </div>
      ))}
    </div>
  )
}

/* Position view: Jan→Jun slope chart — rank movement reads at a glance */
function PositionViz() {
  const W = 640
  const H = 220
  const x1 = 150
  const x2 = 460
  const yFor = (v: number) => 22 + ((v - 1) / 4) * (H - 50)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44 sm:h-56">
      <line x1={x1} x2={x1} y1={14} y2={H - 26} stroke="#27272a" />
      <line x1={x2} x2={x2} y1={14} y2={H - 26} stroke="#27272a" />
      <text x={x1} y={H - 8} textAnchor="middle" fill="#71717a" fontSize="11">
        Jan
      </text>
      <text x={x2} y={H - 8} textAnchor="middle" fill="#71717a" fontSize="11">
        Jun
      </text>
      {CHART_DATA.Position.map((s) => {
        const a = s.values[0]
        const b = s.values[s.values.length - 1]
        return (
          <g key={s.name}>
            <line x1={x1} y1={yFor(a)} x2={x2} y2={yFor(b)} stroke={s.color} strokeWidth="2" opacity="0.8" />
            <circle cx={x1} cy={yFor(a)} r="3" fill={s.color} />
            <circle cx={x2} cy={yFor(b)} r="3" fill={s.color} />
            <text x={x1 - 12} y={yFor(a) + 4} textAnchor="end" fill="#a1a1aa" fontSize="11" fontFamily="'JetBrains Mono', monospace">
              {a.toFixed(1)}
            </text>
            <text x={x2 + 12} y={yFor(b) + 4} fill="#f4f4f5" fontSize="11">
              <tspan fontFamily="'JetBrains Mono', monospace">{b.toFixed(1)}</tspan> · {s.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function PromptsView() {
  return (
    <div>
      <p className="text-[#f4f4f5] text-sm font-semibold mb-4">Tracked prompts</p>
      <div className="divide-y divide-[#1f1f23]">
        {PROMPTS.map((p) => (
          <div key={p.prompt} className="flex items-center gap-3 py-3 hover:bg-white/[0.03] transition-colors">
            <MessageSquare size={13} className="text-[#71717a] shrink-0" />
            <span className="text-[#f4f4f5] text-sm truncate">{p.prompt}</span>
            <span className="hidden md:flex gap-1.5 ml-1 shrink-0">
              {p.models.map((m) => (
                <span
                  key={m}
                  className="pill-streak border border-[#27272a] rounded-full px-2 py-0.5 text-[10px] text-[#a1a1aa]"
                >
                  <span className="relative z-10">{m}</span>
                </span>
              ))}
            </span>
            <span className="font-data ml-auto shrink-0 text-sm text-[#f4f4f5]">
              {p.mentions}
              <span className="font-sans text-[11px] text-[#71717a] ml-1">mentions</span>
            </span>
            <span className={`font-data w-12 shrink-0 text-right text-[11px] ${deltaTone(p.trend)}`}>{p.trend}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SourcesView() {
  return (
    <div>
      <p className="text-[#f4f4f5] text-sm font-semibold mb-4">Top citation sources</p>
      <div className="divide-y divide-[#1f1f23]">
        {DOMAINS.map((d) => (
          <div key={d.domain} className="flex items-center gap-3 py-3 hover:bg-white/[0.03] transition-colors">
            <Globe size={13} className="text-[#71717a] shrink-0" />
            <span className="text-[#f4f4f5] text-xs w-28 sm:w-36 truncate shrink-0">{d.domain}</span>
            <span className={`border rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${CATEGORY_STYLES[d.category]}`}>
              {d.category}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
              <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${parseInt(d.share) * 4}%` }} />
            </div>
            <span className="font-data w-10 text-right text-xs text-[#a1a1aa] shrink-0">{d.share}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelsView() {
  return (
    <div>
      <p className="text-[#f4f4f5] text-sm font-semibold mb-4">Mentions by model</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {MODEL_SHARES.map((m) => (
          <div key={m.name} className="border border-[#27272a] rounded-xl bg-white/[0.02] p-5 hover:border-[#3f3f46] transition-colors">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-[#71717a]" />
              <span className="text-[#f4f4f5] text-sm font-medium">{m.name}</span>
              <span className="font-data ml-auto text-[#f4f4f5] text-xl font-semibold">{m.share}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.05] mt-4">
              <div className="h-full rounded-full" style={{ width: `${m.share}%`, background: m.color }} />
            </div>
            <p className="text-[#71717a] text-xs mt-3">{m.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsView() {
  const [toggles, setToggles] = useState(() => SETTINGS_TOGGLES.map((t) => t.on))
  return (
    <div className="max-w-xl">
      <p className="text-[#f4f4f5] text-sm font-semibold mb-4">Workspace settings</p>
      <div className="flex items-center gap-3 border border-[#27272a] rounded-xl p-4 mb-5">
        <span className="p-2.5 rounded-lg bg-white/[0.06]">
          <LogoMark size={15} className="text-[#00df8e]" />
        </span>
        <span>
          <span className="block text-[#f4f4f5] text-sm font-medium">Jabed's Workspace</span>
          <span className="block text-[#71717a] text-xs mt-0.5">jabed.co.uk · 3 seats</span>
        </span>
        <span className="ml-auto border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-[10px] font-medium rounded-full px-2.5 py-0.5">
          Pro
        </span>
      </div>
      <div className="divide-y divide-[#1f1f23]">
        {SETTINGS_TOGGLES.map((t, i) => (
          <div key={t.label} className="flex items-center gap-4 py-3.5">
            <span className="min-w-0">
              <span className="block text-[#f4f4f5] text-sm">{t.label}</span>
              <span className="block text-[#71717a] text-xs mt-0.5">{t.desc}</span>
            </span>
            <button
              role="switch"
              aria-checked={toggles[i]}
              aria-label={t.label}
              onClick={() => setToggles((ts) => ts.map((v, j) => (j === i ? !v : v)))}
              className={`cursor-pointer ml-auto shrink-0 w-9 h-5 rounded-full relative transition-colors duration-200 ${
                toggles[i] ? 'bg-emerald-500' : 'bg-[#27272a]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-[left] duration-200 ${
                  toggles[i] ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ——— AI search strategy section (bottom of Insights) ——— */
const AI_ICON = (slug: string) => `https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${slug}.svg`

interface AiQuery {
  icon?: string
  text: string
}

const AI_QUERY_ROWS: AiQuery[][] = [
  [
    { icon: AI_ICON('meta'), text: 'How do I migrate GTM containers to server-side tagging?' },
    { icon: AI_ICON('openai'), text: 'Can AI assistants read my dataLayer events?' },
    { icon: AI_ICON('githubcopilot'), text: 'What should a dataLayer spec include for GA4?' },
    { icon: AI_ICON('googlegemini'), text: 'How do I QA custom event tracking before a release?' },
    { icon: AI_ICON('claude'), text: 'Do AI crawlers execute JavaScript tags?' },
    { icon: AI_ICON('x'), text: 'Which ecommerce events are worth tracking in 2026?' },
  ],
  [
    { icon: AI_ICON('openai'), text: 'How do I A/B test responses from an AI chatbot?' },
    { icon: AI_ICON('claude'), text: 'Does Consent Mode v2 change conversion modelling?' },
    { icon: AI_ICON('huggingface'), text: 'Can an LLM analyse my experiment results reliably?' },
    { icon: AI_ICON('perplexity'), text: 'Is personalisation legal under GDPR without consent?' },
    { icon: AI_ICON('googlegemini'), text: 'What sample size makes an A/B test trustworthy?' },
    { icon: AI_ICON('githubcopilot'), text: 'How does ATT affect SKAdNetwork attribution?' },
  ],
  [
    { icon: AI_ICON('x'), text: 'Is server-side tracking more accurate than browser tags?' },
    { icon: AI_ICON('openai'), text: 'How do I validate Snowplow payloads before the warehouse?' },
    { icon: AI_ICON('perplexity'), text: 'Which KPIs belong on an executive analytics dashboard?' },
    { icon: AI_ICON('meta'), text: 'Can BigQuery power real-time personalisation?' },
    { icon: AI_ICON('claude'), text: 'How do I attribute revenue to AI search referrals?' },
    { icon: AI_ICON('huggingface'), text: 'Does clean event data improve AI model training?' },
  ],
]

const HOW_ITEMS = [
  {
    title: 'Semantic Data Architecture',
    desc: 'I implement rigorous JSON-LD structured data and schema markup, ensuring that LLMs can accurately parse, index, and surface your business information with absolute confidence (e.g., using Product and Organization schema to enhance AI-generated snippets).',
  },
  {
    title: 'Prompt-Level Attribution',
    desc: 'My infrastructure tracks the specific user-initiated prompts that lead to brand citations within AI summaries, providing visibility into traffic sources that traditional analytics ignore (e.g., mapping brand mentions to specific query inputs in GA4).',
  },
  {
    title: 'Validated Data Pipelines',
    desc: "By leveraging strict payload validation—such as Snowplow's Iglu registries—I ensure that the data feeding into your models and analytics tools is consistently accurate, clean, and reliable (e.g., rejecting malformed event payloads before they reach the warehouse).",
  },
  {
    title: 'AI Sentiment Quantification',
    desc: 'I configure custom dashboards that ingest AI search results, allowing brands to measure their position, visibility, and sentiment within AI-generated responses (e.g., tracking the frequency of positive vs. neutral mentions in LLM summaries).',
  },
  {
    title: 'Contextual Intelligence',
    desc: "Through advanced behavioural pipelines, I inject real-time user intent data back into your site's AI agents, delivering hyper-personalized, data-informed responses that drive engagement (e.g., tailoring AI chatbot responses based on a user's previous purchase history).",
  },
]

/* Height collapse/expand with symmetric motion: content stays mounted, so
   closing glides through the same animation as opening instead of snapping */
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    setHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className="overflow-hidden transition-[height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
      aria-hidden={!open}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  )
}

function QueryRow({ items, reverse }: { items: AiQuery[]; reverse?: boolean }) {
  return (
    // py keeps pill borders and shadows inside the clip box
    <div className="overflow-hidden py-1">
      <div className={`flex w-max gap-3 ${reverse ? 'q-marquee-r' : 'q-marquee'}`}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3 pr-3" aria-hidden={copy === 1}>
            {items.map((q) => (
              <span
                key={q.text}
                className="flex items-center gap-2 whitespace-nowrap bg-white border border-black/10 rounded-full px-4 py-2 text-[13px] text-black/70 shadow-sm"
              >
                {q.icon && <img src={q.icon} alt="" className="w-3.5 h-3.5 opacity-60" loading="lazy" />}
                {q.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function AiSearch() {
  const [open, setOpen] = useState(false)
  const { ref, inView } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`mt-28 md:mt-36 ${inView ? 'rv-in' : ''}`}>
      <h3 className="rv text-center text-[24px] md:text-[34px] font-semibold tracking-tight max-w-[860px] mx-auto leading-[1.25]">
        The AI Search Strategy: I optimize your digital presence for the new search engine era.
      </h3>

      {/* Query marquees: top drifts left, middle right, bottom left */}
      <div className="rv q-fade mt-12 space-y-4" style={{ animationDelay: '0.15s' }}>
        <QueryRow items={AI_QUERY_ROWS[0]} />
        <QueryRow items={AI_QUERY_ROWS[1]} reverse />
        <QueryRow items={AI_QUERY_ROWS[2]} />
      </div>

      {/* Expandable methodology */}
      <div className="rv flex flex-col items-center mt-12" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="cursor-pointer inline-flex items-center gap-2 border border-black/15 bg-white rounded-full px-6 py-2.5 text-[14px] font-medium hover:border-black/30 transition-colors"
        >
          How?
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <div className="w-full max-w-[900px]">
          <Collapse open={open}>
            {/* padding on all sides keeps the panel's shadow and rounded
                corners clear of the clip box */}
            <div className="pt-8 pb-6 px-3">
              <div className="bg-white border border-black/10 rounded-[24px] p-7 md:p-9 text-left space-y-6 shadow-lg">
                {HOW_ITEMS.map((item) => (
                  <div key={item.title}>
                    <p className="font-semibold text-[16px]">{item.title}</p>
                    <p className="text-[14px] text-black/70 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  )
}

/* Animates the container to its content's height on page/tab switches. A
   ResizeObserver tracks the inner content; the outer div transitions the
   measured pixel height, so view changes glide instead of snapping. */
function AnimatedHeight({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    setHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className="overflow-hidden transition-[height] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ height: height ?? 'auto' }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  )
}

function Insights() {
  const [visible, setVisible] = useState(false)
  const [chartIn, setChartIn] = useState(false)
  const [booted, setBooted] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState('Overview')
  const [metric, setMetric] = useState<MetricTab>('Visibility')
  const [slice, setSlice] = useState(0)
  const [openMenu, setOpenMenu] = useState<'date' | 'models' | 'export' | null>(null)
  const [dateRange, setDateRange] = useState('Last 7 days')
  const [activeModels, setActiveModels] = useState<string[]>(MODEL_OPTIONS)
  const sectionRef = useRef<HTMLElement>(null)

  const toggleMenu = (menu: 'date' | 'models' | 'export') =>
    setOpenMenu((current) => (current === menu ? null : menu))
  const toggleModel = (model: string) =>
    setActiveModels((current) =>
      current.includes(model) ? current.filter((m) => m !== model) : [...current, model],
    )

  // Title/marker reveal as soon as the section arrives…
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // …but the dashboard holds its entrance until half the chart card is
  // actually on screen, so quick scrollers see the animation, not its wake
  useEffect(() => {
    const el = chartRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setChartIn(true)
          io.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // While the entrance runs, panel content waits its turn (--wt-base); once
  // booted, tab switches replay the same animations with no base delay
  useEffect(() => {
    if (!chartIn) return
    const t = setTimeout(() => setBooted(true), 2400)
    return () => clearTimeout(t)
  }, [chartIn])

  const delay = (s: number) => ({ animationDelay: `calc(var(--wt-base) + ${s}s)` })

  const donutCircumference = 2 * Math.PI * 48

  return (
    <section
      ref={sectionRef}
      id="insights"
      className={`w-full px-6 lg:px-12 pt-32 pb-16 bg-[#f4f4f5] text-black ${visible ? 'rv-in' : ''} ${chartIn ? 'wt-in' : ''}`}
      style={{ '--wt-base': booted ? '0s' : '0.9s' } as React.CSSProperties}
    >
      {/* ~25/75 split: title column left, vertical separator, chart right —
          the separator lines up with the Who Am I section's for a continuous
          vertical rhythm while scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Title column (~30%) */}
        <div className="lg:col-span-3">
          <SectionMarker index={2} label="Insights" />
          <h2 className="rv text-black leading-[0.98] mt-8" style={{ animationDelay: '0.1s' }}>
            <span
              className="block font-playfair italic font-normal text-[40px] md:text-[48px]"
              style={{ letterSpacing: '-0.05em' }}
            >
              Real Growth
            </span>
            <span
              className="block font-normal text-[40px] md:text-[48px]"
              style={{ letterSpacing: '-0.08em' }}
            >
              backed by data.
            </span>
          </h2>
          <p
            className="rv text-[16px] text-black/60 mt-6 leading-relaxed"
            style={{ animationDelay: '0.2s' }}
          >
            Built the architecture and experimentation that has delivered millions in measurable
            revenue uplift for global enterprises.
          </p>
        </div>

        {/* Chart column (~75%) behind the vertical separator, over a soft
            animated dotted texture */}
        <div className="lg:col-span-9 relative lg:border-l lg:border-black/10 lg:pl-10">
          <div className="dots-light absolute -inset-y-8 -right-6 left-0 lg:left-6" aria-hidden="true" />
          <div
            ref={chartRef}
            className="rv relative w-full bg-[#111] rounded-[40px] overflow-hidden shadow-2xl p-4 md:p-8 border-t border-x border-b-0 border-[#00f09633]"
            style={{ animationDelay: '0.25s' }}
          >
        {/* Mobile: static, presentation-style dashboard (Attio-like) — the
            interactive shell is desktop-only */}
        <div className="md:hidden text-left wt-anim" aria-hidden="true">
          <div className="flex items-center gap-2 px-2 pb-4">
            <LogoMark size={12} className="text-[#00df8e]" />
            <span className="text-[#f4f4f5] text-sm font-medium">Jabed's Dashboard</span>
            <span className="text-[#52525b]">/</span>
            <span className="text-[#a1a1aa] text-sm">Overview</span>
          </div>
          <div className="rounded-xl border border-[#27272a] border-t-white/10 bg-[#0e0e11] p-4 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)]">
            <p className="text-[#f4f4f5] text-sm font-semibold">Visibility</p>
            <p className="text-[#71717a] text-xs mt-1 mb-3">
              Share of AI answers mentioning each platform
            </p>
            <DashChart tab="Visibility" />
          </div>
          <div className="rounded-xl border border-[#27272a] bg-[#0e0e11] p-4 mt-4">
            <p className="text-[#f4f4f5] text-sm font-semibold mb-2">Platforms</p>
            {COMPETITORS.slice(0, 3).map((c) => (
              <div
                key={c.brand}
                className="flex items-center gap-2.5 py-2.5 border-t border-[#1f1f23] first:border-t-0"
              >
                <span
                  className={`w-5 h-5 rounded ${c.tone} text-[9px] font-bold text-white flex items-center justify-center shrink-0`}
                >
                  {c.brand[0]}
                </span>
                <span className="text-[#f4f4f5] text-xs">{c.brand}</span>
                <span className="font-data ml-auto text-[#f4f4f5] text-xs">{c.visibility}</span>
                <span className={`font-data text-[10px] ${deltaTone(c.visDelta)}`}>{c.visDelta}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard shell */}
        <div
          className="wt-anim wt-pop rounded-2xl border border-emerald-400/15 bg-[#0a0a0c]/90 backdrop-blur-sm shadow-[0_0_45px_rgba(16,185,129,0.13),0_0_130px_rgba(16,185,129,0.07),0_30px_80px_-20px_rgba(0,0,0,0.85)] overflow-hidden hidden md:flex text-left"
          style={{ animationDelay: '0.4s' }}
        >
          {/* Left sidebar */}
          <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-[#27272a] bg-[#121214]/80 p-4">
            <div className="flex items-center gap-2.5 px-2 mb-7">
              <LogoMark size={15} className="text-[#00df8e]" />
              <span className="text-[#f4f4f5] text-sm font-semibold">Jabed Ahmed</span>
            </div>
            <nav className="flex flex-col gap-1">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setPage(item.label)}
                  className={`cursor-pointer flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    page === item.label
                      ? 'bg-white/[0.07] text-[#f4f4f5]'
                      : 'text-[#a1a1aa] hover:bg-white/[0.04] hover:text-[#f4f4f5]'
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* Top header bar */}
            <div className="flex items-center gap-2.5 flex-wrap border-b border-[#27272a] px-4 sm:px-6 py-3.5">
              <span className="flex items-center gap-2 text-sm min-w-0">
                <LogoMark size={12} className="text-[#00df8e] shrink-0" />
                <span className="text-[#f4f4f5] font-medium truncate">Jabed's Dashboard</span>
                <span className="text-[#52525b]">/</span>
                <span className="text-[#a1a1aa]">{page}</span>
              </span>
              <span className="ml-auto flex items-center gap-2">
                {/* Click-away layer for any open dropdown */}
                {openMenu && (
                  <span className="fixed inset-0 z-40 block" onClick={() => setOpenMenu(null)} />
                )}

                {/* Date range picker */}
                <span className="relative hidden sm:block">
                  <button
                    onClick={() => toggleMenu('date')}
                    className="cursor-pointer flex items-center gap-1.5 border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-colors"
                  >
                    <Calendar size={12} />
                    {dateRange}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${openMenu === 'date' ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMenu === 'date' && (
                    <span className="menu-pop absolute right-0 top-full mt-1.5 z-50 block w-40 rounded-lg border border-[#27272a] bg-[#1c1c1e] p-1.5 shadow-2xl">
                      {DATE_RANGES.map((range) => (
                        <button
                          key={range}
                          onClick={() => {
                            setDateRange(range)
                            setOpenMenu(null)
                          }}
                          className={`cursor-pointer flex items-center w-full text-left rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                            range === dateRange
                              ? 'text-[#f4f4f5] bg-white/[0.07]'
                              : 'text-[#a1a1aa] hover:bg-white/[0.05] hover:text-[#f4f4f5]'
                          }`}
                        >
                          {range}
                          {range === dateRange && <Check size={12} className="ml-auto text-emerald-400" />}
                        </button>
                      ))}
                    </span>
                  )}
                </span>

                {/* Model filter */}
                <span className="relative hidden md:block">
                  <button
                    onClick={() => toggleMenu('models')}
                    className="cursor-pointer flex items-center gap-1.5 border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-colors"
                  >
                    {activeModels.length === MODEL_OPTIONS.length
                      ? 'All models'
                      : `${activeModels.length} model${activeModels.length === 1 ? '' : 's'}`}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${openMenu === 'models' ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMenu === 'models' && (
                    <span className="menu-pop absolute right-0 top-full mt-1.5 z-50 block w-40 rounded-lg border border-[#27272a] bg-[#1c1c1e] p-1.5 shadow-2xl">
                      {MODEL_OPTIONS.map((model) => (
                        <button
                          key={model}
                          onClick={() => toggleModel(model)}
                          className="cursor-pointer flex items-center w-full text-left rounded-md px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:bg-white/[0.05] hover:text-[#f4f4f5] transition-colors"
                        >
                          {model}
                          {activeModels.includes(model) && (
                            <Check size={12} className="ml-auto text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </span>
                  )}
                </span>

                {/* Export menu */}
                <span className="relative">
                  <button
                    onClick={() => toggleMenu('export')}
                    className="cursor-pointer flex items-center gap-1.5 border border-[#27272a] rounded-lg px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-colors"
                  >
                    <Download size={12} />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  {openMenu === 'export' && (
                    <span className="menu-pop absolute right-0 top-full mt-1.5 z-50 block w-40 rounded-lg border border-[#27272a] bg-[#1c1c1e] p-1.5 shadow-2xl">
                      {EXPORT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => setOpenMenu(null)}
                          className="cursor-pointer flex items-center w-full text-left rounded-md px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:bg-white/[0.05] hover:text-[#f4f4f5] transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </span>
                  )}
                </span>

                <button
                  className="cursor-pointer p-1.5 rounded-lg text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.05] transition-colors"
                  aria-label="Help"
                >
                  <HelpCircle size={14} />
                </button>
              </span>
            </div>

            <AnimatedHeight>
            {page === 'Overview' ? (
              <>
            {/* Metric sub-tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 pt-4">
              {METRIC_TABS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm transition-colors ${
                    metric === m
                      ? 'bg-white/[0.08] text-[#f4f4f5]'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Metric visualisation — each metric gets its own chart type,
                re-keyed so switches crossfade */}
            <div key={`chart-${chartIn}-${metric}`} className="wt-swap px-4 sm:px-6 pt-4 pb-6" style={delay(0.15)}>
              {/* Elevated chart card: layered drop shadow + hairline top light
                  so the graph reads as a mounted panel, not raw lines */}
              <div className="rounded-xl border border-[#27272a] border-t-white/10 bg-[#0e0e11] p-4 sm:p-5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),0_8px_18px_rgba(0,0,0,0.55)]">
                {metric === 'Visibility' && <DashChart tab="Visibility" />}
                {metric === 'Sentiment' && <SentimentViz />}
                {metric === 'Position' && <PositionViz />}
              </div>
            </div>

            {/* Lower analytics grid */}
            <div
              key={`lower-${chartIn}`}
              className="wt-swap grid lg:grid-cols-3 border-t border-[#27272a]"
              style={delay(0.3)}
            >
              {/* Platforms table */}
              <div className="lg:col-span-2 bg-[#121214]/60 p-4 sm:p-6 lg:border-r border-[#27272a] overflow-x-auto">
                <p className="text-[#f4f4f5] text-sm font-semibold mb-4">Platforms</p>
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-[#71717a] text-left">
                      <th className="pb-3 font-medium w-8">#</th>
                      <th className="pb-3 font-medium">Brand</th>
                      <th className="pb-3 font-medium">Visibility</th>
                      <th className="pb-3 font-medium">Sentiment</th>
                      <th className="pb-3 font-medium text-right">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f23]">
                    {COMPETITORS.map((c) => (
                      <tr key={c.brand} className="hover:bg-white/[0.03] transition-colors">
                        <td className="font-data py-3 text-[#71717a]">{c.rank}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`font-data w-6 h-6 rounded-md ${c.tone} text-[10px] font-bold text-white flex items-center justify-center shrink-0`}
                            >
                              {c.brand[0]}
                            </span>
                            <span className="text-[#f4f4f5] font-medium">{c.brand}</span>
                          </span>
                        </td>
                        <td className="font-data py-3 text-[#f4f4f5]">
                          {c.visibility}
                          <span className={`text-[11px] ml-2 ${deltaTone(c.visDelta)}`}>
                            {c.visDelta}
                          </span>
                        </td>
                        <td className="font-data py-3 text-[#f4f4f5]">
                          {c.sentiment}
                          <span className={`text-[11px] ml-2 ${deltaTone(c.sentDelta)}`}>
                            {c.sentDelta}
                          </span>
                        </td>
                        <td className="font-data py-3 text-[#f4f4f5] text-right">
                          {c.position}
                          <span className={`text-[11px] ml-2 ${deltaTone(c.posDelta)}`}>
                            {c.posDelta}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Domains & categories + donut widget */}
              <div className="bg-[#121214]/60 p-4 sm:p-6 border-t lg:border-t-0 border-[#27272a] flex flex-col gap-6">
                <div>
                  <p className="text-[#f4f4f5] text-sm font-semibold mb-4">Domains & categories</p>
                  <div className="divide-y divide-[#1f1f23]">
                    {DOMAINS.map((d) => (
                      <div
                        key={d.domain}
                        className="flex items-center gap-2 py-2.5 hover:bg-white/[0.03] transition-colors"
                      >
                        <Globe size={13} className="text-[#71717a] shrink-0" />
                        <span className="text-[#f4f4f5] text-xs truncate">{d.domain}</span>
                        <span
                          className={`border rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${CATEGORY_STYLES[d.category]}`}
                        >
                          {d.category}
                        </span>
                        <span className="font-data ml-auto text-[#a1a1aa] text-xs">{d.share}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[#f4f4f5] text-sm font-semibold mb-4">Source mix</p>
                  <div className="flex items-center gap-5">
                    <div className="relative w-28 h-28 shrink-0">
                      <svg viewBox="0 0 120 120" className="relative w-full h-full -rotate-90">
                        {DONUT_SLICES.map((s, i) => {
                          const offset = DONUT_SLICES.slice(0, i).reduce(
                            (sum, x) => sum + x.value,
                            0,
                          )
                          return (
                            <circle
                              key={s.label}
                              cx="60"
                              cy="60"
                              r="48"
                              fill="none"
                              stroke={s.color}
                              strokeWidth="14"
                              strokeDasharray={`${(s.value / 100) * donutCircumference} ${donutCircumference}`}
                              strokeDashoffset={-(offset / 100) * donutCircumference}
                              className="transition-opacity duration-200"
                              opacity={slice === i ? 1 : 0.35}
                            />
                          )
                        })}
                      </svg>
                      <span className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-data text-[#f4f4f5] text-lg font-semibold leading-none">
                          {DONUT_SLICES[slice].value}%
                        </span>
                        <span className="text-[#71717a] text-[10px] mt-1">
                          {DONUT_SLICES[slice].label}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0">
                      {DONUT_SLICES.map((s, i) => (
                        <button
                          key={s.label}
                          onMouseEnter={() => setSlice(i)}
                          onFocus={() => setSlice(i)}
                          className={`cursor-pointer flex items-center gap-2 text-xs transition-colors ${
                            slice === i ? 'text-[#f4f4f5]' : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: s.color }}
                          />
                          {s.label}
                          <span className="font-data ml-auto text-[#71717a]">{s.value}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </>
            ) : (
              /* Sidebar pages — each gets a purpose-built mock view */
              <div key={`page-${page}-${chartIn}`} className="wt-swap p-4 sm:p-6" style={delay(0.2)}>
                {page === 'Prompts' && <PromptsView />}
                {page === 'Sources' && <SourcesView />}
                {page === 'Models' && <ModelsView />}
                {page === 'Settings' && <SettingsView />}
              </div>
            )}
            </AnimatedHeight>
          </div>
        </div>
        </div>
        </div>
      </div>

      {/* AI search strategy — query marquees + expandable "How?" panel */}
      <AiSearch />
    </section>
  )
}

/* One-shot IntersectionObserver reveal: adds .rv-in to the section so its
   .rv children play the fadeUpSmooth entrance with their inline delays */
function useReveal<T extends HTMLElement>(threshold = 0.12, rootMargin = '0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, inView }
}

/* Fixed site navigation. Stays with the user while scrolling; after about
   half a viewport of downward travel it animates away, and the slightest
   upward scroll animates it back. Flips to a dark-on-light scheme while
   floating over the light middle sections. */
function SiteNav() {
  const [hidden, setHidden] = useState(false)
  const [onLight, setOnLight] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      if (y <= vh * 0.5) setHidden(false)
      else if (y > lastY + 2) setHidden(true)
      else if (y < lastY - 2) setHidden(false)
      lastY = y

      // Dark scheme over the hero and contact cards, light scheme between
      const hero = document.getElementById('home')
      const contact = document.getElementById('contact')
      const overHero = hero ? hero.getBoundingClientRect().bottom > 120 : true
      const overContact = contact ? contact.getBoundingClientRect().top < 90 : false
      setOnLight(!overHero && !overContact)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[100] flex justify-between items-center px-10 md:px-12 lg:px-20 pt-10 md:pt-12 lg:pt-14 pb-4 transition-[opacity,transform] duration-700 ${
        hidden ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      <a href="#home" className="flex items-center gap-2.5">
        <LogoMark size={20} className="text-[#00df8e]" />
        <span
          className={`font-playfair italic text-xl tracking-wide transition-colors duration-300 ${
            onLight ? 'text-black' : 'text-white'
          }`}
        >
          Jabed Ahmed
        </span>
      </a>
      <div
        className={`hidden md:flex absolute left-1/2 -translate-x-1/2 backdrop-blur-md border rounded-full px-6 py-2 gap-6 text-[13px] font-medium transition-colors duration-300 ${
          onLight ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <MagneticLink
            key={link.label}
            href={link.href}
            className={`inline-block transition-colors ${
              onLight ? 'text-black/65 hover:text-black' : 'text-white/75 hover:text-white'
            }`}
          >
            {link.label}
          </MagneticLink>
        ))}
      </div>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className={`md:hidden p-2 transition-colors ${onLight ? 'text-black' : 'text-white'}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu panel — self-coloured, so it works over any section */}
      {menuOpen && (
        <div className="menu-pop md:hidden absolute top-full right-6 left-6 mt-1 rounded-2xl bg-[#0A0D10]/95 backdrop-blur-md border border-white/10 p-3 flex flex-col shadow-2xl">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-[15px] text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

/* Magnetic CTAs: the button stays exactly in place and keeps its shape — it
   only grows as the cursor approaches, from 1 at the edge of the radius up
   to a capped maximum right over the button. The slow lerp gives it the
   unhurried feel of the landing-page background, and the same lerp eases it
   back down when the cursor retreats. The rAF loop self-stops once settled. */
function useMagnetic() {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Touch devices have no hovering cursor; honour reduced-motion
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return

    let raf = 0
    let scale = 1
    let target = 1
    const MAX_GROWTH = 0.07
    const EASE = 0.06

    const tick = () => {
      scale += (target - scale) * EASE
      const settled = Math.abs(target - scale) < 0.0005
      if (settled) scale = target
      el.style.transform = `scale(${scale})`
      raf = settled ? 0 : requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right)
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom)
      const radius = window.innerWidth < 1024 ? 52 : 72
      const dist = Math.hypot(dx, dy)
      // growth is 0 at the radius edge and caps at MAX_GROWTH on the button
      target = dist < radius ? 1 + (1 - dist / radius) * MAX_GROWTH : 1
      if (!raf) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      el.style.transform = ''
    }
  }, [])

  return { ref }
}

/* Thin wrapper so any anchor can opt into the magnetic pull without each
   call site re-wiring useMagnetic by hand */
function MagneticLink({
  className,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) {
  const { ref } = useMagnetic()
  return (
    <a ref={ref} className={className} {...rest}>
      {children}
    </a>
  )
}

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    // Touch devices have no persistent cursor to follow
    if (window.matchMedia('(pointer: coarse)').matches) return

    const half = glow.offsetWidth / 2
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let x = targetX
    let y = targetY
    let raf = 0

    // Lerp toward the cursor each frame — the gap between the glow and the
    // pointer closes exponentially, which reads as soft elastic trailing
    const tick = () => {
      x += (targetX - x) * 0.1
      y += (targetY - y) * 0.1
      glow.style.transform = `translate3d(${x - half}px, ${y - half}px, 0)`
      if (Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      glow.style.opacity = '1'
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => {
      glow.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}

/* Decorative diagonal graph for the hero dashboard mock. The path is built
   from identical units, each 400 SVG units wide with a net 80-unit climb —
   sharp angular rises with small pullbacks, no flat steps. Because the
   pattern is periodic in both axes, the CSS crawl of (-400, +80) per cycle
   loops seamlessly: an endlessly rising chart. */
const GRAPH_UNITS = 4
const HERO_GRAPH_PATH = (() => {
  let d = 'M0,260'
  let x = 0
  let y = 260
  for (let i = 0; i < GRAPH_UNITS; i++) {
    d += ` L${x + 90},${y - 58} L${x + 150},${y - 34} L${x + 240},${y - 96} L${x + 290},${y - 72} L${x + 400},${y - 80}`
    x += 400
    y -= 80
  }
  return d
})()
const HERO_NODES: [number, number][] = Array.from({ length: GRAPH_UNITS }, (_, i) => [
  i * 400 + 240,
  260 - i * 80 - 96,
])

function HeroGraph() {
  return (
    <svg viewBox="0 0 800 240" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="hgFill" x1="0" y1="-80" x2="0" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <filter id="hgGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g className="hero-graph-crawl">
        <path d={`${HERO_GRAPH_PATH} L1600,600 L0,600 Z`} fill="url(#hgFill)" />
        <path
          d={HERO_GRAPH_PATH}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          opacity="0.35"
          filter="url(#hgGlow)"
        />
        <path d={HERO_GRAPH_PATH} fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
        {HERO_NODES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.2"
            fill="#34d399"
            className="hero-node"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </g>
    </svg>
  )
}

/* Simulated click-tracking cursor: drifts into a random spot on its half of
   the dashboard, waits a beat, clicks (pulse + ripple), pops an event chip
   ("Tracked" / "Conversion" / "Accepted"), then fades away and respawns
   elsewhere. The two instances run the same cycle length with different
   start offsets and label rotations, so clicks never coincide and the two
   visible chips never match. */
const CLICK_LABELS = ['Tracked', 'Conversion']
/* Shared registry of what each cursor is currently claiming, so two visible
   chips can never read the same text */
const activeChip: Record<'left' | 'right', string> = { left: '', right: '' }

function FakeCursor({ side, offsetMs }: { side: 'left' | 'right'; offsetMs: number }) {
  // 'off' (not 'hidden'): Tailwind's .hidden utility means display:none,
  // which would kill the fade-in transition when the cursor reappears
  const [phase, setPhase] = useState<'off' | 'idle' | 'click' | 'label' | 'leave'>('off')
  const [pos, setPos] = useState({ x: side === 'left' ? 12 : 84, y: 40 })
  const [label, setLabel] = useState(CLICK_LABELS[side === 'left' ? 0 : 1])
  const lastLabel = useRef('')

  useEffect(() => {
    let alive = true
    const timers: number[] = []
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms))
      })
    // Restraint over simulated interactivity: each cursor performs a
    // handful of clicks once, then stays off for good — a brief flourish
    // rather than a looping animation a repeat visitor tires of
    const MAX_CYCLES = 2
    const run = async () => {
      await wait(offsetMs)
      for (let cycle = 0; alive && cycle < MAX_CYCLES; cycle++) {
        // side bands of the hero backdrop — clear of the centred title
        // column and above the docked chart
        setPos({
          x: side === 'left' ? 5 + Math.random() * 15 : 78 + Math.random() * 15,
          y: 12 + Math.random() * 46,
        })
        // claim a label the other cursor isn't showing; alternate our own
        const other = side === 'left' ? activeChip.right : activeChip.left
        const candidates = CLICK_LABELS.filter((l) => l !== other)
        const next = candidates.find((l) => l !== lastLabel.current) ?? candidates[0]
        lastLabel.current = next
        activeChip[side] = next
        setLabel(next)
        if (!alive) break
        setPhase('idle') // drift in
        await wait(1100)
        setPhase('click') // press pulse + ripple
        await wait(350)
        setPhase('label') // event chip pops
        await wait(1100)
        setPhase('leave') // fade out
        await wait(850)
        setPhase('off')
        activeChip[side] = ''
        await wait(900)
      }
    }
    run()
    return () => {
      alive = false
      activeChip[side] = ''
      timers.forEach(clearTimeout)
    }
  }, [side, offsetMs])

  return (
    <div
      className={`fake-cursor ${phase}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      aria-hidden="true"
    >
      <span className="fc-chip">{label}</span>
      <span className="fc-ripple" />
      <svg className="fc-arrow" width="22" height="22" viewBox="0 0 24 24">
        <path
          d="M5 3 L19 12 L12 13.5 L9.5 20 Z"
          fill="#ffffff"
          stroke="#0A0D10"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function Hero() {
  const ctaMagnet = useMagnetic()
  return (
    <section
      id="home"
      className="relative w-full h-[calc(100dvh-1rem)] md:h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-4rem)] bg-[#0A0D10] text-white rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl px-6 lg:px-12 py-6 md:py-8 flex flex-col"
    >
      {/* Animated backdrop: ambient radial base, emerald mesh, teal wash,
          dot grid and film grain */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#112218] via-[#0A0D10] to-[#050505] opacity-80" />
        <div className="hero-mesh" />
        <div className="hero-mesh2" />
        <div className="hero-teal" />
        <div className="hero-bloom hero-bloom-a" />
        <div className="hero-bloom hero-bloom-b" />
        <div className="hero-grid" />
        <div className="hero-grid2" />
        <div className="hero-grid3" />
        <div className="hero-grain" />
      </div>

      {/* Centered typography + CTA. pt clears the fixed nav; pb equals the
          docked dashboard's height, so the block centres in the visible gap
          between nav and dock on any display size */}
      <div className="flex-grow flex flex-col items-center justify-center text-center relative z-20 pt-20 md:pt-24 pb-[35vh] min-h-0">
        <h1 className="leading-[0.95]">
          {/* pb keeps descenders inside the clip-text paint box */}
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl pb-[0.12em] hero-anim hero-reveal bg-gradient-to-b from-white via-[#e9edec] to-[#98a29e] bg-clip-text text-transparent"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Data Collection
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-[0.18em] pb-[0.14em] hero-anim hero-reveal bg-gradient-to-b from-white via-[#e9edec] to-[#98a29e] bg-clip-text text-transparent"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            done right.
          </span>
        </h1>
        <p
          className="text-[16px] text-white/70 mt-4 hero-anim hero-fade"
          style={{ animationDelay: '0.58s' }}
        >
          by Jabed Ahmed
        </p>
        {/* Entrance animation lives on the wrapper: its fill-mode pins a final
            transform that would otherwise override the magnetic offset */}
        <div className="mt-8 hero-anim hero-fade" style={{ animationDelay: '0.72s' }}>
          <a
            ref={ctaMagnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-streak inline-block bg-[#00df8e] text-black px-8 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#00c27a] shadow-[0_0_30px_rgba(0,223,142,0.2)] transition-[background-color,scale,box-shadow] active:scale-95"
          >
            <span className="relative z-10 inline-block">Schedule a Call</span>
          </a>
        </div>
      </div>

      {/* Dashboard UI docked to the card's bottom edge, with the orbiting
          emerald light trace around its border */}
      <div
        className="glow-border absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] h-[35vh] bg-[#111518] border-t border-x border-b-0 border-white/10 rounded-t-[24px] shadow-2xl z-30 flex hero-anim hero-fade"
        style={{ animationDelay: '0.9s' }}
        aria-hidden="true"
      >
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-48 lg:w-64 shrink-0 border-r border-white/5 p-6 flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <LogoMark size={13} className="text-[#00df8e]" />
            <span className="h-2.5 w-16 rounded-full bg-white/10" />
          </div>
          {[92, 78, 84, 68, 74].map((w, i) => (
            <span key={i} className="h-3 bg-white/5 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Main chart area */}
        <div className="flex-grow relative flex items-end justify-center p-8 min-w-0 overflow-hidden rounded-t-[24px]">
          <span className="w-32 h-4 bg-white/5 rounded-full absolute top-6 left-8" />
          <span className="w-24 h-4 bg-white/5 rounded-full absolute top-6 right-8 hidden sm:block" />
          <div className="hero-graph-window absolute inset-x-6 top-16 bottom-0">
            <HeroGraph />
          </div>
        </div>
      </div>

      {/* Roaming click-tracking cursors in the backdrop's side bands —
          clear of the title column and outside the docked chart */}
      <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
        <FakeCursor side="left" offsetMs={900} />
        <FakeCursor side="right" offsetMs={3400} />
      </div>

      {/* Scroll indicator */}
      <a
        href="#who"
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 text-white/70 hover:text-white transition-colors hero-anim hero-fade rounded-md px-3 py-1.5 bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20"
        style={{ animationDelay: '1.1s' }}
      >
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase">Scroll</span>
        <ChevronDown size={13} className="animate-bounce" />
      </a>
    </section>
  )
}

/* Counts the numeric portion of a stat string ("€2M+" → "€" + 2 + "M+") up
   from `from` once its card scrolls into view, via requestAnimationFrame like
   the rest of the site's motion rather than a state-per-tick timer. Easing is
   ease-out cubic, so motion is quick early and visibly slows as it nears the
   target; `decimals` forces finer-grained steps (e.g. 0.1) so that
   deceleration reads as discrete increments rather than jumping 0→1→2. */
function CountUp({
  value,
  inView,
  duration = 1.6,
  from = 0,
  decimals: decimalsProp,
}: {
  value: string
  inView: boolean
  duration?: number
  from?: number
  decimals?: number
}) {
  // Memoised: value.match() returns a new array every render, and putting
  // that in a dependency array would re-fire (and cancel) the effect below
  // on every render instead of once when it comes into view
  const match = useMemo(() => value.match(/^([^\d]*)([\d.]+)(.*)$/), [value])
  const decimals = decimalsProp ?? (match && match[2].includes('.') ? match[2].split('.')[1].length : 0)
  const [display, setDisplay] = useState(match ? `${match[1]}${from.toFixed(decimals)}${match[3]}` : value)
  const done = useRef(false)

  useEffect(() => {
    if (!inView || !match || done.current) return
    done.current = true
    const [, prefix, numStr, suffix] = match
    const target = parseFloat(numStr)
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (target - from) * eased
      // Snap to the exact original label ("€2M+") the instant the rounded
      // value already reads as the target, instead of waiting for t to hit
      // 1 — otherwise a rounded frame like "€2.0M+" briefly holds before an
      // abrupt swap to "€2M+", which reads as a glitch rather than an arrival
      if (t >= 1 || parseFloat(current.toFixed(decimals)) === target) {
        setDisplay(value)
        return
      }
      setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, match, duration, from, decimals, value])

  return <>{display}</>
}

const WHO_HEADLINE =
  "I'm an Analytics Specialist with 8+ Years of Experience in Designing Scalable Data Collection Environments and High growth Digital Products."

const WHO_STATS = [
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

function WhoAmI() {
  // Headline unmask fires at 20% visibility; stat cards get their own
  // observer so the cascade starts as the grid itself scrolls into view
  const headline = useReveal<HTMLElement>(0.2, '0px 0px -50px 0px')
  const stats = useReveal<HTMLDivElement>(0.1)

  return (
    <section
      ref={headline.ref}
      id="who"
      className={`w-full px-6 lg:px-12 pt-32 pb-24 bg-[#f4f4f5] text-black ${
        headline.inView ? 'rv-in is-revealed' : ''
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Title column (~25%) — mirrors the Insights column so the vertical
            separators sit parallel while scrolling */}
        <div className="lg:col-span-3">
          <SectionMarker index={1} label="Who Am I" />
          <h2 className="rv text-black leading-[0.98] mt-8" style={{ animationDelay: '0.1s' }}>
            <span
              className="block font-playfair italic font-normal text-[34px] md:text-[42px]"
              style={{ letterSpacing: '-0.05em' }}
            >
              Analytics Professional
            </span>
            <span
              className="block font-normal text-[34px] md:text-[42px]"
              style={{ letterSpacing: '-0.08em' }}
            >
              technical expert.
            </span>
          </h2>
          <p
            className="rv text-[16px] text-black/60 mt-6 leading-relaxed"
            style={{ animationDelay: '0.2s' }}
          >
            Building the tracking environments and data pipelines that unlock millions in
            actionable revenue for digital products.
          </p>
        </div>

        <div className="lg:col-span-9 lg:border-l lg:border-black/10 lg:pl-10">
          {/* Word-by-word unmask: each word slides up out of its own
              overflow-hidden mask with an incrementing delay */}
          <h3 className="text-[32px] sm:text-[42px] md:text-[48px] font-medium leading-[1.15] tracking-tight max-w-[1000px]">
            {WHO_HEADLINE.split(' ').map((word, i) => (
              <span key={i} className="reveal-mask">
                <span className="reveal-word" style={{ transitionDelay: `${i * 0.03}s` }}>
                  {word}&nbsp;
                </span>
              </span>
            ))}
          </h3>

          {/* rv sits on the wrapper, not the magnetic anchor itself — the
              entrance animation's forwards fill would otherwise permanently
              pin transform: translateY(0) and swallow the magnetic scale */}
          <div className="rv mt-10" style={{ animationDelay: '0.6s' }}>
            <MagneticLink
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-streak inline-flex items-center gap-2.5 bg-black text-white px-7 py-3 rounded-full text-[14px] font-medium hover:bg-black/80 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00df8e]" />
              <span className="relative z-10">LinkedIn</span>
            </MagneticLink>
          </div>

          {/* Statistic cards: delayed cascading rise */}
          <div
            ref={stats.ref}
            className={`stat-grid-wrapper grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-[1200px] ${
              stats.inView ? 'is-visible' : ''
            }`}
          >
            {WHO_STATS.map((stat, i) => (
              /* entrance keyframes live on the wrapper; the inner card keeps
                 its slow hover free of the animation's transform */
              <div key={stat.tag} className="stat-rise" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="glow-border-soft bg-[#eaeaea] rounded-[32px] p-8 flex flex-col justify-between relative h-[240px] transition-[transform,box-shadow] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-xl">
                  <p className="font-data text-[44px] sm:text-[52px] xl:text-[64px] 2xl:text-[76px] font-medium leading-none text-black">
                    <CountUp
                      value={stat.value}
                      inView={stats.inView}
                      duration={4}
                      from={'from' in stat ? stat.from : undefined}
                      decimals={'decimals' in stat ? stat.decimals : undefined}
                    />
                  </p>
                  <p className="text-[14px] text-black/60 mt-auto pr-10">{stat.label}</p>
                  <span className="font-data absolute bottom-8 right-8 text-[13px] text-black/30">
                    {stat.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* Each card observes itself, so it floats up when it scrolls into view —
   not when the section header does */
function ServiceCard({ service, index }: { service: (typeof SERVICES)[number]; index: number }) {
  // Deep threshold: the card only rises once most of it is actually in view
  const { ref, inView } = useReveal<HTMLElement>(0.5)

  // Pointer-tracked spotlight: position written straight to CSS vars, no
  // React state, so the glow follows the cursor at full frame rate
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--sx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    e.currentTarget.style.setProperty('--sy', `${((e.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      className={`rv-solo ${inView ? 'rv-solo-in' : ''} group card-spotlight glow-border-soft bg-white border border-black/10 rounded-[32px] p-8 flex flex-col relative min-h-[320px] shadow-md transition-[transform,box-shadow,border-color] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-2xl hover:border-[#00df8e]`}
      style={{ animationDelay: `${(index % 3) * 0.1}s` }}
    >
      <div className="flex items-start justify-between">
        {/* Bold numeric anchor in a solid brand-green tile */}
        <span className="w-10 h-10 rounded-xl bg-[#00df8e] text-black text-[15px] font-data font-semibold flex items-center justify-center">
          {service.number}
        </span>
        <span className="bg-black/[0.05] text-black/60 text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full">
          {service.overline}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <service.icon size={22} className="text-black/70 shrink-0" strokeWidth={1.8} />
        <h3 className="text-[26px] font-semibold leading-tight">{service.headline}</h3>
      </div>
      <p className="text-[14px] text-black/80 mt-4 flex-grow leading-relaxed">{service.blurb}</p>
      <div className="flex flex-wrap gap-2 mt-6">
        {service.stack.map((tech, j) => (
          <span
            key={tech}
            className="pill-streak bg-[#00df8e]/10 text-[#00996a] rounded-full px-3 py-1 text-[11px] font-medium"
            style={{ '--ps-delay': `${j * 70}ms` } as React.CSSProperties}
          >
            <span className="relative z-10">{tech}</span>
          </span>
        ))}
      </div>
    </article>
  )
}

function Service() {
  const { ref, inView } = useReveal<HTMLElement>()
  return (
    <section
      ref={ref}
      id="service"
      className={`w-full px-6 lg:px-12 py-32 bg-[#f4f4f5] text-black ${inView ? 'rv-in' : ''}`}
    >
      {/* Header row */}
      <div className="flex justify-between items-end border-b border-black/10 pb-8">
        <div>
          <SectionMarker index={3} label="Service" />
          <h2 className="rv text-black leading-[0.98] mt-6" style={{ animationDelay: '0.1s' }}>
            <span
              className="block font-playfair italic font-normal text-[44px] md:text-[60px]"
              style={{ letterSpacing: '-0.05em' }}
            >
              The Complete
            </span>
            <span
              className="block font-normal text-[44px] md:text-[60px]"
              style={{ letterSpacing: '-0.08em' }}
            >
              data pipeline.
            </span>
          </h2>
        </div>
      </div>

      {/* Service cards — each floats up on its own scroll trigger */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        {SERVICES.map((service, i) => (
          <ServiceCard key={service.number} service={service} index={i} />
        ))}
      </div>

      <LogoMarquee />
    </section>
  )
}

function Contact() {
  const magnet = useMagnetic()
  const { ref, inView } = useReveal<HTMLElement>()
  return (
    <section
      ref={ref}
      id="contact"
      className={`w-full px-6 lg:px-12 py-14 md:py-20 bg-[#050505] text-white rounded-[32px] md:rounded-[48px] shadow-2xl mt-16 ${inView ? 'rv-in' : ''}`}
    >
      {/* Marker top-left, matching the other sections */}
      <SectionMarker index={4} label="Contact" dark />

      <div className="max-w-[900px] mt-10 md:mt-14">
        <h2
          className="rv text-white leading-[1.05] text-[40px] sm:text-[56px] md:text-[68px]"
          style={{ animationDelay: '0.1s' }}
        >
          Let's get your data{' '}
          <span className="font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
            working for you.
          </span>
        </h2>
        <div
          className="rv flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-12 mt-12"
          style={{ animationDelay: '0.2s' }}
        >
          <a
            ref={magnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-streak inline-block self-start bg-[#00df8e] text-black px-8 py-4 rounded-full text-[15px] font-semibold hover:bg-[#00c27a] transition-[background-color,scale] active:scale-95"
          >
            <span className="relative z-10 inline-block">Schedule a Call</span>
          </a>
          <div>
            <p className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase mb-1.5">
              Or drop me a line
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="font-playfair italic text-2xl sm:text-3xl text-white hover:text-[#00df8e] transition-colors"
            >
              {EMAIL}
            </a>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[12px] text-white/40 mt-16 md:mt-20 border-t border-white/10 pt-8">
        <p>© {new Date().getFullYear()} Jabed Ahmed — Data & Analytics Consulting</p>
        <p>30-minute intro call, no obligation.</p>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div
      className="w-full min-h-screen font-sans antialiased bg-[#f4f4f5] text-black overflow-x-clip tracking-[-0.02em] p-2 md:p-6 lg:p-8 flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <CursorGlow />
      <SiteNav />
      <Hero />
      <WhoAmI />
      <Insights />
      <Service />
      <Contact />
    </div>
  )
}
