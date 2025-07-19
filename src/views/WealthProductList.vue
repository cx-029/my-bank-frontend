<template>
  <el-card class="product-list-card" shadow="hover">
    <div class="title-row">
      <span class="main-title">理财产品超市</span>
    </div>
    <el-table :data="products" style="width: 100%" border>
      <el-table-column prop="name" label="产品名称" width="160"/>
      <el-table-column prop="type" label="类型" width="90"/>
      <el-table-column prop="riskLevel" label="风险等级" width="90"/>
      <el-table-column prop="interestRate" label="年化收益率" width="120">
        <template #default="scope">
          <span>{{ (scope.row.interestRate * 100).toFixed(2) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="minAmount" label="起购金额" width="110"/>
      <el-table-column prop="status" label="状态" width="80"/>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
              type="primary"
              size="small"
              :disabled="scope.row.status !== '上架'"
              @click="openPurchaseDialog(scope.row)"
          >申购</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 申购弹窗 -->
    <el-dialog v-model="purchaseDialogVisible" title="申购理财产品" width="350px">
      <div v-if="selectedProduct">
        <div>产品：<b>{{ selectedProduct.name }}</b></div>
        <div>起购金额：{{ selectedProduct.minAmount }}</div>
        <el-input-number v-model="purchaseAmount" :min="selectedProduct.minAmount" label="申购金额" style="margin: 12px 0; width: 90%"/>
      </div>
      <template #footer>
        <el-button @click="purchaseDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmPurchase" :loading="purchaseLoading">确认申购</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const products = ref([])
const purchaseDialogVisible = ref(false)
const selectedProduct = ref(null)
const purchaseAmount = ref(0)
const purchaseLoading = ref(false)

const openPurchaseDialog = (product) => {
  selectedProduct.value = product
  purchaseAmount.value = product.minAmount
  purchaseDialogVisible.value = true
}

const confirmPurchase = async () => {
  if (purchaseAmount.value < selectedProduct.value.minAmount) {
    ElMessage.warning('申购金额不能低于起购金额')
    return
  }
  purchaseLoading.value = true
  try {
    const customerId = localStorage.getItem('customerId') // 登录后存储的customerId
    await request.post('/wealth/position/purchase', {
      customerId,
      productId: selectedProduct.value.id,
      amount: purchaseAmount.value
    })
    ElMessage.success('申购成功')
    purchaseDialogVisible.value = false
  } catch (e) {
    // 错误已统一处理
  }
  purchaseLoading.value = false
}

onMounted(async () => {
  // 获取产品列表
  const res = await request.get('/wealth/product/list')
  products.value = Array.isArray(res) ? res : []
})
</script>

<style scoped>
.product-list-card {
  max-width: 900px;
  margin: 38px auto;
  border-radius: 18px;
  box-shadow: 0 4px 28px rgba(25,118,210,0.08);
}
.title-row {
  margin-bottom: 20px;
  text-align: left;
}
.main-title {
  font-size: 1.44rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.5px;
}
</style>