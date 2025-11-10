#!/usr/bin/env python3
"""
สคริปต์ทดสอบการเชื่อมต่อกับ VanchinAI API
ใช้สำหรับทดสอบว่า API keys ทำงานได้หรือไม่
"""

import json
from openai import OpenAI

# อ่าน API keys จากไฟล์
with open('vanchin_keys.json', 'r', encoding='utf-8') as f:
    config = json.load(f)

base_url = config['base_url']
agents = config['agents']

print("=" * 60)
print("🧪 ทดสอบการเชื่อมต่อกับ VanchinAI API")
print("=" * 60)

# ทดสอบ Agent แรก
agent = agents[0]
print(f"\n📌 กำลังทดสอบ {agent['name']}...")
print(f"   Endpoint ID: {agent['endpoint_id']}")
print(f"   API Key: {agent['api_key'][:20]}...")

try:
    client = OpenAI(
        base_url=base_url,
        api_key=agent['api_key']
    )
    
    completion = client.chat.completions.create(
        model=agent['endpoint_id'],
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": "สวัสดีครับ แนะนำตัวเองหน่อย"},
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    response_text = completion.choices[0].message.content
    
    print("\n✅ การเชื่อมต่อสำเร็จ!")
    print(f"\n💬 คำตอบจาก AI:\n{response_text}")
    print(f"\n📊 ข้อมูลเพิ่มเติม:")
    print(f"   - Model: {completion.model}")
    print(f"   - Tokens used: {completion.usage.total_tokens if completion.usage else 'N/A'}")
    print(f"   - Finish reason: {completion.choices[0].finish_reason}")
    
except Exception as e:
    print(f"\n❌ เกิดข้อผิดพลาด: {str(e)}")
    print(f"   ประเภทข้อผิดพลาด: {type(e).__name__}")

print("\n" + "=" * 60)
print("✨ การทดสอบเสร็จสิ้น")
print("=" * 60)

# แสดงข้อมูล agents ทั้งหมด
print(f"\n📋 มี Agent ทั้งหมด {len(agents)} ตัว:")
for i, agent in enumerate(agents, 1):
    print(f"   {i}. {agent['name']} - {agent['endpoint_id']}")
