import { Link, useLocation, useParams } from 'react-router-dom'
import { Message } from '../components/Message'
import { StoryReveal } from '../components/StoryReveal'
import { STORIES } from '../data/stories'
import type { TMessage } from '../types/models'

type TResultLocationState = {
  messages?: TMessage[]
}

/**
 * 结果页（显示汤底和推理过程）。
 * @returns {React.ReactNode}
 */
export function Result() {
  const { storyId } = useParams()
  const location = useLocation()
  const state = location.state as TResultLocationState | null
  const messages = state?.messages ?? []
  const story = STORIES.find((item) => item.id === storyId) ?? STORIES[0]

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-300 hover:text-amber-400">
          ← 返回大厅
        </Link>
        <Link
          to={`/game/${story.id}`}
          className="rounded-lg border border-amber-400/60 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20 transition-all duration-300"
        >
          再来一局
        </Link>
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{story.title}</h1>
        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
      </div>

      <StoryReveal bottom={story.bottom} />

      <section className="mt-6 rounded-lg border border-slate-700 bg-slate-800/60 p-4 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold text-slate-100">推理过程</h2>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">本局暂无提问记录。</p>
          ) : (
            messages.map((message) => <Message key={message.id} message={message} />)
          )}
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          to="/"
          className="rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all duration-300"
        >
          返回大厅
        </Link>
      </div>
    </main>
  )
}
