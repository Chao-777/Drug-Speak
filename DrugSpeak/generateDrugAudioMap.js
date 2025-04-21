const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'assets/audio');
const outputFile = path.join(__dirname, 'drugAudioMap.js');

const files = fs.readdirSync(audioDir);

const audioMap = {};

files.forEach((file) => {
   if (!/\.(mp3|wav)$/i.test(file)) return;

   const isMale = file.includes('1 - male');
   const isFemale = file.includes('- female');

   const baseName = isMale
      ? file.replace(' 1 - male.wav', '')
      : file.replace(' - female.wav', '');

   if (!audioMap[baseName]) {
      audioMap[baseName] = { audio: {} };
   }

   if (isMale) {
      audioMap[baseName].audio.male = `require('../assets/audio/${file}')`;
   } else if (isFemale) {
      audioMap[baseName].audio.female = `require('../assets/audio/${file}')`;
   }
});

const lines = [
   'export const drugAudioMap = {',
   ...Object.entries(audioMap).map(([drug, { audio }]) => {
      return `  "${drug}": {\n` +
      `    audio: {\n` +
      `      male: ${audio.male || 'null'},\n` +
      `      female: ${audio.female || 'null'}\n` +
      `    }\n` +
      `  },`;
   }),
   '};'
];

fs.writeFileSync(outputFile, lines.join('\n'), 'utf-8');
console.log('✅ drugAudioMap.js generated!');
