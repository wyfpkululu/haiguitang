import { useMemo, useRef, useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Message } from './Message'
import { askAI } from '../api'
import type { TMessage, TStory } from '../types/models'

// 类型定义
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface WindowWithSpeech extends Window {
  SpeechRecognition: new () => SpeechRecognition
  webkitSpeechRecognition: new () => SpeechRecognition
}

declare const window: WindowWithSpeech

type TChatBoxProps = {
  story: TStory
  messages: TMessage[]
  onMessagesChange: (messages: TMessage[]) => void
}

/**
 * 生成消息对象。
 * @param {'user' | 'assistant'} role 消息角色
 * @param {string} content 消息内容
 * @returns {TMessage}
 */
function createMessage(role: 'user' | 'assistant', content: string): TMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: Date.now(),
  }
}

/**
 * 根据 AI 回答生成引导提示。
 * @param {string} answer AI 的回答
 * @param {number} messageCount 当前消息数量
 * @returns {string}
 */
function generateGuidance(answer: string, messageCount: number): string {
  const guidances = {
    '是': [
      '✓ 这个方向对了！继续深入探索这个线索。',
      '✓ 很好！可以尝试追问更多细节。',
      '✓ 正确！这个线索很重要，继续挖掘。',
    ],
    '否': [
      '✗ 这个方向不对，尝试换个角度思考。',
      '✗ 不是这样，重新审视故事中的细节。',
      '✗ 排除这个可能，关注其他线索。',
    ],
    '无关': [
      '○ 这个问题与汤底无关，关注故事的核心细节。',
      '○ 尝试从人物关系、时间地点入手。',
      '○ 思考故事中的异常之处。',
    ],
  }

  const hints = [
    '💡 提示：关注故事中的时间、地点、人物关系。',
    '💡 提示：思考事件发生的因果关系。',
    '💡 提示：注意故事中的异常细节。',
    '💡 提示：尝试从不同角度提问。',
  ]

  const answerGuidances = guidances[answer as keyof typeof guidances] || []
  const randomGuidance = answerGuidances[Math.floor(Math.random() * answerGuidances.length)]
  
  if (messageCount > 0 && messageCount % 3 === 0) {
    const randomHint = hints[Math.floor(Math.random() * hints.length)]
    return `${randomGuidance}\n${randomHint}`
  }
  
  return randomGuidance
}



/**
 * 聊天输入与消息展示组件。
 * @param {TChatBoxProps} props 组件参数
 * @returns {React.ReactNode}
 */
export function ChatBox({ story, messages, onMessagesChange }: TChatBoxProps) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // 错误自动消失
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // 初始化语音识别
  useEffect(() => {
    // 检查浏览器是否支持语音识别
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true // 持续识别，停顿时不会终止
      recognition.interimResults = true // 显示中间结果
      recognition.lang = 'zh-CN' // 设置为中文

      // 处理识别结果
      recognition.onresult = (event) => {
        let transcript = ''
        // 累积所有结果，确保停顿后之前的文字不会丢失
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setQuestion(transcript)
      }

      // 处理错误
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError('语音识别失败，请重试')
        setIsListening(false)
      }

      // 处理结束
      recognition.onend = () => {
        setIsListening(false)
      }

      // 处理开始
      recognition.onstart = () => {
        setIsListening(true)
      }

      recognitionRef.current = recognition

      // 清理函数
      return () => {
        recognition.abort()
      }
    }
  }, [])

  const messageCountText = useMemo(() => `${messages.length} 条消息`, [messages.length])

  // 消息变化时自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * 提交问题并得到 AI 回答。
   * @param {FormEvent<HTMLFormElement>} event 表单事件
   * @returns {void}
   */
  // 开始语音识别
  function startVoiceRecognition(): void {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setError(null)
      } catch (err) {
        console.error('Error starting speech recognition:', err)
        setError('无法启动语音识别，请检查麦克风权限')
      }
    } else {
      setError('当前浏览器不支持语音识别')
    }
  }

  // 停止语音识别
  function stopVoiceRecognition(): void {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    // 停止语音识别
    stopVoiceRecognition()
    
    const content = question.trim()
    if (!content) return

    // 清空错误信息
    setError(null)
    
    // 创建用户消息并显示
    const userMessage = createMessage('user', content)
    onMessagesChange([...messages, userMessage])
    setQuestion('')
    
    // 显示加载中
    setIsLoading(true)
    
    try {
      // 调用AI API获取回答
      const answer = await askAI(content, story)
      
      // 检查回答是否符合规范
      if (answer === 'invalid') {
        // 回答不符合规范，提示用户重新提问
        const errorMessage = createMessage('assistant', '抱歉，我无法理解你的问题，请尝试用更清晰的方式重新提问。')
        onMessagesChange([...messages, userMessage, errorMessage])
        setError('AI 回答不符合规范，请重新提问。')
      } else if (['是', '否', '无关'].includes(answer)) {
        const assistantMessage = createMessage('assistant', answer)
        const guidance = generateGuidance(answer, messages.length)
        const guidanceMessage = createMessage('assistant', guidance)
        onMessagesChange([...messages, userMessage, assistantMessage, guidanceMessage])
      } else {
        // 回答不符合规范，提示用户重新提问
        const errorMessage = createMessage('assistant', '抱歉，我无法理解你的问题，请尝试用更清晰的方式重新提问。')
        onMessagesChange([...messages, userMessage, errorMessage])
        setError('AI 回答不符合规范，请重新提问。')
      }
    } catch (err) {
      // 处理错误
      const errorMessage = createMessage('assistant', '抱歉，我暂时无法回答你的问题，请稍后再试。')
      onMessagesChange([...messages, userMessage, errorMessage])
      setError('AI 回答失败，请稍后再试。')
      console.error('AI API call failed:', err)
    } finally {
      // 隐藏加载中
      setIsLoading(false)
      // 延迟设置焦点，确保输入框已启用
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  return (
    <section className="flex h-full min-h-[400px] sm:min-h-[520px] flex-col rounded-lg border border-slate-700 bg-slate-800/60 shadow-lg transition-all duration-300 hover:shadow-xl">
      <header className="flex items-center justify-between border-b border-slate-700 px-3 sm:px-4 py-2 sm:py-3">
        <h2 className="text-sm sm:text-base font-semibold text-slate-100">对话区</h2>
        <span className="text-xs text-slate-400">{messageCountText}</span>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fadeIn">
            <div className="mb-3 text-3xl sm:text-4xl animate-pulse">💭</div>
            <p className="text-sm text-center">还没有对话记录</p>
            <p className="mt-1 text-xs text-center">开始向AI提问吧！</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="max-w-[85%] sm:max-w-[80%] rounded-lg border border-slate-700 bg-slate-800 px-3 sm:px-4 py-2 sm:py-3 text-sm shadow-lg transform transition-all duration-300 hover:bg-slate-750">
              <p className="mb-1 text-xs text-slate-400">AI主持人</p>
              <div className="flex items-center space-x-2">
                <span className="text-slate-300">思考中</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="border-t border-rose-500/50 px-3 sm:px-4 py-2 sm:py-3 text-sm text-rose-400 bg-rose-500/10 animate-fadeIn transform transition-all duration-300 hover:bg-rose-500/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-700 p-2 sm:p-3">
        <input
          ref={inputRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 disabled:opacity-50 transition-all duration-300 hover:border-slate-500"
          placeholder="输入你的问题..."
        />
        <button
          type="button"
          onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
          disabled={isLoading}
          className={`rounded-lg border px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${isListening
            ? 'border-rose-400/60 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
            : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <span className="flex items-center gap-1">
              <span className="text-lg">🎤</span>
              <span className="hidden sm:inline">停止</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="text-lg">🎤</span>
              <span className="hidden sm:inline">语音</span>
            </span>
          )}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg border border-amber-400/60 bg-amber-500/10 px-3 sm:px-5 py-2 sm:py-3 text-sm font-medium text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
              <span className="hidden sm:inline">发送中</span>
            </div>
          ) : (
            '发送'
          )}
        </button>
      </form>
    </section>
  )
}
