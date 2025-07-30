<template>
  <div class="ag-grid-example">
    <div class="ag-grid-container ag-theme-quartz">
      <AgGridVue
        :treeData="gridOptions.treeData"
        :getDataPath="getDataPath"
        :columnDefs="columnDefs"
        :defaultColDef="gridOptions.defaultColDef"
        :autoGroupColumnDef="gridOptions.autoGroupColumnDef"
        :rowData="rowData"
        :animateRows="gridOptions.animateRows"
        groupDisplayType="custom"
        @grid-ready="onGridReady"
        style="height: 400px; width: 100%"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import type { GridApi, GridReadyEvent } from "ag-grid-community";
import { AgGridService } from "../services/AgGridService";
import { TableMode } from "../types/TableMode";
import { applyCustomTheme } from "../config/agGridConfig";

// Пропсы
interface Props {
  mode?: TableMode;
  data?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  mode: TableMode.VIEW,
  data: () => [],
});

// Реактивное состояние
const gridApi = ref<GridApi | null>(null);
const agGridService = new AgGridService();

// Конфигурация сетки
const gridOptions = agGridService.initialize(props.mode);
const columnDefs = gridOptions.columnDefs;
const rowData = ref(
  props.data.map((item) => ({
    ...item,
    category: props.data.some((child) => child.parent === item.id)
      ? "Группа"
      : "Элемент",
    orgHierarchy: buildHierarchyPath(item.id, props.data),
  }))
);

// Обработчик готовности сетки
const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;
  params.api.sizeColumnsToFit();
  if (rowData.value && rowData.value.length > 0) {
    params.api.setGridOption("rowData", rowData.value);
  }
};

const getDataPath = (data: any) => {
  const path = [];
  let current = data;

  while (current.parent !== null) {
    path.unshift(current.id.toString());
    // Найти родителя в массиве
    current = props.data.find(
      (item) => item.id.toString() == current.parent.toString()
    );
    if (!current) break;
  }

  // Если у элемента нет родителя, он корневой
  if (current.parent === null) {
    path.unshift(current.id.toString());
  }

  return path;
};

// Следим за изменениями данных
watch(
  () => props.data,
  (newData) => {
    // Преобразуем данные для AG Grid
    const transformedData = newData.map((item) => ({
      ...item,
      // Определяем категорию
      category: newData.some((child) => child.parent === item.id)
        ? "Группа"
        : "Элемент",
      // Строим путь для tree data
      orgHierarchy: buildHierarchyPath(item.id, newData),
    }));

    rowData.value = transformedData;
    if (gridApi.value) {
      gridApi.value.setGridOption("rowData", transformedData);
    }
  },
  { deep: true }
);

// Функция для построения пути в иерархии
function buildHierarchyPath(itemId: string | number, data: any[]): string[] {
  const path: string[] = [];
  let currentId = itemId;

  while (currentId !== null) {
    const item = data.find((i) => i.id === currentId);
    if (!item) break;

    path.unshift(item.label);
    currentId = item.parent;
  }

  return path;
}

// Экспортируем методы для родительских компонентов
defineExpose({
  updateMode: (mode: TableMode) => agGridService.updateMode(mode),
  setRowData: (data: any[]) => {
    const transformedData = data.map((item) => ({
      ...item,
      category: data.some((child) => child.parent === item.id)
        ? "Группа"
        : "Элемент",
      orgHierarchy: buildHierarchyPath(item.id, data),
    }));

    rowData.value = transformedData;
    if (gridApi.value) {
      gridApi.value.setGridOption("rowData", transformedData);
    }
  },
  refresh: () => {
    if (gridApi.value) {
      gridApi.value.refreshCells();
    }
  },
  expandAll: () => {
    if (gridApi.value) {
      gridApi.value.expandAll();
    }
  },
  collapseAll: () => {
    if (gridApi.value) {
      gridApi.value.collapseAll();
    }
  },
});

onMounted(() => {
  // Применяем кастомную тему
  applyCustomTheme();

  // Переприменяем тему при изменении размера окна
  const handleResize = () => applyCustomTheme();
  window.addEventListener("resize", handleResize);

  // Инициализация завершена
  console.log("AgGrid компонент инициализирован");
  console.log("Данные:", rowData.value);
  console.log("Определения столбцов (columnDefs):", gridOptions.columnDefs);
  console.log("Объект gridOptions:", gridOptions);

  // Очистка при размонтировании
  return () => {
    window.removeEventListener("resize", handleResize);
  };
});
</script>

<style scoped>
.ag-grid-example {
  height: 400px;
  width: 100%;
}

.ag-grid-container {
  height: 100%;
  width: 100%;
}
</style>
