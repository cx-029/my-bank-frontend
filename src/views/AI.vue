<template>
  <div class="ai-main-layout" :class="{ 'dark-mode': isDark }">
    <!-- 侧边栏 -->
    <aside class="ai-sidebar">
      <div class="sidebar-header">
        <img
            class="sidebar-logo"
            :src="logoUrl"
            alt="AI助手LOGO"
        />
        <div class="sidebar-bank-title">智慧银行<br><span>AI助手</span></div>
      </div>
      <!-- 左侧四个功能按钮 -->
      <nav class="sidebar-nav">
        <ul>
          <li :class="{active: activeTab==='chat'}" @click="activeTab='chat'">
            <el-icon><ChatLineSquare /></el-icon>
            <span>智能对话</span>
          </li>
          <li :class="{active: activeTab==='wealth'}" @click="activeTab='wealth'">
            <el-icon><PieChart /></el-icon>
            <span>财富分析</span>
          </li>
          <li :class="{active: activeTab==='recommendation'}" @click="activeTab='recommendation'">
            <el-icon><PieChart /></el-icon>
            <span>理财推荐</span>
          </li>
          <li :class="{active: activeTab==='personal'}" @click="activeTab='personal'">
            <el-icon><Flag /></el-icon>
            <span>个性建议</span>
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer-row">
        <img class="sidebar-footer-avatar" :src="user.photoUrl" alt="user avatar" />
        <span class="sidebar-footer-text">尊敬的{{ user.name || '客户' }}，您好！</span>
      </div>
      <div class="sidebar-exit">
        <el-button type="primary" class="exit-btn" @click="goHome">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
      </div>
    </aside>
    <!-- 主体内容 -->
    <section
        class="ai-content"
        :class="{ 'full-width': activeTab !== 'chat' }"
    >
      <!-- 智能对话模块 -->
      <el-card
          v-if="activeTab === 'chat'"
          class="ai-card ai-card-border"
          shadow="always"
      >
        <div class="ai-header">
          <img
              class="ai-avatar"
              :src="logoUrl"
              alt="AI助手"
          />
          <div class="ai-title-group">
            <div class="ai-title">AI助手</div>
            <div class="ai-desc">智慧银行 · 您的专属智能金融助理</div>
          </div>
        </div>
        <div class="ai-chat-area">
          <div class="ai-greeting-banner">
            <img class="greeting-img" :src="user.photoUrl" alt="AI Banner" />
            <div>
              <h2 class="banner-title">您好，欢迎来到智慧银行 AI 助手</h2>
              <p class="banner-desc">
                24h为您提供智能咨询、理财建议与账户管理服务。<br />
                试试输入：
                <span class="banner-example" @click="setExample('分析本月收支')"
                >分析本月收支</span
                >
              </p>
            </div>
          </div>
          <div class="ai-dialog">
            <div
                v-for="(msg, idx) in chatList"
                :key="idx"
                :class="['ai-msg', msg.role]"
            >
              <template v-if="msg.role === 'user'">
                <div class="ai-msg-content user">
                  <img
                      class="user-avatar-mini"
                      :src="user.photoUrl"
                      alt="user"
                  />
                  {{ msg.text }}
                </div>
              </template>
              <template v-else>
                <div class="ai-msg-content ai">
                  <img class="ai-avatar-mini" :src="logoUrl" alt="ai" />
                  <span>{{ msg.text }}</span>
                </div>
              </template>
            </div>
            <div v-if="loading" class="ai-msg ai">
              <div class="ai-msg-content ai">
                <img class="ai-avatar-mini" :src="logoUrl" alt="ai" />
                <span>
                  <el-icon class="loading-spin"><Loading /></el-icon>
                  AI助手正在思考...
                </span>
              </div>
            </div>
          </div>
          <div class="ai-chat-row-centered">
            <el-input
                v-model="aiInput"
                placeholder="请输入您的金融问题，如“分析本月收支”"
                class="ai-input"
                @keyup.enter="sendAIMessage"
                clearable
                ref="aiInputRef"
                :disabled="loading"
                :class="{ 'dark-input': isDark }"
                autofocus
            />
            <div class="ai-btn-row">
              <el-button
                  type="primary"
                  @click="sendAIMessage"
                  class="send-btn"
                  :loading="loading"
                  :disabled="loading"
              >
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
              <el-button
                  size="default"
                  @click="clearChat"
                  class="clear-btn"
                  :disabled="loading"
              >
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
      <!-- 其他模块 -->
      <div v-else>
        <WealthAnalysis v-if="activeTab === 'wealth'" />
        <FinancialRecommendation v-if="activeTab === 'recommendation'" />
        <PersonalRecommendation v-if="activeTab === 'personal'" />
      </div>
    </section>
  </div>
</template>

<script setup>
// 引入必要的组件和功能
import PersonalRecommendation from "@/views/PersonalRecommendation.vue";
import FinancialRecommendation from "@/views/FinancialRecommendation.vue";
import WealthAnalysis from "@/views/WealthAnalysis.vue";
import { ref, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from "axios";
import { getProfile } from "@/api/profile";
import {
  ChatLineSquare,
  PieChart,
  Flag,
  Warning,
  House,
  Loading,
  Promotion,
  Delete,
} from "@element-plus/icons-vue";

// 状态变量
const isDark = ref(false);
const activeTab = ref("chat");
const aiInput = ref("");
const aiInputRef = ref(null);
const loading = ref(false);
const chatList = ref([
  { role: "ai", text: "您好，我是AI助手，有什么可以帮您？" },
]);
const router = useRouter();

// 默认AI头像
const logoUrl = ref(
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/Robot/3D/robot_3d.png"
);

// 当前登录用户信息
const user = ref({
  name: "",
  photoUrl: "",
});

onMounted(async () => {
  try {
    const { data } = await getProfile();
    user.value = data;
    if (!user.value.photoUrl) {
      user.value.photoUrl =
          "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/People/3D/man_3d.png";
    }
  } catch (e) {
    user.value.photoUrl =
        "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/People/3D/man_3d.png";
  }
});

const sendAIMessage = async () => {
  const q = aiInput.value.trim();
  if (!q || loading.value) return;
  chatList.value.push({ role: "user", text: q });
  aiInput.value = "";
  nextTick(() => aiInputRef.value && aiInputRef.value.focus());
  loading.value = true;
  try {
    const resp = await axios.post("/api/ai/chat", { question: q });
    let answer = resp?.data?.answer || "AI智能服务暂不可用，请稍后重试。";
    chatList.value.push({ role: "ai", text: answer });
  } catch (e) {
    chatList.value.push({ role: "ai", text: "AI助手出错了，请稍后再试。"});
    ElMessage.error("AI助手服务异常");
  } finally {
    loading.value = false;
    nextTick(() => aiInputRef.value && aiInputRef.value.focus());
  }
};

function clearChat() {
  chatList.value = [
    { role: "ai", text: "您好，我是AI助手，有什么可以帮您？" },
  ];
  aiInput.value = "";
  nextTick(() => aiInputRef.value && aiInputRef.value.focus());
}

function goHome() {
  router.push({ path: "/home" });
}

function setExample(text) {
  aiInput.value = text;
  nextTick(() => aiInputRef.value && aiInputRef.value.focus());
}
</script>

<style scoped>

.ai-main-layout {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(120deg, #f7fafd 60%, #e6eeff 100%);
  display: flex;
  font-family: 'Inter', 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
  letter-spacing: 0.01em;
}
.ai-main-layout.dark-mode {
  background: linear-gradient(120deg, #232a3c 60%, #151a24 100%);
}

/* 侧边栏 */
.ai-sidebar {
  width: 260px;
  min-width: 210px;
  background: #22304c;
  color: #e3ebfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 18px 0;
  box-shadow: 4px 0 28px -12px rgba(25, 50, 110, 0.13);
  font-family: 'Inter', 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
}
.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 38px 0 24px 0;
}
.sidebar-logo {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: #f6f7fb;
  box-shadow: 0 3px 20px rgba(25,118,210,0.12);
  margin-bottom: 12px;
  object-fit: contain;
  border: 2px solid #9ed3ff;
}
.sidebar-bank-title {
  font-size: 1.38rem;
  font-weight: 700;
  color: #8fc6ff;
  text-align: center;
  line-height: 1.2;
  letter-spacing: 1.1px;
  font-family: 'Inter', 'PingFang SC', 'Arial', sans-serif;
}
.sidebar-bank-title span {
  font-size: 1.01rem;
  color: #fff;
  font-weight: 400;
}
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}
.sidebar-nav li {
  width: 100%;
  padding: 14px 0 14px 38px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1.13rem;
  color: #b4d6f8;
  transition: background 0.16s, color 0.16s;
  margin-bottom: 2px;
  font-family: 'Inter', 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
  border-radius: 0 24px 24px 0;
  position: relative;
}
.sidebar-nav li.active {
  background: linear-gradient(90deg, #1976d2 0%, #53a6e7 100%);
  color: #fff;
  font-weight: 700;
}
.sidebar-nav li.active:before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 4px;
  height: 30px;
  background: #fff;
  border-radius: 3px;
}
.sidebar-nav li:hover:not(.active) {
  background: linear-gradient(90deg, #4b74e0 35%, #3671c6 100%);
  color: #fff;
}
.sidebar-nav li .el-icon {
  margin-right: 14px;
  font-size: 1.18rem;
}
.sidebar-footer-row {
  width: 86%;
  margin: 24px auto 0 auto;
  padding: 12px 0 0 0;
  display: flex;
  align-items: center;
  gap: 14px;
  border-top: 1.5px solid #37507a;
  border-bottom: none;
  justify-content: flex-start;
}
.sidebar-footer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #b4d6f8;
  background: #fff;
  box-shadow: 0 1px 4px #d0e6f7;
}
.sidebar-footer-text {
  color: #b7d6ff;
  font-size: 1.05rem;
  font-weight: 500;
  font-family: 'Inter', 'PingFang SC', 'Arial', sans-serif;
  letter-spacing: 0.03em;
}
.sidebar-exit {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.exit-btn {
  width: 85%;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(90deg, #e0e7ef 60%, #c2cbe1 100%);
  color: #406080;
  border: none;
  font-weight: 600;
  font-size: 1.08rem;
  letter-spacing: 0.05em;
  box-shadow: 0 1px 4px rgba(80,120,200,0.13);
  transition: background .15s;
}
.exit-btn:hover {
  background: linear-gradient(90deg, #b6c6e7 60%, #94a6c2 100%);
  color: #22304c;
}

/* 主体内容 */
.ai-content {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: none;
}

/* 卡片内部样式 */
.ai-card {
  border-radius: 36px;
  min-width: 420px;
  max-width: 600px;
  width: 98vw;
  min-height: 700px;
  max-height: 97vh;
  padding: 40px 32px 28px 32px;
  box-shadow: 0 20px 60px 0 rgba(25, 50, 110, 0.13);
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: 'Inter', 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
}
.ai-card-border {
  border: 2px solid #ddeaff;
}
.ai-header {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 18px;
}
.ai-avatar {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #e3ebfc;
  box-shadow: 0 2px 12px rgba(25,118,210,0.08);
  object-fit: cover;
}
.ai-title-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.ai-title {
  font-size: 1.58rem;
  font-weight: 800;
  color: #1976d2;
  letter-spacing: 1.1px;
  font-family: 'Inter', 'PingFang SC', 'Arial', sans-serif;
}
.ai-desc {
  font-size: 1.13rem;
  color: #447;
  margin-top: 2px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.ai-greeting-banner {
  display: flex;
  align-items: center;
  background: linear-gradient(90deg,#e3ebfc 70%,#f7fafd 100%);
  border-radius: 20px;
  margin-bottom: 12px;
  padding: 18px 24px 18px 4px;
  box-shadow: 0 2px 16px 0 rgba(80,120,200,0.06);
  gap: 22px;
  min-height: 90px;
}
.greeting-img {
  width: 82px;
  height: 82px;
  object-fit: cover;
  border-radius: 16px;
  border: 2px solid #d3e4fa;
  background: #fff;
}
.banner-title {
  font-size: 1.25rem;
  font-family: 'Inter', 'PingFang SC', 'Arial', sans-serif;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 2px;
}
.banner-desc {
  font-size: 1.09rem;
  color: #406080;
  font-weight: 500;
}
.banner-example {
  color: #1e88e5;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
  text-decoration: underline;
  transition: color 0.14s;
}
.banner-example:hover {
  color: #409EFF;
}

.ai-chat-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.ai-dialog {
  width: 100%;
  min-height: 120px;
  max-height: 320px;
  flex: 0 0 320px;
  overflow-y: auto;
  margin-bottom: 18px;
  background: #f7fafd;
  border-radius: 18px;
  padding: 16px 14px 12px 14px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 13px;
  font-size: 1.07rem;
  scrollbar-width: thin;
  scrollbar-color: #aac8fc #f7fafd;
}
.ai-msg {
  width: 100%;
  display: flex;
}
.ai-msg-content {
  display: inline-flex;
  align-items: center;
  max-width: 92%;
  word-break: break-all;
  padding: 8px 17px;
  border-radius: 16px;
  font-size: 1.13rem;
  box-shadow: 0 1px 6px rgba(25,118,210,0.06);
  font-family: 'Inter', 'PingFang SC', 'Arial', sans-serif;
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
  font-size: 1.14rem;
  font-weight: 600;
}
.user-avatar-mini {
  width: 22px;
  height: 22px;
  margin-right: 7px;
  border-radius: 5px;
  object-fit: cover;
  background: #e3ebfc;
  box-shadow: 0 0 2px #1976d2;
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
  font-size: 1.13rem;
  font-weight: 500;
}
.ai-avatar-mini {
  width: 22px;
  height: 22px;
  margin-right: 7px;
  border-radius: 5px;
  background: #e3ebfc;
  object-fit: cover;
  box-shadow: 0 0 2px #1976d2;
}
.loading-spin {
  margin-right: 8px;
  color: #1976d2;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg);}
}

.ai-chat-row-centered {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  margin-bottom: 0;
}
.ai-input {
  width: 100%;
  font-size: 1.13rem;
  border-radius: 18px;
  font-family: 'Inter', 'PingFang SC', 'Arial', sans-serif;
}
.ai-btn-row {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  gap: 0px;
  margin-top: 18px;
}
.send-btn, .clear-btn {
  min-width: 112px;
  font-size: 1.13rem;
  border-radius: 21px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 44px;
  font-weight: 600;
  text-align: center;
  padding: 0 !important;
  box-sizing: border-box;
}
.send-btn {
  background: linear-gradient(90deg,#1976d2 60%,#53a6e7 100%);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(25,118,210,0.09);
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

.dark-input .el-input__wrapper {
  background: #232a3c !important;
  color: #e2e7f6 !important;
  border: 1px solid #3c4c6e;
}
.dark-input .el-input__inner {
  background: transparent !important;
  color: #e2e7f6 !important;
}

.ai-tab-placeholder {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 动效 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .ai-main-layout {
    flex-direction: column;
  }
  .ai-sidebar {
    width: 100vw;
    min-width: 0;
    flex-direction: row;
    padding: 0;
    height: auto;
    box-shadow: none;
    border-bottom: 2px solid #ddeaff;
  }
  .sidebar-header {
    margin: 18px 0 8px 0;
  }
  .sidebar-bank-title { font-size: 1.07rem;}
  .sidebar-nav ul {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .sidebar-nav li {
    width: auto;
    padding: 10px 18px;
    font-size: 1.01rem;
    margin-bottom: 0;
  }
  .sidebar-footer-row {
    width: 98%;
    padding: 10px 0 0 0;
    margin: 12px auto 0 auto;
    border-top: 1px solid #37507a;
  }
  .sidebar-footer-avatar {
    width: 28px;
    height: 28px;
  }
  .sidebar-footer-text {
    font-size: 0.98rem;
  }
  .sidebar-footer {
    display: none;
  }
  .sidebar-exit {
    margin-top: 0;
    margin-bottom: 10px;
    width: 30vw;
    min-width: 120px;
  }
  .ai-content {
    min-height: unset;
    padding: 0 0 24px 0;
  }
  .ai-card {
    min-width: 99vw;
    max-width: 99vw;
    padding: 12px 1vw 12px 1vw;
  }
}
</style>