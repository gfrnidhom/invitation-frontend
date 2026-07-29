import os
import re

themes_dir = 'src/components/themes'

def replace_text_color(class_str):
    if 'bg-' in class_str and ('py-' in class_str or 'px-' in class_str or 'p-' in class_str):
        class_str = re.sub(r'\btext-white\b', 'text-[var(--theme-button-text,#ffffff)]', class_str)
        class_str = re.sub(r'\btext-black\b', 'text-[var(--theme-button-text,#000000)]', class_str)
        def repl_hex(m):
            original = m.group(0)
            if 'var(--theme-button-text' in original:
                return original
            hex_val = re.search(r'#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})', original).group(0)
            return f'text-[var(--theme-button-text,{hex_val})]'
        class_str = re.sub(r'\btext-\[#[a-fA-F0-9]+\]', repl_hex, class_str)
        
    return class_str

def process_dir(directory):
    files_to_process = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                files_to_process.append(os.path.join(root, file))

    for file_path in files_to_process:
        with open(file_path, 'r') as f:
            content = f.read()
            
        new_content = re.sub(r'className=(["\'`])(.*?)\1', lambda m: f'className={m.group(1)}{replace_text_color(m.group(2))}{m.group(1)}', content)
        
        if new_content != content:
            with open(file_path, 'w') as f:
                f.write(new_content)
            print(f"Updated {file_path}")

process_dir(themes_dir)

