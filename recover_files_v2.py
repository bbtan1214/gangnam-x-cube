import json
import os
import glob
import re

def recover():
    target_files = [
        'rental.html', 'notice.html', 'contact.html', 'complete.html', 
        'inquiry_form.html', 'admin/login.html', 'admin/index.html'
    ]
    
    brain_dir = r'C:\Users\leech\.gemini\antigravity\brain'
    logs = glob.glob(os.path.join(brain_dir, '*', '.system_generated', 'logs', 'overview.txt'))
    logs.sort(key=os.path.getmtime, reverse=True)
    
    recovered_data = {f: None for f in target_files}
    
    for log_path in logs:
        print(f"Scanning {log_path}")
        with open(log_path, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    # Check for write_to_file
                    for tc in data.get('tool_calls', []):
                        if tc['name'] == 'write_to_file':
                            args = tc['args']
                            target_path = args.get('TargetFile', '').strip('"').replace('\\\\', '/')
                            fname = target_path.split('/')[-1]
                            if fname in target_files and recovered_data[fname] is None:
                                content = args.get('CodeContent', '').replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\').strip('"')
                                if len(content) > 200:
                                    recovered_data[fname] = content
                                    print(f"Found content for {fname} in write_to_file")

                    # Check for VIEW_FILE step
                    if data.get('type') == 'VIEW_FILE':
                        content = data.get('content', '')
                        match = re.search(r'File Path: `file:///.*?/(.*?)`.*?Showing lines 1 to \d+\n(.*?)$', content, re.DOTALL)
                        if match:
                            fname = match.group(1).split('/')[-1]
                            file_text = match.group(2)
                            if fname in target_files and recovered_data[fname] is None:
                                # Clean up line numbers if present (e.g., "1: <html>")
                                lines = file_text.split('\n')
                                cleaned_lines = []
                                for l in lines:
                                    m = re.match(r'^\d+: (.*)$', l)
                                    if m: cleaned_lines.append(m.group(1))
                                    else: cleaned_lines.append(l)
                                recovered_data[fname] = '\n'.join(cleaned_lines)
                                print(f"Found content for {fname} in VIEW_FILE")
                                
                except:
                    continue

    # Final write back
    base_dir = r'd:\Planning Korea\99. 코딩 개발\2026 대관 사이트 개발'
    for fname, content in recovered_data.items():
        if content:
            path = os.path.join(base_dir, fname)
            if 'admin' in fname:
                path = os.path.join(base_dir, 'admin', fname.split('/')[-1])
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            # Only write if file is empty or missing
            if not os.path.exists(path) or os.path.getsize(path) == 0:
                with open(path, 'w', encoding='utf-8') as out:
                    out.write(content)
                print(f"Successfully restored {fname}")
            else:
                print(f"Skipping {fname}, file already exists and is not empty.")

if __name__ == "__main__":
    recover()
