import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("Utility Functions", () => {
  describe("cn (className merger)", () => {
    it("merges class names", () => {
      expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
    });

    it("handles conditional classes", () => {
      expect(cn("base", true && "truthy", false && "falsy")).toBe("base truthy");
    });

    it("merges Tailwind classes correctly", () => {
      // tailwind-merge should resolve conflicts
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("handles undefined and null", () => {
      expect(cn("base", undefined, null, "other")).toBe("base other");
    });

    it("handles arrays", () => {
      expect(cn(["text-sm", "font-bold"])).toBe("text-sm font-bold");
    });
  });
});
