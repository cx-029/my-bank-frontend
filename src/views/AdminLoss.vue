<!-- AdminLoss.vue -->
<template>
  <div class="admin-loss-page">
    <el-card class="loss-card" shadow="hover">
      <div class="loss-header">
        <span class="loss-title">挂失管理</span>
        <el-button class="close-btn" type="text" @click="goBack" circle>
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </div>
      <div class="loss-query-row">
        <el-form :inline="false" :model="searchForm" class="loss-query-form" @submit.prevent="onSearch">
          <el-row :gutter="18">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="账户ID">
                <el-input v-model="searchForm.accountId" placeholder="输入账户ID" clearable />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="全部" clearable>
                  <el-option label="挂失" value="挂失"/>
                  <el-option label="冻结" value="冻结"/>
                  <el-option label="销户" value="销户"/>
                  <el-option label="正常" value="正常"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="query-btns">
              <el-form-item>
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-table :data="lossReports" style="width:100%;margin-top:18px;" border>
        <el-table-column prop="id" label="记录ID" width="80"/>
        <el-table-column prop="accountId" label="账户ID" width="120"/>
        <el-table-column prop="type" label="类型" width="120"/>
        <el-table-column prop="reason" label="原因"/>
        <el-table-column prop="status" label="状态" width="110"/>
        <el-table-column prop="createdAt" label="申请时间" width="180"/>
        <el-table-column prop="resolvedAt" label="处理时间" width="180"/>
        <el-table-column label="操作" width="160">
          <template #default="scope">
            <el-button
                size="small"
                type="primary"
                @click="openEdit(scope.row)"
                :disabled="!isLatest(scope.row) || scope.row.status === '销户'"
            >更改</el-button>
            <el-button
                size="small"
                type="danger"
                @click="deleteReport(scope.row.id)"
                :disabled="!isLatest(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          @current-change="fetchLossReports"
          layout="prev, pager, next"
          style="margin-top: 20px;"
      />
    </el-card>
    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="修改挂失状态" width="360px" @close="resetEdit">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="挂失状态">
          <el-select v-model="editForm.status" style="width:200px">
            <el-option label="挂失" value="挂失"/>
            <el-option label="冻结" value="冻结"/>
            <el-option label="销户" value="销户"/>
            <el-option label="正常" value="正常"/>
          </el-select>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="editForm.reason" style="width:200px"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const lossReports = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchForm = reactive({
  accountId: '',
  status: ''
})

const editDialogVisible = ref(false)
const editForm = reactive({
  id: null,
  status: '',
  reason: ''
})

function isLatest(row) {
  if (!lossReports.value.length) return false
  return lossReports.value[0].id === row.id
}

function fetchLossReports() {
  const params = {
    page: page.value - 1,
    size: pageSize.value,
    ...(searchForm.accountId && {accountId: searchForm.accountId}),
    ...(searchForm.status && {status: searchForm.status})
  }
  axios.get('/api/admin/loss/list', { params }).then(res => {
    lossReports.value = res.data.content
    total.value = res.data.totalElements
  })
}

function onSearch() {
  page.value = 1
  fetchLossReports()
}
function resetSearch() {
  searchForm.accountId = ''
  searchForm.status = ''
  page.value = 1
  fetchLossReports()
}

function deleteReport(id) {
  axios.delete(`/api/admin/loss/${id}`).then(() => {
    ElMessage.success('删除成功')
    fetchLossReports()
  })
}

function openEdit(row) {
  editForm.id = row.id
  editForm.status = row.status
  editForm.reason = row.reason || ''
  editDialogVisible.value = true
}
function resetEdit() {
  editForm.id = null
  editForm.status = ''
  editForm.reason = ''
}
function submitEdit() {
  axios.put(`/api/admin/loss/${editForm.id}`, {
    status: editForm.status,
    reason: editForm.reason
  }).then(res => {
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    fetchLossReports()
  })
}

const router = useRouter()
function goBack() {
  router.push('/admin')
}

onMounted(fetchLossReports)
</script>

<style scoped>
.admin-loss-page {
  padding: 36px;
  max-width: none;
  margin: 0;
}
.loss-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px #e3eafc;
  padding: 0;
}
.loss-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
  padding: 24px 28px 0 28px;
}
.loss-title {
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
.loss-query-row {
  margin-bottom: 18px;
  margin-top: 5px;
  padding: 0 28px;
}
.loss-query-form {
  background: #f8fcff;
  border-radius: 11px;
  padding: 16px 18px 8px 18px;
  box-shadow: 0 2px 10px #e3eafc;
}
.query-btns .el-form-item {
  display: flex;
  gap: 10px;
}
@media (max-width: 900px) {
  .admin-loss-page { padding: 16px 2vw 12px 2vw; }
  .loss-header { flex-direction: column; gap: 12px;}
  .loss-title { font-size: 1.2rem;}
  .loss-query-row { margin-bottom: 10px; }
}
</style>