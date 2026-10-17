// 오버워치 영웅 초상화를 public/images/overwatch/{영웅 id}.png 로 내려받는다.
// 영웅 목록과 초상화 주소는 OverFast API(공식 사이트 데이터를 가공해 제공)를 사용한다.
// 사용법: node scripts/download_overwatch_portraits.js
const fs = require('fs');
const path = require('path');
const https = require('https');
// sharp 는 next 의 의존성으로 함께 설치된다. 용량을 줄이기 위해 128px 로 축소해 저장한다.
const sharp = require('sharp');

const SIZE = 128;

const API_URL = 'https://overfast-api.tekrop.fr/heroes?locale=ko-kr';
const targetDir = path.join(__dirname, '../public/images/overwatch');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`${url} 응답 코드 ${res.statusCode}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function main() {
  const heroes = JSON.parse((await fetchBuffer(API_URL)).toString('utf8'));
  console.log(`영웅 ${heroes.length}명의 초상화를 내려받습니다.`);

  for (const hero of heroes) {
    const filePath = path.join(targetDir, `${hero.key}.png`);
    try {
      const original = await fetchBuffer(hero.portrait);
      await sharp(original).resize(SIZE, SIZE).png({ compressionLevel: 9, palette: true }).toFile(filePath);
      console.log(`  ✓ ${hero.key} (${hero.name})`);
    } catch (e) {
      console.error(`  ✗ ${hero.key}: ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error('초상화 다운로드 실패:', e);
  process.exit(1);
});
