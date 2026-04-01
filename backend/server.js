const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// 配置CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  const startTime = Date.now();
  const { method, url, ip } = req;
  
  // 记录请求开始
  console.log(`[${new Date().toISOString()}] ${method} ${url} from ${ip}`);
  
  // 监听响应完成事件
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${res.statusCode} ${responseTime}ms`);
  });
  
  next();
});

// 根路径 - 接口文档
app.get('/', (req, res) => {
  res.json({
    message: '服务器运行正常',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      '/': '接口文档',
      '/api/test': '测试接口',
      '/api/chat': 'AI对话接口'
    },
    documentation: {
      '/api/test': {
        method: 'GET',
        description: '测试接口，返回服务器状态',
        response: {
          message: '测试接口调用成功',
          status: 'success',
          timestamp: '2026-04-01T00:00:00.000Z'
        }
      },
      '/api/chat': {
        method: 'POST',
        description: 'AI对话接口，用于海龟汤游戏问答',
        request: {
          question: 'string - 玩家的问题',
          story: 'object - 故事对象，包含id、title、surface、bottom等字段'
        },
        response: {
          success: {
            message: 'AI回答成功',
            status: 'success',
            answer: '是/否/无关'
          },
          error: {
            message: '错误信息',
            status: 'error'
          }
        }
      }
    }
  });
});

// 测试接口 GET /api/test
app.get('/api/test', (req, res) => {
  res.json({
    message: '测试接口调用成功',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// AI对话接口 POST /API/chat
app.post('/API/chat', async (req, res) => {
  // 调用相同的处理逻辑
  await handleChatRequest(req, res);
});

// 兼容小写的API路径
app.post('/api/chat', async (req, res) => {
  // 调用相同的处理逻辑
  await handleChatRequest(req, res);
});

// 处理聊天请求的函数
async function handleChatRequest(req, res) {
  try {
    const { question, story } = req.body;
    
    // 输出交互内容（只打印问题的前500字和story的id、title）
    console.log('POST /api/chat - received request');
    console.log('Question:', question ? question.substring(0, 500) : '');
    console.log('Story ID:', story?.id || '');
    console.log('Story Title:', story?.title || '');
    
    // 验证参数
    if (!question || !story) {
      return res.status(400).json({
        message: '缺少必要参数',
        status: 'error'
      });
    }
    
    // 获取API Key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: 'API Key未配置',
        status: 'error'
      });
    }
    
    // 构建提示词
    const prompt = `你是一个海龟汤游戏的主持人。现在的故事是：

故事标题：${story.title}

汤面：${story.surface}

汤底：${story.bottom}

示例对话：
玩家：这个人是男性吗？
主持人：是

玩家：这个事件发生在晚上吗？
主持人：否

玩家：今天天气怎么样？
主持人：无关

玩家现在问：${question}

请根据汤底内容，回答玩家的问题，只能回答"是"、"否"或"无关"，不要添加任何额外的解释。`;
    
    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 10
      })
    });
    
    // 处理API响应
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('DeepSeek API error:', response.status, errorText);
      return res.status(502).json({
        error: 'DeepSeek API error',
        status: response.status,
        detail: errorText
      });
    }
    
    const data = await response.json();
    const answer = data.choices[0]?.message?.content?.trim() || '';
    
    // 确保回答是有效的
    if (!['是', '否', '无关'].includes(answer)) {
      return res.status(500).json({
        message: 'AI回答不符合规范',
        status: 'error'
      });
    }
    
    // 构建返回给前端的payload
    const payload = {
      message: 'AI回答成功',
      status: 'success',
      answer: answer
    };
    
    // 输出AI回答和返回给前端的JSON
    console.log('AI response:', answer);
    console.log('Response to frontend:', JSON.stringify(payload, null, 2));
    
    // 返回AI的回答
    res.json(payload);
    
  } catch (error) {
    console.error('AI API call failed:', error);
    res.status(500).json({
      message: 'AI回答失败，请稍后再试',
      status: 'error'
    });
  }
}

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // 确保响应已经发送
  if (res.headersSent) {
    return next(err);
  }
  
  // 发送错误响应
  res.status(500).json({
    message: '服务器内部错误',
    status: 'error',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    message: '接口不存在',
    status: 'error'
  });
});

// 启动服务器
app.listen(port, () => {
  const host = 'http://localhost:' + port;
  console.log('Server is running at ' + host);
  console.log('GET  /           -> 服务信息');
  console.log('GET  /api/test   -> 测试');
  console.log('POST /api/chat   -> AI 对话');
});
