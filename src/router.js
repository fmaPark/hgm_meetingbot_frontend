import { createRouter, createWebHistory } from 'vue-router';
// 컴포넌트 경로 수정
import Dashboard from './views/Dashboard.vue'; 
import Login from './views/Login.vue';
import PromptsAndKeywords from './views/PromptsAndKeywords.vue';
import LLMSettings from './views/LLMSettings.vue';
import AuthCallback from './views/AuthCallback.vue'; // 콜백 컴포넌트 임포트

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/login', name: 'Login', component: Login },
  { path: '/auth/callback', name: 'AuthCallback', component: AuthCallback }, // 콜백 라우트 추가
  { path: '/prompts-and-keywords', name: 'PromptsAndKeywords', component: PromptsAndKeywords },
  { path: '/admin/llm-settings', name: 'LLMSettings', component: LLMSettings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user-token');
  // 로그인 페이지, 가입 요청 페이지, 인증 콜백 페이지는 토큰 없이 접근 가능
  const publicPages = ['Login', 'AuthCallback'];
  const authRequired = !publicPages.includes(to.name);
  
  if (authRequired && !token) {
    // 사용자가 가려던 경로를 쿼리로 추가하여 로그인 페이지로 리디렉션
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }
  next();
});

export default router;