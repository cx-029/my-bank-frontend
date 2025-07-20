<template>
  <div class="ai-layout" :class="{'dark-mode': isDark}">
    <el-card class="ai-card ai-card-border" shadow="always">
      <div class="ai-header">
        <img
            class="ai-avatar"
            src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/Robot/3D/robot_3d.png"
            alt="AI助手"
        />
        <div class="ai-title-group">
          <div class="ai-title">AI助手</div>
          <div class="ai-desc">智慧银行 · 您的专属智能金融助理</div>
        </div>
      </div>
      <el-tabs v-model="activeTab" class="ai-tabs" stretch>
        <el-tab-pane label="智能对话" name="chat">
          <div class="ai-chat-area">
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
                  placeholder="请输入您的问题，如“帮我分析一下本月收支”"
                  class="ai-input"
                  @keyup.enter="sendAIMessage"
                  clearable
                  ref="aiInputRef"
                  :class="{'dark-input': isDark}"
              >
                <template #suffix>
                  <span class="voice-btn" title="语音输入（开发中）">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
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
                >发送</el-button>
                <el-button
                    size="default"
                    @click="aiInput=''"
                    class="clear-btn"
                >清空</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="财富分析" name="wealth">
          <div class="ai-tab-placeholder">
            <el-empty description="敬请期待 · 智能收支分析、理财建议、资产分布等"/>
          </div>
        </el-tab-pane>

        <el-tab-pane label="目标管理" name="goal">
          <div class="ai-tab-placeholder">
            <el-empty description="敬请期待 · 目标设定、储蓄追踪、AI路径分解等"/>
          </div>
        </el-tab-pane>

        <el-tab-pane label="风险安全" name="risk">
          <div class="ai-tab-placeholder">
            <el-empty description="敬请期待 · 异常检测、风险提示、智能解释等"/>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const isDark = ref(false) // 可用inject等方式统一管理主题
const activeTab = ref('chat')
const aiInput = ref('')
const aiInputRef = ref(null)
const chatList = ref([
  { role: 'ai', text: '您好，我是AI助手，有什么可以帮您？' }
])

const sendAIMessage = () => {
  const q = aiInput.value.trim()
  if (!q) return
  chatList.value.push({ role: 'user', text: q })
  aiInput.value = ''
  nextTick(() => {
    aiInputRef.value && aiInputRef.value.focus()
  })
  // 模拟AI回复
  setTimeout(() => {
    chatList.value.push({ role: 'ai', text: 'AI智能服务即将上线，敬请期待。' })
  }, 800)
}
</script>

<style scoped>
.ai-layout {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(120deg, #f8fafc 60%, #e6eeff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', 'PingFang SC', 'Arial', sans-serif;
}
.ai-layout.dark-mode {
  background: linear-gradient(120deg, #232a3c 60%, #151a24 100%);
}
.ai-card {
  border-radius: 36px;
  min-width: 420px;
  max-width: 520px;
  width: 96vw;
  min-height: 610px;
  max-height: 96vh;
  padding: 38px 32px 28px 32px;
  box-shadow: 0 20px 60px 0 rgba(25, 50, 110, 0.13);
  display: flex;
  flex-direction: column;
}
.ai-card-border {
  border: 2px solid #ddeaff;
}
.ai-layout.dark-mode .ai-card {
  background: #262f44;
  color: #e2e7f6;
  border: 2px solid #3c4c6e;
  box-shadow: 0 20px 60px 0 rgba(80, 120, 200, 0.12);
}
.ai-header {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 18px;
}
.ai-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
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
  font-size: 1.45rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.1px;
}
.ai-layout.dark-mode .ai-title {
  color: #7bb4fa;
}
.ai-desc {
  font-size: 1.07rem;
  color: #447;
  margin-top: 2px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.ai-layout.dark-mode .ai-desc {
  color: #b7d6ff;
}
.ai-tabs {
  margin-top: 10px;
}
.ai-chat-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.ai-dialog {
  width: 100%;
  min-height: 90px;
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
  font-size: 1.07rem;
  scrollbar-width: thin;
  scrollbar-color: #aac8fc #f7fafd;
}
.ai-layout.dark-mode .ai-dialog {
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
  max-width: 92%;
  word-break: break-all;
  padding: 8px 17px;
  border-radius: 16px;
  font-size: 1.09rem;
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
.ai-layout.dark-mode .ai-msg.user .ai-msg-content {
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
.ai-layout.dark-mode .ai-msg.ai .ai-msg-content {
  background: #313c5a;
  color: #e3e7f6;
}
.ai-avatar-mini {
  width: 17px;
  height: 17px;
  margin-right: 7px;
  border-radius: 5px;
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
@media (max-width: 700px) {
  .ai-card { min-width: 99vw; max-width: 99vw; padding: 12px 1vw 12px 1vw; }
  .ai-tabs { margin-top: 2px;}
}
.ai-tab-placeholder {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>