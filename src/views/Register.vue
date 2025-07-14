<template>
  <div class="register-bg">
    <div class="register-gradient"></div>
    <div class="register-overlay"></div>
    <div class="register-main">
      <div class="register-card">
        <div class="register-logo bank-ui">
          <!-- logo略 -->
        </div>
        <div class="register-slogan">
          欢迎注册智慧银行新用户
        </div>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" autocomplete="username">
              <template #prefix>
                <i class="bank-user-icon"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="new-password">
              <template #prefix>
                <i class="bank-lock-icon"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="form.realName" placeholder="请输入真实姓名">
              <template #prefix>
                <i class="el-icon-user"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" autocomplete="email">
              <template #prefix>
                <i class="el-icon-message"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" autocomplete="tel">
              <template #prefix>
                <i class="el-icon-phone"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onRegister" :loading="loading" style="width:100%;">
              <i class="el-icon-check"></i> 注册
            </el-button>
          </el-form-item>
        </el-form>
        <div class="register-link-row">
          <span class="has-account-text">已有账号？</span>
          <el-link type="primary" @click="goLogin" class="register-link">
            <i class="el-icon-user"></i> 去登录
          </el-link>
        </div>
        <transition name="fade">
          <div v-if="msg" class="register-msg">{{ msg }}</div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { registerUser } from '@/api/user'
// 注意路径按你项目实际调整

export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        realName: '', // 注意这里是 realName
        email: '',
        phone: '',
      },
      loading: false,
      msg: '',
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, message: '用户名至少4位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onRegister() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          const { data } = await registerUser({ ...this.form })
          if (data.msg) {
            this.msg = data.msg
            setTimeout(() => {
              this.$router.push('/login')
            }, 1200)
          } else if (data.error) {
            this.msg = data.error
          }
        } catch (e) {
          this.msg = '注册失败，请稍后再试'
        }
        this.loading = false
        setTimeout(() => { this.msg = '' }, 2500)
      })
    },
    goLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<!-- 样式同你原来，无需更改 -->
<style scoped>
/* ...省略样式（可用你的原样式）... */
</style>

<style scoped>
.register-bg {
  height: 100vh;
  width: 100vw;
  background: #f8fafc url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80') no-repeat center top;
  background-size: cover;
  position: fixed;
  top: 0; left: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.register-gradient {
  pointer-events: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
  background: radial-gradient(ellipse at 55% 50%, rgba(25,118,210,0.10) 0%, rgba(25,118,210,0.18) 60%, rgba(24,35,61,0.13) 100%);
}
.register-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(24, 35, 61, 0.08);
  z-index: 2;
  pointer-events: none;
}
.register-main {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 3;
  top: 0; left: 0;
}
.register-card {
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
  min-height: 530px;
  animation: fadeInUp 0.8s cubic-bezier(.62,.04,.34,1.02);
  transition: box-shadow .22s;
}
.register-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
  user-select: none;
}
.bank-ui svg {
  margin-bottom: 10px;
  display: block;
  width: 48px;
  height: 48px;
}
.bank-text {
  font-size: 1.8rem;
  color: #1976d2;
  font-weight: bold;
  letter-spacing: 2px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  margin-top: 0;
  line-height: 1;
}
.register-slogan {
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
.register-link-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  font-size: 1rem;
  color: #1976d2;
  gap: 6px;
}
.has-account-text {
  color: #1976d2;
}
.register-link {
  padding-left: 3px;
  font-size: 1.03em;
  vertical-align: middle;
}
.register-msg {
  color: #e74c3c;
  text-align: center;
  margin-top: 16px;
  font-size: 1.02rem;
  letter-spacing: 1px;
  min-height: 1.2em;
  animation: fadeIn 0.5s;
}
@media (max-width: 700px) {
  .register-card {
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
  .register-link-row {
    flex-direction: column;
    gap: 2px;
  }
  .register-slogan {
    font-size: 1rem;
    margin-bottom: 10px;
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