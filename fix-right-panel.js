const fs = require('fs');
const path = require('path');

const dir = './src/components/themes/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf-8');
    
    // Check if the file is a split-screen file
    const regex = /(<div\s+ref=\{?(?:rpRef|rightPanelRef)\}?[^\>]*\>)/;
    const parts = content.split(regex);
    
    if (parts.length > 2) {
        let rightPanelContent = parts[2];
        
        // Regex to strip responsive tailwind classes that affect layout inside the right panel
        // This strips md:, lg:, xl:, 2xl: prefixes for text, padding, margin, width, height, gap, grid, max-w, etc.
        const classToStrip = /\s+(?:sm|md|lg|xl|2xl)\:(?:text|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|gap|grid-cols|leading|tracking|max-w|flex-row|items|justify|space)\-[a-zA-Z0-9\-\.\[\]]+/g;
        
        // Let's also safely replace `md:text-left` or similar:
        const flexStrip = /\s+(?:sm|md|lg|xl|2xl)\:(?:items-center|justify-center|flex-row|flex-col|text-center|text-left|text-right|hidden|block|flex|grid)/g;

        const original = rightPanelContent;
        rightPanelContent = rightPanelContent.replace(classToStrip, '');
        rightPanelContent = rightPanelContent.replace(flexStrip, '');
        
        if (original !== rightPanelContent) {
            fs.writeFileSync(path.join(dir, file), parts[0] + parts[1] + rightPanelContent, 'utf-8');
            console.log(`Cleaned responsive classes in ${file}`);
        }
    }
});
