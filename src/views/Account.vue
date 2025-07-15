<template>
  <div class="account-page-finance">
    <el-card class="account-card-finance" shadow="always">
      <!-- 顶部按钮行 -->
      <div class="finance-header-row">
        <span class="finance-title">我的账户</span>
        <div class="finance-action-group">
          <el-button circle @click="goHome" class="icon-btn" aria-label="退出">
            <el-icon><Close /></el-icon>
          </el-button>
          <el-button circle @click="isEdit=true" class="icon-btn" aria-label="编辑">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button circle @click="refreshAccount" class="icon-btn" aria-label="刷新">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="finance-main-content">
        <div class="bank-card-section">
          <div class="bank-card-bg">
            <div class="bank-logo-title">
              <span class="bank-logo"></span>
              <span class="bank-title">MyBank 金融账户</span>
            </div>
            <div class="bank-card-info-row">
              <span class="bank-card-label">余额</span>
              <span class="bank-card-value">￥{{ account?.balance ?? '--' }}</span>
            </div>
            <div class="bank-card-info-row">
              <span class="bank-card-label">银行卡号</span>
              <span class="bank-card-number">
                <span v-if="!showAccountNumber">**** **** **** {{ account?.id ? (account.id+'').slice(-4) : '****' }}</span>
                <span v-else>{{ accountNumber }}</span>
                <el-button
                    v-if="!showAccountNumber"
                    circle
                    class="id-reveal-btn"
                    @click="openFaceDialog"
                    aria-label="人脸识别查看"
                    style="margin-left:8px;"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </span>
            </div>
          </div>
        </div>
        <!-- 三个信息平铺一行 -->
        <div class="finance-detail-section-row">
          <div class="detail-item">
            <div class="detail-label">账户ID</div>
            <div class="detail-value">{{ account?.id ?? '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">账户类型</div>
            <div class="detail-value">{{ account?.accountType ?? '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">账户状态</div>
            <div class="detail-value">{{ account?.status ?? '-' }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="isEdit" title="编辑账户信息" width="400px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="账户类型">
          <el-input v-model="editForm.accountType" />
        </el-form-item>
        <el-form-item label="账户状态">
          <el-select v-model="editForm.status">
            <el-option label="正常" value="正常" />
            <el-option label="冻结" value="冻结" />
            <el-option label="挂失" value="挂失" />
          </el-select>
        </el-form-item>
        <el-form-item label="余额">
          <el-input v-model="editForm.balance" type="number" />
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="editForm.accountNumber" placeholder="如需更换请输入新卡号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isEdit=false">取消</el-button>
        <el-button type="primary" @click="onEditSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 人脸识别弹窗 -->
    <el-dialog v-model="faceDialogVisible" title="人脸识别验证" width="400px" :close-on-click-modal="false">
      <div v-if="!faceCaptured">
        <div class="face-video-box">
          <video ref="videoRef" width="340" height="240" autoplay />
        </div>
        <div class="face-btn-row">
          <el-button type="primary" @click="captureFace">拍照</el-button>
          <el-button type="default" @click="closeFaceDialog">取消</el-button>
        </div>
      </div>
      <div v-else>
        <div class="face-video-box">
          <img :src="faceImage" alt="face" width="340" height="240" />
        </div>
        <div class="face-btn-row">
          <el-button type="success" @click="submitFaceReveal">提交识别</el-button>
          <el-button type="default" @click="resetFace">重拍</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Edit, Refresh, Close, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const account = ref(null)
const accountNumber = ref('')
const showAccountNumber = ref(false)
const isEdit = ref(false)
const editForm = ref({})
const faceDialogVisible = ref(false)
const faceCaptured = ref(false)
const faceImage = ref('')
const stream = ref(null)
const videoRef = ref(null)

function goHome() {
  router.push('/home')
}

async function loadAccount() {
  try {
    const res = await axios.get('/api/account')
    account.value = res.data
    editForm.value = { ...account.value }
    editForm.value.accountNumber = ''
    showAccountNumber.value = false
    accountNumber.value = ''
  } catch (e) {
    ElMessage.error('获取账户信息失败')
  }
}
onMounted(loadAccount)

function refreshAccount() {
  loadAccount()
  ElMessage.success('已刷新')
}

async function onEditSubmit() {
  try {
    const res = await axios.put('/api/account', editForm.value)
    account.value = res.data
    isEdit.value = false
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

function openFaceDialog() {
  faceDialogVisible.value = true
  faceCaptured.value = false
  faceImage.value = ''
  nextTick(async () => {
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.value.srcObject = stream.value
    } catch (err) {
      ElMessage.error('无法访问摄像头，请检查权限')
      faceDialogVisible.value = false
    }
  })
}
function captureFace() {
  const video = videoRef.value
  const canvas = document.createElement('canvas')
  canvas.width = 340
  canvas.height = 240
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, 340, 240)
  faceImage.value = canvas.toDataURL('image/png')
  faceCaptured.value = true
  stopCamera()
}
function resetFace() {
  faceCaptured.value = false
  faceImage.value = ''
  openFaceDialog()
}
function closeFaceDialog() {
  stopCamera()
  faceDialogVisible.value = false
  faceCaptured.value = false
  faceImage.value = ''
}
function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
}
async function submitFaceReveal() {
  try {
    const res = await axios.post('/api/account/reveal-account-number', {
      accountId: account.value.id,
      faceImage: faceImage.value
    })
    if (res.data) {
      accountNumber.value = res.data
      showAccountNumber.value = true
      faceDialogVisible.value = false
      ElMessage.success('识别成功，已显示银行卡号')
    } else {
      ElMessage.error('识别失败')
      faceDialogVisible.value = false
    }
  } catch (e) {
    ElMessage.error('人脸识别请求失败')
    faceDialogVisible.value = false
  }
}
</script>

<style scoped>
.account-page-finance {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 56px;
  background: linear-gradient(120deg, #f8fafc 80%, #e6eeff 100%);
}
.account-card-finance {
  width: 540px;
  min-height: 440px;
  border-radius: 32px;
  padding: 32px 36px 28px 36px;
  box-shadow: 0 14px 38px rgba(25,118,210,0.13);
  display: flex;
  flex-direction: column;
}
.finance-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}
.finance-title {
  font-size: 1.32rem;
  font-weight: 700;
  letter-spacing: 1.3px;
  color: #273d71;
}
.finance-action-group {
  display: flex;
  gap: 14px;
}
.icon-btn {
  background: #f6faff;
  color: #1976d2;
  border: none;
  box-shadow: 0 2px 8px rgba(25,118,210,0.08);
  transition: background 0.18s, color 0.18s, box-shadow 0.19s, transform 0.18s;
}
.icon-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
  box-shadow: 0 4px 16px rgba(25,118,210,0.15);
  transform: scale(1.1);
}

.finance-main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bank-card-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}
.bank-card-bg {
  background: linear-gradient(120deg, #193c62 68%, #4870d3 100%);
  border-radius: 20px;
  color: #fff;
  padding: 22px 28px 16px 28px;
  box-shadow: 0 8px 32px rgba(25,118,210,0.15);
  min-width: 300px;
  max-width: 420px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border: 2px solid #eaefff;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.bank-logo-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Noto Sans SC', 'Segoe UI', Arial, sans-serif;
  margin-bottom: 6px;
}
.bank-logo {
  width: 28px;
  height: 28px;
  background: url("https://api.dicebear.com/7.x/bottts/svg?seed=bank") center/cover no-repeat;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(25,118,210,0.14);
}
.bank-title {
  color: #fff;
}
.bank-card-info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 2px;
  margin-top: 2px;
}
.bank-card-label {
  font-size: 0.98rem;
  font-weight: 600;
  color: #e3f2fd;
}
.bank-card-value {
  font-size: 1.35rem;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 700;
  letter-spacing: 1px;
  margin-left: 6px;
}
.bank-card-number {
  font-size: 1.1rem;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.12em;
  display: flex;
  align-items: center;
  margin-left: 8px;
}
.id-reveal-btn {
  background: #e3f2fd;
  color: #1976d2;
  box-shadow: 0 2px 8px rgba(25,118,210,0.08);
  border: none;
  transition: background 0.19s, color 0.19s, box-shadow 0.19s;
}
.id-reveal-btn:hover {
  background: #b3e5fc;
  color: #1565c0;
  box-shadow: 0 2px 8px rgba(25,118,210,0.16);
}

.finance-detail-section-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 10px;
  padding: 0 8px;
}
.detail-item {
  flex: 1;
  text-align: center;
}
.detail-label {
  font-size: 1.02rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 4px;
}
.detail-value {
  font-size: 1.09rem;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 700;
  color: #273d71;
}

.face-video-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 340px;
  height: 240px;
  margin-bottom: 12px;
}
.face-video-box video,
.face-video-box img {
  border-radius: 8px;
  width: 340px;
  height: 240px;
  object-fit: cover;
}
.face-btn-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-top: 18px;
}
</style>