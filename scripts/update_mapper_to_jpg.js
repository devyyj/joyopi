const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/memechat/utils/memeMapper.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace all .svg with .jpg
content = content.replace(/\.svg/g, '.jpg');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated memeMapper.ts image paths to .jpg!');
