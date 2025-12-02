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
        <div class="style-presets" v-if="targetStyle">
          <h4>风格预览</h4>
          <div class="preset-images">
            <div
              v-for="(preset, index) in stylePresets"
              :key="index"
              class="preset-item"
              :class="{ active: preset.style === targetStyle }"
              @click="targetStyle = preset.style"
            >
              <el-image :src="preset.preview" fit="cover"></el-image>
              <span>{{ preset.name }}</span>
            </div>
          </div>
        </div>
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

// 风格预设
const stylePresets = ref([
  { style: 'classical_oil', name: '古典油画', preview: 'https://picsum.photos/id/101/200/200' },
  { style: 'watercolor', name: '水彩画', preview: 'https://picsum.photos/id/102/200/200' },
  { style: 'chinese_ink', name: '水墨画', preview: 'https://picsum.photos/id/103/200/200' },
  { style: 'van_gogh', name: '梵高风格', preview: 'https://picsum.photos/id/104/200/200' },
  { style: 'picasso', name: '毕加索风格', preview: 'https://picsum.photos/id/105/200/200' },
  { style: 'pop_art', name: '波普艺术', preview: 'https://picsum.photos/id/106/200/200' },
  { style: 'cyberpunk', name: '赛博朋克', preview: 'https://picsum.photos/id/107/200/200' },
  { style: 'vaporwave', name: '蒸汽波', preview: 'https://picsum.photos/id/108/200/200' }
]);

const handleFileChange = (file) => {
  // 将文件转换为URL
  const reader = new FileReader();
  reader.onload = (e) => {
    file.url = e.target.result;
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
    // 调用API进行风格迁移
    const result = await styleTransfer({
      type: 'style_transfer',
      params: {
        image: selectedFile.value.url, // 实际使用时需要转换为base64或上传文件
        target_style: targetStyle.value
      }
    });
    // 假设API返回的是图片URL
    transferredImage.value = result.image_url;
  } catch (error) {
    console.error('风格迁移失败:', error);
    // 这里可以添加错误提示
  } finally {
    loading.value = false;
  }
};

const downloadImage = () => {
  if (transferredImage.value) {
    const link = document.createElement('a');
    link.href = transferredImage.value;
    link.download = `style-transfer-${Date.now()}.png`;
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

.style-presets {
  margin-top: 20px;
  text-align: center;
}

.preset-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 15px;
  margin-top: 15px;
  justify-content: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.preset-item {
  width: 100px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.3s;
  margin: 0 auto;
}

.preset-item:hover {
  transform: scale(1.05);
}

.preset-item.active {
  border-color: #409eff;
}

.preset-item img {
  width: 100%;
  height: 80px;
  border-radius: 4px;
}

.preset-item span {
  display: block;
  text-align: center;
  font-size: 12px;
  margin-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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