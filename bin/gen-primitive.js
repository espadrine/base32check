#!/usr/bin/env node
// Find all the primitive elements of a finite field for a given cardinal.

let cardinal = process.argv[2];
if (cardinal == null) {
  console.error('Missing parameter.');
  console.error('Usage: gen-primitive <cardinal>');
  console.error('  cardinal: cardinal of the finite field.');
  process.exit(1);
}

function primitiveElements(cardinal) {
  let elements = new Set();
  // Go through candidate primitive elements.
  for (let pe = 0; pe < cardinal; pe++) {
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

console.log([...primitiveElements(cardinal).keys()].join(' '));
