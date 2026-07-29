import re

with open('src/components/themes/MotionGardenPremium.jsx', 'r') as f:
    content = f.read()

# CSS block
content = re.sub(r'color: \#A57B52;', 'color: var(--theme-accent, #A57B52);', content)
content = re.sub(r'background-color: \#A57B52; border-color: \#A57B52;', 'background-color: var(--theme-accent, #A57B52); border-color: var(--theme-accent, #A57B52);', content)
content = re.sub(r'border-color: \#A57B52;', 'border-color: var(--theme-accent, #A57B52);', content)

# Instagram and dots
content = re.sub(r'bg-\[\#bd9a5f\]', 'bg-[var(--theme-accent,#bd9a5f)]', content)

# Hovers
content = re.sub(r'hover:bg-\[\#a68f68\]', 'hover:opacity-80', content)
content = re.sub(r'hover:bg-\[\#a88647\]', 'hover:opacity-80', content)
content = re.sub(r'hover:bg-\[\#465b4b\]', 'hover:opacity-80', content)

# Minor backgrounds
content = re.sub(r'bg-\[\#f9f6f0\]', 'bg-[var(--theme-bg,#f9f6f0)]', content)
content = re.sub(r'bg-\[\#1a1411\]', 'bg-[var(--theme-text,#1a1411)]', content)
content = re.sub(r'bg-\[\#2a2119\]', 'bg-[var(--theme-text,#2a2119)]', content)

with open('src/components/themes/MotionGardenPremium.jsx', 'w') as f:
    f.write(content)
