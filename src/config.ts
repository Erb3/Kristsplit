import fs from "fs/promises";
import path from "path";
import { type ILogObj, Logger } from "tslog";
import { z } from "zod";

export const configSchema = z.object({
  node: z.string().url().startsWith("https://").default("https://krist.dev/"),
  splits: z.array(
    z
      .object({
        secret: z.string(),
        walletFormat: z.enum(["kristwallet", "api", "jwalelset"]).optional(),
        output: z.union([
          z.string(),
          z.record(
            z.union([
              z.string().length(10).startsWith("k").toLowerCase(),
              z.string().endsWith(".kst").toLowerCase(),
            ]),
            z.number().min(0).max(100).int()
          ),
        ]),
      })
      .refine((v) => {
        if (typeof v.output == "string") return true;

        let sum = 0;
        for (const [, value] of Object.entries(v.output)) {
          sum += value;
        }

        return sum === 100;
      }, "Output split sums total to 100%")
  ),
});

export async function loadConfig(logger: Logger<ILogObj>) {
  const filePath = path.join(__dirname, "../config.json");
  logger.debug(`Loading config file from ${filePath}`);
  const fileContents = await fs.readFile(filePath);
  const fileJSON = JSON.parse(fileContents.toString());
  const parsedConfig = await configSchema.safeParseAsync(fileJSON);

  if (!parsedConfig.success) {
    throw new Error("Couldn't parse error due to: " + parsedConfig.error);
  }

  return parsedConfig.data;
}
