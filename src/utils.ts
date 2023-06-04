import { OutputObject } from "./types";

function calculateOutputs(outputs: OutputObject, value: number) {
  const result: OutputObject = {};
  let remaining = value;

  Object.keys(outputs).forEach((address) => {
    const percent = outputs[address];

    let amount = Math.ceil((value / 100) * percent);
    const left = remaining - amount;

    if (left < 0) {
      amount += left;
    }

    remaining -= amount;
    result[address] = amount;
  });

  return result;
}

export { calculateOutputs };
