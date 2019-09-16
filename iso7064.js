const alphabets = require('./alphabet.js');

class ISO7064Hybrid {
  constructor(alphabet) {
    this.alphabet = alphabet;  // Taken from ./alphabet.js
    this.modulus = alphabet.size;
  }

  compute(payload) {
    const n = payload.length;
    const mod = this.modulus;
    let sum = mod;
    for (let i = 0; i < n; i++) {
      const a = this.alphabet.fromChar(payload[i]);
      const remainder = (sum % (mod + 1)) + a;
      sum = (remainder % mod) * 2;
      if (sum === 0) { sum = mod * 2; }
    }

    // Property: (remainder for check digit) % mod = 1.
    const check = (mod + 1 - (sum % (mod + 1))) % mod;
    return this.alphabet.toChar(check);
  }

  validate(payload) {
    return this.compute(payload.slice(0, -1)) === payload.slice(-1);
  }
}

// Test: should be B.
//var mod17_16 = new ISO7064Hybrid(alphabets.base16);
//mod17_16.compute('D98989898909898')
