const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'assets', 'generated');
fs.mkdirSync(outDir, { recursive: true });

const specs = {
  'header-email.jpg': ['header-v2.b64'],
  'milei-email.jpg': ['milei-v2.b64'],
  'officials-email.jpg': [
    'officials-v2.0.b64',
    'officials-v2.1.b64',
    'officials-v2.2.b64',
    'officials-v2.3.b64',
    'officials-v2.4.b64'
  ],
  'footer-email.jpg': ['footer-cta-source.b64']
};

for (const [filename, parts] of Object.entries(specs)) {
  const base64 = parts.map(part => fs.readFileSync(path.join(__dirname, 'assets', part), 'utf8').trim()).join('');
  fs.writeFileSync(path.join(outDir, filename), Buffer.from(base64, 'base64'));
}

console.log('Generated static email assets:', Object.keys(specs).join(', '));
