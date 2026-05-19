import glob

mobile_nav_html = '''
    <!-- Mobile Nav -->
    <div id="mobile-nav" class="mobile-nav-overlay">
        <div class="close-btn" id="btn-close-mobile-nav" style="right: 30px; font-size: 2rem; cursor: pointer;">&times;</div>
        <ul>
            <li><a href="index.html">HOME</a></li>
            <li><a href="index.html#section-halls">공간 안내</a></li>
            <li><a href="3d_view.html">3D 공간 뷰어</a></li>
            <li><a href="rental.html">대관 신청</a></li>
            <li><a href="contact.html">CONTACT</a></li>
            <li><a href="notice.html">공지사항</a></li>
        </ul>
    </div>
</body>'''

files = glob.glob('*.html')

for f_name in files:
    with open(f_name, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'id="mobile-nav"' not in content:
        content = content.replace('</body>', mobile_nav_html)
    
    if f_name == 'index.html':
        content = content.replace('<h1 class="logo-title">GANGNAM<br>X CUBE</h1>', '<img src="logo_square.png" alt="GANGNAM X CUBE" style="height: 40px; margin-top: 5px;">')
        content = content.replace('<h1 style="font-size: 1.5rem; margin-bottom: 20px;">GANGNAM<br>X CUBE</h1>', '<img src="logo_square.png" alt="GANGNAM X CUBE" style="height: 60px; margin-bottom: 20px;">')

    with open(f_name, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"{f_name} fixed.")
