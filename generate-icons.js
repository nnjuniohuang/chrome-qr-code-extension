const sharp = require('sharp');

// Generate 48x48 icon
sharp('icon.svg')
  .resize(48, 48)
  .toFile('icon48.png')
  .then(() => console.log('Generated 48x48 icon'))
  .catch(err => console.error('Error generating 48x48 icon:', err));

// Generate 128x128 icon
sharp('icon.svg')
  .resize(128, 128)
  .toFile('icon128.png')
  .then(() => console.log('Generated 128x128 icon'))
  .catch(err => console.error('Error generating 128x128 icon:', err)); 