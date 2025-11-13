<template>
  <div class="login-container">
    <div class="login-box card">
      <header>
        <i data-feather="lock"></i>
        <h1>관리자 로그인</h1>
      </header>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">사용자 이름</label>
          <input id="username" v-model="username" type="text" placeholder="Username" required>
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input id="password" v-model="password" type="password" placeholder="Password" required>
        </div>
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="!isLoading">로그인</span>
          <span v-else class="loader"></span>
        </button>
      </form>
      <div class="extra-links">
        <router-link to="/signup-request">가입 요청하기</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api.js'; 

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const router = useRouter();

onMounted(() => {
  nextTick(() => {
    // @ts-ignore
    if(window.feather) feather.replace();
  });
});

async function handleLogin() {
  isLoading.value = true;
  try {
    const response = await api.login(username.value, password.value);
    localStorage.setItem('user-token', response.data.access_token);
    api.setAuthHeader(response.data.access_token);
    router.push('/'); // 로그인 성공 시 대시보드로 이동
  } catch (error) {
    alert("로그인 실패: 사용자 이름 또는 비밀번호를 확인하세요.");
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* 로그인 페이지 전용 스타일 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-color, #f4f7f9);
  font-family: var(--font-family, sans-serif);
}

.login-box {
  width: 100%;
  max-width: 400px;
  background-color: var(--card-bg-color, white);
  padding: 2.5rem;
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow, 0 4px 6px rgba(0,0,0,0.05));
}

.login-box header {
  text-align: center;
  margin-bottom: 2.5rem;
  color: var(--text-color, #333);
}

.login-box header i {
  width: 32px;
  height: 32px;
  color: var(--text-color-light, #777);
  margin-bottom: 0.5rem;
}

.login-box h1 {
  font-size: 1.8rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color, #333);
}

/* <<-- 핵심 수정 부분 시작 -->> */

/* input과 button에 공통 스타일 적용 */
.login-box input[type="text"],
.login-box input[type="password"],
.login-box button {
  width: 100%; /* 너비를 100%로 설정하여 부모 요소를 꽉 채움 */
  box-sizing: border-box; /* padding과 border가 너비에 포함되도록 함 */
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
}

/* input 전용 스타일 */
.login-box input[type="text"],
.login-box input[type="password"] {
  border: 1px solid var(--border-color, #dee2e6);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.login-box input:focus {
  outline: none;
  border-color: var(--primary-color, #3498db);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

/* button 전용 스타일 */
.login-box button {
  border: none;
  margin-top: 1rem; /* 버튼 위에 추가 간격 */
  background-color: var(--primary-color, #3498db);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.login-box button:hover:not(:disabled) {
  background-color: var(--primary-color-dark, #2980b9);
}

.login-box button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* <<-- 핵심 수정 부분 끝 -->> */

/* 로더 스타일 */
.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #FFF;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.extra-links {
  text-align: center;
  margin-top: 1.5rem;
}
</style>