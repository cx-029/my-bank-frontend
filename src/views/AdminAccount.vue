<template>
  <div class="admin-account-page">
    <el-card class="account-card" shadow="hover">
      <div class="account-header">
        <span class="account-title">账户管理</span>
        <el-button type="primary" @click="showAddDialog = true">
          新增账户
        </el-button>
      </div>
      <el-table :data="accounts" style="width: 100%" stripe>
        <el-table-column prop="id" label="账户ID" width="80"/>
        <el-table-column prop="customerId" label="客户ID" width="80"/>
        <el-table-column prop="accountType" label="类型"/>
        <el-table-column prop="balance" label="余额"/>
        <el-table-column prop="status" label="状态"/>
        <el-table-column prop="openDate" label="开户日期"/>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="delAccount(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增账户弹窗 -->
    <el-dialog title="新增账户" v-model="showAddDialog" width="420px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="客户ID">
          <el-input v-model="form.customerId"/>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.accountType" placeholder="选择类型">
            <el-option label="储蓄" value="储蓄"/>
            <el-option label="信用卡" value="信用卡"/>
          </el-select>
        </el-form-item>
        <el-form-item label="余额">
          <el-input v-model="form.balance" type="number"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="正常" value="正常"/>
            <el-option label="冻结" value="冻结"/>
            <el-option label="销户" value="销户"/>
          </el-select>
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="form.accountNumber"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addAccount">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑账户弹窗 -->
    <el-dialog title="编辑账户" v-model="showEditDialog" width="420px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="类型">
          <el-select v-model="editForm.accountType" placeholder="选择类型">
            <el-option label="储蓄" value="储蓄"/>
            <el-option label="信用卡" value="信用卡"/>
          </el-select>
        </el-form-item>
        <el-form-item label="余额">
          <el-input v-model="editForm.balance" type="number"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="正常" value="正常"/>
            <el-option label="冻结" value="冻结"/>
            <el-option label="销户" value="销户"/>
          </el-select>
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="editForm.accountNumber"/>
        </el-form-item>
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

const accounts = ref([])
const showAddDialog = ref(false)
const showEditDialog = ref(false)
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

// 加载账户列表
const loadAccounts = async () => {
  const res = await axios.get('/admin/account')
  accounts.value = res.data || []
}

onMounted(() => {
  loadAccounts()
})

const addAccount = async () => {
  try {
    await axios.post('/admin/account', form.value)
    ElMessage.success('账户新增成功')
    showAddDialog.value = false
    loadAccounts()
    form.value = { customerId: '', accountType: '', balance: '', status: '正常', accountNumber: '' }
  } catch (e) {
    ElMessage.error('新增失败')
  }
}

const openEdit = (row) => {
  editForm.value = { ...row }
  showEditDialog.value = true
}

const updateAccount = async () => {
  try {
    await axios.put(`/admin/account/${editForm.value.id}`, editForm.value)
    ElMessage.success('账户修改成功')
    showEditDialog.value = false
    loadAccounts()
  } catch (e) {
    ElMessage.error('修改失败')
  }
}

const delAccount = async (id) => {
  ElMessageBox.confirm('确定要删除该账户吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await axios.delete(`/admin/account/${id}`)
    ElMessage.success('删除成功')
    loadAccounts()
  }).catch(() => {})
}
</script>

<style scoped>
.admin-account-page {
  max-width: 980px;
  margin: 32px auto;
}
.account-card {
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e3eafc;
}
.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.account-title {
  font-size: 1.36rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.2px;
}
</style>