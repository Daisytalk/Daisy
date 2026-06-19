/** Mirror of inference/generation.py clean_model_text for BFF-side history hygiene. */
const OCR_JUNK = /[\u00b4\u02c6\u00b8\u00ba\u017d\u017a\u0142\u015b]+/g
const CYR_ACUTE = /([а-яёА-ЯЁ])[\u00b4\u02c6\u00b8\u00ba\u017d\u017a\u0142\u015b]+(?=[а-яёА-ЯЁ])/g

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
  return t
}
