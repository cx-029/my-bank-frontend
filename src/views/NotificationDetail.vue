<template>
  <el-card class="notification-detail-card" v-if="notification">
    <!-- 右上角关闭按钮（美观叉叉+气泡提示） -->
    <el-tooltip content="关闭" placement="left">
      <button class="close-btn" @click="closeDetail" aria-label="关闭">
        <svg viewBox="0 0 20 20" class="close-icon" aria-hidden="true">
          <line x1="5" y1="5" x2="15" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="15" y1="5" x2="5" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>
    </el-tooltip>
    <div class="card-inner">
      <div class="header">
        <h2 class="detail-title">{{ notification.title }}</h2>
        <div class="meta">
          <el-tag class="author">{{ notification.author }}</el-tag>
          <span class="date">{{ formatDate(notification.createdAt) }}</span>
        </div>
      </div>
      <el-image
          v-if="notification.imageUrl"
          :src="notification.imageUrl"
          class="detail-image"
          fit="cover"
      />
      <div class="detail-content">
        {{ notification.content }}
      </div>
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
      <el-divider />
      <h3 class="comment-title">评论</h3>
      <el-form class="comment-form" @submit.prevent="submitComment" inline>
        <el-form-item class="comment-input-item">
          <el-input v-model="comment" placeholder="请输入评论内容" size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitComment" size="large">
            评论
          </el-button>
        </el-form-item>
      </el-form>
      <div class="comment-list-outer">
        <div v-if="comments.length" class="comment-list">
          <div v-for="item in comments" :key="item.id" class="comment-item">
            <span class="comment-user">用户{{ item.userId }}</span>
            <span class="comment-content">{{ item.comment }}</span>
            <span class="comment-date">{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
        <el-empty v-else description="暂无评论" />
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getNotificationDetail,
  getNotificationComments,
  postNotificationComment,
  getNotificationLikes,
  likeNotification,
  unlikeNotification,
  hasUserLiked
} from '@/api/notification'

const route = useRoute()
const router = useRouter()
const notification = ref(null)
const comments = ref([])
const likeCount = ref(0)
const liked = ref(false)
const comment = ref('')

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
const closeDetail = () => {
  router.push({ name: 'NotificationList' })
}

function formatDate(val) {
  return val ? new Date(val).toLocaleString() : ''
}

onMounted(() => {
  fetchDetail()
  fetchComments()
  fetchLikes()
  checkLiked()
})
</script>

<style scoped>
.notification-detail-card {
  max-width: 740px;
  margin: 48px auto 0 auto;
  max-height: 92vh;
  overflow: auto;
  padding: 32px 40px 20px 40px;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(40,80,160,0.11);
  font-family: 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
  background: #f7faff;
  position: relative;
  display: flex;
  flex-direction: column;
}

.card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.close-btn {
  position: absolute;
  top: 22px;
  right: 22px;
  z-index: 10;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5f5f 0%, #fbc02d 100%);
  box-shadow: 0 2px 12px rgba(229,57,53,0.13);
  transition: background 0.25s, box-shadow 0.22s, transform 0.18s;
  cursor: pointer;
  padding: 0;
}
.close-btn:hover {
  background: linear-gradient(135deg, #fbc02d 0%, #ff5f5f 100%);
  box-shadow: 0 6px 18px rgba(229,57,53,0.18);
  transform: scale(1.09) rotate(-8deg);
}

.close-icon {
  width: 28px;
  height: 28px;
  display: block;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 18px;
}
.detail-title {
  font-size: 2.3rem;
  font-weight: 800;
  color: #133b66;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  line-height: 1.15;
  font-family: 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
}
.meta {
  display: flex;
  align-items: center;
  gap: 18px;
}
.author {
  font-size: 1.03rem;
  background: #e3eafc;
  color: #1565c0;
  border: none;
  padding: 4px 17px;
  letter-spacing: 1px;
  border-radius: 16px;
  font-family: inherit;
}
.date {
  color: #888;
  font-size: 1rem;
  font-family: 'Menlo', 'Consolas', monospace;
}

.detail-image {
  margin: 22px 0 32px 0;
  border-radius: 12px;
  max-width: 100%;
  max-height: 320px;
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
  font-family: 'Lato', 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
}

.like-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 18px;
}
.like-btn {
  font-size: 1.09rem;
  font-weight: 600;
  padding: 8px 26px;
  border-radius: 24px;
  background: linear-gradient(90deg, #1976d2 0%, #1565c0 100%);
  border: none;
  color: #fff;
  letter-spacing: 1px;
  transition: background 0.2s;
}
.like-btn:disabled {
  background: #bdbdbd;
}

.comment-title {
  font-size: 1.27rem;
  font-weight: 700;
  color: #2e3c4d;
  margin-bottom: 10px;
  margin-top: 12px;
  letter-spacing: 0.5px;
  font-family: 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
}
.comment-form {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18px;
}
.comment-input-item {
  flex: 1;
}
.comment-list-outer {
  max-height: 240px;
  overflow-y: auto;
  margin-bottom: 8px;
  background: #f9fbfd;
  border-radius: 8px;
  padding-bottom: 2px;
}
.comment-list {
  margin-top: 8px;
}
.comment-item {
  display: flex;
  align-items: center;
  padding: 13px 0 13px 0;
  border-bottom: 1px solid #ecf0f3;
  font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
}
.comment-user {
  color: #1565c0;
  font-weight: 600;
  margin-right: 14px;
}
.comment-content {
  color: #222;
  margin-right: 18px;
  font-size: 1.11rem;
  font-family: 'Lato', 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
}
.comment-date {
  color: #999;
  font-size: 0.97rem;
  margin-left: auto;
}

@media (max-width: 900px) {
  .notification-detail-card {
    padding: 12px 2vw;
    max-height: 97vh;
  }
  .detail-title {
    font-size: 1.35rem;
  }
  .detail-content {
    font-size: 1rem;
    padding: 10px 8px 10px 10px;
  }
  .close-btn {
    width: 38px;
    height: 38px;
    top: 10px;
    right: 10px;
  }
  .close-icon {
    width: 20px;
    height: 20px;
  }
}
</style>