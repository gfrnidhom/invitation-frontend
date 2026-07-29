import os

themedir = './src/components/themes/'

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Fix the extra opening parenthesis that caused a SyntaxError.
    # We replace "(((img)" with "((img)"
    content = content.replace("(((img)", "((img)")

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx'):
        continue
    filepath = os.path.join(themedir, filename)
    fix_file(filepath)

print("All themes syntax fixed.")
