// https://www.uni-due.de/imperia/md/content/dc/yanling_2015_check_digit.pdf
// with p=2 and k=5
// using primitive polynomial 1+x²+x⁵ taken from http://mathworld.wolfram.com/PrimitivePolynomial.html
// yields kxk companion matrix:
//
//      ⎛ 0 0 0 0 1 ⎞
//      ⎜ 1 0 0 0 0 ⎟
//  P = ⎜ 0 1 0 0 1 ⎟
//      ⎜ 0 0 1 0 0 ⎟
//      ⎝ 0 0 0 1 0 ⎠
//
// For a string of base32 (a1 a2 … an), the check digit is
// an+1 such that Σ ai P^i = 0.

const cardinal = 32;  // 2^5
const primitive = [  // From the 1+x²+x⁵ primitive polynomial.
  0b00001,
  0b10000,
  0b01001,
  0b00100,
  0b00010,
];

function matMul(a, b) {
  const width = 5;
  const height = a.length;
  const mat = new Array(height);
  for (let i = 0; i < height; i++) {
    mat[i] = 0;
    for (let j = 0; j < width; j++) {
      if ((a[i] & (1 << (width - j - 1))) !== 0) {
        mat[i] ^= b[j];
      }
    }
  }
  return mat;
}

function matCp(a) {
  let copy = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    copy[i] = a[i];
  }
  return copy;
}

const primitivePowers = (function genPowersOfPrimitive() {
  // Index 0 contains P^0 = I, 1 has P^1, … 30 has P^30.
  const powers = [ [], matCp(primitive) ];
  let p = powers[1];
  for (let i = 0; i < cardinal - 3; i++) {
    p = matMul(p, primitive);
    powers.push(p);
  }
  powers[0] = matMul(p, primitive);
  return powers;
})();

function fromBase32Char(c) {
  return c.charCodeAt(0) - (/[A-Z]/.test(c)? 65: 24);
}

function toBase32Char(c) {
  c = +c;
  const d = (c > 25)? (c + 24): (c + 65);
  return String.fromCharCode(d);
}

function compute(payload) {
  const n = payload.length;

  // We must solve Σ ai P^i = 0 for i from 1 to n+1.
  // First, compute Σ ai P^i for i from 1 to n.
  let sum1 = 0;
  let sum2 = 0;
  let modsum = 0;
  for (let i = 0; i < n; i++) {
    const a = fromBase32Char(payload[i]);
    sum1 ^= matMul([a], primitivePowers[(i+1) % (cardinal-1)])[0];
    if (i % 2 === 0) {
      sum2 ^= matMul([a], primitivePowers[(i/2+1) % (cardinal-1)])[0];
    }
    const a2 = fromBase32Char((payload + 'AA')[i]);
    //modsum ^= matMul([a], primitivePowers[(i+1) % (cardinal-1)])[0];
    modsum = (modsum * 32 + a2) % 1007;
    //console.log(`a ${a}\texp ${i+1}\tsum ${sum1}`);
  }

  // We must solve:  sum + code * primitive^(n+1) = 0
  // That is:        sum + opposite           = 0
  // Therefore:      opposite = -sum
  // In GF(2), matrices are their own opposites.
  const opposite1 = sum1;
  const opposite2 = sum2;

  // We must solve:  code * primitive^(n+1) = opposite
  // We know:        a^(cardinal-1) = 1
  // Therefore:      a * a^(cardinal-2) = 1
  // Here we have:   a = primitive^(n+1)
  // Hence:          code = opposite * primitive^((cardinal-2)*(n+1))
  let exp1 = (cardinal-n-2) % (cardinal - 1);
  exp1 = (exp1 < 0)? exp1 + cardinal: exp1;
  const inverse1 = primitivePowers[exp1];
  const code1 = matMul([opposite1], inverse1)[0];
  //console.log(`opposite ${opposite1}\texp ${exp1}\tinverse ${JSON.stringify(inverse1)}\tcode ${code1}`);

  let exp2 = (cardinal-Math.ceil(n/2)-2) % (cardinal - 1);
  exp2 = (exp2 < 0)? exp2 + cardinal: exp2;
  const inverse2 = primitivePowers[exp2];
  const code2 = matMul([opposite2], inverse2)[0];
  //console.log(`opposite ${opposite2}\texp ${exp2}\tinverse ${JSON.stringify(inverse2)}\tcode ${code2}`);

  modsum = (modsum * 32 + code1) % 1007;
  modsum = (1007 + 1 - modsum % 1007) % 1007;
  //const code = (code1 << 5) + (modsum % 32);
  //const code = (code1 << 5) + (((modsum % 32) & (~0x1)) | (n % 2));
  const code = (code1 << 5) + ((code2 & (~0x1)) | (n % 2));
  //const code = (code1 << 5) + code2;

  return toBase32Char(Math.floor(code / 32)) + toBase32Char(code % 32);
}

function validate(payload) {
  return compute(payload) === 'A';
}

exports.fromBase32Char = fromBase32Char;
exports.toBase32Char = toBase32Char;

exports.compute = compute;
exports.validate = validate;
