import csv
import json
import re
from pathlib import Path

source = Path('/home/ubuntu/upload/GGN_Regulated_Internal_Inventory_with_Prices.csv')
out = Path('/home/ubuntu/gorilla-gear-nutrition/latest-csv-issues.json')
issues = []
with source.open('r', encoding='utf-8-sig', newline='') as handle:
    for line_number, row in enumerate(csv.DictReader(handle), start=2):
        price = row.get('price', '').strip()
        name = row.get('name', '').strip()
        description = row.get('description', '').strip()
        price_valid = bool(re.fullmatch(r'R\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)', price))
        if not price_valid or not description:
            issues.append({
                'line': line_number,
                'name': name,
                'category': row.get('category', '').strip(),
                'dosageInfo': row.get('dosageInfo', '').strip(),
                'description': description,
                'price': price,
                'brand': row.get('brand', '').strip(),
                'issue': ', '.join(filter(None, [
                    'invalid_price' if not price_valid else '',
                    'missing_description' if not description else '',
                ])),
            })
out.write_text(json.dumps(issues, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'wrote {len(issues)} issue records to {out}')
