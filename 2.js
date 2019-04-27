// https://www.uni-due.de/imperia/md/content/dc/yanling_2015_check_digit.pdf
// with p=1021 and k=1, using primitive element 1011.
//
// For a string of base32 (a1 a2 … an), the check digit is
// an+1 such that Σ ai P^i = 0.

const cardinal = 1021;
// Primitive taken from bin/finite-field-primitive-elements 1021.
const primitive = 1011;
const primitivePowers = (function genPowersOfPrimitive() {
  const powers = [1];
  let p = 1;
  for (let i = 0; i < cardinal - 2; i++) {
    p = (p * primitive) % cardinal;
    powers.push(p);
  }
  return powers;
})();

function fromBase32Char(c) {
  return c.charCodeAt(0) - (/[A-Z]/.test(c)? 65: 24);
}

function toBase32Char(c) {
  c = +c;
  let d = (c > 25)? (c + 24): (c + 65);
  return String.fromCharCode(d);
}

function compute(payload) {
  if (payload.length % 2 === 1) { payload = 'A' + payload; }
  const n = payload.length / 2;

  // We must solve Σ ai P^i = 0 for i from 1 to n+1.
  // First, compute Σ ai P^i for i from 1 to n.
  let sum = 0;
  let p = 1;
  for (let i = 0; i < n; i++) {
    const a = fromBase32Char(payload[2*i]) * 32 + fromBase32Char(payload[2*i+1]);
    // We could use primitivePowers here, although this may be faster.
    p = (p * primitive) % cardinal;
    sum = (sum + a * (p % cardinal)) % cardinal;
    //console.log(`a ${a}\tp ${p}\tsum ${sum}`);
  }

  // We must solve:  sum + code * primitive^(n+1) = 0
  // That is:        sum + opposite           = 0
  // Therefore:      opposite = -sum
  const opposite = (sum === 0)? 0: (cardinal - sum);

  // We must solve:  code * primitive^(n+1) = opposite
  // We know:        a^(cardinal-1) = 1
  // Therefore:      a * a^(cardinal-2) = 1
  // Here we have:   a = primitive^(n+1)
  // Hence:          code = opposite * primitive^((cardinal-2)*(n+1))
  const inverse = primitivePowers[((cardinal-2)*(n+1)) % (cardinal - 1)];
  let code = (opposite * inverse) % cardinal;
  //console.log(`opposite ${opposite}\tinverse ${inverse}\tp ${p}\tcode ${code}`);
  return toBase32Char(Math.floor(code / 32)) + toBase32Char(code % 32);
}

function validate(payload) {
  return compute(payload) === 'AA';
}

exports.fromBase32Char = fromBase32Char;
exports.toBase32Char = toBase32Char;

exports.compute = compute;
exports.validate = validate;
