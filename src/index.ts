import { calculateAddress, KristApi } from "krist";
import type { z } from "zod";
import { loadConfig, type splitConfig } from "./config";
import { VERSION } from "./consts";
import { logger } from "./logger";
import { calculateOutputs, getWalletFormat, newTransaction } from "./utils";

const config = await loadConfig(logger);

const splitMap: Map<string, z.output<typeof splitConfig>> = new Map();
for (const split of config.splits) {
	const [address, pkey] = await calculateAddress(
		split.secret,
		undefined,
		getWalletFormat(split.secret, split.walletFormat)
	);

	split.secret = pkey;
	logger.debug(
		`Registered split for address ${address} with private key ${pkey}`
	);
	splitMap.set(address, split);
}

const krist = new KristApi({
	userAgent: `Kristsplit+v${VERSION}+github-com-Erb3-kristsplit`,
	syncNode: config.node,
});
const kristWS = krist.createWsClient({
	initialSubscriptions: ["transactions"],
});

logger.debug(`Sync node is set to ${config.node}`);

kristWS.on("transaction", async ({ transaction: tx }) => {
	const split = splitMap.get(tx.to);
	if (!split) return;

	if (split.conditions?.minAmount && split.conditions.minAmount >= tx.value) {
		logger.info(
			`Condition minAmount not met. Got ${tx.value}, expected >= ${split.conditions.minAmount}`
		);
		return;
	}

	if (split.conditions?.maxAmount && split.conditions.maxAmount <= tx.value) {
		logger.info(
			`Condition maxAmount not met. Got ${tx.value}, expected <= ${split.conditions.maxAmount}`
		);
		return;
	}

	if (split.conditions?.sender && split.conditions.sender !== tx.from) {
		logger.info(
			`Condition sender not met. Got ${tx.from}, expected ${split.conditions.sender}`
		);
		return;
	}

	const names = [
		`${tx.sent_metaname}@${tx.sent_name}.kst`,
		`${tx.sent_name}.kst`,
	];
	if (
		split.conditions?.destination &&
		!names.includes(split.conditions.destination)
	) {
		logger.info(
			`Condition destination not met. Got ${names}, expected ${names.join(
				" or "
			)}`
		);
		return;
	}

	logger.info(`Splitting transaction #${tx.id}`);

	if (typeof split.output === "string") {
		await newTransaction(kristWS, split.output, tx.value, split.secret);
	} else {
		const toTransfer = calculateOutputs(split.output, tx.value);

		for (const [address, value] of Object.entries(toTransfer)) {
			await newTransaction(kristWS, address, value, split.secret);
		}
	}
});

kristWS.on("ready", (motd) => {
	logger.info(`Ready! MOTD is: ${motd.motd.replaceAll("\n", "")}`);
});

logger.debug("Connecting to Krist WebSocket");
await kristWS.connect();
logger.info("Connected to Krist WebSocket");
