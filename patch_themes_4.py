import os
import re

themedir = './src/components/themes/'

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx'):
        continue
    filepath = os.path.join(themedir, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # Search for alternative envelope buttons 
    idx_buka = content.find("Open Invitation")
    if idx_buka == -1: idx_buka = content.find("OPEN INVITATION")
    
    if idx_buka != -1:
        chunk_start = max(0, idx_buka - 5000)
        chunk = content[chunk_start:idx_buka]
        
        # apply specific replacements for AureliaLuxe pattern
        chunk = chunk.replace('coverPhoto ? (', '(landingPhoto || coverPhoto) ? (')
        chunk = chunk.replace('src={coverPhoto}', 'src={landingPhoto || coverPhoto}')
        
        content = content[:chunk_start] + chunk + content[idx_buka:]
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Fourth patch done.")
