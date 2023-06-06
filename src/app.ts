import {
  calculateAddress,
  KristApi,
  KristWalletFormatName,
  KristWsClient as kwsClient,
} from "krist";
import { Logger, ILogObj } from "tslog";
import { Split } from "./types";
import { calculateOutputs, getWalletFormat } from "./utils";
import { configSchema, loadConfig } from "./config";

const logger: Logger<ILogObj> = new Logger({
  name: "Kristsplit",
  prettyLogTemplate:
    "{{dd}}/{{mm}}-{{yyyy}} {{hh}}:{{MM}}:{{ss}}  {{logLevelName}}\t",
  prettyLogTimeZone: "local",
});

async function transfer(
  kws: kwsClient,
  to: string,
  amount: number,
  from: string,
  format: KristWalletFormatName | undefined
) {
  if (!amount) return;
  logger.info(`Sending krist to ${to} worth ${amount}`);

  kws.makeTransaction(to, amount, {
    metadata: `PoweredBy=Kristsplit;PoweredByUrl=https://github.com/Erb3/Kristsplit/;message=Here is your split!`,
    privatekey: from,
    walletFormat: getWalletFormat(from, format, logger),
  });
}

async function main() {
  const config = await loadConfig(logger);
  if (!config) return;

  const splits: { [address: string]: Split } = {};
  config.splits.forEach(async (split) => {
    const [address, pkey] = await calculateAddress(
      split.secret,
      undefined,
      getWalletFormat(split.secret, split.walletFormat, logger)
    );
    logger.info(
      `Registering split for address ${address} with private key ${pkey}`
    );

    splits[address] = {
      privatekey: pkey,
      outputs: split.output,
      walletFormat: split.walletFormat,
    };
  });
  const krist = new KristApi({
    userAgent: `Kristsplit/2 by Erb3 (https://github.com/Erb3/Kristsplit/)`,
    syncNode: config.node,
  });

  const kristWS = krist.createWsClient({
    initialSubscriptions: ["transactions"],
  });

  kristWS.on("transaction", async ({ transaction: tx }) => {
    if (!tx) return;
    if (!splits[tx.to]) return;

    logger.info(`Splitting transaction #${tx.id}`);
    const split = splits[tx.to];

    if (typeof split.outputs === "string") {
      await transfer(
        kristWS,
        split.outputs,
        tx.value,
        split.privatekey,
        split.walletFormat
      );
    } else {
      const toTransfer = calculateOutputs(split.outputs, tx.value);
      Object.keys(toTransfer).forEach(async (address) => {
        const value = toTransfer[address];
        await transfer(
          kristWS,
          address,
          value,
          split.privatekey,
          split.walletFormat
        );
      });
    }
  });

  await kristWS.connect();
}

main();
