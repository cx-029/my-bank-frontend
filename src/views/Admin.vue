<template>
  <div class="admin-container">
    <el-card class="admin-card">
      <h2>管理员后台</h2>
      <p>欢迎，管理员！你现在拥有管理权限，可以进行后台操作。</p>
      <el-button type="danger" style="margin-top: 20px;" @click="logout">退出登录</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f6fb;
}
.admin-card {
  width: 400px;
  padding: 40px 30px 20px 30px;
  text-align: center;
}
</style>