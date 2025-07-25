<template>
  <el-card class="personal-recommendation-card" shadow="always">
    <div class="recommendation-header">
      <el-icon class="header-icon"><Flag /></el-icon>
      <h2 class="header-title">个性化建议</h2>
      <el-button
          type="primary"
          icon="Refresh"
          circle
          size="medium"
          class="refresh-button"
          @click="forceRefresh"
      ></el-button>
    </div>
    <div v-if="loading" class="loading-area">
      <el-icon class="loading-spin"><Loading /></el-icon>
      <span>正在加载个性化建议...</span>
    </div>
    <div v-else class="markdown-container">
      <div v-html="renderedMarkdown" class="markdown-content"></div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Loading, Flag } from "@element-plus/icons-vue";
import axios from "axios";
import { marked } from "marked"; // 使用 marked 库渲染 Markdown

const loading = ref(true);
const aiAnalysis = ref(""); // 保存后端返回的 Markdown 文档
const renderedMarkdown = ref(""); // 渲染后的 HTML 内容

// 缓存相关配置
const CACHE_KEY = "aiAnalysisCache"; // 缓存键名
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 缓存有效期（24小时）

/**
 * 从缓存加载数据
 */
function loadFromCache() {
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const parsedCache = JSON.parse(cache);
    const now = new Date().getTime();
    if (now - parsedCache.timestamp < CACHE_EXPIRATION) {
      aiAnalysis.value = parsedCache.data;
      renderedMarkdown.value = marked(aiAnalysis.value);
      loading.value = false;
      return true;
    }
  }
  return false;
}

/**
 * 保存数据到缓存
 */
function saveToCache(data) {
  const cache = {
    data,
    timestamp: new Date().getTime(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

/**
 * 强制刷新数据
 */
async function forceRefresh() {
  localStorage.removeItem(CACHE_KEY);
  await fetchPersonalRecommendations(true);
}

/**
 * 请求后端接口
 */
async function fetchPersonalRecommendations(isForce = false) {
  // 如果不是强制刷新，尝试从缓存加载
  if (!isForce && loadFromCache()) {
    ElMessage.success("个性化建议已从缓存加载！");
    return;
  }

  loading.value = true;
  try {
    const scores = {
      liquidityScore: 80.0,
      incomeTrendScore: 91.0,
      cashFlowScore: 90.0,
      expenseStabilityScore: 95.0,
      incomeStabilityScore: 95.0,
      investmentContributionScore: 50.0,
      expenseTrendScore: 5.0,
    };

    const { data } = await axios.post("/api/ai/analysis", scores);
    aiAnalysis.value = data.aiAnalysis || "";

    // 将 Markdown 转换为 HTML
    renderedMarkdown.value = marked(aiAnalysis.value);

    // 保存到缓存
    saveToCache(aiAnalysis.value);

    ElMessage.success("个性化建议加载成功！");
  } catch (error) {
    console.error("加载个性化建议失败:", error);
    ElMessage.error("加载个性化建议失败，请稍后重试！");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchPersonalRecommendations();
});
</script>

<style scoped>
/* 卡片样式 */
.personal-recommendation-card {
  padding: 20px;
  border-radius: 16px;
  font-family: 'Inter', 'PingFang SC', 'Arial', sans-serif;
  max-width: 900px;
  margin: auto;
  background-color: #fdfdfd;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

/* 标题栏样式 */
.recommendation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 10px;
}

.header-title {
  font-size: 24px; /* 更大的标题字体 */
  color: #2c3e50;
  margin: 0;
  flex-grow: 1;
}

.header-icon {
  font-size: 28px;
  color: #409eff;
  margin-right: 10px;
}

.refresh-button {
  margin-left: 10px;
}

/* 加载区域样式 */
.loading-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* 更高的加载区域 */
  font-size: 18px; /* 更大的字体 */
  color: #666;
}

/* Markdown 容器样式 */
.markdown-container {
  margin-top: 25px;
  overflow-y: auto;
  max-height: 70vh; /* 限制高度以适应一页显示 */
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.05);
  line-height: 1.6; /* 行距缩短 */
}

/* Markdown 内容样式 */
.markdown-content {
  font-size: 18px; /* 增大字体 */
  line-height: 1.6; /* 调整行距为 1.6 */
  color: #333;
  word-wrap: break-word;
  white-space: pre-wrap;
  padding: 10px;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  color: #2c3e50;
  margin-top: 20px; /* 调整标题的顶部间距 */
  margin-bottom: 10px;
  font-weight: bold;
  border-bottom: 2px solid #eaeaea; /* 更加明显的分隔线 */
  padding-bottom: 6px;
}

.markdown-content p {
  margin-bottom: 10px; /* 缩小段落间隔 */
  text-align: justify;
}

.markdown-content ul {
  padding-left: 25px;
  list-style-type: disc;
  margin-bottom: 10px; /* 缩小列表间隔 */
}

.markdown-content ol {
  padding-left: 25px;
  list-style-type: decimal;
  margin-bottom: 10px; /* 缩小列表间隔 */
}

.markdown-content a {
  color: #409eff;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

/* 图片样式，限制大小 */
.markdown-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 15px auto;
}
</style>