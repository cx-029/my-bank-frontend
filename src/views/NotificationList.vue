<template>
  <el-card>
    <el-table :data="notifications" style="width: 100%">
      <el-table-column prop="imageUrl" label="图片" width="120">
        <template #default="{ row }">
          <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width:60px;height:60px;" fit="cover"/>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题"/>
      <el-table-column prop="createdAt" label="日期" :formatter="formatDate"/>
      <el-table-column prop="author" label="发表人"/>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="mini" @click="goDetail(row.id)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNotifications } from '@/api/notification'
import { useRouter } from 'vue-router'

const notifications = ref([])
const router = useRouter()

const goDetail = (id) => {
  router.push({ name: 'NotificationDetail', params: { id } })
}

function formatDate(row, column, cellValue) {
  return cellValue ? new Date(cellValue).toLocaleString() : ''
}

onMounted(async () => {
  const res = await getNotifications()
  notifications.value = res.data
})
</script>