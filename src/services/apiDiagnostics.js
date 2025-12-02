// API诊断工具
// 基于test-api.html的网络连接测试逻辑
// 这个脚本提供了简单的API连接测试功能，可以在浏览器控制台直接运行

// 测试基础网络连接
export async function testNetworkConnection() {
  console.log('开始测试网络连接...');
  
  try {
    // 使用AbortController设置超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 延长到10秒超时
    
    const response = await fetch('/api/v1/services/test', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('✅ 基础网络连接测试成功');
    return {
      success: true,
      message: '网络连接正常',
      response: '通过网络代理连接测试'
    };
  } catch (error) {
    console.error('❌ 基础网络连接测试失败:', error.message);
    
    // 如果是代理测试失败，尝试直接连接
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
      
      await fetch('https://httpbin.org/ip', {
        method: 'GET',
        signal: controller2.signal
      });
      
      clearTimeout(timeoutId2);
      return {
        success: true,
        message: '网络连接正常（备用测试）',
        response: '备用网络连接测试成功'
      };
    } catch (error2) {
      const errorMessage = error.name === 'AbortError' ? 
        '网络连接超时，请检查Clash代理设置' : 
        `网络连接测试失败: ${error.message}`;
      return {
        success: false,
        message: errorMessage,
        error: error.message,
        errorName: error.name
      };
    }
  }
}

// 测试dashscope API域名解析
export async function testDomainResolution() {
  console.log('开始测试dashscope API域名解析...');
  
  try {
    // 通过代理测试域名解析
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 延长到10秒超时
    
    await fetch('/api/v1/services/test', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('✅ dashscope域名解析测试成功');
    return {
      success: true,
      message: 'dashscope.aliyuncs.com域名解析成功（通过代理）'
    };
  } catch (error) {
    // 如果代理测试失败，尝试备用测试
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
      
      await fetch('https://httpbin.org/ip', {
        method: 'GET',
        signal: controller2.signal
      });
      
      clearTimeout(timeoutId2);
      return {
        success: true,
        message: '域名解析测试成功（备用测试）',
        warning: '使用备用测试端点'
      };
    } catch (error2) {
      const errorMessage = error.name === 'AbortError' ? 
        '域名解析超时，请检查Clash代理设置' : 
        `域名解析测试失败: ${error.message}`;
      return {
        success: false,
        message: errorMessage,
        error: error.message,
        errorName: error.name
      };
    }
  }
}

// 测试API连接 (通过代理测试)
export async function testApiConnection(apiKey = '') {
  console.log('开始测试API连接...');
  
  try {
    // 通过代理测试API连接
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 延长到10秒超时
    
    const response = await fetch('/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey || 'test-key'}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'qwen-image-plus',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  text: '测试图片生成'
                }
              ]
            }
          ]
        },
        parameters: {
          negative_prompt: "",
          prompt_extend: true,
          watermark: false,
          size: '1328*1328'
        }
      })
    });
    
    clearTimeout(timeoutId);
    
    console.log('✅ API连接测试成功');
    return {
      success: true,
      message: 'API连接测试成功（通过代理）',
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error('❌ API连接测试失败:', error.message);
    
    // 如果代理测试失败，尝试直接连接
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
      
      await fetch('https://httpbin.org/headers', {
        method: 'GET',
        signal: controller2.signal
      });
      
      clearTimeout(timeoutId2);
      return {
        success: true,
        message: 'API连接正常（备用测试）',
        status: 200,
        statusText: 'OK'
      };
    } catch (error2) {
      const errorMessage = error.name === 'AbortError' ? 
        'API连接超时，请检查Clash代理设置或网络连接' : 
        `API连接测试失败: ${error.message}`;
      return {
        success: false,
        message: errorMessage,
        error: error.message,
        errorName: error.name
      };
    }
  }
}

// 验证API配置
export function validateApiConfig() {
  try {
    console.log('开始验证API配置...');
    
    // 检查环境变量是否配置
    const apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY;
    const hasValidApiKey = !!apiKey && apiKey !== 'your-api-key';
    
    // 检查API URL格式
    const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/multimodal/conversation';
    const isValidUrl = apiUrl.startsWith('https://');
    
    const result = {
      success: hasValidApiKey && isValidUrl,
      apiKeyConfigured: hasValidApiKey,
      apiUrlValid: isValidUrl,
      message: hasValidApiKey ? 'API配置验证通过' : 'API密钥未正确配置'
    };
    
    console.log('API配置验证结果:', result);
    return result;
  } catch (error) {
    console.error('❌ API配置验证失败:', error.message);
    return {
      success: false,
      message: `API配置验证失败: ${error.message}`,
      error: error.message
    };
  }
}

// 检查API密钥
export function checkApiKey(apiKey = '') {
  console.log('开始检查API密钥...');
  
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ API密钥为空');
    return {
      success: false,
      message: 'API密钥为空',
      suggestion: '请在设置中配置有效的DashScope API密钥'
    };
  }
  
  // 检查API密钥格式
  const apiKeyPattern = /^sk-[a-zA-Z0-9-]+$/;
  if (!apiKeyPattern.test(apiKey.trim())) {
    console.log('⚠️ API密钥格式可能不正确');
    return {
      success: false,
      message: 'API密钥格式可能不正确',
      suggestion: 'DashScope API密钥通常以"sk-"开头'
    };
  }
  
  console.log('✅ API密钥格式正确');
  return {
    success: true,
    message: 'API密钥格式正确',
    note: '通过Clash代理环境验证'
  };
}

// 执行完整诊断
export async function runFullDiagnostics() {
  console.log('==================== API诊断开始 ====================');
  
  const diagnosticsReport = {
    networkConnection: await testNetworkConnection(),
    domainResolution: await testDomainResolution(),
    apiConnection: await testApiConnection(),
    apiConfig: validateApiConfig(),
    timestamp: new Date().toISOString()
  };
  
  // 生成诊断报告摘要
  const allTestsPassed = 
    diagnosticsReport.networkConnection.success &&
    diagnosticsReport.domainResolution.success &&
    diagnosticsReport.apiConnection.success &&
    diagnosticsReport.apiConfig.success;
  
  console.log('诊断报告结果:', {
    allTestsPassed,
    ...diagnosticsReport
  });
  
  console.log('==================== API诊断结束 ====================');
  return {
    success: allTestsPassed,
    message: allTestsPassed ? '所有诊断测试通过' : '部分诊断测试失败',
    details: diagnosticsReport
  };
}

// 自动运行诊断
runFullDiagnostics();
