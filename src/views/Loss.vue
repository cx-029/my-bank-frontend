<template>
  <div class="loss-container">
    <el-card class="loss-card">
      <h2>账户挂失管理</h2>
      <el-form :model="form" label-width="80px" class="loss-form" @submit.prevent>
        <el-form-item label="挂失类型">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="口头挂失" value="口头挂失"></el-option>
            <el-option label="正式挂失" value="正式挂失"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="挂失原因">
          <el-input v-model="form.reason" placeholder="请输入挂失原因" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="applying" @click="applyLoss">提交挂失申请</el-button>
        </el-form-item>
      </el-form>
      <el-divider>挂失记录</el-divider>
      <el-table :data="lossList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60"/>
        <el-table-column prop="type" label="类型" width="100"/>
        <el-table-column prop="reason" label="原因"/>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
                :type="row.status === 'APPLIED' ? 'warning' : 'success'"
                disable-transitions
            >{{ row.status === 'APPLIED' ? '已挂失' : '已解除' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180"/>
        <el-table-column prop="resolvedAt" label="解除时间" width="180">
          <template #default="{ row }">
            <span>{{ row.resolvedAt ? row.resolvedAt : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
                v-if="row.status === 'APPLIED'"
                size="small"
                type="success"
                @click="releaseLoss(row.id)"
                :loading="releasingId === row.id"
            >解除挂失</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const form = ref({ type: '', reason: '' })
const lossList = ref([])
const loading = ref(false)
const applying = ref(false)
const releasingId = ref(null)

// 页面加载时获取挂失记录
onMounted(async () => {
  await fetchLossList()
})

const fetchLossList = async () => {
  loading.value = true
  try {
    // 不需要任何参数，由后端自动推断账户身份
    const res = await axios.get('/api/account/loss/list')
    lossList.value = res.data
  } catch (e) {
    ElMessage.error('查询挂失记录失败')
  } finally {
    loading.value = false
  }
}

const applyLoss = async () => {
  if (!form.value.type || !form.value.reason) {
    ElMessage.warning('请填写挂失类型和原因')
    return
  }
  applying.value = true
  try {
    // 不需要 accountId 字段
    const res = await axios.post('/api/account/loss/apply', {
      type: form.value.type,
      reason: form.value.reason
    })
    if (res.data && res.data.includes('成功')) {
      ElMessage.success(res.data)
      form.value.type = ''
      form.value.reason = ''
      await fetchLossList()
    } else {
      ElMessage.error(res.data || '挂失申请失败')
    }
  } catch (e) {
    ElMessage.error('提交挂失申请失败')
  } finally {
    applying.value = false
  }
}

const releaseLoss = async (id) => {
  ElMessageBox.confirm('确定要解除该挂失吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    releasingId.value = id
    try {
      // 只需POST，不用带accountId
      const res = await axios.post('/api/account/loss/release')
      if (res.data && res.data.includes('成功')) {
        ElMessage.success(res.data)
        await fetchLossList()
      } else {
        ElMessage.error(res.data || '解除挂失失败')
      }
    } catch (e) {
      ElMessage.error('解除挂失失败')
    } finally {
      releasingId.value = null
    }
  }).catch(() => {})
}
</script>

<style scoped>
.loss-container {
  max-width: 700px;
  margin: 35px auto;
  padding: 24px 0;
}
.loss-card {
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(25,118,210,0.04);
  padding: 32px 32px 24px 32px;
}
.loss-form {
  margin-bottom: 18px;
  max-width: 380px;
}
</style>