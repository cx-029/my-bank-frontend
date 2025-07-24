<template>
  <div class="wealth-analysis-container">
    <h1 class="header-title">财富分析</h1>
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>加载失败，请重试。</p>
      <button @click="fetchWealthData" class="retry-button">重试</button>
    </div>
    <div v-else class="card-container">
      <!-- 收入稳定性 -->
      <div class="card" title="收入稳定性是衡量收入变化幅度的指标，值越大表明波动越大。">
        <h3>收入稳定性</h3>
        <p class="data-value">{{ formatNumber(wealthData.incomeStability) }}</p>
        <p class="data-advice">{{ wealthData.incomeStabilityAdvice }}</p>
      </div>

      <!-- 支出稳定性 -->
      <div class="card" title="支出稳定性是衡量支出变化幅度的指标，值越大表明波动越大。">
        <h3>支出稳定性</h3>
        <p class="data-value">{{ formatNumber(wealthData.expenseStability) }}</p>
        <p class="data-advice">{{ wealthData.expenseStabilityAdvice }}</p>
      </div>

      <!-- 收入趋势 -->
      <div class="card" title="收入趋势表示收入的增长或下降百分比，用于跟踪收入变化。">
        <h3>收入趋势</h3>
        <p class="data-value">{{ formatTrend(wealthData.incomeTrend) }}</p>
        <p class="data-advice">{{ wealthData.incomeTrendAdvice }}</p>
      </div>

      <!-- 支出趋势 -->
      <div class="card" title="支出趋势表示支出的增长或下降百分比，用于跟踪消费变化。">
        <h3>支出趋势</h3>
        <p class="data-value">{{ formatTrend(wealthData.expenseTrend) }}</p>
        <p class="data-advice">{{ wealthData.expenseTrendAdvice }}</p>
      </div>

      <!-- 理财收益贡献 -->
      <div class="card" title="理财收益贡献是指理财收益在整体财富中的占比。">
        <h3>理财收益贡献</h3>
        <p class="data-value">{{ formatNumber(wealthData.investmentContribution) }}%</p>
        <p class="data-advice">{{ wealthData.investmentAdvice }}</p>
      </div>

      <!-- 最高消费类别 -->
      <div class="card" title="最高消费类别是指您花费最多的消费类别。">
        <h3>最高消费类别</h3>
        <p class="data-value">{{ wealthData.topExpenseCategory }}</p>
        <p class="data-advice">{{ wealthData.expenseCategoryAdvice }}</p>
      </div>

      <!-- 平均现金流 -->
      <div class="card" title="平均现金流是指平均每个周期内的现金流入或流出。">
        <h3>平均现金流</h3>
        <p class="data-value">{{ formatNumber(wealthData.averageCashFlow) }}</p>
        <p class="data-advice">{{ wealthData.cashFlowAdvice }}</p>
      </div>

      <!-- 资金流动性 -->
      <div class="card" title="资金流动性是指资金在短时间内变现的能力，天数越少流动性越好。">
        <h3>资金流动性</h3>
        <p class="data-value">{{ wealthData.liquidityDays }}</p>
        <p class="data-advice">{{ wealthData.liquidityAdvice }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 状态变量
const loading = ref(true);
const error = ref(false);
const wealthData = ref({});

// 获取数据
const fetchWealthData = async () => {
  loading.value = true;
  error.value = false;

  try {
    const accountId = localStorage.getItem('accountId') || 2; // 默认 ID
    const response = await axios.get('/api/main/analysis/summary', { params: { accountId } });
    wealthData.value = response.data;
    loading.value = false;
  } catch (e) {
    console.error('请求失败：', e);
    error.value = true;
    loading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchWealthData();
});

// 格式化数字（保留两位小数）
const formatNumber = (value) => {
  if (value === undefined || value === null) return '无数据';
  if (typeof value === 'number' && !isFinite(value)) return '无穷大';
  return parseFloat(value).toFixed(2);
};

// 格式化趋势数据
const formatTrend = (trend) => {
  if (!trend || trend.length === 0) return '无数据';
  return trend
      .map(t => (t === 'Infinity' || t === Infinity ? '无穷大' : parseFloat(t).toFixed(2)))
      .join(', ');
};
</script>

<style scoped>
/* 容器样式 */
.wealth-analysis-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

/* 标题样式 */
.header-title {
  text-align: center;
  color: #1976d2;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 加载状态样式 */
.loading-state, .error-state {
  text-align: center;
  font-size: 16px;
  color: #666;
}

.retry-button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
}

.retry-button:hover {
  background: #1565c0;
}

/* 卡片容器样式 */
.card-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 四列 */
  gap: 20px; /* 卡片间距 */
}

/* 卡片样式 */
.card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}

.card h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.card .data-value {
  margin: 10px 0;
  font-size: 20px;
  font-weight: bold;
  color: #1976d2;
}

.card .data-advice {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}
</style>