<script setup>
import { ref, onMounted, nextTick } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])
const editDialogVisible = ref(false)
const editForm = ref({})
const saveLoading = ref(false)
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const tableHeight = ref(420)

const queryForm = ref({
  name: '',
  type: '',
  riskLevel: ''
})

const loadProducts = async () => {
  loading.value = true
  const params = {
    ...queryForm.value,
    page: page.value,
    size: pageSize.value
  }
  try {
    const res = await request.get('/wealth/product/list', { params })
    if (res && Array.isArray(res.content)) {
      products.value = res.content
      total.value = res.totalElements
    } else if (Array.isArray(res)) {
      products.value = res.slice((page.value-1)*pageSize.value, page.value*pageSize.value)
      total.value = res.length
    } else {
      products.value = []
      total.value = 0
    }
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
  nextTick(() => {
    tableHeight.value = Math.max(window.innerHeight * 0.45, 320)
  })
})

const searchProducts = () => {
  page.value = 1
  loadProducts()
}

const resetQuery = () => {
  queryForm.value = { name: '', type: '', riskLevel: '' }
  page.value = 1
  loadProducts()
}

const handlePageChange = (val) => {
  page.value = val
  loadProducts()
}

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
  } catch (e) {
    ElMessage.error('保存失败')
  }
  saveLoading.value = false
}

const deleteProduct = async id => {
  try {
    await request.delete(`/wealth/product/${id}`)
    ElMessage.success('删除成功')
    loadProducts()
  } catch {
    ElMessage.error('删除失败')
  }
}

// 表格高亮停用行
function rowClassName({ row }) {
  return row.status === '下架' ? 'row-offline' : ''
}

// 右上角叉叉关闭/返回
const goBack = () => {
  router.push('/admin')
}
</script>

<template>
  <div class="admin-wealth-product-page">
    <el-card class="admin-product-card" shadow="hover">
      <div class="title-row">
        <span class="main-title">理财产品管理</span>
        <el-button class="close-btn" type="text" @click="goBack" circle>
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M2 2 L14 14 M14 2 L2 14" stroke="#888" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </div>
      <div class="top-action-row">
        <el-button type="primary" @click="openEditDialog()">新增产品</el-button>
      </div>
      <!-- 查询区域 -->
      <div class="product-query-row">
        <el-form :model="queryForm" class="product-query-form" @submit.prevent>
          <el-row :gutter="18">
            <el-col :xs="24" :sm="8" :md="6">
              <el-form-item label="产品名称">
                <el-input v-model="queryForm.name" clearable placeholder="模糊查询"/>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6">
              <el-form-item label="类型">
                <el-select v-model="queryForm.type" clearable placeholder="全部">
                  <el-option label="定期" value="定期"/>
                  <el-option label="浮动" value="浮动"/>
                  <el-option label="活期" value="活期"/>
                  <el-option label="混合" value="混合"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6">
              <el-form-item label="风险">
                <el-select v-model="queryForm.riskLevel" clearable placeholder="全部">
                  <el-option label="低" value="低"/>
                  <el-option label="中" value="中"/>
                  <el-option label="高" value="高"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6" class="query-btns">
              <el-form-item>
                <el-button type="primary" @click="searchProducts">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <!-- 表格区域 -->
      <el-table
          :data="products"
          :loading="loading"
          style="width: 100%; min-height: 320px;"
          border
          class="product-table"
          :height="tableHeight"
          :header-cell-style="{background:'#f8fcff', color:'#1976d2',fontWeight:'600',fontSize:'15px'}"
          :cell-style="{fontSize:'15px'}"
          :row-class-name="rowClassName"
          stripe
      >
        <el-table-column prop="name" label="产品名称" min-width="120"/>
        <el-table-column prop="type" label="类型" min-width="80"/>
        <el-table-column prop="riskLevel" label="风险" min-width="60"/>
        <el-table-column prop="interestRate" label="年化收益率" min-width="110">
          <template #default="scope">
            <span>{{ (scope.row.interestRate * 100).toFixed(2) }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="minAmount" label="起购金额" min-width="100"/>
        <el-table-column prop="status" label="状态" min-width="70"/>
        <el-table-column label="操作" min-width="160">
          <template #default="scope">
            <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteProduct(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          layout="prev, pager, next"
          style="margin-top: 18px;text-align:right;"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editForm.id ? '编辑产品' : '新增产品'" width="400px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="名称"><el-input v-model="editForm.name"/></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editForm.type" style="width:100%" placeholder="请选择">
            <el-option label="定期" value="定期"/>
            <el-option label="浮动" value="浮动"/>
            <el-option label="活期" value="活期"/>
            <el-option label="混合" value="混合"/>
          </el-select>
        </el-form-item>
        <el-form-item label="风险">
          <el-select v-model="editForm.riskLevel" style="width:100%" placeholder="请选择">
            <el-option label="低" value="低"/>
            <el-option label="中" value="中"/>
            <el-option label="高" value="高"/>
          </el-select>
        </el-form-item>
        <el-form-item label="年化收益率">
          <el-input-number
              v-model="editForm.interestRate"
              :min="0"
              :max="0.2"
              :step="0.001"
              style="width: 90%"
              placeholder="如8.5%请输入0.085"
          />
          <span style="font-size:12px;color:#888;">如8.5%请输入0.085</span>
        </el-form-item>
        <el-form-item label="起购金额">
          <el-input-number v-model="editForm.minAmount" :min="1" style="width: 90%"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" style="width:100%" placeholder="请选择">
            <el-option label="上架" value="上架"/>
            <el-option label="下架" value="下架"/>
            <el-option label="在售" value="在售"/>
          </el-select>
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="editForm.description" type="textarea"/></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveProduct" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-wealth-product-page {
  padding: 36px;
  max-width: none;
  margin: 0;
}

.admin-product-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px #e3eafc;
  padding: 0;
  max-width: 1100px;
  margin: 38px auto;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 0 14px 0 14px;
  position: relative;
  min-height: 44px;
}

.main-title {
  font-size: 1.3em;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 1.2px;
}

.top-action-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 14px 8px 14px;
  margin-bottom: 10px;
  margin-top: 6px;
}

.product-query-row {
  margin-bottom: 15px;
  margin-top: 2px;
}

.product-query-form {
  background: #f8fcff;
  border-radius: 11px;
  padding: 16px 18px 8px 18px;
  box-shadow: 0 2px 10px #e3eafc;
}

.query-btns .el-form-item {
  display: flex;
  gap: 10px;
  margin-bottom: 0;
}

.product-table {
  border-radius: 11px;
  overflow: hidden;
}

.el-table th, .el-table td {
  font-size: 15px;
}

.el-table .el-button {
  margin-right: 6px;
}

.el-dialog__header {
  font-size: 1.07em;
  color: #1976d2;
  font-weight: 600;
  padding-bottom: 6px;
}

.el-dialog__body {
  padding-top: 16px !important;
  padding-bottom: 12px !important;
}

.el-form {
  background: #f8fcff;
  border-radius: 11px;
  padding: 18px 20px 10px 20px;
  box-shadow: 0 2px 10px #e3eafc;
}

.el-form-item {
  margin-bottom: 14px;
}

.el-dialog__footer {
  padding-top: 0;
}

.row-offline {
  background: #f8d7da !important;
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
  .admin-wealth-product-page { padding: 14px 2vw 6px 2vw; }
  .admin-product-card { padding: 0 2vw; }
  .title-row { flex-direction: column; gap: 12px;}
  .main-title { font-size: 1.2rem;}
  .top-action-row { padding: 0 0 8px 0; }
  .product-query-row { margin-bottom: 10px; }
}
</style>