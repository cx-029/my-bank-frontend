<template>
  <div class="bank-layout" :class="{'dark-mode': isDark}">
    <!-- 顶部栏 -->
    <header class="bank-header">
      <div class="bank-title">
        <svg width="36" height="36" viewBox="0 0 62 62" fill="none">
          <defs>
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="62" y2="62" gradientUnits="userSpaceOnUse">
              <stop stop-color="#1976d2"/>
              <stop offset="1" stop-color="#5596e6"/>
            </linearGradient>
          </defs>
          <path d="M31 7C25 14 13 16 13 16v12c0 18 14 24 18 25 4-1 18-7 18-25V16s-12-2-18-9z" fill="url(#shieldGrad)" />
          <circle cx="31" cy="29" r="9.5" fill="#fff" stroke="#1976d2" stroke-width="2"/>
          <path d="M31 22v14M25.5 29h11" stroke="#1976d2" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>智慧银行系统</span>
      </div>
      <div class="bank-user">
        <el-switch
            v-model="isDark"
            active-text="夜间"
            inactive-text="日间"
            style="margin-right: 32px"
        />
        <el-dropdown>
          <span class="user-area">
            <el-avatar :size="26" :src="avatarUrl" />
            <span class="username-full" :title="username">{{ username }}</span>
            <i class="el-icon-arrow-down"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goProfile"><i class="el-icon-user"></i> 个人中心</el-dropdown-item>
              <el-dropdown-item divided @click="logout"><i class="el-icon-switch-button"></i> 退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 侧边栏紧贴页面最顶端且不遮挡内容 -->
    <aside
        class="bank-sidenav"
        :class="{ 'collapsed': !navHover, 'dark-mode': isDark }"
        @mouseenter="navHover = true"
        @mouseleave="navHover = false"
    >
      <div class="sidenav-spacer"></div>
      <el-menu
          :default-active="activeMenu"
          class="bank-menu"
          :collapse="!navHover"
          background-color="transparent"
          text-color="#264062"
          active-text-color="#1976d2"
          @select="handleMenuSelect"
          collapse-transition
      >
        <el-menu-item index="profile">
          <el-icon><UserFilled /></el-icon>
          <span v-if="navHover" class="sidenav-label">个人中心</span>
        </el-menu-item>
        <el-menu-item index="account">
          <el-icon><CreditCard /></el-icon>
          <span v-if="navHover" class="sidenav-label">账户管理</span>
        </el-menu-item>
        <el-menu-item index="loss">
          <el-icon><WarningFilled /></el-icon>
          <span v-if="navHover" class="sidenav-label">挂失管理</span>
        </el-menu-item>
        <el-menu-item index="notice">
          <el-icon><BellFilled /></el-icon>
          <span v-if="navHover" class="sidenav-label">通知中心</span>
        </el-menu-item>
        <el-menu-item index="deposit">
          <el-icon><WalletFilled /></el-icon>
          <span v-if="navHover" class="sidenav-label">存取管理</span>
        </el-menu-item>
        <el-menu-item index="ai">
          <el-icon><Cpu /></el-icon>
          <span v-if="navHover" class="sidenav-label">AI助手</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 人脸识别弹窗 -->
    <el-dialog v-model="showFaceDialog" :title="null" width="420px" center>
      <div class="face-dialog-content">
        <div class="face-title" style="margin-bottom: 20px; text-align: center; width: 100%; font-size: 1.16rem; font-weight: 600;">
          {{ faceDialogTitle }}
        </div>
        <div class="face-preview">
          <video ref="videoRef" class="face-video" autoplay playsinline width="320" height="240"></video>
          <canvas ref="canvasRef" style="display:none;" width="320" height="240"></canvas>
        </div>
        <div class="face-btn-row">
          <el-button type="primary" :loading="faceLoading" @click="captureFace">拍照并识别</el-button>
          <el-button @click="closeFaceDialog">取消</el-button>
        </div>
        <div v-if="faceError" class="face-error">{{ faceError }}</div>
      </div>
    </el-dialog>

    <!-- 主内容区 -->
    <main class="bank-main">
      <div class="ai-main-scroll">
        <el-card class="ai-card ai-card-border" shadow="always">
          <div class="ai-center">
            <img
                class="ai-avatar"
                :class="{'ai-avatar-anim': showAvatarAnim}"
                src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/Robot/3D/robot_3d.png"
                alt="AI助手"
                @animationend="showAvatarAnim = false"
            />
            <div class="ai-title">AI助手</div>
            <div class="ai-hello">您好，有什么可以帮您？</div>
            <!-- 聊天对话展示（最大高度限制，内容多时滚动，按钮永不被挤出去） -->
            <div class="ai-dialog">
              <div v-for="(msg, idx) in chatList" :key="idx" :class="['ai-msg', msg.role]">
                <template v-if="msg.role==='user'">
                  <div class="ai-msg-content user">{{ msg.text }}</div>
                </template>
                <template v-else>
                  <div class="ai-msg-content ai">
                    <img class="ai-avatar-mini" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/Robot/3D/robot_3d.png" alt="ai" />
                    <span>{{ msg.text }}</span>
                  </div>
                </template>
              </div>
            </div>
            <div class="ai-chat-row-centered">
              <el-input
                  v-model="aiInput"
                  placeholder="输入您的问题..."
                  class="ai-input"
                  @keyup.enter="sendAIMessage"
                  @keyup.ctrl.enter.native="ctrlEnterSend"
                  clearable
                  ref="aiInputRef"
                  :class="{'dark-input': isDark}"
              >
                <template #suffix>
                  <span class="voice-btn" @click="voiceInput" title="语音输入（开发中）">
                    <svg viewBox="0 0 24 24" width="22" height="22" :class="['icon-mic', isDark?'dark-mic':'']" fill="currentColor">
                      <path d="M12 16a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V22a1 1 0 1 0 2 0v-2.08A7 7 0 0 0 19 13z"/>
                    </svg>
                  </span>
                </template>
              </el-input>
              <div class="ai-btn-row">
                <el-button
                    type="primary"
                    @click="sendAIMessage"
                    class="send-btn"
                    :style="{padding: 0}"
                >
                  <span class="btn-content">发送</span>
                </el-button>
                <el-button
                    size="default"
                    @click="aiInput=''"
                    class="clear-btn"
                    :style="{padding: 0}"
                >
                  <span class="btn-content">清空</span>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { UserFilled, CreditCard, WarningFilled, BellFilled, WalletFilled, Cpu } from '@element-plus/icons-vue'

const router = useRouter()
const username = ref('用户')
const avatarUrl = ref('https://api.dicebear.com/7.x/identicon/svg?seed=bankuser')
const aiInput = ref('')
const navHover = ref(false)
const activeMenu = ref('ai')
const isDark = ref(false)
const aiInputRef = ref(null)
const showAvatarAnim = ref(true)
const chatList = ref([])

// 人脸识别相关
const showFaceDialog = ref(false)
const faceLoading = ref(false)
const faceError = ref('')
const videoRef = ref(null)
const canvasRef = ref(null)
const faceNextRoute = ref('')

// 动态弹窗标题
const faceDialogTitle = computed(() => {
  if (faceNextRoute.value === '/deposit') {
    return '请进行人脸识别，以进入存取管理'
  } else if (faceNextRoute.value === '/loss') {
    return '请进行人脸识别，以进入挂失管理'
  }
  return '请进行人脸识别'
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  delete axios.defaults.headers.common['Authorization']
  ElMessage.success('已退出登录')
  router.push('/login')
}
const goProfile = () => {
  router.push('/profile')
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'deposit') {
    faceNextRoute.value = '/deposit'
    openFaceDialog()
  } else if (index === 'loss') {
    faceNextRoute.value = '/loss'
    openFaceDialog()
  } else if (index === 'profile') {
    router.push('/profile')
  } else if (index === 'account') {
    router.push('/account')
  }else if (index === 'notice'){
    router.push('/notifications')
  } else {
    ElMessage.info(`【${menuName(index)}】功能开发中`)
  }
}

const menuName = (index) =>
    ({
      profile: '个人中心',
      account: '账户管理',
      deposit: '存取管理',
      loss: '挂失管理',
      notice: '通知中心',
      ai: 'AI助手'
    }[index] || index)

const sendAIMessage = async () => {
  const q = aiInput.value.trim()
  if (!q) return
  chatList.value.push({ role: 'user', text: q })
  aiInput.value = ''
  nextTick(() => {
    aiInputRef.value && aiInputRef.value.focus()
    scrollToBottom()
  })

  try {
    // 调用后端AI助手接口
    const res = await axios.post('/api/ai/chat', { question: q })
    chatList.value.push({ role: 'ai', text: res.data.answer || 'AI助手未能理解您的问题。' })
    nextTick(scrollToBottom)
  } catch (e) {
    chatList.value.push({ role: 'ai', text: 'AI助手服务暂时不可用，请稍后再试。' })
    nextTick(scrollToBottom)
  }
}
const ctrlEnterSend = (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    sendAIMessage()
  }
}
const voiceInput = () => {
  ElMessage.info('语音输入功能开发中，敬请期待～')
}
function scrollToBottom() {
  const dialog = document.querySelector('.ai-dialog')
  if (dialog) dialog.scrollTop = dialog.scrollHeight
}

// 人脸识别弹窗流程
const openFaceDialog = async () => {
  faceError.value = ''
  showFaceDialog.value = true
  await nextTick()
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  } catch (e) {
    faceError.value = '无法访问摄像头，请检查浏览器权限或设备支持'
  }
}
const closeFaceDialog = () => {
  showFaceDialog.value = false
  stopCamera()
  faceError.value = ''
  // faceNextRoute.value = ''  // 不要在这里清空
}
function stopCamera() {
  if (videoRef.value && videoRef.value.srcObject) {
    let tracks = videoRef.value.srcObject.getTracks()
    tracks.forEach(track => track.stop())
    videoRef.value.srcObject = null
  }
}
const captureFace = async () => {
  faceError.value = ''
  faceLoading.value = true
  try {
    const video = videoRef.value
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const base64Image = canvas.toDataURL('image/jpeg')
    const res = await axios.post('/api/account/face-verify', { image: base64Image })
    if (res.data && res.data.success) {
      ElMessage.success('人脸识别成功')
      const route = faceNextRoute.value
      closeFaceDialog()
      if (route) {
        nextTick(() => {
          router.push(route)
          faceNextRoute.value = ''
        })
      }
    } else {
      faceError.value = res.data.error || '人脸识别失败，请确保正对摄像头并重试'
    }
  } catch (e) {
    faceError.value = '识别过程中发生错误，请重试'
  } finally {
    faceLoading.value = false
  }
}
onMounted(async () => {
  showAvatarAnim.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    // 拉取主页数据
    const res = await axios.get('/api/home', {
      headers: { Authorization: 'Bearer ' + token }
    })
    if (res.data.username) username.value = res.data.username
    if (res.data.avatar) avatarUrl.value = res.data.avatar
  } catch (e) {
    ElMessage.error('拉取主页信息失败，请重新登录')
    router.push('/login')
  }
})
</script>

<style scoped>
.bank-layout {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(120deg, #f8fafc 60%, #e6eeff 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
}
.bank-layout.dark-mode {
  background: linear-gradient(120deg, #232a3c 60%, #151a24 100%);
}
.bank-header {
  height: 104px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(25,118,210,0.06);
  padding: 0 56px 0 0;
  position: relative;
  z-index: 10;
}
.bank-layout.dark-mode .bank-header {
  background: #181d26;
  color: #f6f7fb;
  box-shadow: 0 2px 8px rgba(25,118,210,0.13);
}
.bank-title {
  display: flex;
  align-items: center;
  font-size: 1.75rem;
  font-family: 'Segoe UI Semibold', 'PingFang SC', 'Arial', sans-serif;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 2.5px;
  margin-left: 38px;
  user-select: none;
}
.bank-layout.dark-mode .bank-title {
  color: #7bb4fa;
}
.bank-title svg {
  margin-right: 22px;
}
.bank-user {
  display: flex;
  align-items: center;
}
.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 1.13rem;
  color: #222;
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
}
.bank-layout.dark-mode .user-area {
  color: #eee;
}
.username-full {
  margin-left: 7px;
  font-weight: 600;
  max-width: 196px;
  min-height: 32px;
  height: 32px;
  line-height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
  font-size: 1.18rem;
  letter-spacing: 0.5px;
  color: #2a3544;
}
.bank-layout.dark-mode .username-full {
  color: #e2e7f6;
}
.bank-sidenav {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: #fff;
  box-shadow: 2px 0 12px rgba(25,118,210,0.08);
  z-index: 9;
  transition: width 0.22s cubic-bezier(.62,.04,.34,1.02);
  width: 56px;
  overflow-x: hidden;
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.sidenav-spacer {
  height: 104px;
  flex-shrink: 0;
}
.bank-sidenav.dark-mode {
  background: #232a3c;
  box-shadow: 2px 0 12px rgba(25,118,210,0.20);
}
.bank-sidenav.collapsed {
  width: 56px;
}
.bank-sidenav:not(.collapsed) {
  width: 170px;
}
.bank-menu {
  border-right: none;
  margin-top: 0;
  min-height: 0;
  background: transparent;
  user-select: none;
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
}
.bank-menu .el-menu-item {
  height: 54px;
  font-size: 1.17rem;
  border-radius: 10px;
  margin: 4px 6px;
  display: flex;
  align-items: center;
  transition: background 0.18s;
  overflow: hidden;
  font-weight: 600;
  letter-spacing: 1.2px;
  justify-content: center;
  font-family: 'Segoe UI Semibold', 'PingFang SC', 'Arial', sans-serif;
  border: none;
}
.sidenav-label {
  font-size: 1.09rem;
  letter-spacing: 0.4px;
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
  color: #264062;
  font-weight: 500;
}
.bank-layout.dark-mode .sidenav-label {
  color: #b7d6ff;
}
.bank-menu .el-menu-item.is-active,
.bank-menu .el-menu-item:hover {
  background: linear-gradient(90deg, #e3f2fd 70%, #bbdefb 100%) !important;
  color: #1976d2 !important;
}
.bank-layout.dark-mode .bank-menu .el-menu-item.is-active,
.bank-layout.dark-mode .bank-menu .el-menu-item:hover {
  background: linear-gradient(90deg, #2c3a54 70%, #223159 100%) !important;
  color: #79a7fa !important;
}
.bank-menu .el-menu-item .el-icon {
  margin-right: 0;
  font-size: 1.38em;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bank-layout.dark-mode .bank-menu .el-menu-item .el-icon {
  color: #79a7fa;
}
.bank-sidenav:not(.collapsed) .bank-menu .el-menu-item .el-icon {
  margin-right: 13px;
}
.bank-sidenav:not(.collapsed) .bank-menu .el-menu-item {
  justify-content: flex-start;
}
.bank-sidenav.collapsed .bank-menu .el-menu-item span {
  display: none;
}

/* main & card */
.ai-main-scroll {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 32px 0;
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
  margin-left: 56px;
}
.bank-layout.dark-mode .ai-main-scroll::-webkit-scrollbar,
.bank-layout.dark-mode .ai-dialog::-webkit-scrollbar {
  background: #232a3c;
  width: 8px;
}
.bank-layout.dark-mode .ai-main-scroll::-webkit-scrollbar-thumb,
.bank-layout.dark-mode .ai-dialog::-webkit-scrollbar-thumb {
  background: #33415a;
  border-radius: 8px;
}
.bank-layout.dark-mode .ai-main-scroll::-webkit-scrollbar-corner,
.bank-layout.dark-mode .ai-dialog::-webkit-scrollbar-corner {
  background: #232a3c;
}
.bank-main {
  margin-left: 0;
  margin-top: 0;
  height: 100vh;
  width: 100vw;
  background: transparent;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: visible;
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
}
.ai-card {
  min-width: 370px;
  width: 420px;
  max-width: 94vw;
  min-height: 530px;
  max-height: 650px;
  height: 530px;
  margin: 0 auto;
  padding: 40px 32px 34px 32px;
  border-radius: 36px;
  background: #fff;
  box-shadow: 0 20px 60px 0 rgba(25, 50, 110, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}
.bank-layout.dark-mode .ai-card {
  background: #262f44;
  color: #e2e7f6;
  box-shadow: 0 20px 60px 0 rgba(80, 120, 200, 0.12);
}
.ai-card-border {
  border: 2px solid #ddeaff;
}
.bank-layout.dark-mode .ai-card-border {
  border: 2px solid #3c4c6e;
}
.ai-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  position: relative;
}
.ai-avatar {
  width: 26px;
  height: 26px;
  margin-bottom: 12px;
  border-radius: 7px;
  background: #e3ebfc;
  box-shadow: 0 2px 12px rgba(25,118,210,0.08);
  object-fit: cover;
  transition: transform 0.35s cubic-bezier(.6,-0.28,.74,.05);
}
.ai-avatar-anim {
  animation: aiWave 1.2s cubic-bezier(.5,0,.5,1.1) 1;
}
@keyframes aiWave {
  0% { transform: scale(1);}
  18% { transform: scale(1.12) rotate(-8deg);}
  38% { transform: scale(1.08) rotate(7deg);}
  55% { transform: scale(1.14) rotate(-10deg);}
  70% { transform: scale(1.04) rotate(4deg);}
  86% { transform: scale(1.1) rotate(-3deg);}
  100% { transform: scale(1) rotate(0deg);}
}
.ai-title {
  font-size: 1.32rem;
  color: #1976d2;
  font-weight: 700;
  margin-bottom: 2px;
  letter-spacing: 1.2px;
  font-family: 'Segoe UI', 'PingFang SC', Arial, sans-serif;
}
.bank-layout.dark-mode .ai-title {
  color: #79a7fa;
}
.ai-hello {
  color: #789;
  font-size: 1.14rem;
  margin-bottom: 15px;
  text-align: center;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-weight: 500;
  letter-spacing: 0.2px;
}
.bank-layout.dark-mode .ai-hello {
  color: #b9c8e6;
}
/* 聊天区域最大高度，固定空间，内容多时滚动，不会挤出按钮 */
.ai-dialog {
  width: 100%;
  min-height: 80px;
  max-height: 220px;
  flex: 0 0 220px;
  overflow-y: auto;
  margin-bottom: 18px;
  background: #f7fafd;
  border-radius: 18px;
  padding: 16px 14px 12px 14px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 11px;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 1.07rem;
  scrollbar-width: thin;
  scrollbar-color: #aac8fc #f7fafd;
}
.bank-layout.dark-mode .ai-dialog {
  background: #232a3c;
  scrollbar-color: #33415a #232a3c;
}
.ai-msg {
  width: 100%;
  display: flex;
}
.ai-msg-content {
  display: inline-flex;
  align-items: center;
  max-width: 90%;
  word-break: break-all;
  padding: 8px 17px;
  border-radius: 16px;
  font-size: 1.09rem;
  font-family: 'Segoe UI', Arial, sans-serif;
  box-shadow: 0 1px 6px rgba(25,118,210,0.06);
}
.ai-msg.user {
  justify-content: flex-end;
}
.ai-msg.user .ai-msg-content {
  background: linear-gradient(90deg,#e3f2fd 70%,#cbe7fb 100%);
  color: #1976d2;
  border-bottom-right-radius: 5px;
  margin-left: 10%;
  margin-right: 0;
  font-size: 1.11rem;
  font-weight: 600;
}
.bank-layout.dark-mode .ai-msg.user .ai-msg-content {
  background: linear-gradient(90deg,#395180 80%,#233159 100%);
  color: #7fc4ff;
}
.ai-msg.ai {
  justify-content: flex-start;
}
.ai-msg.ai .ai-msg-content {
  background: #ffffff;
  color: #384055;
  border-bottom-left-radius: 5px;
  margin-right: 10%;
  margin-left: 0;
  font-size: 1.09rem;
  font-weight: 500;
}
.bank-layout.dark-mode .ai-msg.ai .ai-msg-content {
  background: #313c5a;
  color: #e3e7f6;
}
.ai-avatar-mini {
  width: 17px;
  height: 17px;
  border-radius: 5px;
  margin-right: 7px;
  background: #e3ebfc;
  object-fit: cover;
  box-shadow: 0 0 2px #1976d2;
}
.ai-chat-row-centered {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  margin-bottom: 0;
}
.ai-input {
  width: 100%;
  font-size: 1.09rem;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.ai-btn-row {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  gap: 0px;
  margin-top: 18px;
}
.send-btn, .clear-btn {
  min-width: 96px;
  font-size: 1.16rem;
  font-family: 'Segoe UI', Arial, sans-serif;
  border-radius: 21px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 42px;
  font-weight: 600;
  text-align: center;
  padding: 0 !important;
  box-sizing: border-box;
}
.btn-content {
  flex: 1 1 0%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  font-size: 1.16rem;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-weight: 600;
  letter-spacing: 1.1px;
  text-align: center;
  padding: 0;
}
.send-btn {
  background: linear-gradient(90deg,#1976d2 60%,#53a6e7 100%);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(25,118,210,0.06);
  transition: background 0.18s;
}
.send-btn:hover {
  background: linear-gradient(90deg,#409EFF 70%,#53b6f7 100%);
}
.clear-btn {
  background: #f7fafd;
  color: #1976d2;
  border: 1px solid #cbe7fb;
  box-shadow: none;
}
.clear-btn:hover {
  background: #e9f4fe;
  color: #1976d2;
  border-color: #aac8fc;
}
/* 夜间输入框 */
.dark-input .el-input__wrapper {
  background: #232a3c !important;
  color: #e2e7f6 !important;
  border: 1px solid #3c4c6e;
}
.dark-input .el-input__inner {
  background: transparent !important;
  color: #e2e7f6 !important;
}
.voice-btn {
  margin-left: 2px;
  vertical-align: middle;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.icon-mic {
  color: #1976d2;
  opacity: 0.7;
  transition: color 0.18s;
}
.voice-btn:hover .icon-mic {
  color: #409EFF;
  opacity: 1;
}
.dark-mic {
  color: #79a7fa;
}
::-webkit-scrollbar {
  width: 8px;
  background: #f6faff;
}
::-webkit-scrollbar-thumb {
  background: #cbe7fb;
  border-radius: 8px;
}
.bank-layout.dark-mode ::-webkit-scrollbar {
  background: #232a3c;
}
.bank-layout.dark-mode ::-webkit-scrollbar-thumb {
  background: #33415a;
}
@media (max-width: 900px) {
  .ai-main-scroll { padding: 8px 0;}
  .ai-card {
    min-width: 98vw;
    max-width: 99vw;
    padding: 18px 2vw 16px 2vw;
    height: 98vw;
    min-height: 400px;
    max-height: 98vw;
  }
  .username-full {
    max-width: 100px;
  }
}

.face-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 0 0;
}
.face-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 14px;
  letter-spacing: 1px;
  text-align: center;
  width: 100%;
}
.face-preview {
  margin-bottom: 16px;
}
.face-video {
  border-radius: 10px;
  border: 2px solid #e3f2fd;
  background: #222;
}
.face-btn-row {
  display: flex;
  gap: 24px;
  margin-bottom: 10px;
}
.face-error {
  color: #ef5350;
  font-size: 1.07rem;
  margin-top: 7px;
  font-weight: 600;
}
</style>
