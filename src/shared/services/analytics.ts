import { env } from '@/shared/config/env'

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

export interface IAnalyticsService {
  track(event: AnalyticsEvent): void
  pageView(path: string): void
}

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export class GoogleAnalyticsService implements IAnalyticsService {
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined' && env.GOOGLE_ANALYTICS_ID) {
      this.initializeGtag()
    }
  }

  private initializeGtag() {
    if (this.isInitialized) return

    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${env.GOOGLE_ANALYTICS_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', env.GOOGLE_ANALYTICS_ID)
    
    this.isInitialized = true
  }

  track(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      })
    }
  }

  pageView(path: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', env.GOOGLE_ANALYTICS_ID, {
        page_path: path,
      })
    }
  }
}