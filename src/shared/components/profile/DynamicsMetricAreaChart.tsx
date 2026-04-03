'use client'

import { useId, useLayoutEffect, useRef, useState, useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { addDays, format, parse } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'

/** `dateKey` is unique per day (yyyy-MM-dd). Optional `day` is a display label (e.g. for best/worst text). */
export type DynamicsChartDatum = { dateKey: string; value: number; day?: string }

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
  /** Used for axis / tooltip date formatting */
  locale?: string
}

function parseDateKey(dateKey: string): Date {
  return parse(dateKey, 'yyyy-MM-dd', new Date())
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
  const uid = useId().replace(/:/g, '')
  const gradId = `dm-fill-${uid}`
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)

  const dfLocale = locale === 'ru' ? ru : enUS
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

  const plotData = useMemo(() => {
    const rows = data
      .filter((d) => typeof d.value === 'number' && Number.isFinite(d.value))
      .map((d) => ({ ...d, value: d.value }))
    if (rows.length === 0) return []
    if (rows.length === 1) {
      const only = rows[0]
      const d0 = parseDateKey(only.dateKey)
      const d1 = addDays(d0, 1)
      return [
        { dateKey: only.dateKey, value: only.value },
        { dateKey: format(d1, 'yyyy-MM-dd'), value: only.value },
      ]
    }
    return rows
  }, [data])

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
    window.addEventListener('resize', measure)
    const t0 = window.setTimeout(measure, 0)
    const t1 = window.setTimeout(measure, 100)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const widthPx = Math.max(chartWidth, 280)

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-0 overflow-hidden block ${className ?? ''}`}
      style={{ height: `${heightPx}px`, minHeight: `${heightPx}px` }}
    >
      {plotData.length > 0 ? (
        <ComposedChart width={widthPx} height={heightPx} data={plotData} margin={margin}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.42} />
              <stop offset="40%" stopColor={stroke} stopOpacity={0.16} />
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
            dataKey="dateKey"
            tick={{ fontSize: compactTimeAxis ? xTickSize - 2 : xTickSize - 1, fill: tickFill, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            interval={xInterval as 0 | 'preserveStartEnd'}
            tickMargin={8}
            angle={xAngle}
            textAnchor={compactTimeAxis ? 'end' : 'middle'}
            height={xHeight}
            minTickGap={compactTimeAxis ? 4 : 10}
            tickFormatter={(v) => {
              try {
                const d = parseDateKey(String(v))
                return format(d, compactTimeAxis ? 'd MMM' : 'EEE', { locale: dfLocale })
              } catch {
                return String(v)
              }
            }}
          />
          <Tooltip
            cursor={{ stroke: stroke, strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.35 }}
            contentStyle={{
              borderRadius: '10px',
              fontSize: '12px',
              border: 'none',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.18)',
              padding: '10px 14px',
              background: '#1e293b',
              color: '#f8fafc',
            }}
            labelStyle={{
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '11px',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
            itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
            formatter={(value: number) => [`${Math.round(value)}`, metricLabel]}
            labelFormatter={(v) => {
              try {
                const d = parseDateKey(String(v))
                return format(d, 'EEE, d MMM', { locale: dfLocale })
              } catch {
                return String(v)
              }
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill={`url(#${gradId})`}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            dot={{ r: 3, fill: stroke, strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: stroke }}
            isAnimationActive={false}
          />
        </ComposedChart>
      ) : (
        <div
          className="flex h-full items-center justify-center rounded-lg bg-slate-100/60 text-xs text-slate-500"
          aria-hidden
        >
          —
        </div>
      )}
    </div>
  )
}
