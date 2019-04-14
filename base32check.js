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

let P = [
  [0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0],
  [0, 1, 0, 0, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0]];

function matmul(a, b) {
  let newp = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    newp[i] = new Array(a.length);
  }
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length; j++) {
      newp[i][j] = 0;
      for (let k = 0; k < a.length; k++) {
        newp[i][j] += a[i][k] * b[k][j];
      }
      newp[i][j] %= 2;
    }
  }
  return newp;
}

function matcp(a) {
  let copy = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    copy[i] = a[i].slice();
  }
  return copy;
}

// Index 0 contains P^1, 1 has P^2, … 30 has P^31 = I.
function precomputePowers() {
  let powers = new Array(31); // 31 = 2^5-1.
  let power = matcp(P);
  powers[0] = matcp(power);
  for (let i = 0; i < 30; i++) {
    power = matmul(power, P);
    powers[i+1] = matcp(power);
  }
  return powers;
}
let powers = precomputePowers();

let cardinal = 31;

function primitiveElements(cardinal) {
  let elements = new Set();
  // Go through candidate primitive elements.
  let pe = 0;
  for (; pe < cardinal; pe++) {
    // Try to square a large number of times, aggregate distinct values.
    let powers = new Set();
    // Go through powers.
    let power = pe;
    powers.add(power);
    for (let j = 0; j < cardinal; j++) {
      power = (power * pe) % cardinal;
      powers.add(power);
    }
    // If it covers all non-zero powers, we have a primitive element.
    if (powers.size === cardinal - 1) {
      elements.add(pe);
    }
  }
  return elements;
}

//console.log('primitives of', cardinal, primitiveElements(cardinal));

function fromBase32Char(c) {
  return c.charCodeAt(0) - (/[A-Z]/.test(c)? 65: 24);
}

function toBase32Char(c) {
  let d = (c > 25)? (c + 24): (c + 65);
  return String.fromCharCode(d);
}

function checksum(payload) {
  let primitive = 3;

  let sum = 0;
  let p = 1;
  for (let i = 0; i < payload.length; i++) {
    let c = fromBase32Char(payload[i]);
    p = (p * primitive) % cardinal;
    sum = (sum + c * p) % cardinal;
  }

  let opposite = cardinal - sum;
  p = (p * primitive) % cardinal;
  let code = Math.floor(opposite / p);
  console.log('code', code);
  return toBase32Char(code);
}

function verify(payload) {
  return checksum(payload) === 'A';
}

let payload = String(process.argv[2]);
var code = checksum(payload);
console.log('checksum', code);
console.log('verify', checksum(payload + code));
