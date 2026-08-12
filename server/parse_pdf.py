import re
import json
from pypdf import PdfReader

reader = PdfReader('/home/ubuntu/upload/GGNPRICELIST2026MAY.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

print("Extracted PDF length:", len(text))
with open('/home/ubuntu/gorilla-gear-nutrition/server/extracted_pdf.txt', 'w') as f:
    f.write(text)

print("Saved extracted text to extracted_pdf.txt")
