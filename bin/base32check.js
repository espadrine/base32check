#!/usr/bin/env node
const {base32check1, base32check2} = require('../lib.js');

let verifyMode = false;
for (let i = 1; i < process.argv.length; i++) {
  if (process.argv[i] === '-c' ||
      process.argv[i] === '--check') {
    verifyMode = true;
  }
}

// FIXME: process the checksum chunkwise.
let payload = '';
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    payload += chunk;
  }
});
process.stdin.on('end', () => {
  if (verifyMode) {
    if (base32check1.verify(payload)) {
      console.error('OK');
    } else {
      console.error('FAILED');
      process.exit(1);
    }
  } else {
    var checksum = base32check1.compute(payload);
    console.log(checksum);
    //console.log(base32check1.compute(payload + checksum));
  }
});
