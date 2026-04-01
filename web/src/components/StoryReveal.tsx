import { useState, useEffect } from 'react'

type TStoryRevealProps = {
  bottom: string
}

/**
 * 汤底揭晓组件。
 * @param {TStoryRevealProps} props 组件参数
 * @returns {React.ReactNode}
 */
export function StoryReveal({ bottom }: TStoryRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    // 延迟显示，增加仪式感
    const timer = setTimeout(() => {
      setIsRevealed(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className={`rounded-lg border border-amber-400/30 bg-slate-800/70 p-5 shadow-lg transition-all duration-1000 ${isRevealed ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}>
      <h2 className={`mb-3 text-xl font-bold text-amber-400 transition-all duration-1000 delay-300 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>汤底揭晓</h2>
      <p className={`leading-7 text-slate-200 transition-all duration-1000 delay-500 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>{bottom}</p>
    </section>
  )
}
