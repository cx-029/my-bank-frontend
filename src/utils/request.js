import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: '/api',   // 用的是你的代理
    timeout: 10000
})

// 这里可选：保留 token 拦截器（也可只写 main.js 里一次）
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = 'Bearer ' + token
        return config
    },
    error => Promise.reject(error)
)

// 可选：全局统一错误处理
request.interceptors.response.use(
    response => response,
    error => {
        ElMessage.error(error.response?.data?.message || '请求失败')
        return Promise.reject(error)
    }
)

export default request