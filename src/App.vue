<script setup lang="ts">
import { ref, markRaw } from 'vue';
import FeaturedPatterns from './components/FeaturedPatterns.vue';
import { Loading } from '@element-plus/icons-vue';

// 懒加载其他组件，减少初始加载时间
const loadPatternGenerator = () => import('./components/PatternGenerator.vue');
const loadStyleTransfer = () => import('./components/StyleTransfer.vue');
const loadTextToImage = () => import('./components/TextToImage.vue');
const loadPatternInnovate = () => import('./components/PatternInnovate.vue');

// 当前选中的功能
const selectedFunction = ref<string | null>(null);
// 当前加载的组件
const currentComponent = ref<any>(null);
// 加载状态
const loading = ref(false);

// 功能列表
const functions = [
  { id: 'pattern-generator', name: '图案自动生成', icon: '🎨' },
  { id: 'style-transfer', name: '风格迁移', icon: '🖌️' },
  { id: 'text-to-image', name: '文生图', icon: '📝' },
  { id: 'pattern-innovate', name: '图案创新', icon: '✨' }
];

// 选择功能并加载对应组件
const selectFunction = async (funcId: string) => {
  if (selectedFunction.value === funcId) {
    // 如果点击的是当前选中的功能，则取消选中
    selectedFunction.value = null;
    currentComponent.value = null;
    return;
  }
  
  loading.value = true;
  selectedFunction.value = funcId;
  
  try {
    // 根据选中的功能ID加载对应的组件
    let componentModule;
    switch (funcId) {
      case 'pattern-generator':
        componentModule = await loadPatternGenerator();
        break;
      case 'style-transfer':
        componentModule = await loadStyleTransfer();
        break;
      case 'text-to-image':
        componentModule = await loadTextToImage();
        break;
      case 'pattern-innovate':
        componentModule = await loadPatternInnovate();
        break;
      default:
        return;
    }
    
    // 使用markRaw避免Vue响应式系统转换组件，提高性能
    currentComponent.value = markRaw(componentModule.default);
  } catch (error) {
    console.error('加载组件失败:', error);
    selectedFunction.value = null;
    currentComponent.value = null;
  } finally {
    loading.value = false;
  }
};

// 判断是否显示精选图案（当没有选中功能时显示）
const showFeaturedPatterns = () => {
  return !selectedFunction.value || currentComponent.value === null;
};
</script>

<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="logo-container">
        <img src="/src/assets/logo_sachet.png" alt="Sachet Logo" class="app-logo" />
        <h1 class="site-title">非遗香包图案生成系统</h1>
      </div>
    </header>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 左上角功能选择按钮组 -->
      <div class="function-buttons">
        <div
          v-for="func in functions"
          :key="func.id"
          :class="['function-button', { active: selectedFunction === func.id }]"
          @click="selectFunction(func.id)"
        >
          <span class="function-icon">{{ func.icon }}</span>
          <span class="function-name">{{ func.name }}</span>
        </div>
      </div>
      
      <!-- 内容显示区域 -->
      <div class="content-display">
        <!-- 加载状态指示器 -->
        <div v-if="loading" class="loading-container">
          <el-icon size="large"><Loading /></el-icon>
          <p>加载中...</p>
        </div>
        
        <!-- 精选图案显示区域 -->
        <FeaturedPatterns v-if="showFeaturedPatterns()" />
        
        <!-- 动态加载的功能组件 -->
        <div v-else-if="currentComponent" class="function-component">
          <component :is="currentComponent" />
        </div>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="app-footer">
      <p>非遗香包图案生成实践作业 &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style scoped>
/* 全局样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

/* 顶部标题栏 */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.app-logo {
  height: 40px;
  width: auto;
}

.site-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 左上角功能选择按钮组 */
.function-buttons {
  width: 200px;
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  overflow-y: auto;
}

.function-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.function-button:hover {
  background-color: #f5f5f5;
}

.function-button.active {
  background-color: #f0f4ff;
  border-left-color: #667eea;
  color: #667eea;
  font-weight: 600;
}

.function-icon {
  font-size: 1.5rem;
}

.function-name {
  font-size: 1rem;
}

/* 内容显示区域 */
.content-display {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 1rem;
  color: #667eea;
}

/* 功能组件容器 */
.function-component {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页脚 */
.app-footer {
  background-color: white;
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #eaeaea;
  color: #666;
  font-size: 0.9rem;
}

/* 滚动条样式优化 */
.function-buttons::-webkit-scrollbar,
.content-display::-webkit-scrollbar {
  width: 6px;
}

.function-buttons::-webkit-scrollbar-track,
.content-display::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.function-buttons::-webkit-scrollbar-thumb,
.content-display::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.function-buttons::-webkit-scrollbar-thumb:hover,
.content-display::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .function-buttons {
    width: 100%;
    height: auto;
    display: flex;
    padding: 0.5rem;
    overflow-x: auto;
    overflow-y: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .function-button {
    flex: 0 0 auto;
    padding: 0.75rem 1rem;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .function-button.active {
    border-left: none;
    border-bottom-color: #667eea;
  }
  
  .content-display {
    padding: 1rem;
  }
  
  .logo-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .app-logo {
    height: 30px;
  }
  
  .site-title {
    font-size: 1.3rem;
  }
}

@media (min-width: 1600px) {
  .function-buttons {
    width: 240px;
  }
  
  .function-name {
    font-size: 1.1rem;
  }
  
  .content-display {
    padding: 3rem;
  }
}
</style>