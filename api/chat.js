const judgeAnswer = require('./judgeAnswer.js');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { question, story } = req.body;
      
      // 验证参数
      if (!question || !story) {
        return res.status(400).json({
          message: '缺少必要参数',
          status: 'error'
        });
      }
      
      // 使用关键词匹配作为回退
      const answer = judgeAnswer(question, story);
      
      res.status(200).json({
        message: 'AI回答成功',
        status: 'success',
        answer
      });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({
        message: 'AI回答失败，请稍后再试',
        status: 'error'
      });
    }
  } else {
    res.status(405).json({
      message: '方法不允许',
      status: 'error'
    });
  }
}