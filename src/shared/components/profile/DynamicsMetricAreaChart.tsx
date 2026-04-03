'use client'

import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type DynamicsChartDatum = { day: string; value: number }

type Size = 'compact' | 'comfortable' | 'detailed'

export const DYNAMICS_CHART_HEIGHT: Record<Size, number> = {
  compact: 104,
  comfortable: 132,
  detailed: 176,
}

const SIZE_HEIGHT = DYNAMICS_CHART_HEIGHT

const MARGINS: Record<Size, { top: number; right: number; left: number; bottom: number }> = {
  compact: { top: 8, right: 6, left: -4, bottom: 2 },
  comfortable: { top: 10, right: 8, left: -2, bottom: 4 },
  detailed: { top: 12, right: 12, left: 0, bottom: 6 },
}

interface DynamicsMetricAreaChartProps {
  data: DynamicsChartDatum[]
  stroke: string
  metricLabel: string
  size?: Size
  tickFill?: string
  gridStroke?: string
  /** Many daily points: fewer X labels so the axis stays readable (e.g. 30d view). */
  compactTimeAxis?: boolean
  className?: string
}

export function DynamicsMetricAreaChart({
  data,
  stroke,
  metricLabel,
  size = 'comfortable',
  tickFill = '#94a3b8',
  gridStroke = '#e8e8ec',
  compactTimeAxis = false,
  className,
}: DynamicsMetricAreaChartProps) {
  const uid = useId().replace(/:/g, '')
  const gradId = `dm-fill-${uid}`

  const height = SIZE_HEIGHT[size]
  const margin = {
    ...MARGINS[size],
    bottom: compactTimeAxis ? Math.max(MARGINS[size].bottom, 14) : MARGINS[size].bottom,
  }
  const yTicks = size === 'compact' ? [0, 50, 100] : [0, 25, 50, 75, 100]
  const xTickSize = size === 'detailed' ? 11 : 10
  const xInterval = compactTimeAxis ? 'preserveStartEnd' : 0
  const xAngle = compactTimeAxis ? -32 : 0
  const xHeight = compactTimeAxis ? 36 : undefined

  // Use numeric height on ResponsiveContainer — height="100%" often resolves to 0 in
  // flex/grid (min-height:auto + shrink), which produces empty chart areas.
  return (
    <div
      className={`relative w-full min-w-0 shrink-0 overflow-visible ${className ?? ''}`}
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    >
      <ResponsiveContainer width="100%" height={height} debounce={32}>
        <AreaChart data={data} margin={margin}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.38} />
              <stop offset="38%" stopColor={stroke} stopOpacity={0.14} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={gridStroke}
            strokeDasharray="3 6"
            strokeOpacity={0.55}
            vertical
            horizontal
          />
          <YAxis
            domain={[0, 100]}
            ticks={yTicks}
            tick={{ fontSize: xTickSize - 1, fill: tickFill, fontWeight: 600 }}
            tickFormatter={(v) => `${v}`}
            axisLine={false}
            tickLine={false}
            width={size === 'detailed' ? 36 : 32}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: compactTimeAxis ? xTickSize - 1 : xTickSize, fill: tickFill, fontWeight: 500 }}
            axisLine={{ stroke: gridStroke, strokeOpacity: 0.65 }}
            tickLine={false}
            interval={xInterval as 0 | 'preserveStartEnd'}
            tickMargin={6}
            angle={xAngle}
            textAnchor={compactTimeAxis ? 'end' : 'middle'}
            height={xHeight}
            minTickGap={compactTimeAxis ? 4 : 8}
          />
          <Tooltip
            cursor={{ stroke: stroke, strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.55 }}
            contentStyle={{
              borderRadius: '12px',
              fontSize: '13px',
              border: `1px solid ${stroke}33`,
              boxShadow: '0 10px 40px rgba(15, 23, 42, 0.14)',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: '#475569', fontWeight: 700, fontSize: '12px', marginBottom: 6, letterSpacing: '0.02em' }}
            itemStyle={{ color: '#0f172a', fontWeight: 600 }}
            formatter={(value: number) => [`${Math.round(value)} / 100`, metricLabel]}
            labelFormatter={(label) => String(label)}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={size === 'detailed' ? 2.35 : 2.1}
            fill={`url(#${gradId})`}
            dot={{ fill: stroke, strokeWidth: 0, r: size === 'compact' ? 2.5 : 3 }}
            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: stroke }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
