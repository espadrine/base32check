// https://www.uni-due.de/imperia/md/content/dc/yanling_2015_check_digit.pdf
// with p=31 and k=1, using primitive element 3.
//
// For a string of base32 (a1 a2 … an), the check digit is
// an+1 such that Σ ai P^i = 0.

const cardinal = 31;

function fromBase32Char(c) {
  return c.charCodeAt(0) - (/[A-Z]/.test(c)? 65: 24);
}

function toBase32Char(c) {
  let d = (c > 25)? (c + 24): (c + 65);
  return String.fromCharCode(d);
}

const powersOf3 = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10,
  30, 28, 22, 4, 12, 5, 15, 14, 11, 2, 6, 18, 23, 7, 21];

function checksum(payload) {
  const primitive = 3;
  const n = payload.length;

  // We must solve Σ ai P^i = 0 for i from 1 to n+1.
  // First, compute Σ ai P^i for i from 1 to n.
  let sum = 0;
  let p = 1;
  for (let i = 0; i < n; i++) {
    const c = fromBase32Char(payload[i]);
    // We could use powersOf3 here, although this may be faster.
    p = (p * primitive) % cardinal;
    sum = (sum + c * (p % cardinal)) % cardinal;
    console.log(`c ${c}\tp ${p}\tsum ${sum}`);
  }

  // We must solve:  sum + code * primitive^(n+1) = 0
  // That is:        sum + opposite           = 0
  // Therefore:      opposite = -sum
  const opposite = (sum === 0)? 0: (cardinal - sum);

  // We must solve:  code * primitive^(n+1) = opposite
  // We know:        a^(cardinal-1) = 1
  // Therefore:      a^(cardinal-2) * a = 1
  // Here we have:   a = primitive^(n+1)
  // Hence:          code = opposite * primitive^((cardinal-2)*(n+1))
  const inverse = powersOf3[((cardinal-2)*(n+1)) % (cardinal - 1)];
  let code = (opposite * inverse) % cardinal;
  console.log(`opposite ${opposite}\tinverse ${inverse}\tp ${p}\tcode ${code}`);
  return toBase32Char(code);
}

function verify(payload) {
  return checksum(payload) === 'A';
}

exports.checksum = checksum;
exports.verify = verify;
