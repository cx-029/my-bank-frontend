import request from '@/utils/request'

// 获取通知列表
export function getNotifications() {
    return request({
        url: '/notifications',
        method: 'get'
    })
}

// 获取通知详情
export function getNotificationDetail(id) {
    return request({
        url: `/notifications/${id}`,
        method: 'get'
    })
}

// 获取通知评论
export function getNotificationComments(id) {
    return request({
        url: `/notifications/${id}/comments`,
        method: 'get'
    })
}

// 新增评论（只传 comment）
export function postNotificationComment(id, comment, parentId = null) {
    const data = { comment }
    if (parentId !== null) data.parentId = parentId
    return request({
        url: `/notifications/${id}/comments`,
        method: 'post',
        data
    })
}

// 获取点赞数
export function getNotificationLikes(id) {
    return request({
        url: `/notifications/${id}/likes`,
        method: 'get'
    })
}

// 点赞（不传 userId）
export function likeNotification(id) {
    return request({
        url: `/notifications/${id}/likes`,
        method: 'post'
    })
}

// 取消点赞
export function unlikeNotification(id) {
    return request({
        url: `/notifications/${id}/likes`,
        method: 'delete'
    })
}

// 查询用户是否已点赞（不传 userId，后端自动识别当前用户）
export function hasUserLiked(id) {
    return request({
        url: `/notifications/${id}/likes/me`,
        method: 'get'
    })
}

// 删除评论
export function deleteNotificationComment(commentId) {
    return request({
        url: `/notifications/comments/${commentId}`,
        method: 'delete'
    })
}

// 获取评论的回复（子评论）
export function getCommentReplies(parentId) {
    return request({
        url: `/notifications/comments/${parentId}/replies`,
        method: 'get'
    })
}

// 评论点赞
export function likeComment(commentId) {
    return request({
        url: `/notifications/comments/${commentId}/likes`,
        method: 'post'
    })
}

// 取消评论点赞
export function unlikeComment(commentId) {
    return request({
        url: `/notifications/comments/${commentId}/likes`,
        method: 'delete'
    })
}

// 查询评论点赞数
export function getCommentLikeCount(commentId) {
    return request({
        url: `/notifications/comments/${commentId}/likes`,
        method: 'get'
    })
}

// 查询用户是否已点赞评论
export function hasUserLikedComment(commentId) {
    return request({
        url: `/notifications/comments/${commentId}/likes/me`,
        method: 'get'
    })
}