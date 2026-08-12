import csv
import json
import re
from collections import Counter
from decimal import Decimal
from pathlib import Path

path = Path('/home/ubuntu/upload/GGN_Regulated_Internal_Inventory_with_Prices.csv')
with path.open('r', encoding='utf-8-sig', newline='') as handle:
    rows = list(csv.DictReader(handle))

brands = Counter(row['brand'].strip() for row in rows)
categories = Counter(row['category'].strip() for row in rows)
status_markers = Counter()
invalid = []
missing = []
prices = []
for index, row in enumerate(rows, start=2):
    name = row['name'].strip()
    price_raw = row['price'].strip()
    if 'Out Of Stock' in name or 'NO STOCK' in name:
        status_markers['out_of_stock'] += 1
    if 'Coming Soon' in name:
        status_markers['coming_soon'] += 1
    required = ['name', 'category', 'dosageInfo', 'description', 'price', 'brand']
    empty = [field for field in required if not row.get(field, '').strip()]
    if empty:
        missing.append({'line': index, 'fields': empty, 'name': name})
    match = re.fullmatch(r'R\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)', price_raw)
    if not match:
        invalid.append({'line': index, 'price': price_raw, 'name': name})
    else:
        prices.append(Decimal(match.group(1).replace(',', '')))

print(json.dumps({
    'row_count': len(rows),
    'unique_names': len({row['name'].strip() for row in rows}),
    'brands': dict(brands),
    'categories': dict(categories),
    'status_markers': dict(status_markers),
    'price_count': len(prices),
    'min_price': str(min(prices)) if prices else None,
    'max_price': str(max(prices)) if prices else None,
    'invalid_price_count': len(invalid),
    'missing_required_count': len(missing),
    'invalid_price_examples': invalid[:5],
    'missing_required_examples': missing[:5],
}, ensure_ascii=False, indent=2))
