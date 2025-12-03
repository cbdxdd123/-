<template>
  <div class="pattern-generator">
    <div class="header">
      <h2>香包图案自动生成（个性化）</h2>
      <p class="subtitle">根据您的喜好生成独特的香包图案</p>
    </div>

    <div class="form-container">
      <div class="form-section">
        <div class="form-group">
          <el-form label-position="top">
            <el-form-item label="主题">
              <el-select v-model="formData.theme" placeholder="请选择主题" style="width: 100%">
                <el-option label="传统中式" value="传统中式"></el-option>
                <el-option label="现代简约" value="现代简约"></el-option>
                <el-option label="自然风光" value="自然风光"></el-option>
                <el-option label="抽象艺术" value="抽象艺术"></el-option>
                <el-option label="卡通可爱" value="卡通可爱"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="主色调">
              <el-select v-model="formData.mainColor" placeholder="请选择主色调" style="width: 100%">
                <el-option label="红色系" value="红色系"></el-option>
                <el-option label="蓝色系" value="蓝色系"></el-option>
                <el-option label="绿色系" value="绿色系"></el-option>
                <el-option label="黄色系" value="黄色系"></el-option>
                <el-option label="紫色系" value="紫色系"></el-option>
                <el-option label="粉色系" value="粉色系"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="风格">
              <el-select v-model="formData.style" placeholder="请选择风格" style="width: 100%">
                <el-option label="水墨画" value="水墨画"></el-option>
                <el-option label="水彩画" value="水彩画"></el-option>
                <el-option label="油画" value="油画"></el-option>
                <el-option label="版画" value="版画"></el-option>
                <el-option label="插画" value="插画"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="元素">
              <el-select v-model="formData.elements" placeholder="请选择元素" style="width: 100%">
                <el-option label="花鸟" value="花鸟"></el-option>
                <el-option label="山水" value="山水"></el-option>
                <el-option label="人物" value="人物"></el-option>
                <el-option label="吉祥图案" value="吉祥图案"></el-option>
                <el-option label="几何图形" value="几何图形"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="自定义描述（可选）">
              <el-input
                type="textarea"
                v-model="formData.description"
                rows="3"
                placeholder="请描述您想要的图案特点..."
                resize="vertical"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="button-container">
        <el-button
          type="primary"
          @click="generatePattern"
          :loading="isGenerating"
          :disabled="isGenerating"
          size="large"
        >
          {{ isGenerating ? '生成中...' : '生成图案' }}
        </el-button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <div v-if="generatedImage" class="result-section">
      <h3>生成结果</h3>
      <div class="image-container">
        <img :src="generatedImage" alt="生成的香包图案" class="result-image" />
      </div>
      <div class="result-actions">
        <button @click="downloadImage" class="download-btn">下载图片</button>
        <button @click="regeneratePattern" class="regenerate-btn">重新生成</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { generateBagPattern } from '../services/imageApi';

// 表单数据
const formData = reactive({
  theme: '传统中式',
  mainColor: '红色系',
  style: '水墨画',
  elements: '花鸟',
  description: ''
});

// 状态变量
const isGenerating = ref(false);
const generatedImage = ref('');
const error = ref('');

// 生成图案
const generatePattern = async () => {
  try {
    isGenerating.value = true;
    error.value = '';
    
    // 构建提示词
    const prompt = `请设计一个精美的香包图案，主题是${formData.theme}，主色调为${formData.mainColor}，风格为${formData.style}，主要元素是${formData.elements}。${formData.description ? `额外要求：${formData.description}` : ''}。图案应该适合用于香包制作，线条清晰，色彩和谐，具有中国传统美学特色。`;
    
    // 调用API生成图案
    const response = await generateBagPattern({
      prompt: prompt,
      size: '1328*1328', // 使用API支持的格式，星号分隔
      negative_prompt: '模糊, 低质量, 扭曲, 变形, 不完整, 多余的肢体, 错误的比例, 水印, 文字, 签名'
    });
    
    // 处理响应数据
    if (response.data && response.data.image_url) {
      generatedImage.value = response.data.image_url;
    } else if (response.data && response.data.imageData) {
      generatedImage.value = response.data.imageData;
    } else if (response.output && response.output.choices && response.output.choices[0] && response.output.choices[0].message && response.output.choices[0].message.content && response.output.choices[0].message.content[0] && response.output.choices[0].message.content[0].image) {
      generatedImage.value = response.output.choices[0].message.content[0].image;
    } else if (response.output && response.output.choices && response.output.choices[0] && response.output.choices[0].message && response.output.choices[0].message.content && response.output.choices[0].message.content[0] && response.output.choices[0].message.content[0].image_url) {
      generatedImage.value = response.output.choices[0].message.content[0].image_url.url;
    } else {
      throw new Error('未找到生成的图像数据');
    }
    
  } catch (err) {
    console.error('生成图案失败:', err);
    error.value = `生成失败: ${err.message}`;
  } finally {
    isGenerating.value = false;
  }
};

// 下载图片
const downloadImage = async () => {
  if (!generatedImage.value) return;
  
  try {
    // 使用fetch获取图片数据
    const response = await fetch(generatedImage.value);
    if (!response.ok) throw new Error('网络请求失败');
    
    // 转换为blob
    const blob = await response.blob();
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `香包图案_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载失败:', error);
    // 如果fetch方式失败，回退到原始方式
    const link = document.createElement('a');
    link.href = generatedImage.value;
    link.download = `香包图案_${Date.now()}.png`;
    link.target = '_blank'; // 在新标签页打开，避免跨域问题
    link.click();
  }
};

// 重新生成
const regeneratePattern = () => {
  generatePattern();
};
</script>

<style scoped>
.pattern-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

.form-container {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-section {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.button-container {
  text-align: center;
  margin: 20px 0;
}

.error-message {
  color: #f56c6c;
  margin: 10px 0;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;
}

.result-section {
  margin-top: 30px;
  text-align: center;
}

.result-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.image-container {
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.result-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.download-btn, .regenerate-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.download-btn {
  background-color: #2ecc71;
  color: white;
}

.download-btn:hover {
  background-color: #27ae60;
}

.regenerate-btn {
  background-color: #f39c12;
  color: white;
}

.regenerate-btn:hover {
  background-color: #e67e22;
}
</style>