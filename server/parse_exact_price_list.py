import re
import json
from pypdf import PdfReader

reader = PdfReader('/home/ubuntu/upload/GGNPRICELIST2026MAY.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

lines = [line.strip() for line in text.split('\n') if line.strip()]

current_brand = "Ouroboros Labs"
current_category = "Peptides"

parsed_items = []

for line in lines:
    upper = line.upper()
    if "OUROBOROS LABS" in upper:
        current_brand = "Ouroboros Labs"
        continue
    elif "KEIFEI" in upper:
        current_brand = "Keifei Pharmaceuticals"
        continue
    elif "UPA LABS" in upper:
        current_brand = "UPA Labs"
        continue
    elif "GENESIS" in upper or "BIOLAB" in upper:
        current_brand = None
        continue
    elif "MACTROPIN" in upper:
        current_brand = "Mactropin"
        continue
    elif "SP LABORATORIES" in upper:
        current_brand = "SP Laboratories"
        continue

    if upper in ["PEPTIDES", "INJECTABLE OILS", "ORALS", "SARMS", "HYBRID INJECTABLES", "GROWTH HORMONE"]:
        current_category = line.title()
        continue

    if "PRODUCT" in upper and "PRICE" in upper:
        continue

    m = re.search(r'(R\s*[\d,]+|NA)$', line)
    if m:
        if current_brand is None:
            continue
        price_str = m.group(1).replace(' ', '')
        price = 0 if price_str == 'NA' else int(price_str.replace('R', '').replace(',', ''))
        
        rest = line[:m.start()].strip()
        rest = re.sub(r'^(OL|Keifei|UPA|Mac|SP)\s+', '', rest, flags=re.IGNORECASE)
        
        # In PDF text extraction, product name comes first, followed by quantity (e.g. "1 Vial", "10ml Vial", "50 Tabs") and strength (e.g. "30mg", "100mg")
        # Let's find where quantity tokens appear
        qty_pattern = r'(?i)(\b1\s+Vial|\b3\s+vials|\b10ml\s+Vial|\b20ml\s+Vial|\b30ml|\b1\s+Pen|\b50\s+Tabs|\b100\s+Tabs|\b30\s+Tabs|\b28\s+Tabs|\b1.3\s+ml|\b1.1\s+ml|\b10\s+vials|\b3\s+Vials|\b10ml|\b20ml|\b50\s+Tabs|\b50\s+caps|\b90\s+Caps|\b60\s+Caps|\b10\s+Tabs|\b100\s+caps)'
        
        parts = re.split(qty_pattern, rest, maxsplit=1)
        name = parts[0].strip()
        if not name or len(name) < 2:
            name = rest.split()[0]
            
        quantity = parts[1] if len(parts) > 1 else "1 Unit"
        remainder = parts[2] if len(parts) > 2 else rest

        strength_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|ml|iu|mcg|Tabs|Vial|Pen|Caps|g|ml/1ml))', remainder, re.IGNORECASE)
        strength = strength_match.group(1) if strength_match else "Standard"

        parsed_items.append({
            "brand": current_brand,
            "category": current_category,
            "name": name,
            "quantity": quantity,
            "strength": strength,
            "description": rest,
            "price": price
        })

print(f"Extracted {len(parsed_items)} structured items.")
with open('/home/ubuntu/gorilla-gear-nutrition/server/exact_parsed_products.json', 'w') as f:
    json.dump(parsed_items[:15], f, indent=2)
print("Sample parsed items saved.")
