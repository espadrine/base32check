const { checksums, computeCheckerStats, humanErrorDetectionRate }
  = require('./score.js');

function main() {
  checksums.forEach(checksum => {
    console.log(outline(' ' + checksum.label + ' '));
    const stats = computeCheckerStats(checksum);
    stats.forEach(displayBatteryStats);
    const errorRate = humanErrorDetectionRate(stats)
    const score = errorRate * 100;
    const detectionFactor = -Math.log2(1-errorRate) / (checksum.size * checksum.bitsPerChar);
    console.log(`Score: ${score.toFixed(3)}%\t`
      + `Detection factor: ${detectionFactor.toFixed(3)}`);
  });
}

function outline(text) {
  return '\x1B[7m' + text + '\x1B[m';
}

function displayBatteryStats(batteryStats) {
  const { battery, collisions, errorRate, total } = batteryStats;
  //console.log([...collisions].map(c => c.toString()).join('\n'));
  const percentage = errorRate * 100;
  console.log(`${battery.name}:\t${collisions.size} ` +
    `collisions\t(${percentage.toFixed(3)}% of ${total})`);
}

main();
