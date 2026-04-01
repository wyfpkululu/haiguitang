import type { TMessage } from '../types/models'

type TMessageProps = {
  message: TMessage
}

/**
 * 单条对话消息。
 * @param {TMessageProps} props 组件参数
 * @returns {React.ReactNode}
 */
export function Message({ message }: TMessageProps) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 hover:bg-slate-600">
          <span className="text-amber-400 font-bold">AI</span>
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-lg border px-4 py-3 text-sm shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01] ${isUser
          ? 'border-amber-400/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15'
          : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-750'
          }`}
      >
        <p className="mb-1 text-xs text-slate-400 transition-all duration-300 hover:text-slate-300">{isUser ? '你' : 'AI主持人'}</p>
        <p className="leading-relaxed transition-all duration-300 hover:opacity-90">{message.content}</p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 hover:bg-amber-400/30">
          <span className="text-amber-400 font-bold">你</span>
        </div>
      )}
    </div>
  )
}
