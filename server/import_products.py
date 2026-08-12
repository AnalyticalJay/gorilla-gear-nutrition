import re
import json

with open('/home/ubuntu/gorilla-gear-nutrition/server/extracted_pdf.txt', 'r') as f:
    text = f.read()

lines = [line.strip() for line in text.split('\n') if line.strip()]

current_brand = "Ouroboros Labs"
current_category = "Peptides"

clean_products = []

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
    elif "GENESIS" in upper:
        current_brand = "Genesis"
        continue
    elif "BIOLAB" in upper:
        current_brand = "Biolab"
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

    # Skip table header lines
    if "PRODUCT" in upper and "PRICE" in upper:
        continue

    # Match price at end
    m = re.search(r'(R\s*[\d,]+|NA)$', line)
    if m:
        price_str = m.group(1).replace(' ', '')
        price = 0 if price_str == 'NA' else int(price_str.replace('R', '').replace(',', ''))
        
        rest = line[:m.start()].strip()
        rest = re.sub(r'^(OL|Keifei|UPA|Gen|Bio|Mac|SP)\s+', '', rest, flags=re.IGNORECASE)
        
        # In PDF text, columns are often squished together like:
        # "Retatrutide 30mg (Not Mixed) 1 Vial 30mg LY-3437943 - Treat 2 diabetes..."
        # Let's extract strength (e.g. 30mg, 100mg, 250mg, 10ml, etc.)
        strength_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|ml|iu|mcg|Tabs|Vial|Pen|Caps|g))', rest, re.IGNORECASE)
        strength = strength_match.group(1) if strength_match else "Standard"
        
        # Product name is usually the first part before quantity/strength
        parts = rest.split('  ')
        name = parts[0].strip()
        description = rest

        clean_products.append({
            "brand": current_brand,
            "category": current_category,
            "name": name,
            "description": description,
            "strength": strength,
            "price": price
        })

print(f"Successfully cleaned {len(clean_products)} products.")
with open('/home/ubuntu/gorilla-gear-nutrition/server/clean_products.json', 'w') as f:
    json.dump(clean_products[:25], f, indent=2)
print("Saved clean sample.")
