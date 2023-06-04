import { calculateAddress, KristApi, KristWsClient } from "krist";
import fs from "fs/promises";
import { Logger, ILogObj } from "tslog";
import { z } from "zod";
import { Split } from "./types";
import { calculateOutputs } from "./utils";

const logger: Logger<ILogObj> = new Logger({
  name: "Kristsplit",
  prettyLogTemplate:
    "{{dd}}/{{mm}}-{{yyyy}} {{hh}}:{{MM}}:{{ss}}  {{logLevelName}}\t",
  prettyLogTimeZone: "local",
});

const configSchema = z.object({
  node: z.string().url().startsWith("https://").optional(),
  splits: z.array(
    z.object({
      input: z.string(),
      output: z.union([
        z.string(),
        z.record(
          z.union([
            z.string().length(10).startsWith("k"),
            z.string().endsWith(".kst"),
          ]),
          z.number().min(0).max(100).int()
        ),
      ]),
    })
  ),
});

async function transfer(
  kws: KristWsClient,
  to: string,
  amount: number,
  from: string
) {
  if (!amount) return;
  logger.info(`Sending krist to ${to} worth ${amount}`);

  kws.makeTransaction(to, amount, {
    metadata: `PoweredBy=Kristsplit;PoweredByUrl=https://github.com/Erb3/Kristsplit/;message=Here is your split!`,
    privatekey: from,
    walletFormat: from.endsWith("-000") ? "api" : "kristwallet",
  });
}

async function main() {
  const configFile = await fs.readFile("config.json");
  const JSONConfig = JSON.parse(configFile.toString());
  logger.info("Loaded config file.");

  const parsedConfig = await configSchema.safeParseAsync(JSONConfig);
  if (!parsedConfig.success) {
    logger.error("Couldn't parse config", parsedConfig.error);
    return;
  }
  const config = parsedConfig.data;

  const splits: { [address: string]: Split } = {};
  config.splits.forEach(async (split) => {
    const [address, pkey] = await calculateAddress(
      split.input,
      undefined,
      split.input.endsWith("-000") ? "api" : "kristwallet"
    );
    logger.info(
      `Registering split for address ${address} with private key ${pkey}`
    );

    splits[address] = {
      key: pkey,
      outputs: split.output,
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
      await transfer(kristWS, split.outputs, tx.value, split.key);
    } else {
      const toTransfer = calculateOutputs(split.outputs, tx.value);
      Object.keys(toTransfer).forEach(async (address) => {
        const value = toTransfer[address];
        await transfer(kristWS, address, value, split.key);
      });
    }
  });

  await kristWS.connect();
}

main();
