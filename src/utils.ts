import {
  KristAuthOptionsPrivatekey,
  KristWalletFormat,
  KristWalletFormatName,
} from "krist";
import { OutputObject } from "./types";
import { ILogObj, Logger } from "tslog";

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

function getWalletFormat(
  privatekey: string,
  format: KristWalletFormatName | undefined,
  logger: Logger<ILogObj>
): KristWalletFormatName {
  if (format) return format;
  logger.warn("No wallet format supplied, guessing format.");

  // If it has -000, it means transformations have been applied, and we should use API. If it doesn't, it can either be a un-transformed kristwallet or a jwalelset
  return privatekey.endsWith("-000") ? "api" : "kristwallet";
}

export { calculateOutputs, getWalletFormat };
