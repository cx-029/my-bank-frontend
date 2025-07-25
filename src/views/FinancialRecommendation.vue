<template>
  <div class="financial-rec-tabs">
    <!-- 顶部标题 -->
    <div class="header">
      <h1>📊 理财推荐与评分分析</h1>
      <p>基于您的财务数据，提供个性化的评分和理财产品推荐。</p>
    </div>

    <!-- Tabs 切换内容 -->
    <el-tabs v-model="activeTab" stretch>
      <!-- 评分详情标签页 -->
      <el-tab-pane label="评分详情" name="scores">
        <div class="tab-content">
          <div class="scores-grid">
            <div class="score-item" v-for="(value, key) in scores" :key="key">
              <div class="score-item-header">
                <span class="key">{{ getScoreDescription(key) }}</span>
                <span class="key-en">({{ key }})</span>
              </div>
              <span class="value">{{ value.toFixed(2) }} 分</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 推荐产品标签页 -->
      <el-tab-pane label="推荐产品" name="recommendations">
        <div class="tab-content">
          <ul class="recommendations-list">
            <li v-for="(product, index) in recommendations" :key="index">
              🏦 {{ product }}
            </li>
          </ul>
        </div>
      </el-tab-pane>

      <!-- 评分解释标签页 -->
      <el-tab-pane label="评分解释" name="explanations">
        <div class="tab-content">
          <div class="explanations">
            <h3>评分指标解释</h3>
            <ul>
              <li><strong>收入稳定性 (Income Stability)：</strong> 表示收入波动情况，分数越高，收入越稳定。</li>
              <li><strong>支出稳定性 (Expense Stability)：</strong> 表示支出波动情况，分数越高，支出越稳定。</li>
              <li><strong>现金流 (Cash Flow)：</strong> 反映平均月现金流，分数越高表示现金流越健康。</li>
              <li><strong>流动性 (Liquidity)：</strong> 短期资金储备能力，分数越高越好。</li>
              <li><strong>投资贡献 (Investment Contribution)：</strong> 表示投资收益对整体收入的贡献，分数越高表示投资规划更合理。</li>
              <li><strong>收入趋势 (Income Trend)：</strong> 收入随时间的变化趋势，分数越高表明趋势更积极。</li>
              <li><strong>支出趋势 (Expense Trend)：</strong> 支出随时间的变化趋势，分数越高表明支出控制更合理。</li>
            </ul>
            <h3>评分范围</h3>
            <ul>
              <li>80-100 分：优秀 🌟</li>
              <li>60-79 分：良好 👍</li>
              <li>40-59 分：需改进 ⚠️</li>
              <li>0-39 分：较差 ❌</li>
            </ul>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

// 数据状态变量
const scores = ref({});
const recommendations = ref([]);
const activeTab = ref("scores");

// 获取评分中文和英文注释
const getScoreDescription = (key) => {
  const descriptions = {
    incomeStabilityScore: "收入稳定性",
    expenseStabilityScore: "支出稳定性",
    cashFlowScore: "现金流",
    liquidityScore: "流动性",
    investmentContributionScore: "投资贡献",
    incomeTrendScore: "收入趋势",
    expenseTrendScore: "支出趋势",
  };
  return descriptions[key] || "未知评分项";
};

// 使用 axios 请求后端
onMounted(async () => {
  try {
    const accountId = 1; // 示例账户ID
    const { data } = await axios.post("/api/recommendations", { accountId });

    scores.value = data.scores || {};
    recommendations.value = data.recommendations || [];
  } catch (error) {
    ElMessage.error("无法加载数据，请稍后重试！");
  }
});
</script>

<style scoped>
/* 页面布局 */
.financial-rec-tabs {
  padding: 30px;
  background: linear-gradient(120deg, #f7fafd 60%, #e6eeff 100%);
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  font-size: 2.6rem;
  color: #1976d2;
  font-weight: bold;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.1rem;
  color: #555;
}

.tab-content {
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
}

/* 评分列表样式 */
.scores-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.score-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.score-item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.score-item .key {
  font-weight: bold;
  color: #1976d2;
  font-size: 1.2rem;
}

.score-item .key-en {
  font-size: 0.9rem;
  color: #888;
  margin-left: 8px;
}

.score-item .value {
  font-weight: bold;
  color: #444;
  font-size: 1.2rem;
}

/* 推荐产品列表样式 */
.recommendations-list {
  list-style: none;
  padding: 0;
}

.recommendations-list li {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

/* 评分解释样式 */
.explanations h3 {
  font-size: 1.4rem;
  color: #1976d2;
  margin-bottom: 12px;
  font-weight: bold;
}

.explanations ul li {
  font-size: 1rem;
  color: #444;
  margin-bottom: 8px;
}

.explanations ul li strong {
  color: #1976d2;
}
</style>