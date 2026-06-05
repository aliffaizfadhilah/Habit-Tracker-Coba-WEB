interface LineChartProps {
  data: { date: string; total: number }[]
  height?: number
}

export function SimpleLineChart({ data, height = 220 }: LineChartProps) {
  if (!data.length) return (
    <div className="flex items-center justify-center text-muted text-sm" style={{ height }}>
      Belum ada data
    </div>
  )

  const VW  = 560
  const VH  = 172
  const pad = { top: 14, right: 24, bottom: 40, left: 36 }
  const iw  = VW - pad.left - pad.right
  const ih  = VH - pad.top  - pad.bottom

  const maxVal = Math.max(...data.map(d => d.total), 1)
  // baseline sedikit di bawah nilai minimum agar garis tidak menempel dasar
  const minVal = Math.max(0, Math.min(...data.map(d => d.total)) - Math.max(1, Math.ceil(maxVal * 0.15)))
  const range  = maxVal - minVal || 1

  const toY = (v: number) => pad.top + ih - ((v - minVal) / range) * ih

  const pts = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * iw,
    y: toY(d.total),
    ...d,
  }))

  // smooth bezier curve
  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`
    const prev = pts[i - 1]
    const cpx  = (prev.x + p.x) / 2
    return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`
  }, '')

  const area = `${linePath} L${pts[pts.length - 1].x},${pad.top + ih} L${pts[0].x},${pad.top + ih} Z`

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => ({
    val: Math.round(minVal + r * range),
    y:   toY(minVal + r * range),
  }))

  const step    = Math.max(1, Math.ceil(data.length / 6))
  const xLabels = pts.filter((_, i) => i % step === 0 || i === pts.length - 1)

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#16a34a" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {yTicks.map(t => (
        <g key={t.val}>
          <line x1={pad.left} y1={t.y} x2={pad.left + iw} y2={t.y}
            stroke="#e5e7eb" strokeWidth="0.4" />
          <text x={pad.left - 5} y={t.y + 1.5} textAnchor="end"
            fontSize="9" fill="#6b7280">{t.val}</text>
        </g>
      ))}

      <path d={area} fill="url(#areaGrad)" />

      <path d={linePath} fill="none" stroke="#16a34a" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />

      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fff" stroke="#16a34a" strokeWidth="1.5" />
      ))}

      {xLabels.map((p, i) => (
        <text key={i} x={p.x} y={VH - 8} textAnchor="middle"
          fontSize="10" fill="#4b5563">
          {p.date.slice(5)}
        </text>
      ))}
    </svg>
  )
}

interface BarChartProps {
  data: { label: string; value: number }[]
  height?: number
}

export function SimpleBarChart({ data, height = 260 }: BarChartProps) {
  if (!data.length) return (
    <div className="flex items-center justify-center text-muted text-sm" style={{ height }}>
      Belum ada data
    </div>
  )

  const max  = Math.max(...data.map(d => d.value), 1)
  const w    = 100
  const h    = 100
  const pad  = { top: 4, right: 4, bottom: 24, left: 32 }
  const iw   = w - pad.left - pad.right
  const ih   = h - pad.top - pad.bottom
  const barW = (iw / data.length) * 0.6
  const gap  = iw / data.length

  const yTicks = [0, 0.5, 1].map(r => ({
    val: Math.round(max * r),
    y:   pad.top + ih - r * ih,
  }))

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {yTicks.map(t => (
        <g key={t.val}>
          <line x1={pad.left} y1={t.y} x2={pad.left + iw} y2={t.y}
            stroke="#e5e7eb" strokeWidth="0.5" />
          <text x={pad.left - 2} y={t.y + 1.5} textAnchor="end"
            fontSize="3.5" fill="#9ca3af">{t.val}</text>
        </g>
      ))}

      {data.map((d, i) => {
        const bh = (d.value / max) * ih
        const x  = pad.left + i * gap + (gap - barW) / 2
        const y  = pad.top + ih - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh}
              fill="#16a34a" rx="1" opacity="0.85" />
            <text x={x + barW / 2} y={h - 2} textAnchor="middle"
              fontSize="3" fill="#9ca3af">
              {d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
