import type { TreeItem } from "../types/TreeItem";

export interface AgGridTreeData extends TreeItem {
  path: string[];
  children?: AgGridTreeData[];
  category: "Группа" | "Элемент";
}

/**
 * Конвертирует данные TreeStore в формат древовидных данных AgGrid
 */
export function convertTreeStoreToAgGrid(items: TreeItem[]): AgGridTreeData[] {
  const itemsMap = new Map<string | number, TreeItem>();
  const childrenMap = new Map<string | number, TreeItem[]>();

  // Создаем карты для эффективного поиска
  items.forEach((item) => {
    itemsMap.set(item.id, item);
  });

  items.forEach((item) => {
    if (item.parent !== null) {
      if (!childrenMap.has(item.parent)) {
        childrenMap.set(item.parent, []);
      }
      childrenMap.get(item.parent)!.push(item);
    }
  });

  // Строим путь для каждого элемента
  const buildPath = (item: TreeItem): string[] => {
    const path: string[] = [];
    let current = item;

    while (current) {
      path.unshift(current.label || String(current.id));
      if (current.parent === null) break;
      current = itemsMap.get(current.parent)!;
    }

    return path;
  };

  // Конвертируем в формат AgGrid
  const convertItem = (item: TreeItem): AgGridTreeData => {
    const children = childrenMap.get(item.id) || [];
    const hasChildren = children.length > 0;

    return {
      ...item,
      path: buildPath(item),
      children: hasChildren ? children.map(convertItem) : undefined,
      category: hasChildren ? "Группа" : "Элемент",
    };
  };

  // Получаем корневые элементы (элементы без родителя)
  const rootItems = items.filter((item) => item.parent === null);

  return rootItems.map(convertItem);
}

/**
 * Выравнивает древовидные данные AgGrid для данных строк
 */
export function flattenAgGridTreeData(
  treeData: AgGridTreeData[]
): AgGridTreeData[] {
  const result: AgGridTreeData[] = [];

  const flatten = (items: AgGridTreeData[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children) {
        flatten(item.children);
      }
    });
  };

  flatten(treeData);
  return result;
}
