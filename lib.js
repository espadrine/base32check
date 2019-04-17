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
  return toBase32Char(code);
}

function verify(payload) {
  return checksum(payload) === 'A';
}

exports.checksum = checksum;
exports.verify = verify;
