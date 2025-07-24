<template>
  <div class="wealth-analysis-container">
    <!-- 标题部分 -->
    <h1 class="header-title">财富分析</h1>
    <div class="title-decoration"></div>

    <!-- 总体提示语 -->
    <p class="page-description">
      欢迎来到您的财富分析页面！以下是基于您近期活动的财富数据总结。
    </p>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <p>正在加载您的财富数据，请稍候...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>加载失败，请重试。</p>
      <el-button type="primary" @click="fetchWealthData">重试</el-button>
    </div>

    <!-- 卡片内容 -->
    <div v-else class="card-container">
      <div
          v-for="(item, index) in cardItems"
          :key="index"
          class="card"
          :title="item.tooltip"
      >
        <div class="card-header">
          <el-icon :size="32">
            <component :is="item.icon" />
          </el-icon>
          <h3>{{ item.title }}</h3>
        </div>
        <p class="data-value">{{ item.value }}</p>
        <p class="data-advice">{{ item.advice }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 引入所需模块
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import {
  TrendCharts,
  DataBoard,
  Coin,
  Wallet,
  Refresh,
  ShoppingCartFull,
} from '@element-plus/icons-vue';

// 状态变量
const loading = ref(true);
const error = ref(false);
const wealthData = ref({});

// 卡片内容配置
const cardItems = ref([]);

// 获取数据
const fetchWealthData = async () => {
  loading.value = true;
  error.value = false;

  try {
    const accountId = localStorage.getItem('accountId') || 2; // 默认 ID
    const response = await axios.get('/api/main/analysis/summary', { params: { accountId } });
    wealthData.value = response.data;

    // 动态生成卡片内容
    cardItems.value = [
      {
        title: '收入稳定性',
        value: formatNumber(wealthData.value.incomeStability),
        advice: wealthData.value.incomeStabilityAdvice,
        tooltip: '收入稳定性是衡量收入变化幅度的指标，值越大表明波动越大。',
        icon: TrendCharts,
      },
      {
        title: '支出稳定性',
        value: formatNumber(wealthData.value.expenseStability),
        advice: wealthData.value.expenseStabilityAdvice,
        tooltip: '支出稳定性是衡量支出变化幅度的指标，值越大表明波动越大。',
        icon: DataBoard,
      },
      {
        title: '收入趋势',
        value: formatTrend(wealthData.value.incomeTrend),
        advice: wealthData.value.incomeTrendAdvice,
        tooltip: '收入趋势表示收入的增长或下降百分比，用于跟踪收入变化。',
        icon: Coin,
      },
      {
        title: '支出趋势',
        value: formatTrend(wealthData.value.expenseTrend),
        advice: wealthData.value.expenseTrendAdvice,
        tooltip: '支出趋势表示支出的增长或下降百分比，用于跟踪消费变化。',
        icon: ShoppingCartFull,
      },
      {
        title: '理财收益贡献',
        value: `${formatNumber(wealthData.value.investmentContribution)}%`,
        advice: wealthData.value.investmentAdvice,
        tooltip: '理财收益贡献是指理财收益在整体财富中的占比。',
        icon: Wallet,
      },
      {
        title: '最高消费类别',
        value: wealthData.value.topExpenseCategory,
        advice: wealthData.value.expenseCategoryAdvice,
        tooltip: '最高消费类别是指您花费最多的消费类别。',
        icon: ShoppingCartFull,
      },
      {
        title: '平均现金流',
        value: formatNumber(wealthData.value.averageCashFlow),
        advice: wealthData.value.cashFlowAdvice,
        tooltip: '平均现金流是指平均每个周期内的现金流入或流出。',
        icon: Wallet,
      },
      {
        title: '资金流动性',
        value: wealthData.value.liquidityDays || '30 天',
        advice: wealthData.value.liquidityAdvice || '建议优化流动性以提高资金使用效率。',
        tooltip: '资金流动性是指资金在短时间内变现的能力，天数越少流动性越好。',
        icon: Refresh,
      },
    ];

    loading.value = false;
  } catch (e) {
    console.error('请求失败：', e);
    ElMessage.error('加载数据失败，请重试。');
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
      .map((t) => (t === 'Infinity' || t === Infinity ? '无穷大' : parseFloat(t).toFixed(2)))
      .join(', ');
};
</script>

<style scoped>
/* 容器样式 */
.wealth-analysis-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(to bottom, #f5f7fa, #e8f4fc);
  border-radius: 12px;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
}

/* 标题样式 */
.header-title {
  text-align: center;
  color: #1e88e5;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
}

.title-decoration {
  height: 4px;
  width: 150px;
  background: #1e88e5;
  margin: 0 auto 20px;
  border-radius: 2px;
}

.page-description {
  text-align: center;
  font-size: 16px;
  color: #555;
  margin-bottom: 30px;
}

/* 加载状态样式 */
.loading-state {
  text-align: center;
  font-size: 18px;
  color: #666;
}

.loading-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

/* 卡片容器样式 */
.card-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.card {
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  padding: 20px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.card-header el-icon {
  color: #1e88e5;
}

.card h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.card .data-value {
  margin: 10px 0;
  font-size: 24px;
  font-weight: bold;
  color: #1e88e5;
}

.card .data-advice {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}
</style>