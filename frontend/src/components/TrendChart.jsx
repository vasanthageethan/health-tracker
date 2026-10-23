const WIDTH = 600
const HEIGHT = 160
const PAD = 24

export default function TrendChart({ label, unit, points }) {
  const clean = points.filter((p) => p.value != null)

  return (
    <div className="trend-chart">
      <h3>{label}</h3>
      {clean.length < 2 ? (
        <p className="status">Not enough data yet.</p>
      ) : (
        <>
          <ChartSvg points={clean} unit={unit} />
          <p className="chart-range">{clean[0].date} – {clean[clean.length - 1].date}</p>
        </>
      )}
    </div>
  )
}

function ChartSvg({ points, unit }) {
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const x = (i) => PAD + (i / (points.length - 1)) * (WIDTH - 2 * PAD)
  const y = (v) => HEIGHT - PAD - ((v - min) / range) * (HEIGHT - 2 * PAD)

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="trend-svg" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={p.date} cx={x(i)} cy={y(p.value)} r="2.5" fill="var(--accent)" />
      ))}
      <text x={PAD} y="14" className="chart-label">{max.toFixed(1)}{unit}</text>
      <text x={PAD} y={HEIGHT - 6} className="chart-label">{min.toFixed(1)}{unit}</text>
    </svg>
  )
}
