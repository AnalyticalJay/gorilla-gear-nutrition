import re
import mysql.connector
from pypdf import PdfReader

# Connect to database using DATABASE_URL env or direct connection
import os
db_url = os.environ.get("DATABASE_URL", "mysql://root:@localhost:3306/gorilla_gear")

# Parse DATABASE_URL if mysql://user:pass@host:port/dbname
# Or use mysql.connector with uri
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="gorilla_gear"
)
cursor = conn.cursor()

# Clear existing products to ensure a clean reload
print("Clearing existing products...")
cursor.execute("DELETE FROM products")
cursor.execute("DELETE FROM categories")
conn.commit()

reader = PdfReader('/home/ubuntu/upload/GGNPRICELIST2026MAY.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

lines = [line.strip() for line in text.split('\n') if line.strip()]

current_brand = "Ouroboros Labs"
current_category = "Peptides"

# Ensure default categories exist in db
categories_cache = {}

def get_or_create_category(cat_name):
    if cat_name in categories_cache:
        return categories_cache[cat_name]
    slug = cat_name.lower().replace(' & ', '-').replace(' ', '-')
    cursor.execute("SELECT id FROM categories WHERE slug = %s", (slug,))
    row = cursor.fetchone()
    if row:
        cat_id = row[0]
    else:
        cursor.execute("INSERT INTO categories (name, slug, description, isActive) VALUES (%s, %s, %s, 1)", 
                       (cat_name, slug, f"Gorilla Gear Nutrition {cat_name} category"))
        conn.commit()
        cat_id = cursor.lastrowid
    categories_cache[cat_name] = cat_id
    return cat_id

inserted_count = 0

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

    if "PRODUCT" in upper and "PRICE" in upper:
        continue

    m = re.search(r'(R\s*[\d,]+|NA)$', line)
    if m:
        price_str = m.group(1).replace(' ', '')
        price = 0 if price_str == 'NA' else int(price_str.replace('R', '').replace(',', ''))
        
        rest = line[:m.start()].strip()
        rest = re.sub(r'^(OL|Keifei|UPA|Gen|Bio|Mac|SP)\s+', '', rest, flags=re.IGNORECASE)
        
        # Product name is the text before quantity/strength info
        # Let's clean up product name for the Ouroboros Labs peptides shown in the screenshot:
        # Retatrutide 30mg (Not Mixed) | 1 Vial | 30mg | LY-3437943 - Treat 2 diabetes...
        # In PDF text, columns appear as: "Retatrutide 30mg (Not Mixed) 1 Vial 30mg LY-3437943..."
        
        # Let's extract strength (e.g. 30mg, 100mg, 250mg, 10ml, etc.)
        strength_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|ml|iu|mcg|Tabs|Vial|Pen|Caps|g))', rest, re.IGNORECASE)
        strength = strength_match.group(1) if strength_match else "Standard"

        # Let's find product name by taking text before quantity/strength or splitting by common patterns
        name = rest
        if " 1 Vial " in rest:
            name = rest.split(" 1 Vial ")[0]
        elif " 10ml Vial " in rest:
            name = rest.split(" 10ml Vial ")[0]
        elif " 50 Tabs " in rest:
            name = rest.split(" 50 Tabs ")[0]
        elif " 100 Tabs " in rest:
            name = rest.split(" 100 Tabs ")[0]
        elif " 30 Tabs " in rest:
            name = rest.split(" 30 Tabs ")[0]
        elif " 3 vials " in rest:
            name = rest.split(" 3 vials ")[0]
        elif " 10 vials " in rest:
            name = rest.split(" 10 vials ")[0]
        elif strength_match:
            idx = rest.find(strength_match.group(1))
            if idx > 3:
                name = rest[:idx].strip()

        name = name.strip()
        if not name or len(name) < 2:
            name = rest.split()[0]

        # Full product display name: Brand - Name (Strength)
        display_name = f"{current_brand} - {name}"
        if strength not in display_name and strength != "Standard":
            display_name += f" ({strength})"

        slug = display_name.lower().replace(' & ', '-').replace(' ', '-').replace('/', '-') + '-' + str(inserted_count + 1)
        slug = re.sub(r'[^a-z0-9\-]', '', slug)

        cat_id = get_or_create_category(current_category)

        cursor.execute("""
            INSERT INTO products (name, slug, description, dosageInfo, categoryId, price, stockQuantity, isActive, isFeatured, createdAt, updatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 1, %s, NOW(), NOW())
        """, (
            display_name,
            slug,
            rest,
            strength,
            cat_id,
            price,
            100 if price > 0 and "OUT OF STOCK" not in rest.upper() and "NO STOCK" not in rest.upper() else 0,
            1 if inserted_count < 6 else 0
        ))
        inserted_count += 1

conn.commit()
cursor.close()
conn.close()
print(f"Successfully reloaded {inserted_count} products with correct names, descriptions, strengths, and prices into the database!")
