import { createRouter, createWebHistory } from 'vue-router';
// 컴포넌트 경로 수정
import Dashboard from './views/Dashboard.vue'; 
import Login from './views/Login.vue';
import SignupRequest from './views/SignupRequest.vue';
// import Permissions from './views/Permissions.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup-request', name: 'SignupRequest', component: SignupRequest },
  // { path: '/permissions', name: 'Permissions', component: Permissions },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user-token');
  // 로그인 페이지로 가려는 경우가 아니고, 토큰이 없으면 로그인 페이지로 리다이렉트
  const publicPages = ['Login', 'SignupRequest'];
  const authRequired = !publicPages.includes(to.name);
  
  if (authRequired && !token) {
    return next({ name: 'Login' });
  }
  next();
});

export default router;