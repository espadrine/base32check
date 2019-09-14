const { base32check1, base32check2, mod1007_32 } = require('../lib.js');
const { mod11_10,   // Numeric 1-digit
        mod97_10,   // Numeric 2-digit
        mod37_36,   // Alnum 1-digit
        mod1271_36, // Alnum 2-digit
} = require('cdigit');
const alphabet = require('./alphabet.js');

// Checksum: {label, checker {compute(), verify()}, alphabet, size, bitsPerChar}
function makeChecksums() {
  return [
    { label: 'base32check1',
      checker: base32check1,
      alphabet: alphabet.base32,
      size: 1,
      bitsPerChar: 5 },
    { label: 'base32check2',
      checker: base32check2,
      alphabet: alphabet.base32,
      size: 2,
      bitsPerChar: 5 },
    { label: 'MOD 11-10',
      checker: mod11_10_32,
      alphabet: alphabet.base32,
      size: 1,
      bitsPerChar: 5 },
    { label: 'MOD 97-10',
      checker: mod97_10_32,
      alphabet: alphabet.base32,
      size: 2,
      bitsPerChar: 5 },
    { label: 'MOD 37-36',
      checker: mod37_36,
      alphabet: alphabet.base32,
      size: 1,
      bitsPerChar: Math.log2(36) },
    { label: 'MOD 1271-36',
      checker: mod1271_36,
      alphabet: alphabet.base32,
      size: 2,
      bitsPerChar: Math.log2(36) },
    { label: 'MOD 1007-32',
      checker: mod1007_32,
      alphabet: alphabet.base32,
      size: 2,
      bitsPerChar: 5 },
  ];
}

function computeCheckerDetectionRate(checksum) {
  const stats = computeCheckerStats(checksum);
  return humanErrorDetectionRate(stats);
}

function computeCheckerStats(checksum) {
  return batteries.map(b => computeBatteryStats(b, checksum));
}

function humanErrorDetectionRate(stats) {
  return 1 - stats.reduce((acc, batteryStats) =>
    acc + batteryStats.errorRate * batteryStats.battery.probability, 0);
}

function computeBatteryStats(battery, checksum) {
  const batterySize = 1000;
  const attemptsPerPayload = 100;
  const collisions = runBattery(battery.run, checksum,
    batterySize, attemptsPerPayload);
  const total = batterySize * attemptsPerPayload;
  const errorRate = collisions.size / total;
  return { battery, checksum, errorRate, collisions, total };
}

function makeBatteries() {
  return [
    {
      name: '1  substitution',
      probability: 0.7905,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkSubstitution, { number: 1 });
      },
    },
    {
      name: '2 substitutions',
      probability: 0.0081,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkSubstitution, { number: 2 });
      },
    },
    {
      name: '3 substitutions',
      probability: 0.014,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkSubstitution, { number: 3 });
      },
    },
    {
      name: '4 substitutions',
      probability: 0.0097,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkSubstitution, { number: 4 });
      },
    },
    {
      name: '5 substitutions',
      probability: 0.0181,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkSubstitution, { number: 5 });
      },
    },
    {
      name: '6 substitutions',
      probability: 0.0134,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkSubstitution, { number: 6 });
      },
    },
    {
      name: '0-jump transposition',
      probability: 0.1021,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkTransposition, { distance: 0 });
      },
    },
    {
      name: '1-jump transposition',
      probability: 0.0082,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkTransposition, { distance: 1 });
      },
    },
    {
      name: '2-jump transposition',
      probability: 0,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkTransposition, { distance: 2 });
      },
    },
    {
      name: '18-jump transposition',
      probability: 0,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkTransposition, { distance: 18 });
      },
    },
    {
      name: '0-jump twin error',
      probability: 0.0055,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkTwinError, { distance: 0 });
      },
    },
    {
      name: '1-jump twin error',
      probability: 0.0029,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkTwinError, { distance: 1 });
      },
    },
    {
      name: '2-jump twin error',
      probability: 0,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkTwinError, { distance: 2 });
      },
    },
    {
      name: '18-jump twin error',
      probability: 0,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkTwinError, { distance: 18 });
      },
    },
    {
      name: '2 0-jump substitutions',
      probability: 0.0192,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkJumpSubstitution, { number: 2, distance: 0 });
      },
    },
    {
      name: '2 1-jump substitutions',
      probability: 0.0036,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkJumpSubstitution, { number: 2, distance: 1 });
      },
    },
    {
      name: 'phonetic error',
      probability: 0.0049,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkPhoneticError, {});
      },
    },
    {
      name: 'deletion',
      probability: 0,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkDeletion, {});
      },
    },
    {
      name: 'insertion',
      probability: 0,
      run: function(checksum, payload, attemptsPerPayload) {
        return findCollisions(checksum, payload, attemptsPerPayload,
          checkInsertion, {});
      },
    },
  ];
}

function findCollisions(checksum, payload, attemptsPerPayload = 100,
    checkError, params = {}) {
  const collisions = new Set();
  for (let i = 0; i < attemptsPerPayload; i++) {
    const collision = checkError(checksum, payload, params);
    if (collision != null) { collisions.add(collision); }
  }
  return collisions;
}

// number: number of different substitutions.
// Returns undefined (if no collision) or a Collision.
function checkSubstitution(checksum, payload, { number = 1 }) {
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
        sub = checksum.alphabet.gen();
      } while (sub === orig);
      newTweaked = tweaked.slice(0, index) + sub + tweaked.slice(index + 1);
    } while (payload === newTweaked);
    tweaked = newTweaked;
    tweaks.push(orig, sub);
  }

  if (checksum.checker.compute(payload) === checksum.checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, number + 'sub',
      [...tweaks]);
  }
}

// distance: number of characters between the symbols to substitute.
// Returns undefined (if no collision) or a Collision.
function checkJumpSubstitution(checksum, payload,
    { number = 2, distance = 0 }) {
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
        sub = checksum.alphabet.gen();
      } while (sub === orig);
      newTweaked = tweaked.slice(0, index) + sub + tweaked.slice(index + 1);
    } while (payload === newTweaked);
    tweaked = newTweaked;
    tweaks.push(orig, sub);
  }

  if (checksum.checker.compute(payload) === checksum.checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, `${distance}-${number}sub`,
      [...tweaks]);
  }
}

// distance: number of characters between the symbols to transpose.
// Returns undefined (if no collision) or a Collision.
function checkTransposition(checksum, payload, { distance = 0 }) {
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
      c2 = checksum.alphabet.gen();
    } while (c1 === c2);
    payload = payload.slice(0, i2) + c2 + payload.slice(i2 + 1);
  }

  const tweaked = payload.slice(0, i1) + c2 + payload.slice(i1 + 1, i2) + c1 + payload.slice(i2 + 1);
  if (checksum.checker.compute(payload) === checksum.checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, `${distance}-trans`, [c1, c2]);
  }
}

// distance: number of characters between the symbols to transpose.
// Returns undefined (if no collision) or a Collision.
function checkTwinError(checksum, payload, { distance = 0 }) {
  // Take a random character.
  const i1 = Math.floor(Math.random() * (payload.length - distance - 1));
  // Transpose it with the character <distance> after.
  const i2 = i1 + distance + 1;
  const c1 = checksum.alphabet.gen();
  let c2;
  do {
    c2 = checksum.alphabet.gen();
  } while (c2 === c1);

  payload = payload.slice(0, i1) + c1 + payload.slice(i1 + 1, i2) + c1 + payload.slice(i2 + 1);
  const tweaked = payload.slice(0, i1) + c2 + payload.slice(i1 + 1, i2) + c2 + payload.slice(i2 + 1);
  if (checksum.checker.compute(payload) === checksum.checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, `${distance}-twin`, [c1, c2]);
  }
}

// distance: number of characters between the symbols to transpose.
// Returns undefined (if no collision) or a Collision.
function checkPhoneticError(checksum, payload) {
  // Take a random character.
  const index = Math.floor(Math.random() * (payload.length - 1));
  // Take a random digit from 1 to 9.
  const digit = String.fromCharCode(
    Math.floor(1 + Math.random() * 9) + '0'.charCodeAt(0));

  payload = payload.slice(0, index) + '1' + digit + payload.slice(index + 2);
  const tweaked = payload.slice(0, index) + digit + '0'
    + payload.slice(index + 2);

  if (checksum.checker.compute(payload) === checksum.checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, 'phonetic', [digit]);
  }
}

// Returns undefined (if no collision) or a Collision.
function checkDeletion(checksum, payload) {
  // Take a random character.
  const index = Math.floor(Math.random() * (payload.length - 1));
  const tweaked = payload.slice(0, index) + payload.slice(index + 1);
  if (checksum.checker.compute(payload) === checksum.checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, 'del', [index, payload[index]]);
  }
}

// Returns undefined (if no collision) or a Collision.
function checkInsertion(checksum, payload) {
  // Take a random character.
  const index = Math.floor(Math.random() * (payload.length - 1));
  const c = checksum.alphabet.gen();
  const tweaked = payload.slice(0, index) + c + payload.slice(index);
  if (checksum.checker.compute(payload) === checksum.checker.compute(tweaked)) {
    // We have found a hash collision.
    return new Collision(payload, tweaked, 'ins', [index, c]);
  }
}

// checkTranscriptions: function(payload)
// count: number of one-payload checks to make. (Battery size.)
// attemptsPerPayload: number of checks to make for one payload.
// Returns a Set of Collisions.
function runBattery(checkTranscriptions, checksum,
    count = 100, attemptsPerPayload = 500) {
  let collisions = new Set();
  for (let i = 0; i < count; i++) {
    checksum.alphabet.gen.bind(checksum.alphabet);
    const newCollisions = checkTranscriptions(checksum,
      checksum.alphabet.genPayload(), attemptsPerPayload);
    collisions = new Set([...collisions, ...newCollisions]);
  }
  return collisions;
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

const mod97_10_32 = convertNumericCheckerToBase32(mod97_10);
const mod11_10_32 = convertNumericCheckerToBase32(mod11_10);

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

const checksums = makeChecksums();
const batteries = makeBatteries();

exports.checksums = checksums;
exports.batteries = batteries;
exports.computeCheckerDetectionRate = computeCheckerDetectionRate;
exports.computeCheckerStats = computeCheckerStats;
exports.humanErrorDetectionRate = humanErrorDetectionRate;

exports.base32check1 = base32check1;
exports.base32check2 = base32check2;
