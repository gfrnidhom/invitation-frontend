import os
import re

themes_dir = 'src/components/themes'

def replace_text_color_in_class(class_str):
    if 'bg-[var(--theme-accent' in class_str or 'bg-green-accent' in class_str or 'bg-pg-accent' in class_str or 'bg-[#' in class_str or 'bg-gray-900' in class_str:
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

def process_tag(tag_str):
    def repl_class(m):
        prefix = m.group(1)
        quote = m.group(2)
        class_str = m.group(3)
        suffix = m.group(4)
        return f'{prefix}{quote}{replace_text_color_in_class(class_str)}{quote}{suffix}'
    
    return re.sub(r'(className=\{?)(["\'`])(.*?)\2(\}?)', repl_class, tag_str, flags=re.DOTALL)

def process_dir(directory):
    files_to_process = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                files_to_process.append(os.path.join(root, file))

    for file_path in files_to_process:
        with open(file_path, 'r') as f:
            content = f.read()
            
        new_content = re.sub(r'<MapLocationButton\b.*?>', lambda m: process_tag(m.group(0)), content, flags=re.DOTALL)
        
        if new_content != content:
            with open(file_path, 'w') as f:
                f.write(new_content)
            print(f"Updated {file_path}")

process_dir(themes_dir)
