import os

themedir = './src/components/themes/'

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx'): continue
    filepath = os.path.join(themedir, filename)
    with open(filepath, 'r') as f: content = f.read()
    
    if "match = invitation.event_time.replace(" in content:
        content = content.replace(
            "match = invitation.event_time.replace(",
            "let match = invitation.event_time.replace("
        )
        with open(filepath, 'w') as f: f.write(content)
        print(f"Fixed {filename}")

