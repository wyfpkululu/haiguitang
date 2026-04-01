import type { TStory } from './types/models'

/**
 * 基于关键词判断回答类型。
 * @param {string} question 玩家问题
 * @param {TStory} story 当前故事
 * @returns {string}
 */
function judgeAnswer(question: string, story: TStory): string {
  const normalized = question.trim().toLowerCase()
  const hasKeyword = (keywords: string[]): boolean =>
    keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))

  if (hasKeyword(story.yesKeywords)) return '是'
  if (hasKeyword(story.noKeywords)) return '否'
  if (hasKeyword(story.naKeywords)) return '无关'

  if (/吗\?|吗$|是否|是不是|有没有|能不能|可不可以/.test(normalized)) {
    return '否'
  }
  return '无关'
}

/**
 * 调用AI进行海龟汤游戏问答。
 * @param {string} question 玩家的问题
 * @param {TStory} story 当前故事
 * @returns {Promise<string>} AI的回答
 */
export async function askAI(question: string, story: TStory): Promise<string> {
  try {
    // 调用后端 API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        story: story,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.warn('API error, using keyword matching as fallback:', errorText)
      return judgeAnswer(question, story)
    }

    const data = await response.json()
    
    // 打印详细日志
    console.log('HTTP Status:', response.status)
    console.log('Response Data:', JSON.stringify(data, null, 2))
    
    if (data.status === 'error') {
      console.warn('API error, using keyword matching as fallback:', data.message)
      return judgeAnswer(question, story)
    }

    const answer = typeof data?.answer === 'string' ? data.answer.trim() : ''
    
    // 打印answer
    console.log('AI Answer:', answer)
    
    // 检查answer是否有效
    if (!answer) {
      console.warn('AI answer is empty or missing')
      return judgeAnswer(question, story)
    }

    // 确保回答是有效的
    if (!['是', '否', '无关'].includes(answer)) {
      console.warn('Invalid AI response format.')
      return 'invalid'
    }

    return answer
  } catch (error) {
    console.error('AI API call failed, using keyword matching as fallback:', error)
    return judgeAnswer(question, story)
  }
}
