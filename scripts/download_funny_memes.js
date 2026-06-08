const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '../public/images/memes');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 30 unique, highly recognized, funny meme templates from the top 100 list
const funnyMemeUrls = {
  '01_muyaho.jpg': 'https://i.imgflip.com/1bhk.jpg', // Success Kid
  '02_bongsun.jpg': 'https://i.imgflip.com/3qqcim.png', // Panik Kalm Panik
  '03_kwak.jpg': 'https://i.imgflip.com/1tkjq9.jpg', // Spider-man pointing at spider-man (Double)
  '04_four_dollars.jpg': 'https://i.imgflip.com/3lmzyx.jpg', // UNO Draw 25 Cards
  '05_munhee.jpg': 'https://i.imgflip.com/345v97.jpg', // Woman Yelling At Cat (Screaming)
  '06_seho.jpg': 'https://i.imgflip.com/265k.jpg', // Third World Skeptical Kid
  '07_hyunyoung.jpg': 'https://i.imgflip.com/gk5el.jpg', // Hide the Pain Harold
  '08_junggu.jpg': 'https://i.imgflip.com/1h7in3.jpg', // Roll Safe Think About It
  '09_myungsoo.jpg': 'https://i.imgflip.com/m78d.jpg', // Boardroom Meeting Suggestion
  '10_simyoung.jpg': 'https://i.imgflip.com/3pnmg.jpg', // Finding Neverland (Crying/Whispering)
  '11_jjanggu.jpg': 'https://i.imgflip.com/39t1o.jpg', // Leonardo Dicaprio Cheers
  '12_gildong.jpg': 'https://i.imgflip.com/145qvv.jpg', // Squidward window
  '13_pikachu.jpg': 'https://i.imgflip.com/2kbn1e.jpg', // Surprised Pikachu
  '14_jingjing.jpg': 'https://i.imgflip.com/1nck6k.jpg', // Sleeping Shaq
  '15_pepe.jpg': 'https://i.imgflip.com/1c1uej.jpg', // Sad Pablo Escobar
  '16_ttabong.jpg': 'https://i.imgflip.com/1iruch.jpg', // Drake Blank
  '17_cat_angry.jpg': 'https://i.imgflip.com/1w7ygt.jpg', // Inhaling Seagull
  '18_cat_smile.jpg': 'https://i.imgflip.com/38el31.jpg', // Clown Applying Makeup
  '19_raccoon.jpg': 'https://i.imgflip.com/1e7ql7.jpg', // Evil Kermit
  '20_monkey.jpg': 'https://i.imgflip.com/2gnnjh.jpg', // Monkey Puppet
  '21_doge.jpg': 'https://i.imgflip.com/43a45p.png', // Buff Doge vs. Cheems
  '22_calmdown.jpg': 'https://i.imgflip.com/wxica.jpg', // This Is Fine Dog
  '23_dex.jpg': 'https://i.imgflip.com/4acd7j.png', // Laughing Leo
  '24_kwaktube.jpg': 'https://i.imgflip.com/u0pf0.jpg', // Disappointed Black Guy
  '25_iu.jpg': 'https://i.imgflip.com/46hhvr.jpg', // Mother Ignoring Kid Drowning In A Pool
  '26_jaypark.jpg': 'https://i.imgflip.com/grr.jpg', // The Rock Driving
  '27_dokin.jpg': 'https://i.imgflip.com/23ls.jpg', // Disaster Girl
  '28_dongseok.jpg': 'https://i.imgflip.com/hlmst.jpg', // I'm The Captain Now
  '29_jadoo.jpg': 'https://i.imgflip.com/176h0h.jpg', // Bart Simpson / say the line bart
  '30_pingu.jpg': 'https://i.imgflip.com/44eggm.png'  // Bugs Bunny Communist
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', err => {
      reject(err);
    });
  });
}

async function startDownload() {
  console.log('Downloading 30 unique and funny original meme templates...');
  const keys = Object.keys(funnyMemeUrls);
  for (const filename of keys) {
    const destPath = path.join(targetDir, filename);
    const url = funnyMemeUrls[filename];
    try {
      await downloadFile(url, destPath);
      console.log(`Successfully downloaded: ${filename}`);
    } catch (err) {
      console.error(`Error downloading ${filename}:`, err.message);
    }
  }
  console.log('All downloads finished.');
}

startDownload();
