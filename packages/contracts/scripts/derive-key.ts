import * as readline from 'readline';

import { Wallet } from 'ethers';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter your mnemonic: ', (mnemonic) => {
  try {
    const wallet = Wallet.fromPhrase(mnemonic.trim());
    console.log('\n✅ Derived wallet:');
    console.log('Address:', wallet.address);
    console.log('Private Key:', wallet.privateKey);
    console.log('\nTo deploy, run:');
    console.log(`export PRIVATE_KEY=${wallet.privateKey}`);
  } catch (err) {
    console.error('Error:', (err as Error).message);
  }
  rl.close();
});
