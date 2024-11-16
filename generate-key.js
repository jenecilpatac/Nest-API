const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const secret = crypto.randomBytes(64).toString('hex');

const envFilePath = path.join(__dirname, '.env');

fs.readFile(envFilePath, 'utf8', (err, data) => {
  if (err) {
    fs.writeFile(envFilePath, `JWT_SECRET_KEY=${secret}\n`, (err) => {
      if (err) throw err;
    });
  } else {
    const lines = data.split('\n');
    const newEnvData = lines.map((line) => {
      if (line.startsWith('JWT_SECRET_KEY=')) {
        return `JWT_SECRET_KEY=${secret}`;
      }
      return line;
    });
    // If JWT_SECRET_KEY wasn't found, add it
    if (!lines.some((line) => line.startsWith('JWT_SECRET_KEY='))) {
      newEnvData.push(`JWT_SECRET_KEY=${secret}`);
    }
    fs.writeFile(envFilePath, newEnvData.join('\n'), (err) => {
      if (err) throw err;
    });
  }
});
