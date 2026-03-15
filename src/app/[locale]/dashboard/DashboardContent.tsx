'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Wind, PlusCircle, BarChart2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { DailyCheckinModal } from './DailyCheckinModal'
import { DynamicsCard } from './DynamicsCard'

interface ProfileMetrics {
  emotionalStability: number
  stressLevel: number
  support: number
  resource: number
}

function getStatusLabel(score: number) {
  if (score < 1.9) return "Очень тяжело"
  if (score < 2.7) return "Бывает тяжело"
  if (score < 3.5) return "По-разному"
  if (score < 4.3) return "Постепенно стабилизируется"
  return "Чувствуешь устойчивость"
}

function getStatusEmoji(score: number) {
  if (score < 1.9) return "🌧️"
  if (score < 2.7) return "🍂"
  if (score < 3.5) return "🌤️"
  if (score < 4.3) return "🌱"
  return "☀️"
}

export function DashboardContent() {
  const t = useTranslations('Dashboard')
  const [metrics, setMetrics] = useState<ProfileMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCheckin, setShowCheckin] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setMetrics(data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-center text-daisy-400">Loading profile...</div>
  // if (!metrics) return null // Let it render the checkin at least if metrics fail
  
  return (
    <div className="max-w-xl mx-auto space-y-6 pt-6 px-4 pb-20">
      <div className="space-y-2 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-serif text-daisy-100">Мой профиль сейчас</h1>
          <p className="text-sm text-daisy-400">Обновляется после каждого разговора</p>
        </div>
        <button 
          onClick={() => setShowCheckin(true)}
          className="bg-daisy-800/80 hover:bg-daisy-700 text-daisy-300 text-xs py-2 px-3 flex items-center gap-1 rounded-xl transition"
        >
          <PlusCircle size={14} /> Чек-ин
        </button>
      </div>

      <DynamicsCard />

      {metrics && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif text-daisy-100 mt-6 mb-2">📊 Текущий статус</h2>
          {/* Emotional Stability */}
          <div className="rounded-xl p-5 bg-daisy-900/50 border border-daisy-800 backdrop-blur-sm shadow-xl flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-medium tracking-wide text-daisy-400 uppercase">
              <span className="flex items-center gap-2">🌸 Эмоциональная устойчивость</span>
              <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={12} /> растёт
              </span>
            </div>
            <p className="text-lg font-serif mt-2 flex items-center gap-2 text-daisy-100">
              {getStatusEmoji(metrics.emotionalStability)} {getStatusLabel(metrics.emotionalStability)}
            </p>
            <div className="h-2 w-full bg-daisy-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${(metrics.emotionalStability / 5) * 100}%` }} />
            </div>
          </div>

          {/* Stress */}
          <div className="rounded-xl p-5 bg-daisy-900/50 border border-daisy-800 backdrop-blur-sm shadow-xl flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-medium tracking-wide text-daisy-400 uppercase">
              <span className="flex items-center gap-2">⚡ Уровень стресса</span>
              <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1">
                <ArrowDownRight size={12} /> снижается
              </span>
            </div>
            <p className="text-lg font-serif mt-2 flex items-center gap-2 text-daisy-100">
               {getStatusEmoji(metrics.stressLevel)} {getStatusLabel(metrics.stressLevel)}
            </p>
            <div className="h-2 w-full bg-daisy-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${(metrics.stressLevel / 5) * 100}%` }} />
            </div>
          </div>

          {/* Support */}
          <div className="rounded-xl p-5 bg-daisy-900/50 border border-daisy-800 backdrop-blur-sm shadow-xl flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-medium tracking-wide text-daisy-400 uppercase">
              <span className="flex items-center gap-2">🤝 Поддержка</span>
            </div>
            <p className="text-lg font-serif mt-2 flex items-center gap-2 text-daisy-100">
               {getStatusEmoji(metrics.support)} {getStatusLabel(metrics.support)}
            </p>
            <div className="h-2 w-full bg-daisy-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(metrics.support / 5) * 100}%` }} />
            </div>
          </div>
          
          {/* Resource */}
          <div className="rounded-xl p-5 bg-daisy-900/50 border border-daisy-800 backdrop-blur-sm shadow-xl flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-medium tracking-wide text-daisy-400 uppercase">
              <span className="flex items-center gap-2">🌿 Ресурс</span>
            </div>
            <p className="text-lg font-serif mt-2 flex items-center gap-2 text-daisy-100">
               {getStatusEmoji(metrics.resource)} {getStatusLabel(metrics.resource)}
            </p>
            <div className="h-2 w-full bg-daisy-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${(metrics.resource / 5) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {metrics && (
        <div className="rounded-xl p-6 bg-gradient-to-br from-daisy-800/30 to-daisy-900/30 border border-daisy-700 mt-6 relative overflow-hidden">
          <Wind className="absolute top-2 right-2 w-24 h-24 text-daisy-800/20" />
          <h3 className="text-xs tracking-wider text-daisy-400 font-semibold mb-3 uppercase">Daisy замечает</h3>
          <p className="text-daisy-200 text-sm leading-relaxed italic pr-6 relative z-10">
            "Твой уровень ресурса и устойчивости растет — это уже движение вперёд. Поддержки пока не хватает — поработаем над этим вместе."
          </p>
        </div>
      )}

      <div className="pt-4 pb-6">
        <button className="w-full bg-daisy-500 hover:bg-daisy-600 text-daisy-950 font-medium py-4 rounded-2xl shadow-lg transition-colors mb-4">
          ☀️ Посмотреть рекомендации
        </button>
        <Link 
          href={`dashboard/weekly`}
          className="flex w-full bg-daisy-800/50 border border-daisy-700 hover:bg-daisy-800 text-daisy-200 font-medium py-4 rounded-2xl shadow-lg transition-colors justify-center items-center gap-2"
        >
          <BarChart2 size={18} /> Недельный отчёт
        </Link>
      </div>

      {showCheckin && (
        <DailyCheckinModal 
          onClose={() => setShowCheckin(false)} 
          onSuccess={() => {
            setShowCheckin(false)
            // Ideally trigger a refresh of DynamicsCard
            window.location.reload()
          }} 
        />
      )}
    </div>
  )
}
