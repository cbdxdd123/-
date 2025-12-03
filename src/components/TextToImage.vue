<template>
  <div class="text-to-image">
    <h2>文生图（多种绘画风格）</h2>
    <div class="main-content">
      <el-form :model="formData" label-position="top" class="params-form">
        <el-form-item label="文本描述">
          <el-input
            type="textarea"
            v-model="formData.prompt"
            placeholder="请输入香包图案的详细描述，例如：'一个红色的传统中国香包，上面有金色的龙凤图案，背景是祥云纹样'"
            :rows="4"
            resize="vertical"
          ></el-input>
        </el-form-item>
        <div class="form-row">
          <div class="form-col">
            <el-form-item label="绘画风格">
              <el-select v-model="formData.style" placeholder="请选择绘画风格" style="width: 100%">
                <el-option label="写实风格" value="realistic"></el-option>
                <el-option label="卡通风格" value="cartoon"></el-option>
                <el-option label="水彩画" value="watercolor"></el-option>
                <el-option label="油画" value="oil_painting"></el-option>
                <el-option label="水墨画" value="chinese_ink"></el-option>
                <el-option label="素描" value="sketch"></el-option>
                <el-option label="版画" value="engraving"></el-option>
                <el-option label="数字艺术" value="digital_art"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="form-col">
            <el-form-item label="图像质量">
              <el-radio-group v-model="formData.quality" style="display: flex; justify-content: center;">
                <el-radio-button label="标准"></el-radio-button>
                <el-radio-button label="高清"></el-radio-button>
                <el-radio-button label="超高清"></el-radio-button>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
        <div class="form-row">
          <div class="form-col">
            <el-form-item label="图像尺寸">
              <el-select v-model="formData.size" placeholder="请选择图像尺寸" style="width: 100%">
                <el-option label="1664×928 (16:9)" value="1664*928"></el-option>
                <el-option label="1472×1140 (4:3)" value="1472*1140"></el-option>
                <el-option label="1328×1328 (1:1)" value="1328*1328"></el-option>
                <el-option label="1140×1472 (3:4)" value="1140*1472"></el-option>
                <el-option label="928×1664 (9:16)" value="928*1664"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="form-col">
            <el-form-item label="创意度">
              <el-slider v-model="formData.creativity" :min="1" :max="10" show-input :marks="{1: '保守', 5: '平衡', 10: '激进'}"></el-slider>
            </el-form-item>
          </div>
        </div>

      </el-form>
      
      <div class="button-container">
        <el-button
          type="primary"
          @click="generateImage"
          :loading="loading"
          :disabled="!formData.prompt"
          size="large"
        >
          生成图像
        </el-button>
      </div>

      <div class="result-section" v-if="generatedImage">
        <h3>生成结果</h3>
        <div class="result-content">
          <el-image :src="generatedImage" fit="contain" class="generated-image"></el-image>
          <div class="result-info">
            <h4>生成参数</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="风格">{{ getStyleName(formData.style) }}</el-descriptions-item>
              <el-descriptions-item label="质量">{{ formData.quality }}</el-descriptions-item>
              <el-descriptions-item label="尺寸">{{ formData.size }}</el-descriptions-item>
              <el-descriptions-item label="创意度">{{ formData.creativity }}</el-descriptions-item>
            </el-descriptions>
            <div class="result-actions">
              <el-button type="primary" @click="downloadImage">下载图片</el-button>
              <el-button @click="regenerateImage">重新生成</el-button>
              <el-button @click="editPrompt">修改描述</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { generateImage as textToImage } from '../services/imageApi';

const formData = ref({
  prompt: '',
  style: 'chinese_ink',
  quality: '高清',
  size: '1328*1328',
  creativity: 5
});

const generatedImage = ref('');
const loading = ref(false);

// 根据风格值获取风格名称
const getStyleName = (style) => {
  const styleMap = {
    realistic: '写实风格',
    cartoon: '卡通风格',
    watercolor: '水彩画',
    oil_painting: '油画',
    chinese_ink: '水墨画',
    sketch: '素描',
    engraving: '版画',
    digital_art: '数字艺术'
  };
  return styleMap[style] || style;
};

// 生成图像
const generateImage = async () => {
  try {
    loading.value = true;
    
    // 构建包含所有要求的完整提示词
    const styleDescription = getStyleName(formData.value.style);
    const qualityDescription = formData.value.quality === '标准' ? '标准质量' : 
                              formData.value.quality === '高清' ? '高清质量，细节丰富' : 
                              '超高清质量，细节极其丰富，4K分辨率';
    const creativityDescription = formData.value.creativity <= 3 ? '创意度保守，保持传统风格' :
                                 formData.value.creativity <= 7 ? '创意度平衡，传统与创新并重' :
                                 '创意度激进，大胆创新，突破传统';
    
    // 构建完整提示词
    const fullPrompt = `${formData.value.prompt}。风格要求：${styleDescription}。质量要求：${qualityDescription}。图像尺寸：${formData.value.size}。${creativityDescription}。请确保生成的图像精美、色彩和谐，适合作为香包设计。`;
    
    // 调用API生成图像
    const result = await textToImage({
      type: 'text_to_image',
      params: {
        prompt: fullPrompt,
        style: formData.value.style,
        quality: formData.value.quality,
        size: formData.value.size,
        creativity: formData.value.creativity,
        prompt_extend: true  // 启用prompt_extend字段
      }
    });
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
    } else if (result && result.data && result.data.imageData) {
      // base64格式数据
      imageUrl = result.data.imageData;
      console.log('从data.imageData提取的base64图片:', imageUrl);
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
    console.error('生成图像失败:', error);
    // 这里可以添加错误提示
  } finally {
    loading.value = false;
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
    link.download = `文本生成图像_${Date.now()}.png`;
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
    link.download = `文本生成图像_${Date.now()}.png`;
    link.target = '_blank'; // 在新标签页打开，避免跨域问题
    link.click();
  }
};

// 重新生成
const regenerateImage = () => {
  generateImage();
};

// 修改描述
const editPrompt = () => {
  generatedImage.value = '';
};
</script>

<style scoped>
.text-to-image {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.params-form {
  margin-bottom: 30px;
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-col {
  flex: 1;
  min-width: 300px;
}

.button-item {
  text-align: center;
  margin-top: 20px;
}

.result-section {
  margin: 30px auto;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  max-width: 1000px;
}

.result-content {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
}

.generated-image {
  min-width: 300px;
  max-width: 650px;
  max-height: 550px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.result-info {
  min-width: 300px;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
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
</style>