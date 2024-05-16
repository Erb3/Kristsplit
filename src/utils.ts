import type { KristWalletFormatName, KristWsClient } from "krist";
import { logger } from "./logger";
import type { OutputObject } from "./types";

function calculateOutputs(outputs: OutputObject, value: number) {
	const result: OutputObject = {};
	let remaining = value;

	for (const [address, percent] of Object.entries(outputs)) {
		let amount = Math.ceil((value / 100) * percent);
		const left = remaining - amount;

		if (left < 0) {
			amount += left;
		}

		remaining -= amount;
		result[address] = amount;
	}

	return result;
}

function getWalletFormat(
	secret: string,
	format: KristWalletFormatName | undefined,
): KristWalletFormatName {
	if (format) return format;
	logger.warn(
		`No wallet format supplied for secret ${secret}, guessing format.`,
	);

	// If it has -000, it means transformations have been applied, and we should use API. If it doesn't, it can either be a un-transformed kristwallet or a jwalelset
	return secret.endsWith("-000") ? "api" : "kristwallet";
}

export async function newTransaction(
	krist: KristWsClient,
	to: string,
	amount: number,
	from: string,
) {
	if (!amount) return;
	logger.info(`Sending krist to ${to} worth k${amount}`);

	await krist.makeTransaction(to, amount, {
		metadata:
			"PoweredBy=Kristsplit;PoweredByUrl=https://github.com/Erb3/Kristsplit;PoweredByVersion=3;message=Here is your split!",
		privatekey: from,
		walletFormat: "api",
	});
}

export { calculateOutputs, getWalletFormat };
