import { describe, expect, it, vi } from "vitest";
import { AntiNukeEngine } from "../src/core/AntiNukeEngine.js";
import type { AntiNukeModule } from "../src/core/types.js";
import { mutation } from "./helpers.js";

const emptyModule = (id = "empty"): AntiNukeModule => ({ id, name: id, evaluate: () => null });

describe("AntiNukeEngine", () => {
  it("requires at least one module", () => {
    expect(() => new AntiNukeEngine({ modules: [], onIncident: () => undefined })).toThrow();
  });
  it("rejects duplicate ids", () => {
    expect(
      () =>
        new AntiNukeEngine({
          modules: [emptyModule(), emptyModule()],
          onIncident: () => undefined,
        }),
    ).toThrow();
  });
  it("honors shouldIgnore", async () => {
    const module: AntiNukeModule = { id: "spy", name: "spy", evaluate: vi.fn(() => null) };
    const engine = new AntiNukeEngine({
      modules: [module],
      onIncident: () => undefined,
      shouldIgnore: () => true,
    });
    await engine.handle(mutation());
    expect(module.evaluate).not.toHaveBeenCalled();
  });
  it("isolates module errors", async () => {
    const onModuleError = vi.fn();
    const engine = new AntiNukeEngine({
      modules: [
        {
          id: "broken",
          name: "broken",
          evaluate: () => {
            throw new Error("boom");
          },
        },
      ],
      onIncident: () => undefined,
      onModuleError,
    });
    await expect(engine.handle(mutation())).resolves.toEqual([]);
    expect(onModuleError).toHaveBeenCalledOnce();
  });
});
