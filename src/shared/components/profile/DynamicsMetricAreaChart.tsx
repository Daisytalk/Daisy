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

const SIZE_HEIGHT: Record<Size, number> = {
  compact: 104,
  comfortable: 132,
  detailed: 176,
}

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
}

export function DynamicsMetricAreaChart({
  data,
  stroke,
  metricLabel,
  size = 'comfortable',
  tickFill = '#94a3b8',
  gridStroke = '#e8e8ec',
  compactTimeAxis = false,
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={margin}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
            <stop offset="45%" stopColor={stroke} stopOpacity={0.12} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke={gridStroke}
          strokeDasharray="4 4"
          vertical={false}
          horizontal
        />
        <YAxis
          domain={[0, 100]}
          ticks={yTicks}
          tick={{ fontSize: xTickSize - 1, fill: tickFill, fontWeight: 500 }}
          tickFormatter={(v) => `${v}`}
          axisLine={false}
          tickLine={false}
          width={size === 'detailed' ? 34 : 30}
        />
        <XAxis
          dataKey="day"
          tick={{ fontSize: compactTimeAxis ? xTickSize - 1 : xTickSize, fill: tickFill }}
          axisLine={false}
          tickLine={false}
          interval={xInterval as 0 | 'preserveStartEnd'}
          tickMargin={6}
          angle={xAngle}
          textAnchor={compactTimeAxis ? 'end' : 'middle'}
          height={xHeight}
          minTickGap={compactTimeAxis ? 4 : 8}
        />
        <Tooltip
          cursor={{ stroke: stroke, strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.6 }}
          contentStyle={{
            borderRadius: '14px',
            fontSize: '13px',
            border: '1px solid #eef0f4',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(8px)',
          }}
          labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: 4 }}
          formatter={(value: number) => [`${Math.round(value)}`, metricLabel]}
          labelFormatter={(label) => String(label)}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={size === 'detailed' ? 2.25 : 2}
          fill={`url(#${gradId})`}
          dot={{ fill: stroke, strokeWidth: 0, r: size === 'compact' ? 2.5 : 3 }}
          activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: stroke }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
