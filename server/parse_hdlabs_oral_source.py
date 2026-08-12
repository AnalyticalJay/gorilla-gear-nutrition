from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urljoin

from bs4 import BeautifulSoup

SOURCE = Path('/home/ubuntu/browser_html/take_app_cm8pnqtn50003l80341ogzaw1_1786569724399.html')
OUTPUT = Path('/home/ubuntu/gorilla-gear-nutrition/hdlabs-oral-source.json')
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
    if not alt or not src or not href:
        continue
    if alt.lower() in {'hd labs international', 'orals'}:
        continue
    key = (alt, src, href)
    if key in seen:
        continue
    seen.add(key)
    text = ' '.join(anchor.get_text(' ', strip=True).split())
    prices = re.findall(r'R\s*[0-9][0-9\s.,]*', text)
    items.append({'source_name': alt, 'image_url': src, 'product_url': href, 'card_text': text, 'prices': prices})

result = {'source_url': 'https://take.app/hdlabsinternational/c/cm8pnqtn50003l80341ogzaw1', 'count': len(items), 'items': items}
OUTPUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'count': len(items), 'output': str(OUTPUT)}, indent=2))
