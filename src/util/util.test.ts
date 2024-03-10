import * as util from "./util";
import { describe, expect, jest, test } from "@jest/globals";
jest.useFakeTimers().setSystemTime(new Date("2022-01-01T00:00:00Z")); // in EST, 7pm the day before.
describe("getCurrentDate", () => {
  test("getCurrentDate", () => {
    expect(util.getDate(0)).toBe("2021-12-31");
  });
});

describe("getTomorrowDate", () => {
  test("getTomorrowDate", () => {
    expect(util.getDate(1)).toBe("2022-01-01");
  });
});
