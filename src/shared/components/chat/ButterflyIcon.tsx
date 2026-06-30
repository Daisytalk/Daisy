const wing =
  'absolute border-2 border-purple-900 bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500'

export function ButterflyIcon({ size = 72 }: { size?: number }) {
  return (
    <span
      className="relative inline-block [perspective:140px]"
      style={{ width: size, height: size }}
      role="img"
      aria-hidden
    >
      <span className="absolute left-[46%] top-[14%] h-[10%] w-[22%] -rotate-[28deg] rounded-t-full border-t-2 border-purple-900" />
      <span className="absolute left-[54%] top-[14%] h-[10%] w-[22%] rotate-[28deg] rounded-t-full border-t-2 border-purple-900" />

      <span
        className={`${wing} left-[6%] top-[26%] h-[34%] w-[40%] rounded-[62%_38%_58%_42%] animate-wing-left`}
        style={{ transformOrigin: '100% 58%' }}
      />
      <span
        className={`${wing} right-[6%] top-[26%] h-[34%] w-[40%] rounded-[38%_62%_42%_58%] animate-wing-right`}
        style={{ transformOrigin: '0% 58%' }}
      />
      <span
        className={`${wing} left-[10%] top-[48%] h-[30%] w-[36%] rounded-[58%_42%_68%_32%] animate-wing-left [animation-delay:40ms]`}
        style={{ transformOrigin: '100% 42%' }}
      />
      <span
        className={`${wing} right-[10%] top-[48%] h-[30%] w-[36%] rounded-[42%_58%_32%_68%] animate-wing-right [animation-delay:40ms]`}
        style={{ transformOrigin: '0% 42%' }}
      />

      <span className="absolute left-[47%] top-[24%] h-[3.5%] w-[3.5%] rounded-full bg-purple-900" />
      <span className="absolute left-[62%] top-[58%] h-[3.5%] w-[3.5%] rounded-full bg-purple-900" />
      <span className="absolute left-[35%] top-[58%] h-[3.5%] w-[3.5%] rounded-full bg-purple-900" />

      <span className="absolute left-1/2 top-[22%] h-[48%] w-[11%] -translate-x-1/2 rounded-full bg-purple-900" />
    </span>
  )
}
