import type { KristWalletFormatName } from "krist";

type OutputObject = { [address: string]: number };
type Outputs = string | OutputObject;

interface Split {
	privatekey: string;
	walletFormat: KristWalletFormatName | undefined;
	outputs: Outputs;
}

export type { OutputObject, Outputs, Split };
