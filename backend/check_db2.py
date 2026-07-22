import psycopg2
import os

db_url = os.environ.get("SYNC_DATABASE_URL", "postgresql://postgres:%40nkiT1775@127.0.0.1:5432/procurement")
conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Check all FK column types in existing tables that reference uuid-typed PKs
cur.execute("""
    SELECT c.table_name, c.column_name, c.data_type
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.column_name LIKE '%_id'
    ORDER BY c.table_name, c.column_name
""")
print("=== All *_id columns and their types ===")
for row in cur.fetchall():
    print(f"  {row[0]}.{row[1]} -> {row[2]}")

conn.close()
