<template>
  <div class="featured-patterns">
    <div class="section-header">
      <h2>精选香包图案</h2>
      <p class="section-description">展示生成过的优质香包图案，供您参考和欣赏</p>
    </div>
    
    <div class="patterns-grid">
      <div
        v-for="(pattern, index) in featuredPatterns"
        :key="index"
        class="pattern-card"
        @click="showImagePreview(pattern.image)"
      >
        <div class="image-container">
          <el-image :src="pattern.image" fit="cover" lazy></el-image>
          <div class="card-overlay">
            <span class="view-icon">👁️</span>
          </div>
        </div>
        <div class="pattern-info">
          <h4>{{ pattern.title }}</h4>
          <p>{{ pattern.description }}</p>
          <div class="pattern-tags">
            <el-tag v-for="(tag, tagIndex) in pattern.tags" :key="tagIndex" size="small" effect="plain">{{ tag }}</el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图片预览 -->
    <el-dialog v-model="dialogVisible" title="图片预览" width="80%" center>
      <el-image :src="dialogImageUrl" fit="contain" class="preview-image"></el-image>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 精选图案数据（使用示例数据）
const featuredPatterns = ref([
  {
    title: '传统龙凤呈祥',
    description: '融合中国传统龙凤元素的经典香包图案',
    image: 'https://picsum.photos/id/1015/400/300',
    tags: ['传统', '经典', '龙凤']
  },
  {
    title: '现代简约花卉',
    description: '现代简约风格的花卉香包设计',
    image: 'https://picsum.photos/id/1025/400/300',
    tags: ['现代', '简约', '花卉']
  },
  {
    title: '民族风几何纹样',
    description: '少数民族特色的几何纹样香包',
    image: 'https://picsum.photos/id/1035/400/300',
    tags: ['民族风', '几何', '传统']
  },
  {
    title: '古典青花瓷风',
    description: '融合青花瓷元素的典雅香包图案',
    image: 'https://picsum.photos/id/1045/400/300',
    tags: ['青花瓷', '典雅', '传统']
  },
  {
    title: '未来主义创新',
    description: '结合传统元素与未来主义风格的创新设计',
    image: 'https://picsum.photos/id/1055/400/300',
    tags: ['创新', '未来主义', '融合']
  },
  {
    title: '东方韵味花鸟',
    description: '东方传统花鸟纹样的精美香包设计',
    image: 'https://picsum.photos/id/1065/400/300',
    tags: ['花鸟', '东方', '传统']
  }
]);

// 图片预览相关
const dialogVisible = ref(false);
const dialogImageUrl = ref('');

// 显示图片预览
const showImagePreview = (imageUrl) => {
  dialogImageUrl.value = imageUrl;
  dialogVisible.value = true;
};
</script>

<style scoped>
.featured-patterns {
  width: 100%;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.featured-patterns h2 {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  position: relative;
  display: inline-block;
}

.featured-patterns h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.section-description {
  margin: 0;
  font-size: 16px;
  color: #606266;
  max-width: 600px;
  margin: 10px auto 0;
  line-height: 1.6;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  justify-items: center;
}

.pattern-card {
  width: 100%;
  max-width: 350px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.pattern-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #e0e7ff;
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.pattern-card:hover .image-container img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pattern-card:hover .card-overlay {
  opacity: 1;
}

.view-icon {
  font-size: 32px;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.pattern-info {
  padding: 20px;
  text-align: left;
}

.pattern-info h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  transition: color 0.3s ease;
}

.pattern-card:hover h4 {
  color: #667eea;
}

.pattern-info p {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pattern-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.pattern-tags :deep(.el-tag) {
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
}

.preview-image {
  width: 100%;
  max-height: 70vh;
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .featured-patterns {
    padding: 16px;
  }
  
  .featured-patterns h2 {
    font-size: 24px;
  }
  
  .section-description {
    font-size: 14px;
    padding: 0 10px;
  }
  
  .patterns-grid {
    gap: 16px;
  }
  
  .pattern-card {
    max-width: 100%;
  }
  
  .pattern-info {
    padding: 16px;
  }
}

@media (min-width: 1200px) {
  .patterns-grid {
    grid-template-columns: repeat(3, minmax(280px, 1fr));
  }
}

@media (min-width: 1600px) {
  .patterns-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
  }
  
  .featured-patterns {
    padding: 30px;
  }
  
  .featured-patterns h2 {
    font-size: 32px;
  }
}
</style>