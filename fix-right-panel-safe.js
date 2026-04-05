const fs = require('fs');
const path = require('path');

const dir = './src/components/themes/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf-8');
    let changed = false;

    // 1. Restore 70/30 widths for all themes
    if (content.includes('lg:w-[55%]')) {
        content = content.replace(/lg:w-\[55%\]/g, 'lg:w-[70%]');
        changed = true;
    }
    if (content.includes('lg:w-[45%]')) {
        content = content.replace(/lg:w-\[45%\]/g, 'lg:w-[30%]');
        changed = true;
    }
    
    // Custom width themes
    if (content.includes('width: 50%') && file === 'MinimalistNavy.jsx') {
        content = content.replace(/width: 50%;/g, 'width: 70%;');
        content = content.replace(/margin-left: 50%; width: 50%;/g, 'margin-left: 70%; width: 30%;');
        changed = true;
    }
    if (content.includes('width: 45%') && file === 'GardenParallax.jsx') {
        content = content.replace(/width: 45%;/g, 'width: 70%;');
        content = content.replace(/margin-left: 45%; width: 55%;/g, 'margin-left: 70%; width: 30%;');
        changed = true;
    }
    if (content.includes('width: 48%') && file === 'EnchantedGarden.jsx') {
        content = content.replace(/width: 48%;/g, 'width: 70%;');
        content = content.replace(/margin-left: 48%; width: 52%;/g, 'margin-left: 70%; width: 30%;');
        changed = true;
    }

    // 2. Fix MinimalistNavy rightPanelRef undefined error
    if (file === 'MinimalistNavy.jsx' && !content.includes('const rightPanelRef = useRef')) {
        content = content.replace(
            `const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });`,
            `const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });\n    const rightPanelRef = useRef(null);`
        );
        changed = true;
    }

    // 3. Remove MusicPlayer duplicated wave animation
    if (file === 'MusicPlayer.jsx' && content.includes('animate-music-bar')) {
        content = content.replace(/\{\/\*\s*Animated\s*Sound\s*Waves[\s\S]*?\}\s*\}\)/g, '{/* Removed Animated Sound Waves */}');
        changed = true;
    }

    // 4. Safe cleanup of right panel responsive tags (fixing the messy layout properly)
    // We only want to remove `md:px-`, `lg:px-`, `md:text-`, `lg:text-`, `md:w-`, `lg:w-`, `md:h-`, `lg:h-`, `md:grid-cols-` and `lg:grid-cols-`
    // VERY STRICT: Do not remove `hidden`, `flex`, `items-center` unless specifically targetting spacing/typography
    const regex = /(<div\s+ref=\{?(?:rpRef|rightPanelRef)\}?[^\>]*\>)/;
    const parts = content.split(regex);
    
    if (parts.length > 2) {
        let rightPanelContent = parts[2];
        const original = rightPanelContent;
        // Strip out only margin, padding, typography sizing, dimensions, and grid col definitions
        // md:px-12 lg:text-3xl lg:w-48
        const classToStrip = /\s+(?:sm|md|lg|xl)\:(?:text|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|gap|grid-cols|leading)\-[a-zA-Z0-9\-\.\[\]]+/g;
        rightPanelContent = rightPanelContent.replace(classToStrip, '');
        
        if (original !== rightPanelContent) {
            parts[2] = rightPanelContent;
            content = parts[0] + parts[1] + parts[2];
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(path.join(dir, file), content, 'utf-8');
        console.log(`Re-applied fixes to ${file}`);
    }
});
