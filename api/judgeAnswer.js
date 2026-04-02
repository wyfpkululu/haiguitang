/**
 * 基于关键词判断回答类型。
 * @param {string} question 玩家问题
 * @param {object} story 当前故事
 * @returns {string}
 */
function judgeAnswer(question, story) {
  const normalized = question.trim().toLowerCase();
  const hasKeyword = (keywords) => {
    if (!Array.isArray(keywords)) return false;
    return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
  };

  if (hasKeyword(story.yesKeywords)) return '是';
  if (hasKeyword(story.noKeywords)) return '否';
  if (hasKeyword(story.naKeywords)) return '无关';

  if (/吗\?|吗$|是否|是不是|有没有|能不能|可不可以/.test(normalized)) {
    return '否';
  }
  return '无关';
}

module.exports = judgeAnswer;