<template>
  <div class="deposit-layout">
    <el-card class="deposit-card" shadow="always">
      <div class="deposit-header">
        <div class="deposit-icon">
          <!-- 银行SVG图标 -->
          <svg viewBox="0 0 48 48" width="32" height="32" fill="none" style="color: #1976d2;">
            <ellipse cx="24" cy="44" rx="20" ry="4" fill="#E3F2FD"/>
            <path d="M24 6L40 16H8L24 6Z" fill="currentColor"/>
            <rect x="8" y="16" width="32" height="20" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"/>
            <rect x="18" y="24" width="12" height="8" rx="2" fill="#E3F2FD"/>
          </svg>
        </div>
        <div class="deposit-title">存取管理</div>
        <button class="deposit-logout-btn" @click="goHome" aria-label="返回首页">
          <!-- 用银行风格返回箭头icon -->
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" fill="#e3f2fd"/>
            <path d="M13.5 7l-4 4 4 4" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="deposit-summary" v-if="accountInfo">
        <el-card shadow="hover" class="account-info-card">
          <div class="account-row">
            <span class="account-info-icon">
              <!-- 用银行风格卡片icon -->
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2.5" y="5" width="17" height="12" rx="2.5" fill="#e3f2fd" stroke="#1976d2" stroke-width="1.5"/>
                <rect x="4.5" y="9" width="13" height="2.5" rx="1.25" fill="#1976d2"/>
              </svg>
            </span>
            <span class="account-label">账户类型</span>
            <span class="account-value">{{ accountInfo.accountType }}</span>
          </div>
          <div class="account-row">
            <span class="account-info-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" fill="#fff3cd"/>
                <text x="11" y="15" text-anchor="middle" font-size="12" fill="#ffc107">￥</text>
              </svg>
            </span>
            <span class="account-label">余额</span>
            <span class="account-value balance-value">{{ accountInfo.balance.toFixed(2) }} 元</span>
          </div>
          <div class="account-row">
            <span class="account-info-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" fill="#f8f9fa"/>
                <circle cx="11" cy="11" r="6" :fill="accountInfo.status==='正常' ? '#1976d2' : '#ef5350'" />
              </svg>
            </span>
            <span class="account-label">状态</span>
            <span class="account-value status-text"
                  :class="accountInfo.status==='正常' ? 'status-ok' : 'status-bad'">
              {{ accountInfo.status }}
            </span>
          </div>
        </el-card>
      </div>
      <el-tabs v-model="activeTab" type="border-card" class="deposit-tabs">
        <el-tab-pane label="存款" name="deposit">
          <el-form :model="depositForm" label-width="90px" class="deposit-form" @submit.prevent>
            <el-form-item label="金额" required>
              <el-input v-model.number="depositForm.amount" type="number" placeholder="请输入存款金额" />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="depositForm.type" placeholder="请选择类型">
                <el-option label="活期存款" value="活期存款" />
                <el-option label="定期存款" value="定期存款" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="depositForm.description" placeholder="可填备注" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="deposit-btn" @click="handleDeposit">
                <span class="deposit-btn-label">立即存款</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="取款" name="withdraw">
          <el-form :model="withdrawForm" label-width="90px" class="deposit-form" @submit.prevent>
            <el-form-item label="金额" required>
              <el-input v-model.number="withdrawForm.amount" type="number" placeholder="请输入取款金额" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="withdrawForm.description" placeholder="可填备注" />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" class="deposit-btn" @click="handleWithdraw">
                <span class="deposit-btn-label">立即取款</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="转账" name="transfer">
          <el-form :model="transferForm" label-width="110px" class="deposit-form" @submit.prevent>
            <el-form-item label="收款账户ID" required>
              <el-input v-model="transferForm.toAccountId" type="number" placeholder="请输入收款账户ID" />
            </el-form-item>
            <el-form-item label="金额" required>
              <el-input v-model.number="transferForm.amount" type="number" placeholder="请输入转账金额" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="transferForm.description" placeholder="可填备注" />
            </el-form-item>
            <el-form-item>
              <el-button type="warning" class="deposit-btn" @click="handleTransfer">
                <span class="deposit-btn-label">立即转账</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="交易记录" name="records">
          <div class="records-header">
            <el-icon><i class="el-icon-wallet"></i></el-icon>
            <span>最近交易流水</span>
          </div>
          <el-table :data="transactions" style="width: 100%" height="260" header-row-class-name="records-thead">
            <el-table-column prop="transactionTime" label="时间" width="165"/>
            <el-table-column prop="type" label="类型" width="100"/>
            <el-table-column prop="amount" label="金额" width="120"/>
            <el-table-column prop="balanceAfter" label="余额" width="120"/>
            <el-table-column prop="description" label="备注" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('deposit')

const depositForm = ref({
  amount: null,
  type: '活期存款',
  description: ''
})
const withdrawForm = ref({
  amount: null,
  description: ''
})
const transferForm = ref({
  toAccountId: '',
  amount: null,
  description: ''
})

const accountInfo = ref(null)
const transactions = ref([])

const getAccountInfo = async () => {
  try {
    const res = await axios.get('/api/account')
    accountInfo.value = res.data
  } catch (e) {
    accountInfo.value = null
  }
}

const handleDeposit = async () => {
  if (!depositForm.value.amount) {
    ElMessage.warning('请输入存款金额')
    return
  }
  try {
    const res = await axios.post('/api/account/deposit', {
      amount: depositForm.value.amount,
      type: depositForm.value.type,
      description: depositForm.value.description
    })
    if (res.data === true) {
      ElMessage.success('存款成功')
      depositForm.value.amount = null
      getAccountInfo()
      getTransactions()
    } else {
      ElMessage.error('存款失败')
    }
  } catch (e) {
    ElMessage.error('存款接口异常')
  }
}

const handleWithdraw = async () => {
  if (!withdrawForm.value.amount) {
    ElMessage.warning('请输入取款金额')
    return
  }
  try {
    const res = await axios.post('/api/account/withdraw', {
      amount: withdrawForm.value.amount,
      description: withdrawForm.value.description
    })
    if (res.data === true) {
      ElMessage.success('取款成功')
      withdrawForm.value.amount = null
      getAccountInfo()
      getTransactions()
    } else {
      ElMessage.error('取款失败，可能余额不足')
    }
  } catch (e) {
    ElMessage.error('取款接口异常')
  }
}

const handleTransfer = async () => {
  if (!transferForm.value.toAccountId || !transferForm.value.amount) {
    ElMessage.warning('请填写收款账户和金额')
    return
  }
  try {
    const res = await axios.post('/api/account/transfer', {
      toAccountId: transferForm.value.toAccountId,
      amount: transferForm.value.amount,
      description: transferForm.value.description
    })
    if (res.data === true) {
      ElMessage.success('转账成功')
      transferForm.value.amount = null
      getAccountInfo()
      getTransactions()
    } else {
      ElMessage.error('转账失败')
    }
  } catch (e) {
    ElMessage.error('转账接口异常')
  }
}

const getTransactions = async () => {
  try {
    const res = await axios.get('/api/account/transactions')
    transactions.value = res.data || []
  } catch (e) {
    ElMessage.error('获取交易记录失败')
  }
}

const goHome = () => {
  router.push('/home')
}

onMounted(() => {
  getAccountInfo()
  getTransactions()
})
</script>

<style scoped>
.deposit-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 82vh;
  width: 100vw;
  background: linear-gradient(120deg, #f2f6fc 60%, #e6eeff 100%);
}
.deposit-card {
  min-width: 440px;
  max-width: 98vw;
  margin-top: 38px;
  padding: 36px 38px 28px 38px;
  border-radius: 28px;
  box-shadow: 0 8px 38px 0 rgba(25, 50, 110, 0.14);
  background: #fff;
}
.deposit-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 16px;
  position: relative;
}
.deposit-icon {
  margin-right: 14px;
  min-width: 32px;
  display: flex;
  align-items: center;
}
.deposit-title {
  font-size: 1.73rem;
  color: #1976d2;
  font-weight: 800;
  letter-spacing: 2px;
  flex: 1;
  font-family: 'Segoe UI', 'PingFang SC', Arial, sans-serif;
}
.deposit-logout-btn {
  position: absolute;
  right: 0;
  top: 5px;
  font-size: 1.18rem;
  padding: 0;
  height: 36px;
  width: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  color: #1976d2;
  border: none;
  box-shadow: 0 1px 4px rgba(25,118,210,0.08);
  transition: background 0.18s;
  cursor: pointer;
}
.deposit-logout-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
}
.deposit-logout-btn svg {
  display: block;
}
.deposit-summary {
  margin-bottom: 18px;
}
.account-info-card {
  background: linear-gradient(90deg, #e3f2fd 60%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(25,118,210,0.08);
  padding: 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: 'Segoe UI', 'PingFang SC', Arial, sans-serif;
}
.account-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
  font-size: 1.13rem;
  margin-bottom: 2px;
}
.account-info-icon {
  display: flex;
  align-items: center;
  width: 22px;
  height: 22px;
}
.account-label {
  font-weight: 600;
  color: #1976d2;
  min-width: 84px;
  letter-spacing: 1px;
}
.account-value,
.balance-value,
.status-text {
  font-weight: 700;
  color: #222 !important;
  font-size: 1.18rem;
  letter-spacing: 0.5px;
}
.balance-value {
  font-size: 1.28rem;
  font-family: 'Segoe UI Semibold', Arial, sans-serif;
  color: #222 !important;
}
.status-text.status-ok {
  color: #1976d2 !important;
}
.status-text.status-bad {
  color: #ef5350 !important;
}
.deposit-tabs {
  margin-top: 8px;
}
.deposit-form {
  max-width: 350px;
  margin: 0 auto;
  margin-top: 14px;
  font-size: 1.08rem;
}
.deposit-btn {
  min-width: 150px;
  font-size: 1.18rem;
  border-radius: 22px;
  font-weight: 700;
  height: 44px;
  margin-top: 8px;
  justify-content: center;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 1.1px;
}
.deposit-btn-label {
  flex: 1 1 0%;
  text-align: center;
  width: 100%;
  display: block;
}
.records-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.13rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 10px;
}
.records-header .el-icon {
  color: #1976d2 !important;
  font-size: 1.4em !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1em;
  width: 1em;
  line-height: 1em;
  position: relative;
}
.records-thead {
  background: #e3f2fd !important;
  font-weight: 600;
  font-size: 1.12rem;
}
@media (max-width: 900px) {
  .deposit-card {
    min-width: 98vw;
    padding: 16px 2vw 14px 2vw;
    margin-top: 18px;
    border-radius: 18px;
  }
  .deposit-title {
    font-size: 1.22rem;
    margin-left: 0;
  }
  .deposit-form {
    max-width: 98vw;
  }
}
</style>