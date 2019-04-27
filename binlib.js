function useChecker(checker) {
  let validateMode = false;
  for (let i = 1; i < process.argv.length; i++) {
    if (process.argv[i] === '-c' ||
        process.argv[i] === '--check') {
      validateMode = true;
    }
  }

  // FIXME: process the checksum chunkwise.
  let payload = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
      payload += chunk;
    }
  });
  process.stdin.on('end', () => {
    if (validateMode) {
      if (checker.validate(payload)) {
        console.error('OK');
      } else {
        console.error('FAILED');
        process.exit(1);
      }
    } else {
      var checksum = checker.compute(payload);
      console.log(checksum);
      //console.log(checker.compute(payload + checksum));
    }
  });
}

// Find all the primitive elements of a finite field for a given cardinal.

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

exports.useChecker = useChecker;
exports.primitiveElements = primitiveElements;
