export default function DonutChart({ percentual, size = 168, strokeWidth = 20, label, sublabel }) {
  const radius = (size - strokeWidth) / 2
  const circunferencia = 2 * Math.PI * radius
  const progresso = (Math.max(0, Math.min(100, percentual)) / 100) * circunferencia
  const gradId = `donut-grad-${size}-${strokeWidth}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#5B21B6" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F3E8FF" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progresso} ${circunferencia - progresso}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-extrabold text-institucional-deep">{percentual.toFixed(1)}%</span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-semibold text-institucional-text text-center max-w-[11rem]">{label}</span>}
      {sublabel && <span className="mt-1 text-xs text-gray-500 text-center">{sublabel}</span>}
    </div>
  )
}
