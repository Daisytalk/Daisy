'use client'

import { useId, useMemo } from 'react'
import { addDays, format, parse } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { normalizeScoreTo100 } from '@/shared/lib/scoring-helpers'

/** `dateKey` — yyyy-MM-dd (уникален). `day` — подпись для best/worst. */
export type DynamicsChartDatum = { dateKey: string; value: number; day?: string }

type Size = 'compact' | 'comfortable' | 'detailed'

export const DYNAMICS_CHART_HEIGHT: Record<Size, number> = {
  compact: 104,
  comfortable: 148,
  detailed: 192,
}

const VB_W = 420

const PAD: Record<Size, { top: number; right: number; bottom: number; left: number }> = {
  compact: { top: 10, right: 10, bottom: 22, left: 34 },
  comfortable: { top: 12, right: 10, bottom: 26, left: 36 },
  detailed: { top: 14, right: 12, bottom: 30, left: 38 },
}

interface DynamicsMetricAreaChartProps {
  data: DynamicsChartDatum[]
  stroke: string
  metricLabel: string
  size?: Size
  tickFill?: string
  gridStroke?: string
  compactTimeAxis?: boolean
  className?: string
  locale?: string
}

function parseDateKey(dateKey: string): Date {
  return parse(dateKey, 'yyyy-MM-dd', new Date())
}

function buildPlotData(data: DynamicsChartDatum[]): DynamicsChartDatum[] {
  if (!data?.length) return []
  const rows = data.map((d) => ({
    ...d,
    value: normalizeScoreTo100(d.value as unknown),
  }))
  if (rows.length === 1) {
    const only = rows[0]
    const d0 = parseDateKey(only.dateKey)
    const d1 = addDays(d0, 1)
    return [
      { dateKey: only.dateKey, value: only.value, day: only.day },
      { dateKey: format(d1, 'yyyy-MM-dd'), value: only.value },
    ]
  }
  return rows
}

export function DynamicsMetricAreaChart({
  data,
  stroke,
  metricLabel,
  size = 'comfortable',
  tickFill = '#64748b',
  gridStroke = '#e2e8f0',
  compactTimeAxis = false,
  className,
  locale = 'en',
}: DynamicsMetricAreaChartProps) {
  const gradId = `dm-${useId().replace(/:/g, '')}`
  const dfLocale = locale === 'ru' ? ru : enUS
  const vbH = DYNAMICS_CHART_HEIGHT[size]
  const pad = PAD[size]
  const yTicks = size === 'compact' ? [0, 50, 100] : [0, 25, 50, 75, 100]

  const plotData = useMemo(() => buildPlotData(data), [data])

  const geometry = useMemo(() => {
    if (plotData.length === 0) return null
    const innerW = VB_W - pad.left - pad.right
    const innerH = vbH - pad.top - pad.bottom
    const n = plotData.length
    const denom = Math.max(n - 1, 1)

    const pts = plotData.map((d, i) => {
      const x = pad.left + (innerW * i) / denom
      const y = pad.top + innerH - (d.value / 100) * innerH
      return { x, y, d }
    })

    const lineD = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')

    const first = pts[0]
    const last = pts[pts.length - 1]
    const bottomY = pad.top + innerH
    const areaD = [
      `M ${first.x.toFixed(2)} ${bottomY.toFixed(2)}`,
      ...pts.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`),
      `L ${last.x.toFixed(2)} ${bottomY.toFixed(2)} Z`,
    ].join(' ')

    const gridLines = yTicks.map((t) => {
      const y = pad.top + innerH - (t / 100) * innerH
      return { t, y }
    })

    return { pts, lineD, areaD, gridLines, innerW, innerH, bottomY: pad.top + innerH }
  }, [plotData, pad, vbH, yTicks])

  if (!geometry || plotData.length === 0) {
    const h = DYNAMICS_CHART_HEIGHT[size]
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-lg bg-slate-100/60 text-xs text-slate-500 ${className ?? ''}`}
        style={{ minHeight: h, height: h }}
        aria-hidden
      >
        —
      </div>
    )
  }

  const { pts, lineD, areaD, gridLines } = geometry

  return (
    <div
      className={`w-full ${className ?? ''}`}
      style={{ height: `${vbH}px`, minHeight: `${vbH}px` }}
      role="img"
      aria-label={metricLabel}
    >
      <svg
        width="100%"
        height={vbH}
        viewBox={`0 0 ${VB_W} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        className="block max-w-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
            <stop offset="45%" stopColor={stroke} stopOpacity={0.14} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>

        {gridLines.map(({ t, y }) => (
          <line
            key={t}
            x1={pad.left}
            x2={VB_W - pad.right}
            y1={y}
            y2={y}
            stroke={gridStroke}
            strokeWidth={1}
            strokeDasharray="4 8"
            strokeOpacity={0.7}
          />
        ))}

        {yTicks.map((t) => {
          const y = pad.top + (vbH - pad.top - pad.bottom) - (t / 100) * (vbH - pad.top - pad.bottom)
          return (
            <text
              key={`y-${t}`}
              x={pad.left - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill={tickFill}
              fontSize={size === 'detailed' ? 11 : 10}
              fontWeight={500}
            >
              {t}
            </text>
          )
        })}

        <path d={areaD} fill={`url(#${gradId})`} stroke="none" />

        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          vectorEffect="nonScalingStroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={lineD}
        />

        {pts.map((p, i) => (
          <g key={`${p.d.dateKey}-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill={stroke}
              stroke="#fff"
              strokeWidth={1.5}
            >
              <title>
                {(() => {
                  try {
                    const dt = parseDateKey(p.d.dateKey)
                    return `${format(dt, 'EEE, d MMM', { locale: dfLocale })} — ${Math.round(p.d.value)} / 100 (${metricLabel})`
                  } catch {
                    return `${Math.round(p.d.value)}`
                  }
                })()}
              </title>
            </circle>
          </g>
        ))}

        {plotData.map((d, i) => {
          const x = pad.left + ((VB_W - pad.left - pad.right) * i) / Math.max(plotData.length - 1, 1)
          let label = ''
          try {
            const dt = parseDateKey(d.dateKey)
            label = format(dt, compactTimeAxis ? 'd MMM' : 'EEE', { locale: dfLocale })
          } catch {
            label = d.dateKey
          }
          return (
            <text
              key={`x-${d.dateKey}-${i}`}
              x={x}
              y={vbH - 6}
              textAnchor="middle"
              fill={tickFill}
              fontSize={compactTimeAxis ? 9 : 10}
              fontWeight={500}
              transform={compactTimeAxis ? `rotate(-22 ${x} ${vbH - 8})` : undefined}
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
