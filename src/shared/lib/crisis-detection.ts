const CRISIS_KEYWORDS = [
  // RU
  'суицид', 'самоубийств', 'убить себя', 'покончить с собой',
  'не хочу жить', 'устал жить', 'лучше бы меня не было',
  'не хочу просыпаться', 'хочу исчезнуть', 'надоело существовать',
  'жить не хочется', 'смысла нет жить', 'хочу умереть',
  // KZ
  'өлгім келеді', 'өмірден безді',
  // EN
  'suicide', 'kill myself', 'end my life', 'want to die',
  "don't want to live", 'no reason to live',
]

export const CRISIS_RESPONSE =
  'Я слышу тебя, и то, что ты сейчас чувствуешь — очень серьёзно. ' +
  'Пожалуйста, прямо сейчас позвони на линию психологической помощи: ' +
  '🇰🇿 Казахстан: 150 (круглосуточно, бесплатно). ' +
  'Я здесь и никуда не ухожу.'

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw))
}
