class ISO7064Hybrid {
  constructor(alphabet) {
    this.alphabet = alphabet;  // Taken from ./alphabet.js
    this.modulus = alphabet.size;
  }

  compute(payload) {
    const n = payload.length;
    const mod = this.modulus;
    const alphabet = this.alphabet;
    let sum = mod;
    for (let i = 0; i < n; i++) {
      const a = alphabet.fromChar(payload[i]);
      const remainder = (sum % (mod + 1)) + a;
      sum = (remainder % mod) * 2;
      if (sum === 0) { sum = mod * 2; }
    }

    // Property: (remainder for check digit) % mod = 1.
    const check = (mod + 1 - (sum % (mod + 1))) % mod;
    return alphabet.toChar(check);
  }

  validate(payload) {
    return this.compute(payload.slice(0, -1)) === payload.slice(-1);
  }
}

class ISO7064Pure {
  constructor(alphabet, modulus, radix = alphabet.size) {
    this.alphabet = alphabet;  // Taken from ./alphabet.js
    this.modulus = +modulus;
    this.radix = +radix;
  }

  compute(payload) {
    const alphabet = this.alphabet;
    const mod = this.modulus;
    const radix = this.radix;
    payload += alphabet.characters[0];
    if (mod > alphabet.size) { payload += alphabet.characters[0]; }
    const n = payload.length;

    let sum = 0;
    for (let i = 0; i < n; i++) {
      const a = alphabet.fromChar(payload[i]);
      sum = (sum * radix + a) % mod;
    }

    // Property: Σ aᵢ × radixⁱ⁻¹ % mod = 1.
    const code = (mod + 1 - sum) % mod;
    if (mod > alphabet.size) {
      return alphabet.toChar(Math.floor(code / radix)) +
             alphabet.toChar(           code % radix);
    } else { return alphabet.toChar(code); }
  }

  validate(payload) {
    if (this.modulus > this.alphabet.size) {
      return this.compute(payload.slice(0, -2)) === payload.slice(-2);
    } else {
      return this.compute(payload.slice(0, -1)) === payload.slice(-1);
    }
  }
}

exports.ISO7064Hybrid = ISO7064Hybrid;
exports.ISO7064Pure = ISO7064Pure;
