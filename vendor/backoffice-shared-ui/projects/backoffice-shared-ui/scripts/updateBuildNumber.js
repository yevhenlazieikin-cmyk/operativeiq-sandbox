const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'assets', 'build-details.json');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading build-details.json:', err);
    return;
  }

  let buildDetails;
  try {
    buildDetails = JSON.parse(data);
  } catch (parseErr) {
    console.error('Error parsing build-details.json:', parseErr);
    return;
  }

  const timestamp = Date.now().toString();
  buildDetails.buildNumber = timestamp;

  fs.writeFile(filePath, JSON.stringify(buildDetails, null, 2), 'utf8', writeErr => {
    if (writeErr) {
      console.error('Error writing build-details.json:', writeErr);
      return;
    }

    console.log(`Build number updated to ${buildDetails.buildNumber}`);
  });
});

