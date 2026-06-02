const https = require('https');

https.get('https://api.imgflip.com/get_memes', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data).data.memes;
    list.forEach((m, idx) => {
      console.log(`${idx + 1}: "${m.name}" -> ${m.url}`);
    });
  });
});
