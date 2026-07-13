import { describe, expect, it } from "vitest";
import { SlidingWindowStore } from "../src/core/SlidingWindowStore.js";

describe("SlidingWindowStore", () => {
  it("keeps values inside the window", () => {
    const store = new SlidingWindowStore<string>();
    store.add("key", 100, "a");
    store.add("key", 200, "b");
    expect(store.values("key", 150)).toEqual(["b"]);
  });
  it("counts active entries", () => {
    const store = new SlidingWindowStore<number>();
    store.add("key", 100, 1);
    store.add("key", 200, 2);
    expect(store.count("key", 0)).toBe(2);
  });
  it("clears matching scopes", () => {
    const store = new SlidingWindowStore<number>();
    store.add("a", 100, 1);
    store.add("b", 100, 2);
    store.clear((key) => key === "a");
    expect(store.count("a", 0)).toBe(0);
    expect(store.count("b", 0)).toBe(1);
  });
});
