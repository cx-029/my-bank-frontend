import axios from 'axios'

// 获取管理员个人信息
export function getAdminProfile() {
    return axios.get('/api/admin/profile', {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        }
    })
}

// 修改管理员个人信息
export function updateAdminProfile(data) {
    return axios.put('/api/admin/profile', data, {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        }
    })
}