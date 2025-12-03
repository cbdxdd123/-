<template>
  <div class="style-transfer">
    <h2>香包图案风格迁移</h2>
    <div class="main-content">
      <div class="upload-section">
        <h3>上传原始图像</h3>
        <el-upload
          v-model:file-list="fileList"
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept="image/*"
          list-type="picture-card"
        >
          <el-icon><Plus /></el-icon>
          <template #file="{ file }">
            <div>
              <el-image
                :src="file.url"
                :fit="'cover'"
                style="width: 100%; height: 180px"
              ></el-image>
              <span class="el-upload-list__item-actions">
                <span
                  class="el-upload-list__item-preview"
                  @click="handlePictureCardPreview(file)"
                >
                  <el-icon><zoom-in /></el-icon>
                </span>
                <span
                  class="el-upload-list__item-delete"
                  @click="handleRemove(file)"
                >
                  <el-icon><Delete /></el-icon>
                </span>
              </span>
            </div>
          </template>
        </el-upload>
        <el-dialog v-model="dialogVisible">
          <img w-full :src="dialogImageUrl" alt="Preview Image" />
        </el-dialog>
      </div>

      <div class="style-section">
        <h3>选择目标风格</h3>
        <el-select v-model="targetStyle" placeholder="请选择风格" style="width: 100%; max-width: 400px; margin: 0 auto;">
          <el-option label="古典油画" value="classical_oil"></el-option>
          <el-option label="水彩画" value="watercolor"></el-option>
          <el-option label="水墨画" value="chinese_ink"></el-option>
          <el-option label="梵高风格" value="van_gogh"></el-option>
          <el-option label="毕加索风格" value="picasso"></el-option>
          <el-option label="波普艺术" value="pop_art"></el-option>
          <el-option label="赛博朋克" value="cyberpunk"></el-option>
          <el-option label="蒸汽波" value="vaporwave"></el-option>
        </el-select>
      </div>
    </div>

    <div class="button-container">
      <el-button
        type="primary"
        @click="startTransfer"
        :loading="loading"
        :disabled="!selectedFile || !targetStyle"
        size="large"
      >
        开始风格迁移
      </el-button>
    </div>

    <div class="result-section" v-if="transferredImage">
      <h3>迁移结果</h3>
      <div class="results-container">
        <div class="result-item">
          <h4>原始图像</h4>
          <el-image :src="selectedFile.url" fit="contain" class="result-image"></el-image>
        </div>
        <div class="result-item">
          <h4>迁移后图像</h4>
          <el-image :src="transferredImage" fit="contain" class="result-image"></el-image>
        </div>
      </div>
      <div class="result-actions">
        <el-button @click="downloadImage">下载图片</el-button>
        <el-button @click="restartTransfer">重新迁移</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue';
import { styleTransfer } from '../services/imageApi';

const fileList = ref([]);
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const selectedFile = ref(null);
const targetStyle = ref('');
const transferredImage = ref('');
const loading = ref(false);

const handleFileChange = (file) => {
  // 将文件转换为base64格式
  const reader = new FileReader();
  reader.onload = (e) => {
    // 保存base64数据
    file.base64 = e.target.result;
    file.url = e.target.result; // 同时设置url用于显示
    selectedFile.value = file;
  };
  reader.readAsDataURL(file.raw);
};

const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
};

const handleRemove = (file) => {
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    fileList.value.splice(index, 1);
    if (selectedFile.value === file) {
      selectedFile.value = null;
    }
  }
};

const startTransfer = async () => {
  try {
    loading.value = true;
    // 调用API进行风格迁移 - 不再传递图像数据，只传递风格选择
    const result = await styleTransfer({
      type: 'style_transfer',
      params: {
        target_style: targetStyle.value
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
      transferredImage.value = imageUrl;
    } else {
      throw new Error('无法从API响应中提取图片URL');
    }
  } catch (error) {
    console.error('风格迁移失败:', error);
    // 这里可以添加错误提示
  } finally {
    loading.value = false;
  }
};

const downloadImage = async () => {
  if (!transferredImage.value) return;
  
  try {
    // 使用fetch获取图片数据
    const response = await fetch(transferredImage.value);
    if (!response.ok) throw new Error('网络请求失败');
    
    // 转换为blob
    const blob = await response.blob();
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `风格迁移_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载失败:', error);
    // 如果fetch方式失败，回退到原始方式
    const link = document.createElement('a');
    link.href = transferredImage.value;
    link.download = `风格迁移_${Date.now()}.png`;
    link.target = '_blank'; // 在新标签页打开，避免跨域问题
    link.click();
  }
};

const restartTransfer = () => {
  transferredImage.value = '';
  startTransfer();
};
</script>

<style scoped>
.style-transfer {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-section,
.style-section {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 100%;
}

.upload-section h3,
.style-section h3 {
  text-align: center;
  margin-bottom: 20px;
}

.upload-demo {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.upload-demo .el-upload--picture-card {
  margin: 0;
}

.button-container {
  max-width: 800px;
  margin: 20px auto 0;
  text-align: center;
}

.result-section {
  margin-top: 30px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.results-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
}

.result-item {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.result-image {
  width: 100%;
  max-height: 500px;
  margin-top: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.result-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>