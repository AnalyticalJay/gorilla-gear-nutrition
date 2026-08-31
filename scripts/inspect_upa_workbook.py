from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path

source = Path('/tmp/upa-import/CBQJVzLftGgRILbT(1).csv')
output = Path('/tmp/upa-import/upa-workbook-summary.json')

with source.open('r', encoding='utf-8-sig', newline='') as handle:
    rows = list(csv.DictReader(handle))

clean_rows = []
for row_number, row in enumerate(rows, start=2):
    clean = {key: (value or '').strip() for key, value in row.items()}
    clean['row_number'] = row_number
    clean_rows.append(clean)

summary = {
    'row_count': len(clean_rows),
    'headers': list(rows[0].keys()) if rows else [],
    'brands': dict(Counter(row['brand'] for row in clean_rows)),
    'categories': dict(Counter(row['category'] for row in clean_rows)),
    'missing_price_rows': [row['row_number'] for row in clean_rows if not row['price']],
    'duplicate_row_keys': [],
    'rows': clean_rows,
}

seen = {}
for row in clean_rows:
    key = tuple(row[field].casefold() for field in ('name', 'category', 'dosageInfo', 'description', 'brand', 'price'))
    if key in seen:
        summary['duplicate_row_keys'].append({'first_row': seen[key], 'duplicate_row': row['row_number'], 'key': key})
    else:
        seen[key] = row['row_number']

output.write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps({key: value for key, value in summary.items() if key != 'rows'}, indent=2))
print('names:')
for row in clean_rows:
    print(f"{row['row_number']}|{row['name']}|{row['category']}|{row['dosageInfo']}|{row['description']}|{row['brand']}|{row['price']}")
