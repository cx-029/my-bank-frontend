<template>
  <div class="admin-notification-list">
    <el-card>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:700;font-size:1.25em;">通知管理</span>
        <el-button type="primary" @click="openDialog(null)">新建通知</el-button>
      </div>
      <el-table :data="notifications" style="margin-top:18px;">
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

const notifications = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const dialogTitle = ref('新建通知')
const form = ref({ title: '', content: '', imageUrl: '' })
const editingId = ref(null)

// 上传图片带 token
const uploadHeaders = {
  Authorization: 'Bearer ' + localStorage.getItem('token')
}

const loadList = async () => {
  try {
    const res = await axios.get('/admin/notifications', {
      params: { page: page.value - 1, size: pageSize.value }
    })
    notifications.value = res.content || []
    total.value = res.totalElements || 0
  } catch (e) {
    console.error('loadList error', e)
  }
}

const handlePage = (p) => {
  page.value = p
  loadList()
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
    loadList()
  } catch (e) {
    console.error('submitForm error', e)
  }
}

const deleteNotify = async (id) => {
  try {
    await axios.delete(`/admin/notifications/${id}`)
    ElMessage.success('删除成功')
    loadList()
  } catch (e) {
    console.error('deleteNotify error', e)
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.admin-notification-list { max-width:900px; margin:auto; padding-top:40px;}
</style>