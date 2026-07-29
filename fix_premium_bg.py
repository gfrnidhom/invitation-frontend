import re

with open('src/components/themes/MotionGardenPremium.jsx', 'r') as f:
    content = f.read()

# Revert my previous mistake where I mapped dark backgrounds to theme-accent.
# They should be mapped to theme-bg so that buttons (accent) remain visible.
content = re.sub(r'bg-\[var\(--theme-accent,\#9e7a4b\)\]', 'bg-[var(--theme-bg,#9e7a4b)]', content)
content = re.sub(r'bg-\[var\(--theme-accent,\#42382e\)\]', 'bg-[var(--theme-bg,#42382e)]', content)
content = re.sub(r'bg-\[var\(--theme-accent,\#2a2a2a\)\]', 'bg-[var(--theme-bg,#2a2a2a)]', content)
content = re.sub(r'bg-\[var\(--theme-accent,\#1a1a1a\)\]', 'bg-[var(--theme-bg,#1a1a1a)]', content)

with open('src/components/themes/MotionGardenPremium.jsx', 'w') as f:
    f.write(content)
