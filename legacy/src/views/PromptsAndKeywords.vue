<template>
  <div class="container">
    <router-link to="/" class="back-button">Back to Dashboard</router-link>
    <h1>Prompts and Keywords</h1>

    <!-- Prompts Section -->
    <section>
      <h2>Prompts</h2>
      <div class="add-form-complex">
        <h3>Add New Prompt</h3>
        <div class="form-group">
          <label>Name</label>
          <input v-model="newPrompt.name" placeholder="New Prompt Name" required />
        </div>
        <div class="form-group">
          <label><input type="checkbox" v-model="newPrompt.is_global" /> Is Global</label>
        </div>

        <div v-for="(p, index) in newPrompt.prompts" :key="index" class="prompt-sub-item">
          <select v-model="p.type">
            <option>system</option>
            <option>prefix</option>
            <option>suffix</option>
          </select>
          <textarea v-model="p.prompt_text" rows="3" placeholder="Prompt content..."></textarea>
          <button @click="removeSubPromptFromNew(index)" class="remove-btn">Remove</button>
        </div>
        <button @click="addSubPromptToNew" class="add-btn">Add Prompt Item</button>
        <button @click="createPrompt" class="submit-btn">Create Prompt</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Is Global</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prompt in prompts" :key="prompt.id">
            <td>{{ prompt.name }}</td>
            <td>{{ prompt.is_global }}</td>
            <td class="actions">
              <button @click="editItem(prompt, 'prompt')">Edit</button>
              <button @click="deletePrompt(prompt.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Keywords Section -->
    <section>
      <h2>Keywords</h2>
       <div class="add-form-complex">
        <h3>Add New Keyword Set</h3>
        <div class="form-group">
          <label>Name</label>
          <input v-model="newKeyword.name" placeholder="New Keyword Set Name" required />
        </div>
        <div class="form-group">
          <label><input type="checkbox" v-model="newKeyword.is_global" /> Is Global</label>
        </div>
        
        <div v-for="(item, index) in newKeywordItems" :key="index" class="keyword-sub-item">
          <input v-model="item.key" placeholder="Keyword" />
          <input v-model="item.value" placeholder="Description" />
          <button @click="removeKeywordItem(index)" class="remove-btn">Remove</button>
        </div>
        <button @click="addKeywordItem" class="add-btn">Add Keyword</button>

        <button @click="createKeyword" class="submit-btn">Add Keyword Set</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Is Global</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="keyword in keywords" :key="keyword.id">
            <td>{{ keyword.name }}</td>
            <td>{{ keyword.is_global }}</td>
            <td class="actions">
              <button @click="editItem(keyword, 'keyword')">Edit</button>
              <button @click="deleteKeyword(keyword.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Edit Modal -->
    <div v-if="isEditModalVisible" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <h2>Edit {{ editingType }}</h2>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label for="edit-name">Name</label>
            <input id="edit-name" v-model="editingItem.name" required />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="editingItem.is_global" />
              Is Global
            </label>
          </div>
          
          <div v-if="editingType === 'prompt'">
            <div v-for="(p, index) in editingItem.prompts" :key="index" class="prompt-sub-item">
              <select v-model="p.type">
                <option>system</option>
                <option>prefix</option>
                <option>suffix</option>
              </select>
              <textarea v-model="p.prompt_text" rows="4"></textarea>
              <button type="button" @click="removeSubPromptFromEditing(index)" class="remove-btn">Remove</button>
            </div>
            <button type="button" @click="addSubPromptToEditing" class="add-btn">Add Prompt Item</button>
          </div>

          <div v-if="editingType === 'keyword'">
            <div v-for="(item, index) in editingItem.keywordItems" :key="index" class="keyword-sub-item">
              <input v-model="item.key" placeholder="Keyword" />
              <input v-model="item.value" placeholder="Description" />
              <button type="button" @click="removeKeywordItemFromEditing(index)" class="remove-btn">Remove</button>
            </div>
            <button type="button" @click="addKeywordItemToEditing" class="add-btn">Add Keyword</button>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal">Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '../api';

export default {
  name: 'PromptsAndKeywords',
  setup() {
    const prompts = ref([]);
    const keywords = ref([]);
    const newPrompt = ref({
      name: '',
      is_global: false,
      prompts: []
    });
    const newKeyword = ref({ name: '', is_global: false });
    const newKeywordItems = ref([{ key: '', value: '' }]);

    const isEditModalVisible = ref(false);
    const editingItem = ref(null);
    const editingType = ref('');

    const addSubPromptToNew = () => {
      newPrompt.value.prompts.push({ type: 'system', prompt_text: '' });
    };

    const removeSubPromptFromNew = (index) => {
      newPrompt.value.prompts.splice(index, 1);
    };
    
    const addKeywordItem = () => {
      newKeywordItems.value.push({ key: '', value: '' });
    };

    const removeKeywordItem = (index) => {
      newKeywordItems.value.splice(index, 1);
    };

    const addSubPromptToEditing = () => {
      if (editingItem.value && editingType.value === 'prompt') {
        editingItem.value.prompts.push({ type: 'system', prompt_text: '' });
      }
    };

    const removeSubPromptFromEditing = (index) => {
      if (editingItem.value && editingType.value === 'prompt') {
        editingItem.value.prompts.splice(index, 1);
      }
    };

    const fetchPrompts = async () => {
      try {
        prompts.value = await api.getPrompts();
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    const fetchKeywords = async () => {
      try {
        keywords.value = await api.getKeywords();
      } catch (error) {
        console.error('Error fetching keywords:', error);
      }
    };

    const createPrompt = async () => {
      try {
        const payload = { ...newPrompt.value };
        if (payload.prompts.length === 0 || payload.prompts.every(p => p.prompt_text.trim() === '')) {
            alert("Please add and fill in at least one prompt item.");
            return;
        }
        payload.prompts = payload.prompts.filter(p => p.prompt_text.trim() !== '');

        const createdPrompt = await api.createPrompt(payload);
        prompts.value.push(createdPrompt);
        newPrompt.value = { name: '', is_global: false, prompts: [] };
      } catch (error) {
        console.error('Error creating prompt:', error);
      }
    };

    const deletePrompt = async (id) => {
      if (!confirm('Are you sure you want to delete this prompt?')) return;
      try {
        await api.deletePrompt(id);
        prompts.value = prompts.value.filter((p) => p.id !== id);
      } catch (error) {
        console.error('Error deleting prompt:', error);
      }
    };

    const createKeyword = async () => {
      try {
        const parsedKeywords = newKeywordItems.value.reduce((acc, item) => {
          if (item.key.trim()) {
            acc[item.key.trim()] = item.value.trim();
          }
          return acc;
        }, {});

        if (Object.keys(parsedKeywords).length === 0) {
            alert("Please add at least one keyword.");
            return;
        }

        const payload = { ...newKeyword.value, keywords: parsedKeywords };
        const createdKeyword = await api.createKeyword(payload);
        keywords.value.push(createdKeyword);
        newKeyword.value.name = '';
        newKeyword.value.is_global = false;
        newKeywordItems.value = [{ key: '', value: '' }];
      } catch (error) {
        console.error('Error creating keyword:', error);
      }
    };

    const deleteKeyword = async (id) => {
      if (!confirm('Are you sure you want to delete this keyword set?')) return;
      try {
        await api.deleteKeyword(id);
        keywords.value = keywords.value.filter((k) => k.id !== id);
      } catch (error) {
        console.error('Error deleting keyword:', error);
      }
    };

    const editItem = (item, type) => {
      editingItem.value = JSON.parse(JSON.stringify(item));
      editingType.value = type;

      if (type === 'keyword') {
        editingItem.value.keywordItems = Object.entries(item.keywords || {}).map(([key, value]) => ({ key, value }));
      }

      isEditModalVisible.value = true;
    };
    
    const addKeywordItemToEditing = () => {
      if (editingItem.value && editingType.value === 'keyword') {
        editingItem.value.keywordItems.push({ key: '', value: '' });
      }
    };

    const removeKeywordItemFromEditing = (index) => {
      if (editingItem.value && editingType.value === 'keyword') {
        editingItem.value.keywordItems.splice(index, 1);
      }
    };

    const closeEditModal = () => {
      isEditModalVisible.value = false;
      editingItem.value = null;
      editingType.value = '';
    };

    const saveEdit = async () => {
      if (!editingItem.value) return;
      try {
        let payload = { ...editingItem.value };

        if (editingType.value === 'prompt') {
          const updatedPrompt = await api.updatePrompt(payload.id, payload);
          const index = prompts.value.findIndex(p => p.id === updatedPrompt.id);
          if (index !== -1) prompts.value[index] = updatedPrompt;
        } else if (editingType.value === 'keyword') {
          payload.keywords = payload.keywordItems.reduce((acc, item) => {
            if (item.key.trim()) {
              acc[item.key.trim()] = item.value.trim();
            }
            return acc;
          }, {});
          delete payload.keywordItems; 
          
          const updatedKeyword = await api.updateKeyword(payload.id, payload);
          const index = keywords.value.findIndex(k => k.id === updatedKeyword.id);
          if (index !== -1) keywords.value[index] = updatedKeyword;
        }
        closeEditModal();
      } catch (error) {
        console.error(`Error updating ${editingType.value}:`, error);
      }
    };

    onMounted(() => {
      fetchPrompts();
      fetchKeywords();
    });

    return {
      prompts,
      keywords,
      newPrompt,
      newKeyword,
      newKeywordItems,
      addKeywordItem,
      removeKeywordItem,
      createPrompt,
      deletePrompt,
      createKeyword,
      deleteKeyword,
      isEditModalVisible,
      editingItem,
      editingType,
      editItem,
      closeEditModal,
      saveEdit,
      addSubPromptToNew,
      removeSubPromptFromNew,
      addSubPromptToEditing,
      removeSubPromptFromEditing,
      addKeywordItemToEditing,
      removeKeywordItemFromEditing,
    };
  },
};
</script>

<style scoped>
.container {
  padding: 2rem;
  max-width: 1000px;
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
section {
  margin-bottom: 3rem;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}
th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}
th {
  background-color: #f8f9fa;
}
.add-form-complex {
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.add-form-complex h3 {
    margin-top: 0;
}
.actions button {
  margin-right: 0.5rem;
}
.delete-btn {
    background-color: #e74c3c;
    color: white;
}
button {
    cursor: pointer;
    align-self: flex-start;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}
.form-group {
    margin-bottom: 1rem;
}
.form-group label {
    display: block;
    margin-bottom: 0.5rem;
}
.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}
.form-group input[type="checkbox"] {
    width: auto;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.prompt-sub-item, .keyword-sub-item {
  display: grid;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
}
.prompt-sub-item {
  grid-template-columns: 150px 1fr auto;
}
.keyword-sub-item {
  grid-template-columns: 1fr 1fr auto;
}
.remove-btn, .add-btn, .submit-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    color: white;
}
.remove-btn {
    background-color: #e74c3c;
}
.add-btn {
    background-color: #3498db;
    margin-top: 1rem;
}
.submit-btn {
    background-color: #2ecc71;
    margin-top: 1rem;
}
</style>
