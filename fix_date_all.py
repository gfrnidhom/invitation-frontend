import os
import glob
import re

themes_dir = './src/components/themes/'
files = glob.glob(themes_dir + '/**/*.jsx', recursive=True)

count = 0
for f in files:
    with open(f, 'r') as file:
        content = file.read()
        
    original = content
    
    pattern1 = re.compile(r"const\s+dateStr\s*=\s*(invitation\.event_date)\.split\('T'\)\[0\]\.split\(' '\)\[0\];")
    if pattern1.search(content):
        replacement = """
        let baseDate = new Date(\\1.replace(' ', 'T'));
        if (isNaN(baseDate)) {
            baseDate = new Date(\\1.split('T')[0].split(' ')[0] + 'T00:00:00');
        }
        const _y = baseDate.getFullYear();
        const _m = String(baseDate.getMonth() + 1).padStart(2, '0');
        const _d = String(baseDate.getDate()).padStart(2, '0');
        const dateStr = `${_y}-${_m}-${_d}`;
        """
        content = pattern1.sub(replacement.strip(), content)

    pattern2 = re.compile(r"const\s+dateOnly\s*=\s*(eventDate)\.split\('T'\)\[0\]\.split\(' '\)\[0\];")
    if pattern2.search(content):
        replacement = """
        let baseDate = new Date(\\1.replace(' ', 'T'));
        if (isNaN(baseDate)) {
            baseDate = new Date(\\1.split('T')[0].split(' ')[0] + 'T00:00:00');
        }
        const _y = baseDate.getFullYear();
        const _m = String(baseDate.getMonth() + 1).padStart(2, '0');
        const _d = String(baseDate.getDate()).padStart(2, '0');
        const dateOnly = `${_y}-${_m}-${_d}`;
        """
        content = pattern2.sub(replacement.strip(), content)
        
    if content != original:
        with open(f, 'w') as file:
            file.write(content)
        print(f"Fixed {f}")
        count += 1
        
print(f"Total fixed: {count}")
