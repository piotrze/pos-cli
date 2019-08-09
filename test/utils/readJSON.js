const fs = require('fs');

module.exports = filePath => {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });

    try {
      return JSON.parse(fileContent);
    } catch(e) {
      return {};
    }
  } else {
    return {};
  }
};
