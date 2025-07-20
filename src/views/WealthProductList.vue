<template>
  <el-card class="product-list-card" shadow="hover">
    <div class="title-row">
      <span class="main-title">理财产品超市</span>
      <el-button class="close-btn" type="text" @click="goBack" circle>
        <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
          <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </el-button>
    </div>
    <el-table :data="products" style="width: 100%" border>
      <el-table-column prop="name" label="产品名称" width="160"/>
      <el-table-column prop="type" label="类型" width="90"/>
      <el-table-column prop="riskLevel" label="风险等级" width="90"/>
      <el-table-column prop="interestRate" label="年化收益率" width="120">
        <template #default="scope">
          <span>{{ $formatMoney(scope.row.interestRate * 100) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="minAmount" label="起购金额" width="110">
        <template #default="scope">
          {{ $formatMoney(scope.row.minAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80"/>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
              type="primary"
              size="small"
              :disabled="!['上架', '在售'].includes(scope.row.status?.trim?.())"
              @click="openPurchaseDialog(scope.row)"
          >申购</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 申购弹窗 -->
    <el-dialog v-model="purchaseDialogVisible" title="申购理财产品" width="350px">
      <div v-if="selectedProduct">
        <div>产品：<b>{{ selectedProduct.name }}</b></div>
        <div>起购金额：{{ $formatMoney(selectedProduct.minAmount) }}</div>
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
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])
const purchaseDialogVisible = ref(false)
const selectedProduct = ref(null)
const purchaseAmount = ref(0)
const purchaseLoading = ref(false)

const goBack = () => {
  router.back()
}

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
  // 获取产品列表，适配分页和非分页后端返回
  const res = await request.get('/wealth/product/list')
  if (res && Array.isArray(res.content)) {
    products.value = res.content
  } else if (Array.isArray(res)) {
    products.value = res
  } else {
    products.value = []
  }
})
</script>

<style scoped>
.product-list-card {
  max-width: 900px;
  margin: 38px auto;
  border-radius: 18px;
  box-shadow: 0 4px 28px rgba(25,118,210,0.08);
  position: relative;
}
.title-row {
  margin-bottom: 20px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  min-height: 44px;
}
.main-title {
  font-size: 1.44rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.5px;
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  z-index: 10;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.close-btn:hover svg path {
  stroke: #1976d2;
}
</style>