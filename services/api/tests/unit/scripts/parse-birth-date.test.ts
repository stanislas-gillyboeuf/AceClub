import { describe, it, expect } from "vitest";
import { parseBirthDate } from "../../../scripts/lib/parse-birth-date";

describe("parseBirthDate", () => {
  it.each([
    ["31/12/2010", "2010-12-31"],
    ["31-12-2010", "2010-12-31"],
    ["31.12.2010", "2010-12-31"],
    ["2010/12/31", "2010-12-31"],
    ["2010-12-31", "2010-12-31"],
    ["5/3/2010", "2010-03-05"],
    ["  01.02.1999  ", "1999-02-01"],
  ])("convertit %j en %s", (input, expected) => {
    expect(parseBirthDate(input)).toBe(expected);
  });

  it("lit toujours jour/mois à la française (01/02/2010 = 1er février)", () => {
    expect(parseBirthDate("01/02/2010")).toBe("2010-02-01");
    expect(parseBirthDate("12/01/2010")).toBe("2010-01-12");
  });

  it.each(["", "abc", "31/02/2010", "00/10/2010", "13/13/2010", "2010-02-30", "10/2010", "31/12/10"])(
    "refuse %j",
    (input) => {
      expect(parseBirthDate(input)).toBeNull();
    },
  );
});
