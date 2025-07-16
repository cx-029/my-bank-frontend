<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getNotificationDetail,
  getNotificationComments,
  postNotificationComment,
  getNotificationLikes,
  likeNotification,
  hasUserLiked
} from '@/api/notification'

// 不再需要 userId
// const userId = Number(localStorage.getItem('userId') || 1)

const route = useRoute()
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
  await likeNotification(route.params.id)
  fetchLikes()
  liked.value = true
}
const submitComment = async () => {
  if (!comment.value.trim()) return
  await postNotificationComment(route.params.id, comment.value)
  comment.value = ''
  fetchComments()
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

<template>
  <el-card v-if="notification">
    <h2>{{ notification.title }}</h2>
    <p>
      <el-tag>{{ notification.author }}</el-tag>
      <span style="margin-left: 10px;">{{ formatDate(notification.createdAt) }}</span>
    </p>
    <el-image v-if="notification.imageUrl" :src="notification.imageUrl" style="max-width: 300px;"/>
    <div style="margin: 20px 0;">{{ notification.content }}</div>
    <div>
      <el-button
          :disabled="liked"
          type="primary"
          @click="handleLike"
          size="small"
      >👍 点赞 {{ likeCount }}</el-button>
    </div>
    <el-divider/>
    <h3>评论</h3>
    <el-form @submit.prevent="submitComment" inline>
      <el-form-item>
        <el-input v-model="comment" placeholder="请输入评论内容"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitComment">评论</el-button>
      </el-form-item>
    </el-form>
    <el-list v-if="comments.length">
      <el-list-item v-for="item in comments" :key="item.id">
        <strong>用户{{ item.userId }}</strong>：{{ item.comment }}
        <span style="color:#999; margin-left: 10px;">{{ formatDate(item.createdAt) }}</span>
      </el-list-item>
    </el-list>
    <el-empty v-else description="暂无评论"/>
  </el-card>
</template>