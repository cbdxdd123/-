<template>
  <div class="pattern-generator">
    <h2>香包图案自动生成（个性化）</h2>
    <el-form :model="formData" label-position="top" class="params-form">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="主题">
            <el-select v-model="formData.theme" placeholder="请选择主题">
              <el-option label="传统花卉" value="traditional_flower"></el-option>
              <el-option label="动物纹样" value="animal_pattern"></el-option>
              <el-option label="几何图形" value="geometric"></el-option>
              <el-option label="节日元素" value="festival"></el-option>
              <el-option label="抽象艺术" value="abstract"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="主色调">
            <el-color-picker v-model="formData.mainColor" show-alpha></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="风格">
            <el-select v-model="formData.style" placeholder="请选择风格">
              <el-option label="古典中式" value="chinese_classic"></el-option>
              <el-option label="现代简约" value="modern_simple"></el-option>
              <el-option label="民族特色" value="ethnic"></el-option>
              <el-option label="卡通可爱" value="cartoon"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="复杂度">
            <el-slider v-model="formData.complexity" :min="1" :max="10" show-input></el-slider>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="描述（可选）">
            <el-input type="textarea" v-model="formData.description" placeholder="请输入更详细的描述" :rows="2"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
      </el-form-item>
    </el-form>

    <!-- 图像生成预览框 -->
    <div class="preview-container">
      <div class="preview-box" v-if="generatedImage">
        <el-image :src="generatedImage" fit="contain" class="preview-image"></el-image>
      </div>
      <div class="preview-placeholder" v-else>
        <div class="placeholder-content">
          <el-icon class="placeholder-icon"><PictureFilled /></el-icon>
          <p>点击下方按钮生成香包图案预览</p>
        </div>
      </div>
    </div>

    <div class="button-container">
      <el-button
        type="primary"
        @click="generatePattern"
        :loading="loading"
        size="large"
      >
        生成香包图案
      </el-button>
      <el-button @click="testConnection" style="margin-left: 10px;" size="large">测试连接</el-button>
    </div>
    
    <!-- 错误提示区域 -->
    <div class="error-container" v-if="errorMessage">
      <div class="error-message">
        <el-alert
          :title="errorTitle || '错误提示'"
          :description="errorMessage"
          type="error"
          :closable="false"
          show-icon
        ></el-alert>
        <div v-if="connectionTips && connectionTips.length > 0" class="connection-tips">
          <h4>可能的解决方案：</h4>
          <ul>
            <li v-for="(tip, index) in connectionTips" :key="index">{{ tip }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="result-section" v-if="generatedImage">
      <h3>生成结果</h3>
      <el-image :src="generatedImage" fit="contain" class="generated-image"></el-image>
      <div class="result-actions">
        <el-button @click="downloadImage">下载图片</el-button>
        <el-button @click="regeneratePattern">重新生成</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { generateBagPattern } from '../services/imageApi';
import testDashscopeApi from '../services/testApi';
import { runFullDiagnostics } from '../services/apiDiagnostics';
import { PictureFilled } from '@element-plus/icons-vue';

const formData = ref({
  theme: 'traditional_flower',
  mainColor: '#FF6B6B',
  style: 'chinese_classic',
  complexity: 5,
  description: ''
});

const generatedImage = ref('');
const loading = ref(false);
const errorMessage = ref('');
const errorTitle = ref('');
const connectionTips = ref([]);

const testConnection = async () => {
  loading.value = true;
  errorMessage.value = '';
  connectionTips.value = [];
  
  try {
    console.log('测试API连接...');
    
    // 首先运行完整诊断
    const diagnosticsResult = await runFullDiagnostics();
    console.log('诊断结果:', diagnosticsResult);
    
    // 然后运行API连接测试
    const apiTestResult = await testDashscopeApi();
    console.log('API测试结果:', apiTestResult);
    
    // 综合判断连接状态
    const isConnected = diagnosticsResult.success && apiTestResult.success;
    
    if (isConnected) {
      errorTitle.value = '连接成功';
      errorMessage.value = 'API连接测试成功！您可以尝试生成图案了。';
      connectionTips.value = [];
    } else {
      // 收集错误信息和提示
      errorTitle.value = '连接测试不完全成功';
      
      // 构建错误信息
      let message = '';
      let tips = [];
      
      // 检查诊断结果中的错误
      if (!diagnosticsResult.details.networkConnection.success) {
        message += `网络连接问题: ${diagnosticsResult.details.networkConnection.message}\n`;
        tips.push('检查您的网络连接是否正常');
        tips.push('尝试访问其他网站确认网络状态');
      }
      
      if (!diagnosticsResult.details.domainResolution.success) {
        message += `域名解析问题: ${diagnosticsResult.details.domainResolution.message}\n`;
        tips.push('检查DNS设置是否正常');
        tips.push('确认防火墙没有阻止域名解析');
      }
      
      if (!diagnosticsResult.details.apiConnection.success) {
        message += `API连接问题: ${diagnosticsResult.details.apiConnection.message}\n`;
        tips.push('确认dashscope.aliyuncs.com域名可以访问');
        tips.push('检查防火墙是否允许HTTPS连接');
      }
      
      if (!diagnosticsResult.details.apiConfig.success) {
        message += `API配置问题: ${diagnosticsResult.details.apiConfig.message}\n`;
        tips.push('检查.env文件中的API密钥配置');
        tips.push('确认API密钥格式正确且有效');
      }
      
      if (!apiTestResult.success) {
        message += `API测试失败: ${apiTestResult.message || '未知错误'}\n`;
      }
      
      errorMessage.value = message.trim();
      connectionTips.value = [...new Set(tips)]; // 去重提示
      
      // 添加通用建议
      connectionTips.value.push('尝试使用test-api.html进行更详细的连接测试');
      connectionTips.value.push('如果在公司网络中，可能需要配置代理');
    }
  } catch (error) {
    console.error('连接测试失败:', error);
    errorTitle.value = '连接失败';
    errorMessage.value = `测试连接过程中发生错误: ${error.message || '未知错误'}`;
    connectionTips.value = [
      '检查网络连接是否正常',
      '确认防火墙或代理设置没有阻止访问',
      '尝试使用test-api.html进行详细的连接测试',
      '稍后重试或联系技术支持'
    ];
  } finally {
    loading.value = false;
  }
};

// 组件挂载时运行API诊断
onMounted(() => {
  console.log('组件挂载，开始API诊断...');
  // 静默运行诊断，不显示错误信息
  runFullDiagnostics().catch(error => {
    console.warn('诊断过程中出现警告:', error);
  });
});

const generatePattern = async () => {
    loading.value = true;
    errorMessage.value = '';
    
    try {
      console.log('开始生成图案...');
      
      // 再次运行诊断以获取最新状态
      await runFullDiagnostics();
      
      // 构建提示词参数
      const theme = formData.value.theme || '传统';
      const mainColor = formData.value.mainColor || '红色';
      const style = formData.value.style || '中国风';
      const complexity = formData.value.complexity || 5;
      const description = formData.value.description || '';
      const size = '1328*1328'; // 修改为API支持的格式
      
      // 构建自然语言提示
      const styleText = style === 'chinese_classic' ? '古典中式' : 
                        style === 'modern_simple' ? '现代简约' : 
                        style === 'ethnic' ? '民族特色' : '卡通可爱';
      
      const themeText = theme === 'traditional_flower' ? '传统花卉' : 
                       theme === 'animal_pattern' ? '动物纹样' : 
                       theme === 'geometric' ? '几何图形' : 
                       theme === 'festival' ? '节日元素' : '抽象艺术';
      
      const prompt = `设计一个${styleText}风格的香包图案，主题是${themeText}，主色调为${mainColor}，复杂度${complexity}/10，${description ? '附加描述：' + description : '图案要精致、传统、适合刺绣在香包上'}`;
      const negative_prompt = "模糊，扭曲，低质量，变形，不完整，文字，水印";
      
      // 调用API生成图片
      console.log('调用API生成图片...');
      console.log('Prompt:', prompt);
      console.log('Size:', size);
      console.log('Negative Prompt:', negative_prompt);
      
      const result = await generateBagPattern({
        prompt,
        size,
        negative_prompt
      });
      
      console.log('API调用结果:', result);
      
      // 从结果中提取图片URL - 处理多种可能的返回格式
      let imageUrl = null;
      
      // 检查多种可能的响应格式
      if (result && result.output && result.output.choices && result.output.choices[0] && 
          result.output.choices[0].message && result.output.choices[0].message.content && 
          result.output.choices[0].message.content[0] && result.output.choices[0].message.content[0].image) {
        // dashscope multimodal conversation 格式
        imageUrl = result.output.choices[0].message.content[0].image;
        console.log('从output.choices提取的图片URL:', imageUrl);
      } else if (result && result.data && result.data.image_url) {
        // 标准URL格式
        imageUrl = result.data.image_url;
        console.log('从data.image_url提取的图片URL:', imageUrl);
      } else if (result && result.image_url) {
        // 直接的image_url格式
        imageUrl = result.image_url;
        console.log('从image_url提取的图片URL:', imageUrl);
      } else {
        console.warn('无法识别的响应格式:', JSON.stringify(result));
        throw new Error('API返回格式异常，无法提取图片');
      }
      
      if (imageUrl) {
        generatedImage.value = imageUrl;
      } else {
        throw new Error('无法从API响应中提取图片URL');
      }
    } catch (error) {
      console.error('图案生成失败:', error);
      errorTitle.value = '生成失败';
      
      // 根据错误类型显示不同的错误信息和提示
      if (error.message && (error.message.includes('Network') || error.message.includes('ERR_'))) {
        errorMessage.value = `网络连接错误: ${error.message}`;
        connectionTips.value = [
          '检查您的网络连接是否正常',
          '尝试使用"测试连接"按钮诊断问题',
          '如果是公司网络，可能需要配置代理',
          '稍后再次尝试'
        ];
      } else if (error.message && error.message.includes('API key')) {
        errorMessage.value = `API密钥错误: ${error.message}`;
        connectionTips.value = [
          '请检查.env文件中的API密钥配置',
          '确保API密钥格式正确且有效'
        ];
      } else {
        errorMessage.value = `生成失败: ${error.message || '未知错误'}`;
        connectionTips.value = [
          '尝试使用不同的图案参数',
          '检查API服务是否正常运行',
          '稍后重试'
        ];
      }
      
      // 显示详细错误信息在控制台
      if (error.response) {
        console.error('API错误响应:', error.response.data);
      } else if (error.request) {
        console.error('API请求发送但无响应:', error.request);
      }
    } finally {
      loading.value = false;
    }
  };

const downloadImage = () => {
  if (generatedImage.value) {
    const link = document.createElement('a');
    link.href = generatedImage.value;
    link.download = `bag-pattern-${Date.now()}.png`;
    link.click();
  }
};

const regeneratePattern = () => {
  generatedImage.value = '';
  generatePattern();
};
</script>

<style scoped>
.pattern-generator {
  width: 100%;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.pattern-generator > h2 {
  margin-bottom: 20px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pattern-generator > .params-form,
.pattern-generator > .result-section {
  width: 100%;
  max-width: none;
  overflow-x: hidden;
}

/* 预览框样式 */
.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
  width: 100%;
}

.preview-box,
.preview-placeholder {
  width: 100%;
  max-width: 600px;
  height: 400px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
}

.placeholder-content {
  text-align: center;
  color: #909399;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.placeholder-content p {
  font-size: 16px;
  margin: 0;
}

.params-form {
  margin-bottom: 30px;
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow-x: hidden;
}

.result-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.button-container {
  max-width: 800px;
  margin: 20px auto 0;
  text-align: center;
}

/* 错误提示区域样式 */
.error-container {
  margin-top: 20px;
  animation: fadeIn 0.3s ease-in-out;
}

.error-message {
  margin-top: 0;
  animation: slideIn 0.3s ease-in-out;
}

.connection-tips {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;
}

.connection-tips h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #495057;
  font-size: 16px;
}

.connection-tips ul {
  margin: 0;
  padding-left: 20px;
}

.connection-tips li {
  margin-bottom: 5px;
  color: #6c757d;
  line-height: 1.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>