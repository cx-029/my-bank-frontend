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
export function postNotificationComment(id, comment) {
    return request({
        url: `/notifications/${id}/comments`,
        method: 'post',
        data: { comment }
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