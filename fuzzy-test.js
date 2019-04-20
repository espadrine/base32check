const base32check = require('./lib.js');

function genBase32Payload(length = 17) {
  let payload = '';
  for (let i = 0; i < length; i++) {
    payload += genBase32();
  }
  return payload;
}

function genBase32() {
  return base32check.toBase32Char(Math.floor(Math.random() * 32));
}

class Collision {
  constructor(payload, collision, type, params) {
    this.payload = payload;
    this.collision = collision;
    this.type = type;
    this.params = params;
  }
  toString() {
    return `${this.type} ${this.params}:\t${this.payload}\t${this.collision}`;
  }
}

// checker: has a hash() and a verify().
// Returns undefined (if no collision) or a Collision.
function checkSubstitution(payload, checker) {
  // Take a random character.
  const index = Math.floor(Math.random() * payload.length);
  // Replace it with a random character.
  let sub = genBase32();
  while (sub === payload[index]) { sub = genBase32(); }
  const tweaked = payload.slice(0, index) + sub + payload.slice(index + 1);
  if (checker.hash(payload) === checker.hash(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, 'substitution',
      [payload[index], sub].sort());
  }
}

// checker: has a hash() and a verify().
// Returns a Set of Collisions.
function checkSubstitutions(payload, checker, count = 100) {
  const collisions = new Set();
  for (let i = 0; i < count; i++) {
    const collision = checkSubstitution(payload, checker);
    if (collision != null) { collisions.add(collision); }
  }
  return collisions;
}

// checkTranscriptions: function(payload, checker, count)
// checker: has a hash() and a verify().
// count: number of one-payload checks to make. (Battery size.)
// checkCount: number of checks to make for one payload.
// Returns a Set of Collisions.
function runBattery(checkTranscriptions, checker,
    count = 100, checkCount = 100) {
  let collisions = new Set();
  for (let i = 0; i < count; i++) {
    const newCollisions = checkTranscriptions(genBase32Payload(),
      checker, checkCount);
    collisions = new Set([...collisions, ...newCollisions]);
  }
  return collisions;
}

function main() {
  const batterySize = 500;
  const attemptsPerPayload = 100;
  const collisions = runBattery(checkSubstitutions, base32check,
    batterySize, attemptsPerPayload);
  console.log([...collisions].map(c => c.toString()).join('\n'));
  const fraction = collisions.size / (batterySize * attemptsPerPayload);
  console.log(`${collisions.size} collisions (${fraction*100})%`);
}

main();
