import os
import re

themedir = './src/components/themes/'

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx'):
        continue
    filepath = os.path.join(themedir, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    idx_buka = content.find("Buka Undangan")
    if idx_buka == -1:
        idx_buka = content.find("BUKA UNDANGAN")
    
    if idx_buka != -1:
        chunk_start = max(0, idx_buka - 5000)
        chunk = content[chunk_start:idx_buka]
        
        # BirthdayBash uses: <img src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`}
        chunk = re.sub(r'src=\{cp\.startsWith', r'src={(landingPhoto || cp)?.startsWith', chunk)
        # ModernMinimalist uses: src={(() => { const cp = Array.isArray(invitation.cover_photo) ? ... return cp?.startsWith...
        chunk = re.sub(r'return cp\?\.startsWith', r'return (landingPhoto || cp)?.startsWith', chunk)
        # BlushRomantic uses: {cp ? ( ... ) }
        chunk = re.sub(r'\{cp \? \(', r'{(landingPhoto || cp) ? (', chunk)
        
        content = content[:chunk_start] + chunk + content[idx_buka:]
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Second patch done.")
