const { parsePagination } = require("../src/utils/pagination");

describe("parsePagination", () => {
  it("uses defaults", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it("computes skip and caps limit at 100", () => {
    expect(parsePagination({ page: "3", limit: "10" })).toEqual({ page: 3, limit: 10, skip: 20 });
    expect(parsePagination({ limit: "500" }).limit).toBe(100);
  });

  it("falls back on invalid values", () => {
    expect(parsePagination({ page: "-1", limit: "abc" })).toEqual({ page: 1, limit: 20, skip: 0 });
  });
});
