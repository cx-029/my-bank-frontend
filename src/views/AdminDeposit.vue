<template>
  <div class="admin-deposit-page">
    <el-card class="deposit-card" shadow="hover">
      <div class="deposit-header">
        <span class="deposit-title">存取/转账管理</span>
        <el-button class="close-btn" type="text" @click="goBack" circle>
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </div>
      <div class="deposit-query-row">
        <el-form :model="queryForm" class="deposit-query-form" @submit.prevent>
          <el-row :gutter="18">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="账户ID">
                <el-input v-model="queryForm.accountId" clearable placeholder="精确查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="类型">
                <el-select v-model="queryForm.type" clearable placeholder="全部">
                  <el-option label="存款" value="存款"/>
                  <el-option label="取款" value="取款"/>
                  <el-option label="转账" value="转账"/>
                  <el-option label="转入" value="转入"/>
                  <el-option label="转出" value="转出"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="query-btns">
              <el-form-item>
                <el-button type="primary" @click="searchTransaction">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="add-transaction-btn-row">
          <el-button type="primary" @click="showAddDialog = true">新增操作</el-button>
        </div>
      </div>
      <el-table :data="transactions" style="width: 100%" stripe>
        <el-table-column prop="id" label="流水ID" width="80"/>
        <el-table-column prop="accountId" label="账户ID" width="120"/>
        <el-table-column prop="type" label="类型" width="100"/>
        <el-table-column prop="amount" label="金额" width="110">
          <template #default="scope">
            {{ $formatMoney(scope.row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="balanceAfter" label="余额" width="120">
          <template #default="scope">
            {{ $formatMoney(scope.row.balanceAfter) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180"/>
        <el-table-column prop="transactionTime" label="时间" min-width="180"/>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEdit(scope.row)">编辑描述</el-button>
            <el-button size="small" type="danger" @click="delTransaction(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          layout="prev, pager, next"
          style="margin-top: 20px;"
      />
      <el-loading :fullscreen="false" :body="true" v-if="loading" />
    </el-card>

    <!-- 新增弹窗 -->
    <el-dialog title="新增存取/转账" v-model="showAddDialog" width="460px">
      <el-form :model="form" label-width="90px">
        <el-row :gutter="18">
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="账户ID">
              <el-input v-model="form.accountId" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="类型">
              <el-select v-model="form.type" placeholder="类型">
                <el-option label="存款" value="存款"/>
                <el-option label="取款" value="取款"/>
                <el-option label="转账" value="转账"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="金额">
              <el-input type="number" v-model="form.amount" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="描述">
              <el-input v-model="form.description" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.type==='转账'" :xs="24" :sm="12" :md="12">
            <el-form-item label="目标账户ID">
              <el-input v-model="form.toAccountId" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addTransaction">保存</el-button>
      </template>
    </el-dialog>
    <!-- 编辑弹窗 -->
    <el-dialog title="编辑流水描述" v-model="showEditDialog" width="360px">
      <el-form :model="editForm" label-width="70px">
        <el-form-item label="描述">
          <el-input v-model="editForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateTransaction">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const transactions = ref([])
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  accountId: '',
  type: ''
})
const form = ref({
  accountId: '',
  type: '存款',
  amount: '',
  description: '',
  toAccountId: ''
})
const editForm = ref({
  id: '',
  description: ''
})

// 分页查询流水
const searchTransaction = async () => {
  try {
    loading.value = true
    // 前端只传 page: page.value，不做减一
    const params = {
      ...queryForm.value,
      page: page.value,
      size: pageSize.value
    }
    const res = await axios.get('/api/admin/transactions', { params })
    // 兼容后端分页返回格式
    if (res.data.content) {
      transactions.value = res.data.content
      total.value = res.data.totalElements
    } else {
      transactions.value = res.data || []
      total.value = transactions.value.length
    }
  } catch {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}
onMounted(searchTransaction)
const handlePageChange = (val) => {
  page.value = Math.max(1, val)
  searchTransaction()
}
const resetQuery = () => {
  queryForm.value = { accountId: '', type: '' }
  page.value = 1
  searchTransaction()
}

const addTransaction = async () => {
  try {
    loading.value = true
    const tx = form.value
    let payload = {
      accountId: tx.accountId,
      amount: tx.amount,
      description: tx.description
    }
    if (!tx.accountId || !tx.amount) {
      ElMessage.error('请填写账户ID和金额')
      return
    }
    if (tx.type === '存款') {
      await axios.post('/api/admin/transactions/deposit', payload)
    } else if (tx.type === '取款') {
      await axios.post('/api/admin/transactions/withdraw', payload)
    } else if (tx.type === '转账') {
      if (!tx.toAccountId) {
        ElMessage.error('请填写目标账户ID')
        return
      }
      await axios.post(`/api/admin/transactions/transfer?toAccountId=${tx.toAccountId}`, payload)
    }
    ElMessage.success('操作成功')
    showAddDialog.value = false
    searchTransaction()
    form.value = { accountId: '', type: '存款', amount: '', description: '', toAccountId: '' }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}
const openEdit = (row) => {
  editForm.value = { id: row.id, description: row.description }
  showEditDialog.value = true
}
const updateTransaction = async () => {
  try {
    loading.value = true
    await axios.put(`/api/admin/transactions/${editForm.value.id}`, { description: editForm.value.description })
    ElMessage.success('修改成功')
    showEditDialog.value = false
    searchTransaction()
  } catch {
    ElMessage.error('修改失败')
  } finally {
    loading.value = false
  }
}
const delTransaction = async (id) => {
  ElMessageBox.confirm('确定要删除该流水吗？', '提示', { type: 'warning' })
      .then(async () => {
        loading.value = true
        await axios.delete(`/api/admin/transactions/${id}`)
        ElMessage.success('删除成功')
        searchTransaction()
        loading.value = false
      })
      .catch(() => {})
}
// 右上角叉叉
const goBack = () => {
  router.push('/admin')
}
</script>

<style scoped>
.admin-deposit-page {
  padding: 36px;
  max-width: none;
  margin: 0;
}
.deposit-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px #e3eafc;
  padding: 0;
}
.deposit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
}
.deposit-title {
  font-size: 1.3em;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.2px;
}
.deposit-query-row {
  margin-bottom: 18px;
  margin-top: 5px;
}
.deposit-query-form {
  background: #f8fcff;
  border-radius: 11px;
  padding: 16px 18px 8px 18px;
  box-shadow: 0 2px 10px #e3eafc;
}
.query-btns .el-form-item {
  display: flex;
  gap: 10px;
}
.add-transaction-btn-row {
  margin-top: 10px;
  text-align: right;
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 10px;
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
@media (max-width: 900px) {
  .admin-deposit-page { padding: 16px 2vw 12px 2vw; }
  .deposit-header { flex-direction: column; gap: 12px;}
  .deposit-title { font-size: 1.2rem;}
  .deposit-query-row { margin-bottom: 10px; }
}
</style>