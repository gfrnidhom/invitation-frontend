const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/themes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    let filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let originalContent = content;

    // We address variations like "{invitation?.description || 'Dan...'}"
    // or {invitation?.opening_text || '"Dan..."'}
    content = content.replace(/(invitation\?\.)(?:description|opening_text)(\s*\|\|\s*(['"])[^'"]*Dan di antara[^'"]*\3)/gi, "$1quotes$2");

    // Replace the QS tag. 
    // Usually it's like <p...>- QS. Ar-Rum : 21 -</p>
    content = content.replace(/>([^<]*QS\.[^<]*)</gi, (match, text) => {
        return `>{invitation?.quotes_name || '${text.trim()}'}<`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

console.log('Replaced quotes in all themes.');
