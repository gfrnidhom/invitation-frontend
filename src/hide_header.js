const fs = require('fs');
const path = require('path');
const targetDir = path.join(__dirname, 'components/themes');

const filesToUpdate = [
  'BirthdayBash.jsx',
  'ClassicJavanese.jsx',
  'EksklusifModern.jsx',
  'ElegantWhite.jsx',
  'FloralDream.jsx',
  'ModernRomance.jsx',
  'RoyalGold.jsx',
  'RusticGarden.jsx',
  'TropicalParadise.jsx'
];

filesToUpdate.forEach(fileName => {
  const filePath = path.join(targetDir, fileName);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace <Guestbook with <Guestbook hideHeader={true}
  content = content.replace(/<Guestbook(\s)/, '<Guestbook hideHeader={true}$1');
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed headers in:', fileName);
});
