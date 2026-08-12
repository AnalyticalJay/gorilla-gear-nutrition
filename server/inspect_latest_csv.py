import csv
import json
from collections import Counter
from pathlib import Path

path = Path('/home/ubuntu/upload/GGN_Regulated_Internal_Inventory_with_Prices.csv')
raw = path.read_text(encoding='utf-8-sig')
lines = raw.splitlines()
reader = csv.reader(lines)
rows = list(reader)
print(json.dumps({
    'line_count': len(lines),
    'row_count_including_header': len(rows),
    'header': rows[0] if rows else [],
    'field_count_distribution': dict(Counter(len(r) for r in rows[1:])),
    'first_rows': rows[1:6],
    'last_rows': rows[-5:],
}, ensure_ascii=False, indent=2))
