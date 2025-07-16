import request from '@/utils/request' // 你项目内封装的axios

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

// 新增评论
export function postNotificationComment(id, userId, comment) {
    return request({
        url: `/notifications/${id}/comments`,
        method: 'post',
        data: { userId, comment }
    })
}

// 获取点赞数
export function getNotificationLikes(id) {
    return request({
        url: `/notifications/${id}/likes`,
        method: 'get'
    })
}

// 点赞
export function likeNotification(id, userId) {
    return request({
        url: `/notifications/${id}/likes`,
        method: 'post',
        data: { userId }
    })
}

// 查询用户是否已点赞
export function hasUserLiked(id, userId) {
    return request({
        url: `/notifications/${id}/likes/${userId}`,
        method: 'get'
    })
}