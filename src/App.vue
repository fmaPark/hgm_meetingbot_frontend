<template>
  <!-- 
    이제 App.vue는 이 <router-view> 태그 하나만 가집니다.
    여기에 로그인 페이지(/login)나 대시보드 페이지(/)가 렌더링됩니다.
  -->
  <router-view></router-view>
</template>

<script setup>
// App.vue의 <script> 내용은 이제 필요 없습니다.
// 모든 로직은 각 페이지 컴포넌트(Dashboard.vue, Login.vue)로 이동합니다.
</script>

<style>
/* 
  전역적으로 적용하고 싶은 스타일(예: body, :root)은 여기에 남겨두거나
  별도의 CSS 파일(예: src/assets/main.css)로 옮겨서 main.js에서 import 합니다.
*/
:root {
  --font-family: -apple-system, BlinkMacSystemFont, /* ... */
}
body {
  margin: 0;
  /* ... */
}
</style>