import os
import re

THEMES_DIR = "/Users/mghofarunnindhom/Documents/FullstackDeveloper/2026/2026_Invitation Online/frontend-user/src/components/themes"

def update_footer(content):
    # Find the footer block
    match = re.search(r'(?s)({\/\*\s*──?\s*FOOTER(.*?)──?\s*\*\/}\s*)?<footer.*?</footer>', content, re.IGNORECASE)
    if not match:
        match = re.search(r'(?s)({\/\*\s*Footer\s*\*\/}\s*)?<footer.*?</footer>', content, re.IGNORECASE)
    if not match: 
        print("Could not find footer block")
        return content

    footer_content = match.group(0)
    
    # Extract background color
    bg_match = re.search(r'(bg-\[#[a-fA-F0-9]+\]|bg-\w+-\d+|bg-black|bg-white|bg-slate-\d+|bg-neutral-\d+|bg-zinc-\d+)', footer_content)
    bg_color = bg_match.group(0) if bg_match else 'bg-[#1a1a1a]'
    
    text_match = re.search(r'(text-\[#[a-fA-F0-9]+\]|text-\w+-\d+|text-black|text-white)', footer_content)
    text_color = text_match.group(0) if text_match else 'text-white'
    
    # Fonts
    cormorant = "cormorant.className" if "cormorant.className" in content else ("playfair.className" if "playfair.className" in content else "cormorant.className")
    great_vibes = "greatVibes.className" if "greatVibes.className" in content else ("greatVibes.className" if "greatVibes" in content else "cormorant.className")
    
    body_font = "poppins.className" if "poppins.className" in content else ("dmSans.className" if "dmSans.className" in content else "''")
    if body_font == "''":
        # Check if spaceGrotesk or something else
        if "montserrat.className" in content: body_font = "montserrat.className"
        elif "spaceGrotesk.className" in content: body_font = "spaceGrotesk.className"
        else: body_font = "poppins.className" # fallback
        
    # Determine mode
    is_light_text = ('text-white' in text_color or 'text-[#f' in text_color.lower() or 'text-[#e' in text_color.lower() or 'text-slate-100' in text_color)
    
    if is_light_text:
        accent_color = 'white/50'
        link_color = 'white/80'
        hover_color = 'white'
        grad_col = bg_color.replace('bg-', '') if '[' in bg_color else (bg_color.split('-')[1] if '-' in bg_color else 'black')
        if grad_col in ['black', 'bg-black']:
            gradient = 'from-black via-black/60 to-transparent'
        elif grad_col in ['white', 'bg-white']:
            gradient = 'from-black via-black/60 to-transparent'
        else:
            gradient = f'from-{grad_col} via-{grad_col}/60 to-transparent'
        opacity = 'opacity-40'
    else:
        accent_color = 'black/50'
        link_color = 'black/80'
        hover_color = 'black'
        grad_col = bg_color.replace('bg-', '') if '[' in bg_color else (bg_color.split('-')[1] if '-' in bg_color else 'white')
        if grad_col in ['white', 'bg-white']:
            gradient = 'from-white via-white/60 to-transparent'
        elif grad_col in ['black', 'bg-black']:
            gradient = 'from-white via-white/60 to-transparent'
        else:
            gradient = f'from-{grad_col} via-{grad_col}/60 to-transparent'
        opacity = 'opacity-40'

    # Fallback to avoid invalid tailwind classes
    if 'via-[#0a0a0f]' in gradient: gradient = 'from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]'

    new_footer = """{/* ── FOOTER ── */}
                <footer className="___BG___ ___TEXT___ pt-64 pb-24 px-8 text-center relative overflow-hidden">
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 z-0">
                        {invitation?.footer_image ? (
                            <img src={getPhoto(invitation.footer_image)} alt="Footer BG" className="w-full h-full object-cover ___OPACITY___ mix-blend-luminosity" />
                        ) : typeof landingPhoto !== 'undefined' && landingPhoto ? (
                            <img src={landingPhoto} alt="Footer BG" className="w-full h-full object-cover ___OPACITY___ mix-blend-luminosity" />
                        ) : typeof coverPhoto !== 'undefined' && coverPhoto ? (
                            <img src={coverPhoto} alt="Footer BG" className="w-full h-full object-cover ___OPACITY___ mix-blend-luminosity" />
                        ) : (
                            <div className="w-full h-full ___BG___ ___OPACITY___"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t ___GRADIENT___" />
                    </div>
                    
                    {/* Content Layer */}
                    <div className="relative z-10 pt-10">
                        <p className={`${___BODY___} text-[10px] text-___ACCENT___ tracking-[0.3em] uppercase font-bold mb-4`}>
                            Thank you for being part of our special day
                        </p>
                        <h2 className={`${___VIBES___} text-5xl mb-4 ___TEXT___ drop-shadow-sm`}>
                            {invitation?.groom_name?.split(' ')[0]} <span className="text-___ACCENT___ font-light mx-2">&</span> {invitation?.bride_name?.split(' ')[0]}
                        </h2>
                        
                        {/* Branding */}
                        <div className="border-t border-___TEXT___/10 pt-8 mt-12">
                            <p className="text-[9px] text-___TEXT___/40 tracking-[0.2em] uppercase mb-2">Digital Invitation by</p>
                            <a href="https://digitvitation.my.id" target="_blank" rel="noreferrer" className="inline-block text-___LINK___ hover:text-___HOVER___ transition-colors">
                                <span className={`${___COR___} text-lg font-bold tracking-wider uppercase`}>Digivitation</span>
                            </a>
                            <p className="text-[8px] text-___TEXT___/30 mt-2 tracking-wider">© {new Date().getFullYear()} Digivitation. All rights reserved.</p>
                        </div>
                    </div>
                </footer>"""

    new_footer = new_footer.replace('___BG___', bg_color)
    new_footer = new_footer.replace('___TEXT___', text_color)
    new_footer = new_footer.replace('___OPACITY___', opacity)
    new_footer = new_footer.replace('___GRADIENT___', gradient)
    new_footer = new_footer.replace('___BODY___', body_font)
    new_footer = new_footer.replace('___VIBES___', great_vibes)
    new_footer = new_footer.replace('___ACCENT___', accent_color.split('/')[0] + '/' + accent_color.split('/')[1])
    new_footer = new_footer.replace('___LINK___', link_color.split('/')[0] + '/' + link_color.split('/')[1])
    new_footer = new_footer.replace('___HOVER___', hover_color)
    new_footer = new_footer.replace('___COR___', cormorant)
    new_footer = new_footer.replace("border-text-white/", "border-white/").replace("border-text-black/", "border-black/")
    new_footer = new_footer.replace("text-text-white/", "text-white/").replace("text-text-black/", "text-black/")
    
    # ensure no text-text-white bugs
    new_footer = new_footer.replace("text-text-", "text-")
    new_footer = new_footer.replace("border-text-", "border-")


    return content.replace(footer_content, new_footer)

if __name__ == "__main__":
    count = 0
    for filename in os.listdir(THEMES_DIR):
        if filename.endswith(".jsx"):
            filepath = os.path.join(THEMES_DIR, filename)
            with open(filepath, "r") as f:
                content = f.read()
            
            new_content = update_footer(content)
            
            if new_content != content:
                with open(filepath, "w") as f:
                    f.write(new_content)
                print(f"Updated {filename}")
                count += 1
            else:
                print(f"Skipped {filename} - no changes")
    print(f"Successfully updated {count} files.")
