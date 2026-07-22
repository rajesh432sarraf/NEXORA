import psycopg2
import os

db_url = os.environ.get("SYNC_DATABASE_URL", "postgresql://postgres:%40nkiT1775@127.0.0.1:5432/procurement")
conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Check id column types for key tables
cur.execute("""
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('rfqs','vendors','documents','projects','users','organizations') 
    AND column_name = 'id' 
    ORDER BY table_name
""")
print("=== ID Column Types ===")
for row in cur.fetchall():
    print(f"  {row[0]}.{row[1]} -> {row[2]}")

# Check all tables
cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' ORDER BY table_name
""")
print("\n=== All Tables ===")
for row in cur.fetchall():
    print(f"  {row[0]}")

# Check if new tables exist
for t in ['purchase_orders', 'procurement_items', 'milestones']:
    cur.execute("""
        SELECT EXISTS(SELECT 1 FROM information_schema.tables 
        WHERE table_schema='public' AND table_name=%s)
    """, (t,))
    exists = cur.fetchone()[0]
    print(f"\n  Table '{t}' exists: {exists}")

conn.close()
