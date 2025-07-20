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

    <!-- 侧边栏 -->
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
        <el-menu-item index="wealth-products">
          <el-icon><Money /></el-icon>
          <span v-if="navHover" class="sidenav-label">理财产品</span>
        </el-menu-item>
        <el-menu-item index="wealth-positions">
          <el-icon><Notebook /></el-icon>
          <span v-if="navHover" class="sidenav-label">我的持仓</span>
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
      <div class="home-main-content">
        <!-- 快捷操作 -->
        <el-card class="home-action-card" shadow="hover">
          <div class="action-title">
            <el-icon><Cpu /></el-icon>
            <span class="action-title-text">快捷操作</span>
          </div>
          <div class="action-btn-row">
            <el-button type="primary" @click="openFaceDialogWithRoute('/deposit')">
              <el-icon><WalletFilled /></el-icon>
              存取款
            </el-button>
            <el-button type="primary" @click="router.push('/wealth/products')">
              <el-icon><Money /></el-icon>
              理财
            </el-button>
            <el-button type="primary" @click="router.push('/account')">
              <el-icon><CreditCard /></el-icon>
              账户管理
            </el-button>
            <el-button type="primary" @click="openFaceDialogWithRoute('/loss')">
              <el-icon><WarningFilled /></el-icon>
              挂失
            </el-button>
          </div>
        </el-card>

        <!-- 最近收支 -->
        <el-card class="home-trans-card" shadow="hover">
          <div class="trans-title">
            <el-icon><Money /></el-icon>
            <span class="trans-title-text">最近收支</span>
          </div>
          <div class="trans-scroll-wrap">
            <el-table
                :data="recentTrans"
                border
                fit
                style="width:100%"
                size="small"
                height="210"
                header-row-class-name="trans-table-header"
                row-class-name="trans-table-row"
            >
              <el-table-column prop="date" label="日期" width="110"/>
              <el-table-column prop="type" label="类型" width="82"/>
              <el-table-column prop="desc" label="摘要" min-width="100"/>
              <el-table-column prop="amount" label="金额" width="110"/>
            </el-table>
          </div>
        </el-card>

        <!-- 通知公告 -->
        <el-card class="home-notice-card" shadow="hover">
          <div class="notice-title">
            <el-icon><BellFilled /></el-icon>
            <span class="notice-title-text">通知公告</span>
          </div>
          <ul class="notice-list">
            <li v-for="(item, idx) in noticeList" :key="item.id" @click="goToNotice(item)">
              <span class="notice-item-title" :title="item.title">{{ item.title }}</span>
              <span class="notice-item-date">{{ formatDate(item.createdAt) }}</span>
              <el-icon class="notice-link-icon"><ArrowRight /></el-icon>
            </li>
          </ul>
        </el-card>

        <!-- AI助手亮点区块 -->
        <el-card class="home-ai-card" shadow="always">
          <div class="ai-helper-header">
            <img class="ai-helper-avatar" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/Robot/3D/robot_3d.png" />
            <div class="ai-helper-title-block">
              <div class="ai-helper-title">AI智能助手</div>
              <div class="ai-helper-desc">试试问我：<span class="ai-helper-tip">“分析本月收支”</span> 或 <span class="ai-helper-tip">“理财推荐”</span></div>
            </div>
          </div>
          <div class="ai-helper-chat-row">
            <el-input
                placeholder="请输入您的金融问题，如‘分析本月收支’"
                size="large"
                class="ai-helper-input"
                @keyup.enter="goToAIFullPage"
                clearable
            />
            <el-button type="primary" @click="goToAIFullPage" size="large">发送</el-button>
          </div>
          <div class="ai-helper-more" @click="goToAIFullPage">
            <el-icon><Cpu /></el-icon>
            体验AI智能理财 &gt;
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
import { UserFilled, CreditCard, WarningFilled, BellFilled, WalletFilled, Cpu, Money, Notebook, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const username = ref('用户')
const avatarUrl = ref('https://api.dicebear.com/7.x/identicon/svg?seed=bankuser')
const navHover = ref(false)
const activeMenu = ref('home')
const isDark = ref(false)

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
  } else if (index === 'notice'){
    router.push('/notifications')
  } else if (index === 'wealth-products') {
    router.push('/wealth/products')
  } else if (index === 'wealth-positions') {
    router.push('/wealth/positions')
  } else if (index === 'ai') {
    router.push('/ai')
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

function openFaceDialogWithRoute(route) {
  faceNextRoute.value = route
  openFaceDialog()
}

function scrollToBottom() {}

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

// 交易/公告/AI助手数据
const recentTrans = ref([])

function simplifyDesc(desc, type) {
  if (!desc) return type
  return desc.length > 10 ? desc.slice(0, 10) + '…' : desc
}

onMounted(async () => {
  try {
    // 获取最近收支
    const transRes = await axios.get('/api/account/transactions')
    recentTrans.value = (transRes.data || [])
        .filter(item => typeof item.amount === 'number')
        .sort((a, b) => new Date(b.transactionTime) - new Date(a.transactionTime))
        .slice(0, 5)
        .map(item => ({
          // 按 el-table 需要的字段格式
          date: formatDate(item.transactionTime),
          type: item.amount >= 0 ? '收入' : '支出',
          desc: simplifyDesc(item.description, item.type),
          amount: (item.amount >= 0 ? '+' : '') + Number(item.amount).toFixed(2)
        }))
  } catch (e) {
    recentTrans.value = []
  }
})
const noticeList = ref([])

onMounted(async () => {
  try {
    // 获取所有公告
    const res = await axios.get('/api/notifications')
    // 按 createdAt 降序排列，取最新5条
    noticeList.value = res.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
  } catch (e) {
    noticeList.value = []
  }
})

const goToNotice = (item) => {
  router.push(`/notifications/${item.id}`)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  // 返回 YYYY-MM-DD 格式
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const goToAIFullPage = () => {
  router.push('/ai')
}

onMounted(async () => {
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
  font-size: 1.85rem;
  font-family: 'Segoe UI Semibold', 'PingFang SC', 'Arial', sans-serif;
  font-weight: 800;
  color: #1976d2;
  letter-spacing: 2.8px;
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
  font-weight: 700;
  max-width: 196px;
  min-height: 32px;
  height: 32px;
  line-height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
  font-size: 1.21rem;
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
  font-weight: 700;
  letter-spacing: 1.3px;
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
  font-size: 1.45em;
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

/* 主内容区布局 */
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

.home-main-content {
  margin-left: 80px;
  margin-top: 36px;
  margin-bottom: 36px;
  margin-right: 40px;
  display: grid;
  grid-template-columns: repeat(2, minmax(340px, 1fr));
  grid-template-rows: auto auto auto;
  grid-gap: 32px 32px;
  width: 100%;
  max-width: 1300px;
  min-height: 650px;
}
@media (max-width: 1100px) {
  .home-main-content {
    grid-template-columns: 1fr;
    margin-left: 70px;
    margin-right: 12px;
  }
}
.home-action-card {
  min-width: 320px;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  grid-column: 1;
}
.action-title {
  font-size: 1.20rem;
  color: #1976d2;
  font-weight: 800;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 1.2px;
}
.action-title-text {
  font-family: 'PingFang SC', 'Segoe UI', Arial, sans-serif;
  font-weight: 700;
}
.action-btn-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}
.action-btn-row .el-button {
  min-width: 120px;
  font-size: 1.08rem;
  border-radius: 24px;
  font-weight: 700;
  letter-spacing: 0.6px;
}

/* 最近收支-滚动表 */
.home-trans-card {
  min-width: 320px;
  min-height: 220px;
  grid-row: 2;
  grid-column: 1;
}
.trans-title {
  font-size: 1.18rem;
  color: #1976d2;
  font-weight: 800;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  letter-spacing: 1.2px;
}
.trans-title-text {
  font-family: 'PingFang SC', 'Segoe UI', Arial, sans-serif;
  font-weight: 700;
}
.trans-scroll-wrap {
  max-height: 240px;
  overflow-y: auto;
  border-radius: 12px;
  background: #f7fafd;
  box-shadow: 0 1px 6px rgba(25,118,210,0.04);
}
.trans-table-header {
  font-weight: 700 !important;
  font-size: 1.07rem;
  background: #e3f2fd !important;
}
.trans-table-row {
  font-size: 1.04rem;
}

/* 通知公告 */
.home-notice-card {
  min-width: 320px;
  min-height: 110px;
  grid-row: 1 / span 2;
  grid-column: 2;
}
.notice-title {
  font-size: 1.18rem;
  color: #1976d2;
  font-weight: 800;
  margin-bottom: 9px;
  display: flex;
  align-items: center;
  gap: 7px;
  letter-spacing: 1.2px;
}
.notice-title-text {
  font-family: 'PingFang SC', 'Segoe UI', Arial, sans-serif;
  font-weight: 700;
}
.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.notice-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.11rem;
  color: #384055;
  margin-bottom: 8px;
  background: #f7fafd;
  padding: 10px 12px;
  border-radius: 11px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.16s;
}
.notice-list li:hover {
  background: #e3f2fd;
  color: #1976d2;
}
.notice-item-title {
  flex: 1 1 auto;
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.notice-item-date {
  color: #8ab8e8;
  font-size: 0.99rem;
  margin-left: 18px;
  font-weight: 400;
}
.notice-link-icon {
  margin-left: 10px;
  font-size: 1.23em;
}

.home-ai-card {
  min-width: 320px;
  min-height: 190px;
  grid-column: 1 / span 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: linear-gradient(90deg, #e3f2fd 80%, #cbe7fb 100%);
  border: 2px solid #ddeaff;
  border-radius: 30px;
  margin-top: 4px;
  box-shadow: 0 6px 24px 0 rgba(25, 50, 110, 0.11);
  margin-bottom: 16px;
}
.bank-layout.dark-mode .home-ai-card {
  background: linear-gradient(90deg, #2c3a54 70%, #223159 100%);
  border: 2px solid #3c4c6e;
}
.ai-helper-header {
  display: flex;
  align-items: center;
  gap: 22px;
  margin: 14px 0 10px 0;
}
.ai-helper-avatar {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  background: #e3ebfc;
  box-shadow: 0 2px 12px rgba(25,118,210,0.09);
  object-fit: cover;
}
.ai-helper-title-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.ai-helper-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: #1976d2;
  letter-spacing: 1.2px;
}
.bank-layout.dark-mode .ai-helper-title {
  color: #7bb4fa;
}
.ai-helper-desc {
  font-size: 1.09rem;
  color: #447;
  margin-top: 2px;
  font-weight: 600;
  letter-spacing: 0.2px;
  word-break: break-all;
}
.ai-helper-tip {
  color: #1e88e5;
  font-weight: 600;
}
.ai-helper-chat-row {
  display: flex;
  gap: 13px;
  width: 100%;
  margin: 14px 0 2px 0;
  align-items: center;
}
.ai-helper-input {
  flex: 1;
  font-size: 1.11rem;
}
.ai-helper-output {
  margin-top: 8px;
  color: #1858b9;
  background: #f4faff;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 24px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.bank-layout.dark-mode .ai-helper-output {
  background: #313c5a;
  color: #e3e7f6;
}
.ai-helper-more {
  margin-top: 12px;
  color: #1976d2;
  font-weight: 700;
  cursor: pointer;
  font-size: 1.13rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.18s;
}
.ai-helper-more:hover {
  color: #409EFF;
}
.bank-layout.dark-mode .ai-helper-more {
  color: #7bb4fa;
}

.face-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  width: 100%;
  min-height: 340px;
  box-sizing: border-box;
}
.face-title {
  width: 100%;
  text-align: center;
  font-size: 1.16rem;
  font-weight: 600;
  margin-bottom: 20px;
}
.face-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 24px;
}
.face-video {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(25,118,210,0.12);
  margin-bottom: 0;
  display: block;
}
.face-btn-row {
  display: flex;
  flex-direction: row;
  justify-content: center; /* 水平居中按钮 */
  align-items: center;
  gap: 24px; /* 按钮间距 */
  width: 100%;
  margin: 22px 0 10px 0;
}
.face-error {
  color: #d32f2f;
  text-align: center;
  margin-top: 12px;
  font-size: 1.04rem;
  font-weight: 500;
  width: 100%;
}
</style>