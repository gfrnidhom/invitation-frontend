import os
import re

themedir = './src/components/themes/'

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Fix getPhoto
    # Usually it's: img src={getPhoto(invitation.footer_image)}
    # or src={getPhoto(invitation.footer_image)}
    # We replace getPhoto(...) with a robust inline function.
    inline_get_photo = "(((img) => { let p = Array.isArray(img) ? img[0] : img; p = typeof p === 'object' && p !== null ? p.photo || p.url : p; if (typeof p !== 'string') return null; return (p.startsWith('http') || p.startsWith('/')) ? p : `${process.env.NEXT_PUBLIC_STORAGE_URL || 'https://digitvitation.my.id/storage'}/${p}`; })"
    
    content = content.replace("getPhoto(", inline_get_photo + "(")

    # Fix poppins.className
    content = content.replace("${poppins.className}", "font-sans")

    # Fix cormorant.className
    content = content.replace("${cormorant.className}", "font-serif")

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx'):
        continue
    filepath = os.path.join(themedir, filename)
    fix_file(filepath)

print("All themes fixed.")
