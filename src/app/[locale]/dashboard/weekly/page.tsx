import { WeeklyReportCarousel } from './WeeklyReportCarousel'

export async function generateMetadata() {
  return {
    title: `Недельный отчет - Daisy`,
  }
}

export default function WeeklyReportPage({ params: { locale } }: { params: { locale: string } }) {
  return <WeeklyReportCarousel locale={locale} />
}
