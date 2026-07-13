import { useEffect, useRef, useState } from 'react'
import {
  Calendar,
  Check,
  ChevronDown,
  Cpu,
  Download,
  Globe,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from 'lucide-react'
import { LogoMark } from './LogoMark'
import { SectionMarker } from './SectionMarker'
import { AiSearch } from './AiSearch'

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

export function Insights() {
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
      className={`insights-section paper-section ${visible ? 'rv-in' : ''} ${chartIn ? 'wt-in' : ''}`}
      style={{ '--wt-base': booted ? '0s' : '0.9s' } as React.CSSProperties}
    >
      <div className="decision-room" data-insights-stage="decision-room">
        <div className="decision-room-material" aria-hidden="true">
          <span className="decision-room-bloom" />
          <span className="decision-room-contours" />
        </div>

        <header className="decision-room-header">
          <div className="decision-room-title">
            <SectionMarker index={2} label="Insights" dark />
            <h2 className="rv" style={{ animationDelay: '0.1s' }}>
              <span>Evidence, </span>
              <em>not instinct.</em>
            </h2>
          </div>
          <div className="decision-room-copy rv" style={{ animationDelay: '0.2s' }}>
            <p>
              Measurement architecture and experimentation that turns uncertain product questions
              into measurable commercial outcomes.
            </p>
            <div className="decision-room-proof" role="list" aria-label="Selected outcomes">
              <span role="listitem">Governed measurement</span>
              <span role="listitem">16-market scale</span>
              <span role="listitem">€2M+ annual uplift</span>
            </div>
          </div>
        </header>

        <div
          ref={chartRef}
          className="decision-window rv"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="decision-window-label" aria-hidden="true">
            <span>Live decision system</span>
            <small>02 / working model</small>
          </div>
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

        <AiSearch />
      </div>
    </section>
  )
}
