import re

files = [
    'src/components/themes/MotionIslamic.jsx',
    'src/components/themes/PavilionGarden.jsx',
    'src/components/themes/SereneGarden.jsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Generic replace for Instagram buttons
    content = re.sub(r'bg-\[\#86968B\]', 'bg-[var(--theme-accent,#86968B)]', content)
    content = re.sub(r'hover:bg-\[\#6b7d70\]', 'hover:opacity-80', content)
    
    content = re.sub(r'bg-\[\#bd9a5f\]', 'bg-[var(--theme-accent,#bd9a5f)]', content)
    content = re.sub(r'hover:bg-\[\#a88647\]', 'hover:opacity-80', content)

    # Specific CSS block fixes if they exist
    content = re.sub(r'color: \#A57B52;', 'color: var(--theme-accent, #A57B52);', content)
    content = re.sub(r'background-color: \#A57B52; border-color: \#A57B52;', 'background-color: var(--theme-accent, #A57B52); border-color: var(--theme-accent, #A57B52);', content)
    content = re.sub(r'border-color: \#A57B52;', 'border-color: var(--theme-accent, #A57B52);', content)

    content = re.sub(r'color: \#86968B;', 'color: var(--theme-accent, #86968B);', content)
    content = re.sub(r'background-color: \#86968B; border-color: \#86968B;', 'background-color: var(--theme-accent, #86968B); border-color: var(--theme-accent, #86968B);', content)
    content = re.sub(r'border-color: \#86968B;', 'border-color: var(--theme-accent, #86968B);', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
