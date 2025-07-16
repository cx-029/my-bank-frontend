<template>
  <el-card class="notification-list-card">
    <div class="list-header">
      <h2 class="list-title">
        <el-icon style="vertical-align: middle; margin-right: 8px;">
          <i-ep-message-box />
        </el-icon>
        银行通知公告
      </h2>
      <el-tooltip content="返回首页" placement="left">
        <button class="close-btn" @click="goHome" aria-label="返回首页">
          <svg viewBox="0 0 20 20" class="close-icon" aria-hidden="true">
            <line x1="5" y1="5" x2="15" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="15" y1="5" x2="5" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </el-tooltip>
    </div>
    <!-- 查询栏 -->
    <div class="search-row">
      <el-input
          v-model="searchText"
          placeholder="请输入公告标题或内容进行查询"
          prefix-icon="el-icon-search"
          clearable
          @input="handleSearch"
          size="large"
          class="search-box"
      />
    </div>
    <!-- 支持下拉分页的表格 -->
    <div class="table-scroll-wrapper" @scroll.passive="onTableScroll">
      <el-table
          :data="displayedNotifications"
          class="notification-table"
          stripe
          border
          style="width: 100%;"
          :header-cell-style="{background:'#f3f6fa',color:'#173865',fontWeight:'bold',fontSize:'16px'}"
          :cell-style="{fontSize:'15px',color:'#22374a'}"
          height="480"
          empty-text="暂无公告"
      >
        <el-table-column prop="imageUrl" label="图片" width="110">
          <template #default="{ row }">
            <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width:60px;height:60px;border-radius:8px;" fit="cover"/>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180"/>
        <el-table-column prop="createdAt" label="日期" min-width="150" :formatter="formatDate"/>
        <el-table-column prop="author" label="发表人" min-width="100"/>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="goDetail(row.id)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 加载更多提示 -->
      <div v-if="loadingMore" class="loading-more">正在加载更多公告…</div>
      <div v-if="!hasMore && displayedNotifications.length" class="no-more">没有更多了</div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { getNotifications } from '@/api/notification'
import { useRouter } from 'vue-router'

const notifications = ref([])
const router = useRouter()
const searchText = ref('')
const pageSize = 20
const currentPage = ref(1)
const loadingMore = ref(false)
const hasMore = ref(true)

const filteredNotifications = computed(() => {
  if (!searchText.value) return notifications.value
  const text = searchText.value.toLowerCase()
  return notifications.value.filter(item =>
      (item.title && item.title.toLowerCase().includes(text)) ||
      (item.content && item.content.toLowerCase().includes(text))
  )
})
const displayedNotifications = computed(() => {
  return filteredNotifications.value.slice(0, currentPage.value * pageSize)
})

const handleSearch = () => {
  currentPage.value = 1
  hasMore.value = filteredNotifications.value.length > pageSize
}

const onTableScroll = async (e) => {
  const wrapper = e.target
  if (
      hasMore.value &&
      wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 60
  ) {
    loadingMore.value = true
    await nextTick()
    setTimeout(() => {
      currentPage.value += 1
      hasMore.value = filteredNotifications.value.length > currentPage.value * pageSize
      loadingMore.value = false
    }, 400)
  }
}

const goDetail = (id) => {
  router.push({ name: 'NotificationDetail', params: { id } })
}

// 此处请确保你的 vue-router 中有命名为 Home 的路由
const goHome = () => {
  router.push({ name: 'Home' })
}

function formatDate(row, column, cellValue) {
  return cellValue ? new Date(cellValue).toLocaleString() : ''
}

onMounted(async () => {
  const res = await getNotifications()
  notifications.value = res.data
  hasMore.value = notifications.value.length > pageSize
})
</script>

<style scoped>
.notification-list-card {
  max-width: 950px;
  margin: 50px auto 0 auto;
  padding: 32px 32px 16px 32px;
  border-radius: 22px;
  box-shadow: 0 6px 36px rgba(40,80,160,0.09);
  background: #f8fafb;
  position: relative;
  font-family: 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  min-height: 36px;
}

.list-title {
  font-size: 2.1rem;
  font-weight: 800;
  color: #15396a;
  letter-spacing: 1.5px;
  text-align: left;
  display: flex;
  align-items: center;
  margin: 0;
}
.close-btn {
  width: 42px;
  height: 42px;
  border: none;
  outline: none;
  border-radius: 50%;
  background: linear-gradient(135deg,#1976d2 0%,#65b3fe 100%);
  box-shadow: 0 2px 10px rgba(33,100,220,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  transition: background 0.22s, box-shadow 0.18s, transform 0.15s;
  cursor: pointer;
  padding: 0;
}
.close-btn:hover {
  background: linear-gradient(135deg,#1565c0 0%,#47a3f3 100%);
  box-shadow: 0 6px 18px rgba(33,100,220,0.18);
  transform: scale(1.08) rotate(-8deg);
}
.close-btn:active {
  transform: scale(0.92) rotate(-8deg);
  box-shadow: 0 1px 4px #1565c0a0;
}
.close-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.search-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.search-box {
  width: 340px;
  font-size: 17px;
}

.table-scroll-wrapper {
  max-height: 520px;
  overflow-y: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(22,70,120,0.03);
  position: relative;
  padding-bottom: 16px;
}

.notification-table {
  border-radius: 10px;
  background: #fff;
  font-size: 15px;
}
.loading-more, .no-more {
  text-align: center;
  color: #b3b8c4;
  padding: 12px 0 2px 0;
  font-size: 15px;
  letter-spacing: 1px;
}
.loading-more {
  color: #8ea3c0;
}
.no-more {
  color: #3388cc;
}

@media (max-width: 900px) {
  .notification-list-card {
    padding: 12px 2vw 4px 2vw;
  }
  .search-box {
    width: 98vw;
    min-width: 0;
    font-size: 15px;
  }
  .table-scroll-wrapper {
    max-height: 70vh;
    border-radius: 7px;
  }
  .list-title {
    font-size: 1.18rem;
  }
}
</style>