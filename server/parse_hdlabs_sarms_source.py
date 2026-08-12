from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urljoin

from bs4 import BeautifulSoup

SOURCE = Path('/home/ubuntu/browser_html/take_app_cm8rp768q0002ky03yk17ea2i_1786570555451.html')
OUTPUT = Path('/home/ubuntu/gorilla-gear-nutrition/hdlabs-sarms-source.json')
BASE = 'https://take.app'

html = SOURCE.read_text(encoding='utf-8')
soup = BeautifulSoup(html, 'html.parser')
items = []
seen = set()

for anchor in soup.find_all('a', href=True):
    image = anchor.find('img')
    if image is None:
        continue
    alt = (image.get('alt') or '').strip()
    src = (image.get('src') or image.get('data-src') or '').strip()
    href = urljoin(BASE, anchor.get('href', '').strip())
    if not alt or not src or not href or alt.lower() in {'hd labs international', 'sarms'}:
        continue
    key = (alt, src, href)
    if key in seen:
        continue
    seen.add(key)
    items.append({'source_name': alt, 'image_url': src, 'product_url': href, 'card_text': ' '.join(anchor.get_text(' ', strip=True).split())})

result = {'source_url': 'https://take.app/hdlabsinternational/c/cm8rp768q0002ky03yk17ea2i', 'count': len(items), 'items': items}
OUTPUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'count': len(items), 'output': str(OUTPUT)}, indent=2))
