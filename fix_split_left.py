import re
import os

files = [
    'EarthyNature.jsx',
    'GardenParallax.jsx',
    'MinimalistBlack.jsx',
    'MinimalistNavy.jsx',
    'MotionGardenPremium.jsx',
    'CinematicVow.jsx'
]

themedir = './src/components/themes/'

for f in files:
    filepath = os.path.join(themedir, f)
    with open(filepath, 'r') as file:
        content = file.read()
    
    # We want to find the left pane block. Usually marked by `className="... split-left ..."`
    # However, replacing it directly is tricky. Let's find the start of the left pane, and the start of the right pane,
    # and replace `landingPhoto || ` and `(landingPhoto || coverPhoto)` inside that slice.
    
    # Finding the left pane marker
    left_markers = ['split-left', 'g1-split-left', 'gp-split-left', 'mn-split-left', 'sl-cv']
    idx_left = -1
    for m in left_markers:
        idx_left = content.find(m)
        if idx_left != -1: break
        
    right_markers = ['split-right', 'g1-split-right', 'gp-split-right', 'mn-split-right', 'sr-cv']
    idx_right = -1
    for m in right_markers:
        idx_right = content.find(m)
        if idx_right != -1: break
        
    if idx_left != -1 and idx_right != -1:
        # Revert inside the left pane ONLY
        left_chunk = content[idx_left:idx_right]
        left_chunk = left_chunk.replace('landingPhoto || coverPhoto', 'coverPhoto')
        left_chunk = left_chunk.replace('(landingPhoto || coverPhoto)', 'coverPhoto')
        
        content = content[:idx_left] + left_chunk + content[idx_right:]
        with open(filepath, 'w') as file:
            file.write(content)
        print(f"Fixed {f}")
        
    else:
        print(f"Could not find markers for {f}")

