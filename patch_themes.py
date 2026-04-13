import os
import re

themedir = './src/components/themes/'

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx') or filename == 'SereneGarden.jsx':
        continue
    filepath = os.path.join(themedir, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # If it already has landing_photo logic patched, skip
    if 'invitation?.landing_photo' in content or 'invitation.landing_photo' in content:
        continue

    # 1. Inject the landingPhoto variable definition.
    # Find the top of the component (e.g. `export default function...`)
    match = re.search(r'export default function \w+\([^)]+\) {', content)
    if not match:
        continue
        
    injection = """
    const landingPhoto = (() => {
        const lp = payload.invitation?.landing_photo;
        if (!lp) return null;
        let photo = Array.isArray(lp) ? lp[0] : lp;
        if (typeof photo === 'object' && photo !== null) photo = photo.photo || photo.url;
        if (typeof photo !== 'string') return null;
        if (!photo.startsWith('http') && !photo.startsWith('/')) photo = `${process.env.NEXT_PUBLIC_STORAGE_URL || 'https://digitvitation.my.id/storage'}/${photo}`;
        return photo;
    })();
"""

    content = content[:match.end()] + injection + content[match.end():]

    # 2. Find the envelope cover string. Most themes use `invitation?.cover_photo` inline, or `coverPhoto`, or `cp`.
    # Let's locate the Buka Undangan text.
    idx_buka = content.find("Buka Undangan")
    if idx_buka == -1:
        idx_buka = content.find("BUKA UNDANGAN")
    
    if idx_buka != -1:
        # scan backwards for 150 lines to find the relevant img/div
        chunk_start = max(0, idx_buka - 5000)
        chunk = content[chunk_start:idx_buka]
        
        # Replace `coverPhoto` with `(landingPhoto || coverPhoto)` in this chunk.
        # It's tricky because coverPhoto might be `cp`, `getPhoto(invitation.cover_photo)`, `invitation.cover_photo`
        # Let's do smart replacements inside the chunk
        chunk = re.sub(r'coverPhoto \? \(', r'(landingPhoto || coverPhoto) ? (', chunk)
        chunk = re.sub(r'src=\{coverPhoto\}', r'src={landingPhoto || coverPhoto}', chunk)
        chunk = re.sub(r'src=\{\(\(\) => \{ const cp = Array.isArray\(invitation.cover_photo\) \? invitation.cover_photo\[0\] \: invitation.cover_photo; return cp',
               r'src={(() => { const cp = landingPhoto || (Array.isArray(invitation.cover_photo) ? invitation.cover_photo[0] : invitation.cover_photo); return cp', chunk)
               
        # Many use `cp`
        chunk = re.sub(r'src=\{cp\}', r'src={landingPhoto || cp}', chunk)
        chunk = re.sub(r'cp\?.startsWith', r'(landingPhoto || cp)?.startsWith', chunk)
        chunk = re.sub(r'\{cp \? \(', r'{(landingPhoto || cp) ? (', chunk)
        
        content = content[:chunk_start] + chunk + content[idx_buka:]
        
    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Patched: {filename}")

