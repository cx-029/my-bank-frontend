<template>
  <el-card class="admin-product-card" shadow="hover">
    <div class="title-row" style="display:flex;justify-content:space-between;align-items:center">
      <span class="main-title">理财产品管理</span>
      <el-button type="primary" @click="openEditDialog()">新增产品</el-button>
    </div>
    <el-table :data="products" style="width: 100%" border>
      <el-table-column prop="name" label="产品名称"/>
      <el-table-column prop="type" label="类型"/>
      <el-table-column prop="riskLevel" label="风险"/>
      <el-table-column prop="interestRate" label="年化收益率">
        <template #default="scope">
          <span>{{ (scope.row.interestRate * 100).toFixed(2) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="minAmount" label="起购金额"/>
      <el-table-column prop="status" label="状态"/>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteProduct(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editForm.id ? '编辑产品' : '新增产品'" width="400px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="名称"><el-input v-model="editForm.name"/></el-form-item>
        <el-form-item label="类型"><el-input v-model="editForm.type"/></el-form-item>
        <el-form-item label="风险"><el-select v-model="editForm.riskLevel" style="width:100%">
          <el-option label="低" value="低"/>
          <el-option label="中" value="中"/>
          <el-option label="高" value="高"/>
        </el-select></el-form-item>
        <el-form-item label="年化收益率"><el-input-number v-model="editForm.interestRate" :min="0" :max="1" :step="0.001" style="width: 90%"/></el-form-item>
        <el-form-item label="起购金额"><el-input-number v-model="editForm.minAmount" :min="1" style="width: 90%"/></el-form-item>
        <el-form-item label="状态"><el-select v-model="editForm.status" style="width:100%">
          <el-option label="上架" value="上架"/>
          <el-option label="下架" value="下架"/>
        </el-select></el-form-item>
        <el-form-item label="描述"><el-input v-model="editForm.description" type="textarea"/></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveProduct" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const products = ref([])
const editDialogVisible = ref(false)
const editForm = ref({})
const saveLoading = ref(false)

const loadProducts = async () => {
  products.value = await request.get('/wealth/product/list')
}
onMounted(loadProducts)

const openEditDialog = (row = {}) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

const saveProduct = async () => {
  saveLoading.value = true
  try {
    if (editForm.value.id) {
      await request.put(`/wealth/product/${editForm.value.id}`, editForm.value)
      ElMessage.success('修改成功')
    } else {
      await request.post('/wealth/product/add', editForm.value)
      ElMessage.success('新增成功')
    }
    editDialogVisible.value = false
    loadProducts()
  } catch (e) {}
  saveLoading.value = false
}

const deleteProduct = async id => {
  await request.delete(`/wealth/product/${id}`)
  ElMessage.success('删除成功')
  loadProducts()
}
</script>

<style scoped>
.admin-product-card {
  max-width: 900px;
  margin: 38px auto;
  border-radius: 18px;
  box-shadow: 0 4px 28px rgba(25,118,210,0.08);
}
.title-row {
  margin-bottom: 20px;
}
.main-title {
  font-size: 1.44rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.5px;
}
</style>