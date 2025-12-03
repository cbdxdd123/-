import axios from 'axios';

// 创建API客户端实例
// 创建axios实例，配置基础URL和超时
const apiClient = axios.create({
  baseURL: '/api/v1', // 使用相对路径，通过Vite代理转发
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json',
  }
});

// 检查API密钥是否配置
const checkApiKey = () => {
  const apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY;
  if (!apiKey || apiKey === 'your-api-key') {
    console.warn('⚠️ API密钥未正确配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    return false;
  }
  return true;
};

// 请求拦截器 - 添加额外的日志和检查
apiClient.interceptors.request.use(
  config => {
    // 检查网络连接
    if (!navigator.onLine) {
      console.error('❌ 网络连接不可用');
      return Promise.reject(new Error('网络连接不可用，请检查网络设置'));
    }
    
    // 检查API密钥
    const apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY;
    if (!apiKey || apiKey === 'your-dashscope-api-key') {
      console.error('❌ API密钥未配置或使用默认值');
      return Promise.reject(new Error('请配置有效的DashScope API密钥'));
    }
    
    // 添加Authorization头
    config.headers.Authorization = `Bearer ${apiKey}`;
    
    // 删除Accept头
    delete config.headers['Accept'];
    
    // 记录请求配置（隐藏敏感信息）
    console.log('🔄 API请求配置:', {
      url: config.url,
      method: config.method,
      headers: { ...config.headers, Authorization: 'Bearer ***' },
      timeout: config.timeout
    });
    
    return config;
  },
  error => {
    console.error('❌ 请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理响应和错误
apiClient.interceptors.response.use(
  response => {
    console.log('✅ API响应状态:', response.status);
    
    // 记录响应的主要结构
    if (response.data) {
      console.log('✅ API响应结构:', {
        hasOutput: !!response.data.output,
        hasChoices: response.data.output?.choices ? response.data.output.choices.length > 0 : false,
        hasMessage: response.data.output?.choices?.[0]?.message ? true : false,
        hasContent: response.data.output?.choices?.[0]?.message?.content ? true : false
      });
      
      // 检查是否为图像响应，并进行特殊处理
      if (response.data.output?.choices?.[0]?.message?.content) {
        const content = response.data.output.choices[0].message.content;
        
        // 处理图像响应 - 检查是否有图像数据或URL
        if (content[0]?.type === 'image_url' && content[0]?.image_url?.url) {
          console.log('✅ 检测到图像URL响应');
          response.data.imageUrl = content[0].image_url.url;
        } else if (content[0]?.type === 'image' && content[0]?.image) {
          // 处理base64编码的图像数据
          console.log('✅ 检测到base64图像数据');
          // 如果需要，可以将base64数据转换为data URL
          response.data.imageData = `data:image/png;base64,${content[0].image}`;
        }
      }
    }
    
    return response;
  },
  error => {
    console.error('❌ API响应错误详情:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method
      } : undefined
    });
    
    // 增强错误信息
    let errorMessage = 'API调用失败';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'API请求超时，请检查网络连接';
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络连接错误，请检查网络设置或API地址';
    } else if (error.response?.status === 401) {
      errorMessage = 'API密钥无效或已过期';
    } else if (error.response?.status === 403) {
      errorMessage = '没有权限访问该资源';
    } else if (error.response?.status === 404) {
      errorMessage = '请求的API端点不存在';
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误';
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    }
    
    const enhancedError = new Error(`${errorMessage}: ${error.message || '未知错误'}`);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
);

// 生成香包图案
export async function generateBagPattern({ prompt, size = '1328*1328', negative_prompt = '', messages }) {
  try {
    console.log('🎨 开始生成香包图案...');
    
    // 检查API密钥
    const hasValidKey = checkApiKey();
    if (!hasValidKey) {
      throw new Error('API密钥未配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    }
    
    // 构建请求体 - 完全匹配提供的curl示例格式
    const requestBody = {
      model: 'qwen-image-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      parameters: {
        negative_prompt: negative_prompt || "",
        prompt_extend: true,
        watermark: false,
        size: size
      }
    };
    
    console.log('📤 发送API请求...', {
      model: requestBody.model,
      prompt: prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt,
      size: size,
      hasNegativePrompt: !!negative_prompt
    });
    
    // 发送POST请求到API端点
    const response = await apiClient.post('/services/aigc/multimodal-generation/generation', requestBody);
    
    console.log('📥 API请求成功，响应状态:', response.status);
    
    // 处理qwen-image-plus模型的响应格式
    if (response.data && response.data.output && response.data.output.choices) {
      const choices = response.data.output.choices;
      
      if (choices.length > 0 && choices[0].message && choices[0].message.content) {
        const content = choices[0].message.content[0];
        
        if (content.image) {
          console.log('✅ 提取图像URL');
          // 保存图像URL到data对象以便前端组件访问
          response.data.data = response.data.data || {};
          response.data.data.image_url = content.image;
          return response.data;
        } else if (content.base64) {
          console.log('✅ 提取base64图像数据');
          // 将base64转换为data URL并保存
          const imageData = `data:image/png;base64,${content.base64}`;
          response.data.data = response.data.data || {};
          response.data.data.imageData = imageData;
          return response.data;
        }
      }
    }
    
    // 如果没有找到预期的数据结构，返回原始响应
    console.warn('⚠️ 未找到预期的图像数据结构，返回原始响应');
    return response.data;
    
  } catch (error) {
    console.error('❌ 生成香包图案失败:', error);
    
    // 增强错误信息
    let enhancedMessage = '生成香包图案失败';
    
    if (error.response?.data?.error?.message) {
      enhancedMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      enhancedMessage = error.response.data.message;
    } else if (error.message) {
      enhancedMessage = error.message;
    }
    
    const enhancedError = new Error(enhancedMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
}

// 测试API连接
export async function testApiConnection() {
  try {
    console.log('🔍 测试API连接...');
    
    // 检查API密钥
    const hasValidKey = checkApiKey();
    if (!hasValidKey) {
      throw new Error('API密钥未配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    }
    
    // 发送一个简单的测试请求
    const response = await apiClient.get('/services/aigc/multimodal-generation/models');
    
    console.log('✅ API连接测试成功，响应状态:', response.status);
    
    return {
      success: true,
      status: response.status,
      message: 'API连接成功',
      data: response.data
    };
    
  } catch (error) {
    console.error('❌ API连接测试失败:', error);
    
    // 增强错误信息
    let errorMessage = 'API连接测试失败';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'API请求超时，请检查网络连接';
    } else if (error.message.includes('Network Error')) {
      errorMessage = '网络连接错误，请检查网络设置或API地址';
    } else if (error.response?.status === 401) {
      errorMessage = 'API密钥无效或已过期';
    } else if (error.response?.status === 403) {
      errorMessage = '没有权限访问该资源';
    } else if (error.response?.status === 404) {
      errorMessage = '请求的API端点不存在';
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误';
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      status: error.response?.status || null,
      message: errorMessage,
      error: error
    };
  }
}

// 生成图像（通用函数）
export async function generateImage({ prompt, size = '1024x1024', style = 'realistic', type, params }) {
  try {
    console.log('🎨 开始生成图像...');
    
    // 检查API密钥
    const hasValidKey = checkApiKey();
    if (!hasValidKey) {
      throw new Error('API密钥未配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    }
    
    // 如果是通过params传递参数，则提取出来
    let actualPrompt = prompt;
    let actualSize = size;
    let actualStyle = style;
    
    if (params) {
      actualPrompt = params.prompt || prompt;
      actualSize = params.size || size;
      actualStyle = params.style || style;
    }
    
    // 构建请求体
    const requestBody = {
      model: 'qwen-image-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: actualPrompt
              }
            ]
          }
        ]
      },
      parameters: {
        size: actualSize,
        style: actualStyle,
        prompt_extend: params?.prompt_extend || false  // 启用prompt_extend字段
      }
    };
    
    console.log('📤 发送图像生成请求...', {
      model: requestBody.model,
      prompt: actualPrompt.length > 100 ? actualPrompt.substring(0, 100) + '...' : actualPrompt,
      size: actualSize,
      style: actualStyle
    });
    
    // 发送POST请求到API端点
    const response = await apiClient.post('/services/aigc/multimodal-generation/generation', requestBody);
    
    console.log('📥 图像生成请求成功，响应状态:', response.status);
    
    // 处理qwen-image-plus模型的响应格式
    if (response.data && response.data.output && response.data.output.choices) {
      const choices = response.data.output.choices;
      
      if (choices.length > 0 && choices[0].message && choices[0].message.content) {
        const content = choices[0].message.content[0];
        
        if (content.image) {
          console.log('✅ 提取图像URL');
          // 构造与TextToImage.vue期望的响应格式
          const formattedResult = {
            data: {
              image_url: content.image
            }
          };
          return formattedResult;
        } else if (content.base64) {
          console.log('✅ 提取base64图像数据');
          // 将base64转换为data URL并保存
          const imageData = `data:image/png;base64,${content.base64}`;
          const formattedResult = {
            data: {
              imageData: imageData
            }
          };
          return formattedResult;
        }
      }
    }
    
    // 如果没有找到预期的数据结构，返回原始响应
    console.warn('⚠️ 未找到预期的图像数据结构，返回原始响应');
    throw new Error('无法从API响应中提取图片URL');
    
  } catch (error) {
    console.error('❌ 生成图像失败:', error);
    
    // 增强错误信息
    let enhancedMessage = '生成图像失败';
    
    if (error.response?.data?.error?.message) {
      enhancedMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      enhancedMessage = error.response.data.message;
    } else if (error.message) {
      enhancedMessage = error.message;
    }
    
    const enhancedError = new Error(enhancedMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
}

// 获取图像生成结果
export async function getImageGenerationResult(taskId) {
  try {
    console.log('🔍 获取图像生成结果，任务ID:', taskId);
    
    // 检查API密钥
    const hasValidKey = checkApiKey();
    if (!hasValidKey) {
      throw new Error('API密钥未配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    }
    
    // 发送GET请求获取结果
    const response = await apiClient.get(`/services/aigc/text2image/image-synthesis?task_id=${taskId}`);
    
    console.log('📥 获取图像结果成功，响应状态:', response.status);
    
    // 处理响应
    if (response.data && response.data.output && response.data.output.results) {
      console.log('✅ 获取图像结果');
      return response.data;
    } else {
      throw new Error('未找到预期的图像结果');
    }
    
  } catch (error) {
    console.error('❌ 获取图像结果失败:', error);
    
    // 增强错误信息
    let enhancedMessage = '获取图像结果失败';
    
    if (error.response?.data?.error?.message) {
      enhancedMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      enhancedMessage = error.response.data.message;
    } else if (error.message) {
      enhancedMessage = error.message;
    }
    
    const enhancedError = new Error(enhancedMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
}

// 图像转换（风格转换等）
export async function transformImage({ image, style, prompt }) {
  try {
    console.log('🎨 开始转换图像...');
    
    // 检查API密钥
    const hasValidKey = checkApiKey();
    if (!hasValidKey) {
      throw new Error('API密钥未配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    }
    
    // 构建请求体
    const requestBody = {
      model: 'qwen-image-plus',
      input: {
        image: image,
        prompt: prompt || `将图像转换为${style}风格`
      },
      parameters: {
        size: '1328*1328'
      }
    };
    
    console.log('📤 发送图像转换请求...', {
      model: requestBody.model,
      hasImage: !!image,
      prompt: requestBody.input.prompt,
      size: requestBody.parameters.size
    });
    
    // 发送POST请求到API端点
    const response = await apiClient.post('/services/aigc/multimodal-generation/generation', requestBody);
    
    console.log('📥 图像转换请求成功，响应状态:', response.status);
    
    // 处理响应
    if (response.data && response.data.output && response.data.output.choices) {
      const choices = response.data.output.choices;
      
      if (choices.length > 0 && choices[0].message && choices[0].message.content) {
        const content = choices[0].message.content[0];
        
        if (content.image) {
          console.log('✅ 提取转换后的图像URL');
          response.data.data = response.data.data || {};
          response.data.data.image_url = content.image;
          return response.data;
        } else if (content.base64) {
          console.log('✅ 提取转换后的base64图像数据');
          const imageData = `data:image/png;base64,${content.base64}`;
          response.data.data = response.data.data || {};
          response.data.data.imageData = imageData;
          return response.data;
        }
      }
    }
    
    // 如果没有找到预期的数据结构，返回原始响应
    console.warn('⚠️ 未找到预期的图像数据结构，返回原始响应');
    return response.data;
    
  } catch (error) {
    console.error('❌ 转换图像失败:', error);
    
    // 增强错误信息
    let enhancedMessage = '转换图像失败';
    
    if (error.response?.data?.error?.message) {
      enhancedMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      enhancedMessage = error.response.data.message;
    } else if (error.message) {
      enhancedMessage = error.message;
    }
    
    const enhancedError = new Error(enhancedMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
}

// 图像描述生成
export async function describeImage({ image }) {
  try {
    console.log('🔍 开始生成图像描述...');
    
    // 检查API密钥
    const hasValidKey = checkApiKey();
    if (!hasValidKey) {
      throw new Error('API密钥未配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    }
    
    // 构建请求体
    const requestBody = {
      model: 'qwen-vl-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                image: image
              },
              {
                text: '请详细描述这张图像的内容，包括风格、色彩、构图等方面。'
              }
            ]
          }
        ]
      },
      parameters: {
        size: '1328*1328'
      }
    };
    
    console.log('📤 发送图像描述请求...', {
      model: requestBody.model,
      hasImage: !!image
    });
    
    // 发送POST请求到API端点
    const response = await apiClient.post('/services/aigc/multimodal-generation/generation', requestBody);
    
    console.log('📥 图像描述请求成功，响应状态:', response.status);
    
    // 处理响应
    if (response.data && response.data.output && response.data.output.choices) {
      const choices = response.data.output.choices;
      
      if (choices.length > 0 && choices[0].message && choices[0].message.content) {
        const content = choices[0].message.content[0];
        
        if (content.text) {
          console.log('✅ 提取图像描述文本');
          response.data.data = response.data.data || {};
          response.data.data.description = content.text;
          return response.data;
        }
      }
    }
    
    // 如果没有找到预期的数据结构，返回原始响应
    console.warn('⚠️ 未找到预期的描述数据结构，返回原始响应');
    return response.data;
    
  } catch (error) {
    console.error('❌ 生成图像描述失败:', error);
    
    // 增强错误信息
    let enhancedMessage = '生成图像描述失败';
    
    if (error.response?.data?.error?.message) {
      enhancedMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      enhancedMessage = error.response.data.message;
    } else if (error.message) {
      enhancedMessage = error.message;
    }
    
    const enhancedError = new Error(enhancedMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
}
// 风格迁移函数
export async function styleTransfer({ type, params }) {
  try {
    console.log('🎨 开始风格迁移...');
    
    // 检查API密钥
    const hasValidKey = checkApiKey();
    if (!hasValidKey) {
      throw new Error('API密钥未配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    }
    
    // 构建风格描述
    let styleDescription = '';
    switch(params.target_style) {
      case 'classical_oil':
        styleDescription = '古典油画风格，具有丰富的色彩层次和笔触感';
        break;
      case 'watercolor':
        styleDescription = '水彩画风格，色彩透明柔和，具有流动感';
        break;
      case 'chinese_ink':
        styleDescription = '中国传统水墨画风格，黑白分明，意境深远';
        break;
      case 'van_gogh':
        styleDescription = '梵高风格，具有独特的笔触和色彩表现力';
        break;
      case 'picasso':
        styleDescription = '毕加索立体主义风格，几何形状和抽象表现';
        break;
      case 'pop_art':
        styleDescription = '波普艺术风格，色彩鲜明，具有大众文化元素';
        break;
      case 'cyberpunk':
        styleDescription = '赛博朋克风格，未来科技感，霓虹色彩';
        break;
      case 'vaporwave':
        styleDescription = '蒸汽波风格，复古未来主义，粉紫色调';
        break;
      default:
        styleDescription = '艺术风格转换';
    }
    
    // 构建请求体 - 使用文本描述而不是图像
    const requestBody = {
      model: 'qwen-image-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: `请将图像转换为${styleDescription}。保持图像的主体内容和构图不变，只改变艺术风格。请确保生成的图像精美、色彩和谐，适合作为香包设计。`
              }
            ]
          }
        ]
      },
      parameters: {
        size: '1328*1328',
        negative_prompt: '',
        prompt_extend: true,
        watermark: false
      }
    };
    
    console.log('📤 发送风格迁移请求...', {
      model: requestBody.model,
      target_style: params.target_style,
      style_description: styleDescription,
      size: requestBody.parameters.size
    });
    
    // 发送POST请求到API端点
    const response = await apiClient.post('/services/aigc/multimodal-generation/generation', requestBody);
    
    console.log('📥 风格迁移请求成功，响应状态:', response.status);
    
    // 处理响应
    if (response.data && response.data.output && response.data.output.choices) {
      const choices = response.data.output.choices;
      
      if (choices.length > 0 && choices[0].message && choices[0].message.content) {
        const content = choices[0].message.content[0];
        
        if (content.image) {
          console.log('✅ 提取风格迁移后的图像URL');
          response.data.data = response.data.data || {};
          response.data.data.image_url = content.image;
          return response.data;
        } else if (content.base64) {
          console.log('✅ 提取风格迁移后的base64图像数据');
          const imageData = `data:image/png;base64,${content.base64}`;
          response.data.data = response.data.data || {};
          response.data.data.imageData = imageData;
          return response.data;
        }
      }
    }
    
    // 如果没有找到预期的数据结构，返回原始响应
    console.warn('⚠️ 未找到预期的图像数据结构，返回原始响应');
    return response.data;
    
  } catch (error) {
    console.error('❌ 风格迁移失败:', error);
    
    // 增强错误信息
    let enhancedMessage = '风格迁移失败';
    
    if (error.response?.data?.error?.message) {
      enhancedMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      enhancedMessage = error.response.data.message;
    } else if (error.message) {
      enhancedMessage = error.message;
    }
    
    const enhancedError = new Error(enhancedMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
}

// 图案创新函数
export async function innovatePattern(params) {
  try {
    console.log('✨ 开始图案创新...');
    
    // 检查API密钥
    const hasValidKey = checkApiKey();
    if (!hasValidKey) {
      throw new Error('API密钥未配置，请在.env.local文件中设置VITE_DASHSCOPE_API_KEY');
    }
    
    // 构建风格描述
    let styleDescription = '';
    if (params.innovate_type === 'classical_modern') {
      styleDescription = `融合${params.classical_style}古典风格与${params.modern_style}现代风格`;
    } else if (params.innovate_type === 'domestic_foreign') {
      styleDescription = `融合${params.domestic_style}国内风格与${params.foreign_style}国外风格`;
    } else if (params.innovate_type === 'custom') {
      styleDescription = `融合${params.style1}与${params.style2}风格`;
    }
    
    // 构建创意度描述
    const creativityDescription = params.creativity <= 3 ? '保守创新，保持传统元素为主' :
                               params.creativity <= 7 ? '平衡创新，传统与现代元素并重' :
                               '激进创新，大胆融合不同风格元素';
    
    // 构建融合比例描述
    const blendRatioDescription = `第一种风格占比${100 - params.blend_ratio}%，第二种风格占比${params.blend_ratio}%`;
    
    // 构建完整的提示词，包含所有前端输入的图片要求
    const prompt = params.description 
      ? `请设计一个香包图案，创新类型：${params.innovate_type}，风格组合：${styleDescription}，融合比例：${blendRatioDescription}，创意度：${creativityDescription}，主题描述：${params.description}。请确保图案精美、色彩和谐，适合作为香包设计。`
      : `请设计一个香包图案，创新类型：${params.innovate_type}，风格组合：${styleDescription}，融合比例：${blendRatioDescription}，创意度：${creativityDescription}。请确保图案精美、色彩和谐，适合作为香包设计。`;
    
    // 构建请求体
    const requestBody = {
      model: 'qwen-image-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      parameters: {
        size: '1328*1328',
        negative_prompt: '',
        prompt_extend: true,
        watermark: false
      }
    };
    
    console.log('📤 发送图案创新请求...', {
      model: requestBody.model,
      innovate_type: params.innovate_type,
      styleDescription: styleDescription,
      blend_ratio: params.blend_ratio,
      creativity: params.creativity,
      prompt: prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt
    });
    
    // 发送POST请求到API端点
    const response = await apiClient.post('/services/aigc/multimodal-generation/generation', requestBody);
    
    console.log('📥 图案创新请求成功，响应状态:', response.status);
    
    // 处理响应
    if (response.data && response.data.output && response.data.output.choices) {
      const choices = response.data.output.choices;
      
      if (choices.length > 0 && choices[0].message && choices[0].message.content) {
        const content = choices[0].message.content[0];
        
        if (content.image) {
          console.log('✅ 提取创新图案的图像URL');
          response.data.data = response.data.data || {};
          response.data.data.image_url = content.image;
          return response.data;
        } else if (content.base64) {
          console.log('✅ 提取创新图案的base64图像数据');
          const imageData = `data:image/png;base64,${content.base64}`;
          response.data.data = response.data.data || {};
          response.data.data.imageData = imageData;
          return response.data;
        }
      }
    }
    
    // 如果没有找到预期的数据结构，返回原始响应
    console.warn('⚠️ 未找到预期的图像数据结构，返回原始响应');
    return response.data;
    
  } catch (error) {
    console.error('❌ 图案创新失败:', error);
    
    // 增强错误信息
    let enhancedMessage = '图案创新失败';
    
    if (error.response?.data?.error?.message) {
      enhancedMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      enhancedMessage = error.response.data.message;
    } else if (error.message) {
      enhancedMessage = error.message;
    }
    
    const enhancedError = new Error(enhancedMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
}

export default {
  generateBagPattern,
  styleTransfer,
  textToImage: generateImage,
  innovatePattern,
  transformImage,
  describeImage,
  testApiConnection
};