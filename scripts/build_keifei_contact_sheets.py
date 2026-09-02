from __future__ import annotations

import json
import os
import re
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

BASE_URL = "https://3000-inuom0kiunohnvx4cl2i8-ce2d9eea.us1.manus.computer"
CURRENT_JSON = Path("/tmp/keifei-catalogue-audit.json")
REFERENCE_JSON = Path("/tmp/anabolic-hyper-products.json")
OUT_DIR = Path("/tmp/keifei-assets")
OUT_DIR.mkdir(parents=True, exist_ok=True)

try:
    FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    SMALL_FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
except OSError:
    FONT = SMALL_FONT = ImageFont.load_default()


def safe_name(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", value)[:100]


def url_for_current(path: str) -> str:
    if path.startswith("/manus-storage/"):
        return BASE_URL + "/api/media/" + path.removeprefix("/manus-storage/")
    if path.startswith("http"):
        return path
    return BASE_URL + path


def fetch_image(url: str, target: Path) -> Image.Image | None:
    try:
        if not target.exists():
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(request, timeout=20) as response:
                target.write_bytes(response.read())
        with Image.open(target) as image:
            return image.convert("RGB")
    except Exception as exc:
        print(f"WARN {url}: {exc}")
        return None


def wrapped(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, width: int, font: ImageFont.FreeTypeFont) -> int:
    words = text.split()
    lines = []
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] <= width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    for current in lines[:3]:
        draw.text((x, y), current, fill=(245, 245, 245), font=font)
        y += 16
    return y


def make_sheet(items: list[dict], filename: str, title: str) -> None:
    cols = 5
    tile_w, tile_h = 250, 230
    header_h = 42
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tile_w, header_h + rows * tile_h), (20, 20, 20))
    draw = ImageDraw.Draw(sheet)
    draw.text((14, 12), title, fill=(220, 170, 50), font=FONT)
    for index, item in enumerate(items):
        x = (index % cols) * tile_w
        y = header_h + (index // cols) * tile_h
        draw.rectangle((x + 5, y + 5, x + tile_w - 5, y + tile_h - 5), fill=(35, 35, 35), outline=(100, 100, 100))
        image = item.get("image")
        if image is not None:
            fitted = ImageOps.contain(image, (tile_w - 20, 155))
            image_x = x + (tile_w - fitted.width) // 2
            image_y = y + 10 + (155 - fitted.height) // 2
            sheet.paste(fitted, (image_x, image_y))
        else:
            draw.text((x + 20, y + 70), "IMAGE UNAVAILABLE", fill=(220, 100, 80), font=SMALL_FONT)
        label = item.get("label", "")
        wrapped(draw, label, x + 10, y + 172, tile_w - 20, SMALL_FONT)
    output = OUT_DIR / filename
    sheet.save(output, quality=92)
    print(output)


current_data = json.loads(CURRENT_JSON.read_text())
current_items = []
for product in current_data["products"]:
    primary = next((entry for entry in product["images"] if entry["isPrimary"]), product["images"][0] if product["images"] else None)
    image = None
    if primary:
        url = url_for_current(primary["imageUrl"])
        image = fetch_image(url, OUT_DIR / f"current_{product['id']}_{safe_name(primary['imageUrl'].split('/')[-1])}")
    current_items.append({
        "label": f"{product['id']} | {product['name']} | {product['dosageInfo']}",
        "image": image,
    })

reference_data = json.loads(REFERENCE_JSON.read_text())
reference_items = []
for product in reference_data.get("products", []):
    if "keifei" not in product.get("title", "").lower():
        continue
    image_url = (product.get("images") or [{}])[0].get("src", "")
    image = fetch_image(image_url, OUT_DIR / f"reference_{safe_name(product.get('handle', product.get('title', 'product')))}.jpg") if image_url else None
    reference_items.append({
        "label": f"{product.get('title', '')} | R {product.get('variants', [{}])[0].get('price', '')}",
        "image": image,
    })

make_sheet(current_items, "current-keifei-contact-sheet.jpg", f"Current Keifei catalogue — {len(current_items)} products")
make_sheet(reference_items, "reference-keifei-contact-sheet.jpg", f"Anabolic Hyper Keifei reference — {len(reference_items)} products")
