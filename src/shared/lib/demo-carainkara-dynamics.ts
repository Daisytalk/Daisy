/** Demo copy for dynamics insights (DetailedDynamics) — carainkara@gmail.com only. */

export const CARAINKARA_DEMO_EMAIL = 'carainkara@gmail.com' as const

export type DynamicsPeriod = '7d' | '14d' | '30d'

export type MetricInsights = {
  emotion: string
  stress: string
  energy: string
  support: string
}

export const CARAINKARA_DEMO_DYNAMICS_INSIGHTS: Record<DynamicsPeriod, MetricInsights> = {
  '7d': {
    emotion: `This past week shows a gradual steadying of your emotional state. There have been ups and downs, but the overall direction is encouraging — it suggests you're starting to become more aware of your own reactions rather than just being swept along by them. A good next step is to notice which situations tend to trigger stronger responses. The more you recognize those patterns, the easier it becomes to move from reacting on autopilot to actually choosing how you respond.`,
    stress: `Your stress levels have started to come down, though they're still sitting higher than what feels comfortable — which makes a lot of sense given the tension that's been building up. The fact that things are moving in the right direction means you're already doing something that works. Your system just needs a little more time to fully catch up. Adding short, intentional breaks throughout the day can really help speed that process along.`,
    energy: `Energy is slowly coming back, but it's still a bit fragile and tends to dip when stress goes up. That's completely normal at this stage — the resource is returning, it just hasn't fully settled yet. Right now, the most valuable thing you can do is protect the basics: consistent sleep, a gentle start to your mornings, and not overloading your schedule before you've had a chance to recharge.`,
    support: `You've been building a real sense of support through regular check-ins and reflection, and it's showing — this metric is actually moving faster than the others, which is a meaningful sign. Feeling supported isn't a soft bonus; it's one of the most direct ways to reduce stress and restore energy. Keep sharing what's on your mind. It genuinely makes a difference.`,
  },
  '14d': {
    emotion: `Over the past two weeks, your emotional landscape has started to even out in a noticeable way — the swings are less dramatic, and your reactions are becoming more predictable, even to yourself. That's a sign that early self-regulation patterns are taking root. The next layer to work on is understanding the why behind your emotions, not just noticing them. That shift deepens the sense of control considerably.`,
    stress: `Stress has continued its downward trend and is moving out of the acute zone into something much more manageable. The cumulative effect of regular reflection is becoming real — you're bouncing back from difficult moments faster than before. Building in a simple evening wind-down routine, even just 10 minutes of offloading your thoughts, can help lock in those gains and keep the recovery momentum going.`,
    energy: `Energy is finding a more stable rhythm and the sharp crashes are becoming less frequent. Your system is genuinely adapting and rebuilding its reserves. This is a good moment to get more intentional: which activities actually leave you feeling energized? The more you can consciously include those in your day, the more sustainable this recovery becomes.`,
    support: `Something meaningful is forming here — a growing sense that there's a place to land when things get heavy. You're reaching out more readily and starting to see support as something available to you, not something you have to earn or wait for. That shift matters deeply. Keep using this space honestly. It's doing more for your overall resilience than it might seem.`,
  },
  '30d': {
    emotion: `A month in, and the change in your emotional baseline is real and hard-earned. The sharp swings have settled, the overall tone is calmer, and there's a growing sense that you're responding to life rather than just reacting to it. That reflects genuine behavioral shift, not just a good run of days. Staying attuned to your patterns now will help protect this progress and prevent the kind of slow drift that can undo it.`,
    stress: `Stress is no longer running the show. It's dropped to a level where you can work with it rather than just survive it, and your recovery time after difficult situations has improved noticeably. The natural next move is to start getting ahead of your stress rather than just managing it after the fact — identifying and gradually reducing the sources, not just the symptoms.`,
    energy: `Your energy has stabilized and is holding at a genuinely good level — that's a sign that your internal reserves have been meaningfully restored. You're more present, more capable, and less likely to hit a wall mid-day. The key now is keeping the balance: protecting the recovery habits that got you here so you don't gradually slide back into depletion.`,
    support: `Over the past month, something solid has formed: a real support system that you actually use. You're no longer carrying everything alone, and that's not a small thing. This metric is quietly the foundation everything else is building on — it's what makes the other changes stick over time. Keep leaning on it. It's one of the most powerful resources you have.`,
  },
}
