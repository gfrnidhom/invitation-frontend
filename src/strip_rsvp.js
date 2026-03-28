const fs = require('fs');
const path = require('path');
const targetDir = path.join(__dirname, 'components/themes');

const filesToStrip = [
  'RoyalGold.jsx',
  'BirthdayBash.jsx',
  'EksklusifModern.jsx',
  'ModernRomance.jsx',
  'TropicalParadise.jsx'
];

filesToStrip.forEach(fileName => {
  const filePath = path.join(targetDir, fileName);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find {guest && (
  let startIndex = content.indexOf('{guest && (');
  if (startIndex === -1) return;

  // We need to match brackets starting from the parenthesis '('
  let startParen = content.indexOf('(', startIndex);
  let openBrackets = 1;
  let endIndex = startParen + 1;
  
  while (openBrackets > 0 && endIndex < content.length) {
    if (content[endIndex] === '(') openBrackets++;
    else if (content[endIndex] === ')') openBrackets--;
    endIndex++;
  }
  
  // endIndex now points to the character after ')'
  // Usually it ends with ')}' so let's include the '}' if present
  if (content[endIndex] === '}') endIndex++;

  // Remove the block
  content = content.substring(0, startIndex) + '{/* RSVP Removed */}' + content.substring(endIndex);
  
  fs.writeFileSync(filePath, content);
  console.log('Stripped RSVP from:', fileName);
});
