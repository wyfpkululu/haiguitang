export type TDifficulty = 'easy' | 'medium' | 'hard'

export type TJudge = '是' | '否' | '无关'

export type TMessageRole = 'user' | 'assistant'

export type TStory = {
  id: string
  title: string
  difficulty: TDifficulty
  surface: string
  bottom: string
  yesKeywords: string[]
  noKeywords: string[]
  naKeywords: string[]
}

export type TMessage = {
  id: string
  role: TMessageRole
  content: string
  timestamp: number
}
