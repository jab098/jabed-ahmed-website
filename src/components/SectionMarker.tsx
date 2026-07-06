/* Section marker: a mono index + growing underline instead of the
   "(Section Name)" + static hairline pattern — that motif is the most
   copied one in current portfolio templates, so this swaps in a more
   distinctive, data-tool-flavoured mark built from pieces already in use
   elsewhere on the site (font-data, .marker-line). */
export function SectionMarker({
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
