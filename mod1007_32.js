function fromBase32Char(c) {
  return c.charCodeAt(0) - (/[A-Z]/.test(c)? 65: 24);
}

function toBase32Char(c) {
  c = +c;
  const d = (c > 25)? (c + 24): (c + 65);
  return String.fromCharCode(d);
}

exports.primitive = 1007;
function compute(payload) {
  payload = payload + 'AA';
  const n = payload.length;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    const a = fromBase32Char(payload[i]);
    sum = (sum * 32 + a) % exports.primitive;
  }

  const code = (exports.primitive + 1 - sum % exports.primitive) % exports.primitive;
  return toBase32Char(Math.floor(code / 32)) + toBase32Char(code % 32);
}

function validate(payload) {
  return compute(payload.slice(0, -2)) === payload.slice(-2);
}

exports.compute = compute;
exports.validate = validate;
