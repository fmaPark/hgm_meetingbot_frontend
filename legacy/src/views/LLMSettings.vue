<template>
  <div class="container">
    <router-link to="/" class="back-button">Back to Dashboard</router-link>
    <h1>LLM API Key Management</h1>
    <div v-if="isLoading" class="loading-state">Loading...</div>
    <div v-if="error" class="error-state">{{ error }}</div>
    <div v-if="!isLoading && !error" class="settings-form card">
      <form @submit.prevent="handleUpdateSettings">
        <div class="form-group">
          <label for="openai-key">OpenAI API Key</label>
          <input id="openai-key" type="password" v-model="settings.openai_api_key" placeholder="Enter your OpenAI API Key">
        </div>
        <div class="form-group">
          <label for="gemini-key">Gemini API Key</label>
          <input id="gemini-key" type="password" v-model="settings.gemini_api_key" placeholder="Enter your Gemini API Key">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="isSaving">
            <span v-if="isSaving" class="loader"></span>
            <span v-else>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const settings = ref({
  openai_api_key: '',
  gemini_api_key: '',
});
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref(null);
const successMessage = ref('');

async function fetchSettings() {
  isLoading.value = true;
  error.value = null;
  try {
    const data = await api.getLlmSettings();
    settings.value.openai_api_key = data.openai_api_key || '';
    settings.value.gemini_api_key = data.gemini_api_key || '';
  } catch (err) {
    error.value = 'Failed to load settings. You may not have permission to view this page.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

async function handleUpdateSettings() {
  isSaving.value = true;
  error.value = null;
  successMessage.value = '';
  try {
    const settingsToUpdate = {
        openai_api_key: settings.value.openai_api_key,
        gemini_api_key: settings.value.gemini_api_key,
    };
    await api.updateLlmSettings(settingsToUpdate);
    successMessage.value = 'Settings updated successfully!';
    // Re-fetch to show masked keys if backend returns them that way
    await fetchSettings(); 
  } catch (err) {
    error.value = 'Failed to update settings.';
    console.error(err);
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 800px;
  margin: auto;
}
.back-button {
  display: inline-block;
  margin-bottom: 2rem;
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.form-group input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
}
.btn-primary {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}
.btn-primary:disabled {
    background-color: #a9d6f5;
    cursor: not-allowed;
}
.loading-state, .error-state, .success-message {
  text-align: center;
  padding: 2rem;
}
.error-state {
  color: #e74c3c;
}
.success-message {
    color: #2ecc71;
    margin-top: 1rem;
    text-align: center;
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
