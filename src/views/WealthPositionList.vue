<template>
  <el-card class="position-list-card" shadow="hover">
    <div class="title-row">
      <span class="main-title">我的理财持仓</span>
      <el-button class="close-btn" type="text" @click="goBack" circle>
        <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
          <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </el-button>
    </div>
    <el-table :data="positions" style="width: 100%" border>
      <el-table-column prop="productName" label="产品名称" width="160"/>
      <el-table-column prop="amount" label="持有金额" width="110">
        <template #default="scope">
          {{ $formatMoney(scope.row.amount) }}
        </template>
      </el-table-column>
      <el-table-column prop="expectedIncome" label="预估收益" width="110">
        <template #default="scope">
          {{ $formatMoney(scope.row.expectedIncome) }}
        </template>
      </el-table-column>
      <el-table-column prop="purchaseDate" label="申购日期" width="120"/>
      <el-table-column prop="status" label="状态" width="90"/>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
              size="small"
              type="warning"
              :disabled="!(scope.row.status.includes('持有'))"
              @click="openRedeemDialog(scope.row)"
          >赎回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 赎回弹窗 -->
    <el-dialog v-model="redeemDialogVisible" title="赎回理财产品" width="350px">
      <div v-if="selectedPosition">
        <div>产品：<b>{{ selectedPosition.productName }}</b></div>
        <div>可赎回金额：{{ $formatMoney(selectedPosition.amount) }}</div>
        <el-input-number v-model="redeemAmount" :min="1" :max="selectedPosition.amount" label="赎回金额" style="margin: 12px 0; width: 90%"/>
      </div>
      <div v-if="redeemResult !== null" class="redeem-result" style="margin:10px 0 0 0;">
        <el-alert
            :title="`赎回成功，本次实际收益：¥${$formatMoney(redeemResult.redeemProfit)}`"
            type="success"
            show-icon
            :closable="false"
        />
      </div>
      <template #footer>
        <el-button @click="closeRedeemDialog">取消</el-button>
        <el-button type="primary" @click="confirmRedeem" :loading="redeemLoading" :disabled="redeemResult !== null">确认赎回</el-button>
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
const positions = ref([])
const redeemDialogVisible = ref(false)
const selectedPosition = ref(null)
const redeemAmount = ref(0)
const redeemLoading = ref(false)
const redeemResult = ref(null)

const goBack = () => {
  router.back()
}

const openRedeemDialog = (pos) => {
  selectedPosition.value = pos
  redeemAmount.value = pos.amount
  redeemResult.value = null
  redeemDialogVisible.value = true
}

const closeRedeemDialog = () => {
  redeemDialogVisible.value = false
  redeemResult.value = null
}

const confirmRedeem = async () => {
  if (redeemAmount.value < 1 || redeemAmount.value > selectedPosition.value.amount) {
    ElMessage.warning('输入金额有误')
    return
  }
  redeemLoading.value = true
  try {
    // 后端返回 { position:..., redeemProfit:... }
    const res = await request.post('/wealth/position/redeem', {
      id: selectedPosition.value.id,
      amount: redeemAmount.value
    })
    redeemResult.value = res
    // 自动刷新持仓，等用户关闭弹窗时
    loadPositions()
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || '赎回失败')
  }
  redeemLoading.value = false
}

const loadPositions = async () => {
  const res = await request.get('/wealth/position/my')
  if (res && Array.isArray(res.content)) {
    positions.value = res.content
  } else if (Array.isArray(res)) {
    positions.value = res
  } else {
    positions.value = []
  }
}

onMounted(loadPositions)
</script>

<style scoped>
.position-list-card {
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