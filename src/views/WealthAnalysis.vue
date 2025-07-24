<template>
  <div class="wealth-analysis">
    <el-card class="wealth-card" shadow="always">
      <div class="wealth-header">
        <h2>财富分析</h2>
        <p>以下是您的当前财富状况及建议：</p>
      </div>
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        正在加载数据...
      </div>
      <div v-else-if="error" class="error-container">
        <p>数据加载失败，请稍后重试</p>
        <el-button type="primary" @click="fetchWealthData">重试</el-button>
      </div>
      <div v-else class="wealth-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="stat-card">
              <h3>总收入</h3>
              <p class="stat-value">{{ wealthData.totalIncome | currency }}</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <h3>总支出</h3>
              <p class="stat-value">{{ wealthData.totalExpense | currency }}</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card">
              <h3>余额</h3>
              <p class="stat-value">{{ wealthData.balance | currency }}</p>
            </el-card>
          </el-col>
        </el-row>
        <div class="recommendation-section">
          <h3>建议</h3>
          <ul>
            <li v-for="(advice, index) in wealthData.recommendations" :key="index">
              {{ advice }}
            </li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

// 状态变量
const loading = ref(true)
const error = ref(false)
const wealthData = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  recommendations: []
})

// 获取财富分析数据的方法
const fetchWealthData = async () => {
  loading.value = true
  error.value = false
  try {
    const accountId = localStorage.getItem('accountId') // 假设用户登录后保存了 accountId
    if (!accountId) {
      throw new Error('账户 ID 丢失，请重新登录')
    }
    const response = await request.get('/main/analysis/summary', {
      params: { accountId } // 添加 accountId 参数
    })
    wealthData.value = response
    loading.value = false
  } catch (e) {
    ElMessage.error(e.message || '无法加载财富分析数据')
    error.value = true
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchWealthData()
})

// 货币格式化过滤器
const currency = (value) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value)
}
</script>

<style scoped>
.wealth-analysis {
  padding: 20px;
}
.wealth-card {
  border-radius: 12px;
}
.wealth-header h2 {
  font-weight: bold;
  color: #1976d2;
}
.wealth-header p {
  color: #555;
  margin-bottom: 20px;
}
.loading-container,
.error-container {
  text-align: center;
  margin: 20px 0;
}
.loading-icon {
  font-size: 24px;
  color: #1976d2;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.stat-card {
  text-align: center;
  border-radius: 8px;
}
.stat-card h3 {
  color: #555;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #1976d2;
}
.recommendation-section h3 {
  margin-top: 20px;
  font-weight: bold;
}
.recommendation-section ul {
  list-style: disc inside;
  color: #333;
}
.recommendation-section li {
  margin-bottom: 8px;
}
</style>