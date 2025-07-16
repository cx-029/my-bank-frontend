import axios from 'axios'
import request from '@/utils/request'

// 注册用户接口
export function registerUser(data) {
    return axios.post('/api/users/register', data)
}

// 登录用户接口
export function loginUser(data) {
    return axios.post('/api/auth/login', data)
}

// 人脸识别登录接口
export function faceLogin(data) {
    return axios.post('/api/auth/face-login', data)
}

// 获取当前登录用户信息
export function getMe() {
    return request({
        url: '/users/me',
        method: 'get'
    })
}