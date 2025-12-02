<template>
  <div class="pattern-innovate">
    <h2>图案创新：古典+现代，国内+国外</h2>
    
    <div class="main-content">
      <el-form :model="formData" label-position="top" class="params-form">
        <el-form-item label="创新类型">
          <el-radio-group v-model="formData.innovateType">
            <el-radio-button label="classical_modern">古典 + 现代</el-radio-button>
            <el-radio-button label="domestic_foreign">国内 + 国外</el-radio-button>
            <el-radio-button label="custom">自定义融合</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div class="form-row">
          <div class="form-col">
            <el-form-item label="古典风格" v-if="formData.innovateType === 'classical_modern'">
              <el-select v-model="formData.classicalStyle" placeholder="请选择古典风格" style="width: 100%">
                <el-option label="中国传统纹样" value="chinese_traditional"></el-option>
                <el-option label="哥特式" value="gothic"></el-option>
                <el-option label="巴洛克" value="baroque"></el-option>
                <el-option label="洛可可" value="rococo"></el-option>
                <el-option label="文艺复兴" value="renaissance"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="国内风格" v-if="formData.innovateType === 'domestic_foreign'">
              <el-select v-model="formData.domesticStyle" placeholder="请选择国内风格" style="width: 100%">
                <el-option label="中国传统纹样" value="chinese_traditional"></el-option>
                <el-option label="苗族刺绣" value="miao_embroidery"></el-option>
                <el-option label="藏族纹样" value="tibetan_pattern"></el-option>
                <el-option label="青花瓷" value="blue_and_white_porcelain"></el-option>
                <el-option label="京剧脸谱" value="peking_opera_mask"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="风格1" v-if="formData.innovateType === 'custom'">
              <el-input v-model="formData.customStyle1" placeholder="请输入第一种风格，例如：中国传统花卉"></el-input>
            </el-form-item>
          </div>
          
          <div class="form-col">
            <el-form-item label="现代风格" v-if="formData.innovateType === 'classical_modern'">
              <el-select v-model="formData.modernStyle" placeholder="请选择现代风格" style="width: 100%">
                <el-option label="极简主义" value="minimalism"></el-option>
                <el-option label="未来主义" value="futurism"></el-option>
                <el-option label="赛博朋克" value="cyberpunk"></el-option>
                <el-option label="波普艺术" value="pop_art"></el-option>
                <el-option label="蒸汽波" value="vaporwave"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="国外风格" v-if="formData.innovateType === 'domestic_foreign'">
              <el-select v-model="formData.foreignStyle" placeholder="请选择国外风格" style="width: 100%">
                <el-option label="日本浮世绘" value="japanese_ukiyoe"></el-option>
                <el-option label="印度传统纹样" value="indian_traditional"></el-option>
                <el-option label="波斯纹样" value="persian_pattern"></el-option>
                <el-option label="埃及图腾" value="egyptian_totem"></el-option>
                <el-option label="玛雅文明" value="maya_civilization"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="风格2" v-if="formData.innovateType === 'custom'">
              <el-input v-model="formData.customStyle2" placeholder="请输入第二种风格，例如：现代几何图形"></el-input>
            </el-form-item>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <el-form-item label="融合比例">
              <el-slider
                v-model="formData.blendRatio"
                :min="0"
                :max="100"
                show-input
                :marks="{0: '风格1', 50: '平衡', 100: '风格2'}"
              ></el-slider>
            </el-form-item>
          </div>
          <div class="form-col">
            <el-form-item label="创意度">
              <el-slider
                v-model="formData.creativity"
                :min="1"
                :max="10"
                show-input
                :marks="{1: '保守', 5: '平衡', 10: '激进'}"
              ></el-slider>
            </el-form-item>
          </div>
        </div>

        <el-form-item label="主题描述（可选）">
          <el-input
            type="textarea"
            v-model="formData.description"
            placeholder="请输入香包主题描述，例如：'一个融合中国传统花卉与现代几何图形的香包'"
            :rows="3"
            resize="vertical"
          ></el-input>
        </el-form-item>

      </el-form>
      
      <div class="button-container">
        <el-button
          type="primary"
          @click="generateInnovativePattern"
          :loading="loading"
          :disabled="!canGenerate"
          size="large"
        >
          生成创新图案
        </el-button>
      </div>

      <!-- 生成结果 -->
      <div class="result-section" v-if="generatedImage">
        <h3>生成结果</h3>
        <div class="result-content">
          <el-image :src="generatedImage" fit="contain" class="generated-image"></el-image>
          <div class="result-details">
            <h4>创新详情</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="创新类型">
                {{ getInnovateTypeName(formData.innovateType) }}
              </el-descriptions-item>
              <el-descriptions-item label="风格组合">
                {{ getStyleCombination() }}
              </el-descriptions-item>
              <el-descriptions-item label="融合比例">
                {{ formData.blendRatio }}%
              </el-descriptions-item>
              <el-descriptions-item label="创意度">
                {{ formData.creativity }}
              </el-descriptions-item>
            </el-descriptions>
            <div class="result-actions">
              <el-button type="primary" @click="downloadImage">下载图片</el-button>
              <el-button @click="regeneratePattern">重新生成</el-button>
              <el-button @click="adjustParams">调整参数</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { innovatePattern } from '../services/imageApi';

const formData = ref({
  innovateType: 'classical_modern',
  classicalStyle: 'chinese_traditional',
  modernStyle: 'minimalism',
  domesticStyle: 'chinese_traditional',
  foreignStyle: 'japanese_ukiyoe',
  customStyle1: '',
  customStyle2: '',
  blendRatio: 50,
  creativity: 5,
  description: ''
});

const generatedImage = ref('');
const loading = ref(false);

// 计算是否可以生成
const canGenerate = computed(() => {
  if (formData.value.innovateType === 'classical_modern') {
    return formData.value.classicalStyle && formData.value.modernStyle;
  } else if (formData.value.innovateType === 'domestic_foreign') {
    return formData.value.domesticStyle && formData.value.foreignStyle;
  } else {
    return formData.value.customStyle1 && formData.value.customStyle2;
  }
});

// 获取创新类型名称
const getInnovateTypeName = (type) => {
  const typeMap = {
    classical_modern: '古典 + 现代',
    domestic_foreign: '国内 + 国外',
    custom: '自定义融合'
  };
  return typeMap[type] || type;
};

// 获取风格组合描述
const getStyleCombination = () => {
  if (formData.value.innovateType === 'classical_modern') {
    return `${formData.value.classicalStyle} + ${formData.value.modernStyle}`;
  } else if (formData.value.innovateType === 'domestic_foreign') {
    return `${formData.value.domesticStyle} + ${formData.value.foreignStyle}`;
  } else {
    return `${formData.value.customStyle1} + ${formData.value.customStyle2}`;
  }
};

// 生成创新图案
const generateInnovativePattern = async () => {
  try {
    loading.value = true;
    
    // 构建请求参数
    let params = {
      type: 'innovative_pattern',
      innovate_type: formData.value.innovateType,
      blend_ratio: formData.value.blendRatio,
      creativity: formData.value.creativity,
      description: formData.value.description
    };
    
    // 根据创新类型添加具体风格参数
    if (formData.value.innovateType === 'classical_modern') {
      params.classical_style = formData.value.classicalStyle;
      params.modern_style = formData.value.modernStyle;
    } else if (formData.value.innovateType === 'domestic_foreign') {
      params.domestic_style = formData.value.domesticStyle;
      params.foreign_style = formData.value.foreignStyle;
    } else {
      params.style1 = formData.value.customStyle1;
      params.style2 = formData.value.customStyle2;
    }
    
    // 调用API生成创新图案
    const result = await innovatePattern(params);
    
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
    console.error('生成创新图案失败:', error);
    // 这里可以添加错误提示
  } finally {
    loading.value = false;
  }
};

// 下载图片
const downloadImage = () => {
  if (generatedImage.value) {
    const link = document.createElement('a');
    link.href = generatedImage.value;
    link.download = `innovative-pattern-${Date.now()}.png`;
    link.click();
  }
};

// 重新生成
const regeneratePattern = () => {
  generateInnovativePattern();
};

// 调整参数
const adjustParams = () => {
  generatedImage.value = '';
};
</script>

<style scoped>
.pattern-innovate {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.pattern-innovate h2 {
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.params-form {
  width: 100%;
  max-width: 800px;
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
  justify-content: center;
}

.form-col {
  flex: 1;
  min-width: 300px;
}

.result-section {
  width: 100%;
  max-width: 900px;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.result-section h3 {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.result-content {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.generated-image {
  flex: 1;
  min-width: 300px;
  max-width: 650px;
  max-height: 550px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.result-details {
  flex: 1;
  min-width: 300px;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.result-details h4 {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.result-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.button-container {
  max-width: 800px;
  margin: 20px auto 0;
  text-align: center;
}
</style>