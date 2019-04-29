// https://www.uni-due.de/imperia/md/content/dc/yanling_2015_check_digit.pdf
// with p=2 and k=5
// using primitive polynomial 1+x2+x5 taken from http://mathworld.wolfram.com/PrimitivePolynomial.html
// yields kxk matrix:
//
//      (0 0 0 0 1)
//      (1 0 0 0 0)
//  P = (0 1 0 0 1)
//      (0 0 1 0 0)
//      (0 0 0 1 0)
//
// For a string of base32 (a1 a2 … an), the check digit is
// an+1 such that Σ ai P^i = 0.

const cardinal = 32;  // 2^5
const primitive = [  // From the 1+x2+x5 primitive polynomial.
  [0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0],
  [0, 1, 0, 0, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0]
];

function matMul(a, b) {
  const width = b[0].length;
  const height = a.length;
  const mat = new Array(height);
  for (let i = 0; i < height; i++) {
    mat[i] = new Array(width);
  }
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      mat[i][j] = 0;
      for (let k = 0; k < b.length; k++) {
        mat[i][j] += a[i][k] * b[k][j];
      }
      mat[i][j] %= 2;
    }
  }
  return mat;
}

function matAdd(a, b) {
  const mat = matCp(a);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      mat[i][j] += b[i][j];
      mat[i][j] %= 2;
    }
  }
  return mat;
}

function matCp(a) {
  let copy = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    copy[i] = a[i].slice();
  }
  return copy;
}

const primitivePowers = (function genPowersOfPrimitive() {
  // Index 0 contains P^0 = I, 1 has P^1, … 30 has P^30.
  const powers = [
    [ [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1] ],
  ];
  let p = powers[0];
  for (let i = 0; i < 30; i++) {
    p = matMul(p, primitive);
    powers.push(p);
  }
  return powers;
})();

function fromBase32Char(char) {
  let c = char.charCodeAt(0) - (/[A-Z]/.test(char)? 65: 24);
  const row = [];
  for (let pow = (32 >>> 1); pow > 0; pow >>>= 1) {
    row.push((c / pow) >>> 0);
    c %= pow;
  }
  return row;
}

function toBase32Char(row) {
  let c = 0;
  for (let i = 0, pow = (32 >>> 1); i < 5; i++, pow >>>= 1) {
    c += row[i] * pow;
  }
  const d = (c > 25)? (c + 24): (c + 65);
  return String.fromCharCode(d);
}

function compute(payload) {
  const n = payload.length;

  // We must solve Σ ai P^i = 0 for i from 1 to n+1.
  // First, compute Σ ai P^i for i from 1 to n.
  let sum = [[0, 0, 0, 0, 0]];
  let i = 0;
  for (; i < n; i++) {
    const a = fromBase32Char(payload[i]);
    sum = matAdd(sum, matMul([a], primitivePowers[(i+1) % (cardinal-1)]));
    //console.log(`a ${a}\texp ${i+1}\tsum ${sum}`);
  }

  // We must solve:  sum + code * primitive^(n+1) = 0
  // That is:        sum + opposite           = 0
  // Therefore:      opposite = -sum
  // In GF(2), matrices are their own opposites.
  const opposite = sum;

  // We must solve:  code * primitive^(n+1) = opposite
  // We know:        a^(cardinal-1) = 1
  // Therefore:      a * a^(cardinal-2) = 1
  // Here we have:   a = primitive^(n+1)
  // Hence:          code = opposite * primitive^((cardinal-2)*(n+1))
  const exp = ((cardinal-2)*(n+1)) % (cardinal - 1);
  const inverse = primitivePowers[exp];
  const code = matMul(opposite, inverse)[0];
  //console.log(`opposite ${opposite}\texp ${exp}\tinverse ${JSON.stringify(inverse)}\tcode ${code}`);
  return toBase32Char(code);
}

function validate(payload) {
  return compute(payload) === 'A';
}

exports.fromBase32Char = fromBase32Char;
exports.toBase32Char = toBase32Char;

exports.compute = compute;
exports.validate = validate;
