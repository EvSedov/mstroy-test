import type { GridApi, GridOptions } from "ag-grid-community";
import type { AgGridInstance, AgGridCallbacks } from "../types/AgGridConfig";
import { TableMode } from "../types/TableMode";
import { createGridOptions } from "../config/agGridConfig";

export class AgGridService {
  private gridApi: GridApi | null = null;
  private currentMode: TableMode = TableMode.VIEW;

  constructor(private callbacks?: AgGridCallbacks) {}

  /**
   * Инициализирует AgGrid с заданным режимом
   */
  initialize(mode: TableMode = TableMode.VIEW): GridOptions {
    this.currentMode = mode;
    const gridOptions = createGridOptions(mode);

    // Добавляем колбэки если предоставлены
    if (this.callbacks) {
      Object.assign(gridOptions, this.callbacks);
    }

    // Переопределяем onGridReady для сохранения ссылок на API
    const originalOnGridReady = gridOptions.onGridReady;
    gridOptions.onGridReady = (params) => {
      this.gridApi = params.api;

      // Вызываем оригинальный колбэк если существует
      if (originalOnGridReady) {
        originalOnGridReady(params);
      }
    };

    return gridOptions;
  }

  /**
   * Получает текущий экземпляр AgGrid
   */
  getInstance(): AgGridInstance {
    return {
      gridApi: this.gridApi,
    };
  }

  /**
   * Обновляет режим сетки и обновляет колонки
   */
  updateMode(mode: TableMode): void {
    if (!this.gridApi) {
      console.warn("AgGrid не инициализирован");
      return;
    }

    this.currentMode = mode;
    const newGridOptions = createGridOptions(mode);

    // Обновляем определения колонок
    this.gridApi.setGridOption("columnDefs", newGridOptions.columnDefs || []);

    // Обновляем сетку
    this.gridApi.refreshCells();
  }

  /**
   * Устанавливает данные строк
   */
  setRowData(data: any[]): void {
    if (!this.gridApi) {
      console.warn("AgGrid не инициализирован");
      return;
    }

    this.gridApi.setGridOption("rowData", data);
  }

  /**
   * Обновляет сетку
   */
  refresh(): void {
    if (!this.gridApi) {
      console.warn("AgGrid не инициализирован");
      return;
    }

    this.gridApi.refreshCells();
  }

  /**
   * Подгоняет колонки по размеру
   */
  sizeColumnsToFit(): void {
    if (!this.gridApi) {
      console.warn("AgGrid не инициализирован");
      return;
    }

    this.gridApi.sizeColumnsToFit();
  }

  /**
   * Получает текущий режим
   */
  getCurrentMode(): TableMode {
    return this.currentMode;
  }

  /**
   * Разворачивает все строки
   */
  expandAll(): void {
    if (!this.gridApi) {
      console.warn("AgGrid не инициализирован");
      return;
    }

    this.gridApi.expandAll();
  }

  /**
   * Сворачивает все строки
   */
  collapseAll(): void {
    if (!this.gridApi) {
      console.warn("AgGrid не инициализирован");
      return;
    }

    this.gridApi.collapseAll();
  }

  /**
   * Уничтожает сетку
   */
  destroy(): void {
    if (this.gridApi) {
      this.gridApi.destroy();
      this.gridApi = null;
    }
  }
}
