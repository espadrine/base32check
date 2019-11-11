const assert = require('assert').strict;

// ISO 7064
//

const alphabet = require('../alphabet.js');
const { ISO7064Hybrid, ISO7064Pure } = require ('../iso7064.js');

// cf. http://www.pruefziffernberechnung.de/Originaldokumente/wg1n130.pdf
// and https://github.com/konfirm/node-iso7064#example-1
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

// cf. https://usersite.datalab.eu/printclass.aspx?type=wiki&id=91772
const mod97_10 = new ISO7064Pure(alphabet.base10, 97);
assert.equal(mod97_10.compute('794'), '44');
assert(mod97_10.validate('79444'));
for (let c of '012356789ABCDEF') {
  assert(!mod97_10.validate('7944' + c));
}

// cf. § 6.1.2 https://www.sis.se/api/document/preview/605987/
const mod11_2 = new ISO7064Pure(new alphabet.Alphabet('0123456789X'), 11, 2);
assert.equal(mod11_2.compute('0794'), '0');
assert(mod11_2.validate('07940'));
for (let c of '123456789X') {
  assert(!mod11_2.validate('0794' + c));
}
assert.equal(mod11_2.compute('079'), 'X');
assert(mod11_2.validate('079X'));
for (let c of '0123456789') {
  assert(!mod11_2.validate('079' + c));
}
