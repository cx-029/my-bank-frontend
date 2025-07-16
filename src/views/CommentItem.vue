<template>
  <div class="comment-item">
    <span class="comment-user">用户{{ comment.userId }}</span>
    <span class="comment-content">{{ comment.comment }}</span>
    <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
    <el-button
        type="info"
        link
        size="small"
        v-if="canDelete"
        @click="handleDelete"
        style="margin-left:10px"
    >删除</el-button>
    <el-button
        type="primary"
        link
        size="small"
        @click="toggleReply"
        style="margin-left:4px"
    >回复</el-button>
    <el-button
        :type="hasLiked ? 'danger' : 'primary'"
        link
        size="small"
        @click="handleLike"
        style="margin-left:4px"
    >
      👍 {{ likeCount }}
    </el-button>
    <!-- 回复框 -->
    <div v-if="showReplyBox" class="reply-box">
      <el-input
          v-model="replyText"
          size="small"
          placeholder="回复内容"
          @keyup.enter="submitReply"
      />
      <el-button type="primary" size="small" @click="submitReply" style="margin-left:4px">发送</el-button>
      <el-button size="small" @click="toggleReply" style="margin-left:4px">取消</el-button>
    </div>
    <!-- 子评论展示 -->
    <div class="child-comments" v-if="replies.length">
      <CommentItem
          v-for="item in replies"
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

const fetchReplies = async () => {
  const res = await getCommentReplies(props.comment.id)
  replies.value = res.data
}
const refreshReplies = () => {
  fetchReplies()
}

const fetchLikeStatus = async () => {
  const res1 = await getCommentLikeCount(props.comment.id)
  likeCount.value = res1.data
  const res2 = await hasUserLikedComment(props.comment.id)
  hasLiked.value = !!res2.data
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
  display: flex;
  align-items: center;
  padding: 13px 0 13px 0;
  border-bottom: 1px solid #ecf0f3;
  font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
  flex-direction: column;
  align-items: flex-start;
}
.child-comments {
  margin-left: 24px;
  width: 100%;
}
.reply-box {
  margin-top: 4px;
  display: flex;
  align-items: center;
}
</style>