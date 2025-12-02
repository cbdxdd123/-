import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'https://api.qwen-image-plus.com', // 假设的API地址，实际使用时需要替换
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 香包图案生成
export const generateBagPattern = async (params) => {
  try {
    const response = await apiClient.post('/generate', params);
    return response;
  } catch (error) {
    throw error;
  }
};

// 风格迁移
export const styleTransfer = async (params) => {
  try {
    const response = await apiClient.post('/style-transfer', params);
    return response;
  } catch (error) {
    throw error;
  }
};

// 文生图
export const textToImage = async (params) => {
  try {
    const response = await apiClient.post('/text-to-image', params);
    return response;
  } catch (error) {
    throw error;
  }
};

// 图案创新
export const innovatePattern = async (params) => {
  try {
    const response = await apiClient.post('/innovate', params);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  generateBagPattern,
  styleTransfer,
  textToImage,
  innovatePattern
};
