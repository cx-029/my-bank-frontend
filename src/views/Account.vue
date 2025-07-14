<template>
  <div class="account-page">
    <el-card class="account-card" shadow="always">
      <h2>账户管理</h2>
      <el-descriptions v-if="account" :column="1" border>
        <el-descriptions-item label="账户ID">{{ account.id }}</el-descriptions-item>
        <el-descriptions-item label="账户类型">{{ account.accountType }}</el-descriptions-item>
        <el-descriptions-item label="账户状态">{{ account.status }}</el-descriptions-item>
        <el-descriptions-item label="账户余额">{{ account.balance }}</el-descriptions-item>
        <el-descriptions-item label="银行卡号">
          <span v-if="!showAccountNumber">************</span>
          <span v-else>{{ accountNumber }}</span>
          <el-button
              type="primary"
              v-if="!showAccountNumber"
              @click="openFaceDialog"
              size="small"
              style="margin-left:12px;"
          >人脸识别查看</el-button>
        </el-descriptions-item>
      </el-descriptions>
      <div style="margin-top:24px;">
        <el-button type="primary" @click="isEdit=true">编辑账户信息</el-button>
        <el-button type="default" @click="refreshAccount" style="margin-left:12px;">刷新</el-button>
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
          <!-- 不预填旧卡号，只让用户输入新卡号 -->
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

async function loadAccount() {
  try {
    const res = await axios.get('/api/account')
    account.value = res.data
    editForm.value = { ...account.value }
    // 关键：不预填银行卡号，只是空字符串
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
    }
  } catch (e) {
    ElMessage.error('人脸识别请求失败')
    faceDialogVisible.value = false
  }
}
</script>

<style scoped>
.account-page {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 56px;
  background: linear-gradient(120deg, #f8fafc 80%, #e6eeff 100%);
}
.account-card {
  width: 480px;
  min-height: 340px;
  border-radius: 28px;
  padding: 36px 32px 24px 32px;
  box-shadow: 0 12px 36px rgba(25,118,210,0.11);
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