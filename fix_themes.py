import os, re

d = 'src/components/themes'
files = [f for f in os.listdir(d) if f.endswith('.jsx')]

for f in files:
    with open(os.path.join(d, f)) as file:
        content = file.read()
        
    # Find root min-h-screen bg and text colors exactly
    root_match = re.search(r'min-h-screen[^>]*bg-\[#([a-fA-F0-9]+)\][^>]*text-\[#([a-fA-F0-9]+)\]', content)
    bg_hex, txt_hex = None, None
    if root_match:
        bg_hex, txt_hex = root_match.group(1).lower(), root_match.group(2).lower()
    else:
        # Fallback to first bg and first text found
        bm = re.search(r'bg-\[#([a-fA-F0-9]+)\]', content)
        tm = re.search(r'text-\[#([a-fA-F0-9]+)\]', content)
        if bm: bg_hex = bm.group(1).lower()
        if tm: txt_hex = tm.group(1).lower()
        
    # Find accent (most common border or text that isn't bg or txt)
    borders = re.findall(r'border-\[#([a-fA-F0-9]+)\]', content)
    bgs2 = re.findall(r'bg-\[#([a-fA-F0-9]+)\]', content)
    txts2 = re.findall(r'text-\[#([a-fA-F0-9]+)\]', content)
    
    candidates = [c.lower() for c in (borders + bgs2 + txts2) if c.lower() not in (bg_hex, txt_hex, 'ffffff', '000000', '1a1a1a', '111111', 'f3f4f6', 'e5e7eb', 'd1d5db', '9ca3af', '6b7280', '4b5563', '374151', '1f2937')]
    import collections
    acc_hex = collections.Counter(candidates).most_common(1)[0][0] if candidates else None
    
    new_content = content
    if bg_hex:
        # Replace strictly where it is used in a Tailwind class
        new_content = re.sub(r'bg-\[#(' + bg_hex + r')\]', r'bg-[var(--theme-bg,#\1)]', new_content, flags=re.IGNORECASE)
    if txt_hex:
        new_content = re.sub(r'text-\[#(' + txt_hex + r')\]', r'text-[var(--theme-text,#\1)]', new_content, flags=re.IGNORECASE)
    if acc_hex:
        new_content = re.sub(r'bg-\[#(' + acc_hex + r')\]', r'bg-[var(--theme-accent,#\1)]', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'text-\[#(' + acc_hex + r')\]', r'text-[var(--theme-accent,#\1)]', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'border-\[#(' + acc_hex + r')\]', r'border-[var(--theme-accent,#\1)]', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'fill-\[#(' + acc_hex + r')\]', r'fill-[var(--theme-accent,#\1)]', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'ring-\[#(' + acc_hex + r')\]', r'ring-[var(--theme-accent,#\1)]', new_content, flags=re.IGNORECASE)

    if new_content != content:
        with open(os.path.join(d, f), 'w') as file:
            file.write(new_content)
        print(f"Refactored {f} (bg:{bg_hex} txt:{txt_hex} acc:{acc_hex})")

