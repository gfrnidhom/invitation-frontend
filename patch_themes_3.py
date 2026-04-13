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
        
        # fix: src={cp.startsWith?.('http') ? cp : `${STORAGE_URL}/${cp}`}
        chunk = chunk.replace('src={cp.startsWith', 'src={(landingPhoto || cp)?.startsWith')
        chunk = chunk.replace('return cp?.startsWith', 'return (landingPhoto || cp)?.startsWith')
        chunk = chunk.replace('? cp :', '? (landingPhoto || cp) :')
        chunk = chunk.replace('? cp.startsWith', '? (landingPhoto || cp)?.startsWith')
        chunk = chunk.replace('`${STORAGE_URL}/${cp}`', '`${STORAGE_URL}/${(landingPhoto || cp)}`')
        
        content = content[:chunk_start] + chunk + content[idx_buka:]
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Third patch done.")
