<template>
  <div class="loss-page-bank-decor">
    <div class="bg-gradient-blob"></div>
    <div class="bg-gold-decoration"></div>
    <el-card class="glass-card loss-card" shadow="always">
      <template #header>
        <div class="loss-header">
          <div class="loss-title">
            <svg width="30" height="30" viewBox="0 0 62 62" fill="none" class="bank-shield">
              <defs>
                <linearGradient id="shieldLossGrad" x1="0" y1="0" x2="62" y2="62" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#1976d2"/>
                  <stop offset="1" stop-color="#5596e6"/>
                </linearGradient>
              </defs>
              <path d="M31 7C25 14 13 16 13 16v12c0 18 14 24 18 25 4-1 18-7 18-25V16s-12-2-18-9z" fill="url(#shieldLossGrad)" />
              <circle cx="31" cy="29" r="9.5" fill="#fff" stroke="#1976d2" stroke-width="2"/>
              <path d="M31 22v14M25.5 29h11" stroke="#1976d2" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>账户挂失管理</span>
          </div>
          <el-button class="exit-btn" circle size="large" @click="goHome" aria-label="返回首页">
            <el-icon><CloseBold /></el-icon>
          </el-button>
        </div>
      </template>
      <el-form :model="form" label-width="80px" class="loss-form" @submit.prevent>
        <el-form-item label="挂失类型">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="口头挂失" value="口头挂失"></el-option>
            <el-option label="正式挂失" value="正式挂失"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="挂失原因">
          <el-input v-model="form.reason" placeholder="请输入挂失原因" maxlength="100" show-word-limit>
            <template #suffix>
              <el-tooltip placement="top">
                <template #content>请简要描述挂失原因，如卡遗失、被盗等</template>
                <el-icon style="color:#1976d2;cursor:pointer"><el-icon-question-filled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="applying" @click="applyLoss" style="width:140px;font-weight:600">提交挂失申请</el-button>
        </el-form-item>
      </el-form>
      <el-divider>
        <span class="loss-divider-title">挂失记录</span>
      </el-divider>
      <!-- 表格外层加滚动容器，显示3行，超出滚动 -->
      <div class="loss-table-scroll">
        <el-table
            :data="lossList"
            style="width: 100%"
            v-loading="loading"
            size="large"
            border
            class="loss-table"
            :empty-text="'暂无挂失记录'"
        >
          <el-table-column prop="id" label="ID" width="70" align="center"/>
          <el-table-column prop="type" label="类型" width="110" align="center"/>
          <el-table-column
              prop="reason"
              label="原因"
              min-width="240"
              show-overflow-tooltip="false"
          />
          <el-table-column prop="status" label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                  effect="dark"
                  :type="row.status === 'APPLIED' ? 'warning' : 'success'"
                  disable-transitions
                  round
                  class="tag-status"
              >{{ row.status === 'APPLIED' ? '已挂失' : '已解除' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
              prop="createdAt"
              label="申请时间"
              min-width="180"
              align="center"
              :show-overflow-tooltip="false"
          />
          <el-table-column
              prop="resolvedAt"
              label="解除时间"
              min-width="180"
              align="center"
              :show-overflow-tooltip="false"
          >
            <template #default="{ row }">
              <span>{{ row.resolvedAt ? row.resolvedAt : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button
                  v-if="row.status === 'APPLIED'"
                  size="small"
                  type="success"
                  @click="releaseLoss(row.id)"
                  :loading="releasingId === row.id"
                  class="release-btn"
              >解除挂失</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CloseBold, QuestionFilled as ElIconQuestionFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ type: '', reason: '' })
const lossList = ref([])
const loading = ref(false)
const applying = ref(false)
const releasingId = ref(null)

onMounted(async () => {
  await fetchLossList()
})

const fetchLossList = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/account/loss/list')
    lossList.value = res.data
  } catch (e) {
    ElMessage.error('查询挂失记录失败')
  } finally {
    loading.value = false
  }
}

const applyLoss = async () => {
  if (!form.value.type || !form.value.reason) {
    ElMessage.warning('请填写挂失类型和原因')
    return
  }
  applying.value = true
  try {
    const res = await axios.post('/api/account/loss/apply', {
      type: form.value.type,
      reason: form.value.reason
    })
    if (res.data && res.data.includes('成功')) {
      ElMessage.success(res.data)
      form.value.type = ''
      form.value.reason = ''
      await fetchLossList()
    } else {
      ElMessage.error(res.data || '挂失申请失败')
    }
  } catch (e) {
    ElMessage.error('提交挂失申请失败')
  } finally {
    applying.value = false
  }
}

const releaseLoss = async (id) => {
  ElMessageBox.confirm('确定要解除该挂失吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    releasingId.value = id
    try {
      const res = await axios.post('/api/account/loss/release')
      if (res.data && res.data.includes('成功')) {
        ElMessage.success(res.data)
        await fetchLossList()
      } else {
        ElMessage.error(res.data || '解除挂失失败')
      }
    } catch (e) {
      ElMessage.error('解除挂失失败')
    } finally {
      releasingId.value = null
    }
  }).catch(() => {})
}

const goHome = () => {
  router.replace('/home')
}
</script>

<style scoped>
.loss-page-bank-decor {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(120deg, #f8fafc 60%, #e6eeff 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 64px;
  position: relative;
  overflow: hidden;
}
.bg-gradient-blob {
  position: absolute;
  top: -120px;
  right: -120px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at 40% 40%, #9fd4ffcc 0%, #e9e1ff00 70%);
  opacity: 0.6;
  z-index: 1;
  pointer-events: none;
}
.bg-gold-decoration {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 120vw;
  height: 38px;
  background: linear-gradient(90deg, #fffde4 0%, #ffd700 40%, #fffde4 100%);
  opacity: 0.13;
  z-index: 1;
  pointer-events: none;
}
.glass-card {
  backdrop-filter: blur(16px);
  background: rgba(255,255,255,0.81);
  box-shadow: 0 10px 48px 0 rgba(25,118,210,0.14), 0 2.5px 14px 0 rgba(255,215,0,0.09);
  border-radius: 32px;
  border: 1.5px solid #e3e8fd99;
  position: relative;
  z-index: 2;
}
.loss-card {
  max-width: 1100px;
  min-width: 480px;
  width: 98vw;
  margin: 0 auto;
  border-radius: 32px;
  padding: 36px 32px 24px 32px;
}
.loss-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.loss-title {
  display: flex;
  align-items: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.3px;
  gap: 8px;
}
.bank-shield {
  margin-right: 12px;
}
.exit-btn {
  background: #f5f5f7;
  border: none;
  color: #aaa;
  transition: background 0.2s, color 0.2s;
}
.exit-btn:hover {
  background: #ffd6d6;
  color: #ff4d4f;
}
.loss-form {
  margin-bottom: 22px;
  max-width: 440px;
  font-size: 1.15rem;
}
.loss-divider-title {
  font-size: 1.08rem;
  color: #1976d2;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 滚动容器：只显示三行，多的滚动 */
.loss-table-scroll {
  max-height: 177px; /* 3行高度+表头，按表格行高1行约48~50px估算 */
  overflow-y: auto;
  margin-top: 4px;
}

/* 表格本身样式 */
.loss-table {
  font-size: 1.12rem;
  border-radius: 18px;
  background: #fcfdff;
}
.loss-table .el-table__header th {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 700;
  font-size: 1.12rem;
  border-bottom: 2px solid #ddeaff;
}
.loss-table .el-table__body tr {
  transition: background 0.15s;
}
.loss-table .el-table__body tr:hover td {
  background: #f7fafd;
}
.loss-table .el-table__cell {
  padding: 11px 8px;
}
.loss-table .tag-status {
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 10px;
  padding: 2px 13px;
  letter-spacing: 1.1px;
}
.release-btn {
  font-weight: bold;
  min-width: 90px;
  letter-spacing: 1px;
  font-size: 1.05rem;
}
.el-form-item__label {
  color: #1976d2;
  font-weight: 600;
  font-size: 1.13rem;
}
.el-input__wrapper {
  border-radius: 10px;
  font-size: 1.09rem;
}
.el-select .el-input__wrapper {
  border-radius: 10px;
}
.el-button--primary {
  background: linear-gradient(90deg,#1976d2 60%,#53a6e7 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  letter-spacing: 1px;
  transition: background 0.18s;
}
.el-button--primary:hover {
  background: linear-gradient(90deg,#409EFF 70%,#53b6f7 100%);
}
@media (max-width: 800px) {
  .loss-card { max-width: 99vw; min-width: unset; }
}
@media (max-width: 600px) {
  .loss-card, .loss-page-bank-decor {
    max-width: 100vw;
    padding: 0;
  }
  .loss-form { max-width: unset; }
  .loss-table { font-size: 1rem; }
}
</style>