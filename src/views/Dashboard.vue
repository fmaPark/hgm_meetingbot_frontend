<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api.js';

const router = useRouter();

// --- 상태 관리 ---
const projects = ref([]);
const meetings = ref([]);
const users = ref([]);
const signupRequests = ref([]);
const isLoading = ref(false);
const isSummarizing = ref({}); // 각 회의별 요약 진행 상태
const pollingIntervalId = ref(null);

const currentView = ref('meetings');

// 필터링을 위한 상태
const selectedFilter = ref({ type: 'all', projectName: null, partName: null, title: '전체 회의 기록' });

// 설정 모달 상태
const isSettingsModalVisible = ref(false);

// 설정 모달 내부의 폼 상태
const newProjectName = ref('');
const selectedProjectForConfig = ref(null);
const formInitialState = { name: '', drive_folder_id: '', asana_config: { project_id: '', project_field: '', project_field_id: '', drive_field_id: '' } };
const partFormData = ref(JSON.parse(JSON.stringify(formInitialState)));
const editingPart = ref(null);

// 요약 관련 모달 상태
const isPromptModalVisible = ref(false);
const prompts = ref([]);
const selectedPrompt = ref('');
const meetingToSummarize = ref(null);
const isSummaryModalVisible = ref(false);
const summaryContent = ref('');
const summaryTitle = ref('');

const isSummarySelectModalVisible = ref(false);
const summariesForSelection = ref([]);
const selectedSummaryPath = ref(null);
const summaryPreviewContent = ref('');
const meetingForUpload = ref(null);

const asanaImportData = ref({
  url: '',
  field_name: '',
  enum_name: '',     
  drive_field_name: '',
});
const isFetchingAsana = ref(false);

// 복사/붙여넣기 기능을 위한 새로운 상태
const copiedPartConfig = ref(null);
const selectedPartsForPaste = ref([]);
const isPasting = ref(false); 

const isAdmin = ref(false);

// 유저 권한 모달 상태
const isPermissionsModalVisible = ref(false); 

const selectedUserForPerms = ref(null);
const selectedPartIdsForUser = ref([]);

const toast = ref({ visible: false, message: '', type: 'success' });

// --- 라이프사이클 훅 ---
onMounted(async () => {
  await checkAdminStatus(); // <<-- onMounted에서 호출
  
  // 관리자인 경우에만 관리자 전용 데이터를 불러옵니다.
  const fetchPromises = [fetchProjects(), fetchMeetings()];
  if (isAdmin.value) {
    fetchPromises.push(fetchSignupRequests());
    fetchPromises.push(fetchUsers());
  }
  
  await Promise.all(fetchPromises);
  renderIcons();
  startPolling(); // 페이지 진입 시 폴링 시작
});

onUnmounted(() => {
  stopPolling(); // 컴포넌트 파괴 시 폴링 중지 (메모리 누수 방지)
});

// --- API 호출 ---
async function checkAdminStatus() {
  try {
    const response = await api.checkAdmin();
    isAdmin.value = response.data.is_admin;
  } catch (error) {
    // 401 Unauthorized 등의 에러가 발생하면 관리자가 아닌 것으로 간주
    isAdmin.value = false;
  }
}

async function fetchProjects() {
  isLoading.value = true;
  try {
    const response = await api.getProjects();
    projects.value = response.data;
  } catch (error) {
    showToast("프로젝트 목록 로딩 실패", 'error');
  } finally {
    isLoading.value = false;
    // renderIcons();
  }
}

async function fetchMeetings() {
  isLoading.value = true;
  try {
    const response = await api.getMeetings();
    meetings.value = response.data;
    console.log("Fetched meetings:", meetings.value);
  } catch (error) {
    showToast("회의 현황 로딩 실패", 'error');
  } finally {
    isLoading.value = false;
    // renderIcons();
  }
}

async function fetchSignupRequests() {
  isLoading.value = true;
  try {
    const response = await api.getPendingSignupRequests();
    signupRequests.value = response.data;
  } catch (error) {
    // 관리자가 아닐 경우 403 Forbidden 에러가 발생할 수 있음
    if (error.response?.status !== 403) {
      showToast("가입 요청 목록 로딩 실패", 'error');
    }
  } finally {
    isLoading.value = false;
    // renderIcons();
  }
}

async function fetchUsers() {
  if (!isAdmin.value) return;
  isLoading.value = true;
  try {
    const response = await api.getAllUsers();
    users.value = response.data;
  } catch (error) {
    if (error.response?.status !== 403) {
      showToast("사용자 목록 로딩 실패", 'error');
      console.error("Fetch users error:", error);
    }
  } finally {
    isLoading.value = false;  
  }
}

function openPermissionsModal() {
  isPermissionsModalVisible.value = true;
  // 모달이 열릴 때 첫 번째 사용자를 기본으로 선택
  if (users.value.length > 0 && !selectedUserForPerms.value) {
    selectedUserForPerms.value = users.value[0];
  }
  renderIcons();
}

function closePermissionsModal() {
  isPermissionsModalVisible.value = false;
  selectedUserForPerms.value = null;
}

watch(selectedUserForPerms, (newUser) => {
  if (newUser) {
    selectedPartIdsForUser.value = [...newUser.authorized_part_ids];
  } else {
    selectedPartIdsForUser.value = [];
  }
});

async function handleSavePermissions() {
  if (!selectedUserForPerms.value) return;
  isLoading.value = true;
  try {
    await api.updateUserPermissions(selectedUserForPerms.value.id, selectedPartIdsForUser.value);
    showToast(`'${selectedUserForPerms.value.username}' 사용자의 권한이 업데이트되었습니다.`, 'success');
    await fetchUsers();
    const updatedUser = users.value.find(u => u.id === selectedUserForPerms.value.id);
    if (updatedUser) selectedUserForPerms.value = updatedUser;
    closePermissionsModal();
  } catch (error) { showToast("권한 업데이트 실패", 'error'); } 
  finally { isLoading.value = false; }
}

async function handleApprove(requestId) {
  if (!confirm("이 가입 요청을 승인하시겠습니까?")) return;
  isLoading.value = true;

  // <<-- 1. 승인 작업 try-catch -->>
  try {
    const response = await api.approveSignupRequest(requestId);
    showToast(response.data.message, 'success');
  } catch (error) {
    showToast(error.response?.data?.detail || "승인 처리 중 오류 발생", 'error');
    console.error("Approval error:", error);
    isLoading.value = false; // 에러 발생 시 로딩 종료
    return; // 여기서 함수 실행 중단
  }

  // <<-- 2. 목록 새로고침 try-catch -->>
  try {
    // 승인이 성공한 후에만 목록을 새로고침합니다.
    await fetchSignupRequests();
  } catch (error) {
    // 목록 새로고침 실패는 별도의 에러로 처리 (이미 fetchSignupRequests 내부에 토스트가 있음)
    console.error("Failed to refresh signup requests after approval:", error);
  } finally {
    // 모든 작업이 끝난 후 로딩 상태 해제
    isLoading.value = false;
  }
}

async function handleReject(requestId) {
  if (!confirm("이 가입 요청을 거절하시겠습니까?")) return;
  isLoading.value = true;

  // <<-- 동일한 패턴 적용 -->>
  try {
    const response = await api.rejectSignupRequest(requestId);
    showToast(response.data.message, 'success');
  } catch (error) {
    showToast(error.response?.data?.detail || "거절 처리 중 오류 발생", 'error');
    isLoading.value = false;
    return;
  }

  try {
    await fetchSignupRequests();
  } catch (error) {
    console.error("Failed to refresh signup requests after rejection:", error);
  } finally {
    isLoading.value = false;
  }
}

function handleLogout() {
  if (confirm("로그아웃 하시겠습니까?")) {
    // 1. API 모듈의 로그아웃 함수 호출
    api.logout();
    // 2. 로그인 페이지로 리디렉션
    router.push('/login');
  }
}

// --- 필터링 로직 ---
const filteredMeetings = computed(() => {
  const { type, projectName, partName } = selectedFilter.value;
  if (type === 'all') return meetings.value;
  if (type === 'project') return meetings.value.filter(m => m.project === projectName);
  if (type === 'part') return meetings.value.filter(m => m.project === projectName && m.part === partName);
  return [];
});

function setFilter(type, project = null, part = null) {
  if (type === 'all') {
    selectedFilter.value = { type: 'all', projectName: null, partName: null, title: '전체 회의 기록' };
  } else if (type === 'project') {
    selectedFilter.value = { type: 'project', projectName: project.name, partName: null, title: `${project.name} 회의 기록` };
  } else if (type === 'part') {
    selectedFilter.value = { type: 'part', projectName: project.name, partName: part.name, title: `${project.name} - ${part.name} 회의 기록` };
  }
}

// --- 설정 모달 핸들러 ---
function openSettingsModal() { 
  if (projects.value.length > 0 && !selectedProjectForConfig.value) {
      selectedProjectForConfig.value = projects.value[0];
  }
  isSettingsModalVisible.value = true; 
  renderIcons(); 
}
function closeSettingsModal() { 
  isSettingsModalVisible.value = false;
  copiedPartConfig.value = null;
  selectedPartsForPaste.value = [];
}

function copyPartConfig(part) {
  copiedPartConfig.value = {
    drive_folder_id: part.drive_folder_id,
    asana_config: part.asana_config
  };
  showToast(`'${part.name}' 파트의 설정이 복사되었습니다.`, 'success');
}

async function handlePasteConfig() {
  if (!copiedPartConfig.value || selectedPartsForPaste.value.length === 0) {
    return showToast("복사된 설정이 없거나, 선택된 파트가 없습니다.", 'error');
  }
  
  isPasting.value = true;
  showToast(`${selectedPartsForPaste.value.length}개의 파트에 설정을 적용합니다...`, 'success');
  
  try {
    // 선택된 각 파트에 대해 업데이트 API를 병렬로 호출
    const updatePromises = selectedPartsForPaste.value.map(partId => {
      const partToUpdate = selectedProjectForConfig.value.parts.find(p => p.id === partId);
      if (!partToUpdate) return Promise.resolve(); // 혹시 모를 경우 대비
      
      // 기존 파트 정보에 복사된 설정을 덮어씌움
      const payload = {
        ...partToUpdate,
        ...copiedPartConfig.value
      };
      return api.updatePart(partId, payload);
    });
    
    await Promise.all(updatePromises);
    
    // 작업 완료 후 상태 초기화 및 데이터 새로고침
    copiedPartConfig.value = null;
    selectedPartsForPaste.value = [];
    await fetchProjects(); // 변경사항을 반영하기 위해 프로젝트 목록 새로고침
    
    // selectedProjectForConfig도 갱신된 정보로 업데이트
    const updatedProject = projects.value.find(p => p.id === selectedProjectForConfig.value.id);
    if(updatedProject) selectedProjectForConfig.value = updatedProject;

    showToast("설정 붙여넣기가 완료되었습니다.", 'success');
  } catch (error) {
    showToast("붙여넣기 작업 중 오류가 발생했습니다.", 'error');
  } finally {
    isPasting.value = false;
  }
}

const isAllSelected = computed({
  get() {
    if (!selectedProjectForConfig.value || selectedProjectForConfig.value.parts.length === 0) return false;
    return selectedPartsForPaste.value.length === selectedProjectForConfig.value.parts.length;
  },
  set(value) {
    if (value) {
      selectedPartsForPaste.value = selectedProjectForConfig.value.parts.map(p => p.id);
    } else {
      selectedPartsForPaste.value = [];
    }
  }
});

async function handleCreateProject() {
  if (!newProjectName.value.trim()) return showToast("프로젝트 이름을 입력하세요.", 'error');
  isLoading.value = true;
  try {
    await api.createProject({ name: newProjectName.value });
    newProjectName.value = '';
    await fetchProjects();
    showToast("프로젝트가 성공적으로 생성되었습니다.", 'success');
  } catch (error) { 
    showToast(error.response?.data?.detail || "프로젝트 생성 실패", 'error'); 
  } finally { 
    isLoading.value = false; 
  }
}

async function openSummarySelectModal(meeting) {
  meetingForUpload.value = meeting;
  summariesForSelection.value = meeting.artifacts.summary_paths || [];
  
  if (summariesForSelection.value.length > 0) {
    // 첫 번째 요약을 기본으로 선택하고 미리보기 로드
    selectedSummaryPath.value = summariesForSelection.value[0];
  } else {
    // 요약 파일이 없는 예외적인 경우
    selectedSummaryPath.value = null;
    summaryPreviewContent.value = "표시할 요약 파일이 없습니다.";
  }
  
  isSummarySelectModalVisible.value = true;
  renderIcons();
}

function closeSummarySelectModal() {
  isSummarySelectModalVisible.value = false;
  // 모든 관련 상태 초기화
  summariesForSelection.value = [];
  selectedSummaryPath.value = null;
  summaryPreviewContent.value = '';
  meetingForUpload.value = null;
}

async function handleConfirmUpload() {
  if (!selectedSummaryPath.value) return showToast("업로드할 요약을 선택해주세요.", 'error');
  
  isLoading.value = true;
  try {
    const response = await api.uploadSummary(meetingForUpload.value.id, selectedSummaryPath.value);
    showToast(response.data.message, 'success');
    closeSummarySelectModal();
  } catch (error) {
    showToast("업로드 실패", 'error');
  } finally {
    isLoading.value = false;
  }
}

watch(selectedSummaryPath, async (newPath) => {
  if (newPath) {
    summaryPreviewContent.value = "미리보기 로딩 중...";
    try {
      const response = await api.getSummaryContent(meetingForUpload.value.id, newPath);
      summaryPreviewContent.value = response.data;
    } catch {
      summaryPreviewContent.value = "내용을 불러올 수 없습니다.";
    }
  }
});

function startEditing(part) {
  editingPart.value = part;
  partFormData.value = JSON.parse(JSON.stringify(part));
  if (!partFormData.value.asana_config) {
    partFormData.value.asana_config = { ...formInitialState.asana_config };
  }
  renderIcons();
}

function cancelEditing() {
  editingPart.value = null;
  partFormData.value = JSON.parse(JSON.stringify(formInitialState));
  renderIcons();
}

function startPolling() {
  if (pollingIntervalId.value) return; // 이미 실행 중이면 중복 실행 방지
  
  pollingIntervalId.value = setInterval(async () => {
    // 백그라운드에서 조용히 데이터 갱신
    try {
      const response = await api.getMeetings();
      meetings.value = response.data;
      renderIcons();

      // 처리 중인 작업이 더 이상 없으면 폴링 중지
      const isStillProcessing = response.data.some(m => m.status === 'PROCESSING');
      if (!isStillProcessing) {
        stopPolling();
      }
    } catch (error) {
      console.error("Polling failed:", error);
      stopPolling(); // 에러 발생 시 폴링 중지
    }
  }, 5000); // 5초마다 확인
}

function stopPolling() {
  if (pollingIntervalId.value) {
    clearInterval(pollingIntervalId.value);
    pollingIntervalId.value = null;
  }
}

async function handleFormSubmit() {
  if (editingPart.value) await handleUpdatePart();
  else await handleAddPart();
}

async function handleAddPart() {
  if (!selectedProjectForConfig.value || !partFormData.value.name.trim()) return showToast("파트 이름을 입력하세요.", 'error');
  isLoading.value = true;
  try {
    const payload = createPayload(partFormData.value);
    await api.addPart(selectedProjectForConfig.value.name, payload);
    cancelEditing();
    await fetchProjects();
    await fetchMeetings(); // 파트 추가/수정이 회의 기록 표시에도 영향을 줄 수 있으므로 갱신
    showToast("파트가 성공적으로 추가되었습니다.", 'success');
  } catch (error) { 
    showToast("파트 추가 실패", 'error'); 
  } finally { 
    isLoading.value = false; 
  }
}

async function handleUpdatePart() {
  if (!editingPart.value) return;
  isLoading.value = true;
  try {
    const payload = createPayload(partFormData.value);
    await api.updatePart(editingPart.value.id, payload);
    cancelEditing();
    await fetchProjects();
    await fetchMeetings(); // 파트 추가/수정이 회의 기록 표시에도 영향을 줄 수 있으므로 갱신
    showToast("파트 정보가 업데이트되었습니다.", 'success');
  } catch (error) { 
    showToast("파트 수정 실패", 'error'); 
  } finally { 
    isLoading.value = false; 
  }
}

// --- 요약 관련 핸들러 ---
async function openPromptModal(meeting) {
  isLoading.value = true;
  try {
    const response = await api.getPrompts(meeting.id);
    prompts.value = response.data;
    if (prompts.value.length > 0) {
      selectedPrompt.value = prompts.value[0];
    }
    meetingToSummarize.value = meeting;
    isPromptModalVisible.value = true;
  } catch (error) {
    showToast("프롬프트 목록을 불러오는 데 실패했습니다.", 'error');
  } finally {
    isLoading.value = false;
    renderIcons();
  }
}

function closePromptModal() {
  isPromptModalVisible.value = false;
  prompts.value = [];
  selectedPrompt.value = '';
  meetingToSummarize.value = null;
}

async function handleConfirmSummarize() {
  if (!selectedPrompt.value) {
    showToast("프롬프트를 선택해주세요.", 'error');
    return;
  }
  // console.log("선택된 프롬프트:", selectedPrompt.value);
  const prompt_value = selectedPrompt.value;
  isLoading.value = true;
  const meetingId = meetingToSummarize.value.id;
  isSummarizing.value[meetingId] = true;
  closePromptModal();
  
  try {
    const response = await api.summarizeMeeting(meetingId, prompt_value);
    const index = meetings.value.findIndex(m => m.id === response.data.id);
    if (index !== -1) meetings.value[index] = response.data;
    
    showToast("요약 작업이 시작되었습니다. 완료되면 자동으로 업데이트됩니다.", 'success');
    startPolling(); // 요약 작업 시작 후 폴링 시작/재시작
    // await fetchMeetings();
    // showToast("요약 작업이 성공적으로 완료되었습니다.", 'success');
  } catch (error) {
    showToast("요약 작업 실패", 'error');
  } finally {
    isLoading.value = false;
    renderIcons();
  }
}

async function handleFetchAsanaConfig() {
  if (!asanaImportData.value.url.trim()) {
    return showToast("Asana Task URL을 입력해주세요.", 'error');
  }
  isFetchingAsana.value = true;
  try {
    const response = await api.getAsanaConfigFromUrl(asanaImportData.value);
    // API 응답으로 partFormData의 asana_config를 업데이트
    partFormData.value.asana_config = response.data;
    showToast("Asana 설정을 성공적으로 가져왔습니다.", 'success');
  } catch (error) {
    showToast(error.response?.data?.detail || "Asana 설정 가져오기 실패", 'error');
  } finally {
    isFetchingAsana.value = false;
  }
}

// --- 유틸리티 함수 ---
const statusClassMap = {
  RECORDING: 'recording',
  STOPPED: 'stopped',
  PROCESSING: 'processing',
  SUMMARIZED: 'summarized',
  FAILED: 'failed',
};
function getStatusClass(status) {
  return statusClassMap[status] || 'default';
}

function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}

function renderIcons() {
  nextTick(() => {
    // @ts-ignore
    if(window.feather) feather.replace();
  });
}

function createPayload(formData) {
  const payload = JSON.parse(JSON.stringify(formData));
  const hasAsanaConfig = Object.values(payload.asana_config).some(val => val && String(val).trim() !== '');
  if (!hasAsanaConfig) payload.asana_config = null;
  delete payload.id;
  return payload;
}

function showToast(message, type = 'success') {
  toast.value = { visible: true, message, type };
  renderIcons();
  setTimeout(() => {
    toast.value.visible = false;
  }, 3000);
}
watch(currentView, (newView, oldView) => {
  // currentView의 값이 변경될 때마다 실행됩니다.
  // nextTick을 사용하여 Vue가 DOM 업데이트를 완료한 후에
  // 아이콘을 다시 그리도록 합니다.
  renderIcons();
});
</script>
<template>
  <div id="app">
    <!-- --- Modals & Overlays --- -->
    <div class="toast" :class="[toast.type, { visible: toast.visible }]">
      <i :data-feather="toast.type === 'success' ? 'check-circle' : 'alert-triangle'"></i>
      <span>{{ toast.message }}</span>
    </div>

    <div class="modal-overlay" v-if="isPromptModalVisible" @click="closePromptModal">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h2>요약 프롬프트 선택</h2>
          <button class="btn-icon" @click="closePromptModal"><i data-feather="x"></i></button>
        </header>
        <div class="prompt-select-wrapper">
          <label for="prompt-select">사용할 프롬프트를 선택하세요:</label>
          <select id="prompt-select" v-model="selectedPrompt" class="prompt-select">
            <option v-for="(prompt, index) in prompts" :key="index" :value="prompt">{{ prompt }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closePromptModal">취소</button>
          <button class="btn-primary" @click="handleConfirmSummarize">요약 실행</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="isSummarySelectModalVisible" @click="closeSummarySelectModal">
      <div class="modal-content summary-select-modal" @click.stop>
        <header class="modal-header">
          <h2><i data-feather="file-text"></i> 요약 선택 및 업로드</h2>
          <button class="btn-icon" @click="closeSummarySelectModal"><i data-feather="x"></i></button>
        </header>
        <div class="summary-select-content">
          <div class="summary-list-panel">
            <h3>사용 가능한 요약</h3>
            <div class="summary-list">
              <label v-for="path in summariesForSelection" :key="path" class="summary-item">
                <input type="radio" :value="path" v-model="selectedSummaryPath" name="summary-selection">
                <span><i data-feather="file"></i> {{ path.split('/').pop() }}</span>
              </label>
            </div>
          </div>
          <div class="summary-preview-panel">
            <h3>미리보기</h3>
            <pre class="summary-text">{{ summaryPreviewContent }}</pre>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeSummarySelectModal">닫기</button>
          <button class="btn-primary" @click="handleConfirmUpload" :disabled="!selectedSummaryPath || isLoading">
            <i data-feather="upload-cloud"></i>
            <span v-if="!isLoading">선택한 요약 업로드</span>
            <span v-else class="loader"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="isSettingsModalVisible" @click="closeSettingsModal">
      <div class="modal-content settings-modal" @click.stop>
        <header class="modal-header">
          <h2><i data-feather="settings"></i> 프로젝트/파트 설정</h2>
          <button class="btn-icon" @click="closeSettingsModal"><i data-feather="x"></i></button>
        </header>
        <div class="settings-content">
          <div class="settings-sidebar">
            <section class="card no-shadow">
              <h2><i data-feather="plus-circle"></i> 새 프로젝트 생성</h2>
              <form @submit.prevent="handleCreateProject">
                <input v-model="newProjectName" type="text" placeholder="프로젝트 이름" :disabled="isLoading">
                <button type="submit" class="btn-primary" :disabled="isLoading">
                  <span v-if="!isLoading">생성</span><span v-else class="loader"></span>
                </button>
              </form>
            </section>
            <section class="card no-shadow project-list-in-modal">
              <h2><i data-feather="list"></i> 프로젝트 목록</h2>
              <ul v-if="projects.length > 0">
                <li v-for="project in projects" :key="project.id" @click="selectedProjectForConfig = project; cancelEditing()"
                    :class="{ active: selectedProjectForConfig && selectedProjectForConfig.id === project.id }">
                  <span>{{ project.name }}</span>
                  <span class="badge">{{ project.parts.length }}</span>
                </li>
              </ul>
              <p v-else class="empty-state">생성된 프로젝트가 없습니다.</p>
            </section>
          </div>
          <div class="settings-main">
            <section class="card project-details no-shadow" v-if="selectedProjectForConfig">
              <div class="paste-controls" v-if="copiedPartConfig">
                <div class="paste-info">
                  <i data-feather="clipboard"></i>
                  <span>설정이 복사되었습니다. 붙여넣을 파트를 선택하세요.</span>
                </div>
                <button class="btn-primary" @click="handlePasteConfig" 
                        :disabled="selectedPartsForPaste.length === 0 || isPasting">
                  <span v-if="!isPasting">선택한 {{ selectedPartsForPaste.length }}개에 붙여넣기</span>
                  <span v-else class="loader"></span>
                </button>
              </div>
              <h2><i data-feather="settings"></i> {{ selectedProjectForConfig.name }} / 파트 관리</h2>
              <table v-if="selectedProjectForConfig.parts.length > 0">
                <thead>
                  <tr>
                    <th class="checkbox-cell"><input type="checkbox" v-model="isAllSelected"></th>
                    <th>파트 이름</th><th>드라이브 ID</th><th>Asana ID</th><th class="actions">액션</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="part in selectedProjectForConfig.parts" :key="part.id">
                    <!-- 1. 체크박스 셀 -->
                    <td class="checkbox-cell">
                      <div class="cell-wrapper">
                        <input type="checkbox" :value="part.id" v-model="selectedPartsForPaste">
                      </div>
                    </td>
                    
                    <!-- 2. 파트 이름 셀 -->
                    <td><div class="cell-wrapper">{{ part.name }}</div></td>
                    
                    <!-- 3. 드라이브 ID 셀 -->
                    <td><div class="cell-wrapper">{{ part.drive_folder_id || '—' }}</div></td>
                    
                    <!-- 4. Asana ID 셀 -->
                    <td><div class="cell-wrapper">{{ part.asana_config ? part.asana_config.project_id : '—' }}</div></td>
                    
                    <!-- 5. 액션 셀 -->
                    <td class="actions">
                      <!-- 'cell-wrapper'와 'action-buttons' 클래스를 모두 가짐 -->
                      <div class="cell-wrapper action-buttons">
                        <button class="btn-icon" @click="copyPartConfig(part)" title="설정 복사">
                          <i data-feather="copy"></i>
                        </button>
                        <button class="btn-icon" @click="startEditing(part)" title="수정">
                          <i data-feather="edit-2"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="empty-state">이 프로젝트에는 아직 파트가 없습니다.</p>
              <hr>
              <h3><i :data-feather="editingPart ? 'edit' : 'plus'"></i> {{ editingPart ? '파트 수정' : '새 파트 추가' }}</h3>
              <form @submit.prevent="handleFormSubmit" class="part-form">
                <div class="form-grid">
                  <div class="form-group"><label for="part-name">파트 이름*</label><input id="part-name" v-model="partFormData.name" type="text" :disabled="isLoading"></div>
                  <div class="form-group"><label for="drive-id">드라이브 폴더 ID</label><input id="drive-id" v-model="partFormData.drive_folder_id" type="text" :disabled="isLoading"></div>
                  
                  <div class="form-group full-width">
                    <h4>Asana 설정</h4>
                    <!-- Asana 설정 자동 가져오기 UI -->
                    <div class="import-group">
                      <div class="import-inputs">
                        <input type="text" v-model="asanaImportData.url" placeholder="Asana Task URL 붙여넣기">
                        <input type="text" v-model="asanaImportData.field_name" placeholder="프로젝트 필드 이름">
                        <input type="text" v-model="asanaImportData.enum_name" placeholder="열거형 이름">
                        <input type="text" v-model="asanaImportData.drive_field_name" placeholder="드라이브 필드 이름">
                      </div>
                      <button type="button" class="btn-secondary" @click="handleFetchAsanaConfig" :disabled="isFetchingAsana">
                        <i v-if="!isFetchingAsana" data-feather="download"></i>
                        <span v-if="isFetchingAsana" class="loader"></span>
                        <span v-else>가져오기</span>
                      </button>
                    </div>
                  </div>
                  <div class="form-group"><label for="asana-proj-id">Asana 프로젝트 ID</label><input id="asana-proj-id" v-model="partFormData.asana_config.project_id" type="text" :disabled="isLoading"></div>
                  <div class="form-group"><label for="asana-proj-field">프로젝트 필드</label><input id="asana-proj-field" v-model="partFormData.asana_config.project_field" type="text" :disabled="isLoading"></div>
                  <div class="form-group"><label for="asana-proj-field-id">프로젝트 필드 ID</label><input id="asana-proj-field-id" v-model="partFormData.asana_config.project_field_id" type="text" :disabled="isLoading"></div>
                  <div class="form-group"><label for="asana-drive-field-id">드라이브 필드 ID</label><input id="asana-drive-field-id" v-model="partFormData.asana_config.drive_field_id" type="text" :disabled="isLoading"></div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary" :disabled="isLoading">
                    <i :data-feather="editingPart ? 'save' : 'plus'"></i>
                    <span v-if="!isLoading">{{ editingPart ? '변경 사항 저장' : '파트 추가' }}</span><span v-else class="loader"></span>
                  </button>
                  <button type="button" v-if="editingPart" @click="cancelEditing" class="btn-secondary" :disabled="isLoading"><i data-feather="x"></i><span>취소</span></button>
                </div>
              </form>
            </section>
            <section class="card placeholder" v-else>
              <p>왼쪽에서 프로젝트를 선택하여 파트를 관리하세요.</p>
            </section>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="isPermissionsModalVisible" @click="closePermissionsModal">
      <div class="modal-content permissions-modal" @click.stop>
        <header class="modal-header">
          <h2><i data-feather="users"></i> 사용자 권한 관리</h2>
          <button class="btn-icon" @click="closePermissionsModal"><i data-feather="x"></i></button>
        </header>
        <div class="permissions-content">
          <aside class="user-list-sidebar">
            <h3><i data-feather="list"></i> 사용자 목록</h3>
            <ul>
              <li v-for="user in users" :key="user.id" @click="selectedUserForPerms = user"
                  :class="{ active: selectedUserForPerms && selectedUserForPerms.id === user.id }">
                <span>{{ user.username }}</span>
                <span class="role-badge">{{ user.role }}</span>
              </li>
            </ul>
          </aside>
          <main class="permission-config-main">
            <section v-if="selectedUserForPerms">
              <h3><i data-feather="user-check"></i> {{ selectedUserForPerms.username }} / 파트 권한 설정</h3>
              <div class="permission-tree">
                <p v-if="projects.length === 0 && !isLoading">설정된 프로젝트가 없습니다.</p>
                <div v-for="project in projects" :key="project.id" class="project-group-perms">
                  <h4>{{ project.name }}</h4>
                  <div v-for="part in project.parts" :key="part.id" class="part-item-perms">
                    <label>
                      <input type="checkbox" :value="part.id" v-model="selectedPartIdsForUser">
                      {{ part.name }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-primary" @click="handleSavePermissions" :disabled="isLoading">
                  <i data-feather="save"></i> 권한 저장
                </button>
              </div>
            </section>
            <section v-else class="placeholder">
              <p>왼쪽에서 사용자를 선택하여 권한을 설정하세요.</p>
            </section>
          </main>
        </div>
      </div>
    </div>

    <div class="dashboard-layout">
      <aside class="sidebar">
        <header class="sidebar-header">
          <h2><i data-feather="folder"></i> 프로젝트</h2>
          <button class="btn-icon" @click="openSettingsModal" title="설정 열기">
            <i data-feather="settings"></i>
          </button>
        </header>
        <nav class="project-nav">
          <ul>
            <li :class="{ active: selectedFilter.type === 'all' }">
              <a href="#" @click.prevent="setFilter('all')">전체보기</a>
            </li>
            <li v-for="project in projects" :key="project.id" class="project-group">
              <a href="#" @click.prevent="setFilter('project', project)"
                 :class="{ active: selectedFilter.type === 'project' && selectedFilter.projectName === project.name }">
                {{ project.name }}
              </a>
              <ul class="part-list" v-if="project.parts.length > 0">
                <li v-for="part in project.parts" :key="part.id">
                  <a href="#" @click.prevent="setFilter('part', project, part)"
                     :class="{ active: selectedFilter.type === 'part' && selectedFilter.projectName === project.name && selectedFilter.partName === part.name }">
                    {{ part.name }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>

      <main class="main-content">
        <header class="main-header">
          <h1><i data-feather="grid"></i> 대시보드</h1>
          <div>
            <button v-if="isAdmin" class="btn-secondary" @click="openPermissionsModal">
              <i data-feather="users"></i> 권한 관리
            </button>
            <button class="btn-danger" @click="handleLogout">
              <i data-feather="log-out"></i> 로그아웃
            </button>
          </div>
        </header>
        
        <nav class="main-nav">
            <button @click="currentView = 'meetings'" :class="{ active: currentView === 'meetings' }">
            <i data-feather="activity"></i> 회의 현황
            </button>
            <!--  가입 요청 관리 탭 추가 -->
            <button v-if="isAdmin" @click="currentView = 'requests'" :class="{ active: currentView === 'requests' }">
            <i data-feather="user-plus"></i> 가입 요청
            <span v-if="signupRequests.length > 0" class="badge notification-badge">{{ signupRequests.length }}</span>
            </button>
        </nav>
        <div v-if="currentView === 'meetings'">
            <section class="card">
            <h2><i data-feather="activity"></i> {{ selectedFilter.title }}</h2>
            <table v-if="filteredMeetings.length > 0">
                <thead>
                <tr>
                    <th>상태</th>
                    <th>프로젝트</th>
                    <th>파트</th>
                    <th>주최자</th>
                    <th>시작 시간</th>
                    <th>요약</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="meeting in filteredMeetings" :key="meeting.id">
                    <td><span class="status-badge" :class="getStatusClass(meeting.status)">{{ meeting.status }}</span></td>
                    <td>{{ meeting.project }}</td>
                    <td>{{ meeting.part }}</td>
                    <td>{{ meeting.author_nick }}</td>
                    <td>{{ formatDateTime(meeting.start_time) }}</td>
                    <td class="actions">
                    <button v-if="meeting.status === 'SUMMARIZED' && meeting.artifacts.summary_paths?.length"
                            @click="openSummarySelectModal(meeting)" class="btn-secondary"> <!-- 호출 함수 변경 -->
                        <i data-feather="eye"></i> 보기/업로드
                    </button>
                    
                    <button v-else-if="meeting.status === 'STOPPED'"
                            :key="`summary-start-${meeting.id}`"
                            @click="openPromptModal(meeting)" class="btn-primary" :disabled="isSummarizing[meeting.id]">
                        <i v-if="!isSummarizing[meeting.id]" data-feather="play-circle"></i>
                        <span v-if="isSummarizing[meeting.id]" class="loader"></span>
                        <span v-else>요약하기</span>
                    </button>

                    <div v-else-if="meeting.status === 'PROCESSING'" 
                        :key="`summary-processing-${meeting.id}`"
                        class="status-processing">
                        <span class="loader-small"></span>
                        <span>처리 중...</span>
                    </div>

                    <div v-else-if="meeting.status === 'FAILED'" 
                        :key="`summary-failed-${meeting.id}`"
                        class="status-failed">
                        <i data-feather="alert-circle"></i>
                        <span>실패</span>
                    </div>

                    <span v-else :key="`summary-none-${meeting.id}`">—</span>
                    </td>
                </tr>
                </tbody>
            </table>
            <p v-else-if="isLoading" class="empty-state">데이터를 불러오는 중...</p>
            <p v-else class="empty-state">해당 조건의 회의 기록이 없습니다.</p>
            </section>
        </div>
        <div v-if="currentView === 'requests'">
            <section class="card">
            <h2><i data-feather="user-plus"></i> 보류 중인 가입 요청</h2>
            <table v-if="signupRequests.length > 0" key="requests-table">
                <thead>
                    <tr>
                    <th>사용자 이름</th>
                    <th>요청 시간</th>
                    <th class="actions">액션</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="req in signupRequests" :key="req.id">
                    <td>{{ req.username }}</td>
                    <td>{{ formatDateTime(req.requested_at) }}</td>
                    <td class="actions">
                        <div class="action-buttons">
                        <button class="btn-danger" @click="handleReject(req.id)" :disabled="isLoading">
                            <i data-feather="x-circle"></i> 거절
                        </button>
                        <button class="btn-success" @click="handleApprove(req.id)" :disabled="isLoading">
                            <i data-feather="check-circle"></i> 승인
                        </button>
                        </div>
                    </td>
                    </tr>
                </tbody>
            </table>
            <p v-else-if="isLoading" class="empty-state">데이터를 불러오는 중...</p>
            <p v-else class="empty-state">대기 중인 가입 요청이 없습니다.</p>
            </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --bg-color: #f4f7f9;
  --text-color: #333;
  --text-color-light: #777;
  --card-bg-color: #ffffff;
  --border-color: #dee2e6;
  --primary-color: #3498db;
  --primary-color-dark: #2980b9;
  --secondary-color: #6c757d;
  --secondary-color-dark: #5a6268;
  --success-color: #2ecc71;
  --error-color: #e74c3c;
  --hover-bg-color: #f8f9fa;
  --active-bg-color: #e9ecef;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  --border-radius: 8px;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-family);
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  padding: 0; 
}

#app { max-width: 100%; padding: 0; }
.dashboard-layout { display: flex; height: 100vh; }

/* --- Sidebar Styles --- */
.sidebar { width: 280px; flex-shrink: 0; background-color: var(--card-bg-color); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; height: 100%; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
.sidebar-header h2 { margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 0.75rem; }
.project-nav { overflow-y: auto; flex-grow: 1; }
.project-nav ul { list-style: none; padding: 1rem; margin: 0; }
.project-nav a { display: block; padding: 0.75rem 1rem; border-radius: 6px; text-decoration: none; color: var(--text-color); font-weight: 500; transition: background-color 0.2s, color 0.2s; }
.project-nav a:hover { background-color: var(--hover-bg-color); }
.project-nav a.active { background-color: var(--primary-color); color: white; }
.project-group > a { font-weight: 600; }
.part-list { padding-left: 1.5rem; margin-top: 0.5rem; }
.part-list a { font-size: 0.9em; color: var(--text-color-light); font-weight: 400; }
.part-list a.active { color: var(--primary-color); background-color: var(--active-bg-color); font-weight: 600; }
.project-list-in-modal ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column; /* 아이템들을 세로로 나열 */
  gap: 0.5rem; /* 버튼 사이의 간격 */
}

/* <<-- 핵심 수정: li를 버튼처럼 스타일링 -->> */
.project-list-in-modal li {
  /* 버튼의 기본 모양과 정렬 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem; /* 내부 여백 */
  border-radius: 6px; /* 둥근 모서리 */
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  /* 기본 상태 (버튼처럼 보이게) */
  background-color: var(--hover-bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

/* 마우스를 올렸을 때의 스타일 */
.project-list-in-modal li:hover {
  border-color: var(--primary-color);
  background-color: var(--active-bg-color);
}

/* 선택되었을 때(활성화)의 스타일 */
.project-list-in-modal li.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color-dark);
  font-weight: 600;
}

/* 활성화된 버튼 내부의 뱃지 스타일 */
.project-list-in-modal li.active .badge {
  background-color: white;
  color: var(--primary-color);
}

/* --- Main Content Styles --- */
.main-content { flex-grow: 1; padding: 2rem; overflow-y: auto; height: 100vh; box-sizing: border-box; }
.main-content .card { padding: 1.5rem 2rem; }

/* --- General Styles (Buttons, Forms, etc.) --- */
input[type="text"] { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; width: 100%; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; }
input[type="text"]:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2); }
input:disabled { background-color: var(--hover-bg-color); }
button { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; font-weight: 600; font-family: var(--font-family); }
button:disabled { cursor: not-allowed; opacity: 0.7; }
.btn-primary { background-color: var(--primary-color); color: white; }
.btn-primary:hover:not(:disabled) { background-color: var(--primary-color-dark); }
.btn-secondary { background-color: var(--secondary-color); color: white; }
.btn-secondary:hover:not(:disabled) { background-color: var(--secondary-color-dark); }
.btn-icon { background: none; padding: 0.5rem; color: var(--text-color-light); }
.btn-icon:hover:not(:disabled) { background: var(--hover-bg-color); color: var(--primary-color); }
table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
th, td { border-bottom: 1px solid var(--border-color); padding: 0.8rem 1rem; text-align: left; vertical-align: middle; }
th { background-color: var(--hover-bg-color); font-weight: 600; }
tbody tr:hover { background-color: var(--hover-bg-color); }
td.actions { text-align: center; width: 160px; }
td.actions button {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  justify-content: center;
}
.empty-state { text-align: center; color: var(--text-color-light); padding: 2rem; }
.badge { background-color: var(--active-bg-color); color: var(--text-color-light); font-size: 0.8em; padding: 0.2rem 0.6rem; border-radius: 1rem; font-weight: 500; }
hr { border: none; border-top: 1px solid var(--border-color); margin: 1.5rem 0; }

/* --- Modals --- */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-content { background-color: white; padding: 0; border-radius: var(--border-radius); box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 80%; max-width: 800px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); }
.modal-header h2 { margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
.summary-text { flex-grow: 1; overflow-y: auto; background-color: var(--hover-bg-color); padding: 1rem; margin: 1.5rem; border-radius: 6px; white-space: pre-wrap; word-wrap: break-word; font-family: monospace; line-height: 1.5; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem 2rem; border-top: 1px solid var(--border-color); background-color: var(--hover-bg-color); }
.prompt-select-wrapper { margin: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.prompt-select-wrapper label { font-weight: 600; color: var(--text-color-light); }
select.prompt-select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: white; font-family: var(--font-family); font-size: 1rem; cursor: pointer; }
select.prompt-select:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2); }

/* Settings Modal Specifics */
.settings-modal { width: 90%; max-width: 1200px; max-height: 90vh; }
.settings-content { display: flex; flex-grow: 1; overflow: hidden; }
.settings-sidebar { width: 320px; flex-shrink: 0; overflow-y: auto; padding: 1.5rem; border-right: 1px solid var(--border-color); }
.settings-main { flex-grow: 1; overflow-y: auto; padding: 1.5rem; }
.settings-modal .card { box-shadow: none; border: none; padding: 0; margin-bottom: 1rem; }
.settings-modal .project-list-in-modal li { padding: 0.8rem; }
.settings-modal .project-details { padding: 1.5rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); }
/* .settings-modal .part-form { ... } */
/* 테이블 기본 설정 */
.settings-modal table {
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
}

/* 모든 셀(th, td)의 공통 스타일 */
.settings-modal th,
.settings-modal td {
  padding: 0; /* <<-- 핵심 1: 셀 자체의 패딩을 제거! */
  border-bottom: 1px solid var(--border-color);
  text-align: left;
  vertical-align: middle;
}

/* <<-- 핵심 2: 새로 추가된 .cell-wrapper에 모든 스타일을 위임 -->> */
.cell-wrapper {
  /* 패딩을 셀이 아닌 래퍼에 적용 */
  padding: 0.8rem 1rem;
  
  /* 텍스트 잘림 효과를 여기서 처리 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* Flexbox를 위한 설정 (수직 정렬 등) */
  display: flex;
  align-items: center;
  height: 100%; /* 부모 td의 높이를 꽉 채움 */
}

/* 테이블 헤더(th) 전용 스타일 */
.settings-modal th {
  padding: 1rem 0rem;
  background-color: var(--hover-bg-color);
  font-weight: 600;
  text-align: center;
  color: var(--text-color-light);
}
.settings-modal th .cell-wrapper {
  background-color: transparent; /* th의 배경색이 보이도록 */
}

/* --- 각 열(Column) 너비 재조정 (부모인 th/td에 적용) --- */

.settings-modal th:nth-child(1), .settings-modal td:nth-child(1) { width: 40px; }
.settings-modal th:nth-child(2), .settings-modal td:nth-child(2) { width: 10%; }
.settings-modal th:nth-child(3), .settings-modal td:nth-child(3) { width: 40%; }
.settings-modal th:nth-child(4), .settings-modal td:nth-child(4) { width: 20%; }
.settings-modal th:nth-child(5), .settings-modal td:nth-child(5) { width: 150px; }

/* --- 각 셀 타입별 정렬 --- */

/* 체크박스 셀의 래퍼는 중앙 정렬 */
.checkbox-cell .cell-wrapper {
  justify-content: center;
}

/* <<-- 핵심 3: 액션 버튼 래퍼 스타일 재정의 -->> */
.action-buttons.cell-wrapper {
  justify-content: center; /* 버튼 그룹을 오른쪽 끝으로 */
  gap: 0.75rem;              /* 버튼 사이의 간격 */
  /* margin-right: 10px; */
  /* 텍스트 잘림 효과는 필요 없으므로 제거 */
  /* overflow: visible; */
}
.settings-modal .btn-icon {
  /* 기존의 넓은 좌우 padding을 덮어씁니다. */
  padding: 0.6rem; /* 상하좌우 모두 0.6rem (약 10px)의 여백을 줍니다. */
  min-width: auto;

  /* 아이콘이 중앙에 오도록 라인 높이 조절 (선택사항) */
  line-height: 1; 
  
  /* 배경색을 투명하게 하고 싶을 경우 */
  background: none; 
  color: var(--text-color-light);
}

.settings-modal .btn-icon:hover:not(:disabled) {
  background: var(--hover-bg-color);
  color: var(--primary-color);
}
/* Loader & Toast */
.loader { width: 18px; height: 18px; border: 2px solid #FFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; }
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.toast { position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem; border-radius: 8px; color: white; display: flex; align-items: center; gap: 1rem; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transform: translateX(calc(100% + 20px)); transition: transform 0.5s ease; z-index: 9999; }
.toast.visible { transform: translateX(0); }
.toast.success { background-color: var(--success-color); }
.toast.error { background-color: var(--error-color); }

/* Status Badge Styles */
.status-badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 1rem; font-size: 0.8em; font-weight: 600; text-transform: uppercase; color: white; }
.status-badge.recording { background-color: #e74c3c; } /* Red */
.status-badge.stopped { background-color: #f39c12; } /* Orange */
.status-badge.processing { background-color: #3498db; } /* Blue */
.status-badge.summarized { background-color: #2ecc71; } /* Green */
.status-badge.failed { background-color: #34495e; } /* Dark Gray */
.status-processing, .status-failed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-color-light);
  font-size: 0.9em;
}
.status-failed {
  color: var(--error-color);
}
.loader-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--text-color-light);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 0.8s linear infinite;
}
.summary-select-modal {
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
}
.summary-select-content {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  flex-grow: 1;
  overflow: hidden;
}
.summary-list-panel, .summary-preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.summary-list-panel {
  width: 300px;
  flex-shrink: 0;
}
.summary-preview-panel {
  flex-grow: 1;
}
.summary-list-panel h3, .summary-preview-panel h3 {
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}
.summary-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
}
.summary-item:has(input:checked) {
  background-color: var(--active-bg-color);
  border-color: var(--primary-color);
  font-weight: 600;
}
.summary-item input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}
.summary-text {
  flex-grow: 1;
  overflow-y: auto;
  background-color: var(--hover-bg-color);
  padding: 1rem;
  border-radius: 6px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  line-height: 1.5;
  margin: 0;
}
.import-group {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--hover-bg-color);
  border-radius: 6px;
  margin-top: 0.5rem;
}
.import-inputs {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
.import-inputs input {
  margin: 0;
}
.import-group button {
  flex-shrink: 0;
}
.paste-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--active-bg-color);
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  margin-bottom: 1.5rem;
}
.paste-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-color-dark);
  font-weight: 500;
}

th.checkbox-cell, td.checkbox-cell {
  width: 40px;
  text-align: center;
}
th.checkbox-cell input, td.checkbox-cell input {
  width: 18px;
  height: 18px;
}
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.main-header h1 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.8rem;
}

/* 네비게이션 탭의 알림 배지 */
.notification-badge {
  background-color: var(--error-color);
  color: white;
  margin-left: 0.5rem;
}
.main-nav button.active .notification-badge {
  background-color: white;
  color: var(--primary-color);
}

/* 승인/거절 버튼 스타일 */
.btn-success { background-color: var(--success-color); color: white; }
.btn-success:hover:not(:disabled) { background-color: #27ae60; } /* Darker Green */

.btn-danger { background-color: var(--error-color); color: white; }
.btn-danger:hover:not(:disabled) { background-color: #c0392b; } /* Darker Red */

/* 액션 버튼 정렬 재조정 */
td.actions .action-buttons {
  justify-content: flex-end; /* 가입 요청 테이블에서도 오른쪽 정렬 사용 */
}
.permissions-modal {
  width: 90%;
  max-width: 900px; /* 너비를 적절하게 설정 */
  max-height: 80vh; /* 높이 제한 */
}

/* 모달 내부의 2단 레이아웃 */
.permissions-content {
  display: flex;
  flex-grow: 1; /* 헤더와 액션 영역을 제외한 모든 공간 차지 */
  overflow: hidden; /* 내부 스크롤을 각 패널에 위임 */
  padding: 0; /* 내부 패널에서 패딩을 관리하도록 함 */
}

/* 왼쪽 사용자 목록 사이드바 */
.user-list-sidebar {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
  padding: 1.5rem;
  border-right: 1px solid var(--border-color);
  background-color: var(--hover-bg-color);
}
.user-list-sidebar h3 {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: var(--text-color);
}
.user-list-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.user-list-sidebar li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s, color 0.2s;
}
.user-list-sidebar li:hover {
  background-color: var(--active-bg-color);
}
.user-list-sidebar li.active {
  background-color: var(--primary-color);
  color: white;
}
.user-list-sidebar li.active .role-badge {
  background-color: white;
  color: var(--primary-color);
}
.role-badge {
  font-size: 0.75em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  background-color: var(--active-bg-color);
  color: var(--text-color-light);
  font-weight: 600;
}

/* 오른쪽 권한 설정 메인 영역 */
.permission-config-main {
  flex-grow: 1;
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
  padding: 1.5rem;
}
.permission-config-main h3 {
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* 권한 설정 트리 구조 */
.permission-tree {
  margin: 1.5rem 0;
}
.project-group-perms {
  margin-bottom: 2rem;
}
.project-group-perms h4 {
  margin: 0 0 1rem 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
  font-size: 1.1rem;
}
.part-item-perms {
  margin-bottom: 0.75rem;
  padding-left: 0.5rem;
}
.part-item-perms label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}
.part-item-perms input[type="checkbox"] {
  width: 18px;
  height: 18px;
  /* 모던한 체크박스 스타일 (선택사항) */
  accent-color: var(--primary-color);
}

/* 권한 저장 버튼이 있는 액션 영역 */
.permission-config-main .form-actions {
  display: flex;
  justify-content: flex-end; /* 버튼을 오른쪽으로 정렬 */
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}
</style>