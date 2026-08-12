import os
from pathlib import Path

extract_dir = Path('/home/ubuntu/gorilla-gear-nutrition/extracted_cooper_images')
for root, dirs, files in os.walk(extract_dir):
    print(root, "Dirs:", dirs, "Files count:", len(files))
    for f in files:
        print("  -", f)
