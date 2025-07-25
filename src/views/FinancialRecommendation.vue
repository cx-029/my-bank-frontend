<template>
  <div class="financial-rec-wrapper">
    <el-card class="financial-rec-card" shadow="hover">
      <div class="rec-header">
        <h1>理财推荐</h1>
        <p>基于您的财务分析数据，为您量身推荐以下理财产品：</p>
      </div>
      <div class="rec-body">
        <h2>推荐产品：</h2>
        <ul>
          <li v-for="(product, index) in recommendedProducts" :key="index">
            <el-icon class="product-icon"><Promotion /></el-icon>
            {{ product }}
          </li>
        </ul>
        <h2>综合评分：</h2>
        <p class="score">{{ totalScore }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { Promotion } from "@element-plus/icons-vue";

// 状态变量
const recommendedProducts = ref([]);
const totalScore = ref(0);

onMounted(async () => {
  try {
    // 调用推荐服务 API
    const { data } = await axios.post("/api/recommendations", { accountId: 1 });

    // 更新推荐产品和评分信息
    recommendedProducts.value = data.recommendations || [];
    totalScore.value = data.score || 0;
  } catch (error) {
    ElMessage.error("获取理财推荐失败，请稍后重试！");
  }
});
</script>

<style scoped>
.financial-rec-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: linear-gradient(120deg, #f7fafd 60%, #e6eeff 100%);
}

.financial-rec-card {
  max-width: 520px;
  width: 90%;
  padding: 20px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(25, 50, 110, 0.13);
}

.rec-header h1 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1976d2;
  text-align: center;
  margin-bottom: 8px;
}

.rec-header p {
  font-size: 1rem;
  color: #447;
  text-align: center;
  margin-bottom: 12px;
}

.rec-body h2 {
  font-size: 1.4rem;
  color: #1976d2;
  margin-bottom: 8px;
}

.rec-body ul {
  list-style-type: none;
  padding: 0;
}

.rec-body ul li {
  margin-bottom: 8px;
  font-size: 1.1rem;
  color: #384055;
  display: flex;
  align-items: center;
}

.product-icon {
  margin-right: 8px;
  font-size: 1.2rem;
  color: #1976d2;
}

.score {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  color: #1976d2;
  margin-top: 8px;
}
</style>