const monthsRu: Record<string, string> = {
  January: 'Январь',
  February: 'Февраль',
  March: 'Март',
  April: 'Апрель',
  May: 'Май',
  June: 'Июнь',
  July: 'Июль',
  August: 'Август',
  September: 'Сентябрь',
  October: 'Октябрь',
  November: 'Ноябрь',
  December: 'Декабрь',
}

/** "June, 2024" to "Июнь, 2024" for ru locale */
export function localizeDate(date: string, locale: string): string {
  if (locale !== 'ru') return date
  return date.replace(/^([A-Za-z]+)/, (m) => monthsRu[m] ?? m)
}

/** "12 min read" to "12 мин чтения" for ru locale */
export function localizeReadTime(readTime: string, locale: string): string {
  if (locale !== 'ru') return readTime
  return readTime.replace(/(\d+)\s*min read/, '$1 мин чтения')
}
