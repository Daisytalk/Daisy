'use client'

import { useEffect, useState } from 'react'

export function DynamicsCard() {
  const [data, setData] = useState<any[]>([])
  
  useEffect(() => {
    fetch('/api/dashboard/dynamics')
      .then(res => res.json())
      .then(res => {
        if (res.ratings) setData(res.ratings)
      })
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl p-6 bg-daisy-900/40 border border-daisy-800 backdrop-blur-sm mt-6 text-center">
        <h3 className="text-daisy-300 mb-2">Обновлённая карточка "Моя динамика"</h3>
        <p className="text-daisy-400 text-sm">Здесь появятся графики после ваших ежедневных чекинов.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-5 bg-daisy-900/50 border border-daisy-800 backdrop-blur-sm shadow-xl flex flex-col gap-4 mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-serif text-daisy-100 flex items-center gap-2">📈 Моя динамика</h2>
        <span className="text-xs text-daisy-400">За последние 7 дней</span>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-daisy-300 font-medium">1. Эмоциональное состояние</div>
          <div className="flex items-end justify-between h-10 gap-1 opacity-70">
            {data.map((r, i) => (
              <div key={i} className="flex-1 bg-red-400 rounded-t-sm" style={{ height: `${((r.emotion || 3) / 5) * 100}%` }} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs text-daisy-300 font-medium">2. Уровень стресса</div>
          <div className="flex items-end justify-between h-10 gap-1 opacity-70">
             {data.map((r, i) => (
              <div key={i} className="flex-1 bg-blue-400 rounded-t-sm" style={{ height: `${((r.stress || 3) / 5) * 100}%` }} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs text-daisy-300 font-medium">3. Энергия</div>
          <div className="flex items-end justify-between h-10 gap-1 opacity-70">
             {data.map((r, i) => (
              <div key={i} className="flex-1 bg-green-400 rounded-t-sm" style={{ height: `${((r.energy || 3) / 5) * 100}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
