<template>
  <div class="login-bg">
    <div class="login-gradient"></div>
    <div class="login-overlay"></div>
    <div class="login-main">
      <div class="login-card">
        <div class="bank-logo bank-ui">
          <!-- 银行风格LOGO：盾牌+钱币+蓝色 -->
          <svg width="62" height="62" viewBox="0 0 62 62" fill="none">
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
          <span class="bank-text">智慧银行</span>
        </div>
        <div class="welcome-slogan">
          欢迎使用智慧银行系统，让金融更智慧、更温暖
        </div>
        <el-form :model="form" @submit.prevent="onLogin">
          <el-form-item>
            <el-input v-model="form.username" placeholder="用户名" autocomplete="username">
              <template #prefix>
                <i class="bank-user-icon"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="密码" autocomplete="current-password">
              <template #prefix>
                <i class="bank-lock-icon"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onLogin" style="width:100%;">
              <i class="el-icon-arrow-right" style="margin-right:6px;font-size:1.1em;"></i>登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="or-divider">
          <span class="or-circle">或</span>
        </div>
        <el-button type="success" @click="openFaceDialog" class="face-login-btn" style="width:100%;">
          <i class="el-icon-camera" style="margin-right:8px;"></i>人脸识别登录
        </el-button>
        <div class="register-link-row">
          <span class="no-account-text">还没有账号？</span>
          <el-link type="primary" @click="goRegister" class="register-link">
            <i class="el-icon-plus"></i> 去注册
          </el-link>
        </div>
        <transition name="fade">
          <div v-if="msg" class="login-msg">{{ msg }}</div>
        </transition>
      </div>
    </div>
    <el-dialog
        title="人脸识别登录"
        v-model="faceDialogVisible"
        width="430px"
        :close-on-click-modal="false"
        class="face-dialog-custom"
        append-to-body
        :modal="true"
        :show-close="true"
    >
      <div class="face-dialog-content">
        <div v-if="!faceCaptured">
          <div class="face-video-box">
            <video ref="video" width="340" height="240" autoplay style="border-radius:8px;"/>
          </div>
          <div class="face-btn-row">
            <el-button type="primary" @click="captureFace">拍照</el-button>
            <el-button @click="closeFaceDialog">取消</el-button>
          </div>
        </div>
        <div v-else>
          <div class="face-video-box">
            <img :src="faceImage" alt="face" width="340" height="240" style="border-radius:8px;"/>
          </div>
          <div class="face-btn-row">
            <el-button type="success" @click="submitFaceLogin">提交识别</el-button>
            <el-button @click="resetFace">重拍</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { loginUser, faceLogin } from '@/api/user'
import axios from 'axios'

export default {
  data() {
    return {
      form: { username: '', password: '' },
      msg: '',
      faceDialogVisible: false,
      faceCaptured: false,
      faceImage: '',
      stream: null
    }
  },
  methods: {
    async onLogin() {
      delete axios.defaults.headers.common['Authorization'];
      try {
        const res = await loginUser(this.form)
        if (res.data.token) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('role', res.data.role || '') // 保存角色
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token

          // 分角色跳转
          if (res.data.role === 'admin') {
            this.$router.push('/admin')    // 管理员界面路由
          } else if (res.data.role === 'customer') {
            this.$router.push('/home')     // 普通用户界面路由
          } else {
            this.$router.push('/')         // 兜底
          }
        } else {
          this.msg = res.data.error || '用户名或密码错误'
        }
      } catch (e) {
        if (e.response && e.response.status === 403) {
          this.msg = '无权限，登录失败（403 Forbidden）'
        } else {
          this.msg = '用户名或密码错误'
        }
      }
      setTimeout(() => { this.msg = '' }, 2500)
    },
    goRegister() {
      this.$router.push('/register')
    },
    async openFaceDialog() {
      this.faceDialogVisible = true
      this.faceCaptured = false
      this.faceImage = ''
      this.$nextTick(async () => {
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({ video: true })
          this.$refs.video.srcObject = this.stream
        } catch (err) {
          this.msg = '无法访问摄像头，请检查权限'
          this.faceDialogVisible = false
        }
      })
    },
    closeFaceDialog() {
      this._stopCamera()
      this.faceDialogVisible = false
      this.faceCaptured = false
      this.faceImage = ''
    },
    captureFace() {
      const video = this.$refs.video
      const canvas = document.createElement('canvas')
      canvas.width = 340
      canvas.height = 240
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, 340, 240)
      this.faceImage = canvas.toDataURL('image/png')
      this.faceCaptured = true
      this._stopCamera()
    },
    async resetFace() {
      this.faceCaptured = false
      this.faceImage = ''
      await this.openFaceDialog()
    },
    async submitFaceLogin() {
      try {
        const res = await faceLogin({ image: this.faceImage })
        if (res.data.token) {
          localStorage.setItem('token', res.data.token)
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token
          this.msg = '人脸识别成功，已登录'
          this.faceDialogVisible = false
          // 建议后端也返回role，便于分角色跳转
          this.$router.push('/home')
        } else {
          this.msg = res.data.error || '人脸识别失败'
          this.faceDialogVisible = false
        }
      } catch (e) {
        if (e.response && e.response.status === 403) {
          this.msg = '人脸识别无权限（403 Forbidden）'
        } else {
          this.msg = '人脸识别失败'
        }
        this.faceDialogVisible = false
      }
      setTimeout(() => { this.msg = '' }, 2500)
    },
    _stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }
    }
  },
  beforeUnmount() {
    this._stopCamera()
  },
  mounted() {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    }
  }
}
</script>

<style scoped>
html, body, #app, .login-bg {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden !important;
  box-sizing: border-box;
}
body {
  overflow: hidden !important;
}

.login-bg {
  height: 100vh;
  width: 100vw;
  background: #f8fafc url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80') no-repeat center 80%;
  background-size: cover;
  position: fixed;
  top: 0; left: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-main {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 3;
  top: 0; left: 0;
}

/* 渐变遮罩，让视觉更聚焦 */
.login-gradient {
  pointer-events: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
  background: radial-gradient(ellipse at 55% 50%, rgba(25,118,210,0.10) 0%, rgba(25,118,210,0.18) 60%, rgba(24,35,61,0.13) 100%);
}

.login-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(24, 35, 61, 0.08);
  z-index: 2;
  pointer-events: none;
}

.login-main {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 3;
  top: 0; left: 0;
}

.login-card {
  max-width: 530px;
  width: 98vw;
  margin: 0;
  padding: 40px 44px 32px 44px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 16px 48px 0 rgba(25, 50, 110, 0.28);
  border-top: 8px solid #1976d2;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-height: 495px;
  animation: fadeInUp 0.8s cubic-bezier(.62,.04,.34,1.02);
  transition: box-shadow .22s;
}

.bank-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
  user-select: none;
}
.bank-ui svg {
  margin-bottom: 10px;
  display: block;
  width: 54px;
  height: 54px;
}
.bank-text {
  font-size: 2rem;
  color: #1976d2;
  font-weight: bold;
  letter-spacing: 2px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  margin-top: 0;
  line-height: 1;
}

.welcome-slogan {
  text-align: center;
  font-size: 1.12rem;
  color: #2766b3;
  margin-bottom: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: fadeIn 1.2s;
}

.el-input__inner {
  border-radius: 12px !important;
  box-shadow: 0 2px 10px rgba(25,118,210,0.04);
  font-size: 1.09rem;
  padding: 12px 16px;
  background: #f7fafd;
  border: 1.8px solid #e4e8ef;
  transition: border-color 0.22s, box-shadow 0.22s;
}
.el-input__inner:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25,118,210,0.11);
}
.el-input__prefix {
  color: #1976d2 !important;
  font-size: 1.3em;
  display: flex;
  align-items: center;
}

/* 银行风格用户和锁图标 */
.bank-user-icon {
  display: inline-block;
  width: 1.3em;
  height: 1.3em;
  background: none;
  margin-right: 2px;
  vertical-align: middle;
  background-image: url('data:image/svg+xml;utf8,<svg width="22" height="22" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="8" r="4.2" fill="%231976d2"/><path d="M4.8 17c0-2.5 3.5-4 6.2-4s6.2 1.5 6.2 4" stroke="%231976d2" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
}
.bank-lock-icon {
  display: inline-block;
  width: 1.3em;
  height: 1.3em;
  background: none;
  margin-right: 2px;
  vertical-align: middle;
  background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="9" width="12" height="7" rx="2" fill="none" stroke="%231976d2" stroke-width="1.7"/><path d="M10 13v1" stroke="%231976d2" stroke-width="1.7" stroke-linecap="round"/><circle cx="10" cy="12" r="1" fill="%231976d2"/><path d="M7 9V7.4c0-2 2-2.4 3-2.4s3 .4 3 2.4V9" stroke="%231976d2" stroke-width="1.7" fill="none"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
}

.el-button {
  border-radius: 12px;
  font-size: 1.07rem;
  font-weight: bold;
  letter-spacing: 1px;
  transition: background 0.3s, box-shadow 0.22s, transform .14s;
  box-shadow: 0 2px 8px rgba(25,118,210,0.09);
}
.el-button:active {
  transform: scale(.97);
}
.el-button--primary {
  background: #1976d2;
  border: none;
  color: #fff;
  box-shadow: 0 2px 12px rgba(25,118,210,0.11);
}
.el-button--primary:hover, .el-button--primary:focus {
  background: #1353aa;
  color: #fff;
}
.el-button--success {
  background: #009489;
  border: none;
  color: #fff;
}
.el-button--success:hover, .el-button--success:focus {
  background: #1976d2;
  color: #fff;
}
.face-login-btn {
  margin-bottom: 18px;
}

.or-divider {
  display: flex;
  align-items: center;
  margin: 22px 0 16px 0;
  width: 100%;
}
.or-divider::before,
.or-divider::after {
  content: "";
  flex: 1 1 auto;
  border-bottom: 2px solid #e0eafc;
  margin: 0 12px;
  border-radius: 2px;
}
.or-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #f1f5fb;
  border-radius: 50%;
  font-weight: bold;
  color: #1976d2;
  font-size: 1.15rem;
  border: 1.3px solid #e0eafc;
  box-shadow: 0 1px 3px rgba(25,118,210,0.06);
}

.face-video-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 260px;
}
.face-btn-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-top: 18px;
}

.register-link-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  font-size: 1rem;
  color: #1976d2;
  gap: 6px;
}
.no-account-text {
  color: #1976d2;
}
.register-link {
  padding-left: 3px;
  font-size: 1.03em;
  vertical-align: middle;
}

.login-msg {
  color: #e74c3c;
  text-align: center;
  margin-top: 16px;
  font-size: 1.02rem;
  letter-spacing: 1px;
  min-height: 1.2em;
  animation: fadeIn 0.5s;
}

:deep(.face-dialog-custom .el-dialog__wrapper) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
}

:deep(.face-dialog-custom .el-dialog) {
  border-radius: 20px;
  margin: 0 !important;
  box-shadow: 0 10px 30px rgba(15, 45, 100, 0.18);
  min-width: 420px;
  min-height: 330px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  position: relative;
}

.face-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding-bottom: 0;
}

@media (max-width: 700px) {
  .login-card {
    max-width: 99vw;
    padding: 16px 2vw 14px 2vw;
    min-height: 340px;
  }
  .bank-ui svg {
    width: 38px; height: 38px;
  }
  .bank-text {
    font-size: 1.12rem;
  }
  .face-dialog-custom :deep(.el-dialog) {
    min-width: 98vw;
  }
  .welcome-slogan {
    font-size: 1rem;
    margin-bottom: 10px;
  }
  .register-link-row {
    flex-direction: column;
    gap: 2px;
  }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(48px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>