from bs4 import BeautifulSoup
from pathlib import Path
import json
from urllib.parse import urljoin

html_path = Path('/home/ubuntu/browser_html/take_app_cm8ppj2d70000l80347gq1adn_1786568532982.html')
output_path = Path('/home/ubuntu/gorilla-gear-nutrition/hdlabs-injectables-source.json')
html = html_path.read_text(encoding='utf-8')
soup = BeautifulSoup(html, 'html.parser')
products = []
seen = set()

for anchor in soup.find_all('a', href=True):
    href = anchor.get('href', '')
    image = anchor.find('img')
    if image is None or '/p/' not in href:
        continue
    name = (image.get('alt') or '').strip()
    if not name:
        name = anchor.find(['h3', 'h4', 'p']).get_text(' ', strip=True) if anchor.find(['h3', 'h4', 'p']) else ''
    image_url = image.get('src') or image.get('data-src') or image.get('data-lazy-src')
    key = name.casefold()
    if not name or not image_url or key in seen:
        continue
    seen.add(key)
    products.append({
        'name': name,
        'imageUrl': image_url,
        'productUrl': urljoin('https://take.app', href),
    })

result = {
    'sourceUrl': 'https://take.app/hdlabsinternational/c/cm8ppj2d70000l80347gq1adn',
    'count': len(products),
    'products': products,
}
output_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result, indent=2))
