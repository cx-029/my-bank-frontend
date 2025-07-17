import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建实例
const request = axios.create({
    baseURL: '/api',   // 根据你的代理配置
    timeout: 10000
})

// 请求拦截器：自动加 token
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = 'Bearer ' + token
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器：统一错误处理
request.interceptors.response.use(
    response => response.data,   // 直接返回 data 部分，方便调用
    error => {
        const { response } = error
        if (response) {
            if (response.status === 401) {
                ElMessage.error('请先登录')
                // 可选：自动跳转登录页面
                window.location.href = '/login'
            } else if (response.status === 403) {
                ElMessage.error('没有权限！')
            } else {
                ElMessage.error(response.data?.message || '请求失败')
            }
        } else {
            ElMessage.error('网络错误，请检查连接')
        }
        return Promise.reject(error)
    }
)

export default request