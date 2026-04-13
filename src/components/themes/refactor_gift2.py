import os

themes_dir = "."

def process_files():
    for f in os.listdir(themes_dir):
        if not (f.endswith("Theme.jsx") or f.endswith(".jsx")):
            continue
            
        filepath = os.path.join(themes_dir, f)
        theme_name = f.replace(".jsx", "").replace("Theme", "")
        
        with open(filepath, 'r', encoding='utf-8') as f_in:
            content = f_in.read()
            
        changed = False
            
        # 1. Themes using inline GiftAtmCard mapping
        old_atm = """<GiftAtmCard key={acc.id || i} acc={acc} delayData={`${(i % 3) + 1}`} />"""
        new_atm = f"""<GiftAtmCard key={{acc.id || i}} acc={{acc}} delayData={{`${{(i % 3) + 1}}`}} variant="{theme_name}" />"""
        
        if old_atm in content:
            content = content.replace(old_atm, new_atm)
            changed = True
            
        # 2. Themes using the GiftAccounts partial
        # e.g., <GiftAccounts invitation={invitation} sectionBg="bg-white" ...
        # Let's dynamically inject variant if not present
        if "<GiftAccounts " in content and 'variant="' not in content:
            content = content.replace("<GiftAccounts ", f'<GiftAccounts variant="{theme_name}" ')
            changed = True
            
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f_out:
                f_out.write(content)
            print(f"Injected variant='{theme_name}' into {f}")

process_files()
