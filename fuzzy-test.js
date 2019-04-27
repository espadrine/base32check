const { base32check1, base32check2 } = require('./lib.js');
const { mod11_10: numeric_mod11_10,  // Numeric 1-digit
        mod97_10: numeric_mod97_10,  // Numeric 2-digit
        mod37_36,                    // Alnum 1-digit
        mod1271_36,                  // Alnum 2-digit
} = require('cdigit');

function main() {
  console.log(outline(' base32check1 '));
  batteries.forEach(b => runAndDisplayBattery(b, base32check1));
  console.log(outline(' base32check2 '));
  batteries.forEach(b => runAndDisplayBattery(b, base32check2));
  console.log(outline(' MOD 11-10 '));
  batteries.forEach(b => runAndDisplayBattery(b, mod11_10));
  console.log(outline(' MOD 97-10 '));
  batteries.forEach(b => runAndDisplayBattery(b, mod97_10));
  console.log(outline(' MOD 37-36 '));
  batteries.forEach(b => runAndDisplayBattery(b, mod37_36));
  console.log(outline(' MOD 1271-36 '));
  batteries.forEach(b => runAndDisplayBattery(b, mod1271_36));
}

function outline(text) {
  return '\x1B[7m' + text + '\x1B[m';
}

function runAndDisplayBattery(battery, checker) {
  const batterySize = 1000;
  const attemptsPerPayload = 100;
  const collisions = runBattery(battery.run, checker,
    batterySize, attemptsPerPayload);
  //console.log([...collisions].map(c => c.toString()).join('\n'));
  const total = batterySize * attemptsPerPayload;
  const percentage = collisions.size / total * 100;
  console.log(`${battery.name}:\t${collisions.size} collisions\t(${percentage.toFixed(3)}% of ${total})`);
}

// checker: has a compute() and a verify().
// number: number of different substitutions.
// Returns undefined (if no collision) or a Collision.
function checkSubstitution(payload, checker, number = 1) {
  let tweaked = payload;
  const tweaks = [];
  for (let i = 0; i < number; i++) {
    let index, orig, sub, newTweaked;
    do {
      // Take a random character.
      index = Math.floor(Math.random() * payload.length);
      orig = tweaked[index];
      do {
        // Replace it with a random character.
        sub = genBase32();
      } while (sub === orig);
      newTweaked = tweaked.slice(0, index) + sub + tweaked.slice(index + 1);
    } while (payload === newTweaked);
    tweaked = newTweaked;
    tweaks.push(orig, sub);
  }

  if (checker.compute(payload) === checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, 'substitution',
      [number, ...tweaks]);
  }
}

// checker: has a compute() and a verify().
// Returns a Set of Collisions.
function checkSubstitutions(payload, checker, number = 1, count = 100) {
  const collisions = new Set();
  for (let i = 0; i < count; i++) {
    const collision = checkSubstitution(payload, checker, number);
    if (collision != null) { collisions.add(collision); }
  }
  return collisions;
}

// checker: has a compute() and a verify().
// distance: number of characters between the symbols to substitute.
// Returns undefined (if no collision) or a Collision.
function checkJumpSubstitution(payload, checker, number = 2, distance = 0) {
  let tweaked = payload;
  const tweaks = [];

  // Take a random character.
  let index = Math.floor(Math.random()
    * (payload.length - (distance + 1) * number + distance));

  for (let i = 0; i < number; i++, index += distance + 1) {
    let orig, sub, newTweaked;
    do {
      orig = tweaked[index];
      do {
        // Replace it with a random character.
        sub = genBase32();
      } while (sub === orig);
      newTweaked = tweaked.slice(0, index) + sub + tweaked.slice(index + 1);
    } while (payload === newTweaked);
    tweaked = newTweaked;
    tweaks.push(orig, sub);
  }

  if (checker.compute(payload) === checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, 'substitution',
      [number, ...tweaks]);
  }
}

// checker: has a compute() and a verify().
// distance: number of characters between the symbols to substitute.
// Returns a Set of Collisions.
function checkJumpSubstitutions(payload, checker,
    number = 2, distance = 0, count = 100) {
  const collisions = new Set();
  for (let i = 0; i < count; i++) {
    const collision = checkJumpSubstitution(payload, checker, number, distance);
    if (collision != null) { collisions.add(collision); }
  }
  return collisions;
}

// checker: has a compute() and a verify().
// distance: number of characters between the symbols to transpose.
// Returns undefined (if no collision) or a Collision.
function checkTransposition(payload, checker, distance = 0) {
  let i1, i2, c1, c2;
  // Take a random character.
  i1 = Math.floor(Math.random() * (payload.length - distance - 1));
  c1 = payload[i1];
  // Transpose it with the character <distance> after.
  i2 = i1 + distance + 1;
  c2 = payload[i2];

  // Change the payload to avoid it being identical.
  if (c1 === c2) {
    do {
      c2 = genBase32();
    } while (c1 === c2);
    payload = payload.slice(0, i2) + c2 + payload.slice(i2 + 1);
  }

  const tweaked = payload.slice(0, i1) + c2 + payload.slice(i1 + 1, i2) + c1 + payload.slice(i2 + 1);
  if (checker.compute(payload) === checker.compute(tweaked)) {
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

// checker: has a compute() and a verify().
// distance: number of characters between the symbols to transpose.
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
  if (checker.compute(payload) === checker.compute(tweaked)) {
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
// checker: has a compute() and a verify().
// count: number of one-payload checks to make. (Battery size.)
// attemptsPerPayload: number of checks to make for one payload.
// Returns a Set of Collisions.
function runBattery(checkTranscriptions, checker,
    count = 100, attemptsPerPayload = 500) {
  let collisions = new Set();
  for (let i = 0; i < count; i++) {
    const newCollisions = checkTranscriptions(checker, genBase32Payload(),
      attemptsPerPayload);
    collisions = new Set([...collisions, ...newCollisions]);
  }
  return collisions;
}

const batteries = [
  {
    name: '1 substitution ',
    run: function(checker, payload, attemptsPerPayload) {
      return checkSubstitutions(payload, checker, 1, attemptsPerPayload);
    },
  },
  {
    name: '2 substitutions',
    run: function(checker, payload, attemptsPerPayload) {
      return checkSubstitutions(payload, checker, 2, attemptsPerPayload);
    },
  },
  {
    name: '3 substitutions',
    run: function(checker, payload, attemptsPerPayload) {
      return checkSubstitutions(payload, checker, 3, attemptsPerPayload);
    },
  },
  {
    name: '0-jump transposition',
    run: function(checker, payload, attemptsPerPayload) {
      return checkTranspositions(payload, checker, 0,
        attemptsPerPayload);
    },
  },
  {
    name: '1-jump transposition',
    run: function(checker, payload, attemptsPerPayload) {
      return checkTranspositions(payload, checker, 1,
        attemptsPerPayload);
    },
  },
  {
    name: '2-jump transposition',
    run: function(checker, payload, attemptsPerPayload) {
      return checkTranspositions(payload, checker, 2,
        attemptsPerPayload);
    },
  },
  {
    name: '18-jump transposition',
    run: function(checker, payload, attemptsPerPayload) {
      return checkTranspositions(payload, checker, 18,
        attemptsPerPayload);
    },
  },
  {
    name: '0-jump twin error',
    run: function(checker, payload, attemptsPerPayload) {
      return checkTwinErrors(payload, checker, 0,
        attemptsPerPayload);
    },
  },
  {
    name: '1-jump twin error',
    run: function(checker, payload, attemptsPerPayload) {
      return checkTwinErrors(payload, checker, 1,
        attemptsPerPayload);
    },
  },
  {
    name: '2-jump twin error',
    run: function(checker, payload, attemptsPerPayload) {
      return checkTwinErrors(payload, checker, 2,
        attemptsPerPayload);
    },
  },
  {
    name: '18-jump twin error',
    run: function(checker, payload, attemptsPerPayload) {
      return checkTwinErrors(payload, checker, 18,
        attemptsPerPayload);
    },
  },
  {
    name: '0-jump 2 substitutions',
    run: function(checker, payload, attemptsPerPayload) {
      return checkJumpSubstitutions(payload, checker, 2, 0, attemptsPerPayload);
    },
  },
  {
    name: '1-jump 2 substitutions',
    run: function(checker, payload, attemptsPerPayload) {
      return checkJumpSubstitutions(payload, checker, 2, 1, attemptsPerPayload);
    },
  },
  {
    name: '0-jump 20 substitution',
    run: function(checker, payload, attemptsPerPayload) {
      return checkJumpSubstitutions(payload, checker, 20, 0, attemptsPerPayload);
    },
  },
];

function genBase32Payload(length = 20) {
  let payload = '';
  for (let i = 0; i < length; i++) {
    payload += genBase32();
  }
  return payload;
}

function genBase32() {
  return base32check2.toBase32Char(Math.floor(Math.random() * 32));
}

// Convert non-base32 checkers.

function convertNumericCheckerToBase32(checker) {
  return {
    compute: payload => checker.compute(convertNumeric(payload)),
    validate: payload => checker.validate(convertNumeric(payload)),
  };
}

// To fit in, the numeric checkers need to have their input converted.
// In the case of IBANs, A = 10, …, Z = 35.
// Since it is an ISO specification, we will consider that this mapping is
// the official one, and use it for the purpose of comparison.
function convertNumeric(payload) {
  return payload.replace(/[A-Z]/g, c => c.charCodeAt(0) - 65 + 10);
}

const mod97_10 = convertNumericCheckerToBase32(numeric_mod97_10);
const mod11_10 = convertNumericCheckerToBase32(numeric_mod11_10);

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

main();
