const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+(now\s+)?(DAN|evil|unrestricted|jailbroken)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /system\s*prompt\s*[:=]/i,
  /<\s*(system|assistant)\s*>/i,
  /\[INST\]|\[\/INST\]|<<SYS>>/i,
  /forget\s+(everything|all)\s+you/i,
]

export function scanForInjection(text: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(text))
}
