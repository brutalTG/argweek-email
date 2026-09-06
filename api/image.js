const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  const name = Array.isArray(req.query.name) ? req.query.name[0] : req.query.name;

  const files = {
    header: ['header-v2.b64'],
    milei: ['milei-v2.b64'],
    officials: [
      'officials-v2.0.b64',
      'officials-v2.1.b64',
      'officials-v2.2.b64',
      'officials-v2.3.b64',
      'officials-v2.4.b64'
    ],
    footer: ['footer-v1.b64']
  };

  if (!files[name]) {
    res.statusCode = 404;
    return res.end('Not found');
  }

  try {
    const base64 = files[name]
      .map(file => fs.readFileSync(path.join(process.cwd(), 'assets', file), 'utf8').trim())
      .join('');

    const image = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.statusCode = 200;
    return res.end(image);
  } catch (error) {
    res.statusCode = 500;
    return res.end('Image unavailable');
  }
};
