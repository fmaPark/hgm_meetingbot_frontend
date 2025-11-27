<template>
  <div class="signup-container">
    <div class="signup-box card">
      <header>
        <i data-feather="user-plus"></i>
        <h1>가입 요청</h1>
      </header>
      <form @submit.prevent="handleSignupRequest">
        <p class="description">
          사용할 사용자 이름과 비밀번호를 입력하세요.<br>
          관리자 승인 후 계정이 활성화됩니다.
        </p>
        <div class="form-group">
          <label for="username">사용자 이름</label>
          <input id="username" v-model="username" type="text" placeholder="원하는 사용자 이름" required>
        </div>
        <div class="form-group">
          <label for="email">이메일</label>
          <input id="email" v-model="email" type="email" placeholder="이메일 주소" required>
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input id="password" v-model="password" type="password" placeholder="비밀번호" required>
        </div>
        <div class="form-group">
          <label for="password-confirm">비밀번호 확인</label>
          <input id="password-confirm" v-model="passwordConfirm" type="password" placeholder="비밀번호 다시 입력" required>
        </div>
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="!isLoading">가입 요청 보내기</span>
          <span v-else class="loader"></span>
        </button>
      </form>
      <div class="extra-links">
        <router-link to="/login">이미 계정이 있으신가요? 로그인</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api.js'; // 경로 확인

const username = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const isLoading = ref(false);
const router = useRouter();

onMounted(() => {
  nextTick(() => {
    // @ts-ignore
    if(window.feather) feather.replace();
  });
});

async function handleSignupRequest() {
  if (password.value !== passwordConfirm.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }
  if (password.value.length < 8) {
    alert("비밀번호는 8자 이상이어야 합니다.");
    return;
  }

  isLoading.value = true;
  try {
    const response = await api.createSignupRequest({
      username: username.value,
      email: email.value,
      password: password.value,
    });
    alert("가입 요청이 성공적으로 전송되었습니다. 관리자 승인을 기다려주세요.");
    router.push('/login'); // 요청 성공 후 로그인 페이지로 이동
  } catch (error) {
    // <<-- 에러 메시지를 더 구체적으로 표시 -->>
    if (error.response && error.response.data && error.response.data.detail) {
      // 백엔드에서 보낸 detail 메시지를 사용
      alert(error.response.data.detail);
    } else {
      // 네트워크 에러 등
      alert("가입 요청에 실패했습니다. 서버에 문제가 있을 수 있습니다.");
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Login.vue와 거의 동일한 스타일을 사용합니다. */
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-color, #f4f7f9);
  font-family: var(--font-family, sans-serif);
}

.signup-box {
  width: 100%;
  max-width: 420px;
  background-color: var(--card-bg-color, white);
  padding: 2.5rem;
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow, 0 4px 6px rgba(0,0,0,0.05));
}

.signup-box header {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-color, #333);
}

.signup-box header i {
  width: 32px;
  height: 32px;
  color: var(--text-color-light, #777);
  margin-bottom: 0.5rem;
}

.signup-box h1 {
  font-size: 1.8rem;
  margin: 0;
}

.description {
  text-align: center;
  color: var(--text-color-light, #777);
  margin-bottom: 2rem;
  line-height: 1.5;
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

.signup-box input[type="text"],
.signup-box input[type="email"],
.signup-box input[type="password"],
.signup-box button {
  width: 100%;
  box-sizing: border-box;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
}

.signup-box input[type="text"],
.signup-box input[type="email"],
.signup-box input[type="password"] {
  border: 1px solid var(--border-color, #dee2e6);
}

.signup-box input:focus {
  outline: none;
  border-color: var(--primary-color, #3498db);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.signup-box button {
  border: none;
  background-color: var(--primary-color, #3498db);
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.signup-box button:hover:not(:disabled) {
  background-color: var(--primary-color-dark, #2980b9);
}

.extra-links {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9em;
}

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
</style>