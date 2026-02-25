<template>
  <div class="callback-container">
    <p>로그인 처리 중...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';

onMounted(async () => { // Make onMounted async
  const route = useRoute();
  const router = useRouter();

  // console.log('AuthCallback mounted. Full query:', route.query);

  const discordCode = route.query.code;
  const redirectPath = localStorage.getItem('redirectPath') || '/';
  // Clean up the stored path after reading
  localStorage.removeItem('redirectPath');

  // console.log('Discord Code:', discordCode);
  // console.log('Redirect Path from localStorage:', redirectPath);

  if (discordCode) {
    try {
      const response = await api.exchangeDiscordCode(discordCode);
      const { access_token, user } = response;
      // console.log('Exchange Code Response:', response);

      // Store token and user data
      localStorage.setItem('user-token', access_token);
      localStorage.setItem('current-user', JSON.stringify(user));

      // Set auth header for subsequent API requests
      api.setAuthHeader(access_token);

      // Redirect to the original destination or the main page
      // console.log(`Redirecting to ${redirectPath}...`);
      router.push(redirectPath);
    } catch (e) {
      console.error('Failed to exchange Discord code or process login:', e);
      // Redirect to login page on error, potentially with a specific error message
      router.push('/login?error=discord_exchange_failed');
    }
  } else {
    console.error('Discord authorization code not found in URL. Redirecting to login.');
    // Redirect to login page if code is missing
    router.push('/login?error=no_discord_code');
  }
});
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.5rem;
}
</style>
