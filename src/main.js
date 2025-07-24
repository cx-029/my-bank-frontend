import router from './router'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import axios from 'axios'
import * as Icons from '@element-plus/icons-vue'
import { formatMoney } from '@/utils/format' // 格式化函数

// 配置 Axios 请求拦截器
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = 'Bearer ' + token
    }
    return config
})

// 创建 Vue 应用实例
const app = createApp(App)

// 注册路由和 ElementPlus 插件
app.use(router)
app.use(ElementPlus)

// 全局挂载格式化函数
app.config.globalProperties.$formatMoney = formatMoney

// 全局注册 Element Plus 图标组件
for (const [key, component] of Object.entries(Icons)) {
    app.component(key, component)
}

// 挂载应用到 DOM
app.mount('#app')