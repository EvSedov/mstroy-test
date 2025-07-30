import { createApp } from "vue";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { TreeDataModule, RowGroupingModule } from "ag-grid-enterprise";
import "./style.css";
import App from "./App.vue";

// Регистрируем все модули AG Grid Community и Enterprise
ModuleRegistry.registerModules([
  AllCommunityModule,
  TreeDataModule,
  RowGroupingModule,
]);

createApp(App).mount("#app");
