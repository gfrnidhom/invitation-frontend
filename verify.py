import os
import re

themedir = './src/components/themes/'

issues = []

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx'):
        continue
    filepath = os.path.join(themedir, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    uses_cover_overlay = "CoverOverlay" in content
    if uses_cover_overlay:
        # All modular ones use CoverOverlay which we already patched
        continue

    # For standalone themes, they must have `landingPhoto` logic explicitly injected.
    if 'landingPhoto' not in content and 'landing_photo' not in content:
        issues.append(f"{filename}: Missing landing_photo logic completely")
        
print("Issues found:", issues if issues else "None")
