import { z } from "zod";
import fs from "fs/promises";
import { ILogObj, Logger } from "tslog";
import path from "path";

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

async function loadConfig(logger: Logger<ILogObj>) {
  const filePath = path.join(__dirname, "../config.json");
  logger.debug(`Loading configfile from ${filePath}`);
  const fileContents = await fs.readFile(filePath);
  const fileJSON = JSON.parse(fileContents.toString());
  const parsedConfig = await configSchema.safeParseAsync(fileJSON);

  if (!parsedConfig.success) {
    logger.error("Couldn't parse config", parsedConfig.error);
    return null;
  }
  return parsedConfig.data;
}

export { configSchema, loadConfig };
