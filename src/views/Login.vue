<template>
  <div class="login-container">
    <div class="login-box card">
      <header>
        <i data-feather="lock"></i>
        <h1>관리자 로그인</h1>
      </header>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div class="discord-login-section">
        <button @click="redirectToDiscord" class="btn-discord">
          <i class="fab fa-discord"></i> <!-- Font Awesome 아이콘 사용 예시 -->
          디스코드로 로그인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

// Vue composables should be called at the top level of the setup script.
const route = useRoute();
const errorMessage = ref('');

onMounted(() => {
  nextTick(() => {
    // @ts-ignore
    if(window.feather) feather.replace();
  });

  // Check for error messages from backend redirect
  if (route.query.error) {
    const error = route.query.error;
    switch (error) {
      case 'discord_token_fail':
        errorMessage.value = 'Discord 인증 토큰 획득에 실패했습니다. 다시 시도해주세요.';
        break;
      case 'no_discord_token':
        errorMessage.value = 'Discord 인증이 완료되지 않았습니다. 다시 시도해주세요.';
        break;
      case 'discord_user_fail':
        errorMessage.value = 'Discord 사용자 정보를 가져오는 데 실패했습니다.';
        break;
      case 'no_discord_id':
        errorMessage.value = 'Discord 사용자 ID를 찾을 수 없습니다.';
        break;
      case 'user_creation_fail':
        errorMessage.value = '사용자 생성 또는 업데이트에 실패했습니다.';
        break;
      case 'discord_exchange_failed':
        errorMessage.value = 'Discord 코드 교환에 실패했습니다. 다시 시도해주세요.';
        break;
      case 'no_discord_code':
        errorMessage.value = 'Discord 인증 코드를 받지 못했습니다. 다시 시도해주세요.';
        break;
      default:
        errorMessage.value = '알 수 없는 로그인 오류가 발생했습니다.';
        break;
    }
  }
});

function redirectToDiscord() {
  const redirectPath = route.query.redirect;
  
  if (redirectPath) {
    // Save the path to redirect to after successful login
    localStorage.setItem('redirectPath', redirectPath);
  }

  // Redirect to the backend's Discord login endpoint
  window.location.href = '/api/login/discord';
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
  text-align: center; /* 내부 요소들을 중앙 정렬 */
}

.login-box header {
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

.error-message {
  color: #e74c3c;
  background-color: #fdd;
  border: 1px solid #e74c3c;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 6px;
  text-align: left;
}

.discord-login-section {
  margin-bottom: 1.5rem;
}

.btn-discord {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background-color: #5865F2; /* Discord 브랜드 색상 */
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.btn-discord:hover {
  background-color: #4752C4;
}

.btn-discord .fab {
  margin-right: 0.75rem;
  font-size: 1.2em;
}

.extra-links {
  margin-top: 1.5rem;
}
</style>