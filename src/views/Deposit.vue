<template>
  <div class="deposit-layout" :class="{'dark-mode': isDark}">
    <el-card class="deposit-card" shadow="always">
      <div class="deposit-title">存取管理</div>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="存款" name="deposit">
          <el-form :model="depositForm" label-width="80px" class="deposit-form">
            <el-form-item label="金额">
              <el-input v-model.number="depositForm.amount" type="number" placeholder="请输入存款金额" />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="depositForm.type" placeholder="请选择存款类型">
                <el-option label="活期存款" value="活期存款" />
                <el-option label="定期存款" value="定期存款" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="depositForm.description" placeholder="可填备注" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleDeposit">存款</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="取款" name="withdraw">
          <el-form :model="withdrawForm" label-width="80px" class="deposit-form">
            <el-form-item label="金额">
              <el-input v-model.number="withdrawForm.amount" type="number" placeholder="请输入取款金额" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="withdrawForm.description" placeholder="可填备注" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleWithdraw">取款</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="转账" name="transfer">
          <el-form :model="transferForm" label-width="80px" class="deposit-form">
            <el-form-item label="收款账户ID">
              <el-input v-model="transferForm.toAccountId" type="number" placeholder="请输入收款账户ID" />
            </el-form-item>
            <el-form-item label="金额">
              <el-input v-model.number="transferForm.amount" type="number" placeholder="请输入转账金额" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="transferForm.description" placeholder="可填备注" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTransfer">转账</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="交易记录" name="records">
          <el-table :data="transactions" style="width: 100%" height="260">
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

const isDark = ref(false)
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

const transactions = ref([])

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
onMounted(getTransactions)
</script>

<style scoped>
.deposit-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  width: 100vw;
  background: transparent;
}
.deposit-layout.dark-mode {
  background: #232a3c;
}
.deposit-card {
  min-width: 420px;
  max-width: 96vw;
  margin-top: 38px;
  padding: 28px 38px;
  border-radius: 28px;
  box-shadow: 0 8px 38px 0 rgba(25, 50, 110, 0.10);
}
.deposit-title {
  font-size: 1.55rem;
  color: #1976d2;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 18px;
  text-align: center;
}
.deposit-layout.dark-mode .deposit-title {
  color: #7bb4fa;
}
.deposit-form {
  max-width: 310px;
  margin: 0 auto;
}
</style>