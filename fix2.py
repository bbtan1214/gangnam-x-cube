import glob
import re

files = glob.glob('*.html')

for f_name in files:
    if f_name == 'index.html':
        continue
    
    with open(f_name, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Header logo
    content = content.replace('<h1 class="logo-title">GANGNAM<br>X CUBE</h1>', '<img src="logo_square.png" alt="GANGNAM X CUBE" style="height: 40px; margin-top: 5px;">')
    
    # 2. Footer logo 1
    content = content.replace('<h1 style="font-size: 1.5rem; margin-bottom: 20px;">GANGNAM<br>X CUBE</h1>', '<img src="logo_square.png" alt="GANGNAM X CUBE" style="height: 60px; margin-bottom: 20px;">')

    # 3. Footer logo 2 (notice.html)
    content = content.replace('<h1 style="font-size: 1.4rem; line-height: 1.1; margin-bottom: 25px;">GANGNAM<br>X CUBE</h1>', '<img src="logo_square.png" alt="GANGNAM X CUBE" style="height: 60px; margin-bottom: 25px;">')

    with open(f_name, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"{f_name} updated.")
