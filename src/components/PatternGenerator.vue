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

    <div class="button-container">
      <el-button
        type="primary"
        @click="generatePattern"
        :loading="loading"
        size="large"
      >
        生成香包图案
      </el-button>
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
import { ref } from 'vue';
import { generateBagPattern } from '../services/imageApi';

const formData = ref({
  theme: 'traditional_flower',
  mainColor: '#FF6B6B',
  style: 'chinese_classic',
  complexity: 5,
  description: ''
});

const generatedImage = ref('');
const loading = ref(false);

const generatePattern = async () => {
  try {
    loading.value = true;
    // 调用API生成图案
    const result = await generateBagPattern({
      type: 'bag_pattern',
      params: {
        theme: formData.value.theme,
        main_color: formData.value.mainColor,
        style: formData.value.style,
        complexity: formData.value.complexity,
        description: formData.value.description
      }
    });
    // 假设API返回的是图片URL
    generatedImage.value = result.image_url;
  } catch (error) {
    console.error('生成图案失败:', error);
    // 这里可以添加错误提示
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
</style>