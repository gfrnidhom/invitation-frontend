const fs = require('fs');
const path = require('path');

const dir = 'src/components/themes';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const f of files) {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    
    if (content.includes('{event.location}') && !content.includes('{event.address}')) {
        // Find how {event.location} is surrounded
        console.log("Processing", f);
        
        // Match 1: Single line tags eg <h4 ...>{event.location}</h4>
        content = content.replace(/^(.*<[a-z1-6]+[^>]*>\{event\.location\}<\/[a-z1-6]+>)$/gm, (match, p1) => {
            const indent = match.match(/^\s*/)[0];
            return `${indent}<div className="space-y-1 flex flex-col items-center">
${p1}
${indent}    <p className="text-[10px] leading-relaxed max-w-[200px] mx-auto opacity-70 text-center">
${indent}        {event.address || ''}
${indent}    </p>
${indent}</div>`;
        });
        
        // Match 2: Bare {event.location} 
        // Example: ModernRomance.jsx where it's on a standalone line.
        content = content.replace(/^(\s*)\{event\.location\}(\s*)$/gm, (match, whitespace1, whitespace2) => {
            return `${whitespace1}{event.location}
${whitespace1}{event.address && (
${whitespace1}    <span className="block text-[10px] opacity-70 max-w-[200px] mx-auto text-center mt-1">
${whitespace1}        {event.address}
${whitespace1}    </span>
${whitespace1})}
`;
        });
        
        fs.writeFileSync(p, content);
    }
}
