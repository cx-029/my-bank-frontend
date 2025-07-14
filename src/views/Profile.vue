<template>
  <div class="profile-page bank-layout" :class="{'dark-mode': isDark}">
    <el-card class="profile-card" shadow="always">
      <!-- 右上角退出按钮（叉叉） -->
      <el-button
          class="back-home-btn"
          @click="goHome"
          circle
          size="large"
          style="position:absolute;top:18px;right:18px;z-index:10;"
          aria-label="返回主页"
      >
        <svg class="close-icon" viewBox="0 0 32 32" width="22" height="22">
          <circle cx="16" cy="16" r="15" fill="#e3f2fd"/>
          <path d="M10 10 L22 22 M22 10 L10 22" stroke="#1976d2" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </el-button>
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
        <el-button
            type="primary"
            circle
            class="edit-btn"
            @click="isEdit = true"
            v-if="!isEdit"
            style="position:absolute;top:18px;right:68px;z-index:10;"
        >
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <el-divider />

      <!-- 信息横排展示，所有字段一排居中，自动均分宽度 -->
      <div class="profile-section profile-row-horizontal">
        <div class="profile-row-flex">
          <div class="profile-field flex-field">
            <span class="label"><el-icon><Phone /></el-icon> 手机号</span>
            <span class="value">{{ customer.phone || '-' }}</span>
          </div>
          <div class="profile-field flex-field">
            <span class="label"><el-icon><UserFilled /></el-icon> 性别</span>
            <span class="value">{{ customer.gender || '-' }}</span>
          </div>
          <div class="profile-field flex-field">
            <span class="label"><el-icon><Calendar /></el-icon> 生日</span>
            <span class="value">{{ formatDate(customer.birthday) }}</span>
          </div>
          <div class="profile-field flex-field">
            <span class="label"><el-icon><Location /></el-icon> 地址</span>
            <span class="value">{{ customer.address || '-' }}</span>
          </div>
          <div class="profile-field flex-field wide-field">
            <span class="label"><el-icon><CreditCard /></el-icon> 身份证号</span>
            <span class="value id-email-value">
              <template v-if="!showIdNumber">
                <span class="id-mask">{{ maskIdNumber(customer.idNumber) }}</span>
                <el-button
                    size="small"
                    type="info"
                    class="id-reveal-btn"
                    @click="onRevealIdClick"
                >
                  <el-icon><View /></el-icon> 查看
                </el-button>
              </template>
              <template v-else>
                <span class="id-number-real">{{ customer.idNumber }}</span>
              </template>
            </span>
          </div>
          <div class="profile-field flex-field wide-field">
            <span class="label"><el-icon><Message /></el-icon> 邮箱</span>
            <span class="value id-email-value">
              {{ customer.email || '-' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 人脸识别弹窗 -->
      <el-dialog
          v-model="showFaceDialog"
          title="人脸识别验证"
          width="400px"
          :close-on-click-modal="false"
          :append-to-body="true"
      >
        <div style="text-align:center;padding:30px 0;">
          <div class="face-box">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="#e3f2fd" stroke="#1976d2" stroke-width="3"/>
              <ellipse cx="40" cy="48" rx="17" ry="8" fill="#bbdefb"/>
              <circle cx="32" cy="38" r="5" fill="#1976d2"/>
              <circle cx="48" cy="38" r="5" fill="#1976d2"/>
              <ellipse cx="40" cy="55" rx="7" ry="3" fill="#1976d2" opacity="0.18"/>
            </svg>
          </div>
          <div style="margin:18px 0 10px;font-size:1.18rem;color:#1976d2;font-weight:600;">请进行人脸识别</div>
          <el-button type="primary" @click="faceRecognize">开始识别</el-button>
        </div>
      </el-dialog>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
        v-model="isEdit"
        title="编辑个人信息"
        width="520px"
        class="profile-dialog"
        :close-on-click-modal="false"
        :append-to-body="true"
    >
      <el-form :model="customer" :rules="rules" ref="formRef" label-width="90px" class="profile-form">
        <div class="edit-avatar-box">
          <el-avatar :size="96" :src="customer.photoUrl || defaultAvatar" class="profile-avatar" />
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
          <el-select v-model="customer.gender" placeholder="请选择">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="customer.idNumber" type="password" show-password maxlength="18" />
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="customer.birthday" type="date" placeholder="请选择生日" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="customer.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="customer.email" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="customer.address" />
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getProfile, updateProfile } from '@/api/profile'
import { Edit, UserFilled, CreditCard, Phone, Message, Location, Upload, Calendar, View } from '@element-plus/icons-vue'
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
  photoUrl: ''
})
const defaultAvatar = 'https://api.dicebear.com/7.x/identicon/svg?seed=bankuser'
const formRef = ref(null)
const rules = {}
const isEdit = ref(false)
const isDark = ref(false)

const showIdNumber = ref(false)
const showFaceDialog = ref(false)

function maskIdNumber(idNumber) {
  // 显示身份证号最后两位，其余用*号填充
  if (!idNumber) return '-'
  const len = idNumber.length
  if (len <= 2) return idNumber
  return '*'.repeat(len - 2) + idNumber.slice(-2)
}
function formatDate(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}
function onRevealIdClick() {
  showFaceDialog.value = true
}
function faceRecognize() {
  setTimeout(() => {
    showIdNumber.value = true
    showFaceDialog.value = false
    ElMessage.success('人脸识别成功，已显示身份证号')
  }, 1200)
}

const loadProfile = async () => {
  try {
    const res = await getProfile()
    if (res.data) {
      customer.value = { ...customer.value, ...res.data }
    }
    isEdit.value = false
    showIdNumber.value = false
    showFaceDialog.value = false
  } catch (e) {
    ElMessage.error('获取个人信息失败，请重试')
  }
}
const cancelEdit = async () => {
  await loadProfile()
  isEdit.value = false
}
const onSubmit = async () => {
  try {
    await updateProfile(customer.value)
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
    customer.value.photoUrl = response.url
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
.profile-page {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
}
.bank-layout.dark-mode .profile-page {
  background: #232a3c;
}
.profile-card {
  width: 900px;
  border-radius: 34px;
  box-shadow: 0 12px 32px rgba(25,118,210,0.15);
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
  position: relative;
  padding: 44px 22px 32px 22px;
  background: linear-gradient(120deg, #f8fafc 80%, #e6eeff 100%);
  margin: auto;
}
.bank-layout.dark-mode .profile-card {
  background: linear-gradient(120deg, #232a3c 60%, #2d3446 100%);
}
.back-home-btn {
  background: linear-gradient(90deg,#bbdefb 70%,#e3f2fd 100%);
  color: #1976d2;
  box-shadow: 0 2px 12px rgba(25,118,210,0.08);
  border-radius: 50%;
  border: none;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-icon {
  vertical-align: middle;
}
.back-home-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
}
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
  font-size: 1.28rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  word-break: break-all;
}
.bank-layout.dark-mode .profile-name {
  color: #7bb4fa;
}
.profile-id {
  font-size: 1.09rem;
  color: #264062;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  word-break: break-all;
}
.bank-layout.dark-mode .profile-id {
  color: #b7d6ff;
}
.edit-btn {
  border-radius: 50%;
  background: linear-gradient(90deg,#1976d2 60%,#53a6e7 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(25,118,210,0.09);
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bank-layout.dark-mode .edit-btn {
  background: linear-gradient(90deg,#395180 80%,#233159 100%);
  color: #7bb4fa;
}
.profile-section.profile-row-horizontal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
  border-radius: 20px;
  background: #f4f7fb;
  padding: 19px 12px 19px 12px;
  box-shadow: 0 1px 7px rgba(25,118,210,0.07);
  font-size: 1.08rem;
}
.bank-layout.dark-mode .profile-section.profile-row-horizontal {
  background: #232a3c;
}
.profile-row-flex {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  width: 100%;
  gap: 0;
}
.profile-field.flex-field {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 4px 0;
}
.label {
  min-width: 65px;
  color: #1976d2;
  font-weight: 600;
  font-size: 1.03rem;
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: flex-end;
}
.bank-layout.dark-mode .label {
  color: #7bb4fa;
}
.value {
  color: #264062;
  font-weight: 500;
  letter-spacing: 1px;
  font-size: 1.03rem;
  text-align: left;
  max-width: 95px;
  word-break: break-all;
  display: flex;
  align-items: center;
}
.wide-field .value, .id-email-value {
  max-width: 150px;
  flex: 1;
  font-size: 1.03rem;
}
.id-mask {
  letter-spacing: 0.22em;
  font-size: 1.06rem;
  color: #aaa;
  font-family: 'Consolas','Courier New',monospace;
  margin-right: 8px;
}
.id-reveal-btn {
  margin-left: 0;
  vertical-align: middle;
  font-size: 0.95rem;
  padding: 2px 8px;
}
.id-number-real {
  font-family: 'Consolas','Courier New',monospace;
  font-size: 1.04rem;
  color: #1976d2;
  background: #e3f2fd;
  border-radius: 5px;
  padding: 2px 7px;
  letter-spacing: 0.12em;
}
.face-box {
  margin-bottom: 18px;
}
.bank-layout.dark-mode .value {
  color: #b7d6ff;
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
/* 响应式：横排，小屏自动换行 */
@media (max-width: 900px) {
  .profile-card { width: 98vw; padding: 12px 2vw; }
  .profile-header { flex-direction: column; gap: 16px; align-items: center;}
  .profile-section.profile-row-horizontal { padding: 12px 2vw; }
  .profile-row-flex { flex-direction: column; }
  .profile-field.flex-field { justify-content: flex-start; gap: 7px; }
  .label { min-width: 46px; font-size: 0.95rem;}
  .value, .id-email-value, .wide-field .value { max-width: 96vw; font-size: 0.95rem;}
}
</style>