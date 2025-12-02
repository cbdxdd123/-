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
    console.warn('⚠️ API密钥未正确配置，请在.env文件中设置VITE_DASHSCOPE_API_KEY');
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
      throw new Error('API密钥未配置，请在.env文件中设置VITE_DASHSCOPE_API_KEY');
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
    
    // 处理可能的错误响应
    if (response.data && response.data.code) {
      throw new Error(`API错误: ${response.data.code} - ${response.data.message || '未知错误'}`);
    }
    
    // 如果无法提取图像，返回完整响应以供调试
    console.warn('⚠️ 无法从响应中提取图像，尝试检查响应格式');
    return response.data;
    
  } catch (error) {
    console.error('❌ 生成香包图案失败:', error);
    throw error;
  }
};

// 生成通用图像
export async function generateImage({ prompt, size = '1328*1328', negative_prompt = '' }) {
  // 复用generateBagPattern函数，因为API格式相同
  console.log('🔄 调用通用图像生成...');
  return generateBagPattern({ prompt, size, negative_prompt });
};

// 文生图功能 - 为了兼容直接命名导入
export const textToImage = generateImage;

// 图像变化（根据提示词修改现有图像）
export async function transformImage({ image, prompt, size = '1328*1328', negative_prompt = '' }) {
  try {
    console.log('🖼️ 开始图像变化...');
    
    // 检查API密钥
    checkApiKey();
    
    // 构建请求体 - 使用官方API文档的格式
    const requestBody = {
      model: 'qwen-image-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: image // 图像URL或base64
              },
              {
                type: 'text',
                text: prompt + (negative_prompt ? `\n\n注意事项: ${negative_prompt}` : '')
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
    
    console.log('📤 发送图像变化API请求...');
    const response = await apiClient.post('/services/aigc/multimodal-generation/multimodal-chat', requestBody);
    
    console.log('📥 图像变化API请求成功');
    
    // 正确处理官方API的响应格式
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
    
    // 处理可能的错误响应
    if (response.data && response.data.code) {
      throw new Error(`API错误: ${response.data.code} - ${response.data.message || '未知错误'}`);
    }
    
    // 如果无法提取图像，返回完整响应以供调试
    console.warn('⚠️ 无法从响应中提取图像，尝试检查响应格式');
    return response.data;
    
  } catch (error) {
    console.error('❌ 图像变化失败:', error);
    throw error;
  }
};

// 描述图像
export async function describeImage({ image, negative_prompt = '' }) {
  try {
    console.log('🔍 开始描述图像...');
    
    // 检查API密钥
    checkApiKey();
    
    const requestBody = {
      model: 'qwen-image-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: image // 图像URL
              },
              {
                type: 'text',
                text: '请详细描述这张图片的内容，包括颜色、形状、风格等特征。'
              }
            ]
          }
        ]
      },
      parameters: {
        negative_prompt: negative_prompt || "",
        prompt_extend: true,
        watermark: false,
        size: '1328*1328'
      }
    };
    
    console.log('📤 发送图像描述API请求...');
    const response = await apiClient.post('/services/aigc/multimodal-generation/multimodal-chat', requestBody);
    
    console.log('📥 图像描述API请求成功');
    return response.data;
    
  } catch (error) {
    console.error('❌ 图像描述失败:', error);
    throw error;
  }
};

// 测试API连接
export async function testApiConnection() {
  try {
    console.log('🧪 测试API连接...');
    
    // 检查API密钥
    if (!checkApiKey()) {
      return { success: false, message: 'API密钥未配置' };
    }
    
    // 发送一个简单的请求来测试连接
    const testResponse = await apiClient.options('/services/aigc/multimodal-generation/generation');
    
    console.log('✅ API连接测试成功');
    return { 
      success: true, 
      message: 'API连接成功',
      status: testResponse.status 
    };
    
  } catch (error) {
    console.error('❌ API连接测试失败:', error);
    return { 
      success: false, 
      message: error.message || '连接失败',
      error: error.name 
    };
  }
};

// 风格迁移 - 使用阿里云百炼图像生成API格式
export const styleTransfer = async (params) => {
  try {
    console.log('🎨 开始风格迁移...');
    
    // 检查API密钥
    checkApiKey();
    
    // 使用qwen-image-plus API格式
    const requestBody = {
      model: "qwen-image-plus",
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: params.prompt || ""
              }
            ]
          }
        ]
      },
      parameters: {
        negative_prompt: params.negative_prompt || "",
        prompt_extend: true,
        watermark: false,
        size: params.size || '1328*1328'
      }
    };
    
    const response = await apiClient.post('/services/aigc/multimodal-generation/generation', requestBody);
    
    // 处理qwen-image-plus模型的响应格式
    if (response.data && response.data.output && response.data.output.choices) {
      const choices = response.data.output.choices;
      
      if (choices.length > 0 && choices[0].message && choices[0].message.content) {
        const content = choices[0].message.content[0];
        
        if (content.image) {
          console.log('✅ 提取图像URL');
          return {
            imageUrl: content.image,
            success: true
          };
        } else if (content.base64) {
          console.log('✅ 提取base64图像数据');
          return {
            imageData: `data:image/png;base64,${content.base64}`,
            success: true
          };
        }
      }
    }
    
    // 如果无法提取图像，返回完整响应以供调试
    console.warn('⚠️ 无法从响应中提取图像，尝试检查响应格式');
    return response.data;
  } catch (error) {
    console.error('❌ 风格迁移失败:', error);
    throw error;
  }
};

// 图案创新 - 使用阿里云百炼图像生成API格式
export const innovatePattern = async (params) => {
  try {
    console.log('💡 开始图案创新...');
    
    // 检查API密钥
    checkApiKey();
    
    // 使用qwen-image-plus API格式
    const requestBody = {
      model: "qwen-image-plus",
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: params.prompt || ""
              }
            ]
          }
        ]
      },
      parameters: {
        negative_prompt: params.negative_prompt || "",
        prompt_extend: true,
        watermark: false,
        size: params.size || '1328*1328'
      }
    };
    
    const response = await apiClient.post('/services/aigc/multimodal-generation/generation', requestBody);
    
    // 处理qwen-image-plus模型的响应格式
    if (response.data && response.data.output && response.data.output.choices) {
      const choices = response.data.output.choices;
      
      if (choices.length > 0 && choices[0].message && choices[0].message.content) {
        const content = choices[0].message.content[0];
        
        if (content.image) {
          console.log('✅ 提取图像URL');
          return {
            imageUrl: content.image,
            success: true
          };
        } else if (content.base64) {
          console.log('✅ 提取base64图像数据');
          return {
            imageData: `data:image/png;base64,${content.base64}`,
            success: true
          };
        }
      }
    }
    
    // 如果无法提取图像，返回完整响应以供调试
    console.warn('⚠️ 无法从响应中提取图像，尝试检查响应格式');
    return response.data;
  } catch (error) {
    console.error('❌ 图案创新失败:', error);
    throw error;
  }
};

export default {
  generateBagPattern,
  styleTransfer,
  textToImage: generateImage,
  innovatePattern,
  transformImage,
  describeImage,
  testApiConnection
};














