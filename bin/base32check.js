#!/usr/bin/env node
const lib = require('../lib.js');

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
  var checksum = lib.checksum(payload);
  console.log(checksum);
});

//let payload = String(process.argv[2]);
//var code = checksum(payload);
//console.log('checksum', code);
//console.log('verify', checksum(payload + code));
