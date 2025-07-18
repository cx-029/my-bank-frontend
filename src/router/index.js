import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Register from '@/views/Register.vue'
import Admin from '../views/Admin.vue'
import Profile from "@/views/Profile.vue"
import Account from "../views/Account.vue"
import Deposit from "../views/Deposit.vue"
import Loss from "../views/Loss.vue"
import AdminProfile from "@/views/AdminProfile.vue"

const routes = [
    { path: '/register', component: Register },
    { path: '/login', component: Login },
    { path: '/home', name: 'Home', component: Home },
    { path: '/admin', component: Admin },
    { path: '/profile', component: Profile },
    { path: '/account', component: Account },
    { path: '/', redirect: '/login' },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
    { path: '/deposit', component: Deposit },
    { path: '/admin/profile', component: AdminProfile },
    { path: '/loss', component: Loss },
    {
        path: '/admin/notifications',
        component: () => import('@/views/AdminNotificationList.vue')
    },
    {
        path: '/admin/notification-comments',
        component: () => import('@/views/AdminNotificationCommentList.vue')
    },
    {
        path: '/admin/loss',
        component: () => import('@/views/AdminLoss.vue'), // 新建页面
    },
    {
        path: '/admin/deposit', // 存取管理页面路由
        component: () => import('@/views/AdminDeposit.vue'),
    },
    {
        path: '/admin/account',
        component: () => import('@/views/AdminAccount.vue'),
    },
    {
        path: '/admin/customer',
        component: () => import('@/views/AdminCustomer.vue'),
    },
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

router.beforeEach((to, from, next) => {
    const publicPages = ['/login', '/register']
    const authRequired = !publicPages.includes(to.path)
    const token = localStorage.getItem('token')

    if (authRequired && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router