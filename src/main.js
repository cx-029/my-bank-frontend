import router from './router'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import axios from 'axios'
import { formatMoney } from '@/utils/format' // 这一行：导入你的格式化函数

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = 'Bearer ' + token
    }
    return config
})

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.config.globalProperties.$formatMoney = formatMoney  // 这一行：全局挂载
app.mount('#app')