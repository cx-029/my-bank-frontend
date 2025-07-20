<!-- AdminAccount.vue -->
<template>
  <div class="admin-account-page">
    <el-card class="account-card" shadow="hover">
      <div class="account-header">
        <span class="account-title">账户管理</span>
        <el-button class="close-btn" type="text" @click="goBack" circle>
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </div>
      <div class="account-query-row">
        <el-form :inline="false" :model="queryForm" class="account-query-form" @submit.prevent>
          <el-row :gutter="18">
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="账户ID" class="query-item">
                <el-input v-model="queryForm.accountId" clearable placeholder="精确查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="客户ID" class="query-item">
                <el-input v-model="queryForm.customerId" clearable placeholder="精确查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="类型" class="query-item">
                <el-select v-model="queryForm.accountType" placeholder="全部" clearable>
                  <el-option label="储蓄" value="储蓄"/>
                  <el-option label="信用卡" value="信用卡"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" class="query-btns">
              <el-form-item>
                <el-button type="primary" @click="searchAccount">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="add-account-btn-row">
          <el-button type="primary" @click="showAddDialog = true">新增账户</el-button>
        </div>
      </div>
      <el-table :data="accounts" style="width: 100%" stripe>
        <el-table-column prop="id" label="账户ID" width="80"/>
        <el-table-column prop="customerId" label="客户ID" width="80"/>
        <el-table-column prop="accountType" label="类型"/>
        <el-table-column prop="balance" label="余额">
          <template #default="scope">
            {{ $formatMoney(scope.row.balance) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态"/>
        <el-table-column prop="openDate" label="开户日期"/>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="delAccount(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          background
          layout="prev, pager, next, jumper, ->, total"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          style="margin-top: 18px; text-align: right;"
      />
      <el-loading :fullscreen="false" :body="true" v-if="loading" />
    </el-card>

    <!-- 新增账户弹窗 -->
    <el-dialog title="新增账户" v-model="showAddDialog" width="420px">
      <el-form :model="form" label-width="90px">
        <el-row :gutter="18">
          <el-col :xs="24" :sm="24" :md="24">
            <el-form-item label="客户ID">
              <el-input v-model="form.customerId" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="类型">
              <el-select v-model="form.accountType" placeholder="选择类型">
                <el-option label="储蓄" value="储蓄"/>
                <el-option label="信用卡" value="信用卡"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="余额">
              <el-input v-model="form.balance" type="number"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="状态">
              <el-select v-model="form.status">
                <el-option label="正常" value="正常"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="银行卡号">
              <el-input v-model="form.accountNumber"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addAccount">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑账户弹窗 -->
    <el-dialog title="编辑账户" v-model="showEditDialog" width="420px">
      <el-form :model="editForm" label-width="90px">
        <el-row :gutter="18">
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="类型">
              <el-select v-model="editForm.accountType" placeholder="选择类型">
                <el-option label="储蓄" value="储蓄"/>
                <el-option label="信用卡" value="信用卡"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="余额">
              <el-input v-model="editForm.balance" type="number"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="状态">
              <el-select v-model="editForm.status">
                <el-option label="正常" value="正常"/>
                <el-option label="冻结" value="冻结"/>
                <el-option label="销户" value="销户"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="银行卡号">
              <el-input v-model="editForm.accountNumber"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateAccount">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()
function goBack() {
  router.push('/admin')
}

const accounts = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const loading = ref(false)
const form = ref({
  customerId: '',
  accountType: '',
  balance: '',
  status: '正常',
  accountNumber: ''
})
const editForm = ref({
  id: '',
  accountType: '',
  balance: '',
  status: '',
  accountNumber: ''
})
const queryForm = ref({
  accountId: '',
  customerId: '',
  accountType: ''
})

// 查询账户（带分页参数）
const searchAccount = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value,
    }
    if (queryForm.value.accountId) params.id = queryForm.value.accountId
    if (queryForm.value.customerId) params.customerId = queryForm.value.customerId
    if (queryForm.value.accountType) params.accountType = queryForm.value.accountType
    const res = await axios.get('/admin/account/page', { params })
    // 后端返回 { content, totalElements }
    accounts.value = res.content || []
    total.value = res.totalElements || 0
  } catch {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时查询所有
onMounted(() => {
  searchAccount()
})

const resetQuery = () => {
  queryForm.value = { accountId: '', customerId: '', accountType: '' }
  currentPage.value = 1
  searchAccount()
}

const handlePageChange = (page) => {
  currentPage.value = page
  searchAccount()
}
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  searchAccount()
}

const addAccount = async () => {
  try {
    loading.value = true
    await axios.post('/admin/account', form.value)
    ElMessage.success('账户新增成功')
    showAddDialog.value = false
    searchAccount()
    form.value = { customerId: '', accountType: '', balance: '', status: '正常', accountNumber: '' }
  } catch (e) {
    ElMessage.error('新增失败')
  } finally {
    loading.value = false
  }
}

const openEdit = (row) => {
  editForm.value = { ...row }
  showEditDialog.value = true
}

const updateAccount = async () => {
  try {
    loading.value = true
    await axios.put(`/admin/account/${editForm.value.id}`, editForm.value)
    ElMessage.success('账户修改成功')
    showEditDialog.value = false
    searchAccount()
  } catch (e) {
    ElMessage.error('修改失败')
  } finally {
    loading.value = false
  }
}

const delAccount = async (id) => {
  ElMessageBox.confirm('确定要删除该账户吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    loading.value = true
    await axios.delete(`/admin/account/${id}`)
    ElMessage.success('删除成功')
    searchAccount()
    loading.value = false
  }).catch(() => {})
}
</script>

<style scoped>
.admin-account-page {
  padding: 36px;
  max-width: none;
  margin: 0;
}
.account-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px #e3eafc;
  padding: 0;
}
.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
  padding: 24px 28px 0 28px;
}
.account-title {
  font-size: 1.3em;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.2px;
}
.account-query-row {
  margin-bottom: 18px;
  margin-top: 5px;
  padding: 0 28px;
}
.account-query-form {
  background: #f8fcff;
  border-radius: 11px;
  padding: 16px 18px 8px 18px;
  box-shadow: 0 2px 10px #e3eafc;
}
.query-item .el-form-item__label {
  font-weight: 500;
}
.query-btns .el-form-item {
  display: flex;
  gap: 10px;
}
.add-account-btn-row {
  margin-top: 10px;
  text-align: right;
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
@media (max-width: 900px) {
  .admin-account-page { padding: 16px 2vw 12px 2vw; }
  .account-header { flex-direction: column; gap: 12px;}
  .account-title { font-size: 1.2rem;}
  .account-query-row { margin-bottom: 10px; }
}
</style>