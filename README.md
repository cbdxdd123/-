# 香包图案生成器 (Sachet Pattern Generator)

基于 Vue 3 + TypeScript + Vite 开发的香包图案生成 Web 应用，接入阿里云 DashScope AI 能力，支持多种图案生成与处理功能。

## 功能特点

- 🎨 **图案自动生成** - AI 智能生成香包图案
- 🖌️ **风格迁移** - 将图案转换为不同艺术风格
- 📝 **文生图** - 通过文字描述生成对应图案
- ✨ **图案创新** - AI 辅助创新设计

## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- TypeScript
- Vite
- Element Plus
- 阿里云 DashScope API

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置 API 密钥

1. 复制 `.env.local.example` 为 `.env.local`（如不存在请创建）
2. 在 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/) 获取 API 密钥
3. 在 `.env.local` 中配置：

```env
VITE_DASHSCOPE_API_KEY=your-api-key-here
```

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/       # Vue 组件
│   ├── FeaturedPatterns.vue
│   ├── PatternGenerator.vue
│   ├── StyleTransfer.vue
│   ├── TextToImage.vue
│   └── PatternInnovate.vue
├── services/         # API 服务
│   ├── imageApi.js
│   ├── testApi.js
│   └── apiDiagnostics.js
├── assets/           # 静态资源
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 注意事项

- API 密钥配置在 `.env.local` 文件中，该文件已加入 `.gitignore`，不会提交到版本库
- 请勿将包含真实 API 密钥的配置文件推送到公开仓库

## License

MIT
