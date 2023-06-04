type OutputObject = { [address: string]: number };

type Outputs = string | OutputObject;

interface Split {
  key: string;
  outputs: Outputs;
}

export { OutputObject, Split, Outputs };
