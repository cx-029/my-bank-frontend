<template>
  <div class="admin-notification-comment-list">
    <el-card class="comment-card" shadow="hover">
      <div class="comment-header">
        <span class="comment-title">评论管理</span>
        <el-button class="close-btn" type="text" @click="goBack" circle>
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </div>
      <div class="comment-query-row">
        <el-form :model="queryForm" class="comment-query-form" @submit.prevent>
          <el-row :gutter="18">
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="评论内容">
                <el-input v-model="queryForm.content" clearable placeholder="支持模糊查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="通知ID">
                <el-input v-model="queryForm.notificationId" clearable placeholder="通知ID"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="用户ID">
                <el-input v-model="queryForm.userId" clearable placeholder="用户ID"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="状态">
                <el-select v-model="queryForm.deleted" clearable placeholder="全部">
                  <el-option label="未删除" :value="0"></el-option>
                  <el-option label="已删除" :value="1"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" class="query-btns">
              <el-form-item>
                <el-button type="primary" @click="searchComments">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-table
          :data="comments"
          style="width:100%;margin-top:18px;"
          stripe
          max-height="360"
      >
        <el-table-column prop="id" label="ID" width="60"/>
        <el-table-column prop="notificationId" label="通知ID" width="90"/>
        <el-table-column prop="userId" label="用户ID" width="90"/>
        <el-table-column prop="comment" label="内容" min-width="180"/>
        <el-table-column prop="createdAt" label="时间" width="160"/>
        <el-table-column prop="deleted" label="状态" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.deleted === 0 ? 'success' : 'info'">
              {{ scope.row.deleted === 0 ? '未删除' : '已删除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170">
          <template #default="scope">
            <el-button size="small" type="danger" v-if="scope.row.deleted === 0" @click="deleteComment(scope.row.id)">删除</el-button>
            <el-button size="small" type="primary" v-if="scope.row.deleted === 1" @click="restoreComment(scope.row.id)">恢复</el-button>
            <el-button size="small" @click="showDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-row">
        <el-pagination
            background
            layout="sizes, prev, pager, next, total"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            :current-page="page"
            @current-change="handlePage"
            @size-change="handleSizeChange"
        />
      </div>

      <!-- 详情弹窗 -->
      <el-dialog v-model="detailVisible" title="评论详情" width="420px">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detailRow.id }}</el-descriptions-item>
          <el-descriptions-item label="通知ID">{{ detailRow.notificationId }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailRow.userId }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ detailRow.comment }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ detailRow.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailRow.deleted === 0 ? 'success' : 'info'">
              {{ detailRow.deleted === 0 ? '未删除' : '已删除' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <el-button @click="detailVisible=false">关闭</el-button>
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

const comments = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(5) // 默认一页5条，体验更好
const queryForm = ref({
  content: '',
  notificationId: '',
  userId: '',
  deleted: ''
})

const detailVisible = ref(false)
const detailRow = ref({})

// 查询评论
const searchComments = async () => {
  try {
    const params = {
      page: page.value - 1,
      size: pageSize.value,
      ...queryForm.value
    }
    // 若为空字符串则不要传
    Object.keys(params).forEach(k => {
      if (params[k] === '') delete params[k]
    })
    const res = await axios.get('/admin/notification-comments', { params })
    comments.value = res.content || []
    total.value = res.totalElements || 0
  } catch (e) {
    ElMessage.error('查询失败')
  }
}

onMounted(() => {
  searchComments()
})

const resetQuery = () => {
  queryForm.value = { content: '', notificationId: '', userId: '', deleted: '' }
  page.value = 1
  searchComments()
}

const handlePage = (p) => {
  page.value = p
  searchComments()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  page.value = 1
  searchComments()
}

const deleteComment = async (id) => {
  try {
    await axios.delete(`/admin/notification-comments/${id}`)
    ElMessage.success('已删除')
    searchComments()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

const restoreComment = async (id) => {
  try {
    await axios.put(`/admin/notification-comments/${id}/restore`)
    ElMessage.success('已恢复')
    searchComments()
  } catch (e) {
    ElMessage.error('恢复失败')
  }
}

const showDetail = (row) => {
  detailRow.value = { ...row }
  detailVisible.value = true
}
</script>

<style scoped>
.admin-notification-comment-list {
  padding: 36px;
  max-width: none;
  margin: 0;
}
.comment-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px #e3eafc;
  padding: 0;
  max-width: none;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
  padding: 24px 28px 0 28px;
}
.comment-title {
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
.comment-query-row {
  margin-bottom: 18px;
  margin-top: 5px;
  padding: 0 28px;
}
.comment-query-form {
  background: #f8fcff;
  border-radius: 11px;
  padding: 16px 18px 8px 18px;
  box-shadow: 0 2px 10px #e3eafc;
}
.query-btns .el-form-item {
  display: flex;
  gap: 10px;
}
.pagination-row {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
@media (max-width: 900px) {
  .admin-notification-comment-list { padding: 16px 2vw 12px 2vw; }
  .comment-header { flex-direction: column; gap: 12px;}
  .comment-title { font-size: 1.2rem;}
  .comment-query-row { margin-bottom: 10px; }
}
</style>