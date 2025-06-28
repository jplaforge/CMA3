import { cn } from "@/lib/utils"

describe("utils", () => {
  describe("cn function", () => {
    it("merges class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2")
    })

    it("handles conditional classes", () => {
      expect(cn("class1", false && "class2", "class3")).toBe("class1 class3")
    })

    it("handles undefined and null values", () => {
      expect(cn("class1", undefined, null, "class2")).toBe("class1 class2")
    })

    it("merges tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
    })
  })
})
