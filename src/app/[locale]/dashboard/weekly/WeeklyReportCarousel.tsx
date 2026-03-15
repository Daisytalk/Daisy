'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'

interface ReportData {
  weekDates: string
  summary: string
  backgroundTheme: 'heavy' | 'medium' | 'good'
  chart: { day: string; value: number }[]
  topics: string[]
  recommendations: { title: string; description: string }[]
}

export function WeeklyReportCarousel({ locale }: { locale: string }) {
  const [data, setData] = useState<ReportData | null>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    fetch('/api/dashboard/weekly')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setData(data)
      })
  }, [])

  if (!data) return <div className="p-8 text-center text-daisy-400">Loading your weekly insights...</div>

  // Screen components
  const screens = [
    // Screen 1: Cover
    <div key="s1" className="flex flex-col h-full items-center justify-center text-center px-6">
      <h2 className="text-3xl font-serif text-daisy-100 mb-2">Обложка отчёта</h2>
      <p className="text-daisy-400 font-medium mb-12">Твоя неделя, Алия<br/>{data.weekDates}</p>
      
      <div className="bg-daisy-900/50 backdrop-blur-md border border-daisy-800 p-8 rounded-[2rem] shadow-2xl relative">
        <div className="absolute -top-6 -right-6 text-6xl opacity-20">🤍</div>
        <p className="text-xl font-serif leading-relaxed text-daisy-200">
          {data.summary}
        </p>
      </div>
    </div>,

    // Screen 2: Pulse (Wave chart)
    <div key="s2" className="flex flex-col h-full px-6 pt-12">
      <h2 className="text-2xl font-serif text-daisy-100 mb-2">Общий пульс недели</h2>
      <p className="text-daisy-400 text-sm mb-8">Как менялось твоё состояние</p>
      
      <div className="flex-1 bg-daisy-900/40 rounded-3xl p-6 border border-daisy-800 flex flex-col justify-center">
        <div className="h-48 relative flex items-end justify-between gap-1">
          {data.chart.map((pt, i) => (
            <div key={i} className="flex flex-col items-center gap-3 h-full justify-end flex-1">
              <span className="text-xs text-daisy-500">{pt.day}</span>
              <div 
                className={`w-full max-w-sm rounded-t-full relative group transition-all duration-700
                  ${pt.value > 4 ? 'bg-green-400/50' : pt.value > 2.5 ? 'bg-yellow-400/50' : 'bg-blue-400/50'}
                `}
                style={{ height: `${(pt.value / 5) * 100}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-daisy-800 text-xs px-2 py-1 flex items-center gap-1 rounded shadow-lg text-daisy-200 pointer-events-none transition">
                  {pt.value.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-daisy-900 p-4 rounded-xl border border-daisy-800 shadow-sm text-center">
            <span className="text-xs uppercase tracking-wide text-yellow-500 mb-1 block">Самый лёгкий день</span>
            <span className="font-medium text-daisy-200">Среда</span>
          </div>
          <div className="bg-daisy-900 p-4 rounded-xl border border-daisy-800 shadow-sm text-center">
            <span className="text-xs uppercase tracking-wide text-blue-400 mb-1 block">Самый тяжелый день</span>
            <span className="font-medium text-daisy-200">Понедельник</span>
          </div>
        </div>
      </div>
    </div>,

    // Screen 3: Topics Bubble list
    <div key="s3" className="flex flex-col h-full px-6 pt-12">
      <h2 className="text-2xl font-serif text-daisy-100 mb-2">О чём ты говорила</h2>
      <p className="text-daisy-400 text-sm mb-8">Чаще всего в разговорах появлялось:</p>

      <div className="space-y-4 flex-1">
        {data.topics.map((t, i) => (
          <div key={i} className="bg-daisy-900/60 border border-daisy-800 p-5 rounded-2xl flex items-center gap-4 text-daisy-200 shadow-lg">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `hsla(${i*40 + 20}, 70%, 20%, 0.5)`}}>💭</div>
            <span className="font-medium text-lg">{t}</span>
          </div>
        ))}

        <div className="mt-8 bg-daisy-800/30 border border-daisy-700/50 p-6 rounded-[2rem] text-center italic text-daisy-300 shadow-2xl">
          <MessageCircle className="mx-auto w-6 h-6 mb-3 text-daisy-500 opacity-50" />
          "Ты много думала о других и совсем мало о себе."
        </div>
      </div>
    </div>,

    // Screen 4: 3 Recommendations
    <div key="s4" className="flex flex-col h-full px-6 pt-12 overflow-y-auto pb-24">
      <h2 className="text-2xl font-serif text-daisy-100 mb-2">Три рекомендации</h2>
      <p className="text-daisy-400 text-sm mb-6">На основе твоей недели</p>

      <div className="space-y-6">
        {data.recommendations.map((r, i) => (
          <div key={i} className="border-l-4 border-daisy-600 pl-4 bg-gradient-to-r from-daisy-900/50 to-transparent p-4 rounded-r-xl">
            <span className="text-daisy-500 font-bold mb-1 block">Шаг {i+1}</span>
            <h4 className="text-lg font-medium text-daisy-200 mb-2">{r.title}</h4>
            <p className="text-sm text-daisy-400 leading-relaxed">{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  ]

  return (
    <div className="h-screen bg-daisy-950 flex flex-col relative overflow-hidden">
      {/* Dynamic Backgrounds per step */}
      <div className="absolute inset-0 pointer-events-none transition-colors duration-1000" style={{
        background: step === 0 ? 'radial-gradient(circle at top, rgba(80, 50, 40, 0.4) 0%, transparent 70%)' :
                    step === 1 ? 'radial-gradient(circle at top, rgba(40, 60, 80, 0.4) 0%, transparent 70%)' :
                    step === 2 ? 'radial-gradient(circle at top, rgba(80, 40, 60, 0.4) 0%, transparent 70%)' :
                    'radial-gradient(circle at top, rgba(40, 80, 60, 0.4) 0%, transparent 70%)'
      }} />

      {/* Top Navbar */}
      <div className="flex justify-between items-center p-6 relative z-10 shrink-0">
        <Link href={`/${locale}/dashboard`} className="w-10 h-10 border border-daisy-800 rounded-full flex items-center justify-center text-daisy-400 hover:text-daisy-200 hover:bg-daisy-900 transition flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-daisy-500 font-medium tracking-widest text-sm uppercase">Daisy Weekly</span>
        <div className="w-10" />
      </div>

      {/* Screens Slider */}
      <div className="flex-1 relative z-10 w-full mb-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {screens[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom Nav */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-center">
        {/* Step dots */}
        <div className="flex gap-2">
          {screens.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-daisy-400' : 'w-2 bg-daisy-800'}`} />
          ))}
        </div>

        {/* Next Button */}
        {step < screens.length - 1 ? (
          <button 
            onClick={() => setStep(step + 1)}
            className="bg-daisy-100 hover:bg-white text-daisy-950 px-5 py-3 rounded-2xl flex items-center gap-2 font-medium shadow-xl transition-all active:scale-95"
          >
            Дальше <ChevronRight size={18} />
          </button>
        ) : (
          <Link 
            href={`/${locale}/dashboard`}
            className="bg-green-400/20 text-green-300 border border-green-500/30 px-6 py-3 rounded-2xl flex items-center gap-2 font-medium shadow-xl transition-all active:scale-95 hover:bg-green-400/30"
          >
            Завершить обзор <Star size={16} fill="currentColor" />
          </Link>
        )}
      </div>
    </div>
  )
}
