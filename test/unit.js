const assert = require('assert').strict;

// ISO 7064
//

const alphabet = require('../alphabet.js');
const { ISO7064Hybrid } = require ('../iso7064.js');

const mod17_16 = new ISO7064Hybrid(alphabet.base16);
assert.equal(mod17_16.compute('D98989898909898'), 'B');
assert(mod17_16.validate('D98989898909898B'));
for (let c of '0123456789ACDEF') {
  assert(!mod17_16.validate('D98989898909898' + c));
}

const mod11_10 = new ISO7064Hybrid(alphabet.base10);
assert.equal(mod11_10.compute('079'), '2');
assert(mod11_10.validate('0792'));
for (let c of '013456789ABCDEF') {
  assert(!mod11_10.validate('079' + c));
}
