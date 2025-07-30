export interface TreeItem {
  id: string | number;
  parent: string | number | null;
  label: string; // Assuming 'label' is always present based on buildHierarchyPath
  [key: string]: any; // Для произвольных полей
}
