<template>
  <div class="comment-item">
    <div class="comment-main">
      <div class="comment-info-row">
        <span class="comment-user">
          {{ comment.userName ? comment.userName : `用户${comment.userId}` }}
        </span>
        <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
      </div>
      <div class="comment-content">{{ comment.comment }}</div>
      <div class="comment-actions">
        <el-button
            type="info"
            link
            size="small"
            v-if="canDelete"
            @click="handleDelete"
        >删除</el-button>
        <el-button
            type="primary"
            link
            size="small"
            @click="toggleReply"
        >回复</el-button>
        <el-button
            :type="hasLiked ? 'danger' : 'primary'"
            link
            size="small"
            @click="handleLike"
        >
          👍 {{ likeCount }}
        </el-button>
      </div>
      <!-- 回复框 -->
      <div v-if="showReplyBox" class="reply-box">
        <el-input
            v-model="replyText"
            size="small"
            placeholder="回复内容"
            @keyup.enter="submitReply"
            class="reply-input"
        />
        <el-button type="primary" size="small" @click="submitReply">发送</el-button>
        <el-button size="small" @click="toggleReply" style="margin-left:4px">取消</el-button>
      </div>
    </div>
    <!-- 子评论展示 -->
    <div class="child-comments" v-if="childReplies.length">
      <CommentItem
          v-for="item in childReplies"
          :key="item.id"
          :comment="item"
          :notification-id="notificationId"
          :current-user-id="currentUserId"
          @deleted="refreshReplies"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  deleteNotificationComment,
  getCommentReplies,
  postNotificationComment,
  likeComment,
  unlikeComment,
  getCommentLikeCount,
  hasUserLikedComment,
} from '@/api/notification'

const props = defineProps({
  comment: Object,
  notificationId: Number,
  currentUserId: Number,
})

const emits = defineEmits(['deleted'])
const replies = ref([])
const showReplyBox = ref(false)
const replyText = ref('')
const likeCount = ref(0)
const hasLiked = ref(false)

const canDelete = computed(() => props.currentUserId === props.comment.userId)

// 只展示未被删除的子评论
const childReplies = computed(() =>
    replies.value.filter(c => c.deleted !== 1)
)

const fetchReplies = async () => {
  const res = await getCommentReplies(props.comment.id)
  replies.value = Array.isArray(res) ? res : [] // 只用res，不用res.data
}
const refreshReplies = () => {
  fetchReplies()
}

const fetchLikeStatus = async () => {
  const res1 = await getCommentLikeCount(props.comment.id)
  likeCount.value = res1 ?? 0 // 只用res，不用res.data
  const res2 = await hasUserLikedComment(props.comment.id)
  hasLiked.value = !!res2 // 只用res，不用res.data
}

const handleDelete = async () => {
  await deleteNotificationComment(props.comment.id)
  emits('deleted')
}
const toggleReply = () => {
  showReplyBox.value = !showReplyBox.value
  replyText.value = ''
}
const submitReply = async () => {
  if (!replyText.value.trim()) return
  await postNotificationComment(props.notificationId, replyText.value, props.comment.id)
  replyText.value = ''
  showReplyBox.value = false
  fetchReplies()
}
const handleLike = async () => {
  if (!hasLiked.value) {
    await likeComment(props.comment.id)
  } else {
    await unlikeComment(props.comment.id)
  }
  fetchLikeStatus()
}

function formatDate(val) {
  return val ? new Date(val).toLocaleString() : ''
}

onMounted(() => {
  fetchReplies()
  fetchLikeStatus()
})
</script>

<style scoped>
.comment-item {
  padding: 0;
  margin-top: 12px;
  margin-bottom: 0;
  margin-left: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
  font-size: 15px;
}
.comment-main {
  background: #fbfdff;
  border-radius: 12px;
  box-shadow: 0 1px 10px rgba(21,88,160,0.07);
  padding: 20px 32px 20px 20px;
  margin-bottom: 7px;
  border-left: 3px solid #1558a0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 650px;
}
.comment-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.comment-user {
  color: #1558a0;
  font-weight: bold;
  font-size: 1.09rem;
  margin-right: 15px;
  letter-spacing: 1px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.comment-date {
  color: #8a96a9;
  font-size: 0.97rem;
  font-weight: 400;
}
.comment-content {
  color: #23333b;
  font-size: 1.18rem;
  margin-bottom: 12px;
  line-height: 1.7;
  font-family: 'Lato', 'PingFang SC', 'Microsoft YaHei', Arial, Helvetica, sans-serif;
  word-break: break-word;
}
.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 1px;
  margin-left: -4px;
}
.reply-box {
  display: flex;
  align-items: center;
  margin-top: 12px;
  gap: 8px;
}
.reply-input {
  width: 240px;
}
.child-comments {
  margin-left: 38px;
  border-left: 2.2px solid #1558a022;
  padding-left: 10px;
  margin-top: 0;
}
@media (max-width: 900px) {
  .comment-main {
    padding: 10px 6px 10px 8px;
    max-width: 97vw;
  }
  .comment-content {
    font-size: 1rem;
  }
  .child-comments {
    margin-left: 18px;
    padding-left: 2px;
  }
}
</style>