import kristLib from 'krist';
import fs from 'fs';
const krist = new kristLib.KristApi();

const configFile = await fs.promises.readFile('./config.json');
const config = JSON.parse(configFile).splits;

const registeredSplits = {};

config.forEach(async (val) => {
  const [address, pkey] = await kristLib.calculateAddress(
    val.input,
    undefined,
    val.inputFormat == 'password' ? undefined : val.inputFormat
  );

  console.log(address, pkey);

  registeredSplits[address] = {
    privatekey: pkey,
    privatekeyFormat: val.inputFormat == 'password' ? 'kristwallet' : val.inputFormat,
    split: val.output,
    leftOvers: val.rest,
  };
});

const ws = krist.createWsClient({
  initialSubscriptions: ['transactions'],
});

ws.on('transaction', async ({ transaction }) => {
  if (!registeredSplits[transaction.to]) {
    return;
  }

  console.log('Splitting transaction: ', transaction);
  const percent = transaction.value / 100;

  const splits = registeredSplits[transaction.to];
  let left = transaction.value;
  splits.split.forEach((split) => {
    const kristAmount = Math.floor(percent * split.percent);
    left -= kristAmount;

    if (kristAmount != 0) {
      krist.makeTransaction(split.address, kristAmount, {
        walletFormat: splits.privatekeyFormat,
        privatekey: splits.privatekey,
        metadata: 'Powered by KristSplit',
      });
    }
  });

  if (left != 0 && splits.leftOvers == 'REFUND') {
    console.log('Refunding leftovers: ' + left);
    krist.makeTransaction(transaction.from, left, {
      walletFormat: splits.privatekeyFormat,
      privatekey: splits.privatekey,
      metadata: 'Powered by=KristSplit;donate=true;message=Here is the leftovers that could not be split!',
    });
  }
});

ws.on('ready', async () => {
  const me = await ws.getMe();
  console.log('Connected to WebSocket! I am: ', me);
});

ws.connect();
