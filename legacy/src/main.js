import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router.js';
import api from './api.js';

const token = localStorage.getItem('user-token');

// 2. 토큰이 존재하면, axios 헤더에 먼저 설정합니다.
if (token) {
  api.setAuthHeader(token);
}

const app = createApp(App);
app.use(router);
app.mount('#app');
