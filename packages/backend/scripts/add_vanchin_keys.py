#!/usr/bin/env python3
"""
สคริปต์สำหรับเพิ่ม VanchinAI API keys ทั้ง 14 คู่เข้า Database
ใช้สำหรับ setup ครั้งแรก

Requirements:
- ต้องรัน database migrations ก่อน
- ต้องมี user account แล้ว
- ต้องตั้งค่า environment variables
"""

import json
import os
import sys
from pathlib import Path

# เพิ่ม path สำหรับ import modules
sys.path.insert(0, str(Path(__file__).parent.parent / "services" / "ai-gateway"))

from app.services.crypto import encrypt_api_key
from app.core.config import get_settings


def load_vanchin_keys():
    """โหลด VanchinAI keys จากไฟล์ vanchin_keys.json"""
    keys_file = Path(__file__).parent.parent / "vanchin_keys.json"
    with open(keys_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def generate_insert_sql(user_id: str, encryption_key: str):
    """สร้าง SQL statements สำหรับ insert API keys"""
    
    config = load_vanchin_keys()
    agents = config['agents']
    
    sql_statements = []
    
    for agent in agents:
        api_key = agent['api_key']
        endpoint_id = agent['endpoint_id']
        agent_name = agent['name']
        
        # เข้ารหัส API key
        encrypted_key = encrypt_api_key(api_key, encryption_key)
        
        # สร้าง masked key (แสดงแค่ 4 ตัวแรกและ 4 ตัวท้าย)
        masked_key = f"{api_key[:4]}...{api_key[-4:]}"
        
        # สร้าง hash (ใช้ SHA256)
        import hashlib
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # สร้าง metadata
        metadata = {
            "endpoint_id": endpoint_id,
            "agent_name": agent_name,
            "base_url": config['base_url']
        }
        
        # สร้าง SQL statement
        sql = f"""
INSERT INTO api_keys (user_id, provider, encrypted_key, key_hash, masked_key, metadata)
VALUES (
    '{user_id}',
    'vanchin',
    '{encrypted_key}',
    '{key_hash}',
    '{masked_key}',
    '{json.dumps(metadata)}'::jsonb
);
"""
        sql_statements.append(sql)
    
    return sql_statements


def main():
    """Main function"""
    print("=" * 70)
    print("🔑 VanchinAI API Keys Insertion Script")
    print("=" * 70)
    
    # ตรวจสอบ environment variables
    settings = get_settings()
    
    if not settings.encryption_key:
        print("\n❌ Error: ENCRYPTION_KEY not set in environment variables")
        print("   Please set ENCRYPTION_KEY in services/ai-gateway/.env")
        print("   Generate with: openssl rand -hex 32")
        return
    
    if not settings.supabase_url:
        print("\n❌ Error: SUPABASE_URL not set in environment variables")
        return
    
    # รับ user_id จาก command line
    if len(sys.argv) < 2:
        print("\n❌ Error: Missing user_id argument")
        print("\nUsage:")
        print("  python3 add_vanchin_keys.py <user_id>")
        print("\nExample:")
        print("  python3 add_vanchin_keys.py 12345678-1234-1234-1234-123456789abc")
        print("\nTo get your user_id:")
        print("  1. Login to your app")
        print("  2. Go to Supabase Dashboard > Authentication > Users")
        print("  3. Copy your user UUID")
        return
    
    user_id = sys.argv[1]
    
    print(f"\n📋 Configuration:")
    print(f"   User ID: {user_id}")
    print(f"   Supabase URL: {settings.supabase_url}")
    print(f"   Encryption Key: {'*' * 20}... (hidden)")
    
    # สร้าง SQL statements
    print("\n🔨 Generating SQL statements...")
    sql_statements = generate_insert_sql(user_id, settings.encryption_key)
    
    # บันทึกลงไฟล์
    output_file = Path(__file__).parent.parent / "vanchin_keys_insert.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- VanchinAI API Keys Insertion\n")
        f.write(f"-- Generated for user_id: {user_id}\n")
        f.write("-- Total keys: 14\n\n")
        f.write("\n".join(sql_statements))
    
    print(f"\n✅ SQL file generated: {output_file}")
    print(f"   Total keys: {len(sql_statements)}")
    
    print("\n📝 Next steps:")
    print("   1. Open Supabase Dashboard > SQL Editor")
    print(f"   2. Copy content from: {output_file}")
    print("   3. Paste and run the SQL")
    print("   4. Verify in Database > api_keys table")
    
    print("\n" + "=" * 70)
    print("✨ Done!")
    print("=" * 70)


if __name__ == "__main__":
    main()
