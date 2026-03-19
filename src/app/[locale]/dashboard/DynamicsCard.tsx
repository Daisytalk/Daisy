'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

type Variant = 'dark' | 'light'

interface DynamicsCardProps {
  variant?: Variant
}

export function DynamicsCard({ variant = 'dark' }: DynamicsCardProps) {
  const t = useTranslations('profile')
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/dashboard/dynamics', { credentials: 'include' })
      .then(res => res.json())
      .then(res => {
        if (res.ratings) setData(res.ratings)
      })
  }, [])

  const isLight = variant === 'light'

  if (!data || data.length === 0) {
    return (
      <section>
        <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
          {t('dynamics.title')}
        </h2>
        <div className={`rounded-2xl p-8 text-center ${isLight ? 'bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#eee]' : 'bg-daisy-900/40 border border-daisy-800'}`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isLight ? 'bg-[#f5f5f5]' : 'bg-daisy-800/50'}`}>
            <span className="text-2xl">📊</span>
          </div>
          <p className={`text-[15px] ${isLight ? 'text-[#6b6b6b]' : 'text-daisy-400'}`}>
            {t('dynamics.noData')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-widest mb-3">
        {t('dynamics.title')}
      </h2>
      <div className={`rounded-2xl overflow-hidden ${isLight ? 'bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#eee]' : 'bg-daisy-900/50 border border-daisy-800 shadow-xl'}`}>
        <div className={`px-6 py-4 ${isLight ? 'bg-gradient-to-r from-[#fafafa] to-[#f5f5f5] border-b border-[#f0f0f0]' : 'border-b border-daisy-800'}`}>
          <span className={`text-sm font-semibold ${isLight ? 'text-[#2d2d2d]' : 'text-daisy-100'}`}>
            {t('dynamics.last7days')}
          </span>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-col gap-2">
            <div className={`text-[13px] font-medium ${isLight ? 'text-[#5a5a5a]' : 'text-daisy-300'}`}>
              1. {t('dynamics.emotion')}
            </div>
            <div className="flex items-end justify-between h-12 gap-1.5">
              {data.map((r, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-rose-400 to-rose-300 rounded-t-lg min-h-[6px] transition-all" style={{ height: `${Math.max(((r.emotion || 3) / 5) * 100, 12)}%` }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`text-[13px] font-medium ${isLight ? 'text-[#5a5a5a]' : 'text-daisy-300'}`}>
              2. {t('dynamics.stress')}
            </div>
            <div className="flex items-end justify-between h-12 gap-1.5">
              {data.map((r, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg min-h-[6px] transition-all" style={{ height: `${Math.max(((r.stress || 3) / 5) * 100, 12)}%` }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`text-[13px] font-medium ${isLight ? 'text-[#5a5a5a]' : 'text-daisy-300'}`}>
              3. {t('dynamics.energy')}
            </div>
            <div className="flex items-end justify-between h-12 gap-1.5">
              {data.map((r, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg min-h-[6px] transition-all" style={{ height: `${Math.max(((r.energy || 3) / 5) * 100, 12)}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
