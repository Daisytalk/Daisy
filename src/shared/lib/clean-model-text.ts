/** Mirror of inference/generation.py clean_model_text for BFF-side history hygiene. */
const OCR_JUNK = /[\u00b4\u02c6\u00b8\u00ba\u017d\u017a\u0142\u015b]+/g
const CYR_ACUTE = /([а-яёА-ЯЁ])[\u00b4\u02c6\u00b8\u00ba\u017d\u017a\u0142\u015b]+(?=[а-яёА-ЯЁ])/g
const SPACED_PUNCT_GARBAGE = /(?:[?:]\s*[.?:]\s*){2,}/g
const TRAILING_EMOJI_PUNCT = /([\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2764\uFE0F\u2665\u2661]+)\s*[.?!…]+\s*$/u

export function cleanModelText(text: string): string {
  if (!text?.trim()) return text
  let t = text.trim()
  t = t.replace(CYR_ACUTE, '$1 ')
  t = t.replace(OCR_JUNK, ' ')
  if (/[а-яёА-ЯЁ]/.test(t)) {
    t = t.replace(/\u3002/g, '.').replace(/\uff0c/g, ',').replace(/\uff1f/g, '?').replace(/\uff01/g, '!')
  }
  t = t.replace(/\s+/g, ' ').trim()
  t = t.replace(/([.?!…]){2,}/g, '$1')
  if (SPACED_PUNCT_GARBAGE.test(t)) {
    t = t.replace(SPACED_PUNCT_GARBAGE, '?').replace(/\s+/g, ' ').trim()
  }
  if (TRAILING_EMOJI_PUNCT.test(t)) {
    t = t.replace(TRAILING_EMOJI_PUNCT, '$1').trim()
  }
  return t
}

export type HistoryTurn = { role: string; content: string }

/** Clean assistant turns before sending to AML so polluted DB rows do not re-enter the prompt. */
export function sanitizeHistoryForModel(history: HistoryTurn[]): HistoryTurn[] {
  return history.map((msg) =>
    msg.role === 'assistant' ? { ...msg, content: cleanModelText(msg.content) } : msg
  )
}
