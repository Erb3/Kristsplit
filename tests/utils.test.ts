import { expect, test, describe } from "@jest/globals";
import { calculateOutputs } from "../src/utils";
import { OutputObject, Split } from "../src/types";

const splits = {
  "100": {
    kristcatm0: 100,
  },
  "50/50": {
    kristcatm0: 50,
    kristcatm1: 50,
  },
  "25/75": {
    kristcatm0: 25,
    kristcatm1: 75,
  },
  "30/30/40": {
    kristcatm0: 30,
    kristcatm1: 30,
    kristcatm2: 40,
  },
};

describe("Output calculation function with splittable amounts", () => {
  test("A 100% split", () => {
    expect(calculateOutputs(splits["100"], 172)).toStrictEqual({
      kristcatm0: 172,
    });
  });

  test("A 50% / 50% split", () => {
    expect(calculateOutputs(splits["50/50"], 172)).toStrictEqual({
      kristcatm0: 86,
      kristcatm1: 86,
    });
  });

  test("A 25% / 75% split", () => {
    expect(calculateOutputs(splits["25/75"], 172)).toStrictEqual({
      kristcatm0: 43,
      kristcatm1: 129,
    });
  });

  test("A 30% / 30% / 40% split", () => {
    expect(calculateOutputs(splits["30/30/40"], 200)).toStrictEqual({
      kristcatm0: 60,
      kristcatm1: 60,
      kristcatm2: 80,
    });
  });
});

describe("Output calculation function with harder amounts", () => {
  test("A 25% / 75% split with harder amount", () => {
    expect(calculateOutputs(splits["25/75"], 6)).toStrictEqual({
      kristcatm0: 2,
      kristcatm1: 4,
    });
  });

  test("A random split with a random amount", () => {
    const split1 = Math.floor(Math.random() * 100);
    const split: OutputObject = {
      kristcatm0: split1,
      kristcatm1: 100 - split1,
    };
    const amount = Math.floor(Math.random() * 10000);

    expect(calculateOutputs(split, amount));
  });
});
