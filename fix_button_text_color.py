import os
import re

themes_dir = 'src/components/themes'

# Regex to match a className attribute string
class_name_regex = re.compile(r'className=(["\']|`)(.*?)\1')

def replace_text_color(match):
    quote = match.group(1)
    class_str = match.group(2)
    
    # Check if this class string contains an accent background
    if 'bg-[var(--theme-accent' in class_str or 'bg-green-accent' in class_str:
        # Find the text color
        # 1. text-white -> text-[var(--theme-button-text,#ffffff)]
        if 'text-white' in class_str:
            class_str = re.sub(r'\btext-white\b', 'text-[var(--theme-button-text,#ffffff)]', class_str)
        # 2. text-[#...] -> text-[var(--theme-button-text,#...)]
        elif re.search(r'\btext-\[#[a-fA-F0-9]+\]', class_str):
            def repl_hex(m):
                original = m.group(0) # e.g. text-[#2a2a2a]
                hex_val = re.search(r'#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})', original).group(0)
                return f'text-[var(--theme-button-text,{hex_val})]'
            class_str = re.sub(r'\btext-\[#[a-fA-F0-9]+\]', repl_hex, class_str)
            
    return f'className={quote}{class_str}{quote}'

files_to_process = []
for root, _, files in os.walk(themes_dir):
    for file in files:
        if file.endswith('.jsx'):
            files_to_process.append(os.path.join(root, file))

for file_path in files_to_process:
    with open(file_path, 'r') as f:
        content = f.read()
        
    new_content = class_name_regex.sub(replace_text_color, content)
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

