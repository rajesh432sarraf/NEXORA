import os
import glob
import psycopg2

def run_migrations():
    # Connect using psycopg2
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        user="postgres",
        password="@nkiT1775",
        dbname="procurement"
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    migration_files = sorted(glob.glob("../db/migrations/*.sql"))
    for fpath in migration_files:
        print(f"Executing {fpath}...")
        with open(fpath, "r", encoding="utf-8") as f:
            sql = f.read()
        cur.execute(sql)
    
    print("All migrations executed successfully.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    run_migrations()
