import os, re, json
d = 'src/components/themes'
files = [f for f in os.listdir(d) if f.endswith('.jsx')]
out = {}
for f in files:
    with open(os.path.join(d, f)) as file:
        content = file.read()
    bgs = re.findall(r'bg-\[#([a-fA-F0-9]{6})\]', content)
    txts = re.findall(r'text-\[#([a-fA-F0-9]{6})\]', content)
    borders = re.findall(r'border-\[#([a-fA-F0-9]{6})\]', content)
    import collections
    def top(arr):
        c = collections.Counter([x.lower() for x in arr])
        return [k for k,v in c.most_common(2)]
    out[f] = {'bg': top(bgs), 'txt': top(txts), 'border': top(borders)}
print(json.dumps(out, indent=2))
