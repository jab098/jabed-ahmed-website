import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
} from 'lucide-react'

/* The site's brand glyph — same path as the top-left logo, reused across
   the dashboard mockup assets */
function LogoMark({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  )
}

const NAV_LINKS = ['Home', 'Insights', 'Service', 'Contact']
const CALENDLY_URL = 'https://calendly.com/jabed098/30min'
const EMAIL = 'consulting@jabed.co.uk'

const SERVICES = [
  {
    number: '01',
    overline: 'Implementation',
    headline: 'Tag Management',
    blurb:
      'Tag ecosystems managed across five international markets — dataLayer design specs, documentation and QA standards that keep tracking consistent at scale.',
    stack: ['GTM', 'Tealium iQ', 'Snowplow', 'Custom templates', 'dataLayer architecture'],
  },
  {
    number: '02',
    overline: 'Infrastructure',
    headline: 'Server-Side Tracking',
    blurb:
      'End-to-end behavioural pipelines: browser-level capture, collector configuration, stream processing and enrichment — delivered cleanly into the warehouse.',
    stack: ['sGTM', 'GA4', 'Tealium EventStream', 'First-party cookies'],
  },
  {
    number: '03',
    overline: 'Experimentation',
    headline: 'CRO & Testing',
    blurb:
      'Adobe Target A/B and personalisation programmes with measurable impact — contributing over €2M in annual revenue uplift for a global telco.',
    stack: ['Adobe Target', 'A/B testing', 'Personalisation rules'],
  },
  {
    number: '04',
    overline: 'Compliance',
    headline: 'Consent & Privacy',
    blurb:
      'OneTrust administration and GDPR-aligned consent across multiple markets, including ATT and SKAdNetwork compliance after the iOS privacy changes.',
    stack: ['OneTrust', 'Consent Mode v2', 'GDPR-aligned tagging'],
  },
  {
    number: '05',
    overline: 'Reporting',
    headline: 'BI & Data Modelling',
    blurb:
      'GA4-powered pipelines feeding the data lake, with downstream Power BI and Looker reporting — governed, accurate and stakeholder-ready.',
    stack: ['Power BI', 'Looker', 'SQL', 'Dashboarding'],
  },
  {
    number: '06',
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
]

function LogoMarquee() {
  return (
    <div className="logo-marquee mt-20 md:mt-28" aria-label="Platforms and tools I work with">
      <div className="logo-marquee-fade">
        <div className="logo-marquee-track">
          {/* Five identical copies back to back: translating the track -20%
              (exactly one copy) lands on an identical frame, so the loop
              resets without a visible seam. Five (not two) so the copies
              behind the animated one always cover ultra-wide viewports —
              with two, any screen wider than a single copy (~1200px) saw
              a gap and a blink at the reset point. */}
          {[0, 1, 2, 3, 4].map((copy) => (
            <div className="logo-marquee-group" key={copy} aria-hidden={copy > 0}>
              {LOGOS.map((logo) => (
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={copy === 0 ? logo.name : ''}
                  title={logo.name}
                  loading="lazy"
                  draggable={false}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const deltaTone = (d: string) => (d.startsWith('+') ? 'text-emerald-400' : 'text-rose-400')

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
                <span className="ml-auto font-semibold text-[#f4f4f5]">
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
          <span className="w-8 text-right text-sm font-semibold text-[#f4f4f5]">{r.score}</span>
          <span className={`w-8 text-right text-[11px] ${r.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
            <text x={x1 - 12} y={yFor(a) + 4} textAnchor="end" fill="#a1a1aa" fontSize="11">
              {a.toFixed(1)}
            </text>
            <text x={x2 + 12} y={yFor(b) + 4} fill="#f4f4f5" fontSize="11">
              {b.toFixed(1)} · {s.name}
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
                <span key={m} className="border border-[#27272a] rounded-full px-2 py-0.5 text-[10px] text-[#a1a1aa]">
                  {m}
                </span>
              ))}
            </span>
            <span className="ml-auto shrink-0 text-sm text-[#f4f4f5]">
              {p.mentions}
              <span className="text-[11px] text-[#71717a] ml-1">mentions</span>
            </span>
            <span className={`w-12 shrink-0 text-right text-[11px] ${deltaTone(p.trend)}`}>{p.trend}</span>
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
            <span className="w-10 text-right text-xs text-[#a1a1aa] shrink-0">{d.share}</span>
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
              <span className="ml-auto text-[#f4f4f5] text-xl font-semibold">{m.share}%</span>
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
          <LogoMark size={15} className="text-[#f4f4f5]" />
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

function Insights({ fade }: { fade: number }) {
  const [visible, setVisible] = useState(false)
  const [booted, setBooted] = useState(false)
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

  // Play the entrance sequence the first time the section scrolls into view
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
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // While the entrance runs, panel content waits its turn (--wt-base); once
  // booted, tab switches replay the same animations with no base delay
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setBooted(true), 2400)
    return () => clearTimeout(t)
  }, [visible])

  const delay = (s: number) => ({ animationDelay: `calc(var(--wt-base) + ${s}s)` })

  const donutCircumference = 2 * Math.PI * 48

  return (
    <section
      ref={sectionRef}
      id="insights"
      className={`relative overflow-hidden bg-black py-24 md:py-32 ${visible ? 'wt-in' : ''}`}
      style={{ '--wt-base': booted ? '0s' : '0.9s' } as React.CSSProperties}
    >
      {/* Background video — anchored to this section only */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/insights-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Constant legibility dimmer */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      {/* Soft blends into the sections above and below */}
      <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-black via-black/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
      {/* Scroll-linked fade to black */}
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: fade }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 md:px-14">
        {/* Section hero */}
        <div className="wt-anim text-center mb-14 md:mb-20" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-white leading-[0.98] text-4xl sm:text-6xl md:text-7xl">
            <span className="block font-playfair italic font-normal" style={{ letterSpacing: '-0.05em' }}>
              Real Growth
            </span>
            <span className="block font-normal" style={{ letterSpacing: '-0.08em' }}>
              backed by data.
            </span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg mt-6 max-w-2xl mx-auto">
            Track <span className="text-cyan-300 font-medium">Visibility</span>,{' '}
            <span className="text-blue-300 font-medium">Position</span> and{' '}
            <span className="text-pink-300 font-medium">Sentiment</span> for your brand across AI
            search — in one live dashboard.
          </p>
        </div>

        {/* Dashboard shell */}
        <div
          className="wt-anim wt-pop rounded-2xl border border-emerald-400/15 bg-[#0a0a0c]/90 backdrop-blur-sm shadow-[0_0_45px_rgba(16,185,129,0.13),0_0_130px_rgba(16,185,129,0.07),0_30px_80px_-20px_rgba(0,0,0,0.85)] overflow-hidden flex text-left"
          style={{ animationDelay: '0.4s' }}
        >
          {/* Left sidebar */}
          <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-[#27272a] bg-[#121214]/80 p-4">
            <div className="flex items-center gap-2.5 px-2 mb-7">
              <LogoMark size={15} className="text-[#f4f4f5]" />
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
                <LogoMark size={12} className="text-[#f4f4f5] shrink-0" />
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
            <div key={`chart-${visible}-${metric}`} className="wt-swap px-4 sm:px-6 pt-4 pb-6" style={delay(0.15)}>
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
              key={`lower-${visible}`}
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
                        <td className="py-3 text-[#71717a]">{c.rank}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`w-6 h-6 rounded-md ${c.tone} text-[10px] font-bold text-white flex items-center justify-center shrink-0`}
                            >
                              {c.brand[0]}
                            </span>
                            <span className="text-[#f4f4f5] font-medium">{c.brand}</span>
                          </span>
                        </td>
                        <td className="py-3 text-[#f4f4f5]">
                          {c.visibility}
                          <span className={`text-[11px] ml-2 ${deltaTone(c.visDelta)}`}>
                            {c.visDelta}
                          </span>
                        </td>
                        <td className="py-3 text-[#f4f4f5]">
                          {c.sentiment}
                          <span className={`text-[11px] ml-2 ${deltaTone(c.sentDelta)}`}>
                            {c.sentDelta}
                          </span>
                        </td>
                        <td className="py-3 text-[#f4f4f5] text-right">
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
                        <span className="ml-auto text-[#a1a1aa] text-xs">{d.share}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[#f4f4f5] text-sm font-semibold mb-4">Source mix</p>
                  <div className="flex items-center gap-5">
                    <div className="relative w-28 h-28 shrink-0">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
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
                        <span className="text-[#f4f4f5] text-lg font-semibold leading-none">
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
                          <span className="ml-auto text-[#71717a]">{s.value}%</span>
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
              <div key={`page-${page}-${visible}`} className="wt-swap p-4 sm:p-6" style={delay(0.2)}>
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
    </section>
  )
}

function Navbar({
  active,
  scrolled,
  opacity,
}: {
  active: string
  scrolled: boolean
  opacity: number
}) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-5 pt-6 sm:pt-8 pb-4 transition-opacity duration-500"
      style={{ opacity, pointerEvents: opacity < 0.15 ? 'none' : 'auto' }}
    >
      {/* Logo + wordmark — fades out once the hero scrolls away so it never
          overlaps section headings */}
      <a
        href="#home"
        className={`flex items-center gap-2.5 transition-opacity duration-300 ${
          scrolled ? 'opacity-0 pointer-events-none' : ''
        }`}
      >
        <LogoMark size={26} className="text-white" />
        <span className="text-white text-2xl font-playfair italic">Jabed Ahmed</span>
      </a>

      {/* Center pill nav */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              link === active
                ? 'text-white bg-white/20'
                : 'text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {link}
          </a>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden text-white p-2" aria-label="Open menu">
        <Menu size={24} />
      </button>
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

/* Volumetric funnel beam: three flared SVG paths, each pin-narrow at the top
   and sweeping into a wide curved skirt across the dashboard's top edge —
   an inverted light fountain. Vertical gradients dissolve every layer to
   transparent at the top; the blurred skirt pools over the panel so the
   dashboard appears to emit the light. viewBox is 900×1000, stretched to the
   positioned container by preserveAspectRatio="none". */
function HeroBeam() {
  return (
    <svg
      className="hero-beam"
      viewBox="0 0 900 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* All diffusion is mathematical: one horizontal vector gradient
            walks transparent → emerald → bright mint → solid white at the
            dead-centre 50% stop and back out. No raster-stretching CSS
            blurs, so it renders crisp at any resolution. */}
        <linearGradient id="beamX" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0" stopColor="#10b981" stopOpacity="0" />
          <stop offset="0.2" stopColor="#10b981" stopOpacity="0.07" />
          <stop offset="0.36" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="0.45" stopColor="#00ff9d" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#00ff9d" stopOpacity="0.4" />
          <stop offset="0.64" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="0.8" stopColor="#10b981" stopOpacity="0.07" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beamWideX" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0" stopColor="#10b981" stopOpacity="0" />
          <stop offset="0.3" stopColor="#10b981" stopOpacity="0.06" />
          <stop offset="0.5" stopColor="#10b981" stopOpacity="0.16" />
          <stop offset="0.7" stopColor="#10b981" stopOpacity="0.06" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        {/* Gentle native vector blurs — soften the white core into a lens
            flare while staying resolution-independent */}
        <filter id="beamSoft" x="-40%" y="-10%" width="180%" height="120%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="beamSofter" x="-60%" y="-10%" width="220%" height="120%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      {/* Wide atmospheric skirt of the funnel */}
      <path
        d="M400,0 C400,420 330,760 -60,1000 L960,1000 C570,760 500,420 500,0 Z"
        fill="url(#beamWideX)"
        filter="url(#beamSofter)"
      />
      {/* Main funnel: white-hot centre diffusing through mint into emerald */}
      <path
        d="M430,0 C430,470 390,800 170,1000 L730,1000 C510,800 470,470 470,0 Z"
        fill="url(#beamX)"
        filter="url(#beamSoft)"
      />
    </svg>
  )
}

function Hero({ fade }: { fade: number }) {
  const magnet = useMagnetic()
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden h-screen bg-[#07090e]"
      style={{ height: '100dvh' }}
    >
      {/* Animated emerald backdrop layers */}
      <div className="hero-mesh" />
      <div className="hero-mesh2" />
      <div className="hero-bloom hero-bloom-a" />
      <div className="hero-bloom hero-bloom-b" />
      <div className="hero-grain" />

      {/* Title + CTA */}
      <div className="relative z-30 flex flex-col items-center text-center px-5 pt-[13vh] sm:pt-[15vh]">
        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Data Collection
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            done right.
          </span>
        </h1>
        <p
          className="mt-5 text-white text-2xl font-playfair italic hero-anim hero-fade"
          style={{ animationDelay: '0.58s' }}
        >
          by Jabed Ahmed
        </p>
        {/* Entrance animation lives on the wrapper: its fill-mode pins a final
            transform that would otherwise override the magnetic offset */}
        <div className="mt-8 hero-anim hero-fade" style={{ animationDelay: '0.72s' }}>
          <a
            ref={magnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-sm font-semibold px-7 py-3 rounded-full transition-[background-color,scale,box-shadow] active:scale-95 shadow-[0_0_28px_rgba(16,185,129,0.45)] hover:shadow-[0_0_44px_rgba(16,185,129,0.65)]"
          >
            <span className="inline-block">Schedule a Call</span>
          </a>
        </div>
      </div>

      {/* Glassmorphism dashboard mock — decorative, cut by the fold */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[-4vh] sm:bottom-[-7vh] w-[92vw] max-w-5xl xl:max-w-6xl 2xl:max-w-[1400px] z-20 hero-anim hero-fade"
        style={{ animationDelay: '0.9s' }}
        aria-hidden="true"
      >
        {/* Volumetric funnel beam pouring onto the panel's top edge */}
        <HeroBeam />
        <div className="glow-border rounded-2xl bg-[#101318]/55 backdrop-blur-[16px] p-3 sm:p-4 shadow-[0_0_90px_rgba(16,185,129,0.13)]">
          <div className="flex gap-3">
            {/* Sidebar skeleton */}
            <div className="hidden sm:flex w-40 shrink-0 flex-col gap-3.5 rounded-xl bg-[#14161b] p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogoMark size={13} className="text-emerald-400" />
                <span className="h-2 w-16 rounded bg-white/10" />
              </div>
              {[20, 14, 17, 12, 18].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-white/10" />
                  <span className="h-1.5 rounded bg-white/[0.07]" style={{ width: w * 4 }} />
                </div>
              ))}
            </div>
            {/* Chart card */}
            <div className="flex-1 min-w-0 rounded-xl bg-[#14161b] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-24 rounded bg-white/10" />
                <span className="ml-auto h-4 w-24 rounded-full bg-white/[0.06]" />
              </div>
              {/* Viewport-relative height on large displays, so tall screens
                  see more graph instead of more empty gap */}
              <div className="hero-graph-window h-40 sm:h-52 xl:h-[30vh] 2xl:h-[34vh]">
                <HeroGraph />
              </div>
            </div>
            {/* Quick panel skeleton */}
            <div className="hidden lg:flex w-52 shrink-0 flex-col gap-3 rounded-xl bg-[#14161b] p-4">
              <span className="h-2 w-20 rounded bg-white/10" />
              <span className="h-9 rounded-lg bg-white/[0.05] border border-white/[0.06]" />
              <span className="h-9 rounded-lg bg-white/[0.05] border border-white/[0.06]" />
              <span className="mt-auto h-8 rounded-full bg-emerald-400/20 border border-emerald-400/25" />
            </div>
          </div>
        </div>
      </div>

      {/* Smoky fade into the next section */}
      <div className="hero-smoke" />
      <div className="absolute bottom-0 left-0 right-0 h-[16vh] z-40 bg-gradient-to-t from-black via-black/55 to-transparent pointer-events-none" />

      {/* Scroll-linked fade to black */}
      <div
        className="absolute inset-0 z-40 bg-black pointer-events-none"
        style={{ opacity: fade }}
      />

      {/* Scroll indicator */}
      <a
        href="#insights"
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-colors hero-anim hero-fade rounded-md px-3 py-1.5 bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20"
        style={{ animationDelay: '1.1s' }}
      >
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase">Scroll</span>
        <ChevronDown size={13} className="animate-bounce" />
      </a>
    </section>
  )
}

function CarouselArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center gap-4 shrink-0">
      <button
        onClick={onPrev}
        aria-label="Previous services"
        className="w-16 h-16 rounded-full border border-white/25 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/50 active:scale-95"
      >
        <ChevronLeft size={30} />
      </button>
      <button
        onClick={onNext}
        aria-label="Next services"
        className="w-16 h-16 rounded-full border border-white/25 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/50 active:scale-95"
      >
        <ChevronRight size={30} />
      </button>
    </div>
  )
}

function Service({ fade }: { fade: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)

  const scrollByCard = (direction: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('article')
    const gap = 20
    const step = card ? card.clientWidth + gap : 400
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  // When every card fits in the window, show them all and hide the controls.
  // When the track overflows, the cards that fully fit from the current snap
  // position are "selected"; the rest recede: transparent + scaled down.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0

    const updateCards = () => {
      const cards = track.querySelectorAll('article')
      const first = cards[0]
      if (!first) return

      const hasOverflow = track.scrollWidth > track.clientWidth + 4
      setScrollable(hasOverflow)

      const gap = 20
      const step = first.clientWidth + gap
      const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0
      const visibleCount = Math.max(
        1,
        Math.floor((track.clientWidth - 2 * padLeft + gap) / step),
      )
      let start = Math.round(track.scrollLeft / step)
      // At the end of the track there's less than a full step left to scroll,
      // so anchor the selection to the last fully visible cards instead
      const maxScroll = track.scrollWidth - track.clientWidth
      if (track.scrollLeft >= maxScroll - 4) {
        start = cards.length - visibleCount
      }
      cards.forEach((card, i) => {
        const selected = !hasOverflow || (i >= start && i < start + visibleCount)
        card.style.opacity = selected ? '1' : '0.22'
        card.style.transform = selected ? 'scale(1)' : 'scale(0.94)'
      })
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updateCards)
    }

    updateCards()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section id="service" className="relative overflow-hidden bg-black py-24 md:py-32">
      {/* Background video — anchored to this section only */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/service-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Constant legibility dimmer */}
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />
      {/* Soft blends into the sections above and below */}
      <div className="absolute top-0 left-0 right-0 h-[35vh] bg-gradient-to-b from-black via-black/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
      {/* Scroll-linked fade to black */}
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: fade }} />

      <div className="relative z-10">
        {/* Section header + carousel arrows */}
        <div className="max-w-6xl mx-auto px-5 sm:px-10 md:px-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14 md:mb-20">
          <div>
            <p className="text-emerald-400 text-xs font-semibold tracking-[0.25em] uppercase mb-5">
              Service
            </p>
            <h2 className="text-white leading-[1.05] text-4xl sm:text-5xl md:text-6xl max-w-3xl">
              Six disciplines,{' '}
              <span className="font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
                one robust
              </span>
              <span className="block font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
                data infrastructure.
              </span>
            </h2>
          </div>
          {scrollable && (
            <CarouselArrows onPrev={() => scrollByCard(-1)} onNext={() => scrollByCard(1)} />
          )}
        </div>

        {/* Carousel — full-bleed so neighbouring cards peek at the edges */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-[8vw]"
          style={{ scrollPaddingLeft: '8vw' }}
        >
          {SERVICES.map((service) => (
            <article
              key={service.number}
              className="group relative snap-start shrink-0 w-[72vw] sm:w-[40vw] md:w-[340px] min-h-[540px] md:min-h-[620px] border border-white/10 rounded-3xl p-8 flex flex-col bg-black/35 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/40 hover:bg-black/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.14)]"
            >
              <div className="flex items-start justify-between mb-10">
                <span className="font-playfair italic text-4xl text-emerald-400">
                  {service.number}
                </span>
                <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase pt-2.5">
                  {service.overline}
                </span>
              </div>

              <h3 className="text-white text-2xl lg:text-3xl font-bold uppercase leading-tight mb-4">
                {service.headline}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{service.blurb}</p>

              <div className="flex flex-wrap gap-2 mt-auto pt-8">
                {service.stack.map((tech) => (
                  <span
                    key={tech}
                    className="border border-white/15 bg-white/[0.06] text-white/75 text-xs font-medium px-3 py-1.5 rounded-full transition-colors group-hover:border-white/25 group-hover:text-white/90"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <LogoMarquee />
      </div>
    </section>
  )
}

function Contact() {
  const magnet = useMagnetic()
  return (
    <section
      id="contact"
      className="relative bg-black px-5 sm:px-10 md:px-14 pt-24 md:pt-32 pb-12 md:pb-16"
    >
      <div className="max-w-6xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-semibold tracking-[0.25em] uppercase mb-5">
          Contact
        </p>
        <h2 className="text-white leading-[1.02] text-4xl sm:text-6xl md:text-7xl max-w-4xl mb-12">
          Let's get your data{' '}
          <span className="font-playfair italic" style={{ letterSpacing: '-0.04em' }}>
            working for you.
          </span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-12">
          <a
            ref={magnet.ref}
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center self-start bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-sm font-semibold px-7 py-3 rounded-full transition-[background-color,scale,box-shadow] active:scale-95 shadow-[0_0_28px_rgba(16,185,129,0.35)] hover:shadow-[0_0_44px_rgba(16,185,129,0.55)]"
          >
            <span className="inline-flex items-center gap-2">
              Schedule a Call
              <ArrowUpRight size={16} />
            </span>
          </a>
          <div>
            <p className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase mb-1.5">
              Or drop me a line
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="font-playfair italic text-2xl sm:text-3xl text-white hover:text-emerald-400 transition-colors"
            >
              {EMAIL}
            </a>
          </div>
        </div>

        {/* Footer line */}
        <div className="border-t border-white/10 mt-16 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Jabed Ahmed — Data & Analytics Consulting
          </p>
          <p className="text-white/40 text-xs">30-minute intro call, no obligation.</p>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [heroFade, setHeroFade] = useState(0)
  const [serviceFade, setServiceFade] = useState(0)
  const [active, setActive] = useState('Home')
  const [scrolled, setScrolled] = useState(false)
  const [navOpacity, setNavOpacity] = useState(1)
  const [insightsFade, setInsightsFade] = useState(0)

  useEffect(() => {
    let lastY = window.scrollY
    let downAnchor: number | null = null
    const onScroll = () => {
      const y = window.scrollY
      const vh = window.innerHeight

      // Hero background fades fully to black before the hero leaves the viewport
      setHeroFade(Math.min(y / (vh * 0.75), 1))

      // Past the hero, section headings reach the top of the viewport
      setScrolled(y > vh * 0.5)

      // The nav fades out progressively the further you scroll down (fully
      // invisible after ~0.7 viewport heights), and any upward scroll brings
      // it straight back. The deadband stops flicker on tiny scroll jitters.
      if (y <= 100) {
        downAnchor = null
        setNavOpacity(1)
      } else if (y > lastY + 2) {
        if (downAnchor === null) downAnchor = Math.max(lastY, 100)
        setNavOpacity(Math.max(0, 1 - (y - downAnchor) / (vh * 0.7)))
      } else if (y < lastY - 2) {
        downAnchor = null
        setNavOpacity(1)
      }
      lastY = y

      // Insights background fades to black as the section scrolls out of view
      const insights = document.getElementById('insights')
      if (insights) {
        const rect = insights.getBoundingClientRect()
        setInsightsFade(Math.min(Math.max((vh - rect.bottom) / (vh * 0.85), 0), 1))
      }

      // Service background fades to black as the section scrolls out of view
      const service = document.getElementById('service')
      if (service) {
        const rect = service.getBoundingClientRect()
        setServiceFade(Math.min(Math.max((vh - rect.bottom) / (vh * 0.85), 0), 1))
      }

      // Scrollspy for the nav pill
      const mid = y + vh / 2
      const contact = document.getElementById('contact')
      if (contact && mid >= contact.offsetTop) setActive('Contact')
      else if (service && mid >= service.offsetTop) setActive('Service')
      else if (insights && mid >= insights.offsetTop) setActive('Insights')
      else setActive('Home')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <CursorGlow />
      <Navbar active={active} scrolled={scrolled} opacity={navOpacity} />
      <Hero fade={heroFade} />
      <Insights fade={insightsFade} />
      <Service fade={serviceFade} />
      <Contact />
    </div>
  )
}
