import axios from 'axios'

// 获取当前用户个人信息
export function getProfile() {
    return axios.get('/api/profile')
}

// 修改当前用户个人信息
export function updateProfile(data) {
    return axios.put('/api/profile', data)
}