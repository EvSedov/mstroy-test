import type { ColDef, GridOptions } from "ag-grid-community";
import type { AgGridConfig, TreeDataConfig } from "../types/AgGridConfig";
import { TableMode } from "../types/TableMode";

export const createColumnDefs = (mode: TableMode): ColDef[] => {
  return [
    {
      field: "rowIndex",
      headerName: "№ п\\п",
      valueGetter: (params) =>
        // console.log({ params }),
        params.node && typeof params.node.sourceRowIndex === "number"
          ? params.node.sourceRowIndex + 1
          : "",
      width: 60,
      sortable: false,
      filter: false,
    },
    {
      field: "category",
      headerName: "Категория",
      cellRenderer: "agGroupCellRenderer",
      rowGroup: true,
      showRowGroup: true,
      cellRendererParams: {
        suppressCount: true,
      },
    },
    {
      field: "label",
      headerName: "Наименование",
      flex: 1,
      cellRendererParams: {
        suppressCount: true,
        innerRenderer:
          mode === TableMode.EDIT ? "labelCellRenderer" : undefined,
      },
      editable: mode === TableMode.EDIT,
    },
  ];
};

export const createTreeDataConfig = (): TreeDataConfig => ({
  treeData: true,
  animateRows: true,
  groupDefaultExpanded: 0,
  getDataPath: (data) => data.path || [data.label],
  autoGroupColumnDef: {
    minWidth: 200,
  },
});

// Функция для применения кастомных CSS переменных темы
export const applyCustomTheme = () => {
  if (typeof document !== "undefined") {
    const isMobile = window.innerWidth <= 768;
    const root = document.documentElement;

    // Устанавливаем CSS переменные для кастомизации темы Quartz
    root.style.setProperty("--ag-header-height", isMobile ? "44px" : "48px");
    root.style.setProperty("--ag-row-height", isMobile ? "36px" : "40px");
    root.style.setProperty("--ag-font-size", isMobile ? "13px" : "14px");
    root.style.setProperty(
      "--ag-font-family",
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    );

    // Цветовая схема
    root.style.setProperty("--ag-background-color", "#ffffff");
    root.style.setProperty("--ag-header-background-color", "#f8f9fa");
    root.style.setProperty("--ag-odd-row-background-color", "#fbfbfb");
    root.style.setProperty("--ag-border-color", "#e9ecef");
    root.style.setProperty("--ag-header-border-color", "#dee2e6");

    // Цвета текста
    root.style.setProperty("--ag-foreground-color", "#212529");
    root.style.setProperty("--ag-header-foreground-color", "#495057");

    // Интерактивные состояния
    root.style.setProperty("--ag-row-hover-color", "#f1f3f4");
    root.style.setProperty("--ag-selected-row-background-color", "#e3f2fd");

    // Отступы
    root.style.setProperty(
      "--ag-cell-horizontal-padding",
      isMobile ? "8px" : "12px"
    );
    root.style.setProperty("--ag-border-radius", "4px");
  }
};

export const createGridOptions = (mode: TableMode): GridOptions => {
  const treeConfig = createTreeDataConfig();

  // Применяем кастомную тему
  applyCustomTheme();

  // Определяем размеры в зависимости от размера экрана
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return {
    columnDefs: createColumnDefs(mode),
    ...treeConfig,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: isMobile ? 80 : 100,
    },
    rowSelection: {
      mode: "singleRow",
      enableClickSelection: false,
    },
    cellSelection: false,
    suppressMenuHide: true,
    enableCellTextSelection: true,
    onGridReady: (params) => {
      params.api.sizeColumnsToFit();
    },
  };
};

export const createAgGridConfig = (mode: TableMode): AgGridConfig => ({
  columnDefs: createColumnDefs(mode),
  gridOptions: createGridOptions(mode),
});
