import os

themes_dir = "."

def balance_parentheses(s, start_index):
    count = 0
    started = False
    for i in range(start_index, len(s)):
        if s[i] == '(':
            count += 1
            started = True
        elif s[i] == ')':
            count -= 1
        
        if started and count == 0:
            return i
    return -1

def process_files():
    for f in os.listdir(themes_dir):
        if not (f.endswith("Theme.jsx") or f.endswith(".jsx")):
            continue
        if f == "MotionGardenPremium.jsx":
            continue
        
        filepath = os.path.join(themes_dir, f)
        with open(filepath, 'r', encoding='utf-8') as f_in:
            content = f_in.read()
            
        if 'GiftAccounts from' in content or 'GiftAtmCard from' in content:
            print(f"Skipping {f} ... already modularized.")
            continue
            
        # Inject import
        if "import GiftAtmCard" not in content:
            content = content.replace("import React", "import GiftAtmCard from './partials/GiftAtmCard';\nimport React", 1)
            
        search_terms = ["invitation.gift_accounts.map(", "invitation?.gift_accounts?.map("]
        term_idx = -1
        search_str = ""
        for term in search_terms:
            term_idx = content.find(term)
            if term_idx != -1:
                search_str = term
                break
                
        if term_idx != -1:
            map_start = term_idx + len(search_str) - 1
            map_end = balance_parentheses(content, map_start)
            
            if map_end != -1:
                block_to_replace = content[term_idx:map_end + 1]
                new_block = """invitation.gift_accounts.map((acc, i) => (
                                <GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} />
                            ))"""
                
                content = content.replace(block_to_replace, new_block)
                with open(filepath, 'w', encoding='utf-8') as f_out:
                    f_out.write(content)
                print(f"Updated {f}")
            else:
                print(f"Could NOT balance parens in {f}")
        else:
            print(f"Skipping {f} ... map block not found or different.")

process_files()
