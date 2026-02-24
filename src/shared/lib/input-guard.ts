/** Remove zero-width and invisible Unicode chars, collapse extra whitespace */
function normalize(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '') // zero-width, soft-hyphen
    .replace(/\s+/g, ' ')                          // collapse multi-space / "i g n o r e"
    .trim()
}

const INJECTION_PATTERNS = [
  // EN — ignore instructions
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  // RU — игнорируй / проигнорируй инструкции
  /игнорир[уи]\w*\s+(все\s+)?(предыдущие|прошлые|ранее\s+данные)\s+инструкции/i,

  // EN — you are DAN / evil / unrestricted
  /you\s+are\s+(now\s+)?(DAN|evil|unrestricted|jailbroken)/i,
  // RU — ты теперь / ты являешься
  /ты\s+(теперь|сейчас|являешься)\s+(DAN|злой|без\s*ограничений|взломан)/i,

  // EN — pretend to be <unrestricted AI> (narrowed to avoid "pretend to be okay")
  /pretend\s+(to\s+be|you\s+are)\s+(an?\s+)?(AI|evil|unrestricted|DAN|malicious|jailbroken)/i,
  // RU — притворись что ты <AI без ограничений>
  /притворись\s+(что\s+ты|быть)\s+(AI|злым|без\s*ограничений|взломан)/i,

  // EN — system prompt:
  /system\s*prompt\s*[:=]/i,
  // RU — системный промпт:
  /системн\w+\s+промпт\s*[:=]/i,

  // HTML/LLM tags
  /<\s*(system|assistant)\s*>/i,
  /\[INST\]|\[\/INST\]|<<SYS>>|<\/SYS>/i,

  // EN — forget everything you've been told (narrowed: requires "told" or "learned")
  /forget\s+(everything|all)\s+you('ve)?\s+(been\s+told|learned|know)/i,
  // RU — забудь всё что тебе говорили / что ты знаешь
  /забудь\s+(всё|все)\s+(что\s+тебе\s+(говорили|сказали|велели)|что\s+ты\s+знаешь)/i,
]

export function scanForInjection(text: string): boolean {
  const clean = normalize(text)
  return INJECTION_PATTERNS.some(p => p.test(clean))
}
