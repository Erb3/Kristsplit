import { calculateAddress, KristApi } from "krist";
import { loadConfig } from "./config";
import { logger } from "./logger";
import type { Split } from "./types";
import { calculateOutputs, getWalletFormat, newTransaction } from "./utils";

const config = await loadConfig(logger);

const splits = new Map<string, Split>();
config.splits.forEach(async (split) => {
  const [address, pkey] = await calculateAddress(
    split.secret,
    undefined,
    getWalletFormat(split.secret, split.walletFormat)
  );

  logger.info(`Registering split for address ${address} with secret ${pkey}`);

  splits.set(address, {
    privatekey: pkey,
    outputs: split.output,
    walletFormat: split.walletFormat,
  });
});

const krist = new KristApi({
  userAgent: "Kristsplit/2 by Erb3 (https://github.com/Erb3/Kristsplit/)",
  syncNode: config.node,
});
const kristWS = krist.createWsClient({
  initialSubscriptions: ["transactions"],
});

kristWS.on("transaction", async ({ transaction: tx }) => {
  const split = splits.get(tx.to);
  if (!split) return;
  logger.info(`Splitting transaction #${tx.id}`);

  if (typeof split.outputs === "string") {
    await newTransaction(kristWS, split.outputs, tx.value, split.privatekey);
  } else {
    const toTransfer = calculateOutputs(split.outputs, tx.value);
    Object.keys(toTransfer).forEach(async (address) => {
      const value = toTransfer[address];
      await newTransaction(kristWS, address, value, split.privatekey);
    });
  }
});

await kristWS.connect();
