import { TreeStore, type TreeItem } from "./TreeStore";

describe("TreeStore", () => {
  const items: TreeItem[] = [
    { id: 1, parent: null, label: "Item 1" },
    { id: "2", parent: 1, label: "Item 2" },
    { id: 3, parent: 1, label: "Item 3" },
    { id: 4, parent: "2", label: "Item 4" },
    { id: 5, parent: "2", label: "Item 5" },
    { id: 6, parent: "2", label: "Item 6" },
    { id: 7, parent: 4, label: "Item 7" },
    { id: 8, parent: 4, label: "Item 8" },
  ];

  let store: TreeStore;

  beforeEach(() => {
    store = new TreeStore(items);
  });

  it("should return all items", () => {
    expect(store.getAll()).toEqual(items);
  });

  it("should return a specific item by id", () => {
    expect(store.getItem(1)).toEqual({ id: 1, parent: null, label: "Item 1" });
    expect(store.getItem("2")).toEqual({ id: "2", parent: 1, label: "Item 2" });
    expect(store.getItem(999)).toBeUndefined();
  });

  it("should return direct children of an item", () => {
    expect(store.getChildren(1)).toEqual([
      { id: "2", parent: 1, label: "Item 2" },
      { id: 3, parent: 1, label: "Item 3" },
    ]);
    expect(store.getChildren("2")).toEqual([
      { id: 4, parent: "2", label: "Item 4" },
      { id: 5, parent: "2", label: "Item 5" },
      { id: 6, parent: "2", label: "Item 6" },
    ]);
    expect(store.getChildren(8)).toEqual([]);
    expect(store.getChildren(999)).toEqual([]);
  });

  it("should return all children recursively", () => {
    const allChildrenOf2 = store.getAllChildren("2").map((item) => item.id);
    expect(allChildrenOf2).toEqual(expect.arrayContaining([4, 5, 6, 7, 8]));
    expect(allChildrenOf2.length).toBe(5);

    const allChildrenOf4 = store.getAllChildren(4).map((item) => item.id);
    expect(allChildrenOf4).toEqual(expect.arrayContaining([7, 8]));
    expect(allChildrenOf4.length).toBe(2);

    expect(store.getAllChildren(1).map((item) => item.id)).toEqual(
      expect.arrayContaining(["2", 3, 4, 5, 6, 7, 8])
    );
    expect(store.getAllChildren(1).length).toBe(7);

    expect(store.getAllChildren(8)).toEqual([]);
  });

  it("should return all parents in correct order", () => {
    expect(store.getAllParents(8)).toEqual([
      { id: 4, parent: "2", label: "Item 4" },
      { id: "2", parent: 1, label: "Item 2" },
      { id: 1, parent: null, label: "Item 1" },
    ]);
    expect(store.getAllParents(1)).toEqual([]);
    expect(store.getAllParents(999)).toEqual([]);
  });

  it("should add a new item", () => {
    const newItem: TreeItem = { id: 9, parent: 3, label: "Item 9" };
    store.addItem(newItem);
    expect(store.getItem(9)).toEqual(newItem);
    expect(store.getAll().length).toBe(9); // 8 + 1 = 9
    expect(store.getChildren(3)).toEqual([newItem]);
  });

  it("should remove an item and its children", () => {
    store.removeItem("2");
    expect(store.getItem("2")).toBeUndefined();
    expect(store.getItem(4)).toBeUndefined();
    expect(store.getItem(7)).toBeUndefined();
    expect(store.getAll().length).toBe(items.length - 6); // 8 - 6 = 2 (items '2', 4,5,6,7,8 removed)
    expect(store.getChildren(1)).toEqual([
      { id: 3, parent: 1, label: "Item 3" },
    ]);
  });

  it("should update an item", () => {
    const updatedItem: TreeItem = {
      id: 1,
      parent: null,
      label: "Updated Item 1",
    };
    store.updateItem(updatedItem);
    expect(store.getItem(1)).toEqual(updatedItem);

    const moveItem: TreeItem = { id: 3, parent: "2", label: "Item 3" };
    store.updateItem(moveItem);
    expect(store.getItem(3)?.parent).toBe("2");
    expect(store.getChildren(1)).toEqual([
      { id: "2", parent: 1, label: "Item 2" },
    ]);
    expect(store.getChildren("2")).toEqual(
      expect.arrayContaining([
        { id: 4, parent: "2", label: "Item 4" },
        { id: 5, parent: "2", label: "Item 5" },
        { id: 6, parent: "2", label: "Item 6" },
        { id: 3, parent: "2", label: "Item 3" },
      ])
    );
  });

  it("should set new items", () => {
    const newItems: TreeItem[] = [
      { id: 10, parent: null, label: "New Item 10" },
      { id: 11, parent: 10, label: "New Item 11" },
    ];
    store.setItems(newItems);
    expect(store.getAll()).toEqual(newItems);
    expect(store.getItem(1)).toBeUndefined();
    expect(store.getChildren(10)).toEqual([
      { id: 11, parent: 10, label: "New Item 11" },
    ]);
  });
});
