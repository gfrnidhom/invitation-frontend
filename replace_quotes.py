import os, re

d = 'src/components/themes/'

for f in os.listdir(d):
    if f.endswith('.jsx'):
        p = os.path.join(d, f)
        with open(p, 'r') as file:
            c = file.read()
        
        o = c
        c = re.sub(r'(invitation\?\.)(?:description|opening_text)(\s*\|\|\s*([\'"])[^\'"]*Dan di antara[^\'"]*\3)', r'\1quotes\2', c)
        
        def replace_qs(m):
            text = m.group(1).strip()
            # If the text has outer quotes or curly braces, keep them safe.
            # Usually it's like >- QS. Ar-Rum : 21 -<
            return '>{"`"} ' + '{' + f'invitation?.quotes_name || \'{text}\'' + '} <'
            
        # Re-write the regex to just find the text node and replace it with {invitation?.quotes_name || '...'}
        c = re.sub(r'>([^<]*QS\.[^<]*)<', lambda m: f'>{{invitation?.quotes_name || \'{m.group(1).strip()}\'}}<', c)

        if c != o:
            with open(p, 'w') as file:
                file.write(c)
            print(f'Updated {f}')

print("Done")
