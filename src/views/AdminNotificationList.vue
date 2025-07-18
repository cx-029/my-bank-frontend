<!-- AdminNotificationList.vue -->
<template>
  <div class="admin-notification-list">
    <el-card class="notification-card" shadow="hover">
      <div class="notification-header">
        <span class="notification-title">通知管理</span>
        <el-button class="close-btn" type="text" @click="goBack" circle>
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </div>
      <div class="notification-query-row">
        <el-form :model="queryForm" class="notification-query-form" @submit.prevent>
          <el-row :gutter="18">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="标题">
                <el-input v-model="queryForm.title" clearable placeholder="标题模糊查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="作者">
                <el-input v-model="queryForm.author" clearable placeholder="作者精确查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="query-btns">
              <el-form-item>
                <el-button type="primary" @click="searchNotification">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="add-notification-btn-row">
          <el-button type="primary" @click="openDialog(null)">新建通知</el-button>
        </div>
      </div>
      <el-table :data="notifications" style="width:100%;margin-top:18px;" stripe>
        <el-table-column prop="id" label="ID" width="60"/>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="author" label="作者" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteNotify(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="handlePage"
          style="margin-top:20px;"
      />

      <!-- 新建/编辑弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle">
        <el-form :model="form">
          <el-form-item label="标题">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input type="textarea" v-model="form.content" />
          </el-form-item>
          <el-form-item label="图片">
            <el-upload
                action="/api/upload/avatar"
                :headers="uploadHeaders"
                list-type="picture"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
            >
              <el-button type="primary">上传图片</el-button>
            </el-upload>
            <div v-if="form.imageUrl" style="margin-top:10px;">
              <img :src="form.imageUrl" alt="图片预览" style="max-width:150px;" />
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible=false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()
function goBack() {
  router.push('/admin')
}

const notifications = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const dialogTitle = ref('新建通知')
const form = ref({ title: '', content: '', imageUrl: '' })
const editingId = ref(null)
const queryForm = ref({
  title: '',
  author: ''
})

// 查询通知（带分页参数和查询条件）
const searchNotification = async () => {
  try {
    const params = {
      page: page.value - 1,
      size: pageSize.value,
      ...queryForm.value
    }
    const res = await axios.get('/admin/notifications', { params })
    notifications.value = res.content || []
    total.value = res.totalElements || 0
  } catch (e) {
    ElMessage.error('查询失败')
  }
}

onMounted(() => {
  searchNotification()
})

const resetQuery = () => {
  queryForm.value = { title: '', author: '' }
  page.value = 1
  searchNotification()
}

const handlePage = (p) => {
  page.value = p
  searchNotification()
}

const openDialog = (row) => {
  dialogVisible.value = true
  if (row) {
    dialogTitle.value = '编辑通知'
    form.value = { title: row.title, content: row.content, imageUrl: row.imageUrl }
    editingId.value = row.id
  } else {
    dialogTitle.value = '新建通知'
    form.value = { title: '', content: '', imageUrl: '' }
    editingId.value = null
  }
}

// 上传图片带 token
const uploadHeaders = {
  Authorization: 'Bearer ' + localStorage.getItem('token')
}

// 图片上传相关
const handleAvatarSuccess = (resp) => {
  if (resp && resp.url) {
    form.value.imageUrl = resp.url
  }
}
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

const submitForm = async () => {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('标题和内容不能为空')
    return
  }
  try {
    if (editingId.value) {
      await axios.put(`/admin/notifications/${editingId.value}`, form.value)
      ElMessage.success('修改成功')
    } else {
      await axios.post('/admin/notifications', form.value)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    searchNotification()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const deleteNotify = async (id) => {
  try {
    await axios.delete(`/admin/notifications/${id}`)
    ElMessage.success('删除成功')
    searchNotification()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.admin-notification-list {
  padding: 36px;
  max-width: none;
  margin: 0;
}
.notification-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px #e3eafc;
  padding: 0;
  max-width: none;
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
  padding: 24px 28px 0 28px;
}
.notification-title {
  font-size: 1.3em;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.2px;
}
.close-btn {
  position: absolute;
  top: 24px;
  right: 32px;
  background: none;
  border: none;
  z-index: 10;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.close-btn:hover svg path {
  stroke: #1976d2;
}
.notification-query-row {
  margin-bottom: 18px;
  margin-top: 5px;
  padding: 0 28px;
}
.notification-query-form {
  background: #f8fcff;
  border-radius: 11px;
  padding: 16px 18px 8px 18px;
  box-shadow: 0 2px 10px #e3eafc;
}
.query-btns .el-form-item {
  display: flex;
  gap: 10px;
}
.add-notification-btn-row {
  margin-top: 10px;
  text-align: right;
}
@media (max-width: 900px) {
  .admin-notification-list { padding: 16px 2vw 12px 2vw; }
  .notification-header { flex-direction: column; gap: 12px;}
  .notification-title { font-size: 1.2rem;}
  .notification-query-row { margin-bottom: 10px; }
}
</style>