import os
import glob

themes_dir = './src/components/themes/'
files = glob.glob(themes_dir + '/*.jsx')

old_code = """    const eventDate = (() => {
        if (!invitation?.event_date) return new Date();
        const dateStr = invitation.event_date.split('T')[0].split(' ')[0];
        let timeStr = '08:00';
        if (invitation.event_time) {
            let match = invitation.event_time.replace(/\./g, ':').match(/(\d{1,2}:\d{2})/);
            if (match) {
                timeStr = match[0];
                if (timeStr.length === 4) timeStr = '0' + timeStr;
            }
        }
        const d = new Date(`${dateStr}T${timeStr}:00`);
        return isNaN(d) ? new Date(dateStr) : d;
    })();"""

new_code = """    const eventDate = (() => {
        if (!invitation?.event_date) return new Date();
        
        // Parse the UTC date safely into local time first to avoid timezone subtraction bugs
        let baseDate = new Date(invitation.event_date.replace(' ', 'T'));
        if (isNaN(baseDate)) {
            // Fallback for Safari if strictly YYYY-MM-DD
            baseDate = new Date(invitation.event_date.split('T')[0].split(' ')[0] + 'T00:00:00');
        }
        
        const y = baseDate.getFullYear();
        const m = String(baseDate.getMonth() + 1).padStart(2, '0');
        const day = String(baseDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        
        let timeStr = '08:00';
        if (invitation.event_time) {
            let match = invitation.event_time.replace(/\\./g, ':').match(/(\\d{1,2}:\\d{2})/);
            if (match) {
                timeStr = match[0];
                if (timeStr.length === 4) timeStr = '0' + timeStr;
            }
        }
        
        const d = new Date(`${dateStr}T${timeStr}:00`);
        return isNaN(d) ? baseDate : d;
    })();"""

for f in files:
    with open(f, 'r') as file:
        content = file.read()
        
    if old_code in content:
        content = content.replace(old_code, new_code)
        with open(f, 'w') as file:
            file.write(content)
        print(f"Fixed {f}")
    else:
        print(f"Skipped {f} (Code not found)")

