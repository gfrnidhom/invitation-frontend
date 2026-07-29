import os
import re

themes_dir = 'src/components/themes'

def process_dir(directory):
    files_to_process = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                files_to_process.append(os.path.join(root, file))

    for file_path in files_to_process:
        with open(file_path, 'r') as f:
            content = f.read()
            
        # Replace text-[var(--theme-accent,#HEX)] with text-[var(--theme-text,#HEX)]
        new_content = re.sub(
            r'text-\[var\(--theme-accent,([^\]]+)\)\]', 
            r'text-[var(--theme-text,\1)]', 
            content
        )
        
        # Also replace CSS blocks that assign EXACTLY color: var(--theme-accent)
        # We must NOT match background-color or border-color!
        new_content = re.sub(
            r'(?<![-a-z])color:\s*var\(--theme-accent,\s*([^)]+)\);',
            r'color: var(--theme-text, \1);',
            new_content
        )
        
        if new_content != content:
            with open(file_path, 'w') as f:
                f.write(new_content)
            print(f"Updated {file_path}")

process_dir(themes_dir)
