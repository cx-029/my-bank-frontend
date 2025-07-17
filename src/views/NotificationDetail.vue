<template>
  <el-card class="notification-detail-card">
    <el-tooltip content="返回公告列表" placement="left">
      <button class="close-btn" @click="closeDetail" aria-label="返回公告列表">
        <svg viewBox="0 0 20 20" class="close-icon" aria-hidden="true">
          <line x1="5" y1="5" x2="15" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="15" y1="5" x2="5" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>
    </el-tooltip>
    <div class="notification-layout">
      <!-- 左侧：通知内容 -->
      <div class="notification-left">
        <div class="header">
          <h2 class="detail-title">{{ notification?.title }}</h2>
          <div class="meta">
            <el-tag class="author">{{ notification?.author }}</el-tag>
            <span class="date">{{ formatDate(notification?.createdAt) }}</span>
          </div>
        </div>
        <el-image
            v-if="notification?.imageUrl"
            :src="notification.imageUrl"
            class="detail-image"
            fit="cover"
        />
        <div class="detail-content">{{ notification?.content }}</div>
        <div class="like-row">
          <el-button
              :type="liked ? 'danger' : 'primary'"
              @click="handleLike"
              size="large"
              class="like-btn"
          >
            <span v-if="liked">已点赞（取消） {{ likeCount }}</span>
            <span v-else>👍 点赞 {{ likeCount }}</span>
          </el-button>
        </div>
      </div>
      <!-- 右侧：评论区 -->
      <div class="notification-right">
        <h3 class="comment-title">评论区</h3>
        <el-form class="comment-form" @submit.prevent="submitComment" inline>
          <el-form-item class="comment-input-item">
            <el-input v-model="comment" placeholder="请输入评论内容" size="large" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitComment" size="large">评论</el-button>
          </el-form-item>
        </el-form>
        <div class="comment-list-outer">
          <div v-if="pagedComments.length" class="comment-list">
            <CommentItem
                v-for="item in pagedComments"
                :key="item.id"
                :comment="item"
                :notification-id="notification?.id"
                :current-user-id="currentUserId"
                @deleted="fetchComments"
            />
          </div>
          <el-empty v-else description="暂无评论" />
        </div>
        <el-pagination
            v-if="comments.length > pageSize"
            background
            layout="prev, pager, next"
            :total="comments.length"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
            class="comment-pagination"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getNotificationDetail,
  getNotificationComments,
  postNotificationComment,
  getNotificationLikes,
  likeNotification,
  unlikeNotification,
  hasUserLiked,
} from '@/api/notification'
import { getMe } from '@/api/user'
import CommentItem from './CommentItem.vue'

const route = useRoute()
const router = useRouter()
const notification = ref(null)
const comments = ref([])
const likeCount = ref(0)
const liked = ref(false)
const comment = ref('')
const currentUserId = ref(null)
const pageSize = 4
const currentPage = ref(1)

const closeDetail = () => {
  router.push({ name: 'NotificationList' });
}

const pagedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return comments.value.slice(start, start + pageSize)
})

const fetchDetail = async () => {
  const res = await getNotificationDetail(route.params.id)
  notification.value = res.data
}
const fetchComments = async () => {
  const res = await getNotificationComments(route.params.id)
  comments.value = res.data
}
const fetchLikes = async () => {
  const res = await getNotificationLikes(route.params.id)
  likeCount.value = res.data
}
const checkLiked = async () => {
  const res = await hasUserLiked(route.params.id)
  liked.value = res.data
}
const fetchUserInfo = async () => {
  const res = await getMe()
  currentUserId.value = res.data?.id || null
}
const handleLike = async () => {
  if (!liked.value) {
    await likeNotification(route.params.id)
  } else {
    await unlikeNotification(route.params.id)
  }
  fetchLikes()
  checkLiked()
}
const submitComment = async () => {
  if (!comment.value.trim()) return
  await postNotificationComment(route.params.id, comment.value)
  comment.value = ''
  fetchComments()
}
const handlePageChange = (page) => {
  currentPage.value = page
}
function formatDate(val) {
  return val ? new Date(val).toLocaleString() : ''
}

onMounted(() => {
  fetchDetail()
  fetchComments()
  fetchLikes()
  checkLiked()
  fetchUserInfo()
})
</script>

<style scoped>
.notification-detail-card {
  max-width: 1100px;
  margin: 38px auto 0 auto;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(40,80,160,0.09);
  background: #f7faff;
  position: relative;
  display: flex;
  flex-direction: column;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
  padding: 0;
}
.close-btn {
  position: absolute;
  top: 20px;
  right: 28px;
  z-index: 10;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  border-radius: 50%;
  background: linear-gradient(135deg,#1558a0 0%,#65b3fe 100%);
  box-shadow: 0 2px 12px rgba(33,100,220,0.13);
  transition: background 0.25s, box-shadow 0.22s, transform 0.18s;
  cursor: pointer;
  padding: 0;
}
.close-btn:hover {
  background: linear-gradient(135deg,#1565c0 0%,#47a3f3 100%);
  box-shadow: 0 6px 18px rgba(33,100,220,0.18);
  transform: scale(1.09) rotate(-8deg);
}
.close-btn:active {
  transform: scale(0.92) rotate(-8deg);
  box-shadow: 0 1px 4px #1565c0a0;
}
.close-icon {
  width: 26px;
  height: 26px;
  display: block;
}
.notification-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  min-height: 520px;
}
.notification-left {
  flex: 1.1;
  padding: 44px 38px 30px 44px;
  border-right: 2px solid #e2e8f0;
  min-width: 380px;
  background: #fbfdff;
  display: flex;
  flex-direction: column;
}
.notification-right {
  flex: 1;
  padding: 32px 30px 22px 34px;
  background: #f7faff;
  min-width: 380px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
}
.detail-title {
  font-size: 2.1rem;
  font-weight: 700;
  color: #133b66;
  margin-bottom: 11px;
  letter-spacing: 0.5px;
  line-height: 1.12;
}
.meta {
  display: flex;
  align-items: center;
  gap: 16px;
}
.author {
  font-size: 1.03rem;
  background: #e3eafc;
  color: #1558a0;
  border: none;
  padding: 4px 15px;
  letter-spacing: 1px;
  border-radius: 16px;
}
.date {
  color: #888;
  font-size: 0.97rem;
  font-family: 'Menlo', 'Consolas', monospace;
}
.detail-image {
  margin: 16px 0 28px 0;
  border-radius: 12px;
  max-width: 100%;
  max-height: 260px;
  box-shadow: 0 2px 12px rgba(22,101,216,0.08);
  background: #fff;
}
.detail-content {
  font-size: 1.18rem;
  color: #23333b;
  margin-bottom: 30px;
  line-height: 2.0;
  letter-spacing: 0.25px;
  background: #f4f7fa;
  border-radius: 8px;
  padding: 18px 19px 18px 20px;
}
.like-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.like-btn {
  font-size: 1.09rem;
  font-weight: 600;
  padding: 8px 26px;
  border-radius: 24px;
  background: linear-gradient(90deg, #1558a0 0%, #1565c0 100%);
  border: none;
  color: #fff;
  letter-spacing: 1px;
  transition: background 0.2s;
}
.like-btn:disabled {
  background: #bdbdbd;
}
.comment-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1558a0;
  margin-bottom: 13px;
  margin-top: 0px;
  letter-spacing: 0.5px;
}
.comment-form {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14px;
}
.comment-input-item {
  flex: 1;
}
.comment-list-outer {
  min-height: 0;
  max-height: 420px;
  overflow-y: auto;
  margin-bottom: 0;
  background: #f9fbfd;
  border-radius: 8px;
  padding: 7px 7px 7px 3px;
  box-shadow: 0 1px 4px rgba(22,101,216,0.07);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.comment-list {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.comment-pagination {
  margin-top: 12px;
  align-self: flex-end;
}
@media (max-width: 900px) {
  .notification-detail-card {
    max-width: 99vw;
    padding: 0;
  }
  .notification-layout {
    flex-direction: column;
    min-height: 420px;
  }
  .notification-left {
    padding: 12px 8px 18px 14px;
    border-right: none;
    border-bottom: 1.5px solid #e2e8f0;
    min-width: 0;
  }
  .notification-right {
    padding: 16px 9px 13px 9px;
    min-width: 0;
  }
  .comment-list-outer {
    max-height: 180px;
    padding: 3px 2px 2px 2px;
  }
}
</style>