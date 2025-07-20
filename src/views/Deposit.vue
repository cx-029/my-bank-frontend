<template>
  <div class="deposit-layout">
    <el-card class="deposit-card" shadow="always">
      <!-- 顶部栏 -->
      <div class="deposit-header">
        <div class="deposit-icon">
          <svg viewBox="0 0 48 48" width="32" height="32" fill="none" style="color: #1976d2;">
            <ellipse cx="24" cy="44" rx="20" ry="4" fill="#E3F2FD"/>
            <path d="M24 6L40 16H8L24 6Z" fill="currentColor"/>
            <rect x="8" y="16" width="32" height="20" rx="3" fill="#fff" stroke="currentColor" stroke-width="2"/>
            <rect x="18" y="24" width="12" height="8" rx="2" fill="#E3F2FD"/>
          </svg>
        </div>
        <div class="deposit-title">存取管理</div>
        <button class="deposit-logout-btn" @click="goHome" aria-label="返回首页">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" fill="#e3f2fd"/>
            <path d="M13.5 7l-4 4 4 4" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <!-- 账户信息 -->
      <el-card shadow="hover" class="account-info-card" @mouseenter="cardHover=true" @mouseleave="cardHover=false" :class="{'card-hovered': cardHover}">
        <div class="account-row">
          <span class="account-info-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2.5" y="5" width="17" height="12" rx="2.5" fill="#e3f2fd" stroke="#1976d2" stroke-width="1.5"/>
              <rect x="4.5" y="9" width="13" height="2.5" rx="1.25" fill="#1976d2"/>
            </svg>
          </span>
          <span class="account-label">账户类型</span>
          <span class="account-value">{{ accountType }}</span>
        </div>
        <div class="account-row">
          <span class="account-info-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" fill="#fff3cd"/>
              <text x="11" y="15" text-anchor="middle" font-size="12" fill="#ffc107">￥</text>
            </svg>
          </span>
          <span class="account-label">余额</span>
          <span class="account-value balance-value din-font">{{ $formatMoney(balance) }} 元</span>
        </div>
        <div class="account-row">
          <span class="account-info-icon">
            <svg v-if="status==='正常'" width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" fill="#eaf7ed"/>
              <path d="M7 11l3 3 5-5" stroke="#1976d2" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" fill="#f8d7da"/>
              <path d="M8 8l6 6M14 8l-6 6" stroke="#ef5350" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="account-label">状态</span>
          <span class="account-value status-text"
                :class="status==='正常' ? 'status-ok' : 'status-bad'">
            {{ status }}
          </span>
        </div>
      </el-card>
      <!-- tab区，三个框等宽 -->
      <el-tabs v-model="activeTab" type="border-card" class="deposit-tabs">
        <el-tab-pane label="存款" name="deposit">
          <div class="form-equal-block">
            <el-form :model="depositForm" label-width="90px" class="deposit-form" @submit.prevent>
              <el-form-item label="金额" required>
                <el-input v-model.number="depositForm.amount" type="number" placeholder="请输入存款金额" clearable @keyup.enter="handleDeposit"/>
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="depositForm.type" placeholder="请选择类型">
                  <el-option label="活期存款" value="活期存款" />
                  <el-option label="定期存款" value="定期存款" />
                </el-select>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="depositForm.description" placeholder="可填备注" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="deposit-btn" @click="handleDeposit">
                  <span class="deposit-btn-label">立即存款</span>
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="取款" name="withdraw">
          <div class="form-equal-block">
            <el-form :model="withdrawForm" label-width="90px" class="deposit-form" @submit.prevent>
              <el-form-item label="金额" required>
                <el-input v-model.number="withdrawForm.amount" type="number" placeholder="请输入取款金额" clearable @keyup.enter="handleWithdraw"/>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="withdrawForm.description" placeholder="可填备注" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="danger" class="deposit-btn" @click="handleWithdraw">
                  <span class="deposit-btn-label">立即取款</span>
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="转账" name="transfer">
          <div class="form-equal-block">
            <el-form :model="transferForm" label-width="110px" class="deposit-form" @submit.prevent>
              <el-form-item label="收款账户ID" required>
                <el-input v-model="transferForm.toAccountId" type="number" placeholder="请输入收款账户ID" clearable @keyup.enter="handleTransfer"/>
              </el-form-item>
              <el-form-item label="金额" required>
                <el-input v-model.number="transferForm.amount" type="number" placeholder="请输入转账金额" clearable @keyup.enter="handleTransfer"/>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="transferForm.description" placeholder="可填备注" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="warning" class="deposit-btn" @click="handleTransfer">
                  <span class="deposit-btn-label">立即转账</span>
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="交易记录" name="records">
          <div class="records-header">
            <el-icon><i class="el-icon-wallet"></i></el-icon>
            <span>最近交易流水</span>
            <el-button type="success" size="small" class="finance-btn" @click="openFinanceDialog">财富报表</el-button>
          </div>
          <div class="records-table-wrapper">
            <el-table :data="transactions" style="width: 100%; max-width: 900px; margin: 0 auto;" height="220" header-row-class-name="records-thead">
              <el-table-column prop="transactionTime" label="时间" width="165" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="scope">
                  {{ $formatMoney(scope.row.amount) }}
                </template>
              </el-table-column>
              <el-table-column prop="balanceAfter" label="余额" width="120">
                <template #default="scope">
                  {{ $formatMoney(scope.row.balanceAfter) }}
                </template>
              </el-table-column>
              <el-table-column prop="description" label="备注" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
      <!-- 财富报表弹窗 三大图切换 -->
      <el-dialog v-model="showFinance" title="财富报表" width="980px" center @close="onFinanceDialogClose" class="big-dialog">
        <el-tabs v-model="chartTab" type="card" stretch class="chart-switch-tabs">
          <el-tab-pane label="余额趋势" name="trend">
            <div class="chart-block">
              <div class="chart-title">账户余额趋势</div>
              <svg :width="900" height="340" viewBox="0 0 900 340" class="big-sparkline">
                <!-- 背景 -->
                <rect x="70" y="40" width="780" height="230" fill="#f6f8fc" rx="16"/>
                <!-- y轴线和刻度 -->
                <line x1="70" y1="40" x2="70" y2="270" stroke="#1976d2" stroke-width="2"/>
                <g v-for="(yv,i) in yTicksBig" :key="'y'+i">
                  <line x1="65" :y1="yv.y" x2="70" :y2="yv.y" stroke="#1976d2" stroke-width="2"/>
                  <text x="58" :y="yv.y+5" text-anchor="end" font-size="14" fill="#1976d2" font-weight="bold">{{ $formatMoney(yv.value) }}</text>
                </g>
                <!-- x轴线和刻度 -->
                <line x1="70" y1="270" x2="850" y2="270" stroke="#1976d2" stroke-width="2"/>
                <g v-for="(xv,i) in xTicksBig" :key="'x'+i">
                  <line :x1="xv.x" y1="270" :x2="xv.x" y2="275" stroke="#1976d2" stroke-width="2"/>
                  <text :x="xv.x" y="295" text-anchor="middle" font-size="14" fill="#1976d2" font-weight="bold">{{ xv.label }}</text>
                </g>
                <!-- 折线 -->
                <polyline
                    :points="trendPointsBig"
                    fill="none"
                    stroke="#ff9800"
                    stroke-width="4"
                    filter="url(#glowBig)"
                />
                <defs>
                  <filter id="glowBig" x="-10" y="-10" width="920" height="360">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </svg>
            </div>
          </el-tab-pane>
          <el-tab-pane label="收支结构" name="pie">
            <div class="chart-block">
              <div class="chart-title">收支结构</div>
              <svg width="340" height="340" viewBox="0 0 340 340" class="pie-svg">
                <circle cx="170" cy="170" r="135" fill="#f5fafd"/>
                <circle cx="170" cy="170" r="120" fill="#fff"/>
                <path
                    :d="bigPieIncomePath"
                    fill="url(#incomeGradBig)"
                    stroke="#fff"
                    stroke-width="2"
                />
                <path
                    :d="bigPieExpensePath"
                    fill="url(#expenseGradBig)"
                    stroke="#fff"
                    stroke-width="2"
                />
                <defs>
                  <linearGradient id="incomeGradBig" x1="100" y1="120" x2="310" y2="220" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#1976d2"/>
                    <stop offset="1" stop-color="#64b5f6"/>
                  </linearGradient>
                  <linearGradient id="expenseGradBig" x1="220" y1="60" x2="170" y2="310" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#ef5350"/>
                    <stop offset="1" stop-color="#ffd1d1"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="pie-percent-info" style="margin-top: 16px; text-align:center; font-size: 1.1rem; color: #1976d2;">
                收入占比：{{ incomePercent }}%　
                支出占比：{{ expensePercent }}%
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="活跃度" name="active">
            <div class="chart-block">
              <div class="chart-title">账户活跃度</div>
              <svg width="340" height="340" viewBox="0 0 340 340" class="active-ring-big">
                <circle cx="170" cy="170" r="135" fill="#e3f2fd"/>
                <circle cx="170" cy="170" r="120" fill="none" stroke="#e0e4ea" stroke-width="24"/>
                <circle
                    cx="170" cy="170" r="120"
                    fill="none"
                    :stroke="activeColor"
                    stroke-width="24"
                    :stroke-dasharray="circumferenceBig"
                    :stroke-dashoffset="activeDashOffsetBig"
                    stroke-linecap="round"
                    transform="rotate(-90 170 170)"
                />
                <text x="170" y="185" text-anchor="middle" font-size="72" fill="#1976d2" font-weight="bold" font-family="DIN Condensed">
                  {{ activityPercentText }}
                </text>
                <text x="170" y="235" text-anchor="middle" font-size="24" fill="#888" font-family="PingFang SC">近30天活跃率</text>
              </svg>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('deposit')
const cardHover = ref(false)
const showFinance = ref(false)
const chartTab = ref('trend')

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
const accountType = ref('储蓄卡')
const balance = ref(0)
const status = ref('正常')
const transactions = ref([])

const refreshAll = async () => {
  await getAccountInfo()
  await getTransactions()
  await nextTick()
}
const getAccountInfo = async () => {
  try {
    const res = await axios.get('/api/account')
    accountType.value = res.data.accountType || '储蓄卡'
    balance.value = res.data.balance || 0
    status.value = res.data.status || '正常'
  } catch (e) {
    accountType.value = '储蓄卡'
    balance.value = 0
    status.value = '异常'
  }
}
const getTransactions = async () => {
  try {
    const res = await axios.get('/api/account/transactions')
    transactions.value = res.data || []
  } catch (e) {
    transactions.value = []
    ElMessage.error('获取交易记录失败')
  }
}

const income = computed(() =>
    transactions.value.filter(t => t.type === '活期存款').reduce((sum, t) => sum + t.amount, 0)
)
const expense = computed(() =>
    transactions.value.filter(t => t.type === '取款').reduce((sum, t) => sum + t.amount, 0)
)
const pieTotal = computed(() => income.value + expense.value)
function describeArc(cx, cy, r, from, to) {
  const start = (from / 100) * 2 * Math.PI - Math.PI / 2
  const end = (to / 100) * 2 * Math.PI - Math.PI / 2
  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  const largeArcFlag = to - from > 50 ? 1 : 0
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArcFlag} 1 ${x2},${y2} Z`
}
// 饼图-大
const bigPieIncomePath = computed(() =>
    pieTotal.value ? describeArc(170, 170, 120, 0, income.value / pieTotal.value * 100) : ''
)
const bigPieExpensePath = computed(() =>
    pieTotal.value ? describeArc(170, 170, 120, income.value / pieTotal.value * 100, 100) : ''
)

const incomePercent = computed(() =>
    pieTotal.value ? (income.value / pieTotal.value * 100).toFixed(2) : '0.00'
)
const expensePercent = computed(() =>
    pieTotal.value ? (expense.value / pieTotal.value * 100).toFixed(2) : '0.00'
)

// 折线图数据（大图）
const trendArr = computed(() =>
    [...transactions.value].sort((a, b) => new Date(a.transactionTime) - new Date(b.transactionTime))
)
const chartWBig = 900, chartHBig = 340, paddingLBig = 70, paddingRBig = 50, paddingTBig = 40, paddingBBig = 70
const chartInnerWBig = chartWBig - paddingLBig - paddingRBig
const chartInnerHBig = chartHBig - paddingTBig - paddingBBig
const getBigTrendX = idx => {
  const arr = trendArr.value
  return arr.length === 1
      ? paddingLBig + chartInnerWBig / 2
      : paddingLBig + idx / (arr.length - 1) * chartInnerWBig
}
const getBigTrendY = val => {
  const arr = trendArr.value
  if (!arr.length) return chartHBig - paddingBBig
  const vals = arr.map(t => t.balanceAfter)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  return chartHBig - paddingBBig - ((val - min) / (max - min || 1)) * chartInnerHBig
}
const trendPointsBig = computed(() => {
  const arr = trendArr.value
  if (!arr.length) return ''
  return arr.map((t, i) => `${getBigTrendX(i)},${getBigTrendY(t.balanceAfter)}`).join(' ')
})
const yTicksBig = computed(() => {
  const arr = trendArr.value
  if (!arr.length) return []
  const vals = arr.map(t => t.balanceAfter)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const step = (max - min) / 5 || 1
  return Array.from({length: 6}, (_, i) => {
    const value = Math.round(min + i * step)
    return {
      value,
      y: getBigTrendY(value)
    }
  })
})
const xTicksBig = computed(() => {
  const arr = trendArr.value
  if (!arr.length) return []
  const maxTicks = 6
  const step = arr.length <= 1 ? 1 : Math.ceil((arr.length - 1) / (maxTicks - 1))
  let result = []
  for (let i = 0; i < arr.length; i += step) {
    const t = arr[i]
    let label = ''
    if (t.transactionTime) {
      const d = new Date(t.transactionTime)
      label = `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    }
    result.push({
      label,
      x: getBigTrendX(i)
    })
  }
  if (arr.length > 1 && result[result.length-1].x !== getBigTrendX(arr.length-1)) {
    const t = arr[arr.length-1]
    let label = ''
    if (t.transactionTime) {
      const d = new Date(t.transactionTime)
      label = `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    }
    result.push({label, x: getBigTrendX(arr.length-1)})
  }
  return result
})

// 活跃度环参数
const activityDays = computed(() => {
  const days = new Set()
  const now = new Date()
  transactions.value.forEach(t => {
    if(t.transactionTime){
      const d = new Date(t.transactionTime)
      const diff = (now - d) / 86400000
      if(diff >= 0 && diff < 30){
        days.add(d.toISOString().slice(0,10))
      }
    }
  })
  return days.size
})
const activityPercent = computed(() => Math.round(activityDays.value / 30 * 100))
const activityPercentText = computed(() => `${activityPercent.value}%`)
const activeColor = computed(() => activityPercent.value >= 80 ? '#43c463' : activityPercent.value >= 50 ? '#ffa726' : '#ef5350')
// 大环
const circumferenceBig = 2 * Math.PI * 120 // r=120
const activeDashOffsetBig = computed(() => circumferenceBig * (1 - activityPercent.value / 100))

const goHome = () => router.push('/home')
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
      await refreshAll()
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
      await refreshAll()
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
      await refreshAll()
    } else {
      ElMessage.error('转账失败')
    }
  } catch (e) {
    ElMessage.error('转账接口异常')
  }
}
const openFinanceDialog = async () => {
  await refreshAll()
  showFinance.value = true
}
const onFinanceDialogClose = () => {}

onMounted(() => {
  refreshAll()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500&family=DIN+Condensed:wght@700&display=swap');
.deposit-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 82vh;
  width: 100vw;
  background: linear-gradient(120deg, #f0f6fc 60%, #e6eeff 100%);
}
.deposit-card {
  min-width: 440px;
  max-width: 1200px;
  margin-top: 38px;
  padding: 36px 38px 28px 38px;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 8px 38px 0 rgba(25,50,110,0.16), 0 2px 8px 0 rgba(25,50,110,0.12);
  transition: box-shadow 0.22s;
}
.account-info-card {
  background: linear-gradient(90deg, #e3f2fd 60%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(25,118,210,0.10);
  padding: 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: 'Segoe UI', 'PingFang SC', Arial, sans-serif;
  transition: box-shadow 0.22s;
}
.account-info-card.card-hovered {
  box-shadow: 0 6px 24px rgba(25,118,210,0.22);
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
  font-size: 2rem;
  color: #164ba0;
  font-weight: 900;
  letter-spacing: 2px;
  flex: 1;
  font-family: 'PingFang SC', 'DIN Condensed', Arial, sans-serif;
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
  box-shadow: 0 1px 4px rgba(25,118,210,0.10);
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
.account-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
  font-size: 1.15rem;
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
  color: #164ba0;
  min-width: 84px;
  letter-spacing: 1px;
  font-family: 'PingFang SC', 'DIN Condensed', Arial, sans-serif;
}
.account-value,
.balance-value,
.status-text {
  font-weight: 700;
  color: #222 !important;
  font-size: 1.20rem;
  letter-spacing: 0.5px;
}
.balance-value {
  font-size: 1.32rem;
  font-family: 'DIN Condensed', 'Roboto Mono', 'Segoe UI', Arial, sans-serif;
  color: #164ba0 !important;
}
.status-text.status-ok {
  color: #1a93d2 !important;
  font-weight: 900;
  font-family: 'DIN Condensed', 'PingFang SC', Arial, sans-serif;
  display: inline-flex;
  align-items: center;
}
.status-text.status-bad {
  color: #ef5350 !important;
  font-weight: 900;
  font-family: 'DIN Condensed', 'PingFang SC', Arial, sans-serif;
  display: inline-flex;
  align-items: center;
}
.deposit-tabs {
  margin-top: 8px;
}
.form-equal-block {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
  width: 100%;
  background: #f6fafd;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(25,118,210,0.06);
  margin-bottom: 10px;
}
.deposit-form {
  width: 370px;
  margin: 0 auto;
  font-size: 1.08rem;
  padding: 18px 0;
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
  box-shadow: 0 2px 12px rgba(25,118,210,0.10);
  transition: box-shadow 0.18s;
}
.deposit-btn:hover {
  box-shadow: 0 6px 24px rgba(25,118,210,0.22);
}
.deposit-btn-label {
  flex: 1 1 0%;
  text-align: center;
  width: 100%;
  display: block;
  font-family: 'DIN Condensed', 'PingFang SC', Arial;
}
.records-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.13rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 10px;
  position: relative;
}
.finance-btn {
  margin-left: 18px;
  vertical-align: middle;
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
.records-table-wrapper {
  margin-top: 18px;
  margin-bottom: 8px;
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  display: block;
}

/* 财富报表弹窗三图切换 */
.big-dialog {
  /* 让弹窗大气一点 */
  min-width: 800px;
  max-width: 1000px;
}
.chart-switch-tabs {
  margin-bottom: 8px;
  font-family: 'DIN Condensed','PingFang SC', Arial;
}
.chart-block {
  background: #f7fafc;
  border-radius: 22px;
  box-shadow: 0 2px 18px rgba(25,118,210,0.10);
  padding: 28px 18px 22px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.chart-title {
  font-size: 1.4rem;
  color: #164ba0;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 18px;
  font-family: 'DIN Condensed', 'PingFang SC', Arial;
}
.big-sparkline {
  margin: 0 auto;
  display: block;
  background: #f6f8fc;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(197,225,250,0.10);
}
.pie-svg {
  margin: 0 auto;
  display: block;
  box-shadow: 0 2px 12px rgba(197,225,250,0.10);
  border-radius: 18px;
  background: #f8fdff;
}
.active-ring-big {
  margin: 0 auto;
  display: block;
}
.din-font { font-family: 'DIN Condensed', 'Roboto Mono', 'Segoe UI', Arial, sans-serif; }

@media (max-width: 1280px) {
  .deposit-card { min-width: 98vw; padding: 16px 2vw 14px 2vw; margin-top: 18px; border-radius: 18px; }
  .form-equal-block { min-width: 98vw !important; }
  .big-dialog { min-width: 98vw !important; max-width: 100vw !important;}
  .chart-block { width: 98vw; }
}
</style>