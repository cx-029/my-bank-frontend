<template>
  <div class="admin-customer-page">
    <el-card class="customer-card" shadow="hover">
      <div class="customer-header">
        <span class="customer-title">客户管理</span>
        <el-button class="logout-btn" type="text" @click="logout" circle>
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </div>
      <div class="customer-query-row">
        <el-form :model="queryForm" class="customer-query-form" @submit.prevent>
          <el-row :gutter="18">
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="客户ID">
                <el-input v-model="queryForm.id" clearable placeholder="精确查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="姓名">
                <el-input v-model="queryForm.name" clearable placeholder="模糊查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="手机号">
                <el-input v-model="queryForm.phone" clearable placeholder="精确查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" class="query-btns">
              <el-form-item>
                <el-button type="primary" @click="searchCustomer">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="add-customer-btn-row">
          <el-button type="primary" @click="showAddDialog = true">新增客户</el-button>
        </div>
      </div>
      <el-table :data="customers" style="width: 100%" stripe>
        <el-table-column prop="id" label="客户ID" width="80"/>
        <el-table-column prop="name" label="姓名"/>
        <el-table-column prop="gender" label="性别"/>
        <el-table-column prop="idNumber" label="身份证号"/>
        <el-table-column prop="birthday" label="生日"/>
        <el-table-column prop="address" label="地址"/>
        <el-table-column prop="phone" label="手机号"/>
        <el-table-column prop="email" label="邮箱"/>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="delCustomer(scope.row.id)">删除</el-button>
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

    <!-- 新增客户弹窗 -->
    <el-dialog title="新增客户" v-model="showAddDialog" width="420px">
      <el-form :model="form" label-width="90px">
        <el-row :gutter="18">
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="姓名">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="性别">
              <el-select v-model="form.gender" placeholder="选择性别">
                <el-option label="男" value="男"/>
                <el-option label="女" value="女"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="身份证号">
              <el-input v-model="form.idNumber" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="生日">
              <el-date-picker v-model="form.birthday" type="date" placeholder="选择日期"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="地址">
              <el-input v-model="form.address" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="手机号">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addCustomer">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑客户弹窗 -->
    <el-dialog title="编辑客户" v-model="showEditDialog" width="420px">
      <el-form :model="editForm" label-width="90px">
        <el-row :gutter="18">
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="姓名">
              <el-input v-model="editForm.name" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="性别">
              <el-select v-model="editForm.gender" placeholder="选择性别">
                <el-option label="男" value="男"/>
                <el-option label="女" value="女"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="身份证号">
              <el-input v-model="editForm.idNumber" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="生日">
              <el-date-picker v-model="editForm.birthday" type="date" placeholder="选择日期"/>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="地址">
              <el-input v-model="editForm.address" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="手机号">
              <el-input v-model="editForm.phone" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12">
            <el-form-item label="邮箱">
              <el-input v-model="editForm.email" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateCustomer">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from '@/utils/request'

const customers = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const loading = ref(false)

const form = ref({
  name: '',
  gender: '',
  idNumber: '',
  birthday: '',
  address: '',
  phone: '',
  email: ''
})
const editForm = ref({
  id: '',
  name: '',
  gender: '',
  idNumber: '',
  birthday: '',
  address: '',
  phone: '',
  email: ''
})
const queryForm = ref({
  id: '',
  name: '',
  phone: ''
})

// 查询客户（带分页参数）
const searchCustomer = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...queryForm.value
    }
    const res = await axios.get('/admin/customer/page', { params })
    customers.value = res.content || []
    total.value = res.totalElements || 0
  } catch {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  searchCustomer()
})

const resetQuery = () => {
  queryForm.value = { id: '', name: '', phone: '' }
  currentPage.value = 1
  searchCustomer()
}

const handlePageChange = (page) => {
  currentPage.value = page
  searchCustomer()
}
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  searchCustomer()
}

const addCustomer = async () => {
  try {
    loading.value = true
    await axios.post('/admin/customer', form.value)
    ElMessage.success('客户新增成功')
    showAddDialog.value = false
    searchCustomer()
    form.value = { name: '', gender: '', idNumber: '', birthday: '', address: '', phone: '', email: '' }
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

const updateCustomer = async () => {
  try {
    loading.value = true
    await axios.put(`/admin/customer/${editForm.value.id}`, editForm.value)
    ElMessage.success('客户修改成功')
    showEditDialog.value = false
    searchCustomer()
  } catch (e) {
    ElMessage.error('修改失败')
  } finally {
    loading.value = false
  }
}

const delCustomer = async (id) => {
  ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    loading.value = true
    await axios.delete(`/admin/customer/${id}`)
    ElMessage.success('删除成功')
    searchCustomer()
    loading.value = false
  }).catch(() => {})
}

// 退出方法
const logout = () => {
  window.location.href = '/admin'
}
</script>

<style scoped>
.admin-customer-page {
  max-width: 980px;
  margin: 32px auto;
}
.customer-card {
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e3eafc;
}
.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
}
.customer-title {
  font-size: 1.36rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.2px;
}
.customer-query-row {
  margin-bottom: 18px;
  margin-top: 5px;
}
.customer-query-form {
  background: #f8fcff;
  border-radius: 11px;
  padding: 16px 18px 8px 18px;
  box-shadow: 0 2px 10px #e3eafc;
}
.query-btns .el-form-item {
  display: flex;
  gap: 10px;
}
.add-customer-btn-row {
  margin-top: 10px;
  text-align: right;
}
.logout-btn {
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
.logout-btn:hover svg path {
  stroke: #1976d2;
}
@media (max-width: 900px) {
  .customer-card { padding: 16px 2vw 12px 2vw; }
  .customer-header { flex-direction: column; gap: 12px;}
  .customer-title { font-size: 1.2rem;}
  .customer-query-row { margin-bottom: 10px; }
}
</style>