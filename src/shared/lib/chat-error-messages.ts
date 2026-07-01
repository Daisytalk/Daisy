import type { DaisyLocale } from '@/shared/lib/daisy-integration'

const ASYNC_CHAT_ERROR: Record<DaisyLocale, string> = {
  en: "Sorry, something went wrong while processing your message. Please try again.",
  ru: "Извини, произошла ошибка при обработке сообщения. Попробуй ещё раз.",
  kk: "Кешіріңіз, хабарламаны өңдеу кезінде қате орын алды. Қайта көріңіз.",
}

/** User-visible message when background AML chat fails (matches UI locale). */
export function asyncChatErrorMessage(locale?: DaisyLocale | null): string {
  if (locale === 'ru' || locale === 'kk' || locale === 'en') {
    return ASYNC_CHAT_ERROR[locale]
  }
  return ASYNC_CHAT_ERROR.en
}
