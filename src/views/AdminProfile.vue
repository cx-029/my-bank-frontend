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
          <el-avatar :size="110" :src="admin.photoUrl || defaultAvatar" class="profile-avatar" />
        </div>
        <div class="profile-info">
          <div class="profile-name">
            <el-icon><UserFilled /></el-icon>
            {{ admin.realName }}
          </div>
          <div class="profile-id">
            <el-icon><CreditCard /></el-icon>
            用户名：{{ admin.username }}
          </div>
        </div>
      </div>
      <el-divider class="divider-fancy" />

      <!-- 两列展示（去掉备注） -->
      <div class="profile-section profile-columns-align">
        <div class="profile-cols-strict-grid">
          <!-- 第一行 -->
          <div class="strict-row">
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><Message /></el-icon> 邮箱</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value id-email-value">{{ admin.email || '-' }}
                <el-button
                    type="text"
                    class="copy-btn"
                    @click="copyToClipboard(admin.email)"
                    v-if="admin.email"
                    aria-label="复制邮箱"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </span>
            </div>
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><Phone /></el-icon> 手机号</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value id-email-value">{{ admin.phone || '-' }}
                <el-button
                    type="text"
                    class="copy-btn"
                    @click="copyToClipboard(admin.phone)"
                    v-if="admin.phone"
                    aria-label="复制手机号"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </span>
            </div>
          </div>
          <!-- 第二行 -->
          <div class="strict-row">
            <div class="strict-cell label-cell">
              <span class="label"><el-icon><Setting /></el-icon> 角色</span>
            </div>
            <div class="strict-cell value-cell">
              <span class="value">{{ admin.role || '-' }}</span>
            </div>
            <!-- 留空，去掉备注对应的两格 -->
            <div class="strict-cell label-cell"></div>
            <div class="strict-cell value-cell"></div>
          </div>
        </div>
      </div>

      <!-- 编辑弹窗（去掉备注项） -->
      <el-dialog
          v-model="isEdit"
          title="编辑个人信息"
          width="520px"
          class="profile-dialog fade-dialog"
          :close-on-click-modal="false"
          :append-to-body="true"
      >
        <el-form :model="editAdmin" :rules="rules" ref="formRef" label-width="90px" class="profile-form">
          <div class="edit-avatar-box">
            <el-avatar :size="96" :src="editAdmin.photoUrl || defaultAvatar" class="profile-avatar" />
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
          <el-form-item label="真实姓名">
            <el-input v-model="editAdmin.realName" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="editAdmin.email" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="editAdmin.phone" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="onSubmit">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, UserFilled, CreditCard, Phone, Message, Setting, DocumentCopy, Upload } from '@element-plus/icons-vue'
import axios from "axios"
import { useRouter } from 'vue-router'

const router = useRouter()

const admin = ref({
  username: '',
  realName: '',
  email: '',
  phone: '',
  role: '',
  photoUrl: ''
})
const editAdmin = ref({
  username: '',
  realName: '',
  email: '',
  phone: '',
  role: '',
  photoUrl: ''
})
const defaultAvatar = 'https://api.dicebear.com/7.x/identicon/svg?seed=admin'
const formRef = ref(null)
const rules = {}
const isEdit = ref(false)
const isDark = ref(false)

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
    const res = await axios.get('/api/admin/profile')
    if (res.data) {
      admin.value = { ...admin.value, ...res.data }
      editAdmin.value = {
        username: admin.value.username,
        realName: admin.value.realName,
        email: admin.value.email,
        phone: admin.value.phone,
        role: admin.value.role,
        photoUrl: admin.value.photoUrl
      }
    }
    isEdit.value = false
  } catch (e) {
    ElMessage.error('获取个人信息失败，请重试')
  }
}

const openEditDialog = () => {
  editAdmin.value = {
    username: admin.value.username,
    realName: admin.value.realName,
    email: admin.value.email,
    phone: admin.value.phone,
    role: admin.value.role,
    photoUrl: admin.value.photoUrl
  }
  isEdit.value = true
}

const cancelEdit = async () => {
  await loadProfile()
  isEdit.value = false
}
const onSubmit = async () => {
  try {
    await axios.put('/api/admin/profile', editAdmin.value)
    ElMessage.success('个人信息已保存')
    await loadProfile()
  } catch (e) {
    ElMessage.error('保存失败，请重试')
  }
}
function goHome() {
  router.push('/admin')
}

// 头像上传相关
function handleAvatarSuccess(response) {
  if (response.url) {
    editAdmin.value.photoUrl = response.url
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
.card-action-buttons {
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  gap: 16px;
  z-index: 10;
  align-items: center;
}
.back-home-btn, .edit-btn {
  transition: background 0.19s, color 0.19s, box-shadow 0.19s, transform 0.18s;
}
.back-home-btn {
  background: #fff;
  color: #1976d2;
  border: none;
  box-shadow: 0 2px 8px rgba(25,118,210,0.08);
}
.back-home-btn:hover, .edit-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
  box-shadow: 0 6px 24px rgba(25,118,210,0.18);
  transform: translateY(-2px) scale(1.08);
}
.close-icon {
  vertical-align: middle;
  background: none;
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
  box-shadow: 0 6px 24px rgba(25,118,210,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-avatar {
  border: 4px solid #ddeaff;
  box-shadow: 0 2px 12px rgba(25,118,210,0.13);
  transition: box-shadow 0.18s;
}
.profile-avatar:hover {
  box-shadow: 0 8px 32px rgba(25,118,210,0.23);
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
.divider-fancy {
  margin: 16px 0 18px 0;
  border: none;
  border-top: 2px dashed #e3eafc;
  background: none;
}
.bank-layout.dark-mode .divider-fancy {
  border-top: 2px dashed #33415a;
}
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
.bank-layout.dark-mode .profile-section.profile-columns-align {
  background: #232a3c;
  box-shadow: 0 1px 7px #223159;
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
.copy-btn {
  margin-left: 8px;
  vertical-align: middle;
  font-size: 1rem;
  padding: 0 6px;
  cursor: pointer;
  transition: background 0.19s, color 0.19s, box-shadow 0.19s;
}
.copy-btn:hover {
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
}
</style>