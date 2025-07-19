<template>
  <div class="bank-layout" :class="{ 'dark-mode': isDark }">
    <!-- 顶部栏 仿照Home.vue设计 -->
    <header class="bank-header admin-header">
      <div class="bank-title main-bank-title">
        <svg width="34" height="34" viewBox="0 0 62 62" fill="none">
          <defs>
            <linearGradient id="bankGrad" x1="0" y1="0" x2="62" y2="62" gradientUnits="userSpaceOnUse">
              <stop stop-color="#1976d2"/>
              <stop offset="1" stop-color="#53a6e7"/>
            </linearGradient>
          </defs>
          <path d="M31 7C25 14 13 16 13 16v12c0 18 14 24 18 25 4-1 18-7 18-25V16s-12-2-18-9z" fill="url(#bankGrad)" />
          <circle cx="31" cy="29" r="9.5" fill="#fff" stroke="#1976d2" stroke-width="2"/>
          <path d="M31 22v14M25.5 29h11" stroke="#1976d2" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="bank-system-name">智慧银行系统</span>
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
            <el-avatar :size="28" :src="adminAvatar" style="border: 2px solid #1976d2;" />
            <span class="username-full admin-username" :title="adminName">{{ adminName }}</span>
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
    <div class="bank-body">
      <!-- 侧边栏 左侧统一黑色字体 -->
      <aside
          class="bank-sidenav admin-sidenav"
          :class="{ 'collapsed': collapsed, 'dark-mode': isDark }"
          @mouseenter="collapsed = false"
          @mouseleave="collapsed = true"
      >
        <div class="sidenav-spacer"></div>
        <el-menu
            :default-active="activeMenu"
            class="bank-menu"
            :collapse="collapsed"
            background-color="transparent"
            text-color="#222"
            active-text-color="#222"
            @select="handleMenuSelect"
            collapse-transition
        >
          <el-menu-item index="profile">
            <el-icon><UserFilled /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">个人中心</span>
          </el-menu-item>
          <el-menu-item index="account">
            <el-icon><CreditCard /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">账户管理</span>
          </el-menu-item>
          <el-menu-item index="customer">
            <el-icon><User /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">客户管理</span>
          </el-menu-item>
          <el-menu-item index="admin-wealth-products">
            <el-icon><Money /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">理财产品</span>
          </el-menu-item>
          <el-menu-item index="deposit">
            <el-icon><WalletFilled /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">存取管理</span>
          </el-menu-item>
          <el-menu-item index="loss">
            <el-icon><WarningFilled /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">挂失管理</span>
          </el-menu-item>
          <el-menu-item index="notice">
            <el-icon><BellFilled /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">通知中心</span>
          </el-menu-item>
          <el-menu-item index="comment">
            <el-icon><ChatDotSquare /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">评论管理</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span v-if="!collapsed" class="sidenav-label">系统设置</span>
          </el-menu-item>
        </el-menu>
      </aside>
      <!-- 主内容区 -->
      <main class="bank-main admin-main">
        <el-card class="admin-card professional-card" shadow="always">
          <div class="admin-center professional-center">
            <!-- 欢迎区 -->
            <div class="welcome-row professional-welcome">
              <div class="welcome-left">
                <img
                    class="admin-avatar"
                    :src="adminAvatar"
                    alt="管理员"
                />
                <div class="welcome-text">
                  <div class="welcome-title">欢迎回来，{{ adminName }}！</div>
                  <div class="welcome-role-tag">管理员账户</div>
                </div>
              </div>
              <div class="welcome-summary">
                <div class="summary-title">后台总览</div>
                <div class="summary-items summary-items-center">
                  <div class="summary-item">
                    <span class="summary-num">{{ customerCount }}</span>
                    <span>客户</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-num">{{pendingLossCount}}</span>
                    <span>待处理挂失</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 功能按钮区 -->
            <div class="admin-actions-grid professional-actions-grid">
              <el-button type="primary" @click="goPage('customer')">客户管理</el-button>
              <el-button type="warning" @click="goPage('account')">账户管理</el-button>
              <el-button type="success" @click="goPage('deposit')">存取管理</el-button>
              <el-button type="danger" @click="goPage('loss')">挂失管理</el-button>
              <el-button type="info" @click="goPage('notice')">通知中心</el-button>
              <el-button type="default" @click="goPage('settings')">系统设置</el-button>
            </div>
            <!-- 公告区 -->
            <div class="admin-announcement professional-announcement">
              <el-alert
                  type="info"
                  show-icon
                  title="银行公告"
                  description="请妥善保管管理员账户，勿随意外泄。操作涉及客户信息时务必核查权限。"
                  :closable="false"
                  style="margin-top:25px;"
              />
              <div class="announcement-tips">
                <span class="tips-title">温馨提示：</span>
                <ul>
                  <li>所有操作均会记录日志。</li>
                  <li>如遇系统异常，请及时联系技术部。</li>
                  <li>请遵守数据安全和隐私保护政策。</li>
                </ul>
              </div>
            </div>
          </div>
        </el-card>
      </main>
    </div>
  </div>
</template>

<!-- 仅修改 goPage 方法和侧边栏菜单，添加客户管理入口 -->
<script setup>
import { Money } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, CreditCard, WarningFilled, BellFilled, WalletFilled, Setting, User, ChatDotSquare } from '@element-plus/icons-vue'
import axios from "axios"

const router = useRouter()
const isDark = ref(false)
const collapsed = ref(true)
const activeMenu = ref('profile')
const adminName = ref('管理员')
const adminAvatar = ref('https://api.dicebear.com/7.x/identicon/svg?seed=admin')
const customerCount = ref(0)
const pendingLossCount = ref(0)

const loadAdminInfo = async () => {
  try {
    const res = await axios.get('/api/admin/profile', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    if (res.data) {
      adminName.value = res.data.username || '管理员'
      adminAvatar.value = res.data.photoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=admin'
    }
  } catch (e) {
    adminName.value = '管理员'
    adminAvatar.value = 'https://api.dicebear.com/7.x/identicon/svg?seed=admin'
  }
}

// 新增：加载统计数据
const loadSummary = async () => {
  try {
    const [customerRes, lossRes] = await Promise.all([
      axios.get('/api/admin/customer/count'),
      axios.get('/api/admin/loss/count')
    ])
    customerCount.value = customerRes.data
    pendingLossCount.value = lossRes.data
  } catch (e) {
    customerCount.value = 0
    pendingLossCount.value = 0
  }
}

onMounted(() => {
  loadAdminInfo()
  loadSummary()
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  delete axios.defaults.headers.common['Authorization']
  ElMessage.success('已退出登录')
  router.push('/login')
}
const goProfile = () => {
  router.push('/admin/profile')
}
const goPage = (index) => {
  switch (index) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'account':
      router.push('/admin/account')
      break
    case 'customer':
      router.push('/admin/customer')
      break
    case 'deposit':
      router.push('/admin/deposit')
      break
    case 'loss':
      router.push('/admin/loss')
      break
    case 'notice':
      router.push('/admin/notifications')
      break
    case 'settings':
      router.push('/admin/settings')
      break
    case 'comment':
      router.push('/admin/notification-comments')
      break
    case 'admin-wealth-products':
      router.push('/admin/wealth-products')
      break
    default:
      ElMessage.info('功能开发中')
  }
}
const handleMenuSelect = (index) => {
  activeMenu.value = index
  goPage(index)
}
</script>

<style scoped>
.bank-layout {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(120deg, #f5f8fa 58%, #e1ecf9 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
  overflow: hidden;
}
.bank-layout.dark-mode {
  background: linear-gradient(120deg, #232a3c 60%, #1a2236 100%);
}
.bank-header.admin-header {
  background: #fff;
  color: #1976d2;
  box-shadow: 0 2px 8px rgba(25,118,210,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 56px 0 0;
  min-height: 72px;
  font-family: 'Segoe UI Semibold', 'PingFang SC', 'Arial', sans-serif;
}
.bank-layout.dark-mode .bank-header.admin-header {
  background: #232a3c;
  color: #cde4ff;
}
.main-bank-title {
  display: flex;
  align-items: center;
  font-size: 1.7rem;
  font-weight: 800;
  color: #1976d2;
  margin-left: 32px;
  letter-spacing: 2px;
}
.bank-layout.dark-mode .main-bank-title {
  color: #7bb4fa;
}
.main-bank-title svg {
  margin-right: 18px;
}
.bank-system-name {
  font-weight: 800;
  font-size: 1.12em;
  color: #1976d2;
  letter-spacing: 2px;
}
.bank-layout.dark-mode .bank-system-name {
  color: #7bb4fa;
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
  max-width: 170px;
  min-height: 32px;
  height: 32px;
  line-height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.12rem;
  color: #222;
}
.bank-layout.dark-mode .username-full {
  color: #cde4ff;
}
.admin-role-tag {
  background: #1976d2;
  color: #fff;
  border-radius: 6px;
  font-size: 0.81em;
  padding: 2px 8px;
  margin-left: 8px;
  font-weight: 500;
  letter-spacing: 1.2px;
  box-shadow: 0 2px 6px rgba(25,118,210,0.09);
}
.bank-user .el-avatar {
  margin-right: 8px;
}
.bank-user .el-button {
  font-size: 1em;
}

/* 三栏结构 */
.bank-body {
  display: flex;
  flex: 1;
  height: calc(100vh - 72px);
  width: 100vw;
  position: relative;
}

/* 侧边栏统一黑色字体 */
.bank-sidenav.admin-sidenav {
  background: #f5f8fa;
  box-shadow: 2px 0 12px rgba(25,118,210,0.08);
  min-width: 56px;
  width: 56px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width 0.2s cubic-bezier(.62,.04,.34,1.02);
}
.bank-sidenav.admin-sidenav.collapsed {
  width: 56px;
}
.bank-sidenav.admin-sidenav:not(.collapsed) {
  width: 170px;
}
.bank-layout.dark-mode .bank-sidenav.admin-sidenav {
  background: #232a3c;
  box-shadow: 2px 0 12px rgba(25,118,210,0.20);
}
.sidenav-spacer {
  height: 72px;
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
  font-size: 1.09rem;
  border-radius: 10px;
  margin: 5px 8px;
  display: flex;
  align-items: center;
  transition: background 0.16s;
  overflow: hidden;
  font-weight: 600;
  justify-content: center;
  border: none;
  letter-spacing: 1.1px;
  color: #222 !important;
}
.sidenav-label {
  font-size: 1.01rem;
  letter-spacing: 0.4px;
  color: #222 !important;
  font-weight: 500;
}
.bank-menu .el-menu-item.is-active,
.bank-menu .el-menu-item:hover {
  background: linear-gradient(90deg, #e3f2fd 70%, #cbe7fb 100%) !important;
  color: #222 !important;
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
  color: #7bb4fa;
}
.bank-sidenav.admin-sidenav:not(.collapsed) .bank-menu .el-menu-item .el-icon {
  margin-right: 13px;
}
.bank-sidenav.admin-sidenav:not(.collapsed) .bank-menu .el-menu-item {
  justify-content: flex-start;
}
.bank-sidenav.admin-sidenav.collapsed .bank-menu .el-menu-item span {
  display: none;
}

/* 主内容区 */
.bank-main.admin-main {
  flex: 1;
  height: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

/* 更复杂专业的卡片和排版 */
.admin-card.professional-card {
  width: 700px;
  max-width: 98vw;
  min-height: 520px;
  border-radius: 26px;
  background: #fff;
  box-shadow: 0 24px 64px 0 rgba(25, 50, 110, 0.15);
  padding: 48px 48px 38px 48px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  font-family: 'Segoe UI', 'PingFang SC', Arial, sans-serif;
}
.bank-layout.dark-mode .admin-card.professional-card {
  background: #232a3c;
  color: #cde4ff;
  box-shadow: 0 24px 64px 0 rgba(120, 170, 250, 0.14);
}
.professional-center {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 430px;
  justify-content: flex-start;
}
.professional-welcome {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  background: linear-gradient(120deg,#e8f1fd 70%,#f7fafd 100%);
  border-radius: 18px;
  padding: 24px 32px;
  box-shadow: 0 2px 10px rgba(25,118,210,0.06);
  position: relative;
}
.bank-layout.dark-mode .professional-welcome {
  background: linear-gradient(120deg,#232a3c 70%,#181d26 100%);
  color: #cde4ff;
}
.welcome-left {
  display: flex;
  align-items: center;
  gap: 18px;
}
.admin-avatar {
  width: 66px;
  height: 66px;
  border-radius: 16px;
  background: #e3f2fd;
  box-shadow: 0 2px 10px rgba(25,118,210,0.09);
  object-fit: cover;
  border: 2px solid #1976d2;
}
.welcome-text {
  display: flex;
  flex-direction: column;
  gap: 7px;
  align-items: flex-start;
}
.welcome-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.4px;
}
.bank-layout.dark-mode .welcome-title {
  color: #7bb4fa;
}
.welcome-role-tag {
  font-size: 1em;
  color: #1976d2;
  margin-top: 2px;
  font-weight: 500;
  letter-spacing: 1px;
}
.bank-layout.dark-mode .welcome-role-tag {
  color: #cde4ff;
}
.welcome-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
}
.summary-title {
  font-size: 1.13rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 2px;
  letter-spacing: 1px;
  text-align: right;
}
.bank-layout.dark-mode .summary-title { color: #7bb4fa; }
.summary-items.summary-items-center {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.summary-item {
  font-size: 1.03rem;
  color: #264062;
  background: #f8fcff;
  border-radius: 8px;
  padding: 7px 18px;
  box-shadow: 0 1px 4px #e3eafc;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: column;
  text-align: center;
  min-width: 90px;
}
.summary-num {
  font-size: 1.15rem;
  color: #1976d2;
  font-weight: 700;
}
.bank-layout.dark-mode .summary-item {
  background: #232a3c;
  color: #cde4ff;
  box-shadow: 0 1px 4px #223159;
}
.bank-layout.dark-mode .summary-num {
  color: #7bb4fa;
}

/* 更专业的按钮区 */
.admin-actions-grid.professional-actions-grid {
  margin-top: 16px;
  margin-bottom: 18px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 28px 48px;
  justify-items: center;
  align-items: center;
}
.admin-actions-grid .el-button {
  width: 100%;
  min-width: 120px;
  max-width: 200px;
  font-size: 1.15rem;
  font-weight: 700;
  border-radius: 18px;
  text-align: center;
  padding: 20px 4px;
  letter-spacing: 1.15px;
  box-shadow: 0 2px 12px rgba(25,118,210,0.09);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.18s, transform 0.18s;
}
.admin-actions-grid .el-button:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(25,118,210,0.14);
}
.admin-actions-grid .el-button span {
  width: 100%;
  text-align: center;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
}
.admin-actions-grid .el-button .el-icon {
  margin-right: 8px;
  font-size: 1.1em;
  vertical-align: middle;
}

@media (max-width: 900px) {
  .admin-card.professional-card { padding: 18px 2vw 16px 2vw; }
  .professional-welcome { flex-direction: column; gap: 16px; padding: 14px 10px; }
  .welcome-summary { align-items: flex-start; margin-top: 8px;}
  .summary-items { gap: 10px; justify-content: flex-start;}
  .admin-avatar { width: 42px; height: 42px;}
  .welcome-title { font-size: 1.13rem; }
  .admin-actions-grid.professional-actions-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(3, 1fr);
    gap: 16px 10px;
  }
  .admin-actions-grid .el-button { min-width: 90px; font-size: 1rem; padding: 13px 2px;}
}

/* 公告区和提示 */
.admin-announcement.professional-announcement {
  width: 100%;
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px solid #e3eafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bank-layout.dark-mode .admin-announcement.professional-announcement {
  border-top: 1px solid #33415a;
}
.announcement-tips {
  margin-top: 8px;
  background: #f8fcff;
  border-radius: 8px;
  padding: 10px 18px;
  color: #264062;
  font-size: 1.01rem;
  box-shadow: 0 1px 8px #e3eafc;
}
.bank-layout.dark-mode .announcement-tips {
  background: #232a3c;
  color: #a7cfff;
  box-shadow: 0 1px 8px #223159;
}
.tips-title {
  font-weight: 700;
  color: #1976d2;
  margin-right: 7px;
}
.bank-layout.dark-mode .tips-title { color: #7bb4fa; }
.announcement-tips ul {
  margin: 0;
  padding-left: 22px;
}
.announcement-tips li {
  line-height: 1.7;
  margin-bottom: 1px;
}

.admin-hello {
  color: #264062;
  font-size: 1.13rem;
  margin-bottom: 12px;
  text-align: center;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-weight: 500;
  letter-spacing: 0.2px;
}
.bank-layout.dark-mode .admin-hello {
  color: #cde4ff;
}

</style>