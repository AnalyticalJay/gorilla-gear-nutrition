import mysql.connector
import os
from urllib.parse import urlparse

url = urlparse(os.environ['DATABASE_URL'])
conn = mysql.connector.connect(
    host=url.hostname,
    port=url.port or 3306,
    user=url.username,
    password=url.password,
    database=url.path.lstrip('/')
)
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT id, name, slug, price FROM products WHERE name LIKE '%Cooper%' OR name LIKE '%Cialis%' OR name LIKE '%Winstrol%' OR name LIKE '%Test%' LIMIT 30")
rows = cursor.fetchall()
for r in rows:
    print(r)
cursor.close()
conn.close()
