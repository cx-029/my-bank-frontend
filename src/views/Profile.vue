<template>
  <div class="profile-page bank-layout" :class="{'dark-mode': isDark}">
    <el-card class="profile-card" shadow="always">
      <!-- 右上角按钮组 -->
      <div class="card-action-buttons">
        <el-button
            class="back-home-btn"
            @click="goHome"
            circle
            size="large"
            aria-label="返回主页"
        >
          <svg class="close-icon" viewBox="0 0 32 32" width="22" height="22">
            <path d="M10 10 L22 22 M22 10 L10 22" stroke="#1976d2" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </el-button>
        <el-button
            type="primary"
            circle
            class="edit-btn"
            @click="openEditDialog"
            v-if="!isEdit"
            aria-label="编辑个人信息"
        >
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="profile-header">
        <div class="profile-avatar-wrap">
          <el-avatar :size="110" :src="customer.photoUrl || defaultAvatar" class="profile-avatar" />
        </div>
        <div class="profile-info">
          <div class="profile-name">
            <el-icon><UserFilled /></el-icon>
            {{ customer.name }}
          </div>
          <div class="profile-id">
            <el-icon><CreditCard /></el-icon>
            用户ID：{{ customer.id }}
          </div>
        </div>
      </div>
      <el-divider />

      <!-- 两列严格展示 -->
      <div class="profile-section profile-columns-align">
        <div class="profile-cols-strict-grid">
          <!-- 第一行 -->
          <div class="strict-row">
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><Location /></el-icon> 地址</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value">{{ customer.address || '-' }}</span>
            </div>
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><CreditCard /></el-icon> 身份证号</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value id-email-value">
                <!-- 展示时始终全*号 -->
                <span v-if="!showIdNumber" class="id-mask">{{ maskedIdNumber }}</span>
                <span v-else class="id-real">{{ customer.idNumberReal }}</span>
                <el-button
                    v-if="!showIdNumber"
                    type="text"
                    class="id-reveal-btn"
                    @click="onRevealIdClick"
                    aria-label="查看身份证号"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </span>
            </div>
          </div>
          <!-- 第二行 -->
          <div class="strict-row">
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><UserFilled /></el-icon> 性别</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value">{{ customer.gender || '-' }}</span>
            </div>
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><Phone /></el-icon> 手机号</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value id-email-value">{{ customer.phone || '-' }}
                <el-button
                    type="text"
                    class="copy-btn"
                    @click="copyToClipboard(customer.phone)"
                    v-if="customer.phone"
                    aria-label="复制手机号"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </span>
            </div>
          </div>
          <!-- 第三行 -->
          <div class="strict-row">
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><Calendar /></el-icon> 生日</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value">{{ formatDate(customer.birthday) }}</span>
            </div>
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><Message /></el-icon> 邮箱</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value id-email-value">{{ customer.email || '-' }}
                <el-button
                    type="text"
                    class="copy-btn"
                    @click="copyToClipboard(customer.email)"
                    v-if="customer.email"
                    aria-label="复制邮箱"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 人脸识别弹窗（摄像头拍照/识别） -->
      <el-dialog
          v-model="faceDialogVisible"
          title="人脸识别验证"
          width="400px"
          :close-on-click-modal="false"
          :append-to-body="true"
          class="fade-dialog"
      >
        <div class="face-dialog-content">
          <div v-if="!faceCaptured">
            <div class="face-video-box">
              <video ref="videoRef" width="340" height="240" autoplay />
            </div>
            <div class="face-btn-row-center">
              <el-button type="primary" @click="captureFace">拍照</el-button>
              <el-button @click="closeFaceDialog">取消</el-button>
            </div>
          </div>
          <div v-else>
            <div class="face-video-box">
              <img :src="faceImage" alt="face" width="340" height="240" />
            </div>
            <div class="face-btn-row-center">
              <el-button type="success" @click="submitFaceRecognize">提交识别</el-button>
              <el-button @click="resetFace">重拍</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
        v-model="isEdit"
        title="编辑个人信息"
        width="520px"
        class="profile-dialog fade-dialog"
        :close-on-click-modal="false"
        :append-to-body="true"
    >
      <el-form :model="editCustomer" :rules="rules" ref="formRef" label-width="90px" class="profile-form">
        <div class="edit-avatar-box">
          <el-avatar :size="96" :src="editCustomer.photoUrl || defaultAvatar" class="profile-avatar" />
          <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :http-request="customAvatarUpload"
              accept="image/*"
          >
            <el-button type="primary" size="small">
              <el-icon><Upload /></el-icon> 更换头像
            </el-button>
          </el-upload>
        </div>
        <el-form-item label="性别">
          <el-select v-model="editCustomer.gender" placeholder="请选择">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="身份证号">
          <!-- 不展示旧身份证号，仅可输入新号 -->
          <el-input
              v-model="editCustomer.idNumber"
              placeholder="如需修改请输入新身份证号"
              maxlength="18"
              show-password
              type="password"
          />
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="editCustomer.birthday" type="date" placeholder="请选择生日" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editCustomer.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editCustomer.email" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="editCustomer.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getProfile, updateProfile } from '@/api/profile'
import { Edit, UserFilled, CreditCard, Phone, Message, Location, Upload, Calendar, View, DocumentCopy } from '@element-plus/icons-vue'
import axios from "axios"
import { useRouter } from 'vue-router'

const router = useRouter()

const customer = ref({
  name: '',
  gender: '',
  id: '',
  idNumber: '',
  birthday: '',
  address: '',
  phone: '',
  email: '',
  photoUrl: '',
  idNumberReal: ''
})
// 用于编辑弹窗单独管理，避免泄露原身份证号
const editCustomer = ref({
  name: '',
  gender: '',
  id: '',
  idNumber: '', // 编辑时始终为空
  birthday: '',
  address: '',
  phone: '',
  email: '',
  photoUrl: ''
})
const defaultAvatar = 'https://api.dicebear.com/7.x/identicon/svg?seed=bankuser'
const formRef = ref(null)
const rules = {}
const isEdit = ref(false)
const isDark = ref(false)
const showIdNumber = ref(false)

// 展示时全部用*号
const maskedIdNumber = computed(() => {
  const len = customer.value.idNumber ? customer.value.idNumber.length : 18
  return '*'.repeat(len)
})

// 人脸识别相关
const faceDialogVisible = ref(false)
const faceCaptured = ref(false)
const faceImage = ref('')
const stream = ref(null)
const videoRef = ref(null)

function formatDate(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}
async function onRevealIdClick() {
  faceDialogVisible.value = true
  faceCaptured.value = false
  faceImage.value = ''
  await nextTick()
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.value.srcObject = stream.value
  } catch (err) {
    ElMessage.error('无法访问摄像头，请检查权限')
    faceDialogVisible.value = false
  }
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
async function resetFace() {
  faceCaptured.value = false
  faceImage.value = ''
  await onRevealIdClick()
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
async function submitFaceRecognize() {
  try {
    const res = await axios.post('/api/profile/id-number', { base64Image: faceImage.value })
    if (res.data) {
      customer.value.idNumberReal = res.data.idNumber
      showIdNumber.value = true
      faceDialogVisible.value = false
      ElMessage.success('人脸识别成功，已显示身份证号')
    } else {
      ElMessage.error('人脸识别失败')
    }
  } catch (e) {
    ElMessage.error('人脸识别请求失败')
    faceDialogVisible.value = false
  }
}

// 复制内容到剪贴板
function copyToClipboard(val) {
  if (!val) return
  navigator.clipboard.writeText(val).then(() => {
    ElMessage.success('已复制')
  }, () => {
    ElMessage.error('复制失败')
  })
}

const loadProfile = async () => {
  try {
    const res = await getProfile()
    if (res.data) {
      customer.value = { ...customer.value, ...res.data }
      // 编辑弹窗不展示旧身份证号
      editCustomer.value = {
        name: customer.value.name,
        gender: customer.value.gender,
        id: customer.value.id,
        idNumber: '', // 不预填身份证号！
        birthday: customer.value.birthday,
        address: customer.value.address,
        phone: customer.value.phone,
        email: customer.value.email,
        photoUrl: customer.value.photoUrl
      }
    }
    isEdit.value = false
    showIdNumber.value = false
    faceDialogVisible.value = false
  } catch (e) {
    ElMessage.error('获取个人信息失败，请重试')
  }
}

const openEditDialog = () => {
  // reload editCustomer from customer, 并保证 idNumber 为空
  editCustomer.value = {
    name: customer.value.name,
    gender: customer.value.gender,
    id: customer.value.id,
    idNumber: '', // 不预填身份证号
    birthday: customer.value.birthday,
    address: customer.value.address,
    phone: customer.value.phone,
    email: customer.value.email,
    photoUrl: customer.value.photoUrl
  }
  isEdit.value = true
}

const cancelEdit = async () => {
  await loadProfile()
  isEdit.value = false
}
const onSubmit = async () => {
  try {
    await updateProfile(editCustomer.value)
    ElMessage.success('个人信息已保存')
    await loadProfile()
  } catch (e) {
    ElMessage.error('保存失败，请重试')
  }
}
function goHome() {
  router.push('/home')
}

// 头像上传相关
function handleAvatarSuccess(response) {
  if (response.url) {
    editCustomer.value.photoUrl = response.url
    ElMessage.success('头像上传成功')
  }
}
function beforeAvatarUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('只能上传图片文件')
  if (!isLt2M) ElMessage.error('图片大小不能超过 2MB')
  return isImage && isLt2M
}
function customAvatarUpload(option) {
  const formData = new FormData()
  formData.append('file', option.file)
  axios.post('/api/upload/avatar', formData, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => {
    option.onSuccess(res.data, option.file)
  }).catch(err => {
    option.onError(err)
    ElMessage.error('头像上传失败')
  })
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-card {
  border-radius: 36px;
  box-shadow: 0 16px 48px rgba(25,118,210,0.18);
  background: linear-gradient(120deg, #f8fafc 80%, #e6eeff 100%);
  padding: 44px 22px 32px 22px;
  margin: auto;
  position: relative;
  overflow: visible;
}
.bank-layout.dark-mode .profile-card {
  background: linear-gradient(120deg, #232a3c 60%, #2d3446 100%);
}

/* 右上角按钮组 */
.card-action-buttons {
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  gap: 16px;
  z-index: 10;
  align-items: center;
}
.back-home-btn,
.edit-btn {
  transition: background 0.19s, color 0.19s, box-shadow 0.19s, transform 0.18s;
}
.back-home-btn {
  background: #fff;
  color: #1976d2;
  border: none;
  box-shadow: 0 2px 8px rgba(25,118,210,0.08);
}
.back-home-btn:hover,
.edit-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
  box-shadow: 0 4px 16px rgba(25,118,210,0.15);
  transform: translateY(-2px) scale(1.08);
}
.close-icon {
  vertical-align: middle;
  background: none;
}

/* 主体信息头部 */
.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 8px;
  position: relative;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.profile-avatar-wrap {
  background: linear-gradient(90deg,#ddeaff 60%,#f8fafc 100%);
  border-radius: 50%;
  padding: 9px;
  box-shadow: 0 2px 18px rgba(25,118,210,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-avatar {
  border: 4px solid #ddeaff;
  box-shadow: 0 2px 12px rgba(25,118,210,0.13);
}
.profile-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 160px;
}
.profile-name {
  font-size: 1.32rem;
  font-family: 'Noto Sans SC','Segoe UI','PingFang SC','Arial',sans-serif;
  font-weight: 800;
  color: #1976d2;
  letter-spacing: 1px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-all;
}
.bank-layout.dark-mode .profile-name {
  color: #7bb4fa;
}
.profile-id {
  font-size: 1.11rem;
  color: #264062;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-all;
  font-family: 'Noto Sans SC','Segoe UI','Arial',sans-serif;
}
.bank-layout.dark-mode .profile-id {
  color: #b7d6ff;
}

/* 严格两列对齐排版 */
.profile-section.profile-columns-align {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 18px;
  border-radius: 20px;
  background: #f4f7fb;
  padding: 22px 0;
  box-shadow: 0 1px 7px rgba(25,118,210,0.07);
  font-size: 1.08rem;
}
.profile-cols-strict-grid {
  display: grid;
  grid-template-rows: repeat(3, auto);
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  width: 100%;
}
.strict-row {
  display: contents;
}
.strict-cell {
  display: flex;
  align-items: center;
  padding: 8px 0;
}
.label-cell .label {
  font-size: 1.09rem;
  min-width: 120px;
  color: #1976d2;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Noto Sans SC','Segoe UI','Arial',sans-serif;
}
.value-cell .value {
  font-size: 1.13rem;
  max-width: 320px;
  word-break: break-all;
  color: #222;
  font-family: 'Consolas','JetBrains Mono','PingFang SC',monospace;
  font-weight: 500;
  transition: color 0.19s;
}
.id-email-value {
  font-family: 'Consolas','JetBrains Mono','PingFang SC',monospace;
}
.id-mask {
  letter-spacing: 0.22em;
  font-size: 1.12rem;
  color: #888;
  font-family: 'Consolas','JetBrains Mono',monospace;
  margin-right: 8px;
}
.id-reveal-btn, .copy-btn {
  margin-left: 8px;
  vertical-align: middle;
  font-size: 1rem;
  padding: 0 6px;
  cursor: pointer;
  transition: background 0.19s, color 0.19s, box-shadow 0.19s;
}
.id-reveal-btn:hover, .copy-btn:hover {
  background-color: #e3f2fd;
  color: #1976d2;
  box-shadow: 0 2px 10px rgba(25,118,210,0.12);
}
.bank-layout.dark-mode .value-cell .value,
.bank-layout.dark-mode .id-email-value {
  color: #b7d6ff;
}
.bank-layout.dark-mode .label-cell .label {
  color: #7bb4fa;
}

.profile-dialog :deep(.el-dialog__header) {
  background: #e3f2fd;
  font-weight: 700;
  color: #1976d2;
  font-size: 1.18rem;
}
.bank-layout.dark-mode .profile-dialog :deep(.el-dialog__header) {
  background: #232a3c;
  color: #7bb4fa;
}
.edit-avatar-box {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 18px;
}
.avatar-uploader {
  display: flex;
  align-items: center;
}

/* 人脸识别弹窗内容居中和动画 */
.face-dialog-content, .fade-dialog {
  animation: fadeIn 0.32s cubic-bezier(.33,.91,.54,.97);
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96);}
  to { opacity: 1; transform: scale(1);}
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
/* 人脸识别按钮居中 */
.face-btn-row-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-top: 18px;
}
/* 响应式严格两列自动单列 */
@media (max-width: 900px) {
  .profile-card { width: 98vw; padding: 12px 2vw; }
  .profile-header { flex-direction: column; gap: 16px; align-items: center;}
  .profile-section.profile-columns-align { padding: 10px 0;}
  .profile-cols-strict-grid { grid-template-columns: 1fr 1fr; }
  .strict-cell { padding: 8px 0; }
  .label-cell .label { min-width: 46px; font-size: 1rem;}
  .value-cell .value, .id-email-value {
    max-width: 96vw;
    min-width: 0;
    font-size: 1.04rem;
  }
  .face-video-box {
    width: 92vw;
    height: auto;
  }
  .face-video-box video,
  .face-video-box img {
    width: 92vw;
    height: auto;
    max-width: 340px;
    max-height: 240px;
  }
}
</style>