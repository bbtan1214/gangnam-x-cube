import json
import os
import glob

def recover():
    target_files = [
        'index.html', '3d_view.html', 'rental.html', 'notice.html', 
        'contact.html', 'complete.html', 'inquiry_form.html',
        'admin/login.html', 'admin/index.html'
    ]
    
    brain_dir = r'C:\Users\leech\.gemini\antigravity\brain'
    logs = glob.glob(os.path.join(brain_dir, '*', '.system_generated', 'logs', 'overview.txt'))
    
    # Sort logs by modification time (newest first)
    logs.sort(key=os.path.getmtime, reverse=True)
    
    recovered_count = 0
    for log_path in logs:
        print(f"Checking {log_path}")
        with open(log_path, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    # Look for write_to_file calls
                    for tc in data.get('tool_calls', []):
                        if tc['name'] == 'write_to_file':
                            args = tc['args']
                            target_path = args.get('TargetFile', '').strip('"').replace('\\\\', '/')
                            fname = target_path.split('/')[-1]
                            
                            if fname in target_files:
                                content = args.get('CodeContent', '')
                                if content and len(content) > 100: # Simple check for non-empty content
                                    dest_path = os.path.join(r'd:\Planning Korea\99. 코딩 개발\2026 대관 사이트 개발', fname)
                                    # If it's in admin subfolder
                                    if 'admin' in target_path.lower():
                                        dest_path = os.path.join(r'd:\Planning Korea\99. 코딩 개발\2026 대관 사이트 개발\admin', fname)
                                    
                                    if not os.path.exists(dest_path) or os.path.getsize(dest_path) == 0:
                                        with open(dest_path, 'w', encoding='utf-8') as out:
                                            # Content might have escaped newlines
                                            out.write(content.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\'))
                                        print(f"Recovered {fname} to {dest_path}")
                                        recovered_count += 1
                except Exception as e:
                    continue
                    
    print(f"Total recovered: {recovered_count}")

if __name__ == "__main__":
    recover()
