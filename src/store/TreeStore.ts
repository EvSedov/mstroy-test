import type { TreeItem } from "../types/TreeItem";

export class TreeStore {
  private items: TreeItem[];
  private itemsMap: Map<string | number, TreeItem>;
  private childrenMap: Map<string | number, (string | number)[]>;

  constructor(items: TreeItem[]) {
    this.items = items;
    this.itemsMap = new Map();
    this.childrenMap = new Map();
    this.initializeStore();
  }

  private initializeStore(): void {
    this.items.forEach((item) => {
      this.itemsMap.set(item.id, item);
      if (item.parent !== null) {
        if (!this.childrenMap.has(item.parent)) {
          this.childrenMap.set(item.parent, []);
        }
        this.childrenMap.get(item.parent)?.push(item.id);
      }
    });
  }

  getAll(): TreeItem[] {
    return this.items;
  }

  getItem(id: string | number): TreeItem | undefined {
    return this.itemsMap.get(id);
  }

  getChildren(id: string | number): TreeItem[] {
    const childrenIds = this.childrenMap.get(id) || [];
    return childrenIds
      .map((childId) => this.itemsMap.get(childId))
      .filter((item) => item !== undefined) as TreeItem[];
  }

  getAllChildren(id: string | number): TreeItem[] {
    const allChildren: TreeItem[] = [];
    const queue: (string | number)[] = [id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const directChildrenIds = this.childrenMap.get(currentId) || [];

      directChildrenIds.forEach((childId) => {
        const childItem = this.itemsMap.get(childId);
        if (childItem) {
          allChildren.push(childItem);
          queue.push(childId); // Добавляем дочерний элемент в очередь для дальнейшего обхода
        }
      });
    }
    return allChildren;
  }

  getAllParents(id: string | number): TreeItem[] {
    const parents: TreeItem[] = [];
    let currentItem = this.getItem(id);

    while (currentItem && currentItem.parent !== null) {
      const parentItem = this.getItem(currentItem.parent);
      if (parentItem) {
        parents.push(parentItem);
        currentItem = parentItem;
      } else {
        // Если родитель не найден, прерываем цепочку
        currentItem = undefined;
      }
    }
    return parents;
  }

  addItem(item: TreeItem): void {
    this.items.push(item);
    this.itemsMap.set(item.id, item);

    if (item.parent !== null) {
      if (!this.childrenMap.has(item.parent)) {
        this.childrenMap.set(item.parent, []);
      }
      this.childrenMap.get(item.parent)?.push(item.id);
    }
  }

  removeItem(id: string | number): void {
    const itemToRemove = this.getItem(id);
    if (!itemToRemove) {
      return; // Элемент не найден
    }

    const idsToRemove: Set<string | number> = new Set();
    idsToRemove.add(id);

    // Добавляем все дочерние элементы для удаления
    const allChildren = this.getAllChildren(id);
    allChildren.forEach((child) => idsToRemove.add(child.id));

    // Удаляем из items и itemsMap
    this.items = this.items.filter((item) => !idsToRemove.has(item.id));
    idsToRemove.forEach((id) => this.itemsMap.delete(id));

    // Удаляем из childrenMap и обновляем ссылки на удаленные элементы
    this.childrenMap.forEach((childrenIds, parentId) => {
      this.childrenMap.set(
        parentId,
        childrenIds.filter((childId) => !idsToRemove.has(childId))
      );
    });
    idsToRemove.forEach((id) => this.childrenMap.delete(id));

    // Если у удаляемого элемента был родитель, нужно обновить его список дочерних элементов
    if (itemToRemove.parent !== null) {
      const parentChildren = this.childrenMap.get(itemToRemove.parent);
      if (parentChildren) {
        this.childrenMap.set(
          itemToRemove.parent,
          parentChildren.filter((childId) => childId !== id)
        );
      }
    }
  }

  updateItem(updatedItem: TreeItem): void {
    const existingItem = this.itemsMap.get(updatedItem.id);
    if (!existingItem) {
      console.warn(`Item with id ${updatedItem.id} not found.`);
      return;
    }

    // Обновляем в itemsMap
    this.itemsMap.set(updatedItem.id, { ...existingItem, ...updatedItem });

    // Обновляем в items
    const index = this.items.findIndex((item) => item.id === updatedItem.id);
    if (index !== -1) {
      this.items[index] = { ...existingItem, ...updatedItem };
    }

    // Если изменился parent, обновляем childrenMap
    if (existingItem.parent !== updatedItem.parent) {
      // Удаляем из старого родителя
      if (existingItem.parent !== null) {
        const oldParentChildren = this.childrenMap.get(existingItem.parent);
        if (oldParentChildren) {
          this.childrenMap.set(
            existingItem.parent,
            oldParentChildren.filter((childId) => childId !== updatedItem.id)
          );
        }
      }

      // Добавляем к новому родителю
      if (updatedItem.parent !== null) {
        if (!this.childrenMap.has(updatedItem.parent)) {
          this.childrenMap.set(updatedItem.parent, []);
        }
        this.childrenMap.get(updatedItem.parent)?.push(updatedItem.id);
      }
    }
  }

  setItems(newItems: TreeItem[]): void {
    this.items = newItems;
    this.itemsMap.clear();
    this.childrenMap.clear();
    this.initializeStore();
  }

  getFormattedItems(): any[] {
    return this.items.map((item) => ({
      ...item,
      category: this.getChildren(item.id).length > 0 ? "Группа" : "Элемент",
      orgHierarchy: this.buildHierarchyPath(item.id),
    }));
  }

  private buildHierarchyPath(itemId: string | number): string[] {
    const path: string[] = [];
    let currentItem = this.getItem(itemId);

    while (currentItem) {
      path.unshift(currentItem.label);
      if (currentItem.parent === null) {
        break;
      }
      currentItem = this.getItem(currentItem.parent);
    }

    return path;
  }
}
