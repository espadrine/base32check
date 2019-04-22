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
  let sub;
  do {
    // Replace it with a random character.
    sub = genBase32();
  } while (sub === payload[index]);
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

// checker: has a hash() and a verify().
// distance: number of characters betwen the symbols to transpose.
// Returns undefined (if no collision) or a Collision.
function checkTransposition(payload, checker, distance = 0) {
  let i1, i2, c1, c2;
  do {
    // Take a random character.
    i1 = Math.floor(Math.random() * (payload.length - distance - 1));
    c1 = payload[i1];
    // Transpose it with the character <distance> after.
    i2 = i1 + distance + 1;
    c2 = payload[i2];
  } while (c1 === c2);
  const tweaked = payload.slice(0, i1) + c2 + payload.slice(i1 + 1, i2) + c1 + payload.slice(i2 + 1);
  if (checker.hash(payload) === checker.hash(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, 'transposition',
      [distance, c1, c2]);
  }
}

function checkTranspositions(payload, checker, distance = 0, count = 100) {
  const collisions = new Set();
  for (let i = 0; i < count; i++) {
    const collision = checkTransposition(payload, checker, distance);
    if (collision != null) { collisions.add(collision); }
  }
  return collisions;
}

// checker: has a hash() and a verify().
// distance: number of characters betwen the symbols to transpose.
// Returns undefined (if no collision) or a Collision.
function checkTwinError(payload, checker, distance = 0) {
  // Take a random character.
  const i1 = Math.floor(Math.random() * (payload.length - distance - 1));
  // Transpose it with the character <distance> after.
  const i2 = i1 + distance + 1;
  const c1 = genBase32();
  let c2;
  do {
    c2 = genBase32();
  } while (c2 === c1);

  payload = payload.slice(0, i1) + c1 + payload.slice(i1 + 1, i2) + c1 + payload.slice(i2 + 1);
  const tweaked = payload.slice(0, i1) + c2 + payload.slice(i1 + 1, i2) + c2 + payload.slice(i2 + 1);
  if (checker.hash(payload) === checker.hash(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, 'twin',
      [distance, c1, c2]);
  }
}

function checkTwinErrors(payload, checker, distance = 0, count = 100) {
  const collisions = new Set();
  for (let i = 0; i < count; i++) {
    const collision = checkTwinError(payload, checker, distance);
    if (collision != null) { collisions.add(collision); }
  }
  return collisions;
}

// checkTranscriptions: function(payload)
// checker: has a hash() and a verify().
// count: number of one-payload checks to make. (Battery size.)
// checkCount: number of checks to make for one payload.
// Returns a Set of Collisions.
function runBattery(checkTranscriptions, count = 100, checkCount = 500) {
  let collisions = new Set();
  for (let i = 0; i < count; i++) {
    const newCollisions = checkTranscriptions(genBase32Payload(),
      checkCount);
    collisions = new Set([...collisions, ...newCollisions]);
  }
  return collisions;
}

const batteries = [
  {
    name: 'substitutions',
    run: function(payload, attemptsPerPayload) {
      return checkSubstitutions(payload, base32check, attemptsPerPayload);
    },
  },
  {
    name: '0-jump transpositions',
    run: function(payload, attemptsPerPayload) {
      return checkTranspositions(payload, base32check, 0,
        attemptsPerPayload);
    },
  },
  {
    name: '1-jump transpositions',
    run: function(payload, attemptsPerPayload) {
      return checkTranspositions(payload, base32check, 1,
        attemptsPerPayload);
    },
  },
  {
    name: '2-jump transpositions',
    run: function(payload, attemptsPerPayload) {
      return checkTranspositions(payload, base32check, 2,
        attemptsPerPayload);
    },
  },
  {
    name: '0-jump twin errors',
    run: function(payload, attemptsPerPayload) {
      return checkTwinErrors(payload, base32check, 0,
        attemptsPerPayload);
    },
  },
  {
    name: '1-jump twin errors',
    run: function(payload, attemptsPerPayload) {
      return checkTwinErrors(payload, base32check, 1,
        attemptsPerPayload);
    },
  },
  {
    name: '2-jump twin errors',
    run: function(payload, attemptsPerPayload) {
      return checkTwinErrors(payload, base32check, 2,
        attemptsPerPayload);
    },
  },
];

function runAndDisplayBattery(battery) {
  const batterySize = 500;
  const attemptsPerPayload = 100;
  const collisions = runBattery(battery.run, batterySize);
  //console.log([...collisions].map(c => c.toString()).join('\n'));
  const total = batterySize * attemptsPerPayload;
  const fraction = collisions.size / total;
  console.log(`${battery.name}: ${collisions.size} collisions (${fraction*100}% of ${total})`);
}

function main() {
  batteries.forEach(runAndDisplayBattery);
}

main();
