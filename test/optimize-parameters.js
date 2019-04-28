// To run this, you need to make the 1.js and 2.js primitives non-constant
// and export them.

const { checksums, computeCheckerDetectionRate } = require('./score.js');
const { primitiveElements } = require('../binlib.js');

function main() {
  search('base32check1');
  search('base32check2');
}

function search(label) {
  console.log(label);
  const prims = primitives[label];
  const best = prims.reduce((acc, primitive) => {
    // acc is the best current primitive.
    const checker = checksums.find(c => c.label === label).checker;
    checker.primitive = primitive;
    const detection = computeCheckerDetectionRate(checker);
    if (detection > acc.detection) {
      acc.detection = detection;
      acc.primitive = primitive;
    }
    console.log(`primitive ${JSON.stringify(primitive)}`);
    console.log(`detection ${detection}`);
    return acc;
  }, { detection: 0, primitive: prims[0] });
  console.log(`Best primitive: ${JSON.stringify(best.primitive)}\t`
    + `detection: ${best.detection * 100}%`);
}

const primitives = {
  base32check1: [
    // 1+x2+x5
    [ [0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0] ],
    // 1+x+x2+x3+x5
    [ [0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 0, 1],
      [0, 0, 1, 0, 1],
      [0, 0, 0, 1, 0] ],
    // 1+x3+x5
    [ [0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 1],
      [0, 0, 0, 1, 0] ],
    // 1+x+x3+x4+x5
    [ [0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 1],
      [0, 0, 0, 1, 1] ],
    // 1+x2+x3+x4+x5
    [ [0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 1],
      [0, 0, 1, 0, 1],
      [0, 0, 0, 1, 1] ],
    // 1+x+x2+x4+x5
    [ [0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 1] ],
  ],
  base32check2: [...primitiveElements(1021)],
};

main();
