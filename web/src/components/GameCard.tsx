import { useNavigate } from 'react-router-dom'
import type { TDifficulty, TStory } from '../types/models'

type TGameCardProps = {
  story: TStory
}

const DIFFICULTY_TEXT: Record<TDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const DIFFICULTY_COLORS: Record<TDifficulty, string> = {
  easy: 'from-emerald-400/20 to-emerald-600/20 border-emerald-400/50',
  medium: 'from-amber-400/20 to-amber-600/20 border-amber-400/50',
  hard: 'from-rose-400/20 to-rose-600/20 border-rose-400/50',
}

/**
 * 游戏卡片组件。
 * @param {TGameCardProps} props 组件参数
 * @returns {React.ReactNode}
 */
export function GameCard({ story }: TGameCardProps) {
  const navigate = useNavigate()

  /**
   * 点击卡片进入游戏页面。
   * @returns {void}
   */
  function handleClick() {
    navigate(`/game/${story.id}`)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
      className={`group cursor-pointer relative rounded-xl border p-6 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400/60 bg-gradient-to-br ${DIFFICULTY_COLORS[story.difficulty]}`}
      aria-label={`进入游戏：${story.title}`}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* 前置装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <header className="relative flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-slate-100 tracking-tight">{story.title}</h3>
        <span className="relative z-10 rounded-full border bg-black/30 backdrop-blur px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 shadow-lg">
          {DIFFICULTY_TEXT[story.difficulty]}
        </span>
      </header>

      <div className="relative mt-4">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400/20 to-transparent blur opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
        <p className="relative line-clamp-3 text-slate-300 leading-relaxed text-sm">
          {story.surface}
        </p>
      </div>

      {/* 悬停时的神秘感装饰 */}
      <div className="mt-4 relative flex items-center justify-between">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
        <div className="relative text-xs text-slate-500 font-medium flex items-center gap-1">
          <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></span>
          揭开真相
        </div>
        <div className="relative text-xs text-slate-500">
          点击进入 →
        </div>
      </div>
    </article>
  )
}
