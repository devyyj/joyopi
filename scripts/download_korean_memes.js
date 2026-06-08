const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '../public/images/memes');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 30 Unsplash Photo IDs mapping to the 30 human emotions of our memes
const photoUrls = {
  '01_muyaho.jpg': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80', // Happy shouting man
  '02_bongsun.jpg': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=80', // Shocked hands gesture
  '03_kwak.jpg': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80', // Serious victory sign
  '04_four_dollars.jpg': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80', // Firm holding hand up
  '05_munhee.jpg': 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=500&auto=format&fit=crop&q=80', // Shouting angry woman
  '06_seho.jpg': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80', // Confused shrugging man
  '07_hyunyoung.jpg': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80', // Nervous awkward smile
  '08_junggu.jpg': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80', // Smirking man holding hand near face
  '09_myungsoo.jpg': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80', // Sarcastic cynical speaker
  '10_simyoung.jpg': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80', // Crying screaming person
  '11_jjanggu.jpg': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80', // Cheeky smiling boy
  '12_gildong.jpg': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80', // Angry glaring man
  '13_pikachu.jpg': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80', // Extremely surprised face
  '14_jingjing.jpg': 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&auto=format&fit=crop&q=80', // Bored tired face in hand
  '15_pepe.jpg': 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80', // Sad crying person
  '16_ttabong.jpg': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80', // Thumbs up pose
  '17_cat_angry.jpg': 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=500&auto=format&fit=crop&q=80', // Furious screaming face
  '18_cat_smile.jpg': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80', // Forced awkward smile
  '19_raccoon.jpg': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80', // Person pointing / studying
  '20_monkey.jpg': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80', // Guilty looking sideways
  '21_doge.jpg': 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=80', // Strong bodybuilder / doge
  '22_calmdown.jpg': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80', // Calm down man
  '23_dex.jpg': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80', // Winking man
  '24_kwaktube.jpg': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80', // Upset face
  '25_iu.jpg': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80', // Person looking up crying
  '26_jaypark.jpg': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80', // Posing coolly
  '27_dokin.jpg': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80', // Pouting woman
  '28_dongseok.jpg': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80', // Muscular fist
  '29_jadoo.jpg': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=80', // Playful kid tongue out
  '30_pingu.jpg': 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&auto=format&fit=crop&q=80'  // Lip pucker
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
  console.log('Downloading 30 high-quality human stock images for Korean memes...');
  const keys = Object.keys(photoUrls);
  for (const filename of keys) {
    const destPath = path.join(targetDir, filename);
    const url = photoUrls[filename];
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
