import re

with open('src/components/themes/MotionGardenPremium.jsx', 'r') as f:
    content = f.read()

# Make all main block backgrounds use theme-accent or theme-bg appropriately
content = re.sub(r'bg-\[\#9e7a4b\]', 'bg-[var(--theme-accent,#9e7a4b)]', content)
content = re.sub(r'bg-\[\#42382e\]', 'bg-[var(--theme-accent,#42382e)]', content)
content = re.sub(r'bg-\[\#2a2a2a\]', 'bg-[var(--theme-accent,#2a2a2a)]', content)
content = re.sub(r'bg-\[\#bda57b\]', 'bg-[var(--theme-accent,#bda57b)]', content)
content = re.sub(r'text-\[\#c5a059\]', 'text-[var(--theme-text,#c5a059)]', content)
content = re.sub(r'text-\[\#1a1a1a\]', 'text-[var(--theme-text,#1a1a1a)]', content)
content = re.sub(r'bg-\[\#1a1a1a\]', 'bg-[var(--theme-accent,#1a1a1a)]', content)

# Write back
with open('src/components/themes/MotionGardenPremium.jsx', 'w') as f:
    f.write(content)
