const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname);

function balanceParentheses(str, startIndex) {
    let count = 0;
    let started = false;
    for (let i = startIndex; i < str.length; i++) {
        if (str[i] === '(') {
            count++;
            started = true;
        } else if (str[i] === ')') {
            count--;
        }
        
        if (started && count === 0) {
            return i;
        }
    }
    return -1;
}

function processJSXFiles() {
    const files = fs.readdirSync(themesDir).filter(f => f.endsWith('Theme.jsx') || f.endsWith('.jsx'));

    for (const file of files) {
        if (file === 'MotionGardenPremium.jsx') continue; // Skip, already updated

        const filePath = path.join(themesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if it already uses GiftAccounts or GiftAtmCard
        if (content.includes('GiftAccounts from') || content.includes('GiftAtmCard from')) {
            console.log(`Skipping ${file} ... already modularized.`);
            continue;
        }

        // We need to inject the import statement
        if (!content.includes("import GiftAtmCard")) {
            content = content.replace("import React", "import GiftAtmCard from './partials/GiftAtmCard';\nimport React");
        }

        // Find invitation.gift_accounts.map
        const searchTerms = [
            "invitation.gift_accounts.map(",
            "invitation?.gift_accounts?.map("
        ];

        let termIndex = -1;
        let searchString = "";
        
        for (const term of searchTerms) {
            termIndex = content.indexOf(term);
            if (termIndex !== -1) {
                searchString = term;
                break;
            }
        }

        if (termIndex !== -1) {
            // Found it! Let's find the end of the .map(...)
            const mapStartIndex = termIndex + searchString.length - 1; // index of '('
            const mapEndIndex = balanceParentheses(content, mapStartIndex);

            if (mapEndIndex !== -1) {
                // The old block
                const blockToReplace = content.substring(termIndex, mapEndIndex + 1);
                
                // Extract the loop variable, usually 'a' or 'acc', 'i' or 'index'
                // e.g. "invitation.gift_accounts.map((a,i)" or "map(a=>"
                
                const newBlock = `invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={\`\${(i % 3) + 1}\`} />
                            ))`;
                
                content = content.replace(blockToReplace, newBlock);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated ${file}`);
            } else {
                console.log(`Could NOT balance parens in ${file}`);
            }
        } else {
            console.log(`Skipping ${file} ... map block not found or different.`);
        }
    }
}

processJSXFiles();
