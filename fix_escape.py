import os, re
d = 'src/components/themes/'

for f in os.listdir(d):
    if f.endswith('.jsx'):
        p = os.path.join(d, f)
        with open(p, 'r') as file:
            c = file.read()
            
        o = c
        c = c.replace("\\'", "'")

        if c != o:
            with open(p, 'w') as file:
                file.write(c)
            print(f'Updated {f}')
