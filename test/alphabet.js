const { base32check2 } = require('../lib.js');

class Alphabet {
  constructor(characters) {
    this.size = characters.length;
    this.characters = characters;
  }

  gen() {
    const c = Math.floor(Math.random() * this.size);
    return this.characters[c];
  }

  genPayload(length = 20) {
    let payload = '';
    for (let i = 0; i < length; i++) {
      payload += this.gen();
    }
    return payload;
  }
}

const alphabets = {
  base10: new Alphabet('0123456789'),
  base16: new Alphabet('0123456789ABCDEF'),
  base32: new Alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'),
  base36: new Alphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
  base58: new Alphabet('123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'),
  base64: new Alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
  base1024: [...(function*() {
    for (let a of 'bdfghjklmnprstvz') {
      for (let b of 'aeio') {
        for (let c of 'bdfghjklmnprstvz') {
          yield a + b + c;
        }
      }
    }
  })()],
};

module.exports = alphabets;
