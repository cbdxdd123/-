import { testApiConnection, generateBagPattern } from './imageApi';
// 基于test-api.html的网络连接测试逻辑

// 测试dashscope API连接
export default async function testDashscopeApi() {
  try {
    console.log('🔍 开始测试dashscope API连接...');
    
    // 先进行基础连接测试
    const connectionResult = await testApiConnection();
    
    console.log('基础连接测试结果:', connectionResult);
    
    // 检查环境变量
    const apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY;
    const hasValidApiKey = !!apiKey && apiKey !== 'your-api-key';
    
    // 返回综合测试结果
    return {
      success: connectionResult.success && hasValidApiKey,
      message: connectionResult.message,
      connectionStatus: connectionResult.status || 'UNKNOWN',
      apiKeyConfigured: hasValidApiKey,
      apiConnectionSuccess: connectionResult.success,
      details: connectionResult
    };
    
  } catch (error) {
    console.error('❌ API测试失败:', error);
    
    return {
      success: false,
      message: `API测试失败: ${error.message}`,
      error: error.message || '未知错误',
      errorName: error.name
    };
  }
}

// 环境变量检查
const checkEnvironment = () => {
  console.log('🖥️  检查环境配置...');
  
  const apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY;
  const baseUrl = 'https://dashscope.aliyuncs.com/api/v1';
  
  console.log('环境配置检查结果:', {
    apiKeyConfigured: !!apiKey && apiKey !== 'your-api-key',
    baseUrl: baseUrl,
    hasDefaultApiKey: apiKey === 'your-api-key'
  });
  
  if (!apiKey || apiKey === 'your-api-key') {
    console.warn('⚠️  警告: API密钥未配置或使用默认值，请在.env文件中设置VITE_DASHSCOPE_API_KEY');
    return false;
  }
  
  return true;
};

// 自动运行环境检查和测试
console.log('🤖 自动运行API测试和环境检查...');
checkEnvironment();

// 这里不再自动运行testDashscopeApi()以避免不必要的网络请求
// 可以在需要时手动调用testDashscopeApi()函数