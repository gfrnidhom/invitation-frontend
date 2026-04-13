import os
import re

themedir = './src/components/themes/'

patched_count = 0

injection = """(() => {
        if (!invitation?.event_date) return new Date();
        const dateStr = invitation.event_date.split('T')[0].split(' ')[0];
        let timeStr = '08:00';
        if (invitation.event_time) {
            match = invitation.event_time.replace(/\\./g, ':').match(/(\\d{1,2}:\\d{2})/);
            if (match) {
                timeStr = match[0];
                if (timeStr.length === 4) timeStr = '0' + timeStr;
            }
        }
        const d = new Date(`${dateStr}T${timeStr}:00`);
        return isNaN(d) ? new Date(dateStr) : d;
    })()"""

for filename in os.listdir(themedir):
    if not filename.endswith('.jsx'): continue
    filepath = os.path.join(themedir, filename)
    with open(filepath, 'r') as f: content = f.read()
    
    # We only care if the file has setInterval i.e. custom countdown handling
    if "setInterval" not in content and "CountdownTimer" not in content:
        # Actually some modular themes use CountdownTimer Component which is ALREADY fixed!
        pass
        
    if "setInterval" in content and "CountdownTimer" not in content:
        # It's a standalone countdown
        pass

    # Actually, Let's just blindly replace `new Date(invitation.event_date) : new Date();` that are assigned to `eventDate` or `ed`.
    original_line = "invitation?.event_date ? new Date(invitation.event_date) : new Date()"
    
    if original_line in content:
        content = content.replace(original_line, injection)
        with open(filepath, 'w') as f: f.write(content)
        patched_count += 1
        print(f"Patched {filename}")

print(f"Done patching {patched_count} files")
