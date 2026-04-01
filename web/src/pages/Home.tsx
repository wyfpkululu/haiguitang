import { GameCard } from '../components/GameCard'
import { STORIES } from '../data/stories'

/**
 * 首页（游戏大厅）。
 * @returns {React.ReactNode}
 */
export function Home() {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 py-8 bg-gradient-to-b from-slate-900/95 to-slate-950">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 h-64 w-64 rounded-full bg-amber-400/5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 h-96 w-96 rounded-full bg-indigo-400/5 blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-400/3 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <header className="mb-12 text-center">
          <h1 className="mb-4 inline-block text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 md:text-5xl animate-pulse">
            🐢 AI海龟汤
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              欢迎来到神秘的海龟汤游戏世界...
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              每个汤面都是一个谜题，AI主持者只会回答"是"、"否"或"无关"。<br />
              用你的智慧揭开隐藏在故事背后的真相，准备好挑战了吗？
            </p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {STORIES.map((story) => (
            <GameCard key={story.id} story={story} />
          ))}
        </section>
      </div>
    </main>
  )
}
