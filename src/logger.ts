import { Logger, type ILogObj } from "tslog";

export const logger: Logger<ILogObj> = new Logger({
  name: "Kristsplit",
  prettyLogTemplate:
    "{{dd}}/{{mm}}-{{yyyy}} {{hh}}:{{MM}}:{{ss}}  {{logLevelName}}\t",
  prettyLogTimeZone: "local",
});
