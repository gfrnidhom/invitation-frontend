import os
import re

themedir = './src/components/themes/'

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx') or filename == 'SereneGarden.jsx':
        continue
    filepath = os.path.join(themedir, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # If it already has landing_photo, skip
    if 'invitation?.landing_photo' in content or 'invitation.landing_photo' in content:
        continue

    # We generally want to provide a robust landingPhoto fallback.
    # Let's inject a helper function `getLandingPhoto()` at the start of the component body.
    # We can find `export default function ThemeName({ payload, audioController }) {`
    
    match = re.search(r'export default function \w+\([^)]+\) {', content)
    if not match:
        continue
    
    # Let's see if there's a Buka Undangan button context we need to fix
    # This script is just a trial run to see what themes need manual fixing
    
    print(f"File: {filename} needs patching.")
