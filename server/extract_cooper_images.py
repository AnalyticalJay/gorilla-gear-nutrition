import zipfile
import os
from pathlib import Path

upload_dir = Path('/home/ubuntu/upload')
extract_dir = Path('/home/ubuntu/gorilla-gear-nutrition/extracted_cooper_images')
extract_dir.mkdir(exist_ok=True)

zip_files = [
    'SexAid-20260812T135815Z-1-001.zip',
    'SARMS-20260812T135805Z-1-001.zip',
    'Peptides-20260812T135756Z-1-001.zip',
    'OralAnabolics-20260812T135753Z-1-001.zip',
    'InjectableOils-20260812T135744Z-1-001.zip'
]

extracted_files = []
for zname in zip_files:
    zpath = upload_dir / zname
    if zpath.exists():
        print(f"Extracting {zname}...")
        with zipfile.ZipFile(zpath, 'r') as zref:
            zref.extractall(extract_dir)

for root, dirs, files in os.walk(extract_dir):
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            extracted_files.append(str(Path(root) / f))

print(f"Total extracted image files: {len(extracted_files)}")
print("Sample images:", extracted_files[:10])
