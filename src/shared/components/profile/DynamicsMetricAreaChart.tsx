'use client'

import { useId, useLayoutEffect, useRef, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

export type DynamicsChartDatum = { day: string; value: number }

type Size = 'compact' | 'comfortable' | 'detailed'

export const DYNAMICS_CHART_HEIGHT: Record<Size, number> = {
  compact: 104,
  comfortable: 148,
  detailed: 192,
}

const SIZE_HEIGHT = DYNAMICS_CHART_HEIGHT

const MARGINS: Record<Size, { top: number; right: number; left: number; bottom: number }> = {
  compact: { top: 10, right: 4, left: 0, bottom: 4 },
  comfortable: { top: 12, right: 6, left: 2, bottom: 6 },
  detailed: { top: 14, right: 10, left: 4, bottom: 8 },
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
}: DynamicsMetricAreaChartProps) {
  const uid = useId().replace(/:/g, '')
  const gradId = `dm-fill-${uid}`
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)

  const heightPx = SIZE_HEIGHT[size]
  const margin = {
    ...MARGINS[size],
    bottom: compactTimeAxis ? Math.max(MARGINS[size].bottom, 16) : MARGINS[size].bottom,
  }
  const yTicks = size === 'compact' ? [0, 50, 100] : [0, 25, 50, 75, 100]
  const xTickSize = size === 'detailed' ? 11 : 10
  const xInterval = compactTimeAxis ? 'preserveStartEnd' : 0
  const xAngle = compactTimeAxis ? -28 : 0
  const xHeight = compactTimeAxis ? 38 : undefined

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const w = Math.max(0, Math.floor(el.getBoundingClientRect().width))
      if (w > 0) setChartWidth(w)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const chart = chartWidth > 0 && (
    <AreaChart width={chartWidth} height={heightPx} data={data} margin={margin}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
          <stop offset="35%" stopColor={stroke} stopOpacity={0.18} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid
        stroke={gridStroke}
        strokeDasharray="4 8"
        strokeOpacity={0.65}
        vertical={false}
        horizontal
      />
      <YAxis
        domain={[0, 100]}
        ticks={yTicks}
        tick={{ fontSize: xTickSize - 2, fill: tickFill, fontWeight: 500 }}
        tickFormatter={(v) => `${v}`}
        axisLine={false}
        tickLine={false}
        width={size === 'detailed' ? 38 : 34}
      />
      <XAxis
        dataKey="day"
        tick={{ fontSize: compactTimeAxis ? xTickSize - 2 : xTickSize - 1, fill: tickFill, fontWeight: 500 }}
        axisLine={false}
        tickLine={false}
        interval={xInterval as 0 | 'preserveStartEnd'}
        tickMargin={8}
        angle={xAngle}
        textAnchor={compactTimeAxis ? 'end' : 'middle'}
        height={xHeight}
        minTickGap={compactTimeAxis ? 4 : 10}
      />
      <Tooltip
        cursor={{ stroke: stroke, strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }}
        contentStyle={{
          borderRadius: '10px',
          fontSize: '12px',
          border: 'none',
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.18)',
          padding: '10px 14px',
          background: '#1e293b',
          color: '#f8fafc',
        }}
        labelStyle={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
        formatter={(value: number) => [`${Math.round(value)}`, metricLabel]}
        labelFormatter={(label) => String(label)}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke={stroke}
        strokeWidth={2.25}
        fill={`url(#${gradId})`}
        dot={false}
        activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: stroke }}
        isAnimationActive={false}
      />
    </AreaChart>
  )

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-[200px] block ${className ?? ''}`}
      style={{ height: `${heightPx}px`, minHeight: `${heightPx}px` }}
    >
      {chartWidth > 0 ? (
        chart
      ) : (
        <div
          className="absolute inset-0 rounded-lg bg-gradient-to-b from-slate-100/80 to-slate-50/50"
          aria-hidden
        />
      )}
    </div>
  )
}
