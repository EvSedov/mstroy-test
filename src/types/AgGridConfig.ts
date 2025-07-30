import type { ColDef, GridOptions, GridApi } from "ag-grid-community";

export interface AgGridConfig {
  columnDefs: ColDef[];
  gridOptions: GridOptions;
}

export interface AgGridInstance {
  gridApi: GridApi | null;
}

export interface TreeDataConfig {
  treeData: boolean;
  animateRows: boolean;
  groupDefaultExpanded: number;
  getDataPath: (data: any) => string[];
  autoGroupColumnDef: ColDef;
}

export interface AgGridThemeParams {
  headerHeight?: number;
  rowHeight?: number;
  fontSize?: number;
  fontFamily?: string;
  backgroundColor?: string;
  headerBackgroundColor?: string;
  oddRowBackgroundColor?: string;
  borderColor?: string;
  [key: string]: any;
}

export interface AgGridTheme {
  name: string;
  params?: AgGridThemeParams;
}

export interface AgGridCallbacks {
  onGridReady?: (params: any) => void;
  onRowExpanded?: (params: any) => void;
  onRowCollapsed?: (params: any) => void;
  onCellValueChanged?: (params: any) => void;
}

export interface CustomCellRendererParams {
  value: any;
  data: any;
  node: any;
  colDef: ColDef;
  context: any;
  api: GridApi;
}
