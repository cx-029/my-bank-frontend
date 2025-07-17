import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Register from '@/views/Register.vue'
import Admin from '../views/Admin.vue'
import Profile from "@/views/Profile.vue"
import Account from "../views/Account.vue"
import Deposit from "../views/Deposit.vue"
import Loss from "../views/Loss.vue"
import AdminProfile from "@/views/AdminProfile.vue";

const routes = [
    { path: '/register', component: Register },
    { path: '/login', component: Login },
    { path: '/home', name: 'Home', component: Home }, // ★ 增加了name属性
    { path: '/admin', component: Admin },
    { path: '/profile', component: Profile },
    { path: '/account', component: Account }, // 账户管理页面路由
    { path: '/', redirect: '/login' },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
    { path: '/deposit', component: Deposit },
    { path: '/admin/profile', component: AdminProfile },
    { path: '/loss', component: Loss },
    {
        path: '/notifications',
        name: 'NotificationList',
        component: () => import('@/views/NotificationList.vue')
    },
    {
        path: '/notifications/:id',
        name: 'NotificationDetail',
        component: () => import('@/views/NotificationDetail.vue'),
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// ★★★ 路由守卫：未登录强制跳转到 /login ★★★
router.beforeEach((to, from, next) => {
    // 允许无token访问的页面
    const publicPages = ['/login', '/register']
    const authRequired = !publicPages.includes(to.path)
    const token = localStorage.getItem('token')

    if (authRequired && !token) {
        // 未登录，去主页面会自动跳到login
        next('/login')
    } else {
        // 登录了或在公共页面，正常访问
        next()
    }
})

export default router