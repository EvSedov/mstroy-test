<script setup lang="ts">
import { ref } from "vue";
import AgGridExample from "./components/AgGridExample.vue";
import { TableMode } from "./types/TableMode";
import { TreeStore } from "./store/TreeStore";

// Тестовые данные
const testData = ref<any[]>([]);
const loadedFiles = ref<
  { name: string; data: any[]; date: string; status: string }[]
>([]);
const selectedDatasetName = ref<string | null>(null);
const isDropdownOpen = ref(false);

const currentMode = ref(TableMode.VIEW);

const fileInput = ref<HTMLInputElement | null>(null);
const treeStore = new TreeStore([]);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        treeStore.setItems(data);
        console.log({ treeStore });
        const formattedData = treeStore.getFormattedItems();
        testData.value = formattedData;

        const now = new Date();
        const dateString = now.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }); // Формат 05.05.25

        // Добавляем файл в список загруженных
        const newFileEntry = {
          name: file.name,
          data: formattedData,
          date: dateString,
          status: "Временный файл", // Указываем, что файл временный
        };

        const existingIndex = loadedFiles.value.findIndex(
          (f) => f.name === file.name
        );
        if (existingIndex !== -1) {
          loadedFiles.value.splice(existingIndex, 1);
        }
        loadedFiles.value.unshift(newFileEntry); // Добавляем в начало
        if (loadedFiles.value.length > 10) {
          loadedFiles.value.pop(); // Удаляем старейший, если больше 10
        }
        selectedDatasetName.value = file.name;
        // Очищаем input, чтобы можно было снова выбрать тот же файл
        if (fileInput.value) {
          fileInput.value.value = "";
        }
      } catch (error) {
        console.error("Ошибка при чтении или парсинге файла:", error);
        alert(
          "Не удалось прочитать или обработать файл. Убедитесь, что это валидный JSON."
        );
      }
    };
    reader.readAsText(file);
  }
};

const selectDataset = (fileName: string) => {
  const selected = loadedFiles.value.find((f) => f.name === fileName);
  if (selected) {
    testData.value = selected.data;
    selectedDatasetName.value = fileName;
  }
  isDropdownOpen.value = false; // Закрываем выпадающий список после выбора
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (event: FocusEvent) => {
  if (
    event.target &&
    !(event.target as HTMLElement).closest(".dataset-select-wrapper")
  ) {
    isDropdownOpen.value = false;
  }
};
</script>

<template>
  <div class="app">
    <input
      type="file"
      ref="fileInput"
      accept=".json"
      @change="handleFileChange"
      style="display: none"
    />

    <header class="app-header">
      <div class="mode-controls">
        <span>Режим:</span>
        <button
          @click="currentMode = TableMode.VIEW"
          :class="{
            active: currentMode === TableMode.VIEW,
            disabled: testData.length === 0,
          }"
          :disabled="testData.length === 0"
        >
          просмотра
        </button>
        <button
          v-if="testData.length > 0"
          @click="currentMode = TableMode.EDIT"
          :class="{ active: currentMode === TableMode.EDIT }"
        >
          редактирования
        </button>
      </div>
      <div class="header-actions">
        <button
          v-if="currentMode === TableMode.EDIT"
          @click="triggerFileInput"
          class="add-dataset-header-button"
        >
          <span class="icon">+</span> Добавить датасет
        </button>
        <div
          class="dataset-select-wrapper"
          tabindex="0"
          :class="{ disabled: testData.length === 0 }"
          @click="testData.length > 0 && toggleDropdown()"
          @blur="testData.length > 0 && closeDropdown($event)"
        >
          <div class="current-selection">
            <span class="dataset-name">{{
              selectedDatasetName || "Выберите файл"
            }}</span>
            <span class="dropdown-arrow" :class="{ 'arrow-up': isDropdownOpen }"
              >&#9660;</span
            >
          </div>
          <ul class="dropdown-list" v-if="isDropdownOpen">
            <li v-if="loadedFiles.length === 0" class="empty-list-message">
              Список пуст
            </li>
            <li
              v-for="file in loadedFiles"
              :key="file.name"
              @click.stop="selectDataset(file.name)"
              :class="{ selected: file.name === selectedDatasetName }"
            >
              <div class="file-info">
                <span class="file-name">
                  {{ file.name }}
                  <span class="warning-icon">&#9888;</span>
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <div v-if="testData.length > 0" class="content-area">
      <AgGridExample :mode="currentMode" :data="testData" />
    </div>

    <div v-else class="no-data-message">
      <div class="illustration">
        <img
          src="/public/start-img.png"
          alt="Картинка для стартовой страницы"
          class="start-img"
        />
      </div>
      <h2>Нет данных</h2>
      <p>
        Вы можете выбрать файл .json, содержащий данные для отображения в
        таблице
      </p>
      <button @click="triggerFileInput" class="add-dataset-button">
        <span class="icon">+</span> Добавить датасет
      </button>
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f3f2f1;
  position: relative;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 20px;
}

.mode-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-controls span {
  font-weight: bold;
  color: #333;
}

.controls button {
  padding: 8px 16px;
  border: 2px solid #1976d2;
  border-radius: 4px;
  background: white;
  color: #1976d2;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.controls button:hover {
  background: #e3f2fd;
}

.controls button.active {
  background: #1976d2;
  color: white;
}

.controls button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-dataset-header-button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-dataset-header-button:hover {
  background-color: #1565c0;
}

.add-dataset-header-button .icon {
  font-size: 20px;
  line-height: 1;
}

.dataset-select-wrapper {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  outline: none;
  width: max-content;
}

.dataset-select-wrapper.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.current-selection {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  white-space: nowrap;
}

.dataset-name {
  color: #333;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
}

.dropdown-arrow.arrow-up {
  transform: rotate(180deg);
}

.dropdown-list {
  position: absolute;
  top: 105%;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  min-width: 100%;
}

.dropdown-list li {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.dropdown-list li:last-child {
  border-bottom: none;
}

.dropdown-list li:hover {
  background-color: #f0f0f0;
}

.dropdown-list li.selected {
  background-color: #e3f2fd;
  color: #1976d2;
}

.empty-list-message {
  padding: 10px 12px;
  color: #777;
  font-style: italic;
  text-align: center;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.warning-icon {
  color: #ffc107;
  font-size: 16px;
}

.add-new-file-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  color: #1976d2;
  border-top: 1px solid #eee;
}

.upload-button {
  display: none;
}

.content-area {
  margin-top: 20px;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 50px;
}

.no-data-message h2 {
  margin-top: 20px;
  color: #333;
}

.no-data-message p {
  color: #666;
  margin-bottom: 30px;
}

.add-dataset-button {
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-dataset-button:hover {
  background-color: #1565c0;
}

.add-dataset-button .icon {
  font-size: 20px;
  line-height: 1;
}

.illustration img {
  width: 360px;
  height: auto;
}
</style>
