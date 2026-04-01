import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChatBox } from '../components/ChatBox'
import { STORIES } from '../data/stories'
import type { TMessage } from '../types/models'

/**
 * 游戏页面。
 * @returns {React.ReactNode}
 */
export function Game() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<TMessage[]>([])

  const story = useMemo(
    () => STORIES.find((item) => item.id === id) ?? STORIES[0],
    [id],
  )

  /**
   * 查看汤底并进入结果页。
   * @returns {void}
   */
  function handleReveal(): void {
    navigate(`/result/${story.id}`, { state: { messages } })
  }

  /**
   * 结束游戏，返回大厅。
   * @returns {void}
   */
  function handleEndGame(): void {
    navigate('/')
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-3 sm:px-4 py-4 sm:py-6 animate-fadeIn">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-300 hover:text-amber-400 transition-all duration-300 hover:scale-105">
          ← 返回大厅
        </Link>
      </div>

      <section className="mb-4 sm:mb-6 rounded-lg border border-slate-700 bg-slate-800/70 p-3 sm:p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-slate-600">
        <h1 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold text-slate-100 transition-all duration-300 hover:text-amber-300">{story.title}</h1>
        <p className="leading-6 sm:leading-7 text-slate-200 transition-all duration-300 hover:text-slate-100">{story.surface}</p>
      </section>

      <div className="mb-4 sm:mb-6">
        <ChatBox story={story} messages={messages} onMessagesChange={setMessages} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handleEndGame}
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          结束游戏
        </button>
        <button
          type="button"
          onClick={handleReveal}
          className="rounded-lg border border-amber-400/60 bg-amber-500/10 px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-amber-300 hover:bg-amber-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          查看汤底
        </button>
      </div>
    </main>
  )
}
